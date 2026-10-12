# SCADA 多层级场景绑定 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将二维组态从“仅产品绑定的单设备页”升级为在 **scada-demo** 中可区分的三种形态——电气中心、电气设施房、电气设备；业务侧绑定后续在电气管理完成，运行端保证多设备实时值、弹窗和控制命令不串设备。

**Architecture:** 页面 `PageModel` 保持为可复用模板，并标注场景形态（`sceneScope`）；设备槽位与数据源描述留在模板内。具体业务对象绑定（设施房 ID、设备 ID 等）由电气管理等宿主完成，不写死在页面模板里。Demo 负责三种形态的创作与预览区分；H5 设备监测、电气设备检测等只是消费方之一。电气中心租户内唯一；电气设施房后续在电气管理绑定；电气设备沿用现有产品绑定。

**Tech Stack:** TypeScript、Vue 3、Vue TSX、Bun、`@dangao/bun-server`、SQLite、`@cube-scada/*`、`@ghcloud/cube-iot-socket`、Cube Services `interfaces/gateway/client`。

---

## 0. 已确认的业务边界（2026-08-06）

| 形态       | 枚举 / kind         | 绑定策略                                       | 本阶段落点                                      |
| ---------- | ------------------- | ---------------------------------------------- | ----------------------------------------------- |
| 电气中心   | `electricalCenter`  | **租户内唯一**，不按设施房/设备复用多份        | Demo 中区分形态；宿主后续按唯一中心加载         |
| 电气设施房 | `facilityRoom`      | **后续在电气管理中绑定**具体设施房             | Demo 中做多设备槽位模板与预览；业务绑定延后     |
| 电气设备   | `device`            | **沿用原有产品绑定**（`page.product` → 运行时设备） | 兼容现网；Demo / Studio / 监测详情均继续可用 |

**展示宿主（非仅 H5）：**

- IoT Center H5 设备监测详情（已有）
- 电气设备检测（PC/业务侧已有或将接入）
- 电气管理（后续负责设施房绑定；电气中心唯一入口也在此体系）

**明确不做误解：**

- 三种形态的**区分与模板能力**先在 `scada-demo`（及 core 模型）落地，不以 H5 为唯一设计中心。
- 电气设施房的**业务对象绑定**不属于本阶段 Demo 硬编码范围，留给电气管理。
- 「电气中心」≠「任意多个电气设施实例」；中心唯一，设施房可多、设备按产品模板复用。

## 1. 当前代码基线与问题

### 1.1 已有能力

- `PageModel.product` 只保存一个产品，页面按产品复用（即「电气设备」形态）。
- Studio 中 `Binding` 描述“逻辑 Tag → 图元属性”，Demo 可把一个产品属性映射到该逻辑 Tag。
- `ScadaPageHandle.setTagValue(tag, value)` 可把宿主实时值推入页面。
- H5 / 电气设备检测等按 `productId` 找组态页，再用当前 `deviceId` 注入设备属性。

### 1.2 当前阻塞点

1. 页面模型没有 `sceneScope`，Demo 无法区分电气中心 / 设施房 / 设备三种创作形态。
2. 业务入口（H5、电气设备检测）通过拉取全部页面详情并解析 `page.product.id` 查找页面，页面量增长后不可扩展；且只覆盖「电气设备」形态。
3. 单设备属性值字典在多设备同 `propCode` 时会互相覆盖（设施房形态必需解决）。
4. `@ghcloud/cube-iot-socket` 的 `deviceDetail()` 每次 `SUBSCRIBE` 前会 `UNSUBSCRIBE`，连续调用不能形成多设备订阅。
5. 具体设备/设施房 ID 若写入 `PageModel`，模板无法复用；设施房绑定应落在电气管理侧的部署/关联，而非页面模板。
6. 页面事件和写操作只有逻辑 Tag，没有反向解析到“哪个槽位设备的哪个属性”的通用路由。

## 2. 目标形态

