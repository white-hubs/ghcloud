# UE5 新版可视化：大小屏自适应方案分析

> 范围：`@ghcloud/cube-ue5-app`（`prod/cube/apps/ue5/app`）  
> 对照：`legacy/ue5-migrate`  
> 日期：2026-08-18（同日补充：2/3 卡铺满、超过 3 卡滚动）  
> 结论：**不要再把面板 `transform: scale` 当大屏主方案。** 大屏最优解是「按卡片数量和内容档案分配侧栏高度」：左右栏配置 **2 张或 3 张卡时按内容权重协调铺满、无侧栏滚动**；**超过 3 张时按三卡槽高度堆叠并滚动**。未配置档案的卡才默认等分。字号用 `min(宽/1920, 高/1080)` 的 contain rem，与卡槽高度对齐。三维画面禁止整页缩放。

## 0. 最终需求基线与可靠方案

### 0.1 需求收口

1. UE5 / WebGL / GIS 画布始终 `100% × 100%`，不得整页或面板 transform。
2. 左右栏独立计算有效卡数：
   - 1 张：暂时保持自然高度；
   - 2/3 张：按稳定内容权重铺满侧栏可用高度；
   - ≥4 张：按三卡槽基准高度堆叠，侧栏滚动。
3. 指标、图表、列表、密集混合卡不能使用同一种拉伸方式。
4. 浏览器窗口变矮、Ctrl/Cmd 缩放、进入/退出全屏、拖到不同系统缩放的显示器后，HUD、ECharts、弹窗和 UE 流必须同步。
5. 科技蓝毛玻璃必须能采到 3D；极简白、SCADA 2D、GIS、登录页和 Legacy 整板不能回归。
6. 任意极短窗口下优先保证可读性，宁可 compact/滚动，也不继续缩字或压扁。

### 0.2 单一视口度量

所有 UI 只读取 CSS 可视区域，不用物理屏幕分辨率判断布局：

```text
viewportW = document.documentElement.clientWidth
viewportH = document.documentElement.clientHeight
rawScale  = min(viewportW / 1920, viewportH / 1080)
uiScale   = max(rawScale, 2/3)
```

`2/3` 是建议初值，对应约 `1280×720` 的最低正常窗口，必须通过真机可读性校准。

```text
rawScale >= 2/3
  → normal
  → 2/3 张按权重铺满
  → ≥4 张按三卡槽滚动

rawScale < 2/3
  → compact
  → 根尺寸不再继续缩小
  → 减 padding / legend / 可见行数
  → 密集卡卡内滚动或查看更多

compact 仍放不下
  → overflow
  → 允许侧栏滚动
  → 禁止 scaleY
```

桌面浏览器 80%～150% 缩放通常会反向改变 CSS viewport，contain rem 与浏览器放大基本抵消，物理视觉保持稳定。不要用 `devicePixelRatio` 调整 DOM 布局；DPR 只服务 Canvas 清晰度和 UE 流分辨率。

### 0.3 卡片高度与内容策略

每张卡通过稳定档案声明：

```ts
interface CardLayoutProfile {
  weight: number;
  minHeight: number;
  compactMinHeight: number;
  fillMode: "center" | "stretch" | "rows" | "scroll";
}
```

- KPI：`center`，内容居中，不拉散指标。
- 图表：`stretch`，图表区吃剩余高度并触发 ResizeObserver。
- 列表：`rows`，行高固定，动态计算可见行数。
- 密集卡：`scroll`，先 compact，再卡内滚动/查看更多。
- 未建档案：默认 `weight=1`，等权铺满。
- 权重不得随实时数据条数变化，避免刷新时布局跳动。

### 0.4 统一重排事件

建立单一 viewport coordinator，用 `requestAnimationFrame` 合并：

- `window.resize`
- `visualViewport.resize`（存在时）
- `fullscreenchange`
- `orientationchange`
- `pageshow`
- `ResizeObserver`（应用根或 layout root）

一次重排中按顺序：

1. 更新 CSS viewport metrics 与根 rem；
2. 更新卡槽 normal/compact/overflow；
3. 等待 Vue DOM patch；
4. ResizeObserver 驱动 ECharts；
5. UE Pixel Streaming 更新流分辨率；
6. 区域标签/热力图根据真实面板 `getBoundingClientRect()` 定位。

