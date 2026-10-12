# UE5 Content-Sized Panel Cards Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 侧栏卡片按内容真实高度展示：超长卡（市场总览）随内容长高、文案不被裁；普通卡（安全分析）停在设计高度，不把折线拉成长条。余量留在侧栏底部空白，不再灌进卡片。

**Architecture:** 装箱只负责「每张卡的最低高度」和「放不下就整栏滚动」。网格行改为 `minmax(slotMin, max-content)`，不再把剩余像素分配进 `slotHeights`。卡内 `height: auto`，图表用固定主图高度而不是 `flex:1` 吃满槽位。

**Tech Stack:** Vue 3 TSX、Less、Bun test

**Supersedes:** `docs/superpowers/plans/2026-08-21-ue5-per-card-slot-min.md` 里「余量按权重涨到 slotMax」以及「1 张卡 padding-top 贴底」。那套规则会把安全分析拉满侧栏，同时市场总览仍在 `overflow:hidden` 里裁介绍。

---

## Why the screenshot is wrong

当前链路：

1. `resolvePanelSlotPacking` 从 `slotMin` 开始，把侧栏剩余高度按权重涨到 `slotMax`。
2. `BasePanelRender` 把结果写成 `--panel-slot-rows: 900px 280px` 这种**固定行高**。
3. `.panel-pack-box { height: var(--panel-content-height) }` 让网格铺满侧栏。
4. `fillMode=stretch` + 子树 `height: 100%` 让折线图吃满槽位。
5. 市场总览 `.safe-market-body { height: 100%; overflow: hidden }`，介绍区即使有 `min-height: 180px`，长文案仍被裁。

截图对应关系：

| 卡片 | 用户期望 | 现在 |
|---|---|---|
| 市场总览（超长） | 跟内容一样高，介绍全文可见，超出则侧栏滚动 | 槽位被拉到接近整栏，介绍仍被 `overflow:hidden` 切掉 |
| 安全分析（普通） | 指标 + 正常比例折线，下面可以留空 | 作为 stretch 卡吃掉余量，折线被纵向拉长 |

「抬 slotMin / 涨 slotMax」解决的是均分过矮，**不能**表达「不要拉长」。余量进卡片 = 普通卡被拉长；固定行高 + overflow hidden = 超长卡仍裁切。

---

## Locked decisions

| 决策 | 口径 |
|---|---|
| 卡片高度 | **内容决定**。网格行 `minmax(<slotMin>px, max-content)`，禁止把剩余像素写成固定 `px` 行高 |
| 余量 | 留在侧栏底部（`align-content: start`）。**不再**涨卡片、**不再**用大间距撑满、**不再** 1 张卡 `padding-top` 贴底 |
| 左右底边 | **允许不齐平**。贴底让位给「不要拉长普通卡」 |
| 超长卡 `media` | `slotMin` 仍是 620 地板；**取消用 slotMax 封顶展示**。介绍区随文案增高；侧栏 `overflow-y: auto` |
| 普通卡 | 高度停在内容（约等于各自 `slotMin`～设计主图）。`security-analysis` 保持 `slotMin: 400`，不要涨到 640/900 |
| 主图 | 折线/柱 `min-height: 140px`，**`flex-grow: 0`**，给一个设计高度（建议 `height: 180px` 或 `min-height: 180px; max-height: 220px`），禁止 `flex: 1` 吃满侧栏 |
| 装箱 N | 仍用前 n 张 `slotMin` 之和判断会不会一屏放不下；真正溢出由 `max-content` + 侧栏滚动消化 |
| 不测 DOM | 仍然不 `ResizeObserver` 量内容；真实高度交给 CSS `max-content` |
| Legacy | 仍不走装箱 |

`slotMax` 保留在 profile 里仅作文档/将来上限，**本轮 packing 不再用它分配高度**。

---

## File structure

**Modify**

- `prod/cube/apps/ue5/app/src/features/cards/base-panel-render/panel-slot-packing.ts`
- `prod/cube/apps/ue5/app/src/features/cards/base-panel-render/panel-slot-packing.test.ts`
- `prod/cube/apps/ue5/app/src/features/cards/base-panel-render/base-panel-render.tsx`
- `prod/cube/apps/ue5/app/src/features/cards/base-panel-render/base-panel-render.module.less`
- `prod/cube/apps/ue5/app/src/features/cards/security-overview/cards/security-market-overview.module.less`
- `.agents/standards/ue5-card-layout-density-standard.md`

**Likely small CSS** (if stretch 子树仍 `height:100%` 把图拉长)：安全分析所在卡的图表容器，或公共 `.panel-card-slot[data-card-fill-mode="stretch"]` 里图表 `flex: 0 0 auto`。

