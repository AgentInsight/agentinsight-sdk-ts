---
alwaysApply: false
globs: agentinsight-js/**/*.*
---

# AgentInsight JS/TS SDK — 智能体执行规则

> 本文档是AI智能体（AI Agent）执行本项目开发任务的规则依据。智能体在执行任何任务前，必须先完整阅读本文档，并严格按照本文档定义的规则执行。

---

## 1. 项目基本信息

### 1.1 技术栈

| 类别          | 技术选型                                                    |
| ------------- | ----------------------------------------------------------- |
| 语言          | TypeScript 5.3+（编译目标 ES2019）                          |
| 运行时        | Node.js >= 20（开发推荐 24）                                |
| 包管理        | pnpm 10.33.0（Corepack 管理）                               |
| Monorepo 工具 | Turborepo 2.8+                                              |
| 构建工具      | tsup 8.5+（输出 CJS + ESM 双格式）                          |
| 测试框架      | Vitest 3.2+（单元测试 happy-dom / 集成+E2E node）           |
| 代码规范      | ESLint 9（扁平配置）+ Prettier 3.6+ + import 排序           |
| 发布工具      | release-it + @release-it/bumper（锁步版本）                 |
| API 文档      | Typedoc 0.28+                                               |
| 核心依赖      | OpenTelemetry API/SDK、OpenAI SDK、LangChain、Vercel AI SDK |
| CI/CD         | GitHub Actions（CI / Release / CodeQL / PR 校验）           |

### 1.2 项目关键特征

- **锁步版本**：所有 6 个包共享同一版本号（当前 v0.1.0），由 `@release-it/bumper` 同步
- **双格式输出**：每个包同时发布 CJS（`.cjs`）和 ESM（`.mjs`）产物
- **通用包 vs Node 专属包**：除 `@agentinsight-sdk/otel` 外，所有包必须可在浏览器和 Node.js 中运行，禁止使用 Node 内置模块
- **三层测试体系**：单元测试（happy-dom） → 集成测试（MockSpanExporter 本地模拟） → E2E 测试（需运行中 AgentInsight 服务器）
- **Trusted Publishing**：npm 发布使用 OIDC 无令牌认证，附带 provenance 证明

### 1.3 Monorepo 项目结构

| 包/目录               | 环境            | 说明                                                                   |
| --------------------- | --------------- | ---------------------------------------------------------------------- |
| `packages/core/`      | Universal       | 基础包：共享 API 客户端、类型定义、常量、日志器、媒体处理              |
| `packages/client/`    | Universal       | 通用 AgentInsight 客户端（依赖 core + tracing）                        |
| `packages/tracing/`   | Node.js 20+     | OpenTelemetry 追踪原语（依赖 core）                                    |
| `packages/otel/`      | Node.js（专属） | Node 专属 OpenTelemetry 导出助手（**唯一允许使用 Node 内置模块的包**） |
| `packages/openai/`    | Universal       | OpenAI SDK 集成（依赖 core + tracing）                                 |
| `packages/langchain/` | Universal       | LangChain 集成（依赖 core + tracing）                                  |
| `tests/integration/`  | Node.js         | 本地集成测试（无需外部服务）                                           |
| `tests/e2e/`          | Node.js         | 端到端测试（需 AgentInsight 服务器）                                   |
| `scripts/`            | —               | Codex 云环境初始化和维护脚本                                           |

**依赖方向图**：

```
@agentinsight-sdk/core  (基础包，无内部依赖)
    ├── @agentinsight-sdk/tracing   (依赖 core)
    ├── @agentinsight-sdk/otel      (依赖 core，Node.js 专属)
    ├── @agentinsight-sdk/client    (依赖 core + tracing)
    ├── @agentinsight-sdk/openai    (依赖 core + tracing)
    └── @agentinsight-sdk/langchain (依赖 core + tracing)
```