不得让 `amfe-flexible`、`viewport-scale`、UE SDK 和几十个图表各自竞争写尺寸。

---

## 1. 业务约束（方案必须满足）

UE5 可视化不是普通后台页，也不是纯 DataV 大屏。真正要兼容的是同一套 HUD 叠在实时三维画面上：

| 约束 | 含义 | 对适配的硬限制 |
|---|---|---|
| 三维画面 1:1 | UE5 像素流 / WebGL / GIS 必须铺满视口 | **禁止整页 `transform: scale`**，否则光标、点击、流分辨率全错 |
| **侧栏卡数决定高度** | **2 或 3 张卡铺满整屏；超过 3 张才允许滚动** | **高度用 flex 卡槽分配，不要用 scale 把整栏压扁** |
| 左右数据面板叠加 | 默认设计宽约 `400px`，顶栏 + 底栏导航 | 面板只能自己适配，不能带动画布一起缩 |
| 科技蓝毛玻璃 | 卡片 `backdrop-filter` 要采到 3D 画面 | **`transform` 即使是 `scale(1)` 也会形成 containing block**，毛玻璃失效 |
| 卡片内容形态固定 | 指标卡 / 圆环 / 折线 / TopN / 表格「可见 N 行滚动」 | 卡壳铺满后，图表/列表在壳内伸展；不要改成 H5 换行 |
| 多业务面板 | 100+ 业务域、配置端拼卡、V2 双主题 | 铺满规则做在 `BasePanelRender` 壳上，不能每张卡自己算 100vh |
| 真实终端混杂 | 指挥 LED、值班 1080p、笔记本、2K/4K、超宽 | 未登记分辨率不能乱匹配 |

已出现在代码注释或映射表里的目标分辨率：

- `1920×1080`：设计稿与最常见值班屏
- `2550×1440` / `2560×1440`：2K
- `4800×1890`：宽幅 LED
- `7680×2160`：超宽拼接屏
- `2800×920`：极扁条屏
- `3840×2160`：注释提到，但映射表未登记

「小屏」在本业务里主要是 **1366～1600 宽的笔记本 / 投屏窗口**，不是手机 H5。笔记本上同样遵守 2/3 铺满、>3 滚动。

---

## 2. 新版当前方案（代码事实）

新版从 legacy 迁过来，并做了毛玻璃补丁。实际是 **四条机制叠在一起**，外加一个几乎没用上的铺满通道。

### 2.1 宽度 rem（全局尺寸主通道）

1. Vite `postcss-pxtorem`：`rootValue: 192`，样式里的 `px` 编译成 `rem`。
2. 运行时 `import "amfe-flexible"`：`html { font-size: clientWidth / 10 }`。  
   在 `1920` 宽时 `1rem = 192px`。宽度 `1366` 时整体约 `0.71` 倍，`3840` 时约 `2` 倍，`7680` 时约 `4` 倍。
3. 内联样式走 `px2rem()`（同样 `/192`）。
4. ECharts 字号走 `calcFontSize()`：`(size * width / 1920) / --scale`。

`src/application/config/rem.ts` 仍按 `16 * width/1920` 写 `html` 字号，但 **没有被入口引用**。若误接入会和 `amfe-flexible` 抢 `resize`。

### 2.2 离散分辨率表 + CSS 变量（不完美的主因）

`src/application/bootstrap/viewport-scale.ts`：

```text
7680×2160 → scale 0.5,  fontSizeScale 1
4800×1890 → scale 1,    fontSizeScale 1
2800×920  → scale 0.57, fontSizeScale 1.5
2550×1440 → scale 1,    fontSizeScale 1
1920×1080 → scale 1,    fontSizeScale 1
```

匹配算法是 **欧氏距离最近邻**。写出 `--scale`、`--font-size-scale`、`--ue5-panel-scale-x/y`（`scale===1` 时写成 `none` 以保护毛玻璃）。

左右面板再用 `scaleX` / `scaleY` 和 `width: calc(400px / var(--scale))`、`max-height: calc((100vh - 55px) / var(--scale))` 做二次补偿。顶栏、底栏 **不走 `--scale`**。

### 2.3 侧栏高度：现在几乎总是滚动，而不是铺满

