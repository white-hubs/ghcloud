# 04 — 模块清单与迁移映射

本文归档 legacy 各模块清单、依赖关系与迁移建议，供 Phase 1–4 执行时查阅。

## 1. Shell 与基础设施

### 1.1 路由与入口

| 模块 | Legacy 路径 | 目标路径 | Phase | 说明 |
|---|---|---|---|---|
| 路由 | `src/router/index.ts` | `src/router/index.ts` | 1 | 简化为 `/` + `/login` |
| Legacy 3D 入口 | `src/views/index.vue` | — | 4 | 废弃（~1643 行） |
| Refactored 入口 | `src/pages/index.tsx` | `src/views/visualization/index.tsx` | 1 | 迁移基线 |
| 2D SCADA 入口 | `src/views-2d/index.vue` | `src/views/scada-2d/index.tsx` | 3 | 11 文件 |
| 3D 变体 | `src/views-3d/index.vue` | 合并或废弃 | 3 | 15 文件 |
| 海吉星入口 | `views-shengNong`（不在本仓库） | 待定 | 3 | 见 [`ue5-sn-migrate`](../../../../../legacy/ue5-sn-migrate) |
| 登录 | `src/login/` | `src/views/login/` | 1 | — |
| 运行时配置 | `public/config.js` | `public/config.js` → env | 1/4 | Phase 4 清理敏感信息 |

### 1.2 鉴权

| 模块 | Legacy 路径 | 目标路径 | Phase | 说明 |
|---|---|---|---|---|
| auth-store | `src/api/auth-store.ts` | `src/api/auth-store.ts` | 1 | 对齐 template |
| mf-root 全局状态 | `CubeMfRootGlobalState` | `src/api/session.ts` | 1 | standalone 替代 |
| 路由守卫 | `router/index.ts` beforeEach | `router/guard.ts` | 1 | 参考 template |

### 1.3 HTTP / API 层

Legacy `src/api/` 共 59 文件，主要为 axios 直调。目标统一为 `@ghcloud/cube-services-client` + `authRequest`。

| Legacy API 文件 | 关联 service 包 | 迁移建议 |
|---|---|---|
| `mdata.ts` | `@ghcloud/cube-mdata-service` | Phase 1：ConfigLoader 必需 |
| `alarm.ts` | `@ghcloud/cube-alarm-center-service` | Phase 2：随卡片迁移 |
| `iot.ts` | `@ghcloud/cube-iot-center-service` | Phase 1：IoT socket 依赖 |
| `equipment.ts` | 多 service | Phase 2 |
| `energy.ts` | — | Phase 2 |
| `flow.ts` / `passenger-flow.ts` | `@ghcloud/cube-traffic-detection-service` | Phase 2 |
| `park.ts` / `park-management.ts` | `@ghcloud/cube-parking-lot-service` | Phase 2 |
| `securitymanagement.ts` | `@ghcloud/cube-security-management-service` | Phase 2 |
| `shennong/*` | 海吉星专用 | Phase 3 |
| `service.ts` | 聚合入口 | Phase 4 删除 |

---

## 2. ModelSDK 与渲染

| 模块 | Legacy 路径 | 目标路径 | Phase |
|---|---|---|---|
| SDK 门面 | `pages/model-sdk/sdk.ts` | `model-sdk/sdk.ts` | 1 |
| UE5 SDK | `pages/model-sdk/ue-sdk.ts` | `model-sdk/ue-sdk.ts` | 1 |
| WebGL SDK | `pages/model-sdk/web-gl-sdk.ts` | `model-sdk/web-gl-sdk.ts` | 1 |
| GIS SDK | `pages/model-sdk/web-gis.ts` | `model-sdk/web-gis.ts` | 1 |
| SDK 接口 | `pages/model-sdk/model-sdk.ts` | `model-sdk/model-sdk.ts` | 1 |
| 3D 事件协议 | `@ghcloud/cube-visual-sdk` | 保持不变 | — |
| Three.js | `three@0.155.0` | 保持不变 | 1 |
| Leaflet | `leaflet` + `cube-map-plugins` | 保持不变 | 1 |
| 视频播放 | `@ghcloud/cube-player` | 保持不变 | 1 |
| RTC | `@ghcloud/cube-rtc` | 保持不变 | 2 |

---

## 3. 状态与事件

### 3.1 Pinia Store

