import { AgentInsightError } from "./AgentInsightError.js";

export class AgentInsightAuthenticationError extends AgentInsightError {
  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, AgentInsightAuthenticationError.prototype);
    this.name = "AgentInsightAuthenticationError";
  }
}