| 形态       | 绑定对象（业务侧）     | 页面结构                         | 设备解析方式                           | 典型入口                         |
| ---------- | ---------------------- | -------------------------------- | -------------------------------------- | -------------------------------- |
| 电气设备   | 产品 → 运行时设备      | 单页面、隐式 `primary` 槽位      | 当前设备填充 `primary`                 | 设备监测 / 电气设备检测          |
| 电气设施房 | 电气管理绑定的设施房   | 单页面、多设备槽位               | 设施房设备列表与槽位显式匹配           | 电气管理 · 设施房详情（后续）    |
| 电气中心   | 租户唯一电气中心       | 入口视图 + 多个设施房视图（可选） | 中心唯一解析；下钻到已绑定设施房视图   | 电气管理 · 电气中心（后续）      |

### 2.1 电气设备形态（兼容现网）

- 兼容当前 `page.product` 数据；`sceneScope = "device"`。
- 旧页面加载时自动生成隐式槽位 `primary`。
- 宿主传入的 `deviceId` 绑定到 `primary`。
- 旧逻辑 Tag（如 `remainingCurrent`）保持可用，不要求立即改成带槽位前缀。

### 2.2 电气设施房形态

- `sceneScope = "facilityRoom"`。
- 页面模板声明稳定的设备槽位，例如 `incomingCabinet`、`capacitorCabinet`、`collector`。
- 每个槽位声明允许的产品、产品品类或设备标签条件。
- **具体设施房 ID 与槽位设备分配**：本阶段 Demo 用模拟数据预览；生产绑定由**电气管理**完成。
- 两个设备即使都有 `running` 属性，也分别写入 `incomingCabinet.running`、`capacitorCabinet.running`。
- 同一条件匹配多个设备时不得随机选取，部署校验必须要求人工确认。

### 2.3 电气中心形态

- `sceneScope = "electricalCenter"`。
- **租户内唯一**：解析/发布时同一租户只允许一个已发布的电气中心场景（或等价唯一绑定）。
- 电气中心是场景组合（入口页 + 可选设施房子视图），不是把所有房间画进一张无限画布。
- `entryViewId` 指向中心入口页面；设施房子视图复用设施房模板，上下文由电气管理绑定提供。
- 入口图元可通过场景导航进入指定设施房视图；宿主也可根据已绑定设施房列表渲染导航。
- 第一版采用“入口 + 下钻”；不实现按设备数量动态复制任意图元。
- 设施树变化时由电气管理侧同步差异并人工确认，避免静默改变生产画面。

## 3. 核心领域模型

### 3.1 页面模板模型

修改 `prod/cube/scada/basic/core/src/types/page.ts` 和 `instance.ts`：

```ts
/** device=电气设备, facilityRoom=电气设施房, electricalCenter=电气中心 */
export type SceneScopeKind = "device" | "facilityRoom" | "electricalCenter";

export interface DeviceSlotSelector {
  productId?: string;
  categoryCode?: string;
  tagCodes?: string[];
}

export interface DeviceSlot {
  id: string;
  name: string;
  required: boolean;
  selector: DeviceSlotSelector;
}

export interface DevicePropertySource {
  kind: "deviceProperty";
  slotId: string;
  property: ElementPropertyBinding;
}

export interface ElementPropertyBinding {
  propCode: string;
  propName: string;
  sourceSlotId?: string;
  // 现有 unitName/dataType/prodId/prodName 字段保持不变
}

export interface Binding {
  id: string;
  propName: string;
  tagName: string;
  transform?: string;
  source?: DevicePropertySource;
  /** 旧版 Demo 产品映射，迁移后转为 source + primary 槽位。 */
  productProperty?: ElementPropertyBinding;
}

export interface PageModel {
  /** 页面形态；缺省视为 device（电气设备 / 产品绑定兼容）。 */
  sceneScope?: SceneScopeKind;
  deviceSlots?: DeviceSlot[];
  /** 旧版单产品页面兼容字段（电气设备形态）。 */
  product?: ProductBinding;
}
```

约束：设备 ID / 设施房 ID 不进入 `PageModel.deviceSlots`，也不进入 `Binding.source`。业务绑定由电气管理等宿主持有。

### 3.2 场景部署模型

新增 `prod/cube/scada/basic/core/src/types/scene.ts`。  
说明：部署元数据最终由**电气管理**写入/维护；SCADA Demo 本阶段用同构结构做三种形态预览与模拟分配。

