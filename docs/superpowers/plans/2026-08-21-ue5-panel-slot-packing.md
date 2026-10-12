# UE5 Panel Slot Packing Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 侧栏按窗口高度装箱：1080p 一屏完整 3 张（该槽高即设计态），更矮则减少可见张数并整卡滚动；单卡高度按静态内容档位分配，超出上限的余量加间距；面板宽度用独立 widthScale 的 rem，下限 280px，字号仍不低于 1920 设计稿。

**Architecture:** 拆成三层互不耦合的纯函数：`viewport-metrics` 算字号 scale 与面板宽度；`panel-slot-packing` 按 `slotMin` 决定可见张数 N，再按内容档位权重把高度分到 `[slotMin, slotMax]`，剩余给 gap；`BasePanelRender` 只把像素结果写成 CSS 变量。禁止再用「2/3 张一律 fill + overflow:hidden + rearrange 压图」换一屏塞满。

**Tech Stack:** Vue 3 TSX、CSS Modules/Less、Bun test、ResizeObserver、ECharts

**Supersedes:** `docs/superpowers/plans/2026-08-19-ue5-adaptive-panel-layout.md` 中「2/3 张必须同时可见、用 compact/overflow 消化高度」的策略。那份计划落地后果是：笔记本仍塞 3 张、图表被压成一条、第三张被裁切、400px 面板过宽。

---

## Locked decisions

| 决策 | 口径 |
|---|---|
| 1920×1080 三张 | 必须一屏完整可见。槽高约 305px 是**设计态**，不是压缩态 |
| 更矮窗口 | 先减 N，不把槽压到 `slotMin`（280px，含标题）以下 |
| 多卡滚动 | `N < 配置张数` 时侧栏 `overflow-y: auto`，滚动单元是整张卡 |
| 内容高低 | 静态内容档 `kpi / chart / composite / table`，不测 DOM |
| 余量 | 每人涨到自己的 `slotMax` 后，剩余加到卡间距；1 张卡时余量 `padding-top`，底边仍贴侧栏底 |
| 左右齐平 | 两侧内容区高度都等于 `H`（窗口 − 顶栏 − 底栏），最后一张可见卡底边对齐 |
| 字号 | `uiScale = max(1, min(w/1920, h/1080))`，笔记本不缩字 |
| 面板宽 | `clamp(280px, 400 × widthScale, 480px)`，再受中间预留约束；CSS 用 rem |
| 异形屏 | 中间预留 `max(320px, 28% 视口宽)`；极窄允许两栏变窄并叠在模型上 |
| Legacy 整板 | 仍不走装箱 |

### 内容档位

| `contentClass` | weight | slotMax（含标题，设计 px） | fillMode |
|---|---|---|---|
| `kpi` | 0.9 | 340 | `center` |
| `chart` | 1.15 | 400 | `stretch` |
| `composite` | 1.35 | 460 | `stretch` |
| `table` | 1.2 | 420 | `rows` |

`slotMin = 280` 全局共用。未知 code 默认 `chart`。

验算：

- 1080p：`H ≈ 940`，`3×280+24=864 ≤ 940` → N=3，余量 76px 按权重微调
- 1366×768：`H ≈ 628`，三张放不下，`2×280+12=572 ≤ 628` → N=2
- 1366 宽：`widthScale≈0.71` → 面板约 284px，中间约 800px

### 卡内硬约束（装箱之后）

- 柱/折图容器 `min-height: 140px`，吃剩余高度，禁止压成一条
- 环图走 `--card-pie-size`，最小直径不因槽高变成椭圆
- 列表只滚表体；`rearrange` 档位删除（不再作为「把主图压到 140px 以下」的路径）
- `comfortable / compact` 只收间距，不改主结构

---

## File structure

**Create**

- `prod/cube/apps/ue5/app/src/features/cards/base-panel-render/panel-slot-packing.ts` — 可见张数 + 高度分配
- `prod/cube/apps/ue5/app/src/features/cards/base-panel-render/panel-slot-packing.test.ts`

**Modify**

