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

## usageDetails / costDetails 键名规范 / Key Naming Convention

> **重要 / Important**: 当手动设置 `usageDetails` 和 `costDetails` 时，键名必须使用 `input` / `output` / `total`，这是 AgentInsight 平台（兼容 Langfuse 协议）的命名规范。平台 UI 会自动将键名中包含 `input` 的归类为输入，包含 `output` 的归类为输出。
>
> When manually setting `usageDetails` and `costDetails`, key names must use `input` / `output` / `total`. This is the naming convention of the AgentInsight platform (compatible with Langfuse protocol). The platform UI automatically categorizes keys containing `input` as input types and keys containing `output` as output types.

```typescript
import { startObservation } from "@agentinsight-sdk/tracing";

const generation = startObservation(
  "llm-call",
  {
    model: "gpt-4-turbo",
    input: [{ role: "user", content: "Hello" }],
  },
  { asType: "generation" },
);

// ... 调用 LLM / Call LLM ...

generation.update({
  output: "Hi there!",

  // ✅ 正确：使用 input / output / total
  // Correct: use input / output / total
  usageDetails: { input: 10, output: 20, total: 30 },
  costDetails: { input: 0.001, output: 0.002, total: 0.003 },

  // ❌ 错误：不要使用 promptTokens / completionTokens / totalTokens / totalCost 等
  // Wrong: do NOT use promptTokens / completionTokens / totalTokens / totalCost etc.
  // usageDetails: { promptTokens: 10, completionTokens: 20, totalTokens: 30 },
  // costDetails: { totalCost: 0.003 },
});
generation.end();
```

更细粒度的用量类型，平台会根据键名自动归类：

For more granular usage types, the platform auto-categorizes based on key names:

```typescript
generation.update({
  usageDetails: {
    input: 10,
    output: 20,
    cache_read_input_tokens: 5, // 归类为输入 / categorized as input
    audio_output_tokens: 8, // 归类为输出 / categorized as output
  },
  costDetails: {
    input: 0.01,
    cache_read_input_tokens: 0.005,
    output: 0.02,
    audio_output_tokens: 0.016,
  },
});
```

## 文档 / Documentation

- [AgentInsight 平台 / Platform](https://agentinsight.goldebridge.com/platform)
- [API 参考 / API Reference](https://agentinsight.goldebridge.com/docs)

## 许可证 / License

[MIT](../../LICENSE)