| 现状 | 行为 |
|---|---|
| `panel-scroll-box` | 拆分卡片面板 **默认** `overflow-y: auto`，内容多高就多高 |
| `fill-two-people-flow-cards` | **仅**人流两张指定卡：第一张内容高、第二张 `flex:1`。不是通用 2/3 铺满 |
| `.card-container-2/3/4` | 按 `100vh` 均分的老图表高度，V2 拆分卡基本不用 |
| 各卡 `min-height: 200~300px` | rem 放大后把栏撑出视口，只能靠滚动或 `--scale` 压扁 |

因此现场看到的「大屏空一截 / 小屏还要滚 / 条屏被压扁」都来自同一件事：**高度没有按卡数分配，却拿 scale 去补。**

### 2.4 当前 scale 在表达什么，以及为何不完美

意图是：按宽放大 HUD，超宽/极扁再用 `scaleY` 把整栏塞进视口。

和「2/3 铺满、>3 滚动」直接冲突：

1. **2 张卡不会铺满。** 卡有自身 min-height，栏只是滚动容器，下面会空一截；scale 只是把空和卡一起缩小，空还在。
2. **3 张卡在 4K / 高屏上仍可能空一截或被压扁。** 高度跟的是宽度 rem，不是栏高。
3. **4 张以上不该被压进一屏。** 业务明确允许滚动，`scaleY` 却把四张一起挤扁，字和图表一起糊。
4. **`7680` 上 rem 已按宽变成 4 倍，再 `scaleY(0.5)`** 是在用形变修复「字相对栏高过大」。栏若按 3 卡槽铺满，字号应跟 **高度** 走，根本不必 scale。
5. 欧氏表会把带鱼屏误打成 `2800×920`；`scale≠1` 时毛玻璃失效；图表/`ROW_HEIGHT` 与 CSS 不同步。
6. TSX 内联 `px2rem(chartHeight)`、固定 `ROW_HEIGHT` 和 `VISIBLE_ROWS × ROW_HEIGHT` 不经过 PostCSS，切换 contain rem 后不会自动适配卡槽。
7. SCADA 2D 仍有 `left: 400px/420px`，GIS 侧栏有独立 `padding-top: 100px`；它们必须纳入回归，不能只验证 UE5 入口。

---

## 3. 大屏最优方案：卡槽铺满，而不是 scale

### 3.1 卡槽模型（唯一高度规则）

侧栏内容区高度：

```text
panelH = 100vh - var(--ue5-panel-top, 55px) - var(--ue5-panel-bottom, 24px)
gap    = 12px
n      = 该侧实际渲染的卡片数
```

`--ue5-panel-bottom` 要避开底栏导航，避免最后一张卡坐在菜单下面。

| 卡数 n | 栏行为 | 单卡高度 |
|---|---|---|
| 1 | 暂时保留自然高度 | 用户只明确要求 2/3 张铺满；避免单个指标卡被无依据拉成整屏 |
| **2** | **按内容权重铺满，无滚动** | 无档案时等分；有档案时按 `weight` 分配 |
| **3** | **按内容权重铺满，无滚动** | 无档案时等分；有档案时按 `weight` 分配 |
| **≥ 4** | **按三卡槽高度堆叠，栏滚动** | 固定为 `(panelH - 2×gap) / 3`（一屏约 3 张，第 4 张露出一点） |

CSS 落点在 `BasePanelRender` 的 `*-panel-box`，用 `data-card-count` 切换，**不要**让每张业务卡再写 `card-container-2`。

每张拆分卡增加稳定 `.panel-card-slot` wrapper，并读取布局档案：

```text
metric/KPI       weight 0.8，fillMode=center
chart            weight 1.1~1.2，fillMode=stretch
list/table       weight 1.2~1.4，fillMode=rows
dense mixed      weight 1.3~1.5，fillMode=scroll/compact
unknown          weight 1，默认等权
```

不要根据实时接口条数改变权重，否则数据刷新会造成卡片上下跳动。动态数据只影响列表可见行数和卡内滚动。

```text
.panel-box[data-fill] {          /* n = 2, 3 */
  height: panelH;
  display: grid;
  grid-template-rows: var(--panel-grid-rows); /* 如 0.8fr 1.2fr 1.4fr */
  gap: 12px;
  overflow: hidden;
}
.panel-box[data-fill] > * {
  min-height: 0;                 /* 必须，否则子级 min-height 会撑破铺满 */
}

.panel-box[data-scroll] {        /* n ≥ 4 */
  height: panelH;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.panel-box[data-scroll] > * {
  flex: 0 0 calc((panelH - 24px) / 3);
  min-height: calc((panelH - 24px) / 3);
}
```

