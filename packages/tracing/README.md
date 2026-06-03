# @agentinsight-sdk/tracing

[![NPM](https://img.shields.io/npm/v/@agentinsight-sdk/tracing.svg)](https://www.npmjs.com/package/@agentinsight-sdk/tracing)

AgentInsight 追踪原语 / AgentInsight Tracing Primitives

基于 OpenTelemetry 的追踪方法，包括 `startActiveSpan`、`startActiveGeneration` 和 `observe` 包装器。

OpenTelemetry-based instrumentation methods including `startActiveSpan`, `startActiveGeneration`, and the `observe` wrapper.

## 安装 / Installation

```bash
npm install @agentinsight-sdk/tracing
```

## 快速开始 / Quick Start

```typescript
import { observe } from "@agentinsight-sdk/tracing";

const myOperation = observe(async () => "Hello, AgentInsight!", {
  name: "my-operation",
});

const result = await myOperation();
```

## 文档 / Documentation

- [AgentInsight 平台 / Platform](https://agentinsight.goldebridge.com/platform)
- [API 参考 / API Reference](https://agentinsight.goldebridge.com/docs)

## 许可证 / License

[MIT](../../LICENSE)