**通用包规则**：`packages/otel` 是唯一的 Node 专属异常，其他所有包必须保持通用（可在浏览器运行），ESLint 通过 `no-restricted-imports` 规则强制禁止引入 `node:*`、`fs`、`path`、`os`、`crypto` 等 Node 内置模块。

---

## 2. 智能体行为规则

### 2.1 角色定义

智能体在同一时刻仅扮演一个角色。角色列表：

| 角色           | 职责描述                                            |
| -------------- | --------------------------------------------------- |
| **SDK 开发者** | 负责 SDK 包的 API 设计、业务逻辑开发与实现          |
| **测试工程师** | 负责测试策略制定、测试用例编写、集成测试与 E2E 测试 |
| **代码审查者** | 负责代码评审，确保代码质量、风格一致性和向后兼容性  |
| **发布管理者** | 负责版本发布流程管理，确保锁步版本正确同步          |

### 2.2 自动化分级

| 级别           | 含义                                   |
| -------------- | -------------------------------------- |
| **自主执行**   | 智能体可独立完成，无需人工介入         |
| **需人工确认** | 智能体完成工作后必须暂停，等待人工确认 |

### 2.3 人工介入触发条件

智能体**必须暂停**请求人工介入的场景：

1. 需要引入新的外部依赖（workspace 内无此依赖的现有使用）
2. 需要修改公共 API 签名（涉及 breaking change）
3. 需要修改锁步版本号或发布配置
4. 需要修改 ESLint `no-restricted-imports` 规则或 eslint 全局配置
5. 涉及 npm 发布（通过 release-it 或 CI）
6. E2E 测试失败且需要访问真实 AgentInsight 服务器调试
7. 连续 3 次修复后测试仍然失败
8. 发现安全漏洞或潜在的敏感信息泄露
9. 需要变更 `pnpm-workspace.yaml` 或添加新包

### 2.4 错误处理策略

通用策略：**分析原因 → 逐层排查（代码 → 配置 → 依赖） → 无法解决则请求人工介入**。

| 场景         | 排查路径                                                          |
| ------------ | ----------------------------------------------------------------- |
| 构建失败     | 检查 tsup 配置 → 检查 TypeScript 编译错误 → 检查包间依赖          |
| 类型检查失败 | 检查 tsconfig 引用链 → 检查类型导出 → 检查 peerDependencies       |
| 单元测试失败 | 检查业务逻辑 → 检查 Mock 配置 → 检查 vitest alias 配置            |
| 集成测试失败 | 检查 MockSpanExporter 行为 → 检查 OTEL span 处理 → 检查 dist 产物 |
| E2E 测试失败 | 确认 AgentInsight 服务器状态 → 检查环境变量 → 检查网络连接        |
| Lint 错误    | 检查 ESLint 规则 → 检查 import 排序 → 检查 prettier 格式化        |
| 依赖安装失败 | 检查 pnpm 版本 → 检查 lockfile 一致性 → 检查 network/proxy        |

---

## 3. 文件操作规则

### 3.1 代码新增/修改位置

- **所有代码改动必须在 `agentinsight-js/` 目录及其子目录下**
- **所有文档保存在 `agentinsight-js/documents/`**，命名规范：`<类型>-<名称>-v<版本号>.md`

| 类型           | 目录                                              | 说明                                 |
| -------------- | ------------------------------------------------- | ------------------------------------ |
| API 客户端定义 | `packages/core/src/api/`                          | API 资源组织在 `resources/` 子目录下 |
| 共享类型       | `packages/core/src/types/`                        | 跨包使用的类型定义                   |
| 公共常量       | `packages/core/src/constants/`                    | 跨包使用的常量                       |
| 日志器         | `packages/core/src/logger/`                       | 统一的日志接口                       |
| 客户端实现     | `packages/client/src/`                            | 通用 AgentInsightClient 实现         |
| 追踪实现       | `packages/tracing/src/`                           | OpenTelemetry 追踪原语               |
| OTEL 导出      | `packages/otel/src/`                              | Node.js 专属导出助手                 |
| OpenAI 集成    | `packages/openai/src/`                            | OpenAI SDK 集成                      |
| LangChain 集成 | `packages/langchain/src/`                         | LangChain 集成                       |
| 单元测试       | 与源文件同目录 `*.test.ts` 或 `packages/*/tests/` | Vitest 发现                          |
| 集成测试       | `tests/integration/`                              | 不需要外部服务的测试                 |
| E2E 测试       | `tests/e2e/`                                      | 需要 AgentInsight 服务器的测试       |

