# @ghcloud/cube-ue5-app

三维可视化 standalone SPA，从 `legacy/ue5-migrate` 迁移至 Cube apps 工程。

## 快速开始

```bash
cd prod/cube/apps/ue5/app
bun install
bun run dev                # --mode dev，读取 .env + .env.dev
# http://localhost:8098/ue5/login
```

环境变量以 `.env.example` 为提交模板，本地或部署环境按 mode 提供实际值。构建命令 `build:dev` / `build:test` / `build:prod` / `build:cnp` 分别加载对应 mode，应用基础路径为 `/ue5`。

## 与 legacy 的差异（Phase 1）

| 项 | legacy | 本应用 |
|---|---|---|
| 路径 | `/apps-legacy/ue5` | `/ue5` |
| 默认入口 | `views/index.vue`（Legacy Shell） | `views/visualization/index.tsx`（TSX Shell） |
| 鉴权 | `CubeMfRootGlobalState` 直读 | `cube-secret` URL + `application/auth/session.ts` |
| ConfigLoader | 依赖 mf-root auth | 使用 `getSessionAuth()` |
| qiankun | 无（legacy / 当前 app） | **Phase 5**：`/portal/ue5` 子应用内嵌 |

## 目录说明

- `src/application/` — 鉴权、路由、配置、bootstrap 与宿主运行时。
- `src/visualization-core/` — ModelSDK、场景动作、事件、Pinia 状态与可视化 hooks。
- `src/features/` — 业务卡片、设备能力、标题栏/导航/弹窗和面板注册。
- `src/shared-ui/` — 不依赖具体业务的展示组件与图表基础件。
- `src/infrastructure/` — 存量 API、Service、socket、RTC 和第三方适配。
- `src/views/` — 登录和主可视化路由组合页。

所有顶层目录的职责、关键内容、依赖方向与新增代码路由统一见 [`STRUCTURE.md`](./STRUCTURE.md)。

## 构建

```bash
bun run build:dev   # 开发环境构建
bun run build:prod  # 生产环境构建
```

构建需 8GB heap（卡片体量大，Phase 4 优化目标 ≤4GB）。

## 文档

- 迁移进度（每步更新）：[`../PROGRESS.md`](../PROGRESS.md)
- 总体规划：[`../docs/`](../docs/) 与 [`../README.md`](../README.md)
