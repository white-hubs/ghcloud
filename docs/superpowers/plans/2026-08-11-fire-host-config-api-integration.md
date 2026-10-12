# Fire Host Configuration API Integration Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 按 ApiFox 项目 `435727` 中三个指定目录的全部 18 个接口，补齐消防主机配置的共享类型、client SDK 和三个配置 Tab 的真实接口交互。

**Architecture:** `@ghcloud/cube-service-interface/fire-management` 是请求/响应契约源，`@ghcloud/cube-services-client/fire-management.client` 统一实现鉴权上下文内的 HTTP 调用；业务页面只通过 deep import SDK 并由 `useAuthRequest` 注入登录态。当前 fire-management 是既有直连 securitymanagement API 模块，没有对应 gateway controller，因此本次不新增虚假的 BFF 代理层。

**Tech Stack:** TypeScript、Vue 3 TSX、`@ghcloud/cube-app-design`、`@ghcloud/cube-services-client`、Cube Gateway request builders。

---

## ApiFox endpoint matrix

| 目录 | 接口 | 方法与路径 | 页面/SDK用途 |
|---|---|---|---|
| 点位 `93107056` | 新增消防点位 | `POST /addFirePointDevice` | 关联设备 |
| 点位 `93107056` | 修改消防点位 | `POST /updateFirePointDevice` | 编辑点位 |
| 点位 `93107056` | 删除消防点位 | `DELETE /deleteFirePointDevice/{id}` | 移除点位 |
| 点位 `93107056` | 分页查询消防点位 | `GET /getFirePointDevicePage` | 点位列表 |
| 点位 `93107056` | 分页查询点位事件 | `GET /getFirePointDeviceEventPage` | 共享 SDK/事件页 |
| 点位 `93107056` | 分页查询本地事件日志 | `GET /getFirePointDeviceLocalEventPage` | 共享 SDK |
| 点位 `93107056` | 批量补齐空缺字段 | `POST /batchFillEmptyFields` | Excel 导入 |
| 点位 `93107056` | 批量配置点位信息 | `POST /configFirePointDevice` | 批量坐标、平面图保存 |
| 点位 `93107056` | 下载导入模板 | `GET /downloadTemplate` | 模板下载 |
| 按钮 `93107062` | 查询物模型方法列表 | `GET /fireManage/p2/hosts/{id}/methods` | 关联候选 |
| 按钮 `93107062` | 查询已关联按钮配置 | `GET /fireManage/p2/hosts/{id}/buttons` | 按钮列表 |
| 按钮 `93107062` | 保存按钮关联关系 | `POST /fireManage/p2/hosts/{id}/buttons/save` | 批量关联 |
| 按钮 `93107062` | 修改按钮展示配置 | `POST /fireManage/p2/hosts/{id}/buttons/update` | 图标、排序、启用、备注 |
| 按钮 `93107062` | 移除按钮配置 | `DELETE /fireManage/p2/hosts/{id}/buttons/{buttonId}` | 移除按钮 |
| 视频 `93107063` | 分页查询已关联视频设备 | `GET /fireManage/p2/hosts/{id}/monitor-devices/page` | 已关联列表 |
| 视频 `93107063` | 分页查询可关联视频设备 | `GET /fireManage/p2/hosts/{id}/monitor-devices/candidates/page` | 候选选择 |
| 视频 `93107063` | 保存视频设备关联关系 | `POST /fireManage/p2/hosts/{id}/monitor-devices/save` | 批量关联 |
| 视频 `93107063` | 移除关联视频设备 | `DELETE /fireManage/p2/hosts/{id}/monitor-devices/{monitorDeviceId}` | 移除视频 |

### Task 1: Define shared contracts

**Files:**
- Modify: `prod/cube-services/interfaces/src/fire-management/request.ts`
- Modify: `prod/cube-services/interfaces/src/fire-management/response.ts`
- Modify: `prod/cube-services/interfaces/src/fire-management/gateway.ts`

- [ ] **Step 1: Add exact point request and response fields**

Represent `FirePointDeviceParam`, batch coordinate items, event filters and local event responses exactly as ApiFox schemas `303284625`, `303284627`, `303284628`, `303284629`.

- [ ] **Step 2: Add host button contracts**

Represent method records, associated button records, save items and update items from schemas `303284647`, `303284646`, `303284642`, `303284644`.

- [ ] **Step 3: Add monitor device contracts**