- `prod/cube/apps/ue5/app/src/application/bootstrap/viewport-metrics.ts` + `.test.ts`
- `prod/cube/apps/ue5/app/src/application/bootstrap/viewport-coordinator.ts`
- `prod/cube/apps/ue5/app/src/features/cards/base-panel-render/card-layout-profile.ts` + `.test.ts`
- `prod/cube/apps/ue5/app/src/features/cards/base-panel-render/panel-layout-policy.ts` + `.test.ts` — 改为 re-export / 删除旧 fill/overflow 逻辑
- `prod/cube/apps/ue5/app/src/features/cards/base-panel-render/base-panel-render.tsx`
- `prod/cube/apps/ue5/app/src/features/cards/base-panel-render/base-panel-render.module.less`
- `prod/cube/apps/ue5/app/src/features/cards/base-panel-render/card-slot-density.ts` + `.test.ts`
- `prod/cube/apps/ue5/app/src/visualization-core/hooks/use-teleport-theme-vars.ts`
- `.agents/standards/ue5-card-layout-density-standard.md`
- `.agents/standards/INDEX.md`
- `.agents/skills/ue5-visual-card-v2/SKILL.md`

**Delete after wiring**

- `resolvePanelLayout` / `resolvePanelLayoutWithOverflow` 的 fill/overflow 语义（由 packing 取代）
- `.panel-fill-box` / `.panel-overflow-box` / `.panel-weighted-box` 中靠 `overflow: hidden` 裁第三张的规则

---

### Task 1: Panel width + widthScale in viewport metrics

**Files:**
- Modify: `prod/cube/apps/ue5/app/src/application/bootstrap/viewport-metrics.ts`
- Modify: `prod/cube/apps/ue5/app/src/application/bootstrap/viewport-metrics.test.ts`

- [ ] **Step 1: Write failing tests**

在 `viewport-metrics.test.ts` 增加：

```ts
import {
  PANEL_WIDTH_DESIGN,
  PANEL_WIDTH_MIN,
  resolvePanelWidthPx,
  resolveViewportMetrics,
} from "./viewport-metrics";

test("laptop keeps font scale at 1 but reports widthScale from viewport width", () => {
  const metrics = resolveViewportMetrics(1366, 768);
  expect(metrics.uiScale).toBe(1);
  expect(metrics.widthScale).toBeCloseTo(1366 / 1920, 4);
  expect(metrics.panelWidthPx).toBeCloseTo(PANEL_WIDTH_DESIGN * (1366 / 1920), 0);
  expect(metrics.panelWidthPx).toBeGreaterThanOrEqual(PANEL_WIDTH_MIN);
});

test("1080p panel stays 400px", () => {
  expect(resolveViewportMetrics(1920, 1080).panelWidthPx).toBe(400);
});

test("panel width caps at 480px on ultra-wide", () => {
  expect(resolveViewportMetrics(5120, 1440).panelWidthPx).toBe(480);
});

test("narrow viewport keeps a center reserve then shrinks panels", () => {
  const width = resolvePanelWidthPx(900, 900 / 1920);
  expect(width).toBeGreaterThanOrEqual(280);
  expect(2 * width + 320).toBeLessThanOrEqual(900 + 1);
});

test("extreme narrow still yields two panels without NaN", () => {
  const width = resolvePanelWidthPx(500, 500 / 1920);
  expect(width).toBeGreaterThanOrEqual(160);
  expect(2 * width).toBeLessThanOrEqual(500);
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
bun test prod/cube/apps/ue5/app/src/application/bootstrap/viewport-metrics.test.ts
```

Expected: FAIL — `widthScale` / `panelWidthPx` / `resolvePanelWidthPx` missing.

- [ ] **Step 3: Implement**

在 `viewport-metrics.ts` 的 `ViewportMetrics` 增加 `widthScale`、`panelWidthPx`。追加：

```ts
export const PANEL_WIDTH_DESIGN = 400;
export const PANEL_WIDTH_MIN = 280;
export const PANEL_WIDTH_MAX = 480;
export const CENTER_RESERVE_MIN = 320;
export const CENTER_RESERVE_RATIO = 0.28;
export const PANEL_WIDTH_ABSOLUTE_MIN = 160;

export const resolvePanelWidthPx = (viewportWidth: number, widthScale: number): number => {
  const vw = Number.isFinite(viewportWidth) && viewportWidth > 0 ? viewportWidth : 0;
  const scale = Number.isFinite(widthScale) && widthScale > 0 ? widthScale : 0;
  const desired = Math.min(
    PANEL_WIDTH_MAX,
    Math.max(PANEL_WIDTH_MIN, PANEL_WIDTH_DESIGN * scale),
  );
  const centerReserve = Math.max(CENTER_RESERVE_MIN, CENTER_RESERVE_RATIO * vw);
  if (2 * desired + centerReserve <= vw) {
    return desired;
  }
  const shrunk = (vw - centerReserve) / 2;
  if (shrunk >= PANEL_WIDTH_MIN) {
    return shrunk;
  }
  return Math.min(PANEL_WIDTH_MIN, Math.max(PANEL_WIDTH_ABSOLUTE_MIN, (vw - 16) / 2));
};
```

