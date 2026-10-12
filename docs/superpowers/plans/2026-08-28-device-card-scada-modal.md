# 设施房设备卡片二维组态弹窗 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 点击设施房设备卡片右上角更多图标时，根据设备产品类型匹配并弹窗展示该设备的二维组态图。

**Architecture:** SCADA 页面继续以 `page.product.id` 作为单设备产品匹配键，电气安全设备卡片使用 `MonitoringDevice.productCode` 查找对应页面。独立弹窗组件并行加载组态页、设备基本信息和实时属性，将同一设备数据注入单设备页的所有图元，并复用 `ScadaRuntimeView` 渲染。

**Tech Stack:** TypeScript、Vue 3 JSX、`@cube-scada/studio-sdk`、`@ghcloud/cube-ui`、Bun Test

---

## 文件职责

- `src/utils/scada-pages.ts`：解析产品绑定并查找单设备组态页。
- `src/utils/facility-scada-binding.ts`：将一台设备的数据扩展为单设备页全图元运行时绑定。
- `src/views/device-monitoring/device-scada-modal.tsx`：负责弹窗加载状态、数据请求、实时更新和组态展示。
- `src/views/device-monitoring/device-monitoring.tsx`：只管理卡片更多按钮与当前弹窗设备。
- `src/views/device-monitoring/device-monitoring.less`：更多按钮与组态弹窗布局。

### Task 1: 实现产品类型匹配

**Files:**
- Modify: `prod/cube/apps/electrical-safety/app/src/utils/scada-pages.ts`
- Test: `prod/cube/apps/electrical-safety/app/src/utils/scada-pages.test.ts`

- [x] **Step 1:** 为页面产品解析、单设备形态过滤、产品代码精确匹配和未匹配结果编写失败测试。
- [x] **Step 2:** 实现 `fetchDeviceScadaPageByProduct(productCode)`，并返回页面 id、名称和有效图元 id。
- [x] **Step 3:** 运行 `bun test prod/cube/apps/electrical-safety/app/src/utils/scada-pages.test.ts`，期望全部通过。

### Task 2: 构建单设备运行时绑定

**Files:**
- Modify: `prod/cube/apps/electrical-safety/app/src/utils/facility-scada-binding.ts`
- Test: `prod/cube/apps/electrical-safety/app/src/utils/facility-scada-binding.test.ts`

- [x] **Step 1:** 编写测试，确认同一设备的基本信息和实时属性会注入页面每个图元。
- [x] **Step 2:** 实现 `buildSingleDeviceScadaRuntimeBindings(elementIds, data)`，去重并忽略空图元 id。
- [x] **Step 3:** 运行设施房组态绑定测试，期望全部通过。

### Task 3: 接入卡片弹窗

**Files:**
- Create: `prod/cube/apps/electrical-safety/app/src/views/device-monitoring/device-scada-modal.tsx`
- Modify: `prod/cube/apps/electrical-safety/app/src/views/device-monitoring/device-monitoring.tsx`
- Modify: `prod/cube/apps/electrical-safety/app/src/views/device-monitoring/device-monitoring.less`

- [x] **Step 1:** 实现 `DeviceScadaModal`，并行请求产品匹配页、设备详情与实时属性，处理加载、未配置、失败和重试状态。
- [x] **Step 2:** 使用 `useDeviceRealtime` 订阅弹窗设备属性，更新后重新注入 `ScadaRuntimeView`。
- [x] **Step 3:** 将卡片三点图标改为独立可访问按钮，阻止冒泡并打开当前设备组态弹窗。
- [x] **Step 4:** 增加弹窗画布高度、滚动隔离和更多按钮交互样式。

### Task 4: 验证

- [x] **Step 1:** 运行两个相关单元测试文件。
- [x] **Step 2:** 运行 `bun -F @ghcloud/cube-electrical-safety-app build`。
- [x] **Step 3:** 运行 `git diff --check` 并审查变更仅覆盖本功能与现有用户改动的必要衔接。
