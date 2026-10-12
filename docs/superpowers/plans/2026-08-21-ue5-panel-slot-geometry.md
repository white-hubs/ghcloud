# UE5 侧栏卡片槽位几何 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking. Do not commit unless the user asks.

**Goal:** 侧栏恢复「固定高度滚动区 + 像素槽位 + 12px 间距」：一屏只放得下的完整卡，多出来的整栏滚动；卡不被压扁、不互相重叠、不被底栏裁切。

**Architecture:** JS 装箱只输出每张卡的像素高度和可见张数 N。CSS Grid 用这些像素当 `grid-template-rows`，槽位 `height:100%` 填满该行。卡内图表在槽内 `flex:1` 且 `min-height:180px`。禁止再用 `auto` / `minmax(slotMin, max-content)` / `overflow:visible` 让卡画出格子。

**Tech Stack:** Vue 3 TSX、CSS Modules/Less、Bun test

**Supersedes:**

- `docs/superpowers/plans/2026-08-21-ue5-panel-slot-packing.md`（余量加进间距的部分）
- `docs/superpowers/plans/2026-08-21-ue5-per-card-slot-min.md`（把普通卡 `slotMin` 抬到 400 的部分）
- `docs/superpowers/plans/2026-08-21-ue5-content-sized-cards.md`（网格行改 `auto`/`max-content` 的部分）

---

## 当前截图为什么是错的

总览最新一屏同时出现了三件不该发生的事：

1. **间距没了**：卡底贴着下一张卡顶。
2. **压缩**：环图、图例被压扁。
3. **截断**：左侧「设备统计」下半被切掉，右侧「管理态势分析」只剩标题条，底栏压在卡上。

根因不是「还没分配好内容高度」，而是上一轮把网格改成了 `repeat(n, auto)`，槽位 `height:auto; overflow:visible`，侧栏 `overflow:visible`。自动行高被内部 `min-height:0` 压得很矮，真实内容溢出格子盖住 12px `gap`，侧栏又没有一个高度钉死的滚动口，多出来的卡直接画到导航下面。

---

## 需求收口（本方案唯一口径）

前几轮把「填满」「跟内容走」「左右齐平」写进了同一套 CSS，互相否定。下面按用户原需求和后续截图投诉收成一条因果链，**以后改布局先改这张表，再改代码**。

### 要解决的问题

| 用户原话 | 含义 |
|---|---|
| 卡片清晰、比例协调 | 标题、指标、主图完整可读，主图不是一条缝 |
| 1080p 和笔记本都好看 | 矮窗少显示几张，不靠缩字、不靠压扁硬塞 |
| 间距合理 | 卡与卡之间永远是 12px，不能贴在一起，也不能空出一大块星空 |
| 左右底边齐平 | 两侧都是「填满侧栏」的装箱栏时，最后一张可见卡底边对齐 |
| 动态可见张数，多了整卡滚动 | N = 当前高度能放下的完整卡数；其余在侧栏里整张滚出来 |
| 超长介绍/视频不要被裁 | 市场总览可以占满第一屏，下一张靠滚动看；不要把介绍和环图一起压进半张卡 |
| 不要刻意拉长 | 普通分析卡涨到 `slotMax` 为止，余量留给侧栏底部场景，不要灌成一张空白玻璃 |

### 明确不做

- 不测每张卡的真实 DOM 高度。
- 不缩字号（`MIN_UI_SCALE = 1`）。
- 不用整页 `transform: scale()`。
- 不用 `overflow:hidden` 裁掉下一张卡（只允许裁**槽内**溢出）。
- 不把余量加进卡间距（会变成中间一条大缝）。
- 不让网格行等于 `auto` / `max-content`（会再次丢间距、压扁、画出格子）。

### 三层职责

```
Viewport     字号 >= 1920；面板宽 widthScale rem，下限 280px
Panel 壳     钉死滚动口高度 H；按 slotMin 算 N；按权重把高度分到 [slotMin, slotMax]
Card 内容    填满自己的槽；主图 min 180px；列表只滚表体；密度只收 padding/gap
```

### 几何规则

侧栏内容区高度：

```
H = viewportHeight - panelTop - panelBottom
```