`resolveViewportMetrics` 里：

```ts
const widthScale = viewportWidth / DESIGN_WIDTH;
const panelWidthPx = resolvePanelWidthPx(viewportWidth, widthScale);
```

`uiScale` 计算保持 `Math.max(MIN_UI_SCALE, rawScale)`，不要改字号保底。

- [ ] **Step 4: Re-run tests**

```bash
bun test prod/cube/apps/ue5/app/src/application/bootstrap/viewport-metrics.test.ts
```

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add prod/cube/apps/ue5/app/src/application/bootstrap/viewport-metrics.ts \
  prod/cube/apps/ue5/app/src/application/bootstrap/viewport-metrics.test.ts
git commit -m "$(cat <<'EOF'
feat(ue5): decouple panel width scale from typography floor

Keep rem >= 1920 for readable type while letting sidebar width follow viewport width down to 280px.
EOF
)"
```

---

### Task 2: Publish panel width as rem on `:root`

**Files:**
- Modify: `prod/cube/apps/ue5/app/src/application/bootstrap/viewport-coordinator.ts`
- Modify: `prod/cube/apps/ue5/app/src/features/cards/base-panel-render/base-panel-render.module.less`
- Modify: `prod/cube/apps/ue5/app/src/visualization-core/hooks/use-teleport-theme-vars.ts`

- [ ] **Step 1: Add a payload unit test if one exists; otherwise extend `buildViewportCssPayload`**

`buildViewportCssPayload` 增加：

```ts
"--ue5-width-scale": String(metrics.widthScale),
"--ue5-panel-width": `${metrics.panelWidthPx / metrics.rootFontSize}rem`,
```

`signature` 必须包含 `panelWidthPx`，否则宽度变化不会写 DOM。

- [ ] **Step 2: Replace hardcoded 400px**

`base-panel-render.module.less` 的 `.left-panel` / `.right-panel`：

```less
--ue5-panel-width: 400 / 192rem; /* fallback only; runtime overrides on :root */

width: var(--ue5-panel-width);
```

删掉 `400px` 字面量。`use-teleport-theme-vars.ts` fallback 改为 `"400 / 192rem"` 或继续读 html 计算值；`TELEPORT_VIEWPORT_VAR_KEYS` 增加 `"--ue5-width-scale"`。

- [ ] **Step 3: Manual sanity**

1366 宽时 DevTools 中 `--ue5-panel-width` 应约 `1.48rem`（284/192），侧栏明显窄于 400px。1920 时约 `2.083rem`（400/192）。

- [ ] **Step 4: Commit**

```bash
git add prod/cube/apps/ue5/app/src/application/bootstrap/viewport-coordinator.ts \
  prod/cube/apps/ue5/app/src/features/cards/base-panel-render/base-panel-render.module.less \
  prod/cube/apps/ue5/app/src/visualization-core/hooks/use-teleport-theme-vars.ts
git commit -m "$(cat <<'EOF'
feat(ue5): apply sidebar width from rem token driven by widthScale
EOF
)"
```

---

### Task 3: Content-class card profiles

**Files:**
- Modify: `prod/cube/apps/ue5/app/src/features/cards/base-panel-render/card-layout-profile.ts`
- Modify: `prod/cube/apps/ue5/app/src/features/cards/base-panel-render/card-layout-profile.test.ts`

- [ ] **Step 1: Rewrite failing profile tests**

删除对 `minHeight` / `compactMinHeight` / `resolvePanelGridRows` 的断言。新断言：

```ts
test("unknown cards default to chart class", () => {
  expect(resolveCardLayoutProfile("unknown-card")).toMatchObject({
    contentClass: "chart",
    weight: 1.15,
    slotMax: 400,
    fillMode: "stretch",
  });
});

