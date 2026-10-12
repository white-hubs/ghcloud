# UE5 Adaptive Panel Layout Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在不缩放 UE5 / WebGL / GIS 画布的前提下，实现左右侧栏配置 2/3 张卡时按内容权重协调铺满、超过 3 张时按三卡槽高度滚动，并逐步替换当前离散分辨率 `scale` 方案。

**Architecture:** 将“卡片数量布局”和“视口尺寸缩放”拆成两个独立策略。第一阶段只让 `BasePanelRender` 根据有效卡数选择 `natural / fill / scroll`，第二阶段再用 `min(width / 1920, height / 1080)` 驱动 rem，面板保持 `transform: none`。Legacy 整板先保持原行为；拆分卡片完成回归后再迁移。

**Tech Stack:** Vue 3 TSX、CSS Modules/Less、PostCSS pxtorem、Bun test、ECharts、ResizeObserver

---

## 结论与实施边界

### 可行性结论

- **卡槽布局可行**：`BasePanelRender` 已经拿到过滤后的 `cards.value`，能够按左右栏各自的实际有效卡数决定布局。
- **不能把“铺满”理解为强制等分**：内容稀疏的指标卡、可伸展图表卡和固定行高列表需要不同的高度权重与填充方式。等分只作为没有布局档案时的默认行为。
- **不能直接全量打开**：大量存量卡片含固定 `height` / `min-height`，部分图表只监听 `window.resize`。仅给父容器加 `flex: 1` 会造成裁切或图表尺寸不刷新。
- **contain rem 可行但风险高于卡槽布局**：它能在 `7680×2160` 上得到 2 倍尺寸而不是按宽 4 倍后再 `scaleY(0.5)`，但会影响 SCADA 2D、登录页、弹窗和所有 rem 样式，必须单独一阶段验证。
- **Legacy 整板不能按卡数统一处理**：`useLegacyPanel` 路径下 `cards.value` 为空，组件内部自带布局。本计划一期只覆盖拆分卡片。

### 卡数策略

| 有效卡数 | 策略 | 说明 |
|---|---|---|
| 0 | `empty` | 不渲染卡槽 |
| 1 | `natural` | 用户未要求单卡拉满，先保留自然高度，避免指标卡被拉成整屏 |
| 2 | `fill` | 按内容权重铺满；无档案时等分，无侧栏滚动 |
| 3 | `fill` | 按内容权重铺满；无档案时等分，无侧栏滚动 |
| ≥4 | `scroll` | 每张保持“三卡槽”高度，侧栏滚动 |

人流两卡现有“上卡自然高、下卡吃剩余”的规则满足“铺满”但不是均分；一期保留为 `fill-weighted`，待产品确认后再决定是否统一为 1:1。

### 内容协调规则

每张卡使用稳定的布局档案，不根据实时 `scrollHeight` 自动抖动：

```ts
export interface CardLayoutProfile {
  weight: number;
  minHeight: number;
  compactMinHeight: number;
  fillMode: "center" | "stretch" | "rows" | "scroll";
}
```

- `center`：KPI/少量指标保持内容尺寸，卡内垂直居中，不拉散指标间距。
- `stretch`：趋势图、饼图等图表区域吃掉剩余高度。
- `rows`：列表行高固定，只改变可见行数。
- `scroll`：密集混合内容优先 compact，仍放不下时只滚卡体，不压字体。
- `minHeight` 是软约束，用于选择 normal/compact；不直接把 Grid 撑破。
- `compactMinHeight` 仍无法满足时允许安全降级，不能继续使用 `scaleY`。

---

## 文件结构

### 新增

- `prod/cube/apps/ue5/app/src/features/cards/base-panel-render/panel-layout-policy.ts`  
  纯函数：根据卡数和例外类型返回 `empty / natural / fill / fill-weighted / scroll`。
- `prod/cube/apps/ue5/app/src/features/cards/base-panel-render/panel-layout-policy.test.ts`  
  使用 Bun 内置测试覆盖卡数边界。
- `prod/cube/apps/ue5/app/src/features/cards/base-panel-render/card-layout-profile.ts`  
  卡片布局档案和默认值；首批覆盖指标、图表、TopN、表格代表卡。
- `prod/cube/apps/ue5/app/src/features/cards/base-panel-render/card-layout-profile.test.ts`  
  验证默认等权、内容权重轨道和档案兜底。
- `prod/cube/apps/ue5/app/src/application/bootstrap/viewport-metrics.ts`  
  纯函数：计算 contain UI scale、根字号及兼容 CSS 变量。
- `prod/cube/apps/ue5/app/src/application/bootstrap/viewport-metrics.test.ts`  
  覆盖 1080p、2K、4K、带鱼、7680、2800。

### 修改