1080p 约 940px，768p 约 628px。

| 规则 | 口径 |
|---|---|
| 间距 | `gap = 12px`，装箱后**不再**把余量加进 gap |
| 可见张数 N | 从配置张数往下找，使 `sum(slotMin[0..n-1]) + 12*(n-1) <= H`；至少 1 |
| 槽高 | 先每人 `slotMin`，余量按 weight 涨到各自 `slotMax` |
| 涨满后仍有余量 | 留在滚动口**底部**（透明，露出场景）。不进卡片，不加间距 |
| 左右齐平 | 两侧滚动口都是 H。两边都能继续涨时，最后一张可见卡底边对齐；一边触顶 `slotMax` 或含 media 时允许不齐 |
| 滚动 | 配置张数 > N，或全部槽高+间距 > H 时，滚动口 `overflow-y: auto`。滚动单元是整张卡 |
| 网格行 | `--panel-slot-rows: 320px 305px 305px` 这种**像素列表**，与 `slotHeights` 一一对应 |
| 槽溢出 | `.panel-card-slot { height:100%; overflow:hidden }`，内容不得画到下一张卡上 |

### 内容档位

普通卡 `slotMin = 280`（含标题）。**不要**再给分析/趋势卡单独 400 的地板，那会让 1080p 只能塞 2 张并开始压缩。

| `contentClass` | weight | slotMin | slotMax | fillMode | 用途 |
|---|---|---|---|---|---|
| `kpi` | 0.9 | 280 | 340 | `center` | UPS、人流等稀疏指标 |
| `chart` | 1.15 | 280 | 400 | `stretch` | 折线/柱状/视频 |
| `composite` | 1.35 | 280 | 460 | `stretch` | 指标+图、环图+图例 |
| `table` | 1.2 | 280 | 420 | `rows` | 指标+表 |
| `media` | 1.8 | 720 | 900 | `stretch` | 市场总览（图+介绍） |

验算：

- 1080p 三张普通卡：`3×280+24=864 ≤ 940` → N=3，余量 76px 按权重涨到约 305px 设计态，gap 仍 12，底边齐平。
- 768p 三张普通卡：`3×280+24=864 > 628`，`2×280+12=572 ≤ 628` → N=2，第三张整卡滚动。
- 1080p 市场总览+设备统计：`720+12+280=1012 > 940` → N=1，总览吃满第一屏（涨到 `min(900,H)`），设备统计滚出来。这是刻意的：两张都完整，总览介绍不被压成半张卡。
- 更高窗口（H≥1012）两张一起进第一屏。

### 卡内硬约束

- 柱/折图、视频区：`flex: 1 1 0; min-height: 180px`。槽约 305px 时主图约 180～220px；禁止锁死 180px 让指标和图表中间空一截；禁止在 600px 空槽里把图拉成幕布（`slotMax` 已经挡住）。
- 视频保持 16:9，且最小高度 180px，禁止扁成一条。
- 环图走 `--card-pie-size`，不要被压成椭圆。
- 列表只滚表体。
- `comfortable / compact` 只收 padding / gap / icon，不改主结构、不缩字。
- 空态在槽内居中，槽仍是装箱高度，不要另做超高空态。

### 字号与宽度（已落地，本方案不改算法）

- `uiScale = max(1, min(w/1920, h/1080))`
- 面板宽 `clamp(280px, 400 × widthScale, 480px)`，再受中间预留约束

---

## File structure

**Modify**

- `prod/cube/apps/ue5/app/src/features/cards/base-panel-render/panel-slot-packing.ts`
- `prod/cube/apps/ue5/app/src/features/cards/base-panel-render/panel-slot-packing.test.ts`
- `prod/cube/apps/ue5/app/src/features/cards/base-panel-render/card-layout-profile.ts`
- `prod/cube/apps/ue5/app/src/features/cards/base-panel-render/card-layout-profile.test.ts`
- `prod/cube/apps/ue5/app/src/features/cards/base-panel-render/base-panel-render.tsx`
- `prod/cube/apps/ue5/app/src/features/cards/base-panel-render/base-panel-render.module.less`
- `prod/cube/apps/ue5/app/src/features/cards/security-monitoring-safty/cards/security-monitor.module.less`
- `.agents/standards/ue5-card-layout-density-standard.md`
- `.agents/standards/INDEX.md`
- `.agents/skills/ue5-visual-card-v2/SKILL.md`

