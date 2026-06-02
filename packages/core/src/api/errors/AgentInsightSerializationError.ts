import { AgentInsightError } from "./AgentInsightError.js";

export class AgentInsightSerializationError extends AgentInsightError {
  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, AgentInsightSerializationError.prototype);
    this.name = "AgentInsightSerializationError";
  }
}
