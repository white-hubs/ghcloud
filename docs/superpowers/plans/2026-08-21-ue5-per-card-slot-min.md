# UE5 Per-Card SlotMin Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 侧栏按**每张卡自己的 `slotMin`** 装箱，让市场总览等长内容卡拿到足够高度（视频+介绍可见），指标+图表卡不再把主图压成一条缝。

**Architecture:** 在现有 `panel-slot-packing` 上把全局 `SLOT_MIN=280` 改成档案位 `slotMin`。可见张数 N 由「前 n 张 `slotMin` 之和」决定，而不是 `n × 280`。高度仍从各自 `slotMin` 涨到 `slotMax`。卡内给介绍区/主图设不可压穿的地板，禁止用 `min-height:0` 把视频和图吃掉。

**Tech Stack:** Vue 3 TSX、Less、Bun test

**Supersedes:** `docs/superpowers/plans/2026-08-21-ue5-panel-slot-packing.md` 中「全局 slotMin=280、1080p 必须 3 张、只靠抬 slotMax」的口径。抬 slotMax 无法修好市场总览：两张卡仍均分约 464px，视频区被 flex 收缩成 0。

---

## Why the current packing still clips

1080p 侧栏可用高约 940px。两张卡 + 12px 间距时，每张大约 464px（含标题）。

| 卡片 | 真实结构 | 需要高度 | 现在拿到 | 结果 |
|---|---|---|---|---|
| 市场总览 | 仪表盘 + 2×2 指标 + **视频 + 园区介绍** | ≥ 620px（含标题） | ~464px | 介绍区 `flex:1; min-height:0`，视频整块消失 |
| 报警事件占比 | 5 个指标（会折成 2 行）+ 环图/列表 | ≥ 400px | 若槽更矮或指标抢 flex | 主图被压成一条缝 |
| 报警状态和列表 | 4 个指标 + 表体 | ≥ 400px | 表体 `flex:1; min-height:0` | 列表被压成一条缝 |

只抬 `slotMax`（460→640）解决的是「余量进间距」；**两张卡都没顶到上限时仍均分**。市场总览和设备统计都是 `composite`，权重接近，所以总览永远分不到整栏。

```
当前：N = max n 使得 n*280 + (n-1)*12 <= H
市场总览 slotMin 被当成 280 → 两张总能放下 → 均分 464
需要：N = max n 使得 sum(slotMin[0..n)) + (n-1)*12 <= H
市场总览 slotMin=620，设备=320 → 620+320+12=952 > 940 → N=1，侧栏滚出第二张
或 620+280+12=912 <= 940 → N=2，总览 620+、设备保持 280 地板
```

本方案选后者作为 1080p 默认：总览不低于 620，同伴卡不低于自己的 `slotMin`，余量按权重给长内容卡。只有 `sum(slotMin)+gaps > H` 时才减 N、整卡滚动。

---

## Locked decisions

| 决策 | 口径 |
|---|---|
| 仍不测 DOM | 高度只看静态档案，不 `ResizeObserver` 量内容 |
| 每卡 `slotMin` | 档案位默认 + 单卡可覆盖。决定 N，也是分配起点 |
| 1080p 三张 | **不再无条件成立**。侧栏里有 `media` 长卡时，允许 1080p 只完整露出 1～2 张，其余整卡滚动 |
| 短卡面板 | 三张都是 chart/composite 常规档时，1080p 仍 N=3（`3×320+24=984` 略超 940 → 实际 N=2 **或** 把常规 `slotMin` 留在 280 以免误伤） |
| 常规卡 `slotMin` | **保持 280**，避免所有面板从 3 张掉到 2 张。只给长内容卡抬 `slotMin` |
| 长内容卡 | 新档 `media`：weight 1.8，slotMin **620**，slotMax **900**。目前仅 `security-market-overview` |
| 指标+主图卡 | 覆盖 `slotMin=400`：`security-alarm-event-ratio`、`alarm-status-and-list`、`alarm-status-and-trend`、`security-analysis` |
| 卡内地板 | 介绍/视频 `min-height: 180px`；主图 `min-height: 140px`；指标区 `flex: 0 0 auto`，禁止和主图抢剩余高度 |
| 减 N | 前 n 张 `slotMin` 之和放不下才减；滚动单元仍是整张卡 |
| 余量 | 先涨到各自 `slotMax`，再加间距；1 张时 `padding-top` |