test("kpi cards stay lighter and shorter than composite cards", () => {
  const kpi = resolveCardLayoutProfile("people-flow-today-statistics");
  const composite = resolveCardLayoutProfile("security-analysis");
  expect(kpi.contentClass).toBe("kpi");
  expect(composite.contentClass).toBe("composite");
  expect(composite.slotMax).toBeGreaterThan(kpi.slotMax);
  expect(composite.weight).toBeGreaterThan(kpi.weight);
});

test("table cards keep rows fill mode", () => {
  expect(resolveCardLayoutProfile("security-alarm-record").contentClass).toBe("table");
  expect(resolveCardLayoutProfile("security-alarm-record").fillMode).toBe("rows");
});
```

- [ ] **Step 2: Run tests, expect FAIL**

```bash
bun test prod/cube/apps/ue5/app/src/features/cards/base-panel-render/card-layout-profile.test.ts
```

- [ ] **Step 3: Implement profile table**

```ts
export type CardContentClass = "kpi" | "chart" | "composite" | "table";

export interface CardLayoutProfile {
  contentClass: CardContentClass;
  weight: number;
  slotMax: number;
  fillMode: CardFillMode;
}

const CLASS_DEFAULTS: Record<CardContentClass, Omit<CardLayoutProfile, "contentClass">> = {
  kpi: { weight: 0.9, slotMax: 340, fillMode: "center" },
  chart: { weight: 1.15, slotMax: 400, fillMode: "stretch" },
  composite: { weight: 1.35, slotMax: 460, fillMode: "stretch" },
  table: { weight: 1.2, slotMax: 420, fillMode: "rows" },
};

const profile = (
  contentClass: CardContentClass,
  overrides: Partial<Omit<CardLayoutProfile, "contentClass">> = {},
): CardLayoutProfile => ({
  contentClass,
  ...CLASS_DEFAULTS[contentClass],
  ...overrides,
});
```

映射（沿用现有 code，只换档）：

- `kpi`：`ups-work-situation`、`people-flow-today-statistics`
- `table`：`security-alarm-record`、`alarm-status-and-list`、`command-dispatch-alarm-area-top5`、`fire-equipment-statistics`
- `composite`：`security-analysis`、`security-risk-source`、`security-market-overview`、`security-device-count`、`security-monitor-device-count`、`electrical-device`、`environmental-device`、`alarm-level`、`fire-device-distribution`、`security-alarm-count`、`fire-pipe-network`、`security-alarm-event-ratio`（`fillMode: "scroll"`）
- `chart`：其余已登记卡（趋势/监控等）

`security-analysis` 可 `overrides: { weight: 1.45 }` 保持比风险源更高。

删除 `resolvePanelGridRows`（改由像素行高驱动）。若仍有引用，先改引用再删。

- [ ] **Step 4: Re-run tests — PASS**

- [ ] **Step 5: Commit**

```bash
git commit -m "$(cat <<'EOF'
feat(ue5): classify card slots by static content class instead of compact min height
EOF
)"
```

---

### Task 4: Slot packing pure function

**Files:**
- Create: `prod/cube/apps/ue5/app/src/features/cards/base-panel-render/panel-slot-packing.ts`
- Create: `prod/cube/apps/ue5/app/src/features/cards/base-panel-render/panel-slot-packing.test.ts`

- [ ] **Step 1: Write failing tests**

```ts
import { describe, expect, test } from "bun:test";

import { resolvePanelSlotPacking, SLOT_MIN } from "./panel-slot-packing";

const chart = { weight: 1.15, slotMax: 400 };
const composite = { weight: 1.35, slotMax: 460 };
const kpi = { weight: 0.9, slotMax: 340 };