| 模块 | Legacy 路径 | 目标路径 | Phase |
|---|---|---|---|
| 主 store | `pages/state/use-state-store.ts` | `stores/use-visualization-store.ts` | 1 |
| 头部状态 | `pages/state/use-state-head.ts` | `stores/use-head-store.ts` | 1 |
| 菜单状态 | `pages/state/use-state-menu.ts` | `stores/use-menu-store.ts` | 1 |
| 区域状态 | `pages/state/use-state-area.ts` | `stores/use-area-store.ts` | 1 |
| 其他状态 | `pages/state/use-state-other.ts` | 合并或 `stores/use-other-store.ts` | 1 |
| 初始化 | `pages/state/state-init.ts` | `stores/state-init.ts` | 1 |

### 3.2 事件总线

| 模块 | Legacy 路径 | 目标路径 | Phase |
|---|---|---|---|
| 事件实例 | `pages/event/event.ts` | `event/event.ts` | 1 |
| 事件核心 | `pages/event/event-core.ts` | `event/event-core.ts` | 1 |
| 事件名 | `pages/event/event-name.ts` | `event/event-name.ts` | 1 |
| 通用注册 | `pages/event/register/common.ts` | `event/register/common.ts` | 1 |
| 模型点击 | `pages/event/register/model-click.ts` | `event/register/model-click.ts` | 1 |
| GIS 注册 | `pages/event/register/gis.ts` | `event/register/gis.ts` | 1 |

### 3.3 配置加载

| 模块 | Legacy 路径 | 目标路径 | Phase |
|---|---|---|---|
| ConfigLoader | `pages/config-loader.ts` | `config/config-loader.ts` | 1 |

---

## 4. Widgets（UI 块）

Legacy `pages/widget/` 共 94 文件，已基本 TSX 化。

| Widget | Legacy 路径 | 目标路径 | 文件量级 | Phase |
|---|---|---|---|---|
| 标题栏 | `widget/title-bar/` | `widgets/title-bar/` | ~40 | 1 |
| 业务导航 | `widget/business-nav/` | `widgets/business-nav/` | ~8 | 1 |
| 区域导航 | `widget/area-nav/` | `widgets/area-nav/` | ~3 | 1 |
| 设备图例 | `widget/device-icon-legend/` | `widgets/device-icon-legend/` | ~3 | 1 |
| 弹窗管理 | `widget/modal/` | `widgets/modals/` | ~35 | 1 |
| 应急演练卡片 | `widget/business-cards/emergency-drill/` | `widgets/business-cards/emergency-drill/` | ~10 | 2 |
| Layout 壳 | `pages/components/layout/` | `widgets/layout/` 或 cube-app-design | ~3 | 1 |

---

## 5. businessPanel 域清单

共 **104** 个顶级域目录（含 `base-panel-render` 基础设施）。统计：**841** 个 `.vue` + **367** 个 `.tsx`。

图例：

- **迁移建议**：直接迁 / 改 TSX / 兼容 Vue / 废弃
- **Phase**：建议迁移阶段

### 5.1 已 TSX 化或 TSX 为主（优先直接迁移）

| 域 | Vue | TSX | 迁移建议 | Phase |
|---|---|---|---|---|
| `command-dispatch-v2` | 0 | 7 | 直接迁 | 2 P1 |
| `parking-car` | 0 | 10 | 直接迁 | 2 P1 |
| `safety-manage-cards` | 0 | 6 | 直接迁 | 2 P1 |
| `shandong-cards` | 0 | 6 | 直接迁 | 2 P2 |
| `educational-situation` | 0 | 6 | 直接迁 | 2 P2 |
| `people-flow` | 1 | 6 | 改 TSX（1 vue） | 2 P1 |
| `pz-demo` | 34 | 269 | 直接迁 + 逐步改 vue | 2 P2 |
| `zhongda-heshun` | 3 | 53 | 直接迁 + 改 vue | 2 P2 |
| `base-panel-render` | 0 | 1 | 直接迁（基础设施） | 1 |

### 5.2 通用高频域（Vue 为主，Phase 2 P0）

| 域 | Vue | TSX | 迁移建议 | Phase |
|---|---|---|---|---|
| `overview` | 14 | 0 | 改 TSX | 2 P0 |
| `security-overview` | 23 | 0 | 改 TSX | 2 P0 |
| `universal-panel` | 23 | 0 | 改 TSX | 2 P0 |
| `security-monitoring-safty` | 9 | 0 | 改 TSX | 2 P0 |
| `energy-consumption` | 26 | 0 | 改 TSX | 2 P1 |
| `triage-queue` | 25 | 0 | 改 TSX | 2 P1 |
| `public` | 78 | 2 | 公共组件库；兼容 Vue | 2 P1 |