### 3.2 文件命名规范

- **源文件**：`PascalCase.ts` 或 `camelCase.ts`，遵循现有约定
- **测试文件**：`{Name}.test.ts`，放置在源文件同目录或 `tests/` 子目录
- **配置文件**：`json` 格式，符合项目现有命名
- **内部依赖**：使用 `workspace:^` 引用

---

## 4. 任务执行流程规则

### 4.1 标准开发流程

**步骤 1：需求分析** `[自主执行]`

- 明确变更范围（哪个包、哪些 API）
- 确认是否涉及 breaking change
- 确认是否需要新增依赖

**步骤 2：代码编写** `[自主执行]`

- 遵循 TypeScript 最佳实践
- 保持向后兼容性（除非任务是明确 breaking change）
- 添加 JSDoc 注释以生成 API 文档

**步骤 3：编写测试** `[自主执行]`

- 为行为变更添加或更新测试
- Bug 修复必须先写回归测试
- 测试必须独立运行，不依赖执行顺序

**步骤 4：验证检查** `[自主执行]`

- 运行代码检查：
  ```bash
  pnpm lint && pnpm typecheck && pnpm format:check
  ```
- 运行相关测试：
  ```bash
  pnpm test -- <pattern>          # 单元测试
  pnpm test:integration           # 集成测试
  ```
- 对于跨包或发布敏感变更，运行完整 CI：
  ```bash
  pnpm ci
  ```

**步骤 5：代码评审** `[自主执行]`

- 确保代码通过所有检查
- 确保测试覆盖正常和异常路径
- 确认无破坏性变更或已明确记录

**步骤 6：提交** `[自主执行]`

- 提交信息遵循 Conventional Commits 格式
- 保持变更范围集中，避免不相关的重构

### 4.2 最低验证矩阵

| 变更范围           | 最低验证要求                                              |
| ------------------ | --------------------------------------------------------- |
| 仅包源码           | `pnpm lint` + `pnpm typecheck` + `pnpm test -- <pattern>` |
| 集成行为变更       | `pnpm test:integration`（脚本已包含构建）                 |
| E2E/服务器行为     | `pnpm test:e2e`（需设置环境变量）                         |
| 格式化/文档变更    | `pnpm format:check`                                       |
| 跨包或发布敏感变更 | `pnpm ci`（可行性范围内）                                 |

> 如果由于缺少凭据或 Langfuse 服务器而无法运行必要检查，必须在最终响应中明确说明。

---

## 5. 编码规则

### 5.1 设计原则

1. **TypeScript 优先**：所有公开 API 必须有完整类型定义
2. **向后兼容**：非 breaking change 任务不修改公开 API 签名
3. **ESM/CJS 双格式**：保持 `package.json` 中正确的 `exports` 字段
4. **通用性优先**：确保代码可在浏览器和 Node.js 运行（`@agentinsight-sdk/otel` 除外）
5. **关注点分离**：保持各包职责清晰，不交叉污染
6. **防御性编程**：对外部输入进行校验，做好异常处理

### 5.2 代码风格

- 遵循现有 ESLint 配置：import 分组排序（builtin → external → internal → parent → sibling → index），字母升序
- 遵循 Prettier 默认格式化规则
- 未使用变量以 `_` 前缀命名
- `@typescript-eslint/no-explicit-any` 默认关闭，但应尽量避免使用
- 禁止在通用包中使用 Node.js 内置模块（`node:*`、`fs`、`path`、`os`、`crypto`）

