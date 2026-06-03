# @agentinsight-sdk/client

[![NPM](https://img.shields.io/npm/v/@agentinsight-sdk/client.svg)](https://www.npmjs.com/package/@agentinsight-sdk/client)

AgentInsight 通用客户端 / AgentInsight Universal Client

提供 Prompt 管理、数据集、评分等功能的客户端抽象层。

Client abstraction for prompts, datasets, scores, and more.

## 安装 / Installation

```bash
npm install @agentinsight-sdk/client
```

## 快速开始 / Quick Start

```typescript
import { AgentInsightClient } from "@agentinsight-sdk/client";

const client = new AgentInsightClient({
  publicKey: "pk-ai-...",
  secretKey: "sk-ai-...",
  baseUrl: "https://agent.goldebridge.com",
});
```

## 文档 / Documentation

- [AgentInsight 平台 / Platform](https://agentinsight.goldebridge.com/platform)
- [API 参考 / API Reference](https://agentinsight.goldebridge.com/docs)

## 许可证 / License

[MIT](../../LICENSE)