### 5.3 中等规模域（按租户驱动）

| 域 | Vue | TSX | 迁移建议 | Phase |
|---|---|---|---|---|
| `meat-trading` | 46 | 0 | 改 TSX 或兼容 | 2 P3 |
| `demo-panel` | 36 | 0 | 废弃或低优 | 2 P3 |
| `court-panel` | 28 | 1 | 改 TSX | 2 P3 |
| `electronicPatrol` | 21 | 0 | 改 TSX | 2 P3 |
| `intelligent-lighting` | 18 | 0 | 改 TSX | 2 P3 |
| `medical-intercom` | 18 | 0 | 改 TSX | 2 P3 |
| `merchant-manage` | 15 | 0 | 改 TSX | 2 P3 |
| `small-engineering` | 15 | 0 | 改 TSX | 2 P3 |
| `park-management` | 14 | 0 | 改 TSX | 2 P3 |
| `visor-panel` | 13 | 0 | 改 TSX | 2 P3 |
| `medical-gas` | 13 | 0 | 改 TSX | 2 P3 |
| `safety-management` | 12 | 0 | 改 TSX | 2 P3 |
| `electronicPatrol-new` | 10 | 0 | 改 TSX | 2 P3 |

### 5.4 小规模域（Vue ≤10，按需迁移）

<details>
<summary>点击展开完整列表（81 个域）</summary>

| 域 | Vue | TSX | 迁移建议 |
|---|---|---|---|
| `Information-release` | 4 | 0 | 按需 |
| `Prepaid` | 8 | 0 | 按需 |
| `access-control` | 8 | 0 | 按需 |
| `air-conditioning` | 2 | 0 | 按需 |
| `air-exhaust` | 2 | 0 | 按需 |
| `asset-management` | 6 | 0 | 按需 |
| `boiler` | 9 | 0 | 按需 |
| `broadcast` | 5 | 0 | 按需 |
| `building-details` | 1 | 0 | 按需 |
| `children-hospital` | 6 | 0 | 按需 |
| `cleanConditioning` | 1 | 0 | 按需 |
| `cold-heat-sources` | 2 | 0 | 按需 |
| `command-dispatch` | 4 | 0 | 废弃（v2 替代） |
| `command-dispatchNew` | 3 | 0 | 废弃（v2 替代） |
| `comprehensive-protection` | 3 | 0 | 按需 |
| `computer-network` | 2 | 0 | 按需 |
| `consumption` | 8 | 0 | 按需 |
| `convenient-access` | 6 | 0 | 按需 |
| `delivery` | 9 | 0 | 按需 |
| `demo-panel-layout` | 2 | 0 | 废弃 |
| `drain-off-water` | 2 | 0 | 按需 |
| `electricVehicle` | 6 | 0 | 按需 |
| `electrical` | 5 | 0 | 按需 |
| `electrical-new` | 2 | 0 | 按需 |
| `elevator-monitoring` | 6 | 0 | 按需 |
| `emergency-phone` | 5 | 0 | 按需 |
| `emergency-resources` | 8 | 0 | 按需 |
| `environmental-monitor` | 4 | 0 | 按需 |
| `environmental-monitoring` | 9 | 0 | 按需 |
| `environmental-new-monitor` | 7 | 0 | 按需 |
| `estate-management` | 6 | 0 | 按需 |
| `fire-control` | 5 | 0 | 按需 |
| `fire-controlNew` | 4 | 0 | 按需 |
| `floorEquipment` | 6 | 0 | 按需 |
| `freeze` | 2 | 0 | 按需 |
| `fresh-air-manage` | 2 | 0 | 按需 |
| `gardens` | 3 | 0 | 按需 |
| `gas-management` | 2 | 0 | 按需 |
| `granary` | 2 | 0 | 按需 |
| `hospital` | 5 | 0 | 按需 |
| `library-management` | 6 | 0 | 按需 |
| `lift-manage` | 9 | 0 | 按需 |
| `lighting` | 5 | 0 | 按需 |
| `logistics` | 8 | 0 | 按需 |
| `luzhouOverview` | 2 | 0 | 按需 |
| `management-meetings` | 5 | 0 | 按需 |
| `medical-gas-new` | 8 | 0 | 按需 |
| `operation` | 4 | 0 | 按需 |
| `operation-management` | 3 | 0 | 按需 |
| `park-situation` | 1 | 0 | 按需 |
| `passenger-flow` | 6 | 0 | 按需 |
| `perimeter` | 2 | 0 | 按需 |
| `personnelCounting` | 7 | 0 | 按需 |
| `public-security` | 5 | 0 | 按需 |
| `purification-system` | 2 | 0 | 按需 |
| `restaurant` | 6 | 0 | 按需 |
| `roamingDevices` | 1 | 0 | 按需 |
| `security` | 7 | 0 | 按需 |
| `security-check` | 2 | 0 | 按需 |
| `security-situationNew` | 8 | 0 | 按需 |
| `sewage-disposal` | 3 | 0 | 按需 |
| `smart-card` | 7 | 0 | 按需 |
| `staff-management` | 10 | 0 | 按需 |
| `stop-manage` | 7 | 0 | 按需 |
| `supply-guarantee` | 2 | 0 | 按需 |
| `surgical-demonstration` | 7 | 0 | 按需 |
| `surgical-demonstration-new` | 5 | 0 | 按需 |
| `telecommunications` | 1 | 0 | 按需 |
| `toilet-management` | 1 | 0 | 按需 |
| `traffic-light` | 3 | 0 | 按需 |
| `traffic-volume` | 5 | 0 | 按需 |
| `trafficControl` | 2 | 0 | 按需 |
| `video-patrol` | 8 | 0 | 按需 |
| `videoMonitoring` | 1 | 0 | 按需 |
| `water-purification` | 5 | 0 | 按需 |