### 5.3 包依赖规则

- 内部包引用使用 `workspace:^`
- 新增外部依赖需在对应的 `package.json` 中声明
- 通用包不得依赖 Node-only 包
- `@agentinsight-sdk/otel` 的 Node 内置模块使用豁免于 ESLint 规则

### 5.4 禁止操作

- ❌ 手动编辑 `dist/` 目录中的构建产物
- ❌ 手动编辑 TypeScript build info（`*.tsbuildinfo`）
- ❌ 手动编辑 coverage 输出
- ❌ 手动编辑 Typedoc 输出
- ❌ 在非发布流程中修改 `packages/*/package.json` 版本号

---

## 6. 测试规则

### 6.1 测试体系

| 测试层级 | 运行环境  | 命令                    | 说明                                                       |
| -------- | --------- | ----------------------- | ---------------------------------------------------------- |
| 单元测试 | happy-dom | `pnpm test`             | 纯逻辑测试，直接引用 `src/` 源码                           |
| 集成测试 | node      | `pnpm test:integration` | 使用 MockSpanExporter，无需外部服务，引用 `dist/` 构建产物 |
| E2E 测试 | node      | `pnpm test:e2e`         | 需要运行中 Langfuse 服务器，引用 `dist/` 构建产物          |

### 6.2 测试编写规则

- 测试文件命名：`{Name}.test.ts`
- 测试可独立运行，不依赖执行顺序或共享可变状态
- Bug 修复必须先编写失败的回归测试，再修改实现代码
- 使用 Mock 隔离外部依赖（网络、文件系统、OTEL 导出）
- 集成测试通过 `vitest.workspace.ts` 指向 `dist/` 产物

### 6.3 E2E 测试环境变量

运行 E2E 测试需要设置以下环境变量：

```bash
AGENTINSIGHT_BASE_URL="http://localhost:3000"
AGENTINSIGHT_PUBLIC_KEY="pk-ai-1234567890"
AGENTINSIGHT_SECRET_KEY="sk-ai-1234567890"
OPENAI_API_KEY=          # 部分测试需要
```

### 6.4 测试覆盖率工具

使用 v8 coverage provider，支持 `text` / `json` / `html` 报告格式。

### 6.5 测试用户及数据验证

- 使用以下的API Key进行测试
  AGENTINSIGHT_SECRET_KEY="sk-lf-8675a592-3d7b-4f2e-bf93-fde30299327e"
  AGENTINSIGHT_PUBLIC_KEY="pk-lf-f757665b-53d5-42b1-a759-dfa34eae8386"
  AGENTINSIGHT_BASE_URL="https://agent.goldebridge.com"
- 连接Clickhouse数据库（agent.goldebridge.com:8123, clickhouse/AgentIS2026)，验证数据入库及数据准确性
- 如果需要连接LLM，连接本地的Ollama的本地模型deepseek-r1:1.5b

---

## 7. 构建与发布规则

### 7.1 构建系统

**构建工具链**：tsup → tsup 输出双格式产物

每个包的 tsup 配置模式：

```typescript
export default defineConfig({
  entry: ["src/index.ts"],
  format: ["cjs", "esm"],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  outDir: "dist",
  outExtension: ({ format }) => ({
    js: format === "cjs" ? ".cjs" : ".mjs",
  }),
});
```

**Turborepo 编排**：

- `build` 任务：依赖上游包先构建（`^build`），输出到 `dist/**`
- `//#check:format`、`//#check:lint`、`//#check:type`：根级检查任务
- `precommit:check`：并行运行三项检查，不容错（`--continue=never`）

### 7.2 TypeScript 配置

