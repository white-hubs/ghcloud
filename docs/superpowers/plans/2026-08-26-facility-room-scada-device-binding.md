# 设施房二维组态设备绑定 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 让设施房二维组态具备与电气中心一致的业务绑定流程：先选择组态图，再将待绑定图元映射到当前设施房设备，并展示设备基本信息及实时参数。

**Architecture:** SCADA 服务继续只负责页面内容，电气安全应用从电气安全服务查询当前设施房设备及其详情/实时属性；电气安全服务以设施房为隔离键持久化页面、图元设备映射和展示属性选择，浏览器旧数据仅迁移一次。运行时复用 `ScadaRuntimeView` 的图元数据注入能力，不要求两个后端服务互通。

**Tech Stack:** TypeScript、Vue 3 JSX、Ant Design Vue、Bun

---

### Task 1: 扩展设施房可选组态页

**Files:**
- Modify: `prod/cube/apps/electrical-safety/app/src/utils/scada-pages.ts`
- Test: `prod/cube/apps/electrical-safety/app/src/utils/scada-pages.test.ts`

- [x] **Step 1: 提取待绑定图元摘要解析**

复用 `deviceBinding === "required"` 图元的 id、名称和类型解析，避免设施房和电气中心产生两套规则。

- [x] **Step 2: 支持新单双设备页面**

设施房可选列表接受至少包含一个待绑定图元的 `singleDevice` / `multiDevice` 页面，并继续接受旧 `facilityRoom` 页面；旧 `electricalCenter` / `device` 页面保持隔离。

- [x] **Step 3: 添加页面筛选测试**

覆盖新单设备、新多设备、旧设施房以及不应出现的旧页面。

### Task 2: 建立设施房业务绑定模型与运行时数据转换

**Files:**
- Modify: `prod/cube/apps/electrical-safety/app/src/utils/facility-scada-binding.ts`
- Test: `prod/cube/apps/electrical-safety/app/src/utils/facility-scada-binding.test.ts`

- [x] **Step 1: 扩展设施房绑定文档**

按设施房保存 `pageId`、`elementDeviceIds` 和 `elementPropertyCodes`，并兼容读取此前只保存 pageId 的字符串数据。

- [x] **Step 2: 清理失效页面和图元映射**

页面删除时清空绑定；画面图元变化时只保留仍存在的映射与属性选择。

- [x] **Step 3: 转换设备基本信息与实时属性**

将 `DeviceBasicInfo` 和 `DeviceRealtimeProperties` 转换为组态值、属性定义及运行时图元绑定；空白产品属性面板可由业务选择字段覆盖画布默认字段。

- [x] **Step 4: 添加持久化、兼容和数据转换测试**

覆盖旧值迁移、设施房隔离、失效映射、基本字段、实时参数及显式属性顺序。

### Task 3: 增加设施房设备绑定交互

**Files:**
- Create: `prod/cube/apps/electrical-safety/app/src/views/device-monitoring/facility-device-binding-modal.tsx`
- Modify: `prod/cube/apps/electrical-safety/app/src/views/device-monitoring/device-monitoring.tsx`
- Modify: `prod/cube/apps/electrical-safety/app/src/views/device-monitoring/device-monitoring.less`

- [x] **Step 1: 创建图元设备绑定弹窗**

逐个图元选择当前设施房设备，同一设备不重复绑定；产品属性面板可选择基本信息和实时属性。

- [x] **Step 2: 页面选择后衔接设备绑定**

切换组态图时保留同页有效绑定，换页时清空旧图元映射，并自动打开设备绑定弹窗。

- [x] **Step 3: 查询设施房完整设备集合**

绑定候选调用无筛选条件的设施房设备接口，不复用卡片/列表视图的搜索结果。

- [x] **Step 4: 按需查询设备详情和实时参数**

弹窗选中设备或加载已有绑定时并行查询基本信息和实时参数，缓存到当前设施房；支持手动刷新已绑定设备数据。

- [x] **Step 5: 注入组态运行时**

将运行时绑定传入 `ScadaRuntimeView`，工具栏展示设备绑定完成数并提供“设备绑定”和“刷新设备数据”。

### Task 4: 验证

- [x] **Step 1: 运行相关单元测试**

```bash
bun test prod/cube/apps/electrical-safety/app/src/utils/scada-pages.test.ts prod/cube/apps/electrical-safety/app/src/utils/facility-scada-binding.test.ts
```

- [x] **Step 2: 构建电气安全子应用**

```bash
bun -F @ghcloud/cube-electrical-safety-app build
```

- [x] **Step 3: 检查格式和变更范围**

```bash
git diff --check
git diff -- prod/cube/apps/electrical-safety/app/src docs/superpowers/plans/2026-08-26-facility-room-scada-device-binding.md
```

Expected: 相关测试和构建通过，SCADA 页面内容仍由 SCADA 服务提供，设施房业务绑定通过电气安全服务接口持久化。

### Task 5: 将设施房绑定迁移到电气安全服务持久化

**Files:**
- Modify: `prod/cube-services/interfaces/src/electrical-safety/request.ts`
- Modify: `prod/cube-services/interfaces/src/electrical-safety/response.ts`
- Modify: `prod/cube-services/interfaces/src/electrical-safety/gateway.ts`
- Modify: `prod/cube-services/client/src/electrical-safety.client.ts`
- Modify: `prod/cube/apps/electrical-safety/app/src/utils/facility-scada-binding.ts`
- Modify: `prod/cube/apps/electrical-safety/app/src/utils/facility-scada-binding.test.ts`
- Modify: `prod/cube/apps/electrical-safety/app/src/views/device-monitoring/device-monitoring.tsx`

- [x] **Step 1: 定义设施房绑定接口契约**

新增 `GET/PUT /api/electrical-management/monitoring/facilities/{facilityId}/scada-binding`。请求和响应均使用
`pageId`、`elementDeviceIds`、`elementPropertyCodes`，不包含 `revision`；SCADA 页面内容仍由 SCADA 服务提供。

- [x] **Step 2: 添加客户端 SDK 请求测试**

验证查询请求不携带绑定内容，保存请求完整提交页面、图元设备映射和属性编码，且请求体中不存在 `revision`。

- [x] **Step 3: 接入设施房远程加载与保存**

切换设施房时按设施房 ID 查询绑定；选择页面、保存设备与属性时先等待 PUT 成功，再更新页面状态和关闭弹窗。接口失败时保留当前状态和弹窗，避免界面显示未持久化数据。

- [x] **Step 4: 一次性迁移浏览器旧绑定**

服务器无绑定而 localStorage 存在有效旧绑定时，将旧绑定写入服务器；成功后移除该设施房的本地键。服务器已有数据时直接清除同设施房旧键，避免双数据源。

- [x] **Step 5: 验证**

运行设施房绑定单元测试、接口客户端测试、全部电气安全相关测试和 `@ghcloud/cube-electrical-safety-app` 生产构建。
