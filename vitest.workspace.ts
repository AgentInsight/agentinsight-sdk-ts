import { defineWorkspace } from "vitest/config";

const distAliases = {
  "@agentinsight-sdk/client": new URL(
    "./packages/client/dist/index.mjs",
    import.meta.url,
  ).pathname,
  "@agentinsight-sdk/tracing": new URL(
    "./packages/tracing/dist/index.mjs",
    import.meta.url,
  ).pathname,
  "@agentinsight-sdk/otel": new URL(
    "./packages/otel/dist/index.mjs",
    import.meta.url,
  ).pathname,
  "@agentinsight-sdk/langchain": new URL(
    "./packages/langchain/dist/index.mjs",
    import.meta.url,
  ).pathname,
  "@agentinsight-sdk/openai": new URL(
    "./packages/openai/dist/index.mjs",
    import.meta.url,
  ).pathname,
  "@agentinsight-sdk/core": new URL(
    "./packages/core/dist/index.mjs",
    import.meta.url,
  ).pathname,
};

export default defineWorkspace([
  {
    test: {
      name: "integration",
      environment: "node",
      include: ["tests/integration/**/*.test.ts"],
      setupFiles: ["./vitest.setup.ts"],
    },
    resolve: {
      alias: distAliases,
    },
  },
  {
    test: {
      name: "e2e",
      environment: "node",
      include: ["tests/e2e/**/*.e2e.test.ts"],
      setupFiles: ["./vitest.setup.ts"],
      testTimeout: 120_000,
      hookTimeout: 60_000,
    },
    resolve: {
      alias: distAliases,
    },
  },
]);
