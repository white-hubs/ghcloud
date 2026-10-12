# 电气中心与设备监测实施计划

> 范围：新版 `prod/cube/apps/electrical-safety/app`。组态图只提供待接入占位，不复用原型图片或旧版电气应用代码。

## 目标

- 新增 `/electrical-center`，展示安全评分、活跃告警、设备在线率、线损率、配电房环境、设备健康分布和诊断摘要。
- 新增 `/device-monitoring`，提供配电房切换、环境/视频概览、设备卡片与列表、设备详情和监测面板配置。
- 所有表格使用 `useCubeTable`，操作列固定右侧；页面外框不额外加边框，仅标准卡片保留卡片边界。
- Select 未选择时传入 `undefined`，保证 placeholder 正常显示。

## 文件与步骤

1. `src/views/device-monitoring/device-monitoring.data.ts`
   - 定义配电房环境、摄像头、设备指标、健康维度、告警和运维记录类型。
   - 提供页面初始静态数据，刷新后恢复初始状态。

2. `src/views/shared/scada-placeholder.tsx`
   - 统一渲染组态图待接入状态。
   - 明确说明本阶段不展示一次接线图、拓扑和实时控制。

3. `src/views/electrical-center/electrical-center.tsx`
   - 从共享设备数据计算健康评分和在线率。
   - 使用 `useCubeTable` 展示可按等级筛选的实时告警，详情操作列固定右侧。
   - 配电房卡片跳转设备监测并携带 `facilityId`。
   - 诊断摘要跳转设备深度分析。
   - 组态区域只使用共享占位组件。

4. `src/views/device-monitoring/device-monitoring.tsx`
   - 通过路由参数初始化设施，并同步搜索、类型、在线状态和视图状态。
   - 卡片视图展示关键指标与健康评分；列表视图使用 `useCubeTable`。
   - 组态视图只显示占位。

5. `src/views/device-monitoring/device-detail-modal.tsx`
   - 使用系统 Modal、Tabs、Descriptions、Progress。
   - 展示基本信息、实时参数、控制记录、历史事件、运维记录和 AI 分析。
   - 详情内列表均使用 `useCubeTable`。

6. `src/views/device-monitoring/panel-config-modal.tsx`
   - 按设备类型选择最多 6 个监测指标。
   - 支持上下排序、恢复默认和保存反馈，配置仅保留在当前页面会话。

7. `src/router/index.ts`
   - 注册两条新路由。
   - 根路由由深度分析调整为电气中心。

8. 验证
   - `bun -F @ghcloud/cube-electrical-safety-app build`
   - 检查新增文件中的表格 hook、固定操作列、Select placeholder 和组态图占位。
