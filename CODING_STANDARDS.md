# ghcloud 编码规范

本文件适用于 ghcloud 仓库的所有代码修改；具体项目知识与命令以 `.agents/` 为权威来源。

## 基本要求

- 修改前读取目标目录最近的 `AGENTS.md`、目标包 `package.json` 及所需的 `.agents` Skill/Standard。
- 以当前源码、类型定义、构建与校验配置为最高优先级；文档冲突时以代码为准。
- 仅修改与当前需求直接相关的文件。`legacy/` 仅做最小修复，不顺手现代化、重构或升级依赖。
- 遵循目标文件的既有 TypeScript、Vue 与格式化风格，不做无关的大范围格式化。

## 服务与认证

- 服务契约、BFF、SDK 或前端接口调用遵循 `.agents/standards/cube-service-contracts.md`。
- `prod/cube-services/` 的接口变更需要同时核对 `interfaces`、`gateway`、`client`；未改变契约时不得无故修改其他层。
- BFF 调用需要认证时，使用 `@ghcloud/cube-services-client/auth-request` 的 `authRequest` 与 `useAuthRequest`，不复制 Token、租户或请求头逻辑。
- `@dangao/bun-server` 的 Controller、代理、鉴权透传或拦截器修改前，读取 Bun Server Skill 并保持现有 DI、装饰器与请求上下文模式。

## 安全与验证

- 不记录、提交或输出 Token、Cookie、密码等运行时凭据。
- 除非用户明确要求，不运行构建命令；优先使用最小的静态检查、定向测试、请求模拟和 `git diff --check`。
- 验证命令以目标包的 `package.json` 为准；完成时区分已验证行为与未验证的运行环境行为。
- 未经用户要求，不暂存、提交、推送，也不修改生成物、`dist/`、`lib/` 或无关 lockfile。
