# UE5 Panel Shell Structure Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将 `prod/cube/apps/ue5/app/src/features/panel-shell` 按视觉职责分组，消除根目录散落文件，并以 `STRUCTURE.md` 固化完整目录边界和放置规则。

**Architecture:** `panel-shell` 只保存跨业务卡片复用、但仍包含面板业务交互的壳层能力。内部按 `templates`、`tables`、`metrics`、`charts`、`media` 五类分组；组件实现、样式和紧邻辅助文件同目录维护，业务域专属组件不通过 `panel-shell` 转发。

**Tech Stack:** Vue 3、TSX、TypeScript、Less CSS Modules、Vite、Bun workspace。

---

### Task 1: 建立目标目录并迁移实现

**Files:**
- Move: `src/features/panel-shell/sub-panel-template.tsx` → `src/features/panel-shell/templates/sub-panel-template/sub-panel-template.tsx`
- Move: `src/features/panel-shell/sub-panel-template.module.less` → 同目录
- Move: `src/features/panel-shell/roll-table/*` → `src/features/panel-shell/tables/roll-table/`
- Move: `src/features/panel-shell/duty-person-list.*` → `src/features/panel-shell/tables/duty-person-list/`
- Move: `src/features/panel-shell/grid-container.*` → `src/features/panel-shell/metrics/grid-container/`
- Move: `src/features/panel-shell/operate-days.*` → `src/features/panel-shell/metrics/operate-days/`
- Move: `src/features/panel-shell/monitor-video-grid/*` → `src/features/panel-shell/media/monitor-video-grid/`
- Rename: `charts/stacked-line/stackedLine.*` → `charts/stacked-line/stacked-line.*`
- Rename: `use-panel-zoom-chart.ts` → `charts/panel-zoom-context.ts`
- Delete: `alarm-table.tsx`、`alarm-table.module.less`、`device-statistics.tsx`

- [ ] **Step 1:** 使用 `apply_patch` 移动实现与样式，保持组件导出名称和运行行为不变。
- [ ] **Step 2:** 将 `roll-table/index.tsx`、`index.module.less`、`scrollParmas.ts` 分别改名为 `roll-table.tsx`、`roll-table.module.less`、`scroll-params.ts`。
- [ ] **Step 3:** 删除无引用 `AlarmTable`，将 `device-statistics` 的两个消费者改为直接引用 `security-overview` 域内组件。

### Task 2: 更新引用并消除迁移残留

**Files:**
- Modify: `src/**/*.ts`
- Modify: `src/**/*.tsx`

- [ ] **Step 1:** 按确定映射机械替换所有 `@/features/panel-shell/*` 旧导入路径。
- [ ] **Step 2:** 修正迁移后暴露的错误相对路径：`noData` 直接引用 `@/shared-ui/panel/noData`，删除 `duty-person-list` 的无效 `fake-user` 导入。
- [ ] **Step 3:** 运行 `rg`，确认旧路径、旧文件名和根目录散落文件均无残留。

### Task 3: 覆盖结构文档

**Files:**
- Modify: `prod/cube/apps/ue5/app/STRUCTURE.md`

- [ ] **Step 1:** 用当前源码覆盖目录树，逐层描述 `application`、`visualization-core`、`features`、`shared-ui`、`infrastructure`、`views` 和资源目录。
- [ ] **Step 2:** 明确 `features` 的五个边界及 `panel-shell` 五类分组依据。
- [ ] **Step 3:** 补充文件放置决策树、依赖方向、命名规则、禁止项和维护清单。

### Task 4: 验证

**Files:**
- Verify: `prod/cube/apps/ue5/app/package.json`

- [ ] **Step 1:** 运行 `bun run check:structure`，预期输出 `UE5 structure boundaries are valid.`。
- [ ] **Step 2:** 运行 `bun run check:no-vue:shell`，预期 shell 范围无 Vue SFC 残留。
- [ ] **Step 3:** 运行 `bun run build:dev`，预期 Vite 构建退出码为 0。
- [ ] **Step 4:** 运行 `git diff --check` 和旧路径残留扫描，预期均无错误。