- **基础配置**：`tsconfig.base.json`（target ES2019，module NodeNext，strict true，declaration true）
- **根配置**：`tsconfig.json` 使用项目引用指向 6 个包
- **测试配置**：`tests/tsconfig.json` 独立测试 TypeScript 配置
- **类型检查**：`pnpm typecheck` = `tsc -b --noEmit`

### 7.3 发布流程

**推荐方式**：GitHub Actions 自动发布（Actions → Release workflow → Run workflow）

选择版本升级类型：

- `patch` — Bug 修复（0.1.0 → 0.1.1）
- `minor` — 新功能（0.1.0 → 0.2.0）
- `major` — Breaking changes（0.1.0 → 1.0.0）
- `prerelease` — alpha/beta/rc 预发布版

**本地手动发布**（备选，需 npm 登录权限）：

- `pnpm release` — 生产发布
- `pnpm release:alpha` / `:beta` / `:rc` — 预发布
- `pnpm release:dry` — 干运行预览

**发布安全特性**：

- 仅从 `main` 分支触发
- npm Trusted Publishing（OIDC 无令牌认证）
- provenance attestations（构建来源加密证明）
- 并发控制（一次仅允许一个发布）
- 锁定文件完整性检查

---

## 8. 安全规则

### 8.1 敏感数据处理

| 场景                                                             | 保护方式                                     |
| ---------------------------------------------------------------- | -------------------------------------------- |
| API 密钥（`AGENTINSIGHT_PUBLIC_KEY`、`AGENTINSIGHT_SECRET_KEY`） | 仅通过环境变量传入，永不硬编码               |
| OpenAI API 密钥（`OPENAI_API_KEY`）                              | 仅通过环境变量传入，永不硬编码               |
| 发布令牌                                                         | 使用 OIDC Trusted Publishing，不持有长期令牌 |

### 8.2 安全编码铁律

- **禁止**：硬编码密钥/密码/连接字符串；在代码或注释中泄露凭据；提交 `.env` 文件
- **必须**：所有密钥通过环境变量或 CI Secrets 注入；`.env` 文件在 `.gitignore` 中排除

---

## 9. 配置规则

### 9.1 配置文件体系

| 文件                        | 位置     | 说明                                     |
| --------------------------- | -------- | ---------------------------------------- |
| `package.json`              | 根目录   | 根 workspace 配置、脚本、devDependencies |
| `pnpm-workspace.yaml`       | 根目录   | 工作空间定义（`packages/*`）             |
| `turbo.json`                | 根目录   | Turborepo 任务编排                       |
| `tsconfig.base.json`        | 根目录   | TypeScript 基础共享配置                  |
| `tsconfig.json`             | 根目录   | TypeScript 项目引用根配置                |
| `eslint.config.mjs`         | 根目录   | ESLint v9 扁平配置                       |
| `.prettierignore`           | 根目录   | Prettier 忽略规则                        |
| `vitest.config.ts`          | 根目录   | 单元测试配置（含包别名映射）             |
| `vitest.workspace.ts`       | 根目录   | 集成/E2E 测试工作空间定义                |
| `vitest.setup.ts`           | 根目录   | 测试环境加载 dotenv                      |
| `typedoc.config.cjs`        | 根目录   | API 文档生成配置                         |
| `.release-it.json`          | 根目录   | 本地发布配置                             |
| `.release-it.ci.json`       | 根目录   | CI 发布配置                              |
| `.env.example`              | 根目录   | 环境变量模板                             |
| `packages/*/package.json`   | 各包目录 | 包级依赖和发布配置                       |
| `packages/*/tsconfig.json`  | 各包目录 | 包级 TypeScript 配置                     |
| `packages/*/tsup.config.ts` | 各包目录 | 包级构建配置                             |

### 9.2 环境变量

