import { AgentInsightOtelSpanAttributes } from "@agentinsight-sdk/core";
import { type Attributes } from "@opentelemetry/api";

import {
  AgentInsightObservationAttributes,
  AgentInsightObservationType,
  AgentInsightTraceAttributes,
} from "./types.js";

/**
 * Creates OpenTelemetry attributes from AgentInsight trace IO attributes.
 *
 * Converts trace input/output into the internal OpenTelemetry
 * attribute format required by the span processor.
 *
 * @param attributes - AgentInsight trace IO attributes to convert
 * @returns OpenTelemetry attributes object with non-null values
 *
 * @deprecated This is for backward compatibility with legacy platform features
 * that still rely on trace-level input/output. Use propagateAttributes for other trace attributes.
 *
 * @internal
 */
export function createTraceAttributes({
  input,
  output,
}: AgentInsightTraceAttributes = {}): Attributes {
  const attributes = {
    [AgentInsightOtelSpanAttributes.TRACE_INPUT]: _serialize(input),
    [AgentInsightOtelSpanAttributes.TRACE_OUTPUT]: _serialize(output),
  };

  return Object.fromEntries(
    Object.entries(attributes).filter(([_, v]) => v != null),
  );
}

export function createObservationAttributes(
  type: AgentInsightObservationType,
  attributes: AgentInsightObservationAttributes,
): Attributes {
  const {
    metadata,
    input,
    output,
    level,
    statusMessage,
    version,
    completionStartTime,
    model,
    modelParameters,
    usageDetails,
    costDetails,
    prompt,
  } = attributes;

  let otelAttributes: Attributes = {
    [AgentInsightOtelSpanAttributes.OBSERVATION_TYPE]: type,
    [AgentInsightOtelSpanAttributes.OBSERVATION_LEVEL]: level,
    [AgentInsightOtelSpanAttributes.OBSERVATION_STATUS_MESSAGE]: statusMessage,
    [AgentInsightOtelSpanAttributes.VERSION]: version,
    [AgentInsightOtelSpanAttributes.OBSERVATION_INPUT]: _serialize(input),
    [AgentInsightOtelSpanAttributes.OBSERVATION_OUTPUT]: _serialize(output),
    [AgentInsightOtelSpanAttributes.OBSERVATION_MODEL]: model,
    [AgentInsightOtelSpanAttributes.OBSERVATION_USAGE_DETAILS]:
      _serialize(usageDetails),
    [AgentInsightOtelSpanAttributes.OBSERVATION_COST_DETAILS]:
      _serialize(costDetails),
    [AgentInsightOtelSpanAttributes.OBSERVATION_COMPLETION_START_TIME]:
      _serialize(completionStartTime),
    [AgentInsightOtelSpanAttributes.OBSERVATION_MODEL_PARAMETERS]:
      _serialize(modelParameters),
    ...(prompt && !prompt.isFallback
      ? {
          [AgentInsightOtelSpanAttributes.OBSERVATION_PROMPT_NAME]: prompt.name,
          [AgentInsightOtelSpanAttributes.OBSERVATION_PROMPT_VERSION]:
            prompt.version,
        }
      : {}),
    ..._flattenAndSerializeMetadata(metadata, "observation"),
  };

  return Object.fromEntries(
    Object.entries(otelAttributes).filter(([_, v]) => v != null),
  );
}

/**
 * Safely serializes an object to JSON string.
 *
 * @param obj - Object to serialize
 * @returns JSON string or undefined if null/undefined, error message if serialization fails
 * @internal
 */
function _serialize(obj: unknown): string | undefined {
  try {
    if (typeof obj === "string") return obj;

    return obj != null ? JSON.stringify(obj) : undefined;
  } catch {
    return "<failed to serialize>";
  }
}

/**
 * Flattens and serializes metadata into OpenTelemetry attribute format.
 *
 * Converts nested metadata objects into dot-notation attribute keys.
 * For example, `{ database: { host: 'localhost' } }` becomes
 * `{ 'langfuse.metadata.database.host': 'localhost' }`.
 *
 * @param metadata - Metadata object to flatten
 * @param type - Whether this is for observation or trace metadata
 * @returns Flattened metadata attributes
 * @internal
 */
function _flattenAndSerializeMetadata(
  metadata: unknown,
  type: "observation" | "trace",
): Record<string, string> {
  const prefix =
    type === "observation"
      ? AgentInsightOtelSpanAttributes.OBSERVATION_METADATA
      : AgentInsightOtelSpanAttributes.TRACE_METADATA;

  const metadataAttributes: Record<string, string> = {};

  if (metadata === undefined || metadata === null) {
    return metadataAttributes;
  }

  if (typeof metadata !== "object" || Array.isArray(metadata)) {
    const serialized = _serialize(metadata);
    if (serialized) {
      metadataAttributes[prefix] = serialized;
    }
  } else {
    for (const [key, value] of Object.entries(metadata)) {
      const serialized = typeof value === "string" ? value : _serialize(value);
      if (serialized) {
        metadataAttributes[`${prefix}.${key}`] = serialized;
      }
    }
  }

  return metadataAttributes;
}
