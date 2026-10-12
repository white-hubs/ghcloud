# UE5 迁移进度记录

> **维护规则**：每完成一步（或一个可验收子任务），在本文件对应 Phase 下更新「已完成」与「待补充」，并更新文末「当前状态摘要」的日期。
>
> 分期定义见 [`docs/03-migration-plan.md`](./docs/03-migration-plan.md)。

---

## 当前状态摘要

| 项 | 值 |
|---|---|
| **当前阶段** | 五边界目录重构完成 — Phase 1 standalone 切流验收待做；Phase 5 qiankun 已规划 |
| **最后更新** | 2026-08-03 |
| **应用版本** | `@ghcloud/cube-ue5-app` v0.1.0 |
| **构建状态** | `bun run build:dev` ✅ 通过（需 8GB heap） |
| **零 `.vue`** | `bun run check:no-vue` ✅ 通过 |
| **壳层零 `.vue`** | `bun run check:no-vue:shell` ✅ 通过 |
| **目录结构** | [`app/STRUCTURE.md`](./app/STRUCTURE.md) 已落地 |
| **改造总结** | [`docs/05-migration-transformation.md`](./docs/05-migration-transformation.md) |
| **E2E 联调** | ⬜ 未验收（bimops SSO、三种 renderType） |
| **生产路径** | 仍走 `/apps-legacy/ue5`，新路径 `/ue5` 未切换 |

---

## Phase 0 — 文档与基线 ✅ 已完成

### 已完成

- [x] [`README.md`](./README.md) — 入口、术语、阅读顺序、关键决策
- [x] [`docs/01-current-architecture.md`](./docs/01-current-architecture.md) — legacy 现状梳理
- [x] [`docs/02-target-architecture.md`](./docs/02-target-architecture.md) — 目标 TSX 架构 + 双模式集成（2026-07 更新）
- [x] [`docs/03-migration-plan.md`](./docs/03-migration-plan.md) — Phase 0–5 分期与验收标准
- [x] [`docs/04-module-inventory.md`](./docs/04-module-inventory.md) — 104 域清单、依赖映射
- [x] [`legacy/ue5-migrate/docs/`](../../../../legacy/ue5-migrate/docs/README.md) — legacy 源码深度梳理三文档（运转逻辑 / 项目结构 / P0–P3 优化）
- [x] 确认集成方式：**standalone 新窗口 + qiankun 子应用双模式**（2026-07 计划调整；qiankun Phase 5 暂不开发）
- [x] 确认路径策略：`/apps-legacy/ue5` → `/ue5` 灰度并行

### 待补充

- [ ] 无（Phase 0 交付物齐全；后续仅在架构变更时回写文档）

---

## Stage A/B/C — 全 TSX + 目录简化 ✅ 主体完成

> 分期定义见 [`docs/03-migration-plan.md`](./docs/03-migration-plan.md) § Stage A/B/C/D；目录权威说明见 [`app/STRUCTURE.md`](./app/STRUCTURE.md)。

### Stage A — 目录重组 + 文档 ✅

- [x] 新建 [`app/STRUCTURE.md`](./app/STRUCTURE.md)
- [x] `pages/` → `widgets/`、`model-sdk/`、`event/`、`stores/`、`config/`
- [x] `components/businessPanel/` → `cards/`；`public/` → `shared/panel/`
- [x] `equipment*` / `alarm*` → `equipment/`；`login/` → `views/login/`
- [x] 删除 template 死代码（`views/showcase`、`views/demo-*`、`mocks/`、`App.vue`）
- [x] 保留 `src/mock/`（卡片 demo 数据，非 template mocks）
- [x] 收敛为 `application` / `visualization-core` / `features` / `shared-ui` / `infrastructure` 五个职责边界，并增加 `check:structure`

### Stage B — 壳层零 `.vue` ✅（切流 E2E 待验收）

- [x] `shared/panel/` 全部 TSX 化（~78 个 public 组件）
- [x] `views/login/index.tsx`、`equipment/`、`base-panel-render` TSX 化
- [x] 删除 legacy shell `.vue`（`views-*` 等）
- [x] CI 脚本：`check:no-vue:shell`、`check:no-vue`（`app/package.json`）
- [ ] `/ue5` bimops SSO + renderType E2E（见 Phase 1 待补充）

### Stage C — 卡片域 TSX 化 ✅（register 拆分进行中）

- [x] 全仓 **964+** 卡片/组件 `.vue` → `.tsx`（`find src -name '*.vue'` → 0）
- [x] `cards/_register/overview.ts`、`security-overview.ts`、`universal-panel.ts` 拆分
- [x] `cards/_register/card-register.ts` 聚合 + `index.ts` re-export
- [ ] 其余域 register 继续按 [`04-module-inventory.md`](./docs/04-module-inventory.md) 拆分（长尾）

### 卡片域 checklist（C1 已完成 TSX 化）