**Keep as re-export**

- `prod/cube/apps/ue5/app/src/features/cards/base-panel-render/panel-layout-policy.ts`

---

### Task 1: Restore packing — grow to slotMax, never touch gap

**Files:**

- Modify: `prod/cube/apps/ue5/app/src/features/cards/base-panel-render/panel-slot-packing.ts`
- Modify: `prod/cube/apps/ue5/app/src/features/cards/base-panel-render/panel-slot-packing.test.ts`

- [ ] **Step 1: Rewrite tests to the locked geometry**

把 `panel-slot-packing.test.ts` 整文件换成：

```ts
import { describe, expect, test } from "bun:test";

import { resolvePanelSlotPacking, SLOT_GAP, SLOT_MIN } from "./panel-slot-packing";

const chart = { weight: 1.15, slotMin: 280, slotMax: 400 };
const composite = { weight: 1.35, slotMin: 280, slotMax: 460 };
const kpi = { weight: 0.9, slotMin: 280, slotMax: 340 };
const media = { weight: 1.8, slotMin: 720, slotMax: 900 };

const sum = (values: number[]) => values.reduce((total, value) => total + value, 0);

describe("resolvePanelSlotPacking", () => {
  test("1080p three regular cards stay visible, grow toward design height, keep 12px gap", () => {
    const packing = resolvePanelSlotPacking({
      cardCount: 3,
      availableHeight: 940,
      uiScale: 1,
      profiles: [composite, chart, chart],
    });
    expect(packing.visibleCount).toBe(3);
    expect(packing.mode).toBe("pack");
    expect(packing.gap).toBe(SLOT_GAP);
    expect(packing.paddingTop).toBe(0);
    expect(packing.slotHeights).toHaveLength(3);
    expect(Math.min(...packing.slotHeights)).toBeGreaterThanOrEqual(SLOT_MIN);
    expect(sum(packing.slotHeights) + packing.gap * 2).toBeCloseTo(940, 0);
    expect(packing.slotHeights[0]).toBeGreaterThan(packing.slotHeights[1]);
  });

  test("768p drops to two visible cards and scrolls the third at a complete height", () => {
    const packing = resolvePanelSlotPacking({
      cardCount: 3,
      availableHeight: 628,
      uiScale: 1,
      profiles: [composite, chart, chart],
    });
    expect(packing.visibleCount).toBe(2);
    expect(packing.mode).toBe("scroll");
    expect(packing.gap).toBe(SLOT_GAP);
    expect(packing.slotHeights[0]).toBeGreaterThanOrEqual(SLOT_MIN);
    expect(packing.slotHeights[2]).toBeGreaterThanOrEqual(SLOT_MIN);
  });

  test("two-card leftover grows cards to slotMax then leaves the rest unused", () => {
    const packing = resolvePanelSlotPacking({
      cardCount: 2,
      availableHeight: 940,
      uiScale: 1,
      profiles: [composite, kpi],
    });
    expect(packing.mode).toBe("pack");
    expect(packing.gap).toBe(SLOT_GAP);
    expect(packing.slotHeights[0]).toBe(460);
    expect(packing.slotHeights[1]).toBe(340);
    expect(sum(packing.slotHeights) + packing.gap).toBeLessThan(940);
  });

  test("single card stops at slotMax instead of eating the sidebar", () => {
    const packing = resolvePanelSlotPacking({
      cardCount: 1,
      availableHeight: 940,
      uiScale: 1,
      profiles: [{ weight: 1.45, slotMin: 280, slotMax: 460 }],
    });
    expect(packing.slotHeights[0]).toBe(460);
    expect(packing.paddingTop).toBe(0);
    expect(packing.gap).toBe(SLOT_GAP);
  });

  test("1080p market overview takes the first screen and scrolls the device card", () => {
    const packing = resolvePanelSlotPacking({
      cardCount: 2,
      availableHeight: 940,
      uiScale: 1,
      profiles: [media, composite],
    });
    expect(packing.visibleCount).toBe(1);
    expect(packing.mode).toBe("scroll");
    expect(packing.slotHeights[0]).toBe(900);
    expect(packing.slotHeights[1]).toBeGreaterThanOrEqual(SLOT_MIN);
    expect(packing.gap).toBe(SLOT_GAP);
  });

  test("tall window can show market overview and device stats together", () => {
    const packing = resolvePanelSlotPacking({
      cardCount: 2,
      availableHeight: 1100,
      uiScale: 1,
      profiles: [media, composite],
    });
    expect(packing.visibleCount).toBe(2);
    expect(packing.mode).toBe("pack");
    expect(packing.slotHeights[0]).toBeGreaterThanOrEqual(720);
    expect(packing.slotHeights[0]).toBeLessThanOrEqual(900);
    expect(packing.gap).toBe(SLOT_GAP);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
bun test prod/cube/apps/ue5/app/src/features/cards/base-panel-render/panel-slot-packing.test.ts
```