- `prod/cube/apps/ue5/app/src/features/cards/base-panel-render/base-panel-render.tsx`
- `prod/cube/apps/ue5/app/src/features/cards/base-panel-render/base-panel-render.module.less`
- `prod/cube/apps/ue5/app/src/shared-ui/panel/subPanelType/convention.module.less`
- `prod/cube/apps/ue5/app/src/features/panel-shell/templates/sub-panel-template/sub-panel-template.module.less`
- `prod/cube/apps/ue5/app/src/features/cards/_shared/v2-panel-base.less`
- `prod/cube/apps/ue5/app/src/styles/visual-theme.less`
- `prod/cube/apps/ue5/app/src/application/bootstrap/viewport-scale.ts`
- `prod/cube/apps/ue5/app/src/app.ts`
- `prod/cube/apps/ue5/app/src/infrastructure/utils/common.ts`
- `prod/cube/apps/ue5/app/src/visualization-core/hooks/use-floor-tag-position.ts`
- `prod/cube/apps/ue5/app/src/views/visualization/scada-2d/scada-2d.module.less`（contain rem 回归时校正硬编码 400/420px 偏移）
- 经审计确认不适配卡槽的具体卡片样式与图表组件

### 延后删除

- `prod/cube/apps/ue5/app/src/application/config/rem.ts`
- `src/styles/index.less` 中 `.card-container-2/3/4`
- `--ue5-panel-scale-x/y`、旧 `--scale` 引用

只有在全分辨率回归完成后才删除，避免第一阶段无法回退。

---

## Task 1：建立可测试的卡数策略

**Files:**
- Create: `prod/cube/apps/ue5/app/src/features/cards/base-panel-render/panel-layout-policy.ts`
- Create: `prod/cube/apps/ue5/app/src/features/cards/base-panel-render/panel-layout-policy.test.ts`

- [ ] **Step 1: 写策略测试**

```ts
import { describe, expect, test } from "bun:test";

import { resolvePanelLayout } from "./panel-layout-policy";

describe("resolvePanelLayout", () => {
  test.each([
    [0, false, "empty"],
    [1, false, "natural"],
    [2, false, "fill"],
    [3, false, "fill"],
    [4, false, "scroll"],
    [8, false, "scroll"],
    [2, true, "fill-weighted"],
  ] as const)("cardCount=%s weighted=%s -> %s", (cardCount, weighted, expected) => {
    expect(resolvePanelLayout(cardCount, weighted).mode).toBe(expected);
  });

  test("scroll mode keeps the same height as a three-card slot", () => {
    expect(resolvePanelLayout(5, false).visibleSlots).toBe(3);
  });
});
```

- [ ] **Step 2: 运行测试并确认先失败**

Run:

```bash
bun test prod/cube/apps/ue5/app/src/features/cards/base-panel-render/panel-layout-policy.test.ts
```

Expected: FAIL，提示找不到 `panel-layout-policy`。

- [ ] **Step 3: 实现纯函数**

```ts
export type PanelLayoutMode = "empty" | "natural" | "fill" | "fill-weighted" | "scroll";

export interface PanelLayoutPolicy {
  mode: PanelLayoutMode;
  cardCount: number;
  visibleSlots: number;
}

export const resolvePanelLayout = (cardCount: number, weighted = false): PanelLayoutPolicy => {
  const count = Math.max(0, Math.floor(cardCount));
  if (count === 0) return { mode: "empty", cardCount: count, visibleSlots: 0 };
  if (count === 1) return { mode: "natural", cardCount: count, visibleSlots: 1 };
  if (count <= 3) {
    return {
      mode: weighted ? "fill-weighted" : "fill",
      cardCount: count,
      visibleSlots: count,
    };
  }
  return { mode: "scroll", cardCount: count, visibleSlots: 3 };
};
```

- [ ] **Step 4: 运行测试**

Expected: PASS。

---

## Task 1.5：建立卡片内容档案与加权轨道

**Files:**
- Create: `prod/cube/apps/ue5/app/src/features/cards/base-panel-render/card-layout-profile.ts`
- Create: `prod/cube/apps/ue5/app/src/features/cards/base-panel-render/card-layout-profile.test.ts`

- [ ] **Step 1: 写档案测试**

```ts
import { describe, expect, test } from "bun:test";

import {
  resolveCardLayoutProfile,
  resolvePanelGridRows,
} from "./card-layout-profile";

describe("card layout profiles", () => {
  test("unknown cards use a stable equal-weight fallback", () => {
    expect(resolveCardLayoutProfile("unknown-card")).toEqual({
      weight: 1,
      minHeight: 240,
      compactMinHeight: 190,
      fillMode: "stretch",
    });
  });

  test("sparse metric cards receive less height than dense list cards", () => {
    const rows = resolvePanelGridRows([
      { weight: 0.8 },
      { weight: 1.2 },
      { weight: 1.4 },
    ]);
    expect(rows).toBe("0.8fr 1.2fr 1.4fr");
  });
});
```

