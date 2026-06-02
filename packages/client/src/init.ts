import {
  AgentInsightClient,
  type AgentInsightClientParams,
} from "./AgentInsightClient.js";

let _defaultClient: AgentInsightClient | null = null;

export function init(params: AgentInsightClientParams): AgentInsightClient {
  _defaultClient = new AgentInsightClient(params);
  return _defaultClient;
}

export function getClient(): AgentInsightClient | null {
  return _defaultClient;
}