左右栏 **各自**按自己的卡数计算。左侧 3 张铺满、右侧 5 张滚动，是合法组合。

1 张卡是否铺满需要产品另行确认；本轮不改变其自然高度。

### 3.2 卡片内部必须把高度吃掉

铺满只解决壳。壳到图表要一条不断的 flex 链：

```text
.panel-box > .sub-panel-wrapper
  → .sub-panel
    → .sub-panel-content
      → 图表 / 列表容器
```

每一层：`display: flex; flex-direction: column; min-height: 0; height: 100%`（或 `flex: 1`）。  
ECharts 容器 `flex: 1; min-height: 0`，靠已有的 resize 听容器，而不是写死 `height: 220px`。

铺满模式下：

- 业务卡上的 `min-height: 250px` **让路**（`min-height: 0`），否则 3 张卡在条屏上会再次溢出。
- 列表「可见 N 行」改为 `floor(可用高度 / 行高)`，上限仍可封 5/8；不要钉死 `ROW_HEIGHT × 5` 却不管壳已被压矮或被拉高。
- 指标卡内容保持原尺寸并居中，不能用 `space-between` 把少量指标拉散。
- 图表卡让图表区域伸展；列表卡保持行高，只改变可见行数。
- 密集卡先进入 compact，再使用卡体滚动或“查看更多/放大”；不能缩字体硬塞。
- 人流 `fill-two-people-flow-cards`（首张内容高、末张吃剩余）归入加权档案，不再作为唯一铺满旁路。

`PanelCardSafeHost` 成功时渲染的是 Fragment，栏的 flex 子项实际是 `.sub-panel-wrapper`，这条链是通的。

### 3.3 字号：contain rem，去掉面板 scale

卡槽已经消化了视口高度，字号如果仍按 **宽度** 放大，超宽屏会「字是卡的两倍高」。

```text
uiScale = min(innerWidth / 1920, innerHeight / 1080)
html.fontSize = 192 * uiScale          // 对齐现有 pxtorem rootValue
--scale = 1
--ue5-panel-scale-x/y = none
--font-size-scale = 1
```

对照：

| 屏 | 宽 rem（现状） | contain rem | 3 卡槽高度 vs 1080 的 1/3 |
|---|---|---|---|
| 1920×1080 | 1 | 1 | 约 320px，对齐 |
| 1366×768 | 0.71 | 0.71 | 槽变矮，字一起小 |
| 3840×2160 | 2 | 2 | 槽约 2 倍，字 2 倍 |
| **7680×2160** | **4** | **2** | 槽约 2 倍，字 2 倍，**不必 scaleY 0.5** |
| **2800×920** | 1.46 + scale 0.57 | **0.85** | 3 槽约 290px，略紧但可铺满，**不必压扁整栏** |
| 2560×1080 带鱼 | 误匹配 0.57 | 1 | 16:9 高度，字正常 |

面板宽度跟 contain rem 走：`7680` 上约 `800px`（不再是按宽 1600px）。若指挥屏要求侧栏更宽，用独立变量，不要再用 scaleX：

```text
--ue5-panel-width: clamp(360px, 12vw, 880px);
```

这是产品旋钮，不是适配内核。

### 3.4 明确废弃

| 废弃 | 原因 |
|---|---|
| 欧氏分辨率表 + 面板 `scaleX/scaleY` | 不解决铺满；破坏毛玻璃；误匹配带鱼/4K |
| 用 `--scale` 除 `100vh` 当滚动高度 | 铺满栏高度就是 `panelH`，与 scale 无关 |
| 整页 DataV scale | 会缩放像素流 |
| 每张卡自己写 `card-container-2/3/4` | 卡数由配置决定，卡内不知道本侧一共几张 |
| 为笔记本 fork 一套卡片 | 同一套卡槽规则即可 |

`viewport-scale.ts` 第一期改为只写 contain rem（或改 `amfe-flexible` 的计算），**不再写 `--scale` 形变**。legacy 映射表只作回归对照，不继续加分辨率点。

---

## 4. 方案对比（含铺满约束后重评）

评分仍 1–5。加入「2/3 铺满、>3 滚动」后，**靠 scale 塞进视口的方案全部降分**。