- [ ] **Step 2: 运行测试并确认先失败**

```bash
bun test prod/cube/apps/ue5/app/src/features/cards/base-panel-render/card-layout-profile.test.ts
```

- [ ] **Step 3: 实现默认档案和首批代表卡**

```ts
export interface CardLayoutProfile {
  weight: number;
  minHeight: number;
  compactMinHeight: number;
  fillMode: "center" | "stretch" | "rows" | "scroll";
}

const DEFAULT_PROFILE: CardLayoutProfile = {
  weight: 1,
  minHeight: 240,
  compactMinHeight: 190,
  fillMode: "stretch",
};

const CARD_LAYOUT_PROFILES: Record<string, CardLayoutProfile> = {
  "security-alarm-record": {
    weight: 0.8,
    minHeight: 210,
    compactMinHeight: 180,
    fillMode: "center",
  },
  "alarm-status-and-trend": {
    weight: 1.2,
    minHeight: 260,
    compactMinHeight: 210,
    fillMode: "stretch",
  },
  "command-dispatch-alarm-area-top5": {
    weight: 1.4,
    minHeight: 300,
    compactMinHeight: 230,
    fillMode: "rows",
  },
};

export const resolveCardLayoutProfile = (code: string): CardLayoutProfile =>
  CARD_LAYOUT_PROFILES[code] ?? DEFAULT_PROFILE;

export const resolvePanelGridRows = (
  profiles: Array<Pick<CardLayoutProfile, "weight">>,
): string => profiles.map(({ weight }) => `${weight}fr`).join(" ");
```

首批值只是布局基线，必须以 1920×1080 三卡实测校准；不要一次给所有卡编造档案。

- [ ] **Step 4: 运行测试**

Expected: PASS。

---

## Task 2：让 BasePanelRender 输出明确布局状态

**Files:**
- Modify: `prod/cube/apps/ue5/app/src/features/cards/base-panel-render/base-panel-render.tsx`
- Modify: `prod/cube/apps/ue5/app/src/features/cards/base-panel-render/base-panel-render.module.less`

- [ ] **Step 1: 在拆分卡片路径计算布局**

在 `cards` 与 `shouldFillTwoPeopleFlowCards` 后增加：

```ts
const panelLayout = computed(() =>
  useLegacyPanel.value
    ? { mode: "legacy" as const, cardCount: 0, visibleSlots: 0 }
    : resolvePanelLayout(cards.value.length, shouldFillTwoPeopleFlowCards.value),
);

const cardLayoutProfiles = computed(() =>
  cards.value.map((card) => resolveCardLayoutProfile(card.code)),
);

const panelGridRows = computed(() =>
  resolvePanelGridRows(cardLayoutProfiles.value),
);
```

- [ ] **Step 2: 为每张卡增加稳定 slot wrapper**

在 `nodes` 的 `.map((e) => ...)` 中获取档案，并用真实 DOM 包住 `PanelCardSafeHost`。不要把 `data-*` 传给 Fragment 根组件，否则 Vue 无法可靠转发 attrs：

```ts
const profile = resolveCardLayoutProfile(e.code);

return h(
  "div",
  {
    class: styles["panel-card-slot"],
    "data-card-code": e.code,
    "data-card-fill-mode": profile.fillMode,
  },
  [
    h(
      PanelCardSafeHost,
      { code: e.code, title: e.title || e.code },
      {
        default: () =>
          h(
            PanelCardTitleProvider,
            { title: e.title },
            {
              default: () =>
                h(CardComp, {
                  ...panelProps.value,
                  ...e,
                  ...(PANEL_CONTEXT_CARD_CODES.has(e.code)
                    ? { panelName: resolvedPanelName.value }
                    : {}),
                  ...(e.code === "people-flow-today-statistics"
                    ? {
                        fillPanel:
                          props.position === "left" &&
                          shouldFillTwoPeopleFlowCards.value,
                      }
                    : {}),
                }),
            },
          ),
      },
    ),
  ],
);
```

稳定 wrapper 同时解决直接子节点不一致问题，并为错误态、内容档案和 Grid 槽提供统一挂载点。

- [ ] **Step 3: 用布局状态替换默认滚动判断**

```ts
const shouldEnablePanelScroll = computed(() => panelLayout.value.mode === "scroll");
```

面板盒输出：

```tsx
<div
  data-panel-layout={panelLayout.value.mode}
  data-card-count={panelLayout.value.cardCount}
  style={
    {
      "--panel-visible-slots": String(panelLayout.value.visibleSlots),
      "--panel-grid-rows": panelGridRows.value,
    } as Record<string, string>
  }
  class={[
    props.position + "-panel-box",
    styles["panel-layout-box"],
    shouldEnablePanelScroll.value ? styles["panel-scroll-box"] : "",
    panelLayout.value.mode === "fill" ? styles["panel-fill-box"] : "",
    panelLayout.value.mode === "fill-weighted" ? styles["fill-two-people-flow-cards"] : "",
  ]}
>
```

