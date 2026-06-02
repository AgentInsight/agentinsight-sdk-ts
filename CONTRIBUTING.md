# 贡献指南 / Contributing

## 开发 / Development

本项目是包含 AgentInsight TypeScript/JavaScript SDK 包的 monorepo：

This is a monorepo containing the AgentInsight TypeScript/JavaScript SDK packages:

- **[@agentinsight-sdk/core](./packages/core)** - 共享工具、类型和日志器 / Shared utilities, types and logger
- **[@agentinsight-sdk/client](./packages/client)** - AgentInsight API 通用客户端 / AgentInsight API client for universal JavaScript environments
- **[@agentinsight-sdk/tracing](./packages/tracing)** - 基于 OpenTelemetry 的追踪方法 / AgentInsight instrumentation methods based on OpenTelemetry
- **[@agentinsight-sdk/otel](./packages/otel)** - OpenTelemetry 导出助手 / AgentInsight OpenTelemetry export helpers
- **[@agentinsight-sdk/openai](./packages/openai)** - OpenAI SDK 集成 / AgentInsight integration for OpenAI SDK
- **[@agentinsight-sdk/langchain](./packages/langchain)** - LangChain 集成 / AgentInsight integration for LangChain

## 开始 / Getting Started

### 前置条件 / Prerequisites

- Node.js 20+（SDK 运行时兼容）；开发推荐 Node.js 24
- 通过 Corepack 启用 pnpm 10.33.0

- Node.js 20+ for SDK runtime compatibility; Node.js 24 is recommended for development
- pnpm 10.33.0 via Corepack

### 安装依赖 / Installing dependencies

```bash
pnpm install
```

### 构建包 / Building packages

```bash
# 构建所有包 / Build all packages
pnpm build

# 构建并监听变更 / Build and watch for changes
pnpm build --watch
```

## 测试 / Testing

### 集成测试 / Integration tests

集成测试使用 `MockSpanExporter` 在本地运行，无需外部服务。

Integration tests run fully locally using a `MockSpanExporter` to verify SDK behavior without requiring external services.

```bash
# 运行集成测试 / Run integration tests
pnpm test:integration

# 监听模式 / Watch mode
pnpm test:integration:watch
```

### 单元测试 / Unit tests

```bash
# 运行单元测试 / Run unit tests
pnpm test

# 监听模式 / Watch mode
pnpm test:watch
```

## 代码质量 / Code Quality

```bash
# 代码检查 / Lint code
pnpm lint

# 自动修复 / Fix linting issues
pnpm lint:fix

# 格式化代码 / Format code
pnpm format

# 检查格式 / Check formatting
pnpm format:check

# 类型检查 / Type checking
pnpm typecheck

# 运行完整 CI 检查 / Run all CI checks
pnpm ci
```

## 发布 / Publishing

本项目使用锁步版本号——所有包以相同版本号一起发布。发布由 [release-it](https://github.com/release-it/release-it) 管理，支持 Conventional Commits 和自动 Changelog 生成。

This project uses lockstep versioning — all packages are released together with the same version number. Releases are managed using [release-it](https://github.com/release-it/release-it) with conventional commits and automated changelog generation.

### 通过 GitHub Actions 自动发布（推荐）/ Automated Releases via GitHub Actions (Recommended)

1. 进入 **Actions** → **Release** 工作流
2. 点击 **Run workflow**
3. 选择版本升级类型 / Select the version bump type:
   - `patch` — Bug 修复（0.1.0 → 0.1.1）/ Bug fixes
   - `minor` — 新功能（0.1.0 → 0.2.0）/ New features
   - `major` — 破坏性变更（0.1.0 → 1.0.0）/ Breaking changes
   - `prerelease` — alpha/beta/rc 预发布版 / Pre-release versions
4. 点击 **Run workflow**

### 本地手动发布（备选）/ Manual Local Releases (Fallback)

```bash
# 生产发布 / Production release
pnpm release

# 预发布版本 / Pre-release versions
pnpm release:alpha  # Alpha
pnpm release:beta   # Beta
pnpm release:rc     # Release candidate

# 干运行（预览变更但不发布）/ Dry run (preview without publishing)
pnpm release:dry
```

## 开发流程 / Development Workflow

1. 从 `main` 创建功能分支 / Create a feature branch from `main`
2. 进行修改 / Make your changes
3. 为修改添加测试 / Add tests for your changes
4. 运行 `pnpm ci` 确保所有检查通过 / Run `pnpm ci` to ensure all checks pass
5. 创建 Pull Request，标题遵循 Conventional Commits 格式 / Create a PR with a Conventional Commits title

## 提交信息和 PR 标题 / Commit messages and PR titles

提交信息和 PR 标题必须遵循 [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/)：

Commit messages and PR titles must follow [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/):

```text
type(scope): description
type: description
```

允许的类型 / Allowed types: `feat`、`fix`、`docs`、`style`、`refactor`、`perf`、`test`、`build`、`ci`、`chore`、`revert`、`security`

Scope 可选，但用于限定变更范围时很有用（如 `openai`、`tracing`、`client`）。

Scopes are optional but useful when a change is limited to a package such as `openai`, `tracing`, or `client`.