Expected: FAIL — current implementation returns all `slotMin` and never grows.

- [ ] **Step 3: Implement packing**

把 `panel-slot-packing.ts` 换成：

```ts
export const SLOT_MIN = 280;
export const SLOT_GAP = 12;

export type PanelPackMode = "empty" | "pack" | "scroll";

export interface PanelSlotPacking {
  mode: PanelPackMode;
  cardCount: number;
  visibleCount: number;
  slotHeights: number[];
  gap: number;
  paddingTop: number;
}

const safeWeight = (weight: number): number =>
  Number.isFinite(weight) && weight > 0 ? weight : 1;

const safeMin = (slotMin: number): number =>
  Math.max(SLOT_MIN, Number.isFinite(slotMin) && slotMin > 0 ? slotMin : SLOT_MIN);

const safeMax = (slotMax: number, slotMin: number): number =>
  Math.max(slotMin, Number.isFinite(slotMax) && slotMax > 0 ? slotMax : slotMin);

export const resolveVisibleCount = (
  availableHeight: number,
  slotMins: number[],
  gap: number,
): number => {
  const count = slotMins.length;
  if (count === 0) {
    return 0;
  }
  for (let n = count; n >= 1; n--) {
    const needed =
      slotMins.slice(0, n).reduce((sum, min) => sum + min, 0) + gap * Math.max(0, n - 1);
    if (needed <= availableHeight) {
      return n;
    }
  }
  return 1;
};

export const distributeSlotHeights = (
  availableHeight: number,
  gap: number,
  profiles: Array<{ weight: number; slotMin: number; slotMax: number }>,
): number[] => {
  const n = profiles.length;
  if (n === 0) {
    return [];
  }
  const heights = profiles.map((profile) => profile.slotMin);
  let remaining = availableHeight - heights.reduce((sum, height) => sum + height, 0) - gap * Math.max(0, n - 1);
  if (remaining <= 0) {
    return heights;
  }

  for (let guard = 0; guard < 8 && remaining > 0.5; guard++) {
    const growable = profiles
      .map((profile, index) => ({
        index,
        room: profile.slotMax - heights[index],
        weight: safeWeight(profile.weight),
      }))
      .filter((item) => item.room > 0.5);
    if (growable.length === 0) {
      break;
    }
    const weightSum = growable.reduce((sum, item) => sum + item.weight, 0);
    let used = 0;
    for (const item of growable) {
      const take = Math.min(item.room, remaining * (item.weight / weightSum));
      heights[item.index] += take;
      used += take;
    }
    if (used < 0.5) {
      break;
    }
    remaining -= used;
  }
  return heights.map((height) => Math.round(height));
};

export const resolvePanelSlotPacking = (options: {
  cardCount: number;
  availableHeight: number;
  uiScale: number;
  profiles: Array<{ weight: number; slotMin: number; slotMax: number }>;
}): PanelSlotPacking => {
  const scale = Number.isFinite(options.uiScale) && options.uiScale > 0 ? options.uiScale : 1;
  const gap = SLOT_GAP * scale;
  const count = Math.max(0, Math.floor(options.cardCount));
  if (count === 0) {
    return { mode: "empty", cardCount: 0, visibleCount: 0, slotHeights: [], gap, paddingTop: 0 };
  }

  const availableHeight = Math.max(0, options.availableHeight);
  const scaled = options.profiles.map((profile) => {
    const slotMin = safeMin(profile.slotMin) * scale;
    return {
      weight: safeWeight(profile.weight),
      slotMin,
      slotMax: safeMax(profile.slotMax, profile.slotMin) * scale,
    };
  });
  const visibleCount = resolveVisibleCount(
    availableHeight,
    scaled.map((profile) => profile.slotMin),
    gap,
  );
  const packedHeights = distributeSlotHeights(availableHeight, gap, scaled.slice(0, visibleCount));
  const meanVisible =
    packedHeights.reduce((sum, height) => sum + height, 0) / Math.max(1, packedHeights.length);
  const meanWeight =
    scaled.slice(0, visibleCount).reduce((sum, profile) => sum + profile.weight, 0) /
    Math.max(1, visibleCount);

  const slotHeights = scaled.map((profile, index) => {
    if (index < visibleCount) {
      return packedHeights[index];
    }
    const target = meanVisible * (profile.weight / meanWeight);
    return Math.round(Math.min(profile.slotMax, Math.max(profile.slotMin, target)));
  });

  const contentHeight =
    slotHeights.reduce((sum, height) => sum + height, 0) + gap * Math.max(0, count - 1);

  return {
    mode: contentHeight > availableHeight + 1 || visibleCount < count ? "scroll" : "pack",
    cardCount: count,
    visibleCount,
    slotHeights,
    gap,
    paddingTop: 0,
  };
};
```

