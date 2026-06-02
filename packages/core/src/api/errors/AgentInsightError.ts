export class AgentInsightError extends Error {
  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, AgentInsightError.prototype);
    this.name = "AgentInsightError";
  }
}