```ts
export interface SceneScopeRef {
  kind: SceneScopeKind;
  /** electricalCenter 可为租户固定哨兵 ID；facilityRoom/device 为业务 ID。 */
  id: string;
  name: string;
}

export interface SlotAssignment {
  slotId: string;
  deviceId: string;
  deviceName: string;
  productId: string;
}

export interface SceneViewDeployment {
  id: string;
  name: string;
  pageId: string;
  context: SceneScopeRef;
  slotAssignments: SlotAssignment[];
}

export interface SceneDeployment {
  id: string;
  name: string;
  target: SceneScopeRef;
  entryViewId: string;
  views: SceneViewDeployment[];
  syncPolicy: "snapshot" | "followHierarchy";
  /** electricalCenter 同步新增设施房视图时使用的设施房页模板。 */
  facilityRoomPageTemplateId?: string;
}
```

统一规则：电气设备与电气设施房都是一个视图；电气中心可以有多个视图，且租户内已发布中心场景唯一。

### 3.3 运行时路由

新增纯函数模型：

```ts
export interface DevicePropertyRoute {
  logicalTag: string;
  slotId: string;
  deviceId: string;
  propCode: string;
  dataType?: string;
}

export interface SceneRuntimeContext {
  sceneId: string;
  viewId: string;
  scope: SceneScopeRef;
  routes: DevicePropertyRoute[];
}
```

实时消息 `{ deviceId, propCode, value }` 必须先命中 `DevicePropertyRoute`，再调用 `setTagValue(logicalTag, value)`。控制命令沿同一路由反向解析，禁止仅凭 `propCode` 写设备。

## 4. 模块边界

| 模块                          | 职责                                                                 |
| ----------------------------- | -------------------------------------------------------------------- |
| `@cube-scada/core`            | 页面模板、`sceneScope`、槽位、场景部署和路由类型；序列化、迁移与校验 |
| `scada-studio-service/pages`  | 继续管理页面模板（含 `sceneScope`）                                  |
| `scada-studio-service/scenes` | 场景部署存储与按目标索引；生产写入方后续为电气管理                   |
| Cube Services `device-center` | 归一化电气中心/设施房/设备层级查询（字段名与业务对齐）               |
| Cube Services `scada`         | 业务前端场景查询客户端，避免各宿主遍历全部页面                       |
| `@ghcloud/cube-iot-socket`    | 一个连接订阅多个设备属性，输出包含设备 ID 的更新                     |
| `@cube-scada/studio-sdk`      | 根据页面和槽位分配生成路由；渲染层不依赖设备中心和鉴权               |
| **SCADA Demo（本阶段主战场）** | **三种形态区分、槽位设计、模拟部署预览、歧义校验**                   |
| 电气管理（后续）              | 绑定电气设施房；维护电气中心唯一场景；生产部署写入                   |
| 电气设备检测 / IoT H5 等宿主  | 消费已发布场景；实时会话、视图导航；不负责形态分类设计               |

`@cube-scada/studio-sdk` 不直接依赖 `@ghcloud/cube-iot-socket`；宿主通过适配器注入数据，避免 SDK 与某个业务平台耦合。

---

## Task 1: 固化架构决策与领域术语

**Files:**

- Create: `docs/adr/0012-scada-template-and-scene-deployment.md`
- Modify: `docs/adr/readme.md`

- [ ] **Step 1: 写入 proposed ADR**

ADR 必须记录：页面是模板并带 `sceneScope`；设备槽位不保存设备/设施房 ID；业务绑定（尤其设施房）由电气管理完成；电气中心租户唯一且可采用多视图；旧 `page.product` 映射到电气设备形态的隐式 `primary` 槽位；三种形态先在 Demo 区分，H5/电气设备检测只是消费者。

- [ ] **Step 2: 记录明确不做的事项**

第一版不实现动态图元循环、跨租户场景共享、任意聚合表达式和自动控制策略；本阶段不在电气管理内落地真实绑定 UI（仅预留契约与 Demo 模拟）。

- [ ] **Step 3: 评审领域主键**

确认设施房、设备有租户内稳定 ID；电气中心可用稳定哨兵 ID 或租户级唯一记录。名称只用于展示。若设施房无稳定 ID，停止设施房/中心生产绑定，Demo 模拟仍可继续。

