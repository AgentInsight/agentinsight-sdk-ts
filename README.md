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
import OpenAI from "openai";

const client = new OpenAI();

const result = await observeOpenAI(client, "my-chat", () =>
  client.chat.completions.create({
    model: "gpt-4",
    messages: [{ role: "user", content: "Hello!" }],
  }),
);
```

### LangChain 集成 / LangChain Integration

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
