import { AgentInsightError } from "./AgentInsightError.js";

export class AgentInsightConnectionError extends AgentInsightError {
  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, AgentInsightConnectionError.prototype);
    this.name = "AgentInsightConnectionError";
  }
}
