# prod/cube-services/AGENTS.md

本目录是 Cube Services 三层服务体系：`interfaces`、`gateway`、`client`。

## Rules

- 本目录代表 Cube 服务契约最新规范；新增服务、BFF、SDK、前端接口调用默认参考 `interfaces/gateway/client` 三层结构。
- `interfaces` 是类型契约源，改动后检查 `gateway` 实现和 `client` SDK。
- `gateway` 使用 `@dangao/bun-server` 时必须读取 Bun Server skill。
- 认证透传、代理、响应 passthrough 改动属于高风险改动，先查调用链。
- 不在只改一层的情况下改变跨层契约。
- 旧 app 的自定义 `api` 或同级 `service` 模块是历史实践，不作为新增服务契约参考。

## Skills

以下路径均相对仓库根目录：

- Bun Server：`.agents/skills/bun-server-best-practices/SKILL.md`
- 服务契约：`.agents/standards/cube-service-contracts.md`
- 架构边界：`.agents/skills/project-architecture/SKILL.md`
- 普通编码：`.agents/skills/project-coding/SKILL.md`
- 验证命令：`.agents/skills/project-verification/SKILL.md`