| 方案 | 3D | 毛玻璃 | 2/3 铺满 | >3 滚动 | 已知 LED | 4K/带鱼/笔记本 | 成本 | 采用 |
|---|---|---|---|---|---|---|---|---|
| A 现状：欧氏表 + 面板 scale + 默认滚动 | 5 | 2 | **1** | 3（4 张也会被压） | 4 | 2 | 5 | 否 |
| B 整页 scale | 1 | 1 | 3 | 2 | 4 | 3 | 4 | 否 |
| C 响应式换布局 | 5 | 5 | 2 | 4 | 2 | 4 | 1 | 否 |
| D 仅宽度 rem + 现滚动 | 5 | 5 | **1** | 4 | 2 | 4 | 4 | 否 |
| E 仅 contain rem + 现滚动 | 5 | 5 | **2** | 4 | 3 | 5 | 3 | 不够 |
| F 宽 rem + 连续 scaleY | 5 | 4 | **2** | 2 | 5 | 5 | 3 | **让位** |
| G 双套布局 | 5 | 5 | 5 | 5 | 5 | 5 | 1 | 否 |
| **I 卡槽铺满 + contain rem，无面板 scale** | **5** | **5** | **5** | **5** | **5** | **5** | **3** | **推荐** |

方案 F 仍能修正带鱼误匹配，但 **解决不了 2/3 张卡铺满**，还会在 4 张以上错误压高度。大屏主方案改为 **I**。

---

## 5. 方案 I 怎么落地

### 5.1 分层

```text
第 0 层  三维 / 像素流 / GIS     永远 100% 视口，禁止 scale
第 1 层  侧栏卡槽                 2/3 按内容权重铺满；≥4 以三卡槽为行高并滚动
第 2 层  卡片内部吃高度            flex 链 + 图表 100% + 列表按可用高度算行数
第 3 层  字号                     contain rem = min(w/1920, h/1080)
第 4 层  栏宽（可选）              --ue5-panel-width，与 scale 无关
第 5 层  项目覆盖（可选）          极少数字号手动系数，不再选分辨率点
```

### 5.2 分阶段实施：先卡槽，后尺寸内核

| 文件 | 动作 |
|---|---|
| `base-panel-render.tsx` | 按 `cards.length` 打 `data-card-count` / `data-fill` / `data-scroll`；仅 `n=2/3` 关闭滚动并铺满 |
| `base-panel-render.module.less` | 实现上表卡槽；`height: panelH`；子项 `min-height: 0` |
| `convention` / `v2-panel-base` / `sub-panel-wrapper` | 打通 flex 链，铺满时壳 `height:100%` |
| `viewport-scale.ts` | 改为 contain rem；`--ue5-panel-scale-*` 恒为 `none`；删除欧氏表 |
| `amfe-flexible` | 停止按纯宽度设根字号，或在 `viewport-scale` 里覆盖为 contain |
| `common.ts` `calcFontSize` | 与 html rem 同源，不再除 `--scale` |
| 面板宽度 | `400px` 走 rem 即可，去掉 `/ var(--scale)` 与 `scaleX` |
| `rem.ts` | 删除死代码 |

**不要在同一批同时上线卡槽和 contain rem。** 第一阶段暂时保留旧 scale，只验证 2/3 铺满、≥4 滚动；代表卡 flex、ECharts ResizeObserver 和列表行数稳定后，第二阶段才切 contain rem 并关闭 transform。这样两类风险可以独立回滚。

多数 V2 卡图表区已有 `flex: 1; height: 100%`，但仍有不少固定 `height/min-height`，不能未经代表卡回归就宣称全量兼容。

第二阶段切根字号前，必须先把 `--scale` / `--font-size-scale` / 内联固定 chartHeight 的命中项分成拆分卡、Legacy 整板和弹窗三类。弹窗显式高度可保留；侧栏固定图表高度应改为容器驱动。

人流两卡特例并入内容档案；可保留“上短下长”权重，但不再保留独立布局旁路。

### 5.3 第二期：内容自适应卡槽

- 列表：`visibleRows = clamp(3, floor(bodyH / rowH), 8)`。
- ECharts：只听容器 resize；轴文字用 `calcFontSize` 或 CSS 像素，与 contain rem 一致。
- 清掉会撑破 `min-height: 0` 的局部 `min-height`。
- 可视化配置无需按分辨率填 scale；可选「侧栏宽度」。