describe("resolvePanelSlotPacking", () => {
  test("1080p three composite/chart cards all stay visible", () => {
    const packing = resolvePanelSlotPacking({
      cardCount: 3,
      availableHeight: 940,
      uiScale: 1,
      profiles: [composite, chart, chart],
    });
    expect(packing.visibleCount).toBe(3);
    expect(packing.mode).toBe("pack");
    expect(packing.slotHeights.every((h) => h >= SLOT_MIN)).toBe(true);
    const total =
      packing.slotHeights.reduce((a, b) => a + b, 0) + packing.gap * 2 + packing.paddingTop;
    expect(total).toBeCloseTo(940, 0);
  });

  test("768p drops to two visible cards and scrolls the third", () => {
    const packing = resolvePanelSlotPacking({
      cardCount: 3,
      availableHeight: 628,
      uiScale: 1,
      profiles: [composite, chart, chart],
    });
    expect(packing.visibleCount).toBe(2);
    expect(packing.mode).toBe("scroll");
    expect(packing.slotHeights).toHaveLength(3);
    expect(packing.slotHeights[0]).toBeGreaterThanOrEqual(SLOT_MIN);
    expect(packing.slotHeights[2]).toBeGreaterThanOrEqual(SLOT_MIN);
  });

  test("two-card 1080p gives extra height to heavier content then remaining to gap", () => {
    const packing = resolvePanelSlotPacking({
      cardCount: 2,
      availableHeight: 940,
      uiScale: 1,
      profiles: [composite, kpi],
    });
    expect(packing.mode).toBe("pack");
    expect(packing.slotHeights[0]).toBeGreaterThan(packing.slotHeights[1]);
    expect(packing.slotHeights[0]).toBeLessThanOrEqual(460);
    expect(packing.slotHeights[1]).toBeLessThanOrEqual(340);
    expect(packing.gap).toBeGreaterThan(12);
    expect(packing.slotHeights[0] + packing.slotHeights[1] + packing.gap).toBeCloseTo(940, 0);
  });

  test("single card pins to the bottom with padding-top leftover", () => {
    const packing = resolvePanelSlotPacking({
      cardCount: 1,
      availableHeight: 940,
      uiScale: 1,
      profiles: [kpi],
    });
    expect(packing.slotHeights[0]).toBeLessThanOrEqual(340);
    expect(packing.paddingTop).toBeGreaterThan(0);
    expect(packing.paddingTop + packing.slotHeights[0]).toBeCloseTo(940, 0);
  });
});
```

- [ ] **Step 2: Run — FAIL**

```bash
bun test prod/cube/apps/ue5/app/src/features/cards/base-panel-render/panel-slot-packing.test.ts
```

- [ ] **Step 3: Implement `panel-slot-packing.ts`**

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

export const resolveVisibleCount = (
  availableHeight: number,
  cardCount: number,
  slotMin: number,
  gap: number,
): number => {
  const count = Math.max(0, Math.floor(cardCount));
  if (count === 0) {
    return 0;
  }
  for (let n = count; n >= 1; n--) {
    if (n * slotMin + gap * Math.max(0, n - 1) <= availableHeight) {
      return n;
    }
  }
  return 1;
};

const safeWeight = (weight: number): number =>
  Number.isFinite(weight) && weight > 0 ? weight : 1;

const safeMax = (slotMax: number, slotMin: number): number =>
  Math.max(slotMin, Number.isFinite(slotMax) && slotMax > 0 ? slotMax : slotMin);

export const distributeSlotHeights = (
  availableHeight: number,
  gap: number,
  profiles: Array<{ weight: number; slotMax: number }>,
  slotMin: number,
): { heights: number[]; gap: number; paddingTop: number } => {
  const n = profiles.length;
  if (n === 0) {
    return { heights: [], gap, paddingTop: 0 };
  }

  const heights = profiles.map(() => slotMin);
  let remaining = availableHeight - slotMin * n - gap * Math.max(0, n - 1);

  if (remaining <= 0) {
    return { heights, gap, paddingTop: 0 };
  }

  for (let guard = 0; guard < 8 && remaining > 0.5; guard++) {
    const growable = profiles
      .map((profile, i) => ({
        i,
        room: safeMax(profile.slotMax, slotMin) - heights[i],
        w: safeWeight(profile.weight),
      }))
      .filter((item) => item.room > 0.5);
    if (growable.length === 0) {
      break;
    }
    const weightSum = growable.reduce((sum, item) => sum + item.w, 0);
    let used = 0;
    for (const item of growable) {
      const take = Math.min(item.room, remaining * (item.w / weightSum));
      heights[item.i] += take;
      used += take;
    }
    if (used < 0.5) {
      break;
    }
    remaining -= used;
  }

  if (n === 1) {
    return { heights, gap, paddingTop: Math.max(0, remaining) };
  }
  return { heights, gap: gap + remaining / (n - 1), paddingTop: 0 };
};

export const resolvePanelSlotPacking = (options: {
  cardCount: number;
  availableHeight: number;
  uiScale: number;
  profiles: Array<{ weight: number; slotMax: number }>;
}): PanelSlotPacking => {
  const scale = Number.isFinite(options.uiScale) && options.uiScale > 0 ? options.uiScale : 1;
  const slotMin = SLOT_MIN * scale;
  const gap = SLOT_GAP * scale;
  const count = Math.max(0, Math.floor(options.cardCount));
  if (count === 0) {
    return { mode: "empty", cardCount: 0, visibleCount: 0, slotHeights: [], gap, paddingTop: 0 };
  }

  const availableHeight = Math.max(0, options.availableHeight);
  const visibleCount = resolveVisibleCount(availableHeight, count, slotMin, gap);
  const scaled = options.profiles.map((profile) => ({
    weight: profile.weight,
    slotMax: safeMax(profile.slotMax, SLOT_MIN) * scale,
  }));

  const packed = distributeSlotHeights(availableHeight, gap, scaled.slice(0, visibleCount), slotMin);
  const meanVisible =
    packed.heights.reduce((sum, height) => sum + height, 0) / Math.max(1, packed.heights.length);
  const meanWeight =
    scaled.slice(0, visibleCount).reduce((sum, profile) => sum + safeWeight(profile.weight), 0) /
    Math.max(1, visibleCount);

  const slotHeights = scaled.map((profile, index) => {
    if (index < visibleCount) {
      return packed.heights[index];
    }
    const target = meanVisible * (safeWeight(profile.weight) / meanWeight);
    return Math.min(profile.slotMax, Math.max(slotMin, target));
  });

  const contentHeight =
    slotHeights.reduce((sum, height) => sum + height, 0) +
    packed.gap * Math.max(0, count - 1) +
    packed.paddingTop;

  return {
    mode: contentHeight > availableHeight + 1 ? "scroll" : "pack",
    cardCount: count,
    visibleCount,
    slotHeights,
    gap: packed.gap,
    paddingTop: packed.paddingTop,
  };
};
```