## Task 2: 增加核心类型、迁移和校验

**Files:**

- Modify: `prod/cube/scada/basic/core/src/types/page.ts`
- Modify: `prod/cube/scada/basic/core/src/types/instance.ts`
- Create: `prod/cube/scada/basic/core/src/types/scene.ts`
- Create: `prod/cube/scada/basic/core/src/scene-runtime-route.ts`
- Create: `prod/cube/scada/basic/core/src/scene-runtime-route.test.ts`
- Modify: `prod/cube/scada/basic/core/src/serialization/page-serializer.ts`
- Modify: `prod/cube/scada/basic/core/src/serialization/tests/page-serializer.test.ts`
- Modify: `prod/cube/scada/basic/core/src/validation/page-validation.ts`
- Modify: `prod/cube/scada/basic/core/src/validation/tests/page-validation.test.ts`
- Modify: `prod/cube/scada/basic/core/src/index.ts`

- [ ] **Step 1: 写失败测试，锁定旧页面迁移行为**

```ts
expect(migrateLegacyProductPage(legacyPage).deviceSlots).toEqual([
  expect.objectContaining({ id: "primary", selector: { productId: "prod-1" } }),
]);
expect(migrated.elements[0].bindings[0].source?.slotId).toBe("primary");
```

- [ ] **Step 2: 写失败测试，锁定多设备同属性不冲突**

```ts
const routes = buildSceneRuntimeRoutes(page, view);
expect(routes).toEqual(
  expect.arrayContaining([
    expect.objectContaining({ logicalTag: "incoming.running", deviceId: "dev-a", propCode: "running" }),
    expect.objectContaining({ logicalTag: "backup.running", deviceId: "dev-b", propCode: "running" }),
  ]),
);
```

- [ ] **Step 3: 实现类型、迁移和纯路由函数**

迁移只为缺少 `source` 且存在 `productProperty` 的绑定补 `source: { kind: "deviceProperty", slotId: "primary", property: productProperty }`；保留原字段读取能力至少一个页面模型版本。

- [ ] **Step 4: 增加页面校验**

至少返回以下错误码：

- `DEVICE_SLOT_ID_DUPLICATED`
- `BINDING_SLOT_MISSING`
- `BINDING_SOURCE_PRODUCT_MISMATCH`
- `SCENE_ENTRY_VIEW_MISSING`
- `SCENE_SLOT_ASSIGNMENT_MISSING`
- `SCENE_SLOT_ASSIGNMENT_PRODUCT_MISMATCH`
- `SCENE_SLOT_ASSIGNMENT_AMBIGUOUS`

- [ ] **Step 5: 运行核心测试**

Run:

```bash
bun test prod/cube/scada/basic/core/src/scene-runtime-route.test.ts \
  prod/cube/scada/basic/core/src/serialization/tests/page-serializer.test.ts \
  prod/cube/scada/basic/core/src/validation/tests/page-validation.test.ts
```

Expected: PASS。

## Task 3: 补齐电气设施层级服务契约

**Files:**

- Modify: `prod/cube-services/interfaces/src/device-center/gateway.ts`
- Modify: `prod/cube-services/interfaces/src/device-center/response.ts`
- Modify: `prod/cube-services/interfaces/src/device-center/main.ts`
- Modify: `prod/cube-services/gateway/src/services/proxy/device-center/device-center-proxy.service.ts`
- Create: `prod/cube-services/gateway/src/controllers/device-center/device-center.controller.ts`
- Create: `prod/cube-services/gateway/src/controllers/device-center/device-center.controller.test.ts`
- Modify: `prod/cube-services/gateway/src/app.module.ts`
- Create: `prod/cube-services/client/src/device-center.client.ts`
- Create: `prod/cube-services/client/src/device-center.client.test.ts`
- Modify: `prod/cube-services/client/package.json`

- [ ] **Step 1: 定义归一化响应类型**

