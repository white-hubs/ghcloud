# Access Control UI Detail Convergence Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将门禁管理六张当前注册卡片的全部视觉细节统一到 `parking-car` V2 卡片规范，并确保深色与极简白主题下保持一致层级。

**Architecture:** 六张业务卡片继续只负责数据请求、轮询、筛选和数据装配；`access-control-v2-shared.module.less` 作为唯一视觉令牌入口。`OperateDays`、`EventAlarmItem`、`PieList`、饼图、空状态和 `RollTable` 仅在 `.access-control-card-theme` 作用域内应用新规范，避免影响其他业务卡片。

**Tech Stack:** Vue 3、Vue JSX/TSX、Less CSS Modules、CSS 自定义属性、ECharts、Vite。

---

## Component map

- `SubPanelTemplate`: 外层卡片、标题栏、标题图标插槽和放大按钮；不持有门禁业务状态。
- 六张 `access-control/cards/*.tsx`: 保留原请求与交互，只组合普通态/放大态内容。
- `access-control-v2-shared.module.less`: 定义间距、字号、颜色、圆角、边框、阴影和双主题令牌。
- `OperateDays` / `EventAlarmItem` / `PieList` / `RoundPie` / `PlanePie` / `NoData` / `RollTable`: 使用共享令牌呈现特定内容类型，不改变 props、emits 或请求。

### Task 1: 统一卡片基础视觉令牌

**Files:**
- Modify: `prod/cube/apps/ue5/app/src/features/cards/access-control/_shared/access-control-v2-shared.module.less`

- [x] **Step 1: 定义统一尺寸与字体令牌**

在 `.access-control-v2-panel` 中定义 `4/6/10/16px` 间距、`10px` 内容圆角，以及 `11/12/13/16/22px` 语义字号；所有字号使用 `calc(var(--font-size-scale, 1) * Npx)`。

- [x] **Step 2: 定义统一颜色与表面令牌**

普通文字、次要文字、标签、数字、surface 背景、边框、阴影、分隔线分别映射到现有 `--visual-*` 主题变量；在 `minimal-white` 下只替换令牌值。

- [x] **Step 3: 修正容器内边距层级**

保持外层 `.sub-panel` 的 `0 10px 10px`，将 `.sub-panel-content` 统一为 `padding: 10px 0 0`，避免外层与内容层重复横向缩进；普通内容块间距固定为 `10px`，放大态为 `16px`。

### Task 2: 统一统计、饼图和图例细节

**Files:**
- Modify: `prod/cube/apps/ue5/app/src/features/panel-shell/operate-days.module.less`
- Modify: `prod/cube/apps/ue5/app/src/shared-ui/panel/pieList.tsx`
- Modify: `prod/cube/apps/ue5/app/src/shared-ui/panel/pieList.module.less`
- Modify: `prod/cube/apps/ue5/app/src/shared-ui/panel/charts/roundPie/roundPie.module.less`
- Modify: `prod/cube/apps/ue5/app/src/shared-ui/panel/charts/pie/planePie.module.less`
- Modify: `prod/cube/apps/ue5/app/src/shared-ui/panel/charts/pie/planePie.tsx`

- [x] **Step 1: 统一统计条层级**

统计标签使用 `12px` 标签色，主数字使用 DIN `22px` 数字色，单位使用 `12px` 次要色；容器高度、padding、圆角、边框和阴影使用共享令牌。

- [x] **Step 2: 统一饼图尺寸和中心文字**

普通态饼图统一 `108px`，放大态统一 `200px`；中心标签 `11px`、中心数值 `16px`，放大态数值 `24px`。修正 `PlanePie` 环形半径顺序为 `70%/85%`。

- [x] **Step 3: 统一图例行**

图例采用 `4px` 行间距、`22px` 最小行高、`12px` 名称、`13px` DIN 数值、`8px` 色块；移除行级背景和边框，只保留内容块外层边框。

### Task 3: 统一排行、图表、空状态和表格细节

