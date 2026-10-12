# Fire Host Control Component Refactor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将消防主机远程控制路由页拆成可独立理解、维护和后续接入接口的领域组合逻辑、展示面板与弹窗组件，同时保持当前页面功能和交互不变。

**Architecture:** 路由页只保留 `CubeLayout`、页签和组件装配；`useFireHostControl` 负责主机、视频、点位、事件、日志、消防用水和指令鉴权，`useFloorMap` 负责位置树、平面图和点位定位。所有 UI 区块使用 typed props/events，弹窗各自拥有独立文件，不直接修改父级状态。

**Tech Stack:** Vue 3 Composition API、Vue TSX、TypeScript、`@ghcloud/cube-app-design`、`@ghcloud/cube-ui`、`@ghcloud/cube-services-client`。

---

## Component map

- `fire-host-control.tsx`：路由级组合面，只装配布局、页签、面板和弹窗。
- `models.ts`：集中维护页面视图模型和组件事件载荷类型。
- `composables/use-fire-host-control.ts`：远程控制页数据加载、设备动作、控制密码和生命周期副作用。
- `composables/use-floor-map.ts`：区域树匹配、平面图加载、图片坐标换算和 ResizeObserver 生命周期。
- `components/host-status-bar.tsx`：展示当前主机并通过 `changeHost`、`openEvents`、`openLogs` 上抛动作。
- `components/monitor-video-panel.tsx`：展示绑定视频并通过 `toggleFullscreen` 上抛全屏动作。
- `components/host-signal-panel.tsx`：纯展示主机状态灯。
- `components/recent-events-panel.tsx`：展示最近事件并通过 `locate`、`openAll` 上抛动作。
- `components/control-button-panel.tsx`：渲染 18 个控制按钮并通过 `control` 上抛指令载荷。
- `components/controlled-device-panel.tsx`：管理总线盘/多线盘展示页签并通过 `start`、`stop` 上抛设备动作。
- `components/water-monitor-panel.tsx`：纯展示消防用水传感器卡片。
- `components/password-auth-modal.tsx`：控制密码输入、显隐切换、错误和危险提示；通过 `confirm`、`cancel`、`updatePassword` 通信。
- `components/event-records-modal.tsx`：事件记录表格弹窗。
- `components/operation-log-modal.tsx`：远程操作审计日志弹窗。
- `components/floor-map-modal.tsx`：平面图、点位标记和加载态弹窗。

### Task 1: Extract contracts and domain state

**Files:**
- Create: `prod/cube/apps/fire-management/app/src/views/fire-host-control/models.ts`
- Create: `prod/cube/apps/fire-management/app/src/views/fire-host-control/composables/use-fire-host-control.ts`
- Create: `prod/cube/apps/fire-management/app/src/views/fire-host-control/composables/use-floor-map.ts`

- [x] **Step 1: Define typed view contracts**

Define `FireHostOption`, `ControlDevice`, `FireEventViewModel`, `FloorMapPoint`, `ControlAction` and floor-map image rectangle contracts. Keep service response translation at the composable boundary.

- [x] **Step 2: Move data and side effects into composables**

Move all service calls, watchers, timers and mount/unmount cleanup without changing request payloads or user messages. Return state plus named actions; do not expose hidden component refs outside the floor-map composable.

- [x] **Step 3: Run targeted TypeScript diagnostics**

Run: `tsc --noEmit -p prod/cube/apps/fire-management/app/tsconfig.json 2>&1 | rg 'src/views/fire-host-control'`

Expected: no new diagnostics in the new contracts/composables.

### Task 2: Extract primary page panels

**Files:**
- Create: `prod/cube/apps/fire-management/app/src/views/fire-host-control/components/host-status-bar.tsx`
- Create: `prod/cube/apps/fire-management/app/src/views/fire-host-control/components/monitor-video-panel.tsx`
- Create: `prod/cube/apps/fire-management/app/src/views/fire-host-control/components/host-signal-panel.tsx`
- Create: `prod/cube/apps/fire-management/app/src/views/fire-host-control/components/recent-events-panel.tsx`
- Create: `prod/cube/apps/fire-management/app/src/views/fire-host-control/components/control-button-panel.tsx`
- Create: `prod/cube/apps/fire-management/app/src/views/fire-host-control/components/controlled-device-panel.tsx`
- Create: `prod/cube/apps/fire-management/app/src/views/fire-host-control/components/water-monitor-panel.tsx`

- [x] **Step 1: Extract header and monitoring panels**

Use read-only typed props for data and explicit emitted actions for host switching, fullscreen, opening records and map location.

- [x] **Step 2: Extract controls and devices**

Keep the current 18 operation type mappings and device status presentation. The child components emit actions; the composable remains the mutation owner.

- [x] **Step 3: Extract water sensor cards**

Keep current mock-backed sensor content isolated behind `WaterSensorRecord[]`, ready for replacement by `listWaterSensors` when the interface is available.

### Task 3: Extract modal components

**Files:**
- Create: `prod/cube/apps/fire-management/app/src/views/fire-host-control/components/password-auth-modal.tsx`
- Create: `prod/cube/apps/fire-management/app/src/views/fire-host-control/components/event-records-modal.tsx`
- Create: `prod/cube/apps/fire-management/app/src/views/fire-host-control/components/operation-log-modal.tsx`
- Create: `prod/cube/apps/fire-management/app/src/views/fire-host-control/components/floor-map-modal.tsx`

- [x] **Step 1: Extract password authentication modal**

Keep six-character input, show/hide action, danger notice, remaining-attempt error and confirm/cancel behavior in one typed component contract.

- [x] **Step 2: Extract records modals**

Keep event and operation columns local to their respective modal components so route orchestration contains no table configuration.

- [x] **Step 3: Extract floor-map modal**

Pass image refs back through explicit ref callbacks supplied by `useFloorMap`; render point coordinates from the composable-calculated image rectangle.

### Task 4: Reduce route view to composition surface

**Files:**
- Modify: `prod/cube/apps/fire-management/app/src/views/fire-host-control/fire-host-control.tsx`

- [x] **Step 1: Replace inline implementation with component composition**

Keep `CubeLayout`, the two existing tabs and all modal mounting in the route page. Remove unused imports and global inline keyframe markup.

- [x] **Step 2: Verify references and formatting**

Run: `rg -n 'isPwdModalVisible|floorMapImageFrameRef|ctrlBtns' prod/cube/apps/fire-management/app/src/views/fire-host-control/fire-host-control.tsx`

Expected: no domain internals remain in the route view.

Run: `git diff --check -- prod/cube/apps/fire-management/app/src/views/fire-host-control`

Expected: no output.

### Task 5: Non-build verification

**Files:**
- Verify: `prod/cube/apps/fire-management/app/src/views/fire-host-control/`

- [x] **Step 1: Run targeted TypeScript diagnostics**

Run: `tsc --noEmit -p prod/cube/apps/fire-management/app/tsconfig.json 2>&1 | rg 'src/views/fire-host-control'`

Expected: no diagnostics for this feature directory. Do not run `build` per user preference.

- [x] **Step 2: Exercise the local page**

Open `/fire-host-control`, switch hosts, open event/log dialogs, switch to 消防用水, open a floor-map location when event data is present, and open/cancel a control-password dialog.

- [x] **Step 3: Inspect scope**

Run: `git diff --stat -- prod/cube/apps/fire-management/app/src/views/fire-host-control`

Expected: changes are limited to the route view plus its new local components, composables and contracts.