| 域 | TSX | register 拆分 | 备注 |
|---|---|---|---|
| `overview` | ✅ | ✅ `_register/overview.ts` | P0 首屏 |
| `security-overview` | ✅ | ✅ `_register/security-overview.ts` | P0 |
| `universal-panel` | ✅ | ✅ `_register/universal-panel.ts` | P0 |
| 其余 101 域 | ✅ TSX | ⬜ 仍在 `card-register.ts` | 按 Phase 2 优先级继续拆分 |

---

## Phase 1 — 壳层迁移 🔄 进行中

### 已完成

#### 工程 scaffold

- [x] 创建 [`app/`](./app/)（`@ghcloud/cube-ue5-app` v0.1.0）
- [x] `vite.config.ts` — Vue + TSX、legacy proxy、`/resource/v1/` external、postcss-pxtorem
- [x] `index.html` — 挂载 `#Ue5`、`public/config.js` 注入
- [x] `.env.example` — `PUBLIC_PATH=/ue5`、`VITE_BASE_API`
- [x] [`app/readme.md`](./app/readme.md) — 本地开发与构建说明
- [x] `bun install` + lockfile 更新

#### 源码迁移

- [x] 完整同步 `legacy/ue5-migrate/src` → `app/src`（pages、components/businessPanel、api、utils 等）
- [x] 同步 `legacy/ue5-migrate/public` 静态资源
- [x] 目录扁平化：`pages/` 已删除，迁入 `widgets/`、`stores/`、`config/` 等（见 [`STRUCTURE.md`](./app/STRUCTURE.md)）
- [x] 默认入口：`views/visualization/index.tsx`（Refactored Shell）
- [x] 路由简化为 `/`（name: `home`）+ `/login`

#### 入口与鉴权优化

- [x] [`app/src/main.ts`](./app/src/main.ts) — standalone 启动，无 qiankun
- [x] [`app/src/application/auth/session.ts`](./app/src/application/auth/session.ts) — `cube-secret` / `access_token` SSO
- [x] [`app/src/application/auth/auth-store.ts`](./app/src/application/auth/auth-store.ts) — 终端 `VISUALIZATION`
- [x] [`app/src/application/config/config-loader.ts`](./app/src/application/config/config-loader.ts) — 改用 `getSessionAuth()`，去除 ConfigLoader 对 mf-root 的硬依赖
- [x] [`app/src/application/bootstrap/viewport-scale.ts`](./app/src/application/bootstrap/viewport-scale.ts) — 大屏 scale 适配
- [x] [`app/src/views/visualization/index.tsx`](./app/src/views/visualization/index.tsx) — 主可视化壳层

#### 构建验证

- [x] `bun run build:dev` 通过（全 TSX 改造后 ~6200+ modules）
- [x] `bun run check:no-vue` / `check:no-vue:shell` 通过

### 待补充

#### P0 — 阻塞上线验收

- [ ] **本地 dev 联调**：`bun run dev` + 真实后端，验证登录 / cube-secret 进入可视化页
- [ ] **SSO E2E**：bimops `openUrlInNewWindow` → `/ue5?cube-secret=...` 完整链路
- [ ] **renderType E2E**：至少一种租户（UE5 / WEBGL / GIS）模型加载 → 面板 → 事件联动
- [ ] **nginx 配置**：新增 `/ue5` 指向新构建产物（可与 legacy 并行灰度）
- [ ] **bimops 路径切换**：[`choose-terminal-dropdown.vue`](../../../../legacy/bimops-fe-web-migrate/src/components/NavTopLink/components/choose-terminal-dropdown/choose-terminal-dropdown.vue) `/apps-legacy/ue5` → `/ue5`

#### P1 — 工程清理（Phase 1 内可完成）

- [ ] 删除模板残留（`src/views/demo-*`、`src/views/showcase`、`src/mocks` 等未使用文件）
- [ ] 目录重组（按目标架构逐步进行，非阻塞）：
  - [ ] `pages/widget/` → `widgets/`
  - [ ] `pages/state/` → `stores/`
  - [ ] `pages/model-sdk/` → `model-sdk/`
  - [ ] `pages/event/` → `event/`
  - [ ] `pages/config-loader.ts` → `config/config-loader.ts`
- [ ] 登录页改造：legacy `login/index.vue` → TSX + `session.ts` 的 `loginByMainMode`（当前仍用 legacy 登录逻辑）
- [ ] `initGlobalState()` 仍依赖 `@ghcloud/cube-mf-root` — 评估是否进一步解耦
- [ ] HTTP 层：存量 `src/api/` axios 直调尚未统一为 `authRequest` + services-client
- [ ] 移除 `@ghcloud/generic-component` 依赖（ADR-0005，Phase 2 随卡片迁移）

#### Phase 1 验收清单（来自迁移计划）

- [ ] bimops 新窗口打开 `/ue5?cube-secret=...` 完成 SSO
- [ ] 至少一种 renderType E2E 通过
- [ ] title-bar / business-nav / 左右面板 slot 正常
- [ ] 构建产物 nginx 可部署访问

---