### 内容档位（更新）

| `contentClass` | weight | slotMin | slotMax | fillMode | 用途 |
|---|---|---|---|---|---|
| `kpi` | 0.9 | 280 | 420 | `center` | 稀疏指标 |
| `chart` | 1.15 | 280 | 560 | `stretch` | 单图 |
| `composite` | 1.35 | 280 | 640 | `stretch` | 环图+图例、双块 |
| `table` | 1.2 | 280 | 560 | `rows` | 指标+表 |
| `media` | 1.8 | 620 | 900 | `stretch` | 仪表盘+指标+视频/介绍 |

单卡覆盖（必须写进 `CARD_LAYOUT_PROFILES`）：

```ts
"security-market-overview": profile("media"),
"security-alarm-event-ratio": profile("composite", { slotMin: 400, fillMode: "scroll" }),
"alarm-status-and-list": profile("table", { slotMin: 400 }),
"alarm-status-and-trend": profile("composite", { slotMin: 400 }),
"security-analysis": profile("composite", { weight: 1.45, slotMin: 400 }),
```

验算（H=940）：

- 总览 + 设备：`620+280+12=912 ≤ 940` → N=2，余量 28 给总览（权重更高）→ 总览 ≈ 648，设备 = 280。视频区 ≈ 648−48−112−120−20 ≈ **348px**，可同时看到视频和介绍。
- 电气左 占比+趋势（400+280+12=692）→ N=2，余量给两张，主图不再是一条缝。
- 三张常规 280：`3×280+24=864 ≤ 940` → N=3，1080p 短卡面板行为不变。
- 768p 总览+设备：`620+280+12=912 > 628` → N=1，总览吃满 628，滚出设备统计。

---

## File structure

**Modify**

- `prod/cube/apps/ue5/app/src/features/cards/base-panel-render/card-layout-profile.ts`
- `prod/cube/apps/ue5/app/src/features/cards/base-panel-render/card-layout-profile.test.ts`
- `prod/cube/apps/ue5/app/src/features/cards/base-panel-render/panel-slot-packing.ts`
- `prod/cube/apps/ue5/app/src/features/cards/base-panel-render/panel-slot-packing.test.ts`
- `prod/cube/apps/ue5/app/src/features/cards/base-panel-render/base-panel-render.tsx` — `profiles` 传入 `slotMin`
- `prod/cube/apps/ue5/app/src/features/cards/security-overview/cards/security-market-overview.module.less`
- `prod/cube/apps/ue5/app/src/features/cards/security-monitoring-safty/cards/security-alarm-event-ratio.module.less`
- `prod/cube/apps/ue5/app/src/features/cards/security-overview/cards/alarm-status-and-list.module.less`（若表体没有 `min-height`）
- `.agents/standards/ue5-card-layout-density-standard.md`

**Do not**

- 不测 DOM
- 不把市场总览拆成两张配置卡（产品未要求）
- 不把所有 composite 的 slotMin 抬到 400（会让 1080p 普遍从 3 张掉到 2 张）

---

### Task 1: Profile 增加 slotMin 与 media 档

**Files:**
- Modify: `prod/cube/apps/ue5/app/src/features/cards/base-panel-render/card-layout-profile.ts`
- Test: `prod/cube/apps/ue5/app/src/features/cards/base-panel-render/card-layout-profile.test.ts`

- [ ] **Step 1: Write the failing tests**

把 `CardContentClass` 期望扩成含 `media`。在 `card-layout-profile.test.ts` 追加：

