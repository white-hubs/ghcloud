# UE5 Boundary Refactor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将 `prod/cube/apps/ue5/app` 从迁移期技术目录收敛为 application、visualization-core、features、shared-ui、infrastructure 五个明确边界，并在 app 顶层提供统一的 Markdown 结构说明。

**Architecture:** 保留 `src/main.ts`、`src/app.ts`、`src/app.tsx` 和 `src/views` 作为 Cube 应用入口与路由组合面。现有实现按职责整体移动，第一阶段只改变物理位置和 import，不改业务行为；通过残留引用扫描和构建验证保证迁移闭合。

**Tech Stack:** Vue 3、Vue JSX/TSX、Pinia、Vue Router、Vite、Bun workspace。

---

### Task 1: 建立边界目录

**Files:**
- Move: `prod/cube/apps/ue5/app/src/bootstrap` → `src/application/bootstrap`
- Move: `prod/cube/apps/ue5/app/src/config` → `src/application/config`
- Move: `prod/cube/apps/ue5/app/src/permission` → `src/application/permission`
- Move: `prod/cube/apps/ue5/app/src/router` → `src/application/router`
- Move: `prod/cube/apps/ue5/app/src/api/auth-store.ts`、`session.ts` → `src/application/auth/`
- Move: `prod/cube/apps/ue5/app/src/ai`、`event`、`hooks`、`model-sdk`、`stores` → `src/visualization-core/`
- Move: `prod/cube/apps/ue5/app/src/cards`、`equipment`、`widgets` → `src/features/`
- Move: `prod/cube/apps/ue5/app/src/shared` → `src/shared-ui`
- Move: 剩余 `src/api`、`service`、`globalState.ts` 和有副作用的通信工具 → `src/infrastructure/`

- [x] **Step 1: 建立目标目录并使用 Git 感知移动保留历史**

Run: `git mv <source> <target>`，逐个移动上方列出的目录。

- [x] **Step 2: 验证旧一级职责目录已经清空**

Run: `find prod/cube/apps/ue5/app/src -maxdepth 1 -mindepth 1 -type d | sort`

Expected: 业务源码只剩 `application`、`visualization-core`、`features`、`shared-ui`、`infrastructure`、`views` 以及应用级资源目录。

### Task 2: 修正导入与入口装配

**Files:**
- Modify: `prod/cube/apps/ue5/app/src/**/*.ts`
- Modify: `prod/cube/apps/ue5/app/src/**/*.tsx`
- Modify: `prod/cube/apps/ue5/app/tsconfig.json`

- [x] **Step 1: 按完整旧前缀替换 `@/` 导入**

Mappings:

```text
@/api/auth-store   -> @/application/auth/auth-store
@/api/session      -> @/application/auth/session
@/bootstrap        -> @/application/bootstrap
@/config           -> @/application/config
@/permission       -> @/application/permission
@/router           -> @/application/router
@/ai               -> @/visualization-core/ai
@/event            -> @/visualization-core/event
@/hooks            -> @/visualization-core/hooks
@/model-sdk        -> @/visualization-core/model-sdk
@/stores           -> @/visualization-core/stores
@/cards            -> @/features/cards
@/equipment        -> @/features/equipment
@/widgets          -> @/features/widgets
@/shared           -> @/shared-ui
@/api              -> @/infrastructure/api
@/service          -> @/infrastructure/service
@/globalState      -> @/infrastructure/global-state
```

- [x] **Step 2: 修正相对导入和根入口导入**

检查 `main.ts`、`app.ts`、`app.tsx`、application router/config/auth，以及被拆开的 API 模块，确保相对路径不跨错边界。

- [x] **Step 3: 扫描旧路径残留**

Run: `rg "@/(api|bootstrap|config|permission|router|ai|event|hooks|model-sdk|stores|cards|equipment|widgets|shared|service|globalState)(/|['\"])" prod/cube/apps/ue5/app/src`

Expected: 无旧前缀引用。

### Task 3: 固化结构文档

**Files:**
- Modify: `prod/cube/apps/ue5/app/STRUCTURE.md`
- Modify: `prod/cube/apps/ue5/app/readme.md`

- [x] **Step 1: 重写 `STRUCTURE.md` 为当前结构权威索引**

内容包含边界原则、允许依赖方向、目录树、迁移映射和新增代码路由规则。

- [x] **Step 2: 将所有一级职责目录说明合并到 `STRUCTURE.md`**

统一文档包含每个目录的职责、当前子目录、允许依赖、禁止依赖、关键入口和维护建议，删除重复的逐目录文档。

- [x] **Step 3: 更新 README 的旧路径**

删除 `pages/` 等已失效描述，并链接统一结构文档。

### Task 4: 验证重构

**Files:**
- Verify: `prod/cube/apps/ue5/app/src/**/*`
- Verify: `prod/cube/apps/ue5/app/*.md`

- [x] **Step 1: 检查不存在的旧路径和断链导入**

Run: `rg` 残留扫描，并检查所有 `@/` 导入目标是否存在。

- [x] **Step 2: 检查零 Vue 文件事实**

Run: `find prod/cube/apps/ue5/app/src -name '*.vue' | wc -l`

Expected: `0`。

- [x] **Step 3: 运行目标包构建**

Run: `bun --cwd prod/cube/apps/ue5/app run build:dev`

Expected: Vite 构建退出码为 0。若工具链本身失败，记录完整错误，不声称通过。

- [x] **Step 4: 审核变更范围**

Run: `git diff --stat -- prod/cube/apps/ue5/app docs/superpowers/plans/2026-08-03-ue5-boundary-refactor.md`

Expected: 变更仅覆盖 UE5 app 结构、相应文档和本计划；用户已有 `.env` 删除保持不变。