### 5.4 小屏（笔记本）

同一套卡槽，不切 H5：

- 2/3 张仍然铺满（卡变矮、字随 contain rem 变小）。
- 5 张仍然按三卡槽滚动。
- 宽度 `< 1366` 且 3 张铺满后单槽过矮（例如 `< 220px`）时，可降级为滚动（等于把阈值从 3 改成 2）。这是保护可读性的例外，默认阈值仍是 3。

### 5.5 验收

| 场景 | 期望 |
|---|---|
| 1920×1080，左 3 右 3 | 两侧贴顶栏到菜单上方，无空白、无滚动，毛玻璃透 3D |
| 1920×1080，左 2 右 5 | 左两卡按内容权重铺满；右约 3 张可见，可滚到第 5 张 |
| 3840×2160，3 张 | 约 2 倍字号，三卡铺满，**无** scale，**无** 底部空带 |
| 7680×2160，3 张 | 字号约 2 倍（不是 4 倍），三卡铺满，**无** `scaleY(0.5)` |
| 2800×920，3 张 | 三卡铺满略紧，可阅读，**无** 整栏压扁 |
| 2560×1080 带鱼，3 张 | 按 1080 高度铺满，**不要** 走到 0.57 |
| 1366×768，3 张 | 铺满变矮；5 张可滚 |
| 科技蓝 | `transform: none`，毛玻璃采到模型 |
| 切换菜单导致 3→4 张 | 立刻从铺满变为滚动，无需刷新 |
| SCADA 2D / GIS | 400/420px 偏移和 GIS 100px 顶部留白仍与面板对齐 |
| Legacy 整板 | `--scale=1` 后不裁切、不出现双滚动 |

### 5.6 明确不做

- 不要再往 `resolutionScaleMap` 加分辨率。
- 不要用 `scaleY` 实现「塞进一屏」。
- 不要整页 scale。
- 不要让业务卡计算 `100vh / 3`。
- 不要为了铺满把列表 `flex:1` 撑开却不钉可见行高（末项遮挡会复发）。铺满的是 **卡壳**；表体仍按行高 × 可见行数，多余空间给图表或留白，而不是把行高拉伸变形。

---

## 6. 补充发现的大屏适配问题

### P0：上线前必须闭环

| 问题 | 当前证据 | 必须验证 |
|---|---|---|
| Pixel Streaming 坐标与流分辨率 | `ue-sdk.ts` 只用 `document.body.clientWidth/Height`，只监听 window resize | 浏览器缩放、全屏、跨显示器后模型点击/拖拽/UE 自绘光标误差 ≤2px |
| 视口事件不统一 | 当前无统一 `visualViewport/fullscreen/pageshow` coordinator | 同一帧更新 rem、卡槽、ECharts、UE 流 |
| 多套尺寸体系 | pxtorem、amfe、`calcFontSize`、`--font-size-scale` 并行 | CSS 字号与 ECharts 字号来自同一 `uiScale` |
| Legacy 整板绕过卡槽 | `useLegacyPanel` 时 `cards=[]`，约百套注册 | 高频 Legacy 抽样无裁切、无双滚动 |
| 卡槽核心仍未实现 | 生产仍是默认 `panel-scroll-box` + 欧氏 scale 表 | 2/3 铺满、≥4 滚动的实际页面验收 |

### P1：高概率现场问题

| 问题 | 处理 |
|---|---|
| 顶栏 64/90px，但侧栏写死 55px | 用 `--ue5-panel-top/bottom` 或实际 DOM 测量 safe area |
| SCADA 2D `left:400/420px`、区域标签 fallback 400 | 改为读取面板真实 Rect/CSS 变量 |
| Teleport 弹窗/Select/DatePicker 挂载点混用 | 统一 popup container；同步 UI scale/主题变量；验收不裁切不偏移 |
| 大部分 ECharts 无 ResizeObserver | 收敛共享 chart host，监听容器而不是只监听 window |
| 固定 ROW_HEIGHT × VISIBLE_ROWS | 行高不变，根据卡体高度算可见行 |
| 150+ 固定 min-height | 仅侧栏态允许 `min-height:0`，zoom/弹窗高度保留 |
| 全屏切换只改 store | `fullscreenchange` 必须触发统一 relayout 和 UE 分辨率更新 |
| 触摸屏点击区与驾驶模式 | 43/55 英寸触摸屏验收，目标点击区至少 44 CSS px（或项目标准） |