**Do not**

- 不测 DOM
- 不把市场总览拆成两张配置卡
- 不恢复「左右最后一张底边齐平」

---

### Task 1: Packing stops consuming leftover into slot heights

**Files:**
- Modify: `prod/cube/apps/ue5/app/src/features/cards/base-panel-render/panel-slot-packing.ts`
- Test: `prod/cube/apps/ue5/app/src/features/cards/base-panel-render/panel-slot-packing.test.ts`

- [ ] **Step 1: Write failing tests**

把「余量进卡片」的旧断言改掉，并追加：

```ts
test("leftover does not stretch normal cards past slotMin", () => {
  const packing = resolvePanelSlotPacking({
    cardCount: 2,
    availableHeight: 940,
    uiScale: 1,
    profiles: [
      { weight: 1.45, slotMin: 400, slotMax: 640 },
      { weight: 1.35, slotMin: 280, slotMax: 640 },
    ],
  });
  expect(packing.slotHeights[0]).toBe(400);
  expect(packing.slotHeights[1]).toBe(280);
  expect(packing.gap).toBe(12);
  expect(packing.paddingTop).toBe(0);
});

test("media card keeps a 620 floor and is not grown to fill 1080p", () => {
  const packing = resolvePanelSlotPacking({
    cardCount: 2,
    availableHeight: 940,
    uiScale: 1,
    profiles: [
      { weight: 1.8, slotMin: 620, slotMax: 900 },
      { weight: 1.35, slotMin: 280, slotMax: 640 },
    ],
  });
  expect(packing.visibleCount).toBe(2);
  expect(packing.slotHeights[0]).toBe(620);
  expect(packing.slotHeights[1]).toBe(280);
});

test("single analysis card does not eat leftover as padding or extra height", () => {
  const packing = resolvePanelSlotPacking({
    cardCount: 1,
    availableHeight: 940,
    uiScale: 1,
    profiles: [{ weight: 1.45, slotMin: 400, slotMax: 640 }],
  });
  expect(packing.slotHeights[0]).toBe(400);
  expect(packing.paddingTop).toBe(0);
});
```

删除或改写现有这些测试（它们编码了错误需求）：

- `two-card 1080p spends leftover on cards, not on a large gap` — 余量不应再进卡片
- `two composite cards on 1080p each stay well above the chart floor` 里 `> 450` — 应等于各自 slotMin
- `single card pins to the bottom with padding-top leftover` — paddingTop 应为 0
- `1080p market overview plus device ... overview above 620` — 改为正好 620 地板，真正长高交给 CSS max-content

保留：768p 总览减 N、三张 280 仍 N=3、kpi+chart 400 地板。

- [ ] **Step 2: Run tests, expect FAIL**

Run: `bun test prod/cube/apps/ue5/app/src/features/cards/base-panel-render/panel-slot-packing.test.ts`

- [ ] **Step 3: Implement**

`distributeSlotHeights` 不再分配 remaining。可见槽高度 = 各自 `slotMin`，`gap` 保持 `SLOT_GAP * scale`，`paddingTop` 恒为 0。

```ts
export const distributeSlotHeights = (
  availableHeight: number,
  gap: number,
  profiles: Array<{ weight: number; slotMin: number; slotMax: number }>,
): { heights: number[]; gap: number; paddingTop: number } => {
  const n = profiles.length;
  if (n === 0) {
    return { heights: [], gap, paddingTop: 0 };
  }
  return {
    heights: profiles.map((profile) => profile.slotMin),
    gap,
    paddingTop: 0,
  };
};
```

`availableHeight` 仍给 `resolveVisibleCount` 用。隐藏卡高度继续用自己的 `slotMin`（不要用 meanVisible 放大）。

`mode`：若 `sum(slotMin)+gaps > availableHeight` 则为 `scroll`，否则 `pack`。因为真实 `max-content` 可能比 slotMin 高，**pack 模式的 CSS 也要允许 overflow-y auto**（Task 2）。

- [ ] **Step 4: Re-run tests, expect PASS**

- [ ] **Step 5: Do not commit unless the user asked**

---

### Task 2: Grid rows become minmax(slotMin, max-content)

**Files:**
- Modify: `prod/cube/apps/ue5/app/src/features/cards/base-panel-render/base-panel-render.tsx`
- Modify: `prod/cube/apps/ue5/app/src/features/cards/base-panel-render/base-panel-render.module.less`

- [ ] **Step 1: Emit minmax rows**

`base-panel-render.tsx` 里把：

