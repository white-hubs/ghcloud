# Air Conditioning Card UI Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate all six air-conditioning panels to the unified access-control visual system without changing API calls, refresh timing, modal behavior, or row interactions.

**Architecture:** Keep `AirConditioningLeft` and `AirConditioningRight` as the existing data-orchestration components. Add a feature-local theme/token layer and title-icon component, then render each panel through a focused body function so the normal and zoom views share identical content and styling. Reuse the existing `SubPanelTemplate` zoom contract and shared chart/list/table components.

**Tech Stack:** Vue 3 render functions/TSX, CSS Modules with Less, ECharts-backed shared components, Vite production build.

---

### Task 1: Add the air-conditioning visual foundation

**Files:**
- Create: `prod/cube/apps/ue5/app/src/features/cards/air-conditioning/_shared/air-conditioning-card-icon.tsx`
- Create: `prod/cube/apps/ue5/app/src/features/cards/air-conditioning/_shared/air-conditioning-v2-shared.module.less`

- [x] **Step 1: Add a typed title-icon component**

Create one pure presentation component with the icon contract below; each icon is rendered inside the same `v2-title-icon` tile used by the unified panels.

```ts
type AirConditioningCardIconName = "realtime" | "trend" | "rate" | "distribution" | "alarm" | "records";

<span class="v2-title-icon" aria-hidden="true">
  <svg class="v2-title-icon-svg" viewBox="0 0 24 24" fill="none">
    <path d={iconPaths[props.name]} stroke="currentColor" stroke-width="1.8" />
  </svg>
</span>
```

- [x] **Step 2: Add shared tokens and theme rules**

Define one scoped token set on `.air-conditioning-v2-panel`, including `--access-control-space-*`, font sizes, text colors, surface background/border/radius/shadow, pie sizes, chart heights, and light-theme overrides. Style only descendants of `.air-conditioning-v2-panel`.

```less
.air-conditioning-v2-panel {
  --access-control-space-xs: 4px;
  --access-control-space-sm: 6px;
  --access-control-space-md: 10px;
  --access-control-space-lg: 16px;
  --access-control-surface-radius: 10px;
  --access-control-surface-border: 1px solid var(--visual-card-inner-border, rgba(70, 166, 255, 0.24));
}

:root[data-visual-theme="minimal-white"] .air-conditioning-v2-panel {
  --access-control-surface-background: linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(246, 250, 255, 0.94));
  --access-control-surface-border: 1px solid rgba(116, 158, 210, 0.18);
}
```

- [x] **Step 3: Check the new files**

Run: `git diff --check -- prod/cube/apps/ue5/app/src/features/cards/air-conditioning/_shared`

Expected: exit code `0` with no whitespace errors.

### Task 2: Migrate the left-side panels

**Files:**
- Modify: `prod/cube/apps/ue5/app/src/features/cards/air-conditioning/air-conditioning-left.tsx`
- Modify: `prod/cube/apps/ue5/app/src/features/cards/air-conditioning/air-conditioning-left.module.less`
- Modify: `prod/cube/apps/ue5/app/src/shared-ui/panel/charts/waterPolo/waterPolo.tsx`

- [x] **Step 1: Convert each panel to the unified shell**

For “设备实时数据”, “设备报警趋势”, and “设备报警率”, use this shell contract and provide a dedicated title icon, zoom button, zoom content, and header toolbar where a date selector exists.

```tsx
<SubPanelTemplate
  class="visual-v2-sub-panel v2-panel-card air-conditioning-v2-panel air-conditioning-card-theme access-control-card-theme"
  zoomable
  v-slots={{
    titleIcon: () => <AirConditioningCardIcon name="trend" />,
    extra: () => <div class="air-conditioning-header-toolbar">...</div>,
    "zoom-content": () => renderAlarmTrendBody(true),
    default: () => renderAlarmTrendBody(false),
  }}
/>
```

- [x] **Step 2: Style the left card bodies**

Use a `10px` content gap, `10px` surface radius, one border per content surface, compact `11/12/13/16/22px` typography, and explicit normal/zoom chart sizes. Scope all child-component overrides beneath the local card-body classes.

- [x] **Step 3: Make the existing liquid chart theme-aware**

Use `getVisualThemeChartColors()` for canvas text colors, listen for `VISUAL_THEME_CHANGE_EVENT`, resize through one stable handler, and dispose listeners/observers on unmount. Keep the numeric series and liquid-fill colors unchanged.

- [x] **Step 4: Confirm data and interactions are unchanged**

Verify the diff retains `deviceDataInfo`, `alarmTrendInfo`, `equipmentAlarmRateInfo`, `handelClickItemize`, interval setup/cleanup, and modal parameters without request-contract changes.

### Task 3: Migrate the right-side panels

**Files:**
- Modify: `prod/cube/apps/ue5/app/src/features/cards/air-conditioning/air-conditioning-right.tsx`
- Modify: `prod/cube/apps/ue5/app/src/features/cards/air-conditioning/air-conditioning-right.module.less`

- [x] **Step 1: Convert each panel to the unified shell**

Apply the same shell contract to “空调类型分布”, “报警事件top5”, and “实时报警数据”. Move the date selector to the header toolbar and reuse the same render body for normal and zoom content.

- [x] **Step 2: Normalize list, empty, and table surfaces**

Render the top-five list inside one list surface, show the existing `NoData` component when the array is empty, and render `RollTable` inside one clipped table surface. Do not add nested decorative borders.

```tsx
{alarmTop.arr.length > 0
  ? alarmTop.arr.map((item, index) => <EventAlarmItem key={item.id} ... />)
  : <NoData />}
```

- [x] **Step 3: Confirm the original interaction path**

Verify `alarmRealData`, `alarmEventTop`, polling, and `bus.emit("equipmentPosition", record)` remain intact.

### Task 4: Verify the complete migration

**Files:**
- Verify all files under: `prod/cube/apps/ue5/app/src/features/cards/air-conditioning/`

- [x] **Step 1: Check source invariants**

Run searches confirming six `zoomable` panels, six title icons, both theme selectors, and no unscoped legacy `class="equipmentAlarm"`/`class="body"` markup.

- [x] **Step 2: Run whitespace validation**

Run: `git diff --check`

Expected: exit code `0`.

- [x] **Step 3: Run the package production build**

Run: `bun run build` from `prod/cube/apps/ue5/app`.

Expected: Vite exits with code `0`; existing unresolved runtime-asset and bundle-size warnings may remain.

- [x] **Step 4: Review the final diff**

Confirm only feature-local presentation markup/styles and the planned documentation were added for this migration, while existing unrelated dirty-worktree changes remain untouched.
