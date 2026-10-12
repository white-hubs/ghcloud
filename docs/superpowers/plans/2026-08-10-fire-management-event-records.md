# Fire Management Event Records Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build interactive local-data event-record list pages for the Fire Management PC and H5 applications while the list backend is unavailable.

**Architecture:** Each client owns a typed fixture model beside the page so provisional UI fields do not change shared service contracts. The PC page composes `CubeLayout`, `useCubeForm`, and `useCubeTable` with URL-restorable filters, pagination, row tones, and Excel export; the H5 route composes a typed filter component, a presentational card list, and a stateful composable for filtering, refresh, and incremental loading.

**Tech Stack:** Vue 3 Composition API, Vue TSX, Vue Router 4, `@ghcloud/cube-app-design`, `@ghcloud/cube-ui`, Vant, Less modules, ExcelJS, Bun/Vite.

---

### Task 1: Add typed event-record fixtures

**Files:**
- Create: `prod/cube/apps/fire-management/app/src/views/event-records/event-records.model.ts`
- Create: `prod/cube/apps/fire-management/h5/src/views/event-records/event-records.model.ts`

- [ ] **Step 1: Define records, filters, labels, and options**

  Define event categories `fire`, `fault`, `warning`, and `supervision`; records include host, circuit, address, code, point name, location, and event time. Export deterministic host/type options and default dates.

- [ ] **Step 2: Add representative fixtures**

  Add records across multiple event categories, hosts, circuits, addresses, dates, and locations so every filter and visual tone can be exercised without a backend.

### Task 2: Implement the PC list page

**Files:**
- Create: `prod/cube/apps/fire-management/app/src/views/event-records/event-records.tsx`
- Create: `prod/cube/apps/fire-management/app/src/views/event-records/event-records.module.less`
- Modify: `prod/cube/apps/fire-management/app/src/router/index.ts`

- [ ] **Step 1: Implement local filtering and URL restoration**

  Initialize page state from route query, normalize `useCubeForm` values through `syncMap`, reject inverted date ranges, reset pagination on submit/reset, and let `useCubeForm` restore query state before the table query.

- [ ] **Step 2: Build the Cube form and table**

  Use independent host/type/circuit/address/code/location/date fields. Use `useCubeTable` for category, host, circuit, address, code, event time, and location columns with stable row keys and category-specific row styling.

- [ ] **Step 3: Add pagination and Excel export**

  Page the currently filtered fixture rows, export the full filtered result set to `.xlsx`, and surface export success/failure through `message`.

- [ ] **Step 4: Register `/fire-event-records`**

  Add a lazy named route with `meta.title: "事件记录"`.

### Task 3: Implement the H5 list page

**Files:**
- Create: `prod/cube/apps/fire-management/h5/src/views/event-records/use-event-records.ts`
- Create: `prod/cube/apps/fire-management/h5/src/views/event-records/event-records-filter.tsx`
- Create: `prod/cube/apps/fire-management/h5/src/views/event-records/event-records-card-list.tsx`
- Create: `prod/cube/apps/fire-management/h5/src/views/event-records/event-records.tsx`
- Create: `prod/cube/apps/fire-management/h5/src/views/event-records/event-records.module.less`
- Modify: `prod/cube/apps/fire-management/h5/src/router/index.ts`

- [ ] **Step 1: Implement the feature composable**

  Keep applied filters as the only mutable source, derive filtered and visible rows with `computed`, and expose typed actions for apply, pull refresh, and incremental loading.

- [ ] **Step 2: Build explicit filter and card contracts**

  The filter receives initial values and emits valid filter snapshots; the card list receives records only. Render independent event-type/host dropdown boxes, keyword search, date controls, category tag, address code, time, point name, location, and host.

- [ ] **Step 3: Compose and route the H5 page**

  Use `CubeNavBar`, Vant `PullRefresh`/`List`, an event count summary, and an empty state. Register aliases `/event-records` and `/fire-event-records` without changing the current `/entry` point-statistics page.

### Task 4: Verify the implementation

**Files:**
- Review: all event-record files and both router files

- [ ] **Step 1: Run targeted package verification**

  Read package scripts, run `git diff --check`, then run one final `build` for each affected package after implementation rather than rebuilding after each edit.

- [ ] **Step 2: Review scope and contracts**

  Confirm routes resolve to the named exports, fixtures exercise all category styles, form/table fields match the models, H5 child components do not mutate props, and unrelated `bun.lock` changes remain untouched.