```ts
test("market overview is a media card with a tall slot floor", () => {
  expect(resolveCardLayoutProfile("security-market-overview")).toMatchObject({
    contentClass: "media",
    slotMin: 620,
    slotMax: 900,
    weight: 1.8,
  });
});

test("kpi+chart composites keep a 400px floor so the chart is not crushed", () => {
  expect(resolveCardLayoutProfile("security-alarm-event-ratio").slotMin).toBe(400);
  expect(resolveCardLayoutProfile("alarm-status-and-list").slotMin).toBe(400);
  expect(resolveCardLayoutProfile("alarm-status-and-trend").slotMin).toBe(400);
  expect(resolveCardLayoutProfile("security-analysis").slotMin).toBe(400);
});

test("unknown cards default slotMin to 280", () => {
  expect(resolveCardLayoutProfile("unknown-card").slotMin).toBe(280);
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `bun test prod/cube/apps/ue5/app/src/features/cards/base-panel-render/card-layout-profile.test.ts`

Expected: FAIL — `slotMin` undefined / market overview still `composite`.

- [ ] **Step 3: Implement profiles**

Replace `CardContentClass` and defaults:

```ts
export type CardContentClass = "kpi" | "chart" | "composite" | "table" | "media";

export interface CardLayoutProfile {
  contentClass: CardContentClass;
  weight: number;
  slotMin: number;
  slotMax: number;
  fillMode: CardFillMode;
}

const CLASS_DEFAULTS: Record<CardContentClass, Omit<CardLayoutProfile, "contentClass">> = {
  kpi: { weight: 0.9, slotMin: 280, slotMax: 420, fillMode: "center" },
  chart: { weight: 1.15, slotMin: 280, slotMax: 560, fillMode: "stretch" },
  composite: { weight: 1.35, slotMin: 280, slotMax: 640, fillMode: "stretch" },
  table: { weight: 1.2, slotMin: 280, slotMax: 560, fillMode: "rows" },
  media: { weight: 1.8, slotMin: 620, slotMax: 900, fillMode: "stretch" },
};
```

`profile()` 继续 spread defaults + overrides。

把 `"security-market-overview": profile("composite")` 改成 `profile("media")`。

给四张指标+主图卡加 `{ slotMin: 400 }`（占比保留 `fillMode: "scroll"`，分析保留 `weight: 1.45`）。

- [ ] **Step 4: Run tests to verify they pass**

Run: `bun test prod/cube/apps/ue5/app/src/features/cards/base-panel-render/card-layout-profile.test.ts`

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add prod/cube/apps/ue5/app/src/features/cards/base-panel-render/card-layout-profile.ts \
  prod/cube/apps/ue5/app/src/features/cards/base-panel-render/card-layout-profile.test.ts
git commit -m "$(cat <<'EOF'
feat(ue5): add media slotMin so tall cards reserve height

EOF
)"
```

Only commit if the user asked.

---

### Task 2: Packing uses per-card slotMin for N and heights

**Files:**
- Modify: `prod/cube/apps/ue5/app/src/features/cards/base-panel-render/panel-slot-packing.ts`
- Test: `prod/cube/apps/ue5/app/src/features/cards/base-panel-render/panel-slot-packing.test.ts`
- Modify: `prod/cube/apps/ue5/app/src/features/cards/base-panel-render/base-panel-render.tsx`

- [ ] **Step 1: Write the failing tests**

把测试里的 profile 改成带 `slotMin`。追加：

