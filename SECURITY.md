# 安全策略 / Security Policy

## 支持的版本 / Supported Versions

| 版本 / Version | 支持 / Supported |
| -------------- | ---------------- |
| 0.1.x          | ✅               |
| < 0.1          | ❌               |

## 报告漏洞 / Reporting a Vulnerability

我们严肃对待 AgentInsight SDK 的安全性。如果您认为发现了安全漏洞，请按以下方式报告。

We take the security of AgentInsight SDK seriously. If you believe you have found a security vulnerability, please report it to us as described below.

**请勿通过公开的 GitHub Issues 报告安全漏洞。**

**Please do NOT report security vulnerabilities through public GitHub issues.**

请通过电子邮件向 [opensource@goldebridge.com] 报告。

Instead, please report them via email to [opensource@goldebridge.com].

您应该在 48 小时内收到回复。如果由于某种原因没有收到，请通过电子邮件跟进以确保我们收到了您的原始消息。

You should receive a response within 48 hours. If for some reason you do not, please follow up via email to ensure we received your original message.

请在报告中包含以下信息 / Please include the following information in your report:

- 问题类型（例如：缓冲区溢出、SQL 注入、跨站脚本等）/ Type of issue
- 与问题表现相关的源文件完整路径 / Full paths of source file(s) related to the issue
- 受影响源代码的位置 / The location of the affected source code
- 复现问题所需的任何特殊配置 / Any special configuration required to reproduce the issue
- 复现问题的分步说明 / Step-by-step instructions to reproduce the issue
- 概念验证或利用代码（如可能）/ Proof-of-concept or exploit code (if possible)
- 问题的影响 / Impact of the issue

## 安全最佳实践 / Security Best Practices

使用 AgentInsight SDK 时 / When using the AgentInsight SDK:

- **切勿在源代码中硬编码 API 密钥** / **Never hardcode API keys** in your source code. 使用环境变量或安全的密钥管理 / Use environment variables or secure secret management.
- **仅在服务端使用密钥** / **Use the secret key only server-side**. 公钥可以在客户端代码中使用 / The public key can be used in client-side code.
- **保持 SDK 版本最新** / **Keep your SDK version up to date** 以获得最新的安全补丁 / to benefit from the latest security patches.
- **审查权限** / **Review the permissions** 在 AgentInsight 平台中授予 API 密钥的权限 / you grant to API keys in the AgentInsight platform.