- [ ] **Step 3: 实现卡槽 CSS，暂时保留当前 scale 补偿**

```less
.panel-layout-box {
  --panel-card-gap: 12px;
  --panel-three-slot-gap-total: 24px;
  box-sizing: border-box;
  width: 100%;
}

.panel-card-slot {
  min-width: 0;
  min-height: 0;
  overflow: hidden;
}

.panel-fill-box {
  display: grid;
  grid-template-rows: var(
    --panel-grid-rows,
    repeat(var(--panel-visible-slots), minmax(0, 1fr))
  );
  gap: var(--panel-card-gap);
  height: calc((100vh - 55px) / var(--scale, 1));
  min-height: 0;
  overflow: hidden;

  > * {
    min-width: 0;
    min-height: 0;
    overflow: hidden;
  }
}

.panel-scroll-box {
  display: grid;
  grid-auto-rows: calc(
    (100% - var(--panel-three-slot-gap-total)) / 3
  );
  gap: var(--panel-card-gap);
  height: calc((100vh - 55px) / var(--scale, 1));
  max-height: none;
  overflow-x: hidden;
  overflow-y: auto;

  > * {
    min-width: 0;
    min-height: 0;
    overflow: hidden;
  }
}
```

注意：一期保留 `/ var(--scale)`，先验证“卡数布局”本身；Task 6 再移除。

内容档案缺失时默认等权，不阻塞铺满；发现视觉不协调的卡再补档案。

- [ ] **Step 4: 验证左右栏独立变化**

手动配置：

- 左 2 / 右 3：两侧均无滚动且铺满。
- 左 2 / 右 5：左侧铺满，右侧滚动。
- 左 4 / 右 3：只有左侧滚动。

---

## Task 3：打通卡壳 flex 高度链

**Files:**
- Modify: `prod/cube/apps/ue5/app/src/features/panel-shell/templates/sub-panel-template/sub-panel-template.module.less`
- Modify: `prod/cube/apps/ue5/app/src/shared-ui/panel/subPanelType/convention.module.less`
- Modify: `prod/cube/apps/ue5/app/src/features/cards/_shared/v2-panel-base.less`
- Modify: `prod/cube/apps/ue5/app/src/features/cards/base-panel-render/base-panel-render.module.less`

- [ ] **Step 1: 只在 fill/scroll 侧栏上下文启用满高**

不要全局把所有 `SubPanelTemplate` 设成 `height: 100%`，否则放大弹窗和独立页面会被影响。使用侧栏上下文：

```less
.panel-fill-box,
.panel-scroll-box {
  :global(.sub-panel-wrapper),
  :global(.sub-panel),
  :global(.sub-panel-content) {
    min-height: 0;
  }

  :global(.sub-panel-wrapper),
  :global(.sub-panel) {
    display: flex;
    flex-direction: column;
    height: 100%;
  }

  :global(.sub-panel-content) {
    display: flex;
    flex: 1 1 0;
    flex-direction: column;
    overflow: hidden;
  }
}
```

- [ ] **Step 2: 兼容外层业务 root**

部分卡片在 `SubPanelTemplate` 外还有一层 `*-root`。只在侧栏槽位内补：

```less
.panel-fill-box > *,
.panel-scroll-box > * {
  height: 100%;
  min-height: 0;
}

.panel-fill-box > * > :global(.sub-panel-wrapper),
.panel-scroll-box > * > :global(.sub-panel-wrapper) {
  height: 100%;
}
```

- [ ] **Step 3: 取消 margin 与 gap 叠加**

`visual-theme.less` 当前对 `*-panel-box > *` 追加 `margin-bottom: 8px`。在 `panel-fill-box/panel-scroll-box` 上下文中统一覆盖为 `margin-bottom: 0`，只由 `--panel-card-gap` 管理间距。

- [ ] **Step 4: 保持弹窗 Teleport 与 zoom 不受影响**

确认 `ModalPanelZoom` 不在 `.panel-fill-box` DOM 内参与卡槽高度；打开任意可放大卡片，弹窗高度与拖拽行为不变。

- [ ] **Step 5: 建立首批代表卡验收集**

每类至少选一张：

- 指标卡：`security-alarm-record`
- 折线图：`alarm-status-and-trend`
- 圆环：`alarm-level`
- TopN：`alarm-area-top5`
- 表格：`fire-equipment-statistics`
- 人流加权两卡：`people-flow-today-statistics`

发现固定高度时，只改对应卡的内容根，不扩大到无关业务域。