| 变量                      | 用途                             | 必需            |
| ------------------------- | -------------------------------- | --------------- |
| `AGENTINSIGHT_BASE_URL`   | E2E 测试 AgentInsight 服务器地址 | E2E 测试        |
| `AGENTINSIGHT_PUBLIC_KEY` | AgentInsight 公钥                | E2E 测试        |
| `AGENTINSIGHT_SECRET_KEY` | AgentInsight 密钥                | E2E 测试        |
| `OPENAI_API_KEY`          | OpenAI API 密钥                  | 部分 E2E 测试   |
| `AGENTINSIGHT_LOG_LEVEL`  | 日志级别                         | 否（默认 INFO） |

> 新增环境变量时必须同步更新 `.env.example`。

---

## 10. 代码评审规则

### 10.1 评审检查清单

**SDK 开发者检查项**：

- [ ] 代码通过 `pnpm lint`、`pnpm typecheck`、`pnpm format:check`
- [ ] 公共 API 保持向后兼容（非 breaking change 任务）
- [ ] 新增公开 API 有 JSDoc 注释
- [ ] 未在通用包中引入 Node.js 内置模块
- [ ] 包间依赖使用 `workspace:^`
- [ ] `package.json` exports 字段正确配置

**测试工程师检查项**：

- [ ] 新功能有对应的测试（单元测试 / 集成测试 / E2E）
- [ ] 测试覆盖正常路径和异常路径
- [ ] 测试可独立运行，不依赖执行顺序
- [ ] Bug 修复有回归测试

**代码审查者检查项**：

- [ ] 代码风格符合 ESLint 和 Prettier 规范
- [ ] Import 顺序正确（builtin → external → internal → parent → sibling → index）
- [ ] 无安全漏洞（硬编码密钥、敏感信息泄露）
- [ ] 变更范围集中，无不相关重构
- [ ] 提交信息符合 Conventional Commits 格式

---

## 11. Git 与工具规则

### 11.1 提交规范

提交信息和 PR 标题必须遵循 [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/)：

```text
type(scope): description
type: description
```

**允许的类型**：`feat`、`fix`、`docs`、`style`、`refactor`、`perf`、`test`、`build`、`ci`、`chore`、`revert`、`security`

**建议的 scope**：`core`、`client`、`tracing`、`otel`、`openai`、`langchain`

### 11.2 操作约束

- 保持变更范围集中，避免不相关的重构
- 不要还原不相关的工作目录更改
- 不要使用破坏性 Git 命令（如 `git reset --hard`），除非用户明确要求
- 优先使用 `rg` 进行代码搜索
- 必须使用 `pnpm` 而非 npm 或 yarn

### 11.3 Git Hooks

`.husky/pre-commit` 在提交前运行 `pnpm precommit:check`（并行 lint + typecheck + format check），全部通过才允许提交。

---

## 12. 禁止事项清单

以下事项智能体**严禁执行**，如需执行必须先请求人工介入：

1. ❌ 修改 `packages/*/package.json` 中的版本号（由 release-it 管理）
2. ❌ 手动编辑 `dist/` 目录中的构建产物
3. ❌ 修改 `.release-it.json` 或 `.release-it.ci.json` 发布配置
4. ❌ 修改 `eslint.config.mjs` 中的 `no-restricted-imports` 规则
5. ❌ 修改 `pnpm-workspace.yaml` 工作空间定义
6. ❌ 添加新的 workspace 包（需评估架构影响）
7. ❌ 在通用包中引入 Node.js 内置模块依赖
8. ❌ 在代码或注释中硬编码密钥、密码、令牌
9. ❌ 提交 `.env` 文件
10. ❌ 直接执行 `pnpm release` 等发布命令（需确认后通过 CI 发布）
11. ❌ 运行 `git push --force` 到 `main` 分支
12. ❌ 手动修改 `CHANGELOG.md`（由 release-it 自动生成）

---

## 13. CI/CD 参考

### 13.1 GitHub Actions 工作流