说明：余量只进 `slotMax` 以内的槽高。涨满后多出来的像素不改 `gap`，CSS 里会自然留在滚动口底部。

- [ ] **Step 4: Re-run packing tests**

```bash
bun test prod/cube/apps/ue5/app/src/features/cards/base-panel-render/panel-slot-packing.test.ts
```

Expected: PASS

---

### Task 2: Restore class defaults — 280 floor, tight slotMax, media 720

**Files:**

- Modify: `prod/cube/apps/ue5/app/src/features/cards/base-panel-render/card-layout-profile.ts`
- Modify: `prod/cube/apps/ue5/app/src/features/cards/base-panel-render/card-layout-profile.test.ts`

- [ ] **Step 1: Update profile tests**

把这些断言改成新档位（其余 unknown/fillMode 用例保持）：

```ts
expect(resolveCardLayoutProfile("ups-work-situation").slotMax).toBe(340);
expect(resolveCardLayoutProfile("security-analysis").slotMin).toBe(280);
expect(resolveCardLayoutProfile("security-analysis").slotMax).toBe(460);
expect(resolveCardLayoutProfile("security-market-overview")).toMatchObject({
  contentClass: "media",
  slotMin: 720,
  slotMax: 900,
});
expect(resolveCardLayoutProfile("alarm-status-and-trend").slotMin).toBe(280);
```

删除「kpi+chart composites keep a 400px floor」这类用例。

- [ ] **Step 2: Change class defaults and drop 400 floors**

`CLASS_DEFAULTS`：

```ts
const CLASS_DEFAULTS: Record<CardContentClass, Omit<CardLayoutProfile, "contentClass">> = {
  kpi: { weight: 0.9, slotMin: 280, slotMax: 340, fillMode: "center" },
  chart: { weight: 1.15, slotMin: 280, slotMax: 400, fillMode: "stretch" },
  composite: { weight: 1.35, slotMin: 280, slotMax: 460, fillMode: "stretch" },
  table: { weight: 1.2, slotMin: 280, slotMax: 420, fillMode: "rows" },
  media: { weight: 1.8, slotMin: 720, slotMax: 900, fillMode: "stretch" },
};
```

`CARD_LAYOUT_PROFILES` 里删掉所有 `{ slotMin: 400 }` 覆盖，只保留结构差异（table / kpi / media / 个别 weight）。`security-market-overview` 继续 `profile("media")`。

- [ ] **Step 3: Run profile tests**

```bash
bun test prod/cube/apps/ue5/app/src/features/cards/base-panel-render/card-layout-profile.test.ts
```

Expected: PASS

---