验收标准不是“所有内容都拉满”：

- 指标卡内容居中且指标间距不被拉散；
- 图表卡图表区伸展；
- 列表卡行高不变，只增加/减少可见行；
- 密集卡进入 compact 或卡体滚动，不挤压字体。

---

## Task 4：修复容器尺寸变化时不刷新的图表

**Files:**
- Modify: 经代表卡审计确认的图表组件
- Prefer shared components under:
  - `src/shared-ui/panel/charts/**`
  - `src/features/panel-shell/charts/**`

- [ ] **Step 1: 列出使用 `echarts.init` 但没有 ResizeObserver 的组件**

Run:

```bash
rg "echarts\\.init" prod/cube/apps/ue5/app/src -l
rg "ResizeObserver" prod/cube/apps/ue5/app/src -l
```

两者差集是卡槽切换后可能尺寸不刷新的候选。

同时列出 TSX 内联固定图表高度；内联字符串不会经过 PostCSS，不能假设 contain rem 会自动修复：

```bash
rg "px2rem\\(.*(chartHeight|height)|chartHeight\\s*=|height=\\{" \
  prod/cube/apps/ue5/app/src/features/cards \
  -g '*.tsx'
```

优先检查搜索命中的 `library-management`、`triage-queue`、`medical-intercom` 和各类趋势卡。

- [ ] **Step 2: 以现有 LineChart 为模板补 ResizeObserver**

```ts
let resizeObserver: ResizeObserver | null = null;

onMounted(() => {
  const target = chartDom.value?.parentElement ?? chartDom.value;
  if (target && typeof ResizeObserver !== "undefined") {
    resizeObserver = new ResizeObserver(() => {
      nextTick(() => requestAnimationFrame(() => chart?.resize()));
    });
    resizeObserver.observe(target);
  }
});

onBeforeUnmount(() => {
  resizeObserver?.disconnect();
  chart?.dispose();
});
```

- [ ] **Step 3: 验证菜单切换导致 3→4、4→2 时图表重排**

Expected：图表不留旧尺寸、不裁轴、不需要刷新页面。

- [ ] **Step 4: 移除侧栏态固定 chartHeight**

弹窗/zoom 可继续使用显式高度；侧栏卡片应让图表容器 `flex: 1; min-height: 0`。不要把弹窗高度一并删除。

---

## Task 5：让列表适配卡槽，但不拉伸行高

**Files:**
- Modify: 首批代表列表/表格卡
- Reuse: `src/visualization-core/hooks/use-table-scroll.ts` 或就近建立同职责 helper

- [ ] **Step 1: 明确规则**

- 铺满的是卡壳，不是表格行。
- 行高保持业务可读高度。
- 可见行数由内容区高度计算。
- `≥4` 模式单卡高度与三卡铺满模式相同。

- [ ] **Step 2: 通过 ResizeObserver 计算可见行数**

```ts
const visibleRows = ref(3);
const updateVisibleRows = (height: number): void => {
  const rows = Math.floor((height - HEADER_HEIGHT) / ROW_HEIGHT);
  visibleRows.value = Math.min(8, Math.max(3, rows));
};
```

- [ ] **Step 3: 保持现有滚动约束**

`RollTable` 继续传 `showLength={visibleRows.value}`；`Vue3SeamlessScroll` 的视口高度继续使用 `ROW_HEIGHT × visibleRows`。禁止用 `flex: 1` 拉伸每一行。

---

## Task 6：建立 contain viewport metrics

**Files:**
- Create: `prod/cube/apps/ue5/app/src/application/bootstrap/viewport-metrics.ts`
- Create: `prod/cube/apps/ue5/app/src/application/bootstrap/viewport-metrics.test.ts`

- [ ] **Step 1: 写分辨率测试**

```ts
import { describe, expect, test } from "bun:test";

import { resolveViewportMetrics } from "./viewport-metrics";

describe("resolveViewportMetrics", () => {
  test.each([
    [1920, 1080, 1, "normal"],
    [1366, 768, 1366 / 1920, "normal"],
    [2560, 1440, 4 / 3, "normal"],
    [3840, 2160, 2, "normal"],
    [7680, 2160, 2, "normal"],
    [2560, 1080, 1, "normal"],
    [2800, 920, 920 / 1080, "normal"],
    [1000, 600, 2 / 3, "compact"],
  ] as const)("%sx%s", (width, height, expected, mode) => {
    expect(resolveViewportMetrics(width, height).uiScale).toBeCloseTo(expected, 4);
    expect(resolveViewportMetrics(width, height).mode).toBe(mode);
  });
});
```

- [ ] **Step 2: 实现纯函数**