```ts
/** 电气中心：租户内逻辑唯一；id 可为哨兵或业务主键。 */
export interface ElectricalCenterSummary {
  id: string;
  name: string;
  facilityRoomCount: number;
}

export interface FacilityRoomSummary {
  id: string;
  name: string;
  /** 归属电气中心；若后端暂无中心实体可为空，由电气管理后续补齐。 */
  electricalCenterId?: string;
  deviceCount: number;
}

export interface ScopeDeviceSummary {
  id: string;
  name: string;
  productId: string;
  productName: string;
  categoryCode?: string;
  tagCodes: string[];
}
```

- [ ] **Step 2: 扩展 DeviceCenterGateway**

```ts
getElectricalCenter(): Promise<ElectricalCenterSummary | null>;
listFacilityRooms(electricalCenterId?: string): Promise<FacilityRoomSummary[]>;
listFacilityRoomDevices(facilityRoomId: string): Promise<ScopeDeviceSummary[]>;
```

- [ ] **Step 3: 实现 Gateway 适配**

Gateway 负责把业务后端字段归一化为上述稳定模型。后端若只有区域树和设备查询接口，组合逻辑留在 Gateway，不复制到 Studio、Demo 和 H5。

- [ ] **Step 4: 增加 Client deep-import 导出**

业务前端必须从 `@ghcloud/cube-services-client/device-center.client` 导入，禁止根路径导入。

- [ ] **Step 5: 运行三层契约测试和构建**

```bash
bun test prod/cube-services/gateway/src/controllers/device-center/device-center.controller.test.ts \
  prod/cube-services/client/src/device-center.client.test.ts
bunx tsc -p prod/cube-services/interfaces/tsconfig.json --noEmit
bun --cwd prod/cube-services/gateway run build
bun --cwd prod/cube-services/client run build
```

Expected: tests PASS，interfaces、gateway、client build success。

## Task 4: 建立场景部署存储和按目标查询

**Files:**

- Create: `prod/cube/scada/scada-studio-service/src/scenes/scene.module.ts`
- Create: `prod/cube/scada/scada-studio-service/src/scenes/scene.controller.ts`
- Create: `prod/cube/scada/scada-studio-service/src/scenes/scene.service.ts`
- Create: `prod/cube/scada/scada-studio-service/src/scenes/dto/create-scene.dto.ts`
- Create: `prod/cube/scada/scada-studio-service/src/scenes/dto/update-scene.dto.ts`
- Modify: `prod/cube/scada/scada-studio-service/src/app.module.ts`
- Create: `prod/cube-services/interfaces/src/scada/gateway.ts`
- Create: `prod/cube-services/interfaces/src/scada/request.ts`
- Create: `prod/cube-services/interfaces/src/scada/response.ts`
- Create: `prod/cube-services/interfaces/src/scada/main.ts`
- Modify: `prod/cube-services/interfaces/package.json`
- Create: `prod/cube-services/gateway/src/services/proxy/scada/scada-proxy.service.ts`
- Create: `prod/cube-services/gateway/src/controllers/scada/scada.controller.ts`
- Create: `prod/cube-services/gateway/src/controllers/scada/scada.controller.test.ts`
- Modify: `prod/cube-services/gateway/src/config/app.config.ts`
- Modify: `prod/cube-services/gateway/src/app.module.ts`
- Create: `prod/cube-services/client/src/scada.client.ts`
- Create: `prod/cube-services/client/src/scada.client.test.ts`
- Modify: `prod/cube-services/client/package.json`

- [ ] **Step 1: 建立独立 SceneModule**

模块职责：只管理部署元数据，不解析设备实时值。`SceneService` 使用构造器注入 `DATABASE_SERVICE_TOKEN`，`SceneModule` 导入 `DatabaseModule`。

- [ ] **Step 2: 建立可索引存储**

```sql
CREATE TABLE IF NOT EXISTS scene_deployments (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  target_kind TEXT NOT NULL,
  target_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft',
  definition TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_scene_target
  ON scene_deployments(target_kind, target_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_scene_published_target
  ON scene_deployments(target_kind, target_id)
  WHERE status = 'published';
```

- [ ] **Step 3: 实现 DTO 校验和 REST API**

```text
POST /scada/api/scenes/
GET  /scada/api/scenes/:id
PUT  /scada/api/scenes/:id
GET  /scada/api/scenes/resolve/:targetKind/:targetId
```

