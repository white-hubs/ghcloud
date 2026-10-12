# Asset Management Card UI Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate all six asset-management template cards to the current unified panel style without changing their API requests, date filtering, chart data, or interactions.

**Architecture:** Keep each existing async card component as its own data-orchestration boundary. Add one feature-local title-icon component and one shared theme/token stylesheet, then give every card a normal/zoom body renderer so the standard and enlarged views share the same presentation and data source.

**Tech Stack:** Vue 3 render functions/TSX, CSS Modules with Less, ECharts-backed shared components, Vite production build.

---

### Task 1: Add the asset-management visual foundation

**Files:**
- Create: `prod/cube/apps/ue5/app/src/features/cards/asset-management/_shared/asset-management-card-icon.tsx`
- Create: `prod/cube/apps/ue5/app/src/features/cards/asset-management/_shared/asset-management-v2-shared.module.less`

- [x] **Step 1: Add typed title icons**

Create a pure presentation component covering `overview`, `department`, `region`, `status`, `classification`, and `outbound`, rendered inside the unified `v2-title-icon` tile.

```tsx
<span class="v2-title-icon" aria-hidden="true">
  <svg class="v2-title-icon-svg" viewBox="0 0 24 24" fill="none">
    <path d={iconPaths[props.name]} stroke="currentColor" stroke-width="1.8" />
  </svg>
</span>
```

- [x] **Step 2: Add shared panel and theme tokens**

Scope panel shell, header toolbar, content surfaces, typography, radii, spacing, shadows, chart heights, and minimal-white overrides beneath `.asset-management-v2-panel`.

```less
.asset-management-v2-panel {
  --asset-management-space-md: 10px;
  --asset-management-surface-radius: 10px;
  --asset-management-surface-border: 1px solid var(--visual-card-inner-border, rgba(70, 166, 255, 0.24));
}

:root[data-visual-theme="minimal-white"] .asset-management-v2-panel {
  --asset-management-surface-background: linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(246, 250, 255, 0.94));
}
```

- [x] **Step 3: Validate the new foundation**

Run: `git diff --check -- prod/cube/apps/ue5/app/src/features/cards/asset-management/_shared`

Expected: exit code `0`.

### Task 2: Migrate the overview and departmental-distribution cards

**Files:**
- Modify: `prod/cube/apps/ue5/app/src/features/cards/asset-management/asset-overview.tsx`
- Modify: `prod/cube/apps/ue5/app/src/features/cards/asset-management/asset-overview.module.less`
- Modify: `prod/cube/apps/ue5/app/src/features/cards/asset-management/distribution-departmental-assets.tsx`
- Modify: `prod/cube/apps/ue5/app/src/features/cards/asset-management/distribution-departmental-assets.module.less`

- [x] **Step 1: Apply the unified shell and zoom contract**

Give both cards the shared panel class, title icon, header date toolbar, zoom trigger, and shared normal/zoom body renderer.

```tsx
<SubPanelTemplate
  class="visual-v2-sub-panel v2-panel-card asset-management-v2-panel"
  zoomable
  v-slots={{
    titleIcon: () => <AssetManagementCardIcon name="overview" />,
    extra: () => <div class="asset-management-header-toolbar"><DateInlineForm /></div>,
    "zoom-content": () => renderBody(true),
    default: () => renderBody(false),
  }}
/>
```

- [x] **Step 2: Normalize overview statistics**

Render the six statistics as a consistent two-column grid inside one surface. Use local classes for label/value typography and retain the existing `CountTo` values and duration.

- [x] **Step 3: Normalize the department chart**

Render `OverviewChartBar` inside one clipped chart surface with explicit normal and zoom heights. Keep `barData`, the request mapping, and gradient colors unchanged.

### Task 3: Migrate the three pie-distribution cards

**Files:**
- Modify: `prod/cube/apps/ue5/app/src/features/cards/asset-management/regional-asset-distribution.tsx`
- Modify: `prod/cube/apps/ue5/app/src/features/cards/asset-management/regional-asset-distribution.module.less`
- Modify: `prod/cube/apps/ue5/app/src/features/cards/asset-management/proportion-asset-status.tsx`
- Modify: `prod/cube/apps/ue5/app/src/features/cards/asset-management/proportion-asset-status.module.less`
- Modify: `prod/cube/apps/ue5/app/src/features/cards/asset-management/proportion-asset-classification.tsx`
- Modify: `prod/cube/apps/ue5/app/src/features/cards/asset-management/proportion-asset-classification.module.less`

- [x] **Step 1: Apply the same shell and date toolbar**

Add the matching title icon, zoom trigger, and body renderer to all three cards while retaining their existing API calls and mappings.

- [x] **Step 2: Use one pie surface per card**

Align chart and legend using a consistent gap and chart size, remove nested decorative borders, and switch existing pie/list component imports to PascalCase without changing emitted behavior.

- [x] **Step 3: Add minimal-white descendant overrides**

Ensure legend names, counts, ratios, and center labels use visual-theme text tokens in both standard and zoom views.

### Task 4: Migrate the consumables outbound trend card

**Files:**
- Modify: `prod/cube/apps/ue5/app/src/features/cards/asset-management/trend-consumables-outbound.tsx`
- Modify: `prod/cube/apps/ue5/app/src/features/cards/asset-management/trend-consumables-outbound.module.less`

- [x] **Step 1: Apply the unified shell and zoom contract**

Move the date filter to the header toolbar and render the existing line chart through the same standard/zoom body function.

- [x] **Step 2: Normalize the chart surface**

Use one surface border, a `10px` radius, and explicit normal/zoom heights. Keep `xData`, `yData`, legend, gradient, and API mapping unchanged.

- [x] **Step 3: Remove the unresolved presentation-only legend reference**

Use the line series name already present in `yData` and omit the undefined `titles` identifier so rendering does not depend on an undeclared UI variable.

### Task 5: Verify the full asset-management migration

**Files:**
- Verify: `prod/cube/apps/ue5/app/src/features/cards/asset-management/`

- [x] **Step 1: Check source invariants**

Confirm six `zoomable` cards, six title icons, six header toolbars, minimal-white rules, and no legacy bare `visiting-data`, `equipmentAlarm`, `elevator-analysis`, `echart`, or `chart` markup.

- [x] **Step 2: Check request and interaction preservation**

Confirm all six original property API functions and their date-range request parameters remain present.

- [x] **Step 3: Run whitespace validation**

Run: `git diff --check`

Expected: exit code `0`.

- [x] **Step 4: Run the production build**

Run: `bun run build` from `prod/cube/apps/ue5/app`.

Expected: exit code `0`; pre-existing unresolved runtime-asset, legacy CSS, and bundle-size warnings may remain.

- [x] **Step 5: Review the final scoped diff**

Confirm changes are limited to asset-management presentation files, the planned shared visual files, and this implementation plan; preserve unrelated dirty-worktree changes.