```ts
const DESIGN_WIDTH = 1920;
const DESIGN_HEIGHT = 1080;
const ROOT_VALUE = 192;
const MIN_UI_SCALE = 2 / 3;

export const resolveViewportMetrics = (width: number, height: number) => {
  const widthRatio = width / DESIGN_WIDTH;
  const heightRatio = height / DESIGN_HEIGHT;
  const rawScale = Math.min(widthRatio, heightRatio);
  const uiScale = Math.max(MIN_UI_SCALE, rawScale);
  return {
    uiScale,
    rootFontSize: ROOT_VALUE * uiScale,
    widthRatio,
    heightRatio,
    rawScale,
    mode: rawScale < MIN_UI_SCALE ? "compact" : "normal",
  };
};
```

- [ ] **Step 3: 运行测试**

Expected: PASS。

---

## Task 6.5：建立统一 viewport coordinator

**Files:**
- Create: `prod/cube/apps/ue5/app/src/application/bootstrap/viewport-coordinator.ts`
- Create: `prod/cube/apps/ue5/app/src/application/bootstrap/viewport-coordinator.test.ts`
- Modify: `prod/cube/apps/ue5/app/src/main.ts`

- [ ] **Step 1: 明确 CSS viewport 口径**

布局宽高使用 `document.documentElement.clientWidth/clientHeight`。`visualViewport` 只作为额外事件源，不把 DPR 或物理像素乘进 DOM 布局。这样浏览器 Ctrl/Cmd 缩放、系统缩放和窗口尺寸变化统一反映为 CSS 像素。

- [ ] **Step 2: 合并重排事件**

监听 `window.resize`、`visualViewport.resize`（存在时）、`fullscreenchange`、`orientationchange`、`pageshow` 和应用根 ResizeObserver。所有事件合并到单个 `requestAnimationFrame`，同一帧只应用一次 metrics。

- [ ] **Step 3: 输出稳定状态**

根节点写入：

```text
--ue5-ui-scale
--ue5-raw-scale
--ue5-viewport-width
--ue5-viewport-height
data-viewport-mode="normal|compact"
```

当 compact 仍低于某张卡的 `compactMinHeight` 时，卡槽策略进入 `overflow`，允许侧栏滚动；禁止继续减根字号。

- [ ] **Step 4: 清理竞争监听**

`amfe-flexible`、旧 `viewport-scale` 和新增 coordinator 不能同时写 `html.fontSize`。图表可保留容器 ResizeObserver，但不得各自重算根 rem。

---

## Task 7：替换 amfe-flexible 与离散 scale 表

**Files:**
- Modify: `prod/cube/apps/ue5/app/src/application/bootstrap/viewport-scale.ts`
- Modify: `prod/cube/apps/ue5/app/src/app.ts`
- Modify: `prod/cube/apps/ue5/app/src/infrastructure/utils/common.ts`
- Modify: `prod/cube/apps/ue5/app/src/features/cards/base-panel-render/base-panel-render.tsx`
- Modify: `prod/cube/apps/ue5/app/src/features/cards/base-panel-render/base-panel-render.module.less`

- [ ] **Step 1: 移除 `import "amfe-flexible"`**

避免它的 `resize` 监听在 contain 计算后重新写回 `width / 10`。

在此之前先执行：

```bash
rg "/ var\\(--scale|--ue5-panel-scale|--font-size-scale" \
  prod/cube/apps/ue5/app/src/features/cards \
  -g '*.{less,ts,tsx}'
```

将命中项分成：

1. 拆分卡片壳，可随本任务统一迁移；
2. Legacy 整板（如 `energy-consumption/leftNewV2`、`fire-controlNew/fire-leftV2`），必须进入 Task 8 回归；
3. TSX 内联固定像素，进入 Task 4/5。

未完成分类前，不切换全局根字号。

- [ ] **Step 2: viewport-scale 使用 contain metrics**

```ts
const applyViewportMetrics = (): void => {
  const root = document.documentElement;
  const metrics = resolveViewportMetrics(root.clientWidth, root.clientHeight);
  root.style.fontSize = `${metrics.rootFontSize}px`;
  root.style.setProperty("--scale", "1");
  root.style.setProperty("--font-size-scale", "1");
  root.style.setProperty("--ue5-panel-scale-x", "none");
  root.style.setProperty("--ue5-panel-scale-y", "none");
  root.style.setProperty("--ue5-ui-scale", String(metrics.uiScale));
};
```

由 Task 6.5 的 coordinator 统一调用；本文件不再注册第二套 resize。

- [ ] **Step 3: 去掉面板 width/height 的 scale 补偿**

删除 TSX 中的内联宽度：

```ts
// 删除：style["width"] = "calc(400px / var(--scale))";
```

宽度继续由 `base-panel-render.module.less` 的 `.left-panel/.right-panel { width: 400px; }` 提供；该 Less 声明会被 PostCSS 转成 rem。不要在 JSX 内写 `"400px"`，内联样式不会经过 PostCSS。

