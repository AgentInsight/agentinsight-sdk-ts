# @agentinsight-sdk/langchain

[![NPM](https://img.shields.io/npm/v/@agentinsight-sdk/langchain.svg)](https://www.npmjs.com/package/@agentinsight-sdk/langchain)

AgentInsight LangChain 集成 / AgentInsight LangChain Integration

提供 `CallbackHandler`，可注册到 LangChain 调用链中自动追踪。

Provides `CallbackHandler` to register with LangChain invocations for automatic tracing.

## 安装 / Installation

```bash
npm install @agentinsight-sdk/langchain
```

## 快速开始 / Quick Start

```typescript
import { AgentInsightSpanProcessor } from "@agentinsight-sdk/otel";
import { NodeSDK } from "@opentelemetry/sdk-node";
import { CallbackHandler } from "@agentinsight-sdk/langchain";
import { ChatOpenAI } from "@langchain/openai";

// 1. 初始化 AgentInsight OTEL 导出 / Initialize AgentInsight OTEL export
const sdk = new NodeSDK({
  spanProcessors: [
    new AgentInsightSpanProcessor({
      publicKey: "pk-ai-...",
      secretKey: "sk-ai-...",
      baseUrl: "https://agent.goldebridge.com",
    }),
  ],
});
sdk.start();

// 2. 创建 CallbackHandler（业务参数）/ Create CallbackHandler (business params)
const handler = new CallbackHandler({
  sessionId: "session-123",
  tags: ["production"],
});

const model = new ChatOpenAI({
  callbacks: [handler],
});
```

## 文档 / Documentation

- [AgentInsight 平台 / Platform](https://agentinsight.goldebridge.com/platform)
- [API 参考 / API Reference](https://agentinsight.goldebridge.com/docs)

## 许可证 / License

[MIT](../../LICENSE)