```ts
const media = { weight: 1.8, slotMin: 620, slotMax: 900 };
const composite280 = { weight: 1.35, slotMin: 280, slotMax: 640 };
const chart400 = { weight: 1.15, slotMin: 400, slotMax: 560 };

test("1080p market overview plus device keeps both visible and overview above 620", () => {
  const packing = resolvePanelSlotPacking({
    cardCount: 2,
    availableHeight: 940,
    uiScale: 1,
    profiles: [media, composite280],
  });
  expect(packing.visibleCount).toBe(2);
  expect(packing.mode).toBe("pack");
  expect(packing.slotHeights[0]).toBeGreaterThanOrEqual(620);
  expect(packing.slotHeights[1]).toBeGreaterThanOrEqual(280);
  expect(packing.slotHeights[0]).toBeGreaterThan(packing.slotHeights[1]);
  expect(packing.gap).toBeCloseTo(12, 0);
});

test("768p market overview drops the second card instead of crushing video", () => {
  const packing = resolvePanelSlotPacking({
    cardCount: 2,
    availableHeight: 628,
    uiScale: 1,
    profiles: [media, composite280],
  });
  expect(packing.visibleCount).toBe(1);
  expect(packing.mode).toBe("scroll");
  expect(packing.slotHeights[0]).toBeGreaterThanOrEqual(620);
});

test("kpi+chart pair on 1080p keeps a 400px floor", () => {
  const packing = resolvePanelSlotPacking({
    cardCount: 2,
    availableHeight: 940,
    uiScale: 1,
    profiles: [chart400, composite280],
  });
  expect(packing.visibleCount).toBe(2);
  expect(packing.slotHeights[0]).toBeGreaterThanOrEqual(400);
});

test("three regular 280px cards still fit 1080p", () => {
  const packing = resolvePanelSlotPacking({
    cardCount: 3,
    availableHeight: 940,
    uiScale: 1,
    profiles: [composite280, composite280, composite280],
  });
  expect(packing.visibleCount).toBe(3);
});
```

旧测试里的 `chart` / `composite` / `kpi` 常量必须补上 `slotMin: 280`（kpi 的 slotMax 仍 420）。

- [ ] **Step 2: Run tests to verify they fail**

Run: `bun test prod/cube/apps/ue5/app/src/features/cards/base-panel-render/panel-slot-packing.test.ts`

Expected: FAIL — 总览+设备在 768p 仍 visibleCount=2；1080p 两张高度接近均分，总览 < 620。

- [ ] **Step 3: Implement packing**

`resolveVisibleCount` 改为吃每张卡的 `slotMin`：

```ts
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
```

`distributeSlotHeights` 的 `profiles` 增加 `slotMin`，起点改为每张自己的 min，而不是全局 `slotMin`：

```ts
const heights = profiles.map((profile) => Math.max(slotMinFloor, profile.slotMin));
```

其中 `slotMinFloor` 可删掉；直接用 `profile.slotMin`。`room = slotMax - heights[i]`。

`resolvePanelSlotPacking` 的 `profiles` 类型改为 `{ weight, slotMin, slotMax }`：

```ts
const scale = ...
const gap = SLOT_GAP * scale;
const scaled = options.profiles.map((profile) => {
  const slotMin = Math.max(SLOT_MIN, profile.slotMin || SLOT_MIN) * scale;
  return {
    weight: profile.weight,
    slotMin,
    slotMax: Math.max(slotMin, (profile.slotMax || SLOT_MIN) * scale),
  };
});
const visibleCount = resolveVisibleCount(
  availableHeight,
  scaled.map((p) => p.slotMin),
  gap,
);
const packed = distributeSlotHeights(availableHeight, gap, scaled.slice(0, visibleCount));
```

隐藏卡（index >= visibleCount）高度仍用可见槽均高 × 相对权重，夹在自己的 `[slotMin, slotMax]`。

保留 `export const SLOT_MIN = 280` 作为缺省地板。

- [ ] **Step 4: Wire BasePanelRender**

`base-panel-render.tsx` 里传入：

```ts
profiles: cardLayoutProfiles.value.map((profile) => ({
  weight: profile.weight,
  slotMin: profile.slotMin,
  slotMax: profile.slotMax,
})),
```

若 `panel-layout-policy.ts` re-export 了 packing 类型，一并改调用方测试常量。

- [ ] **Step 5: Run tests**

Run: `bun test prod/cube/apps/ue5/app/src/features/cards/base-panel-render/panel-slot-packing.test.ts prod/cube/apps/ue5/app/src/features/cards/base-panel-render/panel-layout-policy.test.ts`

Expected: PASS

- [ ] **Step 6: Commit** if the user asked.

---

### Task 3: Market overview intro must not collapse

