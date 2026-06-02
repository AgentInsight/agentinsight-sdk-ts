import { defineWorkspace } from "vitest/config";

export default defineWorkspace([
  {
    test: {
      name: "integration",
      environment: "node",
      include: ["tests/integration/**/*.test.ts"],
      setupFiles: ["./vitest.setup.ts"],
    },
    resolve: {
      alias: {
        "@agentinsight-sdk/client": new URL(
          "./packages/client/dist/index.mjs",
          import.meta.url,
        ).pathname,
        "@agentinsight-sdk/tracing": new URL(
          "./packages/tracing/dist/index.mjs",
          import.meta.url,
        ).pathname,
        "@agentinsight-sdk/otel": new URL(
          "./packages/otel/dist/index.mjs",
          import.meta.url,
        ).pathname,
        "@agentinsight-sdk/langchain": new URL(
          "./packages/langchain/dist/index.mjs",
          import.meta.url,
        ).pathname,
        "@agentinsight-sdk/openai": new URL(
          "./packages/openai/dist/index.mjs",
          import.meta.url,
        ).pathname,
        "@agentinsight-sdk/core": new URL(
          "./packages/core/dist/index.mjs",
          import.meta.url,
        ).pathname,
      },
    },
  },
]);
