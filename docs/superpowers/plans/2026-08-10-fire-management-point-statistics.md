# Fire Management Point Statistics Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the point-statistics list UI and local interactions for both the Fire Management PC and H5 applications while the backend API is unavailable.

**Architecture:** Each client keeps a local typed fixture beside the feature so no temporary backend contract leaks into `cube-services`. Following the user-designated Daily Task list reference, the PC view uses `CubeLayout`, `useCubeForm`, and `useCubeTable` with pagination, URL-backed filters, and ExcelJS export; the H5 view uses Vant filters, pull-to-refresh, incremental loading, and card presentation.

**Tech Stack:** Vue 3 Composition API, Vue TSX, Vue Router 4, `@ghcloud/cube-app-design`, `@ghcloud/cube-ui`, Vant, Less modules, ExcelJS, Bun/Vite.

---

### Task 1: Add typed local point-statistics fixtures

**Files:**
- Create: `prod/cube/apps/fire-management/app/src/views/point-statistics/point-statistics.model.ts`
- Create: `prod/cube/apps/fire-management/h5/src/views/point-statistics/point-statistics.model.ts`

- [ ] **Step 1: Define the record and filter contracts**

  Define `PointStatisticsRecord` with `id`, `pointName`, `pointType`, `area`, `hostId`, `hostName`, `hostCode`, `addressCode`, `alarmCount`, `faultCount`, and `lastTriggered`. Define PC filters as `{ startDate, endDate, pointType, area }` and H5 filters as `{ startDate, endDate, pointType, hostId, keyword }`.

- [ ] **Step 2: Add deterministic fixtures and option lists**

  Add records covering heat, smoke, manual-call-point, and module point types across multiple areas and hosts. Export point-type labels/tones plus area or host options so filters, tables, cards, and Excel use one source of truth per client.

### Task 2: Implement the PC feature state and UI

**Files:**
- Create: `prod/cube/apps/fire-management/app/src/views/point-statistics/point-statistics.module.less`
- Create: `prod/cube/apps/fire-management/app/src/views/point-statistics/point-statistics.tsx`
- Modify: `prod/cube/apps/fire-management/app/src/router/index.ts`

- [ ] **Step 1: Implement URL-backed local filtering and pagination**

  Initialize filters and pagination from `route.query`, map `RangePicker` values through `syncMap`, reset to page one on query, and write active filters/page values through the form cache and `router.replace`. Reject inverted date ranges before applying filters.

- [ ] **Step 2: Build the PC filter and table components**

  Define `useCubeForm` schema entries for the date range, point type, and area. Define `useCubeTable` columns for ranking, point name/type, location, alarm/fault/total counts, and latest trigger with a typed local `fetchApi` and stable row keys.

- [ ] **Step 3: Compose the route page and Excel export**

  Use `CubeLayout` with the title `点位报警/故障频次统计`, an `导出Excel` header action, the filter/table components, and `Page` footer. Export all currently filtered records to a real `.xlsx` workbook and surface success/failure through `message`.

- [ ] **Step 4: Register the PC route**

  Add named route `fire-point-statistics` at `/fire-point-statistics` with lazy loading and `meta.title: "点位统计"`.

### Task 3: Implement the H5 feature state and UI

**Files:**
- Create: `prod/cube/apps/fire-management/h5/src/views/point-statistics/use-point-statistics.ts`
- Create: `prod/cube/apps/fire-management/h5/src/views/point-statistics/point-statistics-filter.tsx`
- Create: `prod/cube/apps/fire-management/h5/src/views/point-statistics/point-statistics-card-list.tsx`
- Create: `prod/cube/apps/fire-management/h5/src/views/point-statistics/point-statistics.module.less`
- Create: `prod/cube/apps/fire-management/h5/src/views/point-statistics/point-statistics.tsx`
- Modify: `prod/cube/apps/fire-management/h5/src/router/index.ts`
- Modify: `prod/cube/apps/fire-management/h5/src/app.tsx`

- [ ] **Step 1: Implement local search, filtering, refresh, and incremental loading**

  Keep applied criteria as the source state, derive matches with `computed`, expose the first five rows initially, append five rows per Vant `List` load, and reset the visible limit during pull-to-refresh or filter changes.

- [ ] **Step 2: Build H5 filters and result cards**

  Render type/host dropdowns, keyword search, and native date controls matching the reference. Render cards with type tone, address code, timestamp, point name, location, host, and alarm/fault totals; emit filter changes upward instead of mutating props.

- [ ] **Step 3: Compose the H5 route page**

  Render a red gradient header with environment-aware back behavior, the filter panel, Vant `PullRefresh`/`List`, empty state, and the point-statistics card list. Keep the route component named `PointStatisticsPage` for cache targeting.

- [ ] **Step 4: Register H5 entry and aliases**

  Make `/entry` render the page, add aliases `/point-statistics` and `/fire-point-statistics`, keep `/` redirecting to `/entry`, and update `KeepAlive` to include `PointStatisticsPage`.

### Task 4: Verify both clients and review scope

**Files:**
- Review: all files listed above

- [ ] **Step 1: Build the PC package**

  Run `bun --cwd prod/cube/apps/fire-management/app run build` and expect exit code `0` with Vite build output.

- [ ] **Step 2: Build the H5 package**

  Run `bun --cwd prod/cube/apps/fire-management/h5 run build` and expect exit code `0` with Vite build output.

- [ ] **Step 3: Review the final diff and working tree**

  Run `git diff --check`, inspect `git diff -- prod/cube/apps/fire-management/app`, and inspect the H5 files explicitly because the H5 package is currently untracked. Confirm that `bun.lock`, `.DS_Store`, auth, service contracts, and unrelated pages were not changed.
