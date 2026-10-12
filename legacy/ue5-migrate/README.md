# 三维可视化渲染端 — UE5（legacy）

`@ghcloud-legacy/ue5-migrate` v1.14.0，部署路径 `/apps-legacy/ue5`。

迁移目标与进度见 [`prod/cube/apps/ue5`](../../prod/cube/apps/ue5/README.md)。

---

## 深度梳理文档

源码级运转逻辑、项目结构、可优化方案：

| 文档 | 内容 |
|---|---|
| [**docs/README.md**](./docs/README.md) | 索引与阅读顺序 |
| [01-runtime-logic.md](./docs/01-runtime-logic.md) | 启动链路、鉴权、ConfigLoader、ModelSDK、面板、实时子系统 |
| [02-project-structure.md](./docs/02-project-structure.md) | 目录树、模块职责、构建部署、SN 边界、结构债务 |
| [03-optimization.md](./docs/03-optimization.md) | P0–P3 优化项与迁移 Phase 对照 |

---

## 可视化面板开发流程

1. 在 `components/businessPanel` 创建卡片组件文件夹
2. 在 `components/businessPanel/base-panel-render/card-register.ts` 中注册卡片组件
3. 在 `prod/cube/basic/cube-visual-sdk/src/data-panel/card-definition.ts` 的 `cardDefinition` 中定义 card-register 注册的卡片枚举
4. 在 `prod/cube/basic/cube-visual-sdk/src/data-panel/panel-definition.ts` 中引入 card-definition 定义的卡片枚举组成面板
