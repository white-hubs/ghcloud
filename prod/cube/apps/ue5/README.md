# UE5 三维可视化 — 整体梳理与改造文档

本目录是 **legacy `ue5-migrate` → `prod/cube/apps/ue5/app`** 迁移的权威文档入口。改造后的应用将位于 `apps/ue5/app`，页面与组件统一采用 **TSX**（Vue 3 `defineComponent` + JSX），工程规范对齐 Cube PC 子应用标准。应用需 **同时支持** standalone 新窗口（`/ue5`）与 qiankun 子应用内嵌（`/portal/ue5`）；**当前代码仅实现 standalone**，子应用集成列入 Phase 5（暂不开发）。

## 项目定位

| 项 | 说明 |
|---|---|
| 应用编码 | `three-dimensional-visualization` |
| 终端类型 | 三维可视化渲染端 |
| 现状代码库 | [`legacy/ue5-migrate`](../../../../legacy/ue5-migrate)（`@ghcloud-legacy/ue5-migrate` v1.14.0）；深度梳理见 [`legacy/ue5-migrate/docs/`](../../../../legacy/ue5-migrate/docs/README.md) |
| 目标代码库 | [`prod/cube/apps/ue5/app`](app/)（`@ghcloud/cube-ue5-app` v0.1.0，Phase 1 已启动） |
| 关联 service | [`prod/cube/apps/visualization/service`](../visualization/service)（`@ghcloud/cube-visualization-service`） |
| 海吉星特例 | [`legacy/ue5-sn-migrate`](../../../../legacy/ue5-sn-migrate)（`views-shengNong` 租户入口，独立仓库） |

## 关键决策摘要

1. **集成方式（2026-07 调整）**：**双模式** — bimops 新窗口 + `cube-secret` SSO（`/ue5`，当前已实现）；portal / bimops 微前端内嵌（`/portal/ue5`，**Phase 5 规划，暂不开发**）。
2. **技术栈**：TSX 为主；存量 Vue SFC 卡片在 Phase 2 按需兼容或改写，不阻塞壳层迁移。
3. **壳层取舍**：以 legacy 中已部分完成的 `src/pages/`（TSX + ModelSDK + Pinia）为迁移基线，废弃巨型 `views/index.vue` Legacy Shell。
4. **卡片协议不变**：继续沿用 `card-register` ↔ `@ghcloud/cube-visual-sdk` 的 card-definition / panel-definition 三件套。
5. **路径策略**：standalone `/apps-legacy/ue5` → `/ue5` 灰度切流（Phase 1）；qiankun `/portal/ue5`（Phase 5）。

## 主应用入口

bimops 主应用通过终端下拉菜单打开 UE5：

- 文件：[`legacy/bimops-fe-web-migrate/src/components/NavTopLink/components/choose-terminal-dropdown/choose-terminal-dropdown.vue`](../../../../legacy/bimops-fe-web-migrate/src/components/NavTopLink/components/choose-terminal-dropdown/choose-terminal-dropdown.vue)
- 流程：`getShortSecret("three-dimensional-visualization")` → `openUrlInNewWindow("/apps-legacy/ue5", { "cube-secret": cubeSecret })`
- 若终端配置了 `aliasPath`，则优先打开自定义路径

## 阅读顺序

| 顺序 | 文档 | 内容 |
|---|---|---|
| 0 | [**PROGRESS.md**](./PROGRESS.md) | **迁移进度**：每步已完成 / 待补充（持续更新） |
| 1 | [01-current-architecture.md](./docs/01-current-architecture.md) | legacy 现状：部署、双轨架构、渲染模式、面板体系、已知问题 |
| 1b | [legacy/ue5-migrate/docs/](../../../../../legacy/ue5-migrate/docs/README.md) | **legacy 源码深度梳理**（运转逻辑 / 项目结构 / 优化方案，比 01 更细） |
| 2 | [02-target-architecture.md](./docs/02-target-architecture.md) | 目标架构：双模式集成、TSX 目录、auth、Cube 规范适配 |
| 3 | [03-migration-plan.md](./docs/03-migration-plan.md) | 分期改造计划（Phase 0–5）、验收标准、路径切换 |
| 4 | [04-module-inventory.md](./docs/04-module-inventory.md) | 模块清单：businessPanel 域、依赖映射、迁移建议 |
| 5 | [**05-migration-transformation.md**](./docs/05-migration-transformation.md) | **改造总结**：目录、壳层、TSX 化、工具链、待办 |

## 术语表

| 术语 | 含义 |
|---|---|
| **UE5** | Unreal Engine 5 像素流/WebRTC 渲染模式（`renderType === 'UE5'`） |
| **WebGL** | Three.js 本地 WebGL 渲染（`renderType === 'WEBGL'`） |
| **GIS** | Leaflet + `@ghcloud/cube-map-plugins` 地图渲染（`renderType === 'GIS'`） |
| **2D SCADA** | 二维组态入口（`entry: views-2d`），无 3D 模型容器 |
| **ModelSDK** | 统一模型操作门面，内部委托 `UE5SDK` / `WebGlSDK` / `WebGisSDK` |
| **ConfigLoader** | 启动时加载租户配置、可视化项目配置、模型路径等 |
| **card-register** | 业务卡片组件注册表，key 与 `cube-visual-sdk` 的 cardDefinition code 一致 |
| **Legacy Shell** | 生产默认入口：`views/index.vue`（~1600 行 Vue SFC 单体） |
| **Refactored Shell** | 已写但未启用的 TSX 入口：`src/pages/index.tsx` |

## 相关规范与参考

- Cube 子应用开发：[`/.agents/skills/cube-app-development/SKILL.md`](../../../../.agents/skills/cube-app-development/SKILL.md)
- Cube PC 开发规范：[`/.agents/standards/cube-app-development-standard.md`](../../../../.agents/standards/cube-app-development-standard.md)
- 脚手架基线：[`prod/cube/template/app`](../../template/app)
- TSX 大屏参考：[`prod/cube/apps/inspection-command-screen/app`](../../inspection-command-screen/app)
- 卡片开发流程（legacy）：[`legacy/ue5-migrate/README.md`](../../../../legacy/ue5-migrate/README.md)
- Legacy 深度梳理：[`legacy/ue5-migrate/docs/`](../../../../legacy/ue5-migrate/docs/README.md)（01 运转逻辑、02 项目结构、03 优化方案）
- ADR：[`docs/adr/0001`](../../../../docs/adr/0001-frontend-app-structure.md) ~ [`0010`](../../../../docs/adr/0010-tree-shaking-constraints.md)

## 文档维护

- **进度跟踪**：每完成一步更新 [`PROGRESS.md`](./PROGRESS.md)（已完成 / 待补充 / changelog）
- 本文档集对应 **Phase 0** 交付物；代码迁移进展请在 PROGRESS 与各 Phase 完成后回写对应章节
- 发现文档与源码冲突时，以源码为准并更新文档（遵循 `.agents/` Authority 规则）