注意：离屏卡高度用可见槽均高 × 相对权重，滚动时每张卡仍完整，不会只露出一条标题。

- [ ] **Step 4: Re-run tests — PASS**

- [ ] **Step 5: Commit**

```bash
git commit -m "$(cat <<'EOF'
feat(ue5): pack sidebar cards by min slot height instead of always filling three
EOF
)"
```

---

### Task 5: Replace old layout policy + wire BasePanelRender

**Files:**
- Modify: `prod/cube/apps/ue5/app/src/features/cards/base-panel-render/panel-layout-policy.ts`
- Modify: `prod/cube/apps/ue5/app/src/features/cards/base-panel-render/panel-layout-policy.test.ts`
- Modify: `prod/cube/apps/ue5/app/src/features/cards/base-panel-render/base-panel-render.tsx`
- Modify: `prod/cube/apps/ue5/app/src/features/cards/base-panel-render/base-panel-render.module.less`

- [ ] **Step 1: Make old policy tests fail by rewriting them to packing**

`panel-layout-policy.ts` 改为：

```ts
export { resolvePanelSlotPacking as resolvePanelLayout } from "./panel-slot-packing";
export type { PanelSlotPacking as PanelLayoutPolicy } from "./panel-slot-packing";
```

删除 `resolvePanelLayoutWithOverflow`。把旧 test 文件改成 re-export 烟雾测试，或删除并让 `panel-slot-packing.test.ts` 成为唯一来源。

- [ ] **Step 2: Wire render**

`base-panel-render.tsx` 中：

- `viewportScale` 继续来自 `uiScale`（字号）
- 增加 `panelWidth` 不必在此计算（已在 `:root`）
- 用 `resolvePanelSlotPacking` 替换 `resolvePanelLayout` + `resolvePanelLayoutWithOverflow`
- `availableHeight` 仍是 `viewportHeight - panelTop - panelBottom`（顶栏/底栏乘 `uiScale`）
- `profiles: cardLayoutProfiles.value.map((p) => ({ weight: p.weight, slotMax: p.slotMax }))`
- 删掉 `shouldFillTwoPeopleFlowCards` 对 `fill-weighted` 的特殊 CSS 模式；人流两卡走同一装箱（kpi + 另一张的档位）
- 模板 class：`panel-pack-box`；`data-panel-layout={packing.mode}`
- style：

```ts
{
  "--panel-slot-rows": packing.slotHeights.map((h) => `${h}px`).join(" "),
  "--panel-slot-gap": `${packing.gap}px`,
  "--panel-pack-padding-top": `${packing.paddingTop}px`,
}
```

