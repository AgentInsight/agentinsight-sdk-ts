import { AgentInsightSpanProcessor } from "@agentinsight-sdk/otel";
import { AGENTINSIGHT_TRACER_NAME } from "@agentinsight-sdk/core";
import {
  setAgentInsightTracerProvider,
  getAgentInsightTracerProvider,
  getAgentInsightTracer,
} from "@agentinsight-sdk/tracing";
import { trace, context, SpanKind } from "@opentelemetry/api";
import { NodeTracerProvider } from "@opentelemetry/sdk-trace-node";
import { describe, it, expect, beforeEach, afterEach } from "vitest";

import { MockSpanExporter } from "./helpers/MockSpanExporter.js";
import {
  setupTestEnvironment,
  teardownTestEnvironment,
  waitForSpanExport,
  type TestEnvironment,
} from "./helpers/testSetup.js";

describe("Tracer Provider Isolation Integration Tests", () => {
  let testEnv: TestEnvironment;
  let globalMockExporter: MockSpanExporter;
  let isolatedMockExporter: MockSpanExporter;
  let isolatedProvider: NodeTracerProvider;

  beforeEach(async () => {
    // Setup global test environment
    testEnv = await setupTestEnvironment();
    globalMockExporter = testEnv.mockExporter;

    // Setup isolated tracer provider
    isolatedMockExporter = new MockSpanExporter();
    const isolatedSpanProcessor = new AgentInsightSpanProcessor({
      exporter: isolatedMockExporter,
      flushAt: 1,
      flushInterval: 0,
      timeout: 1000,
    });

    isolatedProvider = new NodeTracerProvider({
      spanProcessors: [isolatedSpanProcessor],
    });

    // Set the isolated provider
    setAgentInsightTracerProvider(isolatedProvider);
  });

  afterEach(async () => {
    // Cleanup isolated provider
    setAgentInsightTracerProvider(null);
    await isolatedProvider.shutdown();
    await isolatedMockExporter.shutdown();

    // Cleanup test environment
    await teardownTestEnvironment(testEnv);
  });

  describe("Basic isolation functionality", () => {
    it("should use isolated provider when set", async () => {
      const provider = getAgentInsightTracerProvider();
      expect(provider).toBe(isolatedProvider);
    });

    it("should fall back to global provider when isolated is null", async () => {
      setAgentInsightTracerProvider(null);
      const provider = getAgentInsightTracerProvider();
      expect(provider).toBe(trace.getTracerProvider());
    });

    it("should create spans using isolated provider", async () => {
      const tracer = getAgentInsightTracer();
      const span = tracer.startSpan("isolated-span");
      span.end();

      await waitForSpanExport(isolatedMockExporter, 1);

      expect(isolatedMockExporter.getSpanCount()).toBe(1);
      expect(globalMockExporter.getSpanCount()).toBe(0);
      expect(isolatedMockExporter.getSpanByName("isolated-span")).toBeDefined();
    });
  });

  describe("Multiple isolated providers", () => {
    it("should handle multiple isolated providers independently", async () => {
      const firstMockExporter = new MockSpanExporter();
      const secondMockExporter = new MockSpanExporter();

      const firstProvider = new NodeTracerProvider({
        spanProcessors: [
          new AgentInsightSpanProcessor({
            exporter: firstMockExporter,
            flushAt: 1,
            flushInterval: 0,
          }),
        ],
      });
      const secondProvider = new NodeTracerProvider({
        spanProcessors: [
          new AgentInsightSpanProcessor({
            exporter: secondMockExporter,
            flushAt: 1,
            flushInterval: 0,
          }),
        ],
      });

      // Test first provider
      setAgentInsightTracerProvider(firstProvider);
      let tracer = getAgentInsightTracer();
      let span = tracer.startSpan("first-provider-span");
      span.end();

      // Test second provider
      setAgentInsightTracerProvider(secondProvider);
      tracer = getAgentInsightTracer();
      span = tracer.startSpan("second-provider-span");
      span.end();

      await waitForSpanExport(firstMockExporter, 1);
      await waitForSpanExport(secondMockExporter, 1);

      expect(
        firstMockExporter.getSpanByName("first-provider-span"),
      ).toBeDefined();
      expect(
        secondMockExporter.getSpanByName("second-provider-span"),
      ).toBeDefined();
      expect(
        firstMockExporter.getSpanByName("second-provider-span"),
      ).toBeUndefined();
      expect(
        secondMockExporter.getSpanByName("first-provider-span"),
      ).toBeUndefined();

      // Cleanup
      await firstProvider.shutdown();
      await secondProvider.shutdown();
      await firstMockExporter.shutdown();
      await secondMockExporter.shutdown();
    });
  });

  describe("Error scenarios", () => {
    it("should handle errors when isolated provider fails", async () => {
      // Configure isolated exporter to fail
      isolatedMockExporter.shouldFail = true;

      const tracer = getAgentInsightTracer();
      const span = tracer.startSpan("failing-span");
      span.end();

      // Wait briefly for the export attempt
      await new Promise((resolve) => setTimeout(resolve, 100));

      const stats = isolatedMockExporter.getExportStats();
      expect(stats.failedExports).toBeGreaterThan(0);
      expect(stats.totalSpansExported).toBe(0);
    });

    it("should maintain global context even when isolated provider has issues", async () => {
      const globalTracer = trace.getTracer(AGENTINSIGHT_TRACER_NAME);

      // Create global span
      const globalSpan = globalTracer.startSpan("global-span");
      const globalContext = trace.setSpan(context.active(), globalSpan);

      // Configure isolated provider to have delays
      isolatedMockExporter.exportDelay = 200;

      await context.with(globalContext, async () => {
        const isolatedTracer = getAgentInsightTracer();
        const isolatedSpan = isolatedTracer.startSpan("delayed-isolated-span");

        // Verify we still have access to the global span context
        const activeSpan = trace.getActiveSpan();
        expect(activeSpan?.spanContext().spanId).toBe(
          globalSpan.spanContext().spanId,
        );

        isolatedSpan.end();
      });

      globalSpan.end();

      await waitForSpanExport(globalMockExporter, 1);
      // The isolated span should eventually be exported despite the delay
      await waitForSpanExport(isolatedMockExporter, 1, 1000);

      expect(globalMockExporter.getSpanByName("global-span")).toBeDefined();
      expect(
        isolatedMockExporter.getSpanByName("delayed-isolated-span"),
      ).toBeDefined();
    });
  });
});
