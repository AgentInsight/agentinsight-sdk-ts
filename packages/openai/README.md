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
import OpenAI from "openai";

const client = new OpenAI();

const result = await observeOpenAI(client, "my-chat", () =>
  client.chat.completions.create({
    model: "gpt-4",
    messages: [{ role: "user", content: "Hello!" }],
  }),
);
```

## 文档 / Documentation

- [AgentInsight 平台 / Platform](https://agentinsight.goldebridge.com/platform)
- [API 参考 / API Reference](https://agentinsight.goldebridge.com/docs)

## 许可证 / License

[MIT](../../LICENSE)
