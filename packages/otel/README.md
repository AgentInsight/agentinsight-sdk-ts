# @agentinsight-sdk/otel

[![NPM](https://img.shields.io/npm/v/@agentinsight-sdk/otel.svg)](https://www.npmjs.com/package/@agentinsight-sdk/otel)

AgentInsight OpenTelemetry 导出助手 / AgentInsight OpenTelemetry Export Helpers

提供 `AgentInsightSpanProcessor`，支持将追踪数据导出到 AgentInsight 平台，包含数据掩码、过滤和媒体处理功能。

Provides `AgentInsightSpanProcessor` to export traces to the AgentInsight platform, with masking, filtering, and media handling.

> ⚠️ 仅支持 Node.js 20+ / Node.js 20+ only

## 安装 / Installation

```bash
npm install @agentinsight-sdk/otel
```

## 快速开始 / Quick Start

```typescript
import { AgentInsightSpanProcessor } from "@agentinsight-sdk/otel";
import { NodeSDK } from "@opentelemetry/sdk-node";

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
```

## 文档 / Documentation

- [AgentInsight 平台 / Platform](https://agentinsight.goldebridge.com/platform)
- [API 参考 / API Reference](https://agentinsight.goldebridge.com/docs)

## 许可证 / License

[MIT](../../LICENSE)
