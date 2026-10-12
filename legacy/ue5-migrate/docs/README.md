# legacy/ue5-migrate 深度梳理文档

本目录是对 `@ghcloud-legacy/ue5-migrate` 的 **源码级深度梳理**，独立于迁移执行文档，面向需要理解 legacy 全貌或参与改造的同事。

## 阅读顺序

| 顺序 | 文档 | 内容 |
|---|---|---|
| 1 | [01-runtime-logic.md](./01-runtime-logic.md) | 运转逻辑：启动链路、鉴权、ConfigLoader、ModelSDK、面板渲染、实时子系统 |
| 2 | [02-project-structure.md](./02-project-structure.md) | 项目结构：目录树、模块职责、构建部署、依赖分层、SN 边界 |
| 3 | [03-optimization.md](./03-optimization.md) | 可优化方案：P0–P3 优先级、关键文件、与迁移 Phase 对照 |

## 与其他文档的关系

| 文档 | 路径 | 定位 |
|---|---|---|
| 本文档集 | `legacy/ue5-migrate/docs/` | **legacy 源码深度梳理**（本文） |
| 迁移概览 | [`prod/cube/apps/ue5/docs/01-current-architecture.md`](../../../prod/cube/apps/ue5/docs/01-current-architecture.md) | 迁移视角的现状摘要 |
| 目标架构 | [`prod/cube/apps/ue5/docs/02-target-architecture.md`](../../../prod/cube/apps/ue5/docs/02-target-architecture.md) | apps/ue5 目标工程 |
| 迁移计划 | [`prod/cube/apps/ue5/docs/03-migration-plan.md`](../../../prod/cube/apps/ue5/docs/03-migration-plan.md) | Phase 0–4 分期 |
| 模块清单 | [`prod/cube/apps/ue5/docs/04-module-inventory.md`](../../../prod/cube/apps/ue5/docs/04-module-inventory.md) | businessPanel 域与依赖映射 |
| 迁移进度 | [`prod/cube/apps/ue5/PROGRESS.md`](../../../prod/cube/apps/ue5/PROGRESS.md) | 每步已完成 / 待补充 |

## 包信息

| 项 | 值 |
|---|---|
| 包名 | `@ghcloud-legacy/ue5-migrate` |
| 部署路径 | `/apps-legacy/ue5` |
| 终端编码 | `three-dimensional-visualization` |
| 源码规模 | ~1913 文件（968 vue + 421 tsx + 236 ts） |

## 维护规则

- 本文档描述 **legacy 现状**；优化实施优先在 [`prod/cube/apps/ue5/app`](../../../prod/cube/apps/ue5/app) 进行
- 发现文档与源码冲突时，以源码为准并更新本文档
- 卡片开发流程仍见根目录 [`README.md`](../README.md)
