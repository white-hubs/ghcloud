# Fire Management OpenAPI Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace every production-page fake data source in the Fire Management application with a matching endpoint from the supplied OpenAPI specification, and explicitly retain only features without an API contract.

**Architecture:** Extend the existing `fire-management` interface and client SDK with the OpenAPI utility-monitor endpoints. Existing list pages consume the SDK through `useAuthRequest`; the remote-control composable owns host-scoped loading and mutation state. No app-local HTTP wrappers or fabricated fallback records are introduced.

**Tech Stack:** Vue 3 TSX, `@ghcloud/cube-app-design`, `@ghcloud/cube-ui`, `@ghcloud/cube-services-client`, `@ghcloud/cube-service-interface`, Less.

---

## Component map

- `interfaces/src/fire-management/{request,response,gateway}.ts`: source-of-truth types and gateway signatures for utility-monitor cards, candidates, properties, panel configuration, and ranges.
- `client/src/fire-management.client.ts`: authenticated endpoint calls and response unwrapping.
- `views/fire-host-control/composables/use-fire-host-control.ts`: host events and utility-monitor cards/configuration/candidates/ranges.
- `views/{event-records,operation-records,point-statistics}`: convert static table records and static host options to paged SDK calls.
- `views/fire-host-control/attendance-*` and `use-floor-map.ts`: remain empty/disabled until a matching API is supplied; no static records remain.

### Task 1: Service contracts and client

**Files:**
- Modify: `prod/cube-services/interfaces/src/fire-management/request.ts`
- Modify: `prod/cube-services/interfaces/src/fire-management/response.ts`
- Modify: `prod/cube-services/interfaces/src/fire-management/gateway.ts`
- Modify: `prod/cube-services/client/src/fire-management.client.ts`

- [x] Add the request/response models from `/fireManage/p2/hosts/{hostId}/utility-monitor/*`.
- [x] Add typed SDK calls for cards, candidate pagination, association save/remove, properties, range update, panel load/save/reset.
- [ ] Verify signatures with `bun --cwd prod/cube-services/interfaces run build` when the package exposes a build script, then build the application.

### Task 2: Remote-control real-time data

**Files:**
- Modify: `prod/cube/apps/fire-management/app/src/views/fire-host-control/models.ts`
- Modify: `prod/cube/apps/fire-management/app/src/views/fire-host-control/composables/use-fire-host-control.ts`
- Modify: `prod/cube/apps/fire-management/app/src/views/fire-host-control/components/attendance-panel.tsx`

- [x] Replace mock events with `listEvents` scoped to the selected host and map event coordinates from the API response.
- [x] Replace water/electric metrics and candidate records with host-scoped utility-monitor SDK results.
- [x] Persist association, selected monitor property, and range edits with the supplied endpoints, then reload cards.
- [x] Remove attendance mock records and present an explicit empty state because no attendance endpoint exists in the specification.

### Task 3: Static record pages

**Files:**
- Modify: `prod/cube/apps/fire-management/app/src/views/event-records/event-records.tsx`
- Modify: `prod/cube/apps/fire-management/app/src/views/event-records/event-records.model.ts`
- Modify: `prod/cube/apps/fire-management/app/src/views/operation-records/operation-records.tsx`
- Modify: `prod/cube/apps/fire-management/app/src/views/operation-records/operation-records.model.ts`
- Modify: `prod/cube/apps/fire-management/app/src/views/point-statistics/point-statistics.tsx`
- Modify: `prod/cube/apps/fire-management/app/src/views/point-statistics/point-statistics.model.ts`

- [x] Replace event, operation-log, and point-statistics arrays with their matching paged SDK calls.
- [x] Load host filter options from the host overview endpoint rather than the static record arrays.
- [ ] Keep category labels and filter option constants only where they are display metadata, not fabricated business records.

### Task 4: Evidence and gap report

**Files:**
- Modify: only files changed above; do not edit generated `dist/`.

- [x] Run the Fire Management app build and `git diff --check`.
- [ ] Report API gaps: attendance supervision actions/data, floor-map image source, and any OpenAPI endpoint whose response lacks UI-required fields.
