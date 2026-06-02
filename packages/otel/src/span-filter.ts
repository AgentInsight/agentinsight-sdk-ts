import { AGENTINSIGHT_TRACER_NAME } from "@agentinsight-sdk/core";
import type { ReadableSpan } from "@opentelemetry/sdk-trace-base";

export const KNOWN_LLM_INSTRUMENTATION_SCOPE_PREFIXES = [
  AGENTINSIGHT_TRACER_NAME,
  "agent_framework",
  "ai",
  "haystack",
  "langsmith",
  "litellm",
  "openinference",
  "opentelemetry.instrumentation.anthropic",
  "strands-agents",
  "vllm",
] as const;

export function isAgentInsightSpan(span: ReadableSpan): boolean {
  return span.instrumentationScope.name === AGENTINSIGHT_TRACER_NAME;
}

export function isGenAISpan(span: ReadableSpan): boolean {
  return Object.keys(span.attributes).some((attributeKey) =>
    attributeKey.startsWith("gen_ai."),
  );
}

export function isKnownLLMInstrumentor(span: ReadableSpan): boolean {
  const scope = span.instrumentationScope.name;

  return KNOWN_LLM_INSTRUMENTATION_SCOPE_PREFIXES.some(
    (prefix) => scope === prefix || scope.startsWith(`${prefix}.`),
  );
}

export function isDefaultExportSpan(span: ReadableSpan): boolean {
  return (
    isAgentInsightSpan(span) ||
    isGenAISpan(span) ||
    isKnownLLMInstrumentor(span)
  );
}

/** @deprecated Use isAgentInsightSpan instead */
export function isLangfuseSpan(span: ReadableSpan): boolean {
  return isAgentInsightSpan(span);
}