**Files:**
- Modify: `prod/cube/apps/ue5/app/src/shared-ui/panel/eventAlarmItem.module.less`
- Modify: `prod/cube/apps/ue5/app/src/shared-ui/panel/noData.module.less`
- Modify: `prod/cube/apps/ue5/app/src/features/panel-shell/roll-table/index.module.less`

- [x] **Step 1: 统一排行排版**

排行名称 `13px`、数量 `16px`、辅助文字 `12px`，行间距 `12px`；文本与数字使用主题令牌，前三名颜色和涨跌颜色保留为语义色。

- [x] **Step 2: 统一空状态**

空状态文字使用 `12px` 次要色，普通态图片限制为 `72px`，放大态使用 `88px`，并保持水平垂直居中。

- [x] **Step 3: 统一实时表格**

门禁作用域内表头与行高分别固定为 `32px/30px`，字号统一 `13px`；表头、奇偶行、hover 和分隔线使用 `--visual-roll-table-*`，由外层 surface 提供唯一边框和圆角。

### Task 4: 统一六张卡片的局部布局

**Files:**
- Modify: `prod/cube/apps/ue5/app/src/features/cards/access-control/cards/device-realtime-status.module.less`
- Modify: `prod/cube/apps/ue5/app/src/features/cards/access-control/cards/abnormal-event-top5.module.less`
- Modify: `prod/cube/apps/ue5/app/src/features/cards/access-control/cards/abnormal-traffic-trend.module.less`
- Modify: `prod/cube/apps/ue5/app/src/features/cards/access-control/cards/personnel-traffic-trend.module.less`
- Modify: `prod/cube/apps/ue5/app/src/features/cards/access-control/cards/passage-analysis.module.less`
- Modify: `prod/cube/apps/ue5/app/src/features/cards/access-control/cards/real-time-passage-data.module.less`

- [x] **Step 1: 普通态布局收口**

所有卡片使用共享 `10px` 内容块间距；统计/饼图 surface 使用 `10px 12px`，图表 surface 使用 `4px 0 0`，表格 surface 使用 `0`，避免多重 padding。

- [x] **Step 2: 放大态布局收口**

所有放大内容使用共享 `16px` 间距和 `16px` 外围 padding；饼图、图表、列表、表格仅调整高度，不改变数据组件和交互。

- [x] **Step 3: 清理无效局部样式**

移除未被模板使用的 `.ringRatio` 等旧声明，确保卡片局部 Less 只描述该卡片独有尺寸。

### Task 5: 验证完整视觉契约和业务不变

**Files:**
- Verify: `prod/cube/apps/ue5/app/src/features/cards/access-control/`
- Verify: `prod/cube/apps/ue5/app/src/features/panel-shell/`
- Verify: `prod/cube/apps/ue5/app/src/shared-ui/panel/`

- [x] **Step 1: 静态视觉令牌检查**

Run: `rg -n "access-control-(space|font|surface|text|value)" prod/cube/apps/ue5/app/src/features/cards/access-control prod/cube/apps/ue5/app/src/features/panel-shell prod/cube/apps/ue5/app/src/shared-ui/panel`

Expected: 门禁相关字体、间距、颜色和 surface 规则均引用共享令牌；固定色只保留状态语义色和图标色。

- [x] **Step 2: 业务差异检查**

Run: `git diff -U0 -- prod/cube/apps/ue5/app/src/features/cards/access-control/cards/*.tsx`

Expected: 本轮不改变请求函数、请求参数、定时器、watch、筛选回调和数据赋值。

- [x] **Step 3: 格式与生产构建**

Run: `git diff --check`

Expected: 退出码 `0`。

Run: `bun run build` in `prod/cube/apps/ue5/app`

Expected: Vite 构建退出码 `0`；已有资源路径、无关 fire 模块 CSS 和 chunk-size 警告单独记录。

- [x] **Step 4: 构建产物检查**

Run: `rg -n "--access-control-space-md|--access-control-font-body|access-control-table-surface" prod/cube/apps/ue5/app/dist/assets/*.css`

Expected: 生产 CSS 中包含统一视觉令牌、深色规则与 `minimal-white` 覆盖。