| 工作流                  | 触发条件                      | 用途                                          |
| ----------------------- | ----------------------------- | --------------------------------------------- |
| `ci.yml`                | PR、push main、手动           | 并行 job：集成测试 + E2E 测试 + Lint          |
| `release.yml`           | 手动触发（workflow_dispatch） | 版本发布（支持 patch/minor/major/prerelease） |
| `validate-pr-title.yml` | PR 打开/编辑                  | 强制 Conventional Commits 格式                |
| `codeql.yml`            | push main、PR、每周三         | 代码安全分析                                  |
| `zizmor.yml`            | push main、PR                 | GitHub Actions 安全检查                       |

### 13.2 Codex 云环境

```bash
bash scripts/codex/setup.sh       # 初始化：安装依赖 + 构建
bash scripts/codex/maintenance.sh  # 维护：重新安装依赖
```

---

## 14. 附录

### 14.1 核心命令速查

| 命令                    | 功能                                                           |
| ----------------------- | -------------------------------------------------------------- |
| `pnpm install`          | 安装依赖                                                       |
| `pnpm build`            | 构建所有包                                                     |
| `pnpm test`             | 运行单元测试                                                   |
| `pnpm test:integration` | 构建后运行集成测试                                             |
| `pnpm test:e2e`         | 构建后运行 E2E 测试                                            |
| `pnpm lint`             | ESLint 检查                                                    |
| `pnpm lint:fix`         | ESLint 自动修复                                                |
| `pnpm typecheck`        | TypeScript 类型检查                                            |
| `pnpm format`           | Prettier 格式化                                                |
| `pnpm format:check`     | Prettier 格式化检查                                            |
| `pnpm ci`               | 完整 CI 检查（build + test + lint + typecheck + format:check） |
| `pnpm clean`            | 清理所有 dist 和 tsbuildinfo                                   |
| `pnpm nuke`             | 彻底清理（包括 node_modules）                                  |
| `pnpm docs`             | 生成 Typedoc API 文档                                          |

### 14.2 各包 package 名称

| 目录                 | npm 包名                      |
| -------------------- | ----------------------------- |
| `packages/core`      | `@agentinsight-sdk/core`      |
| `packages/client`    | `@agentinsight-sdk/client`    |
| `packages/tracing`   | `@agentinsight-sdk/tracing`   |
| `packages/otel`      | `@agentinsight-sdk/otel`      |
| `packages/openai`    | `@agentinsight-sdk/openai`    |
| `packages/langchain` | `@agentinsight-sdk/langchain` |

### 14.3 关键外部依赖版本

| 依赖                            | 版本     | 用途                   |
| ------------------------------- | -------- | ---------------------- |
| `@opentelemetry/api`            | ^1.9.0   | OpenTelemetry 核心 API |
| `@opentelemetry/sdk-trace-base` | ^2.0.1   | 追踪 SDK               |
| `openai`                        | ^5.0.0   | OpenAI SDK 集成        |
| `@langchain/core`               | ^1.1.24  | LangChain 集成         |
| `ai`                            | ^5       | Vercel AI SDK 集成     |
| `zod`                           | ^3.25.76 | 运行时类型校验         |
| `mustache`                      | ^4.2.0   | 模板渲染（prompt）     |
| `vitest`                        | ^3.2.4   | 测试框架               |
| `typescript`                    | ^5.3.0   | 语言编译器             |
| `tsup`                          | ^8.5.0   | 构建打包               |
| `turbo`                         | ^2.8.13  | Monorepo 任务编排      |

### 14.4 交叉包影响参考

进行变更时，注意以下影响关系：

| 变更包                        | 影响的包                  |
| ----------------------------- | ------------------------- |
| `@agentinsight-sdk/core`      | 所有 5 个下游包           |
| `@agentinsight-sdk/tracing`   | client、openai、langchain |
| `@agentinsight-sdk/otel`      | 无下游影响                |
| `@agentinsight-sdk/client`    | 无下游影响                |
| `@agentinsight-sdk/openai`    | 无下游影响                |
| `@agentinsight-sdk/langchain` | 无下游影响                |