### Task 3: Grid rows are pixel slots; the pack box is a real scrollport

**Files:**

- Modify: `prod/cube/apps/ue5/app/src/features/cards/base-panel-render/base-panel-render.tsx`
- Modify: `prod/cube/apps/ue5/app/src/features/cards/base-panel-render/base-panel-render.module.less`

- [ ] **Step 1: Emit pixel row tracks**

`base-panel-render.tsx` 里把 `--panel-slot-rows` 改回：

```ts
"--panel-slot-rows": panelLayout.value.slotHeights.map((height) => `${height}px`).join(" "),
"--panel-slot-gap": `${panelLayout.value.gap}px`,
"--panel-pack-padding-top": `${panelLayout.value.paddingTop}px`,
```

`cardCount === 0` 时用空字符串，不要 `repeat(n, auto)`。

- [ ] **Step 2: Pin the scrollport and restore slot overflow**

`.panel-layout-box` 保持：

```less
--panel-content-height: calc(100vh - var(--ue5-panel-top) - var(--ue5-panel-bottom));
flex: 1 1 0;
min-height: 0;
```

`.panel-card-slot` 改回填满格子（不要 `height:auto; overflow:visible`）：

```less
.panel-card-slot {
  display: flex;
  flex-direction: column;
  min-width: 0;
  min-height: 0;
  height: 100%;
  overflow: hidden;
  container-type: size;
  container-name: card-slot;

  > :first-child {
    display: flex;
    flex: 1 1 0;
    flex-direction: column;
    min-width: 0;
    min-height: 0;
    height: 100%;
  }
}
```

`sub-panel-wrapper` / `sub-panel` / `sub-panel-content` 恢复 `flex: 1 1 0; height: 100%; min-height: 0`。不要 `height: auto`。

`.panel-pack-box` 整段换成：

```less
.panel-pack-box {
  display: grid;
  grid-template-rows: var(--panel-slot-rows);
  gap: var(--panel-slot-gap, 12px);
  align-content: start;
  align-items: stretch;
  box-sizing: border-box;
  height: var(--panel-content-height);
  max-height: var(--panel-content-height);
  min-height: 0;
  padding-top: var(--panel-pack-padding-top, 0);
  overflow-x: hidden;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: var(--visual-scrollbar-thumb, rgba(70, 166, 255, 0.35)) transparent;

  > .panel-card-slot {
    width: 100%;
    min-width: 0;
    min-height: 0;
    height: 100%;
    align-self: stretch;
    overflow: hidden;
  }
}
```

删除 `grid-auto-rows: auto`、槽位 `align-self: start`、`height: auto`。`.left-panel` / `.right-panel` 继续 `overflow: visible`（毛玻璃），**滚动只发生在 pack-box**。

`[data-card-fill-mode="stretch"]` 里图表改回吃槽内剩余高度：

```less
:global(.gh-line-chart.chart),
:global(.chart.gh-line-chart),
:global(.v2-chart-panel),
:global(.chart-panel),
:global(.trend-chart-panel) {
  flex: 1 1 0;
  min-height: 180px;
  height: auto;
}
```

删掉「锁死 180px」的规则。`.v2-panel-card .sub-panel` 不要 `overflow-y: auto`（那会在槽内再滚一层并把内容压扁）；改 `overflow: hidden`。列表/图例自己的局部滚动保留在业务卡上。

市场总览：body 重新 `height: 100%`；介绍区在槽内可滚（`min-height: 0; overflow-y: auto`），因为第一屏槽高约 900，介绍应尽量完整，超出才在**这一张卡内**滚正文，不裁环图。

- [ ] **Step 3: Video min height**

`security-monitor.module.less` 保持 16:9，同时最小 180px：

```less
.security-monitor-v2 {
  display: flex;
  flex: 1 1 0;
  flex-direction: column;
  width: 100%;
  min-height: 180px;
  height: 100%;
  aspect-ratio: auto;
  padding: 0;
}
```

槽高约 305～400 时由槽位决定高度，避免 `aspect-ratio + height:auto + min-height:0` 再把播放器压成一条。

---

### Task 4: Rewrite the density standard so agents stop oscillating

**Files:**