`shouldEnablePanelScroll`：`packing.mode === "scroll"`。

每个 `PanelCardSlotHost` 不再传 `compactMinHeight`；可改传 `slotMax` 仅作 CSS 兜底，或删除该 prop。

- [ ] **Step 3: CSS pack box**

替换 `.panel-fill-box` / `.panel-overflow-box` / `.panel-weighted-box` / `.panel-scroll-box` 为：

```less
.panel-pack-box {
  display: grid;
  grid-template-rows: var(--panel-slot-rows);
  gap: var(--panel-slot-gap, 12px);
  align-content: start;
  box-sizing: border-box;
  height: var(--panel-content-height);
  max-height: var(--panel-content-height);
  min-height: 0;
  padding-top: var(--panel-pack-padding-top, 0);
  overflow-x: hidden;
  overflow-y: hidden;

  > .panel-card-slot {
    min-width: 0;
    min-height: 0;
    overflow: hidden; /* 卡内裁切，不是把第三张卡切掉 */
  }
}

.panel-pack-box[data-panel-layout="scroll"] {
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: var(--visual-scrollbar-thumb, rgba(70, 166, 255, 0.35)) transparent;
}
```

禁止再用 `overflow: hidden` 裁侧栏里的下一张卡。`.panel-card-slot` 增加图表下限：

```less
:global(.gh-line-chart),
:global(.chart.gh-line-chart),
:global(.trend-chart-panel),
:global(.v2-chart-panel) {
  min-height: 140px;
}
```

- [ ] **Step 4: Run packing + profile tests**

```bash
bun test prod/cube/apps/ue5/app/src/features/cards/base-panel-render/panel-slot-packing.test.ts \
  prod/cube/apps/ue5/app/src/features/cards/base-panel-render/card-layout-profile.test.ts \
  prod/cube/apps/ue5/app/src/features/cards/base-panel-render/panel-layout-policy.test.ts
```

Expected: PASS。修任何仍 import `compactMinHeight` / `resolvePanelGridRows` / `fill-weighted` 的编译错误。

- [ ] **Step 5: Commit**

```bash
git commit -m "$(cat <<'EOF'
feat(ue5): drive sidebar layout from slot packing pixels instead of equal fill
EOF
)"
```

---

### Task 6: Density only tightens spacing, never squashes charts

**Files:**
- Modify: `prod/cube/apps/ue5/app/src/features/cards/base-panel-render/card-slot-density.ts`
- Modify: `prod/cube/apps/ue5/app/src/features/cards/base-panel-render/card-slot-density.test.ts`
- Modify: `prod/cube/apps/ue5/app/src/features/cards/base-panel-render/base-panel-render.module.less`
- Modify: `prod/cube/apps/ue5/app/src/features/cards/base-panel-render/base-panel-render.tsx`

- [ ] **Step 1: Change density enum tests**

```ts
export type CardSlotDensity = "comfortable" | "compact";

test.each([
  [260, "comfortable"],
  [220, "comfortable"],
  [219, "compact"],
  [0, "compact"],
] as const)("height=%s -> %s", (height, expected) => {
  expect(resolveCardSlotDensity(height)).toBe(expected);
});
```

1080p 三槽内容高约 257 → `comfortable`（设计态）。`compact` 只在略低于设计内容高时收 padding。

删除 `rearrange` / `scroll` 档位，以及 `resolveCompressedLayoutMinHeight`（装箱已用 `SLOT_MIN`）。

`estimateInitialCardSlotDensity` 第三个参数改为 **可见张数 N**，不是配置张数。

- [ ] **Step 2: Implement + strip CSS**

`resolveCardSlotDensity`：`>= 220` → comfortable，否则 compact。

Less 中删除 `.panel-card-slot[data-card-density="rearrange"]` 和 `"scroll"` 选择器（卡内 `fillMode=scroll` 仍保留）。compact 只改 token，不要再把 `--card-pie-size` 收到 88px。compact 环图下限保持 ≥ 100px。

- [ ] **Step 3: Tests PASS**

```bash
bun test prod/cube/apps/ue5/app/src/features/cards/base-panel-render/card-slot-density.test.ts
```

- [ ] **Step 4: Commit**

```bash
git commit -m "$(cat <<'EOF'
fix(ue5): stop using rearrange density to squash charts below the design slot
EOF
)"
```