**Files:**
- Modify: `prod/cube/apps/ue5/app/src/features/cards/security-overview/cards/security-market-overview.module.less`

- [ ] **Step 1: Stop the intro from flex-collapsing**

当前：

```less
.safe-market-intro {
  flex: 1 1 0;
  min-height: 0;
}
.safe-market-risk {
  flex: 0 1 auto;
}
```

改为：指标和仪表盘不收缩，介绍区有 180px 地板（装箱已保证总高 ≥ 620，地板撑得住）：

```less
.safe-market-risk {
  flex: 0 0 auto;
  min-height: 112px;
}

.safe-market-metrics {
  flex: 0 0 auto;
}

.safe-market-intro {
  display: grid;
  flex: 1 1 auto;
  min-height: 180px;
}
```

`.safe-market-body` 保持 `overflow: hidden` 即可（外壳不再裁介绍）；不要把介绍再写成 `min-height: 0`。

- [ ] **Step 2: Visual check**

1080p 总览：仪表盘、四指标、视频、介绍四段同时可见。笔记本：总览几乎占满侧栏，设备统计整卡滚出。

- [ ] **Step 3: Commit** if the user asked.

---

### Task 4: KPI+chart cards keep a 140px chart floor

**Files:**
- Modify: `prod/cube/apps/ue5/app/src/features/cards/security-monitoring-safty/cards/security-alarm-event-ratio.module.less`
- Modify: `prod/cube/apps/ue5/app/src/features/cards/security-overview/cards/alarm-status-and-list.module.less`

- [ ] **Step 1: 报警事件占比**

`.statsRow` 必须 `flex: 0 0 auto`，禁止 `flex: 1`。主图容器：

```less
.chartBlock {
  flex: 1 1 auto;
  min-height: 140px;
}
```

（用文件里现有主图 class 名，不要新造一层无用包装。）5 个 `statCard` 已 `flex: 1 1 calc(33.333% - 4px)`，会折成两行，这是预期；用 `slotMin: 400` 消化第二行，而不是把图压没。

- [ ] **Step 2: 报警状态和列表**

指标区 `flex: 0 0 auto`。`RollTable` 外包 `flex: 1 1 auto; min-height: 108px`（至少 3 行 × 36）。不要让表体 `min-height: 0` 收到 0。

- [ ] **Step 3: Visual check**

电气安全左栏：占比卡能看到环图/列表，不是一条缝。右栏列表至少 3 行完整。

- [ ] **Step 4: Commit** if the user asked.

---

### Task 5: Standard + verification

**Files:**
- Modify: `.agents/standards/ue5-card-layout-density-standard.md`

- [ ] **Step 1: Update the standard**

Goals 改为：

1. 常规短卡 1080p 仍可 3 张（`slotMin=280`）。
2. `media` 或 `slotMin≥400` 的卡按自身地板装箱；放不下就减 N，整卡滚动。
3. 介绍/视频不得 `min-height: 0` 收缩消失。
4. 主图 `min-height: 140px`，指标区不与主图抢 flex 增长。

Composite Cards 里「仪表盘 + 多指标 + 介绍」改成：介绍区 `flex: 1 1 auto; min-height: 180px`，并注册为 `media`。

Verification 增加：总览 1080p 必须同时看到仪表盘、四指标、视频、介绍。

- [ ] **Step 2: Run packing + profile tests together**

Run: `bun test prod/cube/apps/ue5/app/src/features/cards/base-panel-render/panel-slot-packing.test.ts prod/cube/apps/ue5/app/src/features/cards/base-panel-render/card-layout-profile.test.ts`

Expected: all pass.

---

## Spec coverage

- 市场总览高度不够 / 视频介绍不可见 → Task 1 media + Task 2 N/高度 + Task 3 CSS 地板
- 电气安全图表一条缝 → Task 1 slotMin 400 + Task 4
- 1080p 其它短卡面板仍 3 张 → Task 2「three regular 280px cards」测试
- 不测 DOM、整卡滚动 → Locked decisions + Task 2 768p 测试

## Placeholder scan

无 TBD / 无「类似 Task N」。