Less：

```less
transform: none;
height: calc(100vh - 55px);
```

Less 源码中的 `400px` / `55px` 会继续被 PostCSS 转为 rem；`100vh` 保持视口单位。

- [ ] **Step 4: calcFontSize 与 contain scale 同源**

```ts
export function calcFontSize(size: number): number {
  const scaleRaw = getComputedStyle(document.documentElement)
    .getPropertyValue("--ue5-ui-scale")
    .trim();
  const scale = Number(scaleRaw);
  return size * (Number.isFinite(scale) && scale > 0 ? scale : 1);
}
```

- [ ] **Step 5: 校正区域标签 fallback**

`use-floor-tag-position.ts` 的主路径已用 `getBoundingClientRect()`，继续保留。没有面板 DOM 时的 `PANEL_VISUAL_WIDTH = 400` 改为读取 `--ue5-panel-width` 的像素值或返回折算后的 `400 × uiScale`。

- [ ] **Step 6: 明确侧栏宽度产品基线**

contain rem 下 `7680×2160` 的 400 设计像素约显示为 800 物理像素。若现场需要更宽或固定占屏比，新增独立 `--ue5-panel-width`，不要恢复 `scaleX`。该值须由 7680 真机截图确认后确定。

---

## Task 7.5：同步 Pixel Streaming、全屏和浮层坐标

**Files:**
- Modify: `prod/cube/apps/ue5/app/src/visualization-core/model-sdk/ue-sdk.ts`
- Modify: `prod/cube/apps/ue5/app/src/features/widgets/title-bar/components/switch-fullscreen/switch-fullscreen.tsx`
- Modify: `prod/cube/apps/ue5/app/src/visualization-core/hooks/use-floor-tag-position.ts`
- Modify: `prod/cube/apps/ue5/app/src/visualization-core/hooks/use-teleport-theme-vars.ts`

- [ ] **Step 1: UE 分辨率接入 coordinator**

`changeResolution` 不再独立监听 window resize。由 coordinator 在 DOM metrics 生效后发送 CSS viewport 尺寸；是否乘 DPR 必须与 Pixel Streaming 协议确认，不能凭 DOM 适配逻辑猜测。

- [ ] **Step 2: 坐标回归**

在 100%/125%/150% 浏览器缩放、全屏切换和 Windows 100%/150%/200% 系统缩放下验证模型点击、拖拽、UE 自绘光标与 DOM 热点，目标误差 ≤2px。

- [ ] **Step 3: safe area 参数化**

用 `--ue5-panel-top`、`--ue5-panel-bottom` 表达真实顶栏/底栏占用，不再把普通入口 55px、标题 skin 64/90px、GIS 100px 混为同一常量。底部必须避开业务导航。

- [ ] **Step 4: Teleport 与 popup**

统一 Select/DatePicker/Popover/Modal 的挂载约定；body Teleport 同步主题与尺寸变量。验收下拉层不被侧栏 overflow 裁切、浏览器缩放后不偏移。

---

## Task 8：回归非 UE5 页面和主题

**Files:**
- No new production files unless regression requires a scoped fix.

- [ ] **Step 1: 分辨率矩阵**

| 分辨率 | 卡数 | 期望 |
|---|---:|---|
| 1920×1080 | 2 / 3 / 5 | 2/3 铺满；5 滚动 |
| 1366×768 | 2 / 3 / 5 | 规则相同，文本可读 |
| 2560×1440 | 3 | 约 1.33 倍 |
| 3840×2160 | 3 | 约 2 倍，无 transform |
| 2560×1080 | 3 | 字号 1 倍，不落入 2800 条屏逻辑 |
| 7680×2160 | 3 / 5 | 字号 2 倍，3 铺满、5 滚动 |
| 2800×920 | 3 / 5 | 字号约 0.85 倍，无整栏压扁 |
| 1000×600 | 3 / 5 | 根字号停在 2/3，进入 compact/overflow |

- [ ] **Step 2: 渲染模式矩阵**

- UE5 Pixel Streaming
- WEBGL
- GIS
- SCADA 2D
- 登录页

重点确认 contain rem 没有让 2D 组态和登录表单异常。如果 SCADA 2D 必须保持按宽 rem，应把 root-size 策略延后到进入 `/home` 后按 `renderType` 切换，而不是恢复面板 transform。

专项检查：

- `scada-2d/scada-2d.module.less` 的 `left: 400px/420px` 是否仍与实际面板边缘一致；
- GIS 侧栏 `padding-top: 100px` 是否需要独立可用高度，不能套普通入口的 `55px`；
- Legacy 整板中 `max-height: calc((100vh - 55px) / var(--scale))` 在 `--scale=1` 后是否仍完整；
- 登录页和 body Teleport 弹窗是否因根 rem 从 width 模式改为 contain 模式而异常。

