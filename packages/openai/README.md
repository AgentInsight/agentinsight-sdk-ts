# @agentinsight-sdk/openai

[![NPM](https://img.shields.io/npm/v/@agentinsight-sdk/openai.svg)](https://www.npmjs.com/package/@agentinsight-sdk/openai)

AgentInsight OpenAI SDK 集成 / AgentInsight OpenAI SDK Integration

提供 `observeOpenAI` 包装器，自动追踪 OpenAI API 调用。

Provides `observeOpenAI` wrapper to automatically trace OpenAI API calls.

## 安装 / Installation

```bash
npm install @agentinsight-sdk/openai
```

## 快速开始 / Quick Start

```typescript
import { observeOpenAI } from "@agentinsight-sdk/openai";
import { AgentInsightSpanProcessor } from "@agentinsight-sdk/otel";
import { NodeSDK } from "@opentelemetry/sdk-node";
import OpenAI from "openai";

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

// 2. 用 observeOpenAI 包装 OpenAI 客户端 / Wrap OpenAI client with observeOpenAI
const client = observeOpenAI(
  new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  }),
);

const result = await client.chat.completions.create({
  model: "gpt-4",
  messages: [{ role: "user", content: "Hello!" }],
});
```

## 文档 / Documentation

- [AgentInsight 平台 / Platform](https://agentinsight.goldebridge.com/platform)
- [API 参考 / API Reference](https://agentinsight.goldebridge.com/docs)

## 许可证 / License

[MIT](../../LICENSE)