## Phase 2 — 卡片与面板 🔄 进行中

### 已完成

- [x] 全仓 `.vue` → `.tsx`（Stage C）
- [x] P0 域 register 拆分：`overview`、`security-overview`、`universal-panel`
- [x] `card-register` ↔ `cube-visual-sdk` 协议保持不变（仅实现格式变更）

### 待补充

- [ ] 按 [`docs/04-module-inventory.md`](./docs/04-module-inventory.md) 继续拆分其余域 register
- [ ] P1 域 smoke：`command-dispatch-v2`、`parking-car`、`people-flow`、`energy-consumption`、`triage-queue`
- [ ] P2 域：`pz-demo`、`zhongda-heshun` 等大域 register 拆分

---

## Phase 3 — 租户特例与 2D ⬜ 未开始

### 已完成

- （无）

### 待补充

- [ ] `views-2d` → `views/scada-2d/index.tsx`（11 文件）
- [ ] `views-shengNong` — 评估合并 [`legacy/ue5-sn-migrate`](../../../../legacy/ue5-sn-migrate) 或独立 `apps/ue5-sn`
- [ ] `views-3d` 变体 — 评估合并进 `views/visualization` 或废弃
- [ ] 删除 dynamic `window.config.entry` 机制（当前 ConfigLoader 仍写 entry）

---

## Phase 4 — 清理与优化 ⬜ 未开始

### 已完成

- （无）

### 待补充

- [ ] 下线 `legacy/ue5-migrate` 默认入口与 nginx `/apps-legacy/ue5`
- [ ] 删除 Legacy Shell（`views/index.vue` 等双轨代码）
- [ ] 构建优化：拆 chunk，目标 CI ≤4GB heap（当前 8GB）
- [ ] TypeScript `"strict": true`（当前 `false`）
- [ ] 清理 `public/config.js` 明文 JWT 等敏感信息
- [ ] 归档 legacy `项目目录文件说明.md`，以本文档集为准

---

## Phase 5 — Qiankun 子应用集成 ⬜ 未开始（2026-07 计划新增）

> 产品需求由「仅 standalone」调整为「standalone + qiankun 双模式」。**当前不做代码改造**，仅文档规划。

### 待补充

- [ ] 恢复 `vite-plugin-qiankun`，`qiankunAppBase = "/portal/ue5"`
- [ ] `main.ts` 双模式：`renderWithQiankun` + standalone 直挂
- [ ] `bootstrapAuth(props)` 支持主应用 auth 透传
- [ ] bimops / portal 微应用注册与菜单「内嵌打开」
- [ ] 内嵌模式 E2E：auth、3D/2D 主链路、unmount 资源释放

详见 [03-migration-plan.md §Phase 5](./docs/03-migration-plan.md)、[02-target-architecture.md §3](./docs/02-target-architecture.md)、[05-migration-transformation.md §3.2](./docs/05-migration-transformation.md)。

---

## 步骤完成记录（changelog）

| 日期 | 步骤 | 完成内容 | 下一步 |
|---|---|---|---|
| 2026-08-03 | 结构边界重构 | 迁移五个职责边界、修正源码与 Less 导入、将顶层目录说明统一收敛至 `STRUCTURE.md`；`check:structure` 与 `build:dev` 通过 | 修复存量 CSS 警告与 SSO E2E |
| 2026-07-27 | 计划调整 | 集成方式扩展为 standalone + qiankun 双模式；更新 02/03/05/README/PROGRESS；**暂不开发 Phase 5** | standalone 切流验收；TSX 运行时修复 |
| 2026-07-24 | Phase 1.1 | scaffold `apps/ue5/app`，配置 standalone vite/package | 迁移 legacy 源码 |
| 2026-07-24 | Phase 1.2 | 完整同步 legacy src + public，切换默认入口为 `pages/index.tsx` | 鉴权与 ConfigLoader 优化 |
| 2026-07-24 | Phase 1.3 | `session.ts` + ConfigLoader 去 mf-root 硬依赖 + 路由 `/`+`/login` | 构建验证 |
| 2026-07-24 | Stage A–C | 目录扁平化 + 零 `.vue` + `build:dev` 通过；C1 register 拆分 | `/ue5` E2E 切流验收 |
| 2026-07-24 | Phase 0+ | legacy 三文档深度梳理（[`legacy/ue5-migrate/docs/`](../../../../legacy/ue5-migrate/docs/README.md)） | 优化项见 [`03-optimization.md`](../../../../legacy/ue5-migrate/docs/03-optimization.md) 附录 A |

---

## 如何更新本文档

完成任意子任务后：

1. 在对应 Phase 的「已完成」中追加 `- [x] ...` 条目
2. 从「待补充」中移除或标记已完成项
3. 更新「当前状态摘要」日期与状态
4. 在「步骤完成记录」表格追加一行

示例：

```markdown
| 2026-07-25 | Phase 1.5 | nginx `/ue5` 配置完成，bimops 路径已切换 | dev SSO E2E 验收 |
```