### P2：性能和长尾

| 问题 | 处理 |
|---|---|
| 多路 resize 监听造成风暴 | rAF 合并；连续拖窗 5 秒每帧处理低于 16ms |
| ResizeObserver 反馈环 | 测量与写 DOM 分帧，禁止同一回调循环改尺寸 |
| 高 DPR 图表模糊 | ECharts/Canvas 按 DPR 渲染，但 DOM 布局不乘 DPR |
| 字体加载引起首屏跳动 | `@font-face` 补合适 `font-display`，字体 ready 后只重排一次 |
| 长文案/国际化 | 统一换行、ellipsis、tooltip；测试 20 字符英文/德文名称 |
| 三层嵌套滚动 | 明确滚轮归属；避免侧栏 + 卡体 + seamless scroll 同时抢事件 |
| Boot Loader 与登录页体系不同 | 登录→首页字号跳变控制在可接受范围；loader 单独做 viewport 测试 |
| 每小时强制 remount 整栏 | 核对业务必要性，避免长跑闪白和 resize 峰值 |

---

## 7. 最小验收矩阵

| 维度 | 用例 |
|---|---|
| 卡数 | 左2右3、左2右5、3→4 动态切换 |
| 分辨率 | 1366×768、1920×1080、2560×1080、2560×1440、3840×2160、7680×2160、2800×920 |
| 窗口高度 | 1080、900、720、600；600 进入 compact/overflow，不继续缩字 |
| 浏览器缩放 | Chrome/Edge 80%、100%、125%、150%、175% |
| 系统环境 | Windows 100%/150%/200% 缩放；窗口跨双显示器 |
| 全屏 | 进入/退出全屏各 5 次，HUD/UE 流/图表一次稳定 |
| 渲染模式 | UE5、WEBGL、GIS、SCADA 2D |
| UI | 科技蓝、极简白、Select/DatePicker/Popover、放大弹窗 |
| 内容 | KPI、折线、饼图、TopN、表格、视频、长文案 |
| 交互 | UE 点击、拖拽、自绘光标、触摸、滚轮归属 |
| 性能 | 连续 resize 5 秒、运行 2 小时、无 RO loop/整栏闪白 |

任何一项未通过，都不能声称“全分辨率适配完成”。

---

## 8. 建议决策

1. **当前 scale 方案不完美，且与 2/3 铺满冲突，不作为大屏目标态。**
2. **大屏最优方案是 I：侧栏按卡数与内容档案分配高度 + contain rem + 禁止面板 transform。**
3. 左右栏独立计算卡数；1 张暂时保持自然高度，待产品确认。
4. ≥4 张的行高等于「本屏三卡槽」，保证和 3 张铺满时单卡体量一致，滚动而不是缩小。
5. `4800×1890` 不再需要「滚还是压」的产品二选一：3 张会铺满，5 张会按三卡槽滚。

---

## 9. 代码索引

| 能力 | 路径 |
|---|---|
| 分辨率表 / CSS 变量（待改为 contain rem） | `prod/cube/apps/ue5/app/src/application/bootstrap/viewport-scale.ts` |
| 启动调用 | `prod/cube/apps/ue5/app/src/main.ts` |
| rem 运行时 | `prod/cube/apps/ue5/app/src/app.ts`（`amfe-flexible`） |
| 侧栏渲染与滚动开关 | `prod/cube/apps/ue5/app/src/features/cards/base-panel-render/` |
| 人流两卡特例（应并入通用卡槽） | `fill-two-people-flow-cards` |
| 老图表均分高度 | `src/styles/index.less` `.card-container-2/3/4` |
| 卡片壳 | `src/shared-ui/panel/subPanelType/convention.module.less`、`v2-panel-base.less` |
| scaleY | `src/styles/index.less` `.left-panel-box` |
| 图表字号 | `src/infrastructure/utils/common.ts` `calcFontSize` |
| 区域标签跟面板 | `src/visualization-core/hooks/use-floor-tag-position.ts` |
| UE 流分辨率 | `src/visualization-core/model-sdk/ue-sdk.ts` `changeResolution` |
| 全屏 | `src/features/widgets/title-bar/components/switch-fullscreen/switch-fullscreen.tsx` |
| Teleport 主题变量 | `src/visualization-core/hooks/use-teleport-theme-vars.ts` |