`targetKind` 只接受三个枚举值；同一目标重复发布返回 409；场景不存在返回 404；`definition` 解析失败返回 400。resolve 只返回 `published` 场景。

- [ ] **Step 4: 增加生产调用链**

Cube Services `scada` 模块代理场景查询接口，H5 使用 `@ghcloud/cube-services-client/scada.client`；SCADA Studio 在当前部署环境中仍可直连 `/scada/api` 管理接口。

- [ ] **Step 5: 验证服务**

Run:

```bash
bun --cwd prod/cube/scada/scada-studio-service run build
```

Expected: build success，并由服务测试证明按 `(target_kind, target_id)` 可直接解析，不再遍历所有页面内容。

## Task 5: 升级多设备实时订阅

**Files:**

- Modify: `prod/cube/basic/cube-iot-socket/src/main.ts`
- Create: `prod/cube/basic/cube-iot-socket/src/device-subscription.ts`
- Create: `prod/cube/basic/cube-iot-socket/src/device-subscription.test.ts`

- [ ] **Step 1: 写失败测试证明连续订阅不会退订前一个设备**

```ts
session.replaceDeviceProperties([
  { deviceId: "dev-a", propCodes: ["running"] },
  { deviceId: "dev-b", propCodes: ["running"] },
]);
expect(sentSubscribePayload.deviceIdAndPropCode).toEqual(["dev-a.running", "dev-b.running"]);
```

- [ ] **Step 2: 提供批量订阅 API**

```ts
interface DevicePropertySubscription {
  deviceId: string;
  propCodes: string[];
}

replaceDeviceProperties(subscriptions: DevicePropertySubscription[]): void;
```

一次 `SUBSCRIBE` 携带所有 `deviceId.propCode`；只有 replace 或 dispose 才退订旧 subscription ID。

- [ ] **Step 3: 保留 deviceDetail 兼容行为**

现有单设备调用不改签名；内部转调批量订阅能力。新增获取初始快照的批量 helper 时必须限制并发数，避免设施级页面同时发出无限请求。

- [ ] **Step 4: 输出带设备身份的更新**

```ts
interface DevicePropertyUpdate {
  deviceId: string;
  propCode: string;
  value: unknown;
}
```

原始更新 key 为 `deviceId.propCode` 时拆分一次；不得在上层按第一个点号以外的任意规则猜测设备。

- [ ] **Step 5: 运行测试和库构建**

```bash
bun test prod/cube/basic/cube-iot-socket/src/device-subscription.test.ts
bun --cwd prod/cube/basic/cube-iot-socket run build:lib
```

Expected: PASS / build success。

## Task 6: 在 Demo 中区分三种形态（本阶段主交付）

**Files:**

- Create: `prod/cube/scada/basic/editor/src/panels/device-slots-panel.tsx`
- Modify: `prod/cube/scada/basic/editor/src/panels/observe-panel.tsx`
- Modify: `prod/cube/scada/basic/editor/src/panels/bindings-panel.tsx`
- Modify: `prod/cube/scada/basic/editor/src/store/use-editor-store.ts`
- Create: `prod/cube/scada/scada-demo/src/views/scada-demo/scene-scope-switcher.tsx`
- Create: `prod/cube/scada/scada-demo/src/views/scada-demo/scene-deployment-modal.tsx`
- Create: `prod/cube/scada/scada-demo/src/views/scada-demo/slot-assignment-table.tsx`
- Modify: `prod/cube/scada/scada-demo/src/views/scada-demo/scada-demo.tsx`

- [x] **Step 1: Demo 入口区分三种形态**

页面列表/创建流固定三种：`电气中心` / `电气设施房` / `电气设备`，写入 `page.sceneScope`。电气中心创建时校验租户内是否已有中心页（Demo 可用本地规则模拟唯一）。

- [ ] **Step 2: 增加页面级设备槽位面板（设施房 / 中心子页需要）**

槽位编辑包含名称、产品、品类、标签约束和是否必填。删除已被 Binding 使用的槽位必须阻止并列出引用图元。电气设备形态可隐藏多槽位，仅展示产品绑定。

- [ ] **Step 3: 扩展现有 Tag 绑定**

绑定抽屉按“设备槽位 → 产品属性 → 逻辑 Tag → 图元属性”展示。产品属性类型继续使用现有兼容性规则校验。