</details>

### 5.5 明确不迁移或单独评估

| 项 | 原因 | 处理 |
|---|---|---|
| `demo-panel` / `demo-panel-layout` | 演示用途 | 确认无租户后废弃 |
| `command-dispatch` / `command-dispatchNew` | 已被 v2 替代 | 废弃 |
| `views-shengNong` | 代码在 `ue5-sn-migrate` | Phase 3 单独评估 |
| `device-icon-legend copy.tsx` | 重复文件 | 迁移时删除 |

---

## 6. workspace 依赖映射

### 6.1 核心依赖（Phase 1 必须保留）

| 包 | 用途 | 目标 |
|---|---|---|
| `@ghcloud/cube-visual-sdk` | 3D 事件、卡片定义 | 保留 |
| `@ghcloud/cube-visualization-service` | 可视化配置 API | 保留 |
| `@ghcloud/cube-map-plugins` | GIS 地图 | 保留 |
| `@ghcloud/cube-player` | 视频播放 | 保留 |
| `@ghcloud/cube-app-design` | CubeLayout 等 | 保留 |
| `@ghcloud/cube-ui` | UI 组件 | 保留（新增） |
| `@ghcloud/cube-auth-service` | 鉴权 | 保留 |
| `@ghcloud/cube-auth-utils` | auth 工具 | 保留 |
| `@ghcloud/cube-protocol` | 协议类型 | 保留 |
| `@ghcloud/cube-iot-socket` | IoT WebSocket | 保留 |
| `@ghcloud/cube-theme` | 主题 | 保留 |
| `@ghcloud/cube-utils` | 工具函数 | 保留 |
| `three` | WebGL 渲染 | 保留 |
| `leaflet` | GIS | 保留 |
| `echarts` / `echarts-gl` | 图表 | 保留 |
| `pinia` / `vue-router` | 框架 | 保留 |

### 6.2 业务 service 依赖（Phase 2 随卡片按需引入）

| 包 | 关联域 |
|---|---|
| `@ghcloud/cube-alarm-center-service` | alarm、security |
| `@ghcloud/cube-alarm-charts` / `cube-alarm-modal` | 报警卡片 |
| `@ghcloud/cube-iot-center-service` | IoT 设备 |
| `@ghcloud/cube-parking-lot-service` | parking-car |
| `@ghcloud/cube-traffic-detection-service` | people-flow、passenger-flow |
| `@ghcloud/cube-security-management-service` | security |
| `@ghcloud/cube-visitor-management-service` | visitor |
| `@ghcloud/cube-electric-vehicle-service` | electricVehicle |
| `@ghcloud/cube-small-engineering-service` | small-engineering |
| `@ghcloud/cube-zhongda-heshun-service` | zhongda-heshun |
| `@ghcloud/cube-daily-inspection-service` | inspection |
| `@ghcloud/cube-books-management-service` | library |
| `@ghcloud/cube-maintain-service` | maintain |
| `@ghcloud/cube-mdata-service` | 模型数据 |
| `@ghcloud/cube-ouaa-service` | 组织用户 |
| `@ghcloud/cube-file-service` | 文件 |
| `@ghcloud/cube-dictionary-service` | 字典 |
| `@ghcloud/cube-bulletin-service` | 公告 |
| `@ghcloud/cube-slide-rail-service` | 滑轨 |
| `@ghcloud/cube-third-connection-service` | 第三方 |
| `@ghcloud/cube-safety-supervision-app` | 安全监管（auth-store 引用） |

