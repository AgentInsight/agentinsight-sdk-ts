import { AgentInsightError } from "./AgentInsightError.js";

export class AgentInsightTimeoutError extends AgentInsightError {
  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, AgentInsightTimeoutError.prototype);
    this.name = "AgentInsightTimeoutError";
  }
}