- [ ] **Step 4: Demo 模拟部署预览（非电气管理正式绑定）**

- 电气设备：沿用现有产品属性映射与单设备预览。
- 电气设施房：用模拟设备列表做槽位分配预览；文案标明「生产绑定在电气管理」。
- 电气中心：入口 + 设施房子视图模拟导航；中心唯一。

- [ ] **Step 5: 处理多匹配与缺失**

候选设备为 0 时标红缺失；候选设备大于 1 时标黄歧义并要求选择；必填槽位未解决时禁止「模拟发布」；非必填槽位允许留空但在预检中警告。

- [ ] **Step 6: 保留当前页面兼容 UI**

仅含 `page.product`、无 `sceneScope` 的旧页面显示「电气设备（兼容）」，允许一键迁移为 `primary` 槽位 + `sceneScope=device`，不要求用户重新配置所有绑定。

## Task 7: 增加宿主无关的场景运行时

**Files:**

- Create: `prod/cube/scada/basic/studio-sdk/src/scene-runtime-controller.ts`
- Create: `prod/cube/scada/basic/studio-sdk/src/scene-runtime-controller.test.ts`
- Modify: `prod/cube/scada/basic/studio-sdk/src/types.ts`
- Modify: `prod/cube/scada/basic/studio-sdk/src/index.ts`
- Modify: `prod/cube/scada/basic/studio-sdk/src/direct-scada-page-handle.ts`
- Modify: `prod/cube/scada/basic/core/src/types/instance.ts`
- Modify: `prod/cube/scada/basic/engine/src/action/action-executor.ts`
- Modify: `prod/cube/scada/basic/editor/src/panels/events-panel.tsx`

- [ ] **Step 1: 定义宿主注入接口**

```ts
export interface ScadaSceneDataAdapter {
  start(routes: DevicePropertyRoute[], onUpdate: (update: DevicePropertyUpdate) => void): Promise<() => void>;
  write(route: DevicePropertyRoute, value: string | number | boolean): Promise<void>;
}
```

- [ ] **Step 2: 实现场景视图加载**

Controller 根据当前 `SceneViewDeployment` 加载页面，调用核心路由函数生成 routes，收到更新后写入对应 logicalTag。

- [ ] **Step 3: 实现场景导航**

提供 `openView(viewId)`、`back()`、`currentView`；增加 `openSceneView` 动作并在事件面板中选择目标视图。切换视图前必须释放旧页面句柄和旧实时订阅。宿主同时根据 `views` 渲染设施房导航，避免依赖静态画布动态生成房间图元。

- [ ] **Step 4: 实现控制反向路由**

页面逻辑 Tag 写操作必须命中唯一 `DevicePropertyRoute` 后调用 adapter.write；0 条或多条匹配均拒绝执行并返回明确错误。

- [ ] **Step 5: 验证资源生命周期**

测试覆盖初始加载、跨设施房导航、旧订阅释放、重复 `propCode` 分流和控制写入目标设备。

## Task 8: 改造消费宿主入口（电气设备检测 / H5 等）

> 注意：本任务在 Task 6 Demo 三种形态可用之后再做。宿主只消费，不重新发明形态分类。

**Files:**

- Split/Modify: `prod/cube/apps/iot-center/h5/src/views/monitor-detail/scada-device-tab.vue`
- Create: `prod/cube/apps/iot-center/h5/src/views/monitor-detail/use-scada-scene.ts`
- Create: `prod/cube/apps/iot-center/h5/src/views/monitor-detail/iot-scada-data-adapter.ts`
- 同步改造电气设备检测中已接入的组态展示点（定位到实际文件后列入）
- Add tests beside the new composable/adapter

- [ ] **Step 1: 电气设备入口改为按目标查询 Scene**

使用 `(targetKind=device, targetId=deviceId)` 查询；无显式部署时回退到旧 `productId` 页面一次，返回兼容场景，不再拉取所有页面详情。H5 与电气设备检测共用同一解析策略。

- [ ] **Step 2: 预留设施房 / 电气中心入口参数**

