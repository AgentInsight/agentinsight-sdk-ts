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
import { CallbackHandler } from "@agentinsight-sdk/langchain";
import { ChatOpenAI } from "@langchain/openai";

const handler = new CallbackHandler({
  publicKey: "pk-ai-...",
  secretKey: "sk-ai-...",
  baseUrl: "https://agent.goldebridge.com",
});

const model = new ChatOpenAI({
  callbacks: [handler],
});
```

## 文档 / Documentation

- [AgentInsight 平台 / Platform](https://agent.goldebridge.com/platform)
- [API 参考 / API Reference](https://agent.goldebridge.com/docs)

## 许可证 / License

[MIT](../../LICENSE)
