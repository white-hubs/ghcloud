# ADR（Architecture Decision Records）

本目录沉淀本仓库的**关键架构决策**，供人类与 AI 协作时快速对齐上下文。

## 什么是 ADR

ADR 是一种**轻量级**的架构决策记录，单个文档回答三个问题：

1. **Context** — 我们在什么背景下做了这个决策？
2. **Decision** — 决策是什么？
3. **Consequences** — 决策带来了什么（正面 + 负面）？

## 规范

- 文件名：`NNNN-<slug>.md`，`NNNN` 四位递增
- `status`：`proposed` / `accepted` / `deprecated` / `superseded by NNNN`
- 更改决策**不改旧 ADR**，而是新增一份并在旧 ADR 顶部追加 `superseded by NNNN`
- 范围覆盖整个仓库；单项目级别的约定写在各自 `readme.md` 即可

## 索引

| 编号 | 标题 | 状态 |
|---|---|---|
| [0001](./0001-frontend-app-structure.md) | Cube 前端子应用工程结构 | accepted |
| [0002](./0002-package-version-strategy.md) | 包管理与版本策略 | accepted |
| [0003](./0003-api-calling-convention.md) | API 调用分层 | accepted |
| [0004](./0004-auth-request-only.md) | 认证上下文注入统一用 authRequest | accepted |
| [0005](./0005-ui-component-library.md) | UI 组件库选型 | accepted |
| [0006](./0006-utility-convergence.md) | 工具函数统一收口 cube-utils | accepted |
| [0007](./0007-env-strategy.md) | 环境变量策略 | accepted |
| [0008](./0008-qiankun-integration.md) | qiankun 集成规范 | accepted |
| [0009](./0009-optional-dependencies.md) | 可选依赖通过独立模板扩展 | accepted |
| [0010](./0010-tree-shaking-constraints.md) | Tree-shaking 约束 | accepted |
| [0011](./0011-release-branch-and-versioning-workflow.md) | Release 分支集成、版本校验与 Hotfix 工作流 | accepted |
