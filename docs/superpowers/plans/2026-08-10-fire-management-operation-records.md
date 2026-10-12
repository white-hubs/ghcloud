# Fire Management Operation Records Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build local-data operation-record list pages and interactions for the Fire Management PC and H5 clients before the backend list API is available.

**Architecture:** Each client keeps a typed fixture model beside the feature. The PC page uses `CubeLayout`, `useCubeForm`, and `useCubeTable` for URL-backed filtering, pagination, centered title, result rendering, and Excel export; the H5 feature separates the filter, card list, route composition, and stateful filtering/loading composable.

**Tech Stack:** Vue 3 Composition API, Vue TSX, Vue Router 4, `@ghcloud/cube-app-design`, `@ghcloud/cube-ui`, Vant, Less modules, ExcelJS, Bun/Vite.

---

### Task 1: Add operation-record fixtures and contracts

**Files:**
- Create: `prod/cube/apps/fire-management/app/src/views/operation-records/operation-records.model.ts`
- Create: `prod/cube/apps/fire-management/h5/src/views/operation-records/operation-records.model.ts`

- [ ] **Step 1: Define typed records and filters**

  Define host, operator, operation type, content, result, failure reason, and operation time fields. Define filters for host, type, result, operator keyword, and date range.

- [ ] **Step 2: Add deterministic records and options**

  Add sixteen descending records covering control buttons, bus panels, multi-line panels, successful results, and failed results. Derive host/type/result options from shared labels.

### Task 2: Implement the PC operation-record page

**Files:**
- Create: `prod/cube/apps/fire-management/app/src/views/operation-records/operation-records.tsx`
- Create: `prod/cube/apps/fire-management/app/src/views/operation-records/operation-records.module.less`
- Modify: `prod/cube/apps/fire-management/app/src/router/index.ts`

- [ ] **Step 1: Implement URL-restorable filtering and pagination**

  Normalize form/query values, filter the local records by all criteria, reject inverted dates, reset to page one on submit/reset, and query through `useCubeTable` after URL hydration.

- [ ] **Step 2: Render the platform table and export**

  Render time, host, operator, operation type, operation content, and result columns. Keep rows neutral, color only compact semantic tags/text, center the title without moving the right-side Excel action, and export all filtered rows.

- [ ] **Step 3: Register the PC route**

  Add `/fire-operation-records` with the named component `OperationRecords` and title `操作记录`.

### Task 3: Implement the H5 operation-record page

**Files:**
- Create: `prod/cube/apps/fire-management/h5/src/views/operation-records/use-operation-records.ts`
- Create: `prod/cube/apps/fire-management/h5/src/views/operation-records/operation-records-filter.tsx`
- Create: `prod/cube/apps/fire-management/h5/src/views/operation-records/operation-records-card-list.tsx`
- Create: `prod/cube/apps/fire-management/h5/src/views/operation-records/operation-records.tsx`
- Create: `prod/cube/apps/fire-management/h5/src/views/operation-records/operation-records.module.less`
- Modify: `prod/cube/apps/fire-management/h5/src/router/index.ts`
- Modify: `prod/cube/apps/fire-management/h5/src/app.tsx`

- [ ] **Step 1: Implement composable state and derived lists**

  Keep filters as the only mutable source, derive filtered and visible records with `computed`, and expose explicit actions for filter application, pull refresh, and incremental loading.

- [ ] **Step 2: Build independent filters and neutral cards**

  Render independent type/result and host/operator controls plus date inputs. Cards show content, time, operator, type, semantic result, host, and optional failure reason without colored left bars.

- [ ] **Step 3: Compose and register the H5 route**

  Use centered `CubeNavBar`, result summary, Vant `PullRefresh`/`List`, and empty state. Register `/fire-operation-records` with `/operation-records` alias and add `OperationRecordsPage` to `KeepAlive`.

### Task 4: Verify scope without repeated builds

**Files:**
- Review: all files above

- [ ] **Step 1: Run focused static checks**

  Run `git diff --check`, verify record counts, routes, named exports, neutral-row CSS, Vue JSX attributes, and filter/field consistency. Do not run a package build unless requested, preserving the user's incremental workflow preference.
