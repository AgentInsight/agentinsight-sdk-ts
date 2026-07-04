# agentinsight-js

[![MIT License](https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square)](https://opensource.org/licenses/MIT)
[![CI test status](https://img.shields.io/github/actions/workflow/status/agentinsight/agentinsight-sdk-ts/ci.yml?style=flat-square&label=CI)](https://github.com/agentinsight/agentinsight-sdk-ts/actions/workflows/ci.yml?query=branch%3Amain)

AgentInsight JS/TS SDK — 用于将 AI 应用可观测性数据发送到 [AgentInsight](https://agentinsight.goldebridge.com/platform) 平台的官方 JavaScript/TypeScript 客户端库。

The official JavaScript/TypeScript client library for sending AI application observability data to the [AgentInsight](https://agentinsight.goldebridge.com/platform) platform.

基于 OpenTelemetry 协议，支持自动追踪 AI 模型调用、成本分析、Prompt 管理等功能。

Built on the OpenTelemetry protocol, supporting automatic AI model call tracing, cost analysis, prompt management, and more.

## 特性 / Features

- 🔄 **基于 OpenTelemetry / OpenTelemetry-based** — 使用标准 OTEL 协议导出追踪数据 / Export traces using standard OTEL protocol
- 🤖 **多框架集成 / Multi-framework integration** — 支持 OpenAI SDK、LangChain、Vercel AI SDK 等 / Supports OpenAI SDK, LangChain, Vercel AI SDK, etc.
- 💰 **成本分析 / Cost analysis** — 自动计算 Token 用量和模型调用成本 / Automatic token usage and model cost calculation
- 🖼️ **媒体处理 / Media handling** — 支持图片、文件等多媒体内容的上传和关联 / Upload and associate multimedia content
- 📝 **Prompt 管理 / Prompt management** — 版本化 Prompt 模板管理 / Versioned prompt template management
- 🔒 **数据脱敏 / Data masking** — 内置敏感数据掩码功能 / Built-in sensitive data masking
- 🌐 **通用运行时 / Universal runtime** — 大部分包同时支持浏览器和 Node.js 环境 / Most packages work in both browser and Node.js

## 安装 / Installation

```bash
# 核心客户端 / Core client
npm install @agentinsight-sdk/client

# OpenAI 集成 / OpenAI integration
npm install @agentinsight-sdk/openai

# LangChain 集成 / LangChain integration
npm install @agentinsight-sdk/langchain

# OpenTelemetry 导出助手（仅 Node.js）/ OTEL export helpers (Node.js only)
npm install @agentinsight-sdk/otel
```

## 快速开始 / Quick Start

### OpenAI 集成 / OpenAI Integration

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

### LangChain 集成 / LangChain Integration

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

### OpenTelemetry 直接使用 / Direct OpenTelemetry Usage

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

### 追踪 Token 用量和成本 / Tracking Token Usage & Cost

当手动上传 `usageDetails` 和 `costDetails` 时，**键名必须使用 `input` / `output` / `total`**，这是 AgentInsight 平台（兼容 Langfuse 协议）的命名规范。平台 UI 会自动将含 `input` 的键归类为输入、含 `output` 的键归类为输出。

When manually providing `usageDetails` and `costDetails`, **key names must use `input` / `output` / `total`**. This is the naming convention of the AgentInsight platform (compatible with Langfuse protocol). The platform UI automatically categorizes keys containing `input` as input types and keys containing `output` as output types.

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
  // ✅ 正确：使用 input / output / total / Correct: use input / output / total
  usageDetails: { input: 10, output: 20, total: 30 },
  costDetails: { input: 0.001, output: 0.002, total: 0.003 },

  // ❌ 错误：不要使用 promptTokens / completionTokens / totalTokens / totalCost 等
  // Wrong: do NOT use promptTokens / completionTokens / totalTokens / totalCost etc.
  // usageDetails: { promptTokens: 10, completionTokens: 20, totalTokens: 30 },
  // costDetails: { totalCost: 0.003 },
});
generation.end();
```

对于更细粒度的用量类型，可以添加任意键名，平台会根据键名中是否包含 `input` 或 `output` 自动归类：

For more granular usage types, you can add arbitrary keys — the platform auto-categorizes them based on whether the key contains `input` or `output`:

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

## 包列表 / Packages

| 包 / Package                                        | NPM                                                                                                                               | 说明 / Description                                        | 运行环境 / Runtime |
| --------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------- | ------------------ |
| [@agentinsight-sdk/core](./packages/core)           | [![NPM](https://img.shields.io/npm/v/@agentinsight-sdk/core.svg)](https://www.npmjs.com/package/@agentinsight-sdk/core)           | API 客户端、类型定义、常量 / API client, types, constants | Universal JS       |
| [@agentinsight-sdk/tracing](./packages/tracing)     | [![NPM](https://img.shields.io/npm/v/@agentinsight-sdk/tracing.svg)](https://www.npmjs.com/package/@agentinsight-sdk/tracing)     | OpenTelemetry 追踪原语 / OTEL tracing primitives          | Node.js 20+        |
| [@agentinsight-sdk/otel](./packages/otel)           | [![NPM](https://img.shields.io/npm/v/@agentinsight-sdk/otel.svg)](https://www.npmjs.com/package/@agentinsight-sdk/otel)           | OTEL 导出助手 / OTEL export helpers                       | Node.js 20+        |
| [@agentinsight-sdk/client](./packages/client)       | [![NPM](https://img.shields.io/npm/v/@agentinsight-sdk/client.svg)](https://www.npmjs.com/package/@agentinsight-sdk/client)       | 通用客户端 / Universal client                             | Universal JS       |
| [@agentinsight-sdk/openai](./packages/openai)       | [![NPM](https://img.shields.io/npm/v/@agentinsight-sdk/openai.svg)](https://www.npmjs.com/package/@agentinsight-sdk/openai)       | OpenAI SDK 集成 / OpenAI SDK integration                  | Universal JS       |
| [@agentinsight-sdk/langchain](./packages/langchain) | [![NPM](https://img.shields.io/npm/v/@agentinsight-sdk/langchain.svg)](https://www.npmjs.com/package/@agentinsight-sdk/langchain) | LangChain 集成 / LangChain integration                    | Universal JS       |

## 文档 / Documentation

- [AgentInsight 平台 / Platform](https://agentinsight.goldebridge.com/platform)
- [API 参考 / API Reference](https://agentinsight.goldebridge.com/docs)

## 开发 / Development

本项目使用 pnpm 管理的 monorepo 结构。详见 [CONTRIBUTING.md](./CONTRIBUTING.md)。

This project uses a pnpm-managed monorepo structure. See [CONTRIBUTING.md](./CONTRIBUTING.md) for details.

```bash
pnpm install    # 安装依赖 / Install dependencies
pnpm build      # 构建所有包 / Build all packages
pnpm test       # 运行单元测试 / Run unit tests
pnpm ci         # 运行完整 CI 检查 / Run full CI checks
```

## 致谢 / Acknowledgements

本项目基于 [Langfuse JS SDK](https://github.com/langfuse/langfuse-js) 开发，感谢 Langfuse 团队的开源贡献。

This project is based on the [Langfuse JS SDK](https://github.com/langfuse/langfuse-js). Thanks to the Langfuse team for their open-source contribution.

> **注意 / Note**: 本 SDK 与 AgentInsight 服务端之间的协议层标识符（如 HTTP 头 `x-langfuse-*`、OTEL 属性 `langfuse.*`、媒体标记 `@@@langfuseMedia@@@` 等）保持 `langfuse` 前缀以确保服务端兼容性。修改这些标识符需要同步更改服务端代码。
>
> Protocol-layer identifiers between this SDK and the AgentInsight server (e.g., HTTP headers `x-langfuse-*`, OTEL attributes `langfuse.*`, media markers `@@@langfuseMedia@@@`) retain the `langfuse` prefix for server compatibility. Changing these requires corresponding server-side changes.

## 许可证 / License

[MIT](LICENSE)