### 6.3 待移除或替换

| 包 | 原因 | 替代 |
|---|---|---|
| `@ghcloud/cube-mf-root` | standalone 不需要 mf-root | `session.ts` |
| `@ghcloud/generic-component` | ADR-0005 禁止新依赖 | `cube-ui` / `cube-app-design` |
| `@ghcloud/desktop-client-ui` | 评估使用面 | 按需 |
| `axios` | ADR-0004 | `authRequest` + services-client |
| `lodash` | ADR-0006 | `cube-utils` |
| `moment` | 已过时 | `dayjs` |
| `mitt` / `tiny-emitter` | 已有 event 模块 | 统一 event-core |

### 6.4 特殊能力依赖（按需保留）

| 包 | 用途 |
|---|---|
| `@ghcloud/cube-ai-assistant-app/chat` | title-bar AI 助手 |
| `@ghcloud/cube-speech-assistant` | 语音助手 |
| `@ghcloud/cube-rtc` | 实时通信 |
| `@ghcloud/cube-message-sdk` | 消息 |
| `@ghcloud/cube-safety-supervision-app` | 安全监管面板 |
| `gsap` / `lottie-web` | 动画 |
| `heatmap.js` / `@rengr/heatmap.js` | 热力图 |
| `postprocessing` | Three.js 后处理 |
| `swiper` | 轮播 |
| `d3-geo` / `delaunator` / `point-in-polygon` | GIS 计算 |

---

## 7. 关联仓库

| 仓库 | 路径 | 关系 | 迁移 |
|---|---|---|---|
| ue5-migrate | `legacy/ue5-migrate` | 主 legacy 代码 | Phase 4 下线 |
| ue5-sn-migrate | `legacy/ue5-sn-migrate` | 海吉星 shengNong 入口 | Phase 3 评估合并/独立 |
| bimops-fe-web-migrate | `legacy/bimops-fe-web-migrate` | 主应用入口 | Phase 1 改路径 |
| cube-visual-sdk | `prod/cube/basic/cube-visual-sdk` | 卡片协议 | 持续共用 |
| visualization service | `prod/cube/apps/visualization/service` | 配置 API | 持续共用 |
| cube-player | `prod/cube/basic/cube-player` | 视频 | 持续共用 |
| cube-map-plugins | `prod/cube/basic/cube-map-plugins` | GIS | 持续共用 |

### 7.1 ue5-sn-migrate 说明

- `public/config.js` 中 tenant `21481321`、`24894805`、`62220897` 配置 `entry: views-shengNong`
- 该 entry 目录 **不在** `ue5-migrate` 仓库，完整代码在 `ue5-sn-migrate`（~1176 文件）
- 包含 `views-shengNong/globe-map/`（地球可视化）、`china-map/`、`shengnong-custom-panel/` 等
- Phase 3 需决策：合并为 `apps/ue5/app` 的 tenant 条件模块，或独立 `apps/ue5-sn/app`

---

## 8. card-register 与 cube-visual-sdk

| 文件 | 路径 | 说明 |
|---|---|---|
| 卡片注册表 | `businessPanel/base-panel-render/card-register.ts` | 1200+ 行，Phase 2 按域拆分 |
| 面板渲染 | `businessPanel/base-panel-render/base-panel-render.tsx` | 根据 panelName 渲染卡片 |
| 卡片枚举 | `cube-visual-sdk/.../card-definition.ts` | code 与 register key 一致 |
| 面板组合 | `cube-visual-sdk/.../panel-definition.ts` | 面板 = 卡片集合 |

迁移时 **cardDefinition code 不变**，仅组件路径从 `businessPanel/` 改为 `cards/`。

---

## 9. 统计摘要

| 指标 | 数量 |
|---|---|
| legacy 源文件（vue/tsx/ts） | ~1624 |
| businessPanel 域 | 104 |
| businessPanel Vue 文件 | 841 |
| businessPanel TSX 文件 | 367 |
| pages/widget 文件 | 94 |
| Legacy API 文件 | 59 |
| workspace 依赖 | 40+ |
| npm 直依赖 | 20+ |