- Modify: `.agents/standards/ue5-card-layout-density-standard.md`
- Modify: `.agents/standards/INDEX.md`
- Modify: `.agents/skills/ue5-visual-card-v2/SKILL.md`

按 `project-docs`：规范以本计划「需求收口」为准，删掉标准里现在的自相矛盾句。

- [ ] **Step 1: Replace Goals / Panel 壳层 / Composite media / Verification / DO NOT**

新 Goals：

1. 侧栏是高度为 H 的滚动口。网格行是装箱得到的像素槽高，卡间距固定 12px。
2. N 由 `slotMin` 决定；普通卡 1080p 一屏 3 张（约 305px 设计态）。放不下就减 N，整卡滚动。
3. 槽高在 `[slotMin, slotMax]` 内按权重分配。涨到上限后的余量留在滚动口底部场景，不进卡片、不加间距。
4. `media`（市场总览）`slotMin=720`，1080p 通常只显示这一张，下一张滚动出现。
5. 面板宽度走 `--ue5-panel-width` rem；字号 `MIN_UI_SCALE = 1`。
6. 禁止 `auto`/`max-content` 行、禁止槽位 `overflow:visible` 盖住间距、禁止 fill+hidden 裁下一张卡。

Panel 壳层改成：「`resolvePanelSlotPacking` 输出像素行；`grid-template-rows` 用这些像素；pack-box `height: var(--panel-content-height); overflow-y: auto`。」

Composite 仪表盘+介绍：注册 `media`，槽位填满第一屏，介绍在卡内滚动，不要 `height:auto` 撑破格子。

Verification 改成：

1. 1080p 安防/动环：三张完整卡、12px 缝、底边齐平、主图约 180px+。
2. 1080p 总览：左侧先看到完整市场总览；往下滚才是设备统计；右侧三张完整或第三张需滚动时整卡出现，不被底栏切标题。
3. 笔记本：普通面板 2 张完整，第三张滚动；字仍约 12px。
4. 卡与卡之间能看到场景，但只有 12px，不是大块空洞。

INDEX 表那一行改成：

`开发或修复 prod/cube/apps/ue5/app 卡片布局；像素槽位装箱、12px 间距、减 N 滚动、media 占满第一屏`

Skill 里「笔记本字太小」那行改成指向本标准 Viewport + Panel 壳，删掉 `minmax(slotMin, max-content)` 表述（若 reference 里有同样写上）。

---

### Task 5: Verify

```bash
bun test \
  prod/cube/apps/ue5/app/src/features/cards/base-panel-render/panel-slot-packing.test.ts \
  prod/cube/apps/ue5/app/src/features/cards/base-panel-render/card-layout-profile.test.ts \
  prod/cube/apps/ue5/app/src/features/cards/base-panel-render/panel-layout-policy.test.ts \
  prod/cube/apps/ue5/app/src/features/cards/base-panel-render/card-slot-density.test.ts
```

Expected: PASS

浏览器 `localhost:8098/ue5/home`：

| 面板 | 1080p | 笔记本（约 1366×768） |
|---|---|---|
| 总览 | 左：市场总览一屏完整，滚一下才见设备统计；右：安全分析/风险源完整，态势若第 3 张则整卡可滚出 | 左仍先总览；右可能 2 张，第 3 张滚动 |
| 安防 | 左右各 2～3 张完整，间距 12px，视频是一块画面 | 减到 2 张，不压扁 |
| 动环 | 趋势卡约 305px 而不是拉满一栏；级别统计完整或整卡滚动 | 同左 |

失败信号（出现任一条就停下来改壳，不要再改单卡）：

- 卡贴在一起
- 底栏切掉半张卡且滚不动
- 主图一条缝
- 两张卡中间空出一大块星空
- 一张普通分析卡拉成整栏空白玻璃

---

## Self-review

- 间距 12px、减 N、像素行、滚动口、slotMax 余量还场景、media 第一屏：每个都有对应 Task。
- 没有 TBD；装箱函数、测试、CSS、tsx 变量都写了完整代码。
- `paddingTop` 仍保留在类型里（恒为 0），避免调用方再拆一次接口。
- 不把余量加回 gap，避免再次出现安防那条大缝。
