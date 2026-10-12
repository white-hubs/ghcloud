# Fire Host Config Refactor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将消防管理 PC 端主机配置页按最新原型补齐为可交互 UI，并把 1500 行单文件拆分为职责清晰的页面、统计卡片和弹窗组件。

**Architecture:** 路由页使用 `CubeLayout`、`useCubeForm`、`useCubeTable` 管理主机列表和 URL 查询状态；新增/编辑与控制密码分别封装为独立 `useCubeModal` 组件，通过 typed expose 打开、通过事件通知列表刷新。设备选择弹窗继续复用平台的产品、品类、区域、部门和标签选择组件，数据请求集中在弹窗内部。

**Tech Stack:** Vue 3 Composition API、Vue TSX、`@ghcloud/cube-app-design`、`@ghcloud/cube-ui`、Less Modules、`@ghcloud/cube-services-client`。

---

### Task 1: 建立页面模型与视觉组件

**Files:**
- Create: `prod/cube/apps/fire-management/app/src/views/fire-host-config/fire-host-config.model.ts`
- Create: `prod/cube/apps/fire-management/app/src/views/fire-host-config/fire-host-config.module.less`
- Create: `prod/cube/apps/fire-management/app/src/views/fire-host-config/components/host-statistics-cards.tsx`
- Create: `prod/cube/apps/fire-management/app/src/views/fire-host-config/fire-host-config.utils.ts`

- [x] **Step 1: 定义稳定的组件契约**

```ts
export interface FireHostStatistics {
  hostCount: number;
  pointCount: number;
  todayAlarmCount: number;
  todayFaultCount: number;
}

export interface HostFormModalExpose {
  openModal: (record?: FireHostRecord) => void;
}

export interface ControlPasswordModalExpose {
  openModal: (record: FireHostRecord) => void;
}
```

- [x] **Step 2: 实现四张 KPI 卡片**

```tsx
export const HostStatisticsCards = defineComponent({
  props: { statistics: { type: Object as PropType<FireHostStatistics>, required: true } },
  setup: (props) => () => <section class={styles.grid}>{/* 四张数据卡片 */}</section>,
});
```

### Task 2: 拆分新增/编辑主机弹窗

**Files:**
- Create: `prod/cube/apps/fire-management/app/src/views/fire-host-config/components/host-form-modal.tsx`
- Create: `prod/cube/apps/fire-management/app/src/views/fire-host-config/components/host-device-picker.tsx`

- [x] **Step 1: 使用平台表单和表格实现设备筛选与单选**

```ts
const [DeviceFilterForm, filterFormApi] = useCubeForm({
  layout: "horizontal",
  schema: deviceFilterSchema,
  handleSubmit: applyFilters,
  handleReset: resetFilters,
});

const [DeviceTable, deviceTableApi] = useCubeTable({
  columns: deviceColumns,
  rowKey: "id",
  rowSelection: "radio",
  fetchApi: fetchDevicePage,
});
```

- [x] **Step 2: 使用 `useCubeModal` 区分新增和编辑**

```ts
const openModal = (record?: FireHostRecord): void => {
  editingHost.value = record ?? null;
  modalApi.setState({ title: record ? "编辑消防主机" : "新增消防主机" });
  modalApi.open();
};
```

- [x] **Step 3: 新增时校验设备与名称，编辑时锁定设备只修改名称**

```ts
if (editingHost.value) {
  await updateFireHost(buildUpdatePayload(editingHost.value, hostName));
} else {
  await addFireManageDevice(buildDevicePayload(selectedDevice.value, hostName));
}
```

### Task 3: 拆分控制密码弹窗

**Files:**
- Create: `prod/cube/apps/fire-management/app/src/views/fire-host-config/components/control-password-modal.tsx`

- [x] **Step 1: 使用平台弹窗与表单实现六位数字校验**

```ts
const passwordRule = [{ pattern: /^\d{6}$/, message: "请输入 6 位数字控制密码", trigger: "blur" }];
const [PasswordForm, passwordFormApi] = useCubeForm({
  layout: "vertical",
  showButton: false,
  schema: [{ component: "InputPassword", fieldName: "password", label: "新控制密码", rules: passwordRule }],
  handleSubmit: savePassword,
});
```

- [x] **Step 2: 保存时调用 `setControlPassword` 并通知页面刷新**

```ts
await useAuthRequest(() => setControlPassword({ id: currentHost.value.id, password }));
emit("saved");
modalApi.close();
```

### Task 4: 将路由页改造成组合层

**Files:**
- Modify: `prod/cube/apps/fire-management/app/src/views/fire-host-config/fire-host-config.tsx`

- [x] **Step 1: 使用 `useCubeForm` 与 URL 状态管理主机筛选**

```ts
const [CubeForm] = useCubeForm({
  layout: "horizontal",
  schema: hostFilterSchema,
  syncStateRef: searchParams,
  onHydratedQuery: () => tableApi.query(),
  handleSubmit: queryHosts,
  handleReset: resetHostFilters,
});
```

- [x] **Step 2: 使用 `useCubeTable` 实现原型六列与四项操作**