宿主传入 `scopeKind`、`scopeId`；组件不自行猜测 ID 类型。设施房与中心的真实绑定由电气管理完成后，宿主只按已发布场景加载。

- [ ] **Step 3: 接入批量实时订阅适配器**

Adapter 把 `DevicePropertyRoute[]` 转为批量设备属性订阅；更新按 `deviceId + propCode` 命中 logicalTag。

- [ ] **Step 4: 弹窗增加槽位上下文**

弹窗属性字段必须携带 `slotId`，读取对应设备值；旧字段缺少 slotId 时默认 `primary`。

- [ ] **Step 5: 验证消费方**

```bash
bun --cwd prod/cube/apps/iot-center/h5 run build:test
```

Expected: build success；电气设备路径回归通过；facilityRoom / electricalCenter 在有 Demo 模拟部署时可加载。

## Task 9: 端到端验收与灰度

**Files:**

- Review all files above
- Add E2E fixtures under the existing SCADA test locations

- [ ] **Step 1: 验收电气设备兼容性**

旧产品页面在设备监测 / 电气设备检测中继续展示；实时值、弹窗、显示隐藏事件和控制动作行为不回退。

- [ ] **Step 2: 验收 Demo 三种形态区分**

Demo 可创建并切换电气中心 / 电气设施房 / 电气设备；中心唯一规则生效；设施房多槽位预览不串设备。

- [ ] **Step 3: 验收电气设施房（Demo 模拟）**

使用两个都含 `running` 属性的设备，证明两个图元分别更新；断开其中一个后另一个继续刷新；切换页面释放全部订阅。文案标明生产绑定在电气管理。

- [ ] **Step 4: 验收电气中心（Demo 模拟）**

入口展示模拟设施房视图；点击进入 / 返回；不允许创建第二个中心场景。

- [ ] **Step 5: 验收控制安全**

从某设施房图元触发控制，只向对应槽位设备发送命令；路由不唯一、设备离线或无权限时不发送命令。

- [ ] **Step 6: 构建受影响 package**

```bash
bun --cwd prod/cube/scada/basic/studio-sdk run build
bun --cwd prod/cube/scada/scada-studio run build
bun --cwd prod/cube/scada/scada-demo run build
bun --cwd prod/cube/scada/scada-studio-service run build
bun --cwd prod/cube/basic/cube-iot-socket run build:lib
bun --cwd prod/cube/apps/iot-center/h5 run build:test
```

Expected: all builds success。

## 5. 推荐交付顺序

1. **Milestone A — Demo 三种形态 + 电气设备兼容**：Task 1、2、6 的形态区分与设备兼容。现网产品绑定不回退。
2. **Milestone B — 设施房多设备运行时**：Task 5、7 与 Demo 模拟槽位分配。第一个真正多设备可演示版本。
3. **Milestone C — 电气中心多视图**：中心唯一、入口下钻、场景存储按目标解析。
4. **Milestone D — 电气管理正式绑定**：设施房业务绑定 UI、生产部署写入；同步改造电气设备检测 / H5 消费路径（Task 3、4、8）。
5. **Milestone E — 增强能力**：聚合指标、动态图元重复器、跨场景联动；不阻塞前四个里程碑。

## 6. 关键风险与决策门槛

- **术语**：对外统一「电气中心 / 电气设施房 / 电气设备」，代码枚举 `electricalCenter | facilityRoom | device`；禁止再写「整个电气设施」以免与中心唯一语义冲突。
- **绑定归属**：设施房绑定在电气管理；Demo 只做形态与模拟，不假装完成生产绑定。
- **设施层级主键不稳定**：不得使用名称或树路径代替 ID。
- **实时订阅规模**：电气中心入口不默认订阅所有房间全部属性，只订阅当前视图和入口明确需要的摘要属性。
- **同产品多设备歧义**：必须依靠槽位、标签或人工分配解决，不能按列表第一条自动绑定。
- **控制安全**：展示路由与控制路由必须共用同一个槽位分配来源；部署变更应可审计。
- **模板与实例污染**：设施房/设备 ID 只存在 SceneDeployment（或电气管理关联表），页面复制和模板升级不得覆盖部署。
- **兼容周期**：`page.product` 与 `Binding.productProperty` 至少保留一个模型版本的只读迁移支持。