- [ ] **Step 3: 双主题与交互**

- 科技蓝：卡片 `backdrop-filter` 能采到模型。
- 极简白：无透明叠层异常。
- 标题栏、底部业务导航、区域标签位置正确。
- 卡片放大、设备/告警弹窗、筛选控件可用。
- 3→4、4→2 动态切换后布局即时更新。

- [ ] **Step 4: 浏览器、系统缩放与全屏**

- Chrome/Edge：80%、100%、125%、150%、175%。
- Windows：100%、150%、200% 显示缩放；窗口跨两个不同缩放显示器。
- 进入/退出全屏各 5 次；侧栏、ECharts、UE 流和浮层一次稳定。
- 连续拖动窗口高度到 900/720/600；600 下进入 compact/overflow，不继续缩字。

- [ ] **Step 5: 内容与性能长尾**

- KPI、折线、饼图、TopN、表格、视频、20 字符英文/德文长名称各一张代表卡。
- 连续 resize 5 秒，每帧适配处理低于 16ms，无 `ResizeObserver loop limit exceeded`。
- 运行 2 小时，确认每小时 panel remount 不造成整栏闪白；若无业务必要，单独删除该 timer。
- 高 DPR 屏幕检查 ECharts/Canvas 清晰度；DPR 只用于渲染缓冲区，不参与 DOM 布局。
- 明确 ≥4 卡时侧栏滚动与卡内列表滚动的事件归属，避免多层同时滚动。

---

## Task 9：验证与清理

**Files:**
- Delete only after successful regression:
  - `prod/cube/apps/ue5/app/src/application/config/rem.ts`
- Modify:
  - `prod/cube/apps/ue5/app/package.json`（移除不再使用的 `amfe-flexible`）
  - `prod/cube/apps/ue5/app/src/styles/index.less`
  - `prod/cube/apps/ue5/app/src/styles/visual-theme.less`

- [ ] **Step 1: 局部测试**

```bash
bun test \
  prod/cube/apps/ue5/app/src/features/cards/base-panel-render/panel-layout-policy.test.ts \
  prod/cube/apps/ue5/app/src/application/bootstrap/viewport-metrics.test.ts
```

Expected: PASS。

- [ ] **Step 2: 结构检查**

```bash
bun --cwd prod/cube/apps/ue5/app run check:structure
```

Expected: exit 0。

- [ ] **Step 3: 构建检查**

```bash
bun --cwd prod/cube/apps/ue5/app run build:dev
```

Expected: exit 0。

- [ ] **Step 4: 清理旧机制**

在确认所有目标分辨率通过后：

- 删除 `application/config/rem.ts`。
- 移除 `amfe-flexible` 依赖并按仓库 Bun 规则更新 lockfile。
- 删除 `.card-container-2/3/4`（先确认无引用）。
- 将旧 `--scale` 引用迁移完成后再删除兼容变量。
- 删除只服务旧人流旁路、且已被通用 weighted slot 替代的样式。

---

## 发布策略

1. **提交 1：卡数策略 + 测试**，不改视觉。
2. **提交 2：2/3 卡槽铺满、≥4 滚动**，暂时保留旧 scale。
3. **提交 3：代表卡 flex/ResizeObserver/列表适配**。
4. **提交 4：viewport coordinator + contain rem，关闭面板 transform**。
5. **提交 5：Pixel Streaming / 全屏 / safe area / Teleport 同步**。
6. **提交 6：全矩阵回归后的旧代码清理**。

不要把 Task 2 和 Task 7 合并成一次上线。前者验证业务布局，后者改变全局尺寸体系，必须能分别回滚。

## 最终验收门槛

- 左右栏分别配置 2 或 3 张有效卡：从顶栏下方铺到侧栏可视底部，无侧栏滚动、无底部空带。
- 任一侧超过 3 张：单卡高度与三卡铺满模式一致，仅该侧出现滚动。
- 4K、7680、带鱼和 2800 不依赖最近邻分辨率表。
- `#player`、UE5 video/canvas、GIS 容器始终保持 `width/height: 100%` 且无 transform。
- 科技蓝卡片在所有目标分辨率下能透出 3D 毛玻璃。
- ECharts 和固定行高列表不裁切、不拉伸、不需刷新页面。
- SCADA 2D 的 400/420px 浮层偏移、GIS 的 100px 顶部留白、Legacy 整板均通过专项回归。
- 浏览器 80%～175% 缩放、Windows 100%～200% 系统缩放、跨屏和全屏切换后，UE 点击/自绘光标误差 ≤2px。
- 极短窗口只进入 compact/overflow，不低于可读缩放下限，不恢复 scaleY。
- body Teleport 下拉/弹窗不偏移、不裁切，顶栏和底栏不遮挡卡槽。