---

### Task 7: Update Agent standard and skill so the old rule cannot come back

**Files:**
- Modify: `.agents/standards/ue5-card-layout-density-standard.md`
- Modify: `.agents/standards/INDEX.md`
- Modify: `.agents/skills/ue5-visual-card-v2/SKILL.md`

- [ ] **Step 1: Rewrite standard Goals + Viewport/Panel layers**

把下列旧句全部替换掉：

- 「三卡侧栏优先保持 3 张卡同时可见」
- 「不要把整个侧栏默认改成滚动」
- 「不足时通过 density 压缩」

改为：

1. 1080p 三张是设计态；槽高不得低于 280px，更矮窗口减可见张数。
2. 侧栏滚动是 N 放不下时的正规手段。
3. 高度按静态内容档位分配；余量加间距，不均分成细长空卡。
4. 面板宽度走 `--ue5-panel-width` rem（widthScale），下限 280px；字号 `MIN_UI_SCALE=1`。
5. `comfortable/compact` 只调间距。禁止 `rearrange` 压主图。

Density Tiers 改为内容区：`comfortable >= 220`，`compact < 220`。删除 rearrange/scroll 档位表。

INDEX 描述改为「侧栏槽位装箱、内容档位、面板宽度与字号拆分」。

Skill 路由「笔记本字太小」改为：「字号不低于 1920；高度用 slot packing 减 N；宽度用 widthScale rem。禁止 fill+hidden 裁卡。」

- [ ] **Step 2: `rg` 旧口径**

```bash
rg "三卡优先|不要把整个侧栏默认改成滚动|rearrange" \
  .agents/standards/ue5-card-layout-density-standard.md \
  .agents/skills/ue5-visual-card-v2/SKILL.md \
  .agents/standards/INDEX.md
```

Expected: 无「必须三卡同时可见 / 禁止侧栏滚动」残留。`rearrange` 仅作为「已删除」说明出现亦可。

- [ ] **Step 3: Commit**

```bash
git commit -m "$(cat <<'EOF'
docs(ue5): replace three-card compression rule with slot packing standard
EOF
)"
```

---

### Task 8: End-to-end verification

**Files:** none new; run tests and visual checks.

- [ ] **Step 1: Unit tests**

```bash
bun test \
  prod/cube/apps/ue5/app/src/application/bootstrap/viewport-metrics.test.ts \
  prod/cube/apps/ue5/app/src/features/cards/base-panel-render/panel-slot-packing.test.ts \
  prod/cube/apps/ue5/app/src/features/cards/base-panel-render/card-layout-profile.test.ts \
  prod/cube/apps/ue5/app/src/features/cards/base-panel-render/card-slot-density.test.ts
```

Expected: all PASS.

- [ ] **Step 2: Visual matrix（安全管理左右栏，截图那套卡）**

| 视口 | 期望 |
|---|---|
| 1920×1080 | 右 3 张完整，柱状图可读；左 2 张内容多的更高、间距吃余量；底边齐平 |
| 1366×768 | 右可见 2 张，第 3 张整卡可滚；左 2 张铺满；面板宽约 280～284px；字号仍约 12px |
| 1440×900 | N 由装箱决定（通常 2）；无截半张卡 |
| 2560×1080 带鱼 | 面板宽封顶 480；N 按 1080 高仍为 3 |
| 1920×540 矮条 | N=1，其余滚动 |
| 900×800 窄屏 | 两栏 ≥160px 且尽量保中间；不 NaN |

失败判据（出现即未完成）：第三张只露标题、柱状图高度 < 140px、左栏提前结束留黑洞、笔记本字 < 11px、面板仍 400px 占掉中间。

---

## Self-review

1. **Spec coverage:** 1080p 三张 → Task 4 测试；减 N 滚动 → Task 4/5；内容档位高低 + 余量间距 → Task 3/4；宽度 rem 280 → Task 1/2；异形屏 → Task 1 窄屏/超宽测试 + Task 8；规范防回潮 → Task 7。
2. **Placeholders:** 无 TBD；packing / width 函数已写全。
3. **Types:** `CardLayoutProfile.slotMax` 贯穿 Task 3–5；旧 `compactMinHeight` 删除后不得残留。
4. **People-flow exception:** 不再保留 `fill-weighted` CSS，避免两条布局真相。
