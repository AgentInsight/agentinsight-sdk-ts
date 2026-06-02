import { AgentInsightError } from "./AgentInsightError.js";

export class AgentInsightConfigurationError extends AgentInsightError {
  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, AgentInsightConfigurationError.prototype);
    this.name = "AgentInsightConfigurationError";
  }
}