Represent shared page filters, monitor-device records and save ID arrays from schemas `303284649`, `303284648`.

- [ ] **Step 4: Extend FireManagementGateway with all 18 operations**

Keep existing method names as compatibility aliases where other pages already consume them, while adding explicit methods for event/local-event, bulk operations, buttons and monitor devices.

### Task 2: Implement client SDK

**Files:**
- Modify: `prod/cube-services/client/src/fire-management.client.ts`

- [ ] **Step 1: Implement point operations**

Use `/api/securitymanagement` as the existing service prefix, unwrap standard response envelopes, submit Excel as `FormData`, and return the template as `Blob`.

- [ ] **Step 2: Implement host button operations**

Use `/api/securitymanagement/fireManage/p2/hosts/{id}` and preserve ApiFox request body shapes `{ buttons: [...] }`.

- [ ] **Step 3: Implement monitor-device operations**

Map page query fields without renaming and preserve `{ monitorDeviceIds: [...] }` for saves.

- [ ] **Step 4: Run targeted TypeScript diagnostics**

Run the app TypeScript compiler and filter `fire-management.client` plus `interfaces/src/fire-management`; expected result is zero targeted diagnostics.

### Task 3: Connect point-management interactions

**Files:**
- Modify: `prod/cube/apps/fire-management/app/src/views/fire-point-management/fire-point-management.tsx`

- [ ] **Step 1: Align list/create/update/delete payloads**

Send `pointName`, `productModel`, `pointCode`, `code`, `busType` and `fireManageDeviceId` according to ApiFox while keeping existing filters and UI behavior.

- [ ] **Step 2: Replace direct upload and download fetch calls**

Call the SDK through `useAuthRequest`; remove page-level token, tenant and terminal extraction.

- [ ] **Step 3: Use batch config for coordinate changes**

Send one `configFirePointDevice` array for batch-coordinate modal and floor-map save instead of one update request per point or direct `fetch`.

### Task 4: Connect host-button tab

**Files:**
- Modify: `prod/cube/apps/fire-management/app/src/views/fire-point-management/components/host-button-config-tab.tsx`
- Modify: `prod/cube/apps/fire-management/app/src/views/fire-point-management/fire-config-management.model.ts`

- [ ] **Step 1: Load associated buttons and method candidates**

Replace seed arrays with `listFireHostButtons` and `listFireHostMethods`; candidate search sends `keyword` to the server.

- [ ] **Step 2: Persist associations and edits**

Save selected `methodCode` entries, update display fields, refresh the table after successful writes, and keep errors visible via platform messages.

- [ ] **Step 3: Persist sorting and removals**

Move operations submit the two affected button IDs and swapped `sortNo`; remove calls the dedicated DELETE endpoint.

### Task 5: Connect video-device tab

**Files:**
- Modify: `prod/cube/apps/fire-management/app/src/views/fire-point-management/components/video-device-config-tab.tsx`
- Modify: `prod/cube/apps/fire-management/app/src/views/fire-point-management/fire-config-management.model.ts`

- [ ] **Step 1: Load associated and candidate pages**

Replace local arrays with the two server page endpoints and map keyword/category/brand/area filters directly.

- [ ] **Step 2: Persist associations and removals**

Save selected monitor device IDs, remove by monitor device ID, clear selections and refresh both tables after writes.

### Task 6: Keep standalone development functional

**Files:**
- Modify: `prod/cube/apps/fire-management/app/src/mocks/fire-device.mock.ts`

- [ ] **Step 1: Add mock handlers for the P2 button endpoints**

Maintain in-memory associated buttons and return method candidates using the same request/response shapes as ApiFox.

- [ ] **Step 2: Add mock handlers for P2 video endpoints and point bulk operations**

Support linked/candidate pages, save/remove, batch point config, file upload and template download without changing production client paths.

### Task 7: Non-build verification

**Files:**
- Verify all files above.

- [ ] **Step 1: Run targeted TypeScript diagnostics**

Expected: zero diagnostics for fire-management contracts/client and fire-point-management files. Do not run build per user preference.

- [ ] **Step 2: Run `git diff --check` and mock route coverage search**

Expected: no whitespace errors; every one of the 18 endpoint paths appears in the client, and all page-used mutation paths have a dev mock.

- [ ] **Step 3: Exercise the local page**

Open the three configuration tabs and verify list loading, candidate dialogs, save/edit/remove confirmations, upload/template controls and batch coordinate modal render without runtime errors.
