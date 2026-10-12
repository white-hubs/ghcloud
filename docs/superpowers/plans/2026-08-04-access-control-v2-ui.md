# Access Control V2 UI Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将门禁管理六张卡片的容器、双主题视觉和放大能力统一到 `parking-car` 车流监测卡片规范，同时保持现有请求、轮询、筛选和数据转换逻辑不变。

**Architecture:** 六张业务卡片继续拥有各自的数据获取和渲染数据，只把可复用的标题图标与 V2 主题表面抽到 `access-control/_shared/`。所有卡片通过 `SubPanelTemplate` 的 `titleIcon`、`extra`、`zoom-content` 和默认插槽复用同一份展示函数，避免正常态与放大态内容分叉。

**Tech Stack:** Vue 3、Vue JSX/TSX、Less CSS Modules、Vite、ECharts、现有 `SubPanelTemplate` 放大弹窗。

---

### Task 1: 建立门禁 V2 共享视觉层

**Files:**
- Create: `prod/cube/apps/ue5/app/src/features/cards/access-control/_shared/access-control-card-icon.tsx`
- Create: `prod/cube/apps/ue5/app/src/features/cards/access-control/_shared/access-control-v2-shared.module.less`

- [x] **Step 1: 新增纯展示标题图标组件**

实现 `device`、`alarm`、`trend`、`people`、`analysis`、`records` 六种 SVG 图标，统一输出 `.v2-title-icon` 容器；组件只接受图标名，不接触业务状态。

- [x] **Step 2: 新增与车流监测一致的卡片表面规则**

为 `.access-control-v2-panel` 定义深色主题的渐变、边框、阴影和内容表面，并在 `:root[data-visual-theme="minimal-white"]` 下切换为白色卡片、浅色内容表面与深色文字。

- [x] **Step 3: 定义放大态共用尺寸**

为 `.access-control-card-body.is-zoom`、图表表面、列表表面提供只影响布局的尺寸规则，确保同一内容函数可同时用于卡片和弹窗。

### Task 2: 迁移统计、排行与分析卡片

**Files:**
- Modify: `prod/cube/apps/ue5/app/src/features/cards/access-control/cards/device-realtime-status.tsx`
- Modify: `prod/cube/apps/ue5/app/src/features/cards/access-control/cards/device-realtime-status.module.less`
- Modify: `prod/cube/apps/ue5/app/src/features/cards/access-control/cards/abnormal-event-top5.tsx`
- Modify: `prod/cube/apps/ue5/app/src/features/cards/access-control/cards/abnormal-event-top5.module.less`
- Modify: `prod/cube/apps/ue5/app/src/features/cards/access-control/cards/passage-analysis.tsx`
- Modify: `prod/cube/apps/ue5/app/src/features/cards/access-control/cards/passage-analysis.module.less`

- [x] **Step 1: 提取每张卡片的 `renderBody(isZoom)`**

让默认内容和 `zoom-content` 使用同一份响应式数据；只增加展示容器和放大态类名，不改请求参数、轮询、点击事件或数据赋值。

- [x] **Step 2: 接入 V2 标题与放大契约**

为三张卡片设置 `class="visual-v2-sub-panel v2-panel-card access-control-v2-panel access-control-card-theme"`、`zoomable`、对应 `zoom-title`/`zoom-width`，并通过 `titleIcon` 与 `zoom-content` 插槽渲染。

- [x] **Step 3: 对齐内部表面**

设备状态与通行分析使用卡片化饼图/图例表面，异常事件排行使用统一列表表面；颜色只从现有视觉主题变量读取。

### Task 3: 迁移趋势与实时数据卡片

**Files:**
- Modify: `prod/cube/apps/ue5/app/src/features/cards/access-control/cards/abnormal-traffic-trend.tsx`
- Modify: `prod/cube/apps/ue5/app/src/features/cards/access-control/cards/abnormal-traffic-trend.module.less`
- Modify: `prod/cube/apps/ue5/app/src/features/cards/access-control/cards/personnel-traffic-trend.tsx`
- Modify: `prod/cube/apps/ue5/app/src/features/cards/access-control/cards/personnel-traffic-trend.module.less`
- Modify: `prod/cube/apps/ue5/app/src/features/cards/access-control/cards/real-time-passage-data.tsx`
- Create: `prod/cube/apps/ue5/app/src/features/cards/access-control/cards/real-time-passage-data.module.less`

- [x] **Step 1: 将日期筛选迁移到 `extra` 插槽**

保留现有 `modelValue`、`onUpdate:modelValue` 和 `onSearch` 处理函数，仅调整到与车流卡片相同的标题栏插槽位置。

- [x] **Step 2: 为趋势卡片复用统计条与图表内容**

默认态和放大态使用相同的 `numberPasses`、`ecahrtsData` 和 `LineChart` 配置，放大态只增加高度类名。

- [x] **Step 3: 为实时表格增加统一表面与放大内容**

保持 `columns`、`data`、`showLength` 和轮询逻辑不变，仅增加 V2 容器、表格表面和放大插槽。

### Task 4: 验证业务不变与视觉契约闭合

**Files:**
- Verify: `prod/cube/apps/ue5/app/src/features/cards/access-control/`
- Verify: `prod/cube/apps/ue5/app/src/features/panel-shell/sub-panel-template.tsx`

- [x] **Step 1: 静态核对六张卡片的统一契约**

Run: `rg -n "zoomable|zoom-content|visual-v2-sub-panel|access-control-v2-panel" prod/cube/apps/ue5/app/src/features/cards/access-control/cards/*.tsx`

Expected: 六张卡片均包含 V2 容器、放大属性和放大内容插槽。

- [x] **Step 2: 核对业务差异**

Run: `git diff -U0 -- prod/cube/apps/ue5/app/src/features/cards/access-control/cards/*.tsx`

Expected: 请求函数、请求参数、定时器、watch、onMounted、onBeforeUnmount 与筛选回调保持不变；差异只包含展示函数、类名和插槽装配。

- [x] **Step 3: 运行格式与构建检查**

Run: `git diff --check`

Expected: 无空白错误。

Run: `bun run build`（工作目录 `prod/cube/apps/ue5/app`）

Expected: Vite 构建退出码为 0；仓库已有资源路径和无关模块 CSS 警告单独记录。

- [x] **Step 4: 检查构建产物主题选择器**

Run: `rg -n "minimal-white.*access-control-v2-panel|access-control-v2-panel.*sub-panel-content" prod/cube/apps/ue5/app/dist/assets/*.css`

Expected: 产物同时包含深色卡片规则与极简白覆盖，并且选择器受 `.access-control-v2-panel` 限定。

### Task 5: 统一内容块边框层级

**Files:**
- Modify: `prod/cube/apps/ue5/app/src/features/cards/access-control/_shared/access-control-v2-shared.module.less`
- Modify: `prod/cube/apps/ue5/app/src/features/panel-shell/operate-days.module.less`
- Modify: `prod/cube/apps/ue5/app/src/shared-ui/panel/pieList.module.less`

- [x] **Step 1: 移除内容布局层的重复边框**

将 `.sub-panel-content` 调整为无边框透明布局层，外层卡片与内部内容块各自只保留一圈边框。

- [x] **Step 2: 统一内部内容块视觉令牌**

统计、图表、列表与表格表面共用背景、边框、阴影和 `10px` 圆角变量，并针对极简白主题统一切换变量值。

- [x] **Step 3: 清理非结构性边框**

移除饼图图例行的逐行边框与圆角，趋势统计块改用统一 surface 视觉，不改变排行标识、图表辅助线和表格数据分隔线。