```tsx
<Button type="link" onClick={() => hostFormModalRef.value?.openModal(record)}>编辑</Button>
<Button type="link" onClick={() => passwordModalRef.value?.openModal(record)}>控制密码</Button>
<Button type="link" onClick={() => openPointManagement(record)}>配置管理</Button>
<PopConfirm title="确认删除该主机的纳管关系？">删除</PopConfirm>
```

- [x] **Step 3: 组合统计、查询、表格、分页和两个弹窗**

```tsx
<CubeLayout title={pageTitle || "主机配置"} v-slots={slots} showTableXScroll />
```

### Task 5: 补齐本地 Mock 交互

**Files:**
- Modify: `prod/cube/apps/fire-management/app/src/mocks/fire-device.mock.ts`

- [x] **Step 1: 注册当前 client 实际调用的主机列表、删除和控制密码路由**

```ts
registerMock("GET", /^\/api\/securitymanagement\/getFireManageDevicePage/, listHostHandler);
registerMock("DELETE", /^\/api\/securitymanagement\/deleteFireManageDevice\//, deleteHostHandler);
registerMock("POST", "/api/securitymanagement/setControlPassword", setPasswordHandler);
```

- [x] **Step 2: 让新增纳管 Mock 写入主机列表，以便 UI 可验证新增、查询和分页**

```ts
const payload = (await req.json()) as SaveFireManageDeviceParams;
hostStore.push(toFireHostRecord(payload));
```

### Task 6: 静态验证

**Files:**
- Verify: `prod/cube/apps/fire-management/app/src/views/fire-host-config/`

- [x] **Step 1: 检查旧点位弹窗和内联大块样式引用已移除**

Run: `rg "isPointModalVisible|configGridCells|handleDrop|<Modal" prod/cube/apps/fire-management/app/src/views/fire-host-config`

Expected: 不再出现旧点位管理大弹窗和原生 Ant Modal。

- [x] **Step 2: 检查格式与引用**

Run: `git diff --check -- prod/cube/apps/fire-management/app/src/views/fire-host-config prod/cube/apps/fire-management/app/src/mocks/fire-device.mock.ts`

Expected: exit 0。

- [x] **Step 3: 检查改动范围**

Run: `git diff --stat -- prod/cube/apps/fire-management/app/src/views/fire-host-config prod/cube/apps/fire-management/app/src/mocks/fire-device.mock.ts`

Expected: 单文件显著缩短，新增组件集中在同一 feature 目录；不执行 build。

### Task 7: 实机交互回归与公共表单修正

**Files:**
- Modify: `prod/cube/basic/cube-design/cube-app-design/src/base-components/cube-form/form-ui.tsx`

- [x] **Step 1: 修正 `showButton: false` 仍显示查询、重置按钮的问题**

保持默认 `showButton: true` 行为不变，仅在显式关闭时同时隐藏表单操作按钮，避免业务弹窗出现无关操作。

- [x] **Step 2: 在临时开发端口完成页面交互验收**

验证主机列表与统计卡片、新增设备单选、编辑锁定关联设备、六位控制密码弹窗，以及配置管理携带主机参数跳转；验收后关闭临时服务，不执行 build。

### Task 8: 按新版原型补齐消防配置管理三 Tab

**Files:**
- Modify: `prod/cube/apps/fire-management/app/src/views/fire-point-management/fire-point-management.tsx`
- Create: `prod/cube/apps/fire-management/app/src/views/fire-point-management/components/host-button-config-tab.tsx`
- Create: `prod/cube/apps/fire-management/app/src/views/fire-point-management/components/video-device-config-tab.tsx`
- Create: `prod/cube/apps/fire-management/app/src/views/fire-point-management/fire-config-management.model.ts`
- Create: `prod/cube/apps/fire-management/app/src/views/fire-point-management/fire-config-management.mock-data.ts`

- [x] **Step 1: 建立消防点位、主机按钮、视频设备三个 Tab，并将 Tab 写入 URL**
- [x] **Step 2: 补齐主机按钮筛选、关联、编辑、排序、移除交互**
- [x] **Step 3: 补齐视频设备筛选、关联、数量统计、移除交互**
- [x] **Step 4: 补充当前消防点位接口路径的 Mock，使独立开发环境可联调**
- [x] **Step 5: 在临时开发端口逐项完成三个 Tab 与弹窗交互验收，不执行 build**

### Task 9: 补齐消防点位批量坐标与多线盘样式

**Files:**
- Create: `prod/cube/apps/fire-management/app/src/views/fire-point-management/components/batch-coordinate-modal.tsx`
- Create: `prod/cube/apps/fire-management/app/src/views/fire-point-management/components/multi-line-style-modal.tsx`
- Modify: `prod/cube/apps/fire-management/app/src/views/fire-point-management/fire-point-management.tsx`

- [x] **Step 1: 批量坐标支持统一设置 X/Y，未填写坐标保持原值**
- [x] **Step 2: 参数转换支持分别增加或减少 X/Y 偏移量，并限制在 0 - 100**
- [x] **Step 3: 批量保存复用现有点位更新接口，成功后刷新列表并清空选择**
- [x] **Step 4: 多线盘样式支持 2/3 指示灯切换、自定义灯名和实时预览**
- [x] **Step 5: 实机验证批量更新两条点位坐标，以及多线盘样式保存和重新打开后的状态保持**
