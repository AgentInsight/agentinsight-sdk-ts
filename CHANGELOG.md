# Changelog

## v0.1.1 (2026-06-02)

### Initial Release

First public release of the AgentInsight TypeScript SDK monorepo.

#### Packages

| Package | Version | Description |
|---------|---------|-------------|
| `@agentinsight-sdk/core` | 0.1.1 | Core functions and utilities for AgentInsight packages |
| `@agentinsight-sdk/tracing` | 0.1.1 | OpenTelemetry-based instrumentation methods |
| `@agentinsight-sdk/otel` | 0.1.1 | OpenTelemetry export helpers (Node.js only) |
| `@agentinsight-sdk/client` | 0.1.1 | Universal AgentInsight API client |
| `@agentinsight-sdk/openai` | 0.1.1 | OpenAI SDK integration |
| `@agentinsight-sdk/langchain` | 0.1.1 | LangChain integration |

#### Features

- **Core**: Shared API client, type definitions, constants, logger, media processing
- **Tracing**: OpenTelemetry tracing primitives (TracerProvider, SpanWrapper, attribute handling)
- **OTEL**: Node.js-specific OpenTelemetry export helpers (OTLP exporter, span filtering, media service)
- **Client**: Full AgentInsight API client with dataset, experiment, prompt, score, and media management
- **OpenAI**: Seamless OpenAI SDK integration with automatic tracing
- **LangChain**: LangChain callback handler with automatic tracing

#### Build

- Dual format output: CommonJS (`.cjs`) + ESM (`.mjs`)
- TypeScript declarations (`.d.ts` + `.d.cts`)
- Source maps included
- Target: ES2019