```ts
"--panel-slot-rows": panelLayout.value.slotHeights.map((height) => `${height}px`).join(" "),
```

改为：

```ts
"--panel-slot-rows": panelLayout.value.slotHeights
  .map((height) => `minmax(${height}px, max-content)`)
  .join(" "),
```

`height` 在 packing 里已是 slotMin。

- [ ] **Step 2: Pack box does not stretch children to fill H**

`.panel-pack-box`：

```less
.panel-pack-box {
  display: grid;
  grid-template-rows: var(--panel-slot-rows);
  gap: var(--panel-slot-gap, 12px);
  align-content: start;
  box-sizing: border-box;
  height: auto;
  max-height: var(--panel-content-height);
  min-height: 0;
  padding-top: 0;
  overflow-x: hidden;
  overflow-y: auto; // pack 与 scroll 都允许，超长卡才能露全文
}
```

槽位：

```less
> .panel-card-slot {
  min-width: 0;
  min-height: 0;
  height: auto;
  overflow: visible; // 不要在槽上裁介绍文案
}
```

- [ ] **Step 3: Stretch fill mode must not force 100% of the panel**

`.panel-card-slot[data-card-fill-mode="stretch"]` 里，把卡片根/`sub-panel-content` 的 `height: 100%` 改为 `height: auto`（至少在非 table 的 stretch 卡上）。图表容器改为：

```less
:global(.ue5-line-chart),
:global(.overview-chart),
:global(.chart-box) {
  flex: 0 0 auto;
  min-height: 140px;
  height: 180px;
}
```

先 `rg` 安全分析实际图表 class（`security-analysis` 卡），只改真实 class，不要猜一堆选择器。原则：主图 `flex-grow: 0` + 固定/有上限的高度。

`center` 档已经是 `height: auto`，保持。

- [ ] **Step 4: Visual check after Task 3**

---

### Task 3: Market overview sizes to its copy and media

**Files:**
- Modify: `prod/cube/apps/ue5/app/src/features/cards/security-overview/cards/security-market-overview.module.less`

- [ ] **Step 1: Body follows content**

```less
.safe-market-body {
  height: auto;
  overflow: visible;
  flex: 0 0 auto;
}

.safe-market-intro {
  display: grid;
  flex: 0 1 auto; // 不要再 flex:1 去填被拉高的槽
  min-height: 180px;
  height: auto;
}

.safe-market-remark,
.safe-market-intro-text {
  height: auto;
  overflow: visible;
  white-space: normal; // 若现在是单行省略，改为多行完整展示
}
```

仪表盘、指标仍 `flex: 0 0 auto`。不要把介绍区写回 `min-height: 0`。

若介绍文案原先靠 marquee 滚动，**侧栏内改为自然换行全文**；放大镜 zoom 里可保留滚动。

- [ ] **Step 2: Visual check**

1080p 总览左栏：仪表盘、四指标、视频、介绍全文；若总高超过侧栏，**侧栏出现滚动条**，不是卡底裁字。右栏安全分析：折线保持约 180px 量级，卡底到导航之间允许空白。

---

### Task 4: Standard

**Files:**
- Modify: `.agents/standards/ue5-card-layout-density-standard.md`

Goals 改为：

1. 卡片高度 = 内容高度（`minmax(slotMin, max-content)`）。余量留侧栏底部，不灌进卡片。
2. 超长 `media` 卡随介绍/视频长高；超出侧栏则整栏滚动。
3. 普通卡停在设计高度；主图不得 `flex:1` 拉成长条。
4. 常规短卡 1080p 仍可一屏 3 张（三张 `slotMin=280` 之和 ≤ H）。
5. 左右底边允许不齐平。

Composite「仪表盘 + 多指标 + 介绍」：介绍区 `height: auto`，禁止用 `overflow: hidden` 裁全文。

Verification：总览介绍不被裁；安全分析折线不被纵向拉满侧栏。

- [ ] Run: `bun test prod/cube/apps/ue5/app/src/features/cards/base-panel-render/panel-slot-packing.test.ts prod/cube/apps/ue5/app/src/features/cards/base-panel-render/card-layout-profile.test.ts`

Expected: all pass.

---

## Spec coverage

- 市场总览应按实际高度、文案看全 → Task 2 max-content + Task 3 overflow visible
- 安全分析不应拉长 → Task 1 余量不进槽 + Task 2 主图 flex-grow 0
- 1080p 短卡三张 → 仍用 slotMin 之和算 N
- 不测 DOM → CSS max-content

## Placeholder scan

无 TBD。安全分析图表 class 在 Task 2 用 `rg` 落在真实节点上，不要虚构选择器。
