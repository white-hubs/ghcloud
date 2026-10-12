# Fire Host Control API Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Connect the PC remote-control page to ApiFox folder `93223528`, including paged host loading, paged control points, password-aware commands, and asynchronous command status feedback.

**Architecture:** Extend the existing `fire-management` interface and client SDK rather than adding app-local request wrappers. Keep request orchestration in `useFireHostControl`; keep `HostNavigator`, `ControlledDevicePanel`, and `PasswordAuthModal` presentational with typed props/emits.

**Tech Stack:** Vue 3 TSX, `@ghcloud/cube-ui`, `@ghcloud/cube-services-client`, `@ghcloud/cube-service-interface`, Less.

---

## Component map

- `fire-management` interface contracts: single source of truth for six ApiFox endpoints and their request/response models.
- `fire-management.client.ts`: authenticated request construction and response unwrapping only.
- `use-fire-host-control.ts`: host/control-point pagination, current-host switching, password branching, command submission, and point-command polling.
- `host-navigator.tsx`: render loaded hosts and emit `change`/`loadMore` from list scrolling.
- `controlled-device-panel.tsx`: render current control-point state and emit `control`/`loadMore`; never call APIs directly.
- `password-auth-modal.tsx`: collect the configured host control password and expose submitting/error states.
- `fire-device.mock.ts`: deterministic local development responses for the same six endpoint contracts.

### Task 1: Shared service contracts

**Files:**
- Modify: `prod/cube-services/interfaces/src/fire-management/request.ts`
- Modify: `prod/cube-services/interfaces/src/fire-management/response.ts`
- Modify: `prod/cube-services/interfaces/src/fire-management/gateway.ts`

- [x] Add host overview pagination, control-point filters, host command, and point command request types exactly matching ApiFox schemas.
- [x] Add host overview, control-point device, command acknowledgement, and command status response types.
- [x] Add all six methods from folder `93223528` to `FireManagementGateway`.

### Task 2: Client SDK

**Files:**
- Modify: `prod/cube-services/client/src/fire-management.client.ts`

- [x] Add `GET /fireManage/p2/hosts/overview/page` and normalize nested `data` wrappers.
- [x] Add host command submission/status methods.
- [x] Add control-point pagination and point command submission/status methods.

### Task 3: Remote-control orchestration

**Files:**
- Modify: `prod/cube/apps/fire-management/app/src/views/fire-host-control/models.ts`
- Modify: `prod/cube/apps/fire-management/app/src/views/fire-host-control/composables/use-fire-host-control.ts`

- [x] Replace mock host/control-point initialization with authenticated SDK calls.
- [x] Reset control-point pagination when selecting a new host and guard against stale responses.
- [x] Generate stable request IDs, branch on `controlPasswordRequired`, and submit the password only when required.
- [x] Poll point command status until success/failure/timeout and update the card state without reloading the page.

### Task 4: Scroll-loading and password UI

**Files:**
- Modify: `prod/cube/apps/fire-management/app/src/views/fire-host-control/components/host-navigator.tsx`
- Modify: `prod/cube/apps/fire-management/app/src/views/fire-host-control/components/controlled-device-panel.tsx`
- Modify: `prod/cube/apps/fire-management/app/src/views/fire-host-control/components/password-auth-modal.tsx`
- Modify: `prod/cube/apps/fire-management/app/src/views/fire-host-control/fire-host-control.tsx`
- Modify: `prod/cube/apps/fire-management/app/src/views/fire-host-control/fire-host-control.module.less`

- [x] Trigger host/control-point next-page requests only when the scroll container approaches its bottom.
- [x] Show initial loading, loading-more, end-of-list, offline, unconfigured, unknown, and command-processing states.
- [x] Disable unsafe controls while a request is pending or the point cannot be controlled.
- [x] Remove demonstration-password copy and bind modal confirmation loading to the real command request.

### Task 5: Local mocks and verification

**Files:**
- Modify: `prod/cube/apps/fire-management/app/src/mocks/fire-device.mock.ts`

- [x] Add contract-shaped mock routes for all six endpoints.
- [x] Exercise host pagination, password-required/optional branches, point commands, and status transitions in local mock mode.
- [x] Run targeted TypeScript diagnostics, Less compilation, focused tests if present, and `git diff --check`; do not run the application build per user preference.
