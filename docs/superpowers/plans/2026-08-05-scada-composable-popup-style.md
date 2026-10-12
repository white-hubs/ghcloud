# SCADA Composable Popup Style Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Allow one SCADA popup action to show custom content and bound device label/value rows together, with independently configurable typography and layout.

**Architecture:** Keep popup configuration on the existing `showPopup` action so page serialization remains backward compatible. Normalize style options and device rows in `@cube-scada/studio-sdk`, then let each host render the combined sections; the Demo host provides the reference renderer while Studio preview consumes the same normalized event shape.

**Tech Stack:** Vue 3 TSX, TypeScript, Ant Design Vue, Vitest, Bun/Vite.

---

### Task 1: Define and normalize the popup event model

**Files:**

- Modify: `prod/cube/scada/basic/studio-sdk/src/types.ts`
- Modify: `prod/cube/scada/basic/studio-sdk/src/popup-from-config.ts`
- Create: `prod/cube/scada/basic/studio-sdk/__tests__/popup-from-config.test.ts`

- [ ] **Step 1: Write failing normalization tests**

Cover legacy defaults, custom text style normalization, device label/value style normalization, and enrichment with `propertyBindings` plus a runtime value reader.

- [ ] **Step 2: Run the focused test and confirm failure**

Run: `bun test prod/cube/scada/basic/studio-sdk/__tests__/popup-from-config.test.ts`

Expected: FAIL because the style and device-data fields do not exist yet.

- [ ] **Step 3: Add typed normalized fields**

Add `ScadaPopupTextStyle`, `ScadaPopupDeviceStyle`, `ScadaPopupStyle`, and `ScadaPopupDeviceDatum`. Make `scadaPopupFromActionConfig()` apply safe defaults and make `enrichScadaPopupWithSource()` produce fixed `{ label, value }` rows from the source element bindings.

- [ ] **Step 4: Run the focused test**

Run: `bun test prod/cube/scada/basic/studio-sdk/__tests__/popup-from-config.test.ts`

Expected: PASS.

### Task 2: Add popup style controls to the event editor

**Files:**

- Modify: `prod/cube/scada/basic/editor/src/panels/events-panel.tsx`

- [ ] **Step 1: Extend showPopup defaults**

Store nested `contentStyle` and `deviceStyle` objects in action params while leaving absent fields valid for existing pages.

- [ ] **Step 2: Add focused style editors**

Add alignment, font size, color, bold, and line-height controls for custom text. Add row/column layout, alignment, label/value font size, color, bold, and spacing controls for device rows. Update nested objects immutably through the existing `update` event.

- [ ] **Step 3: Format and type-check the editor package**

Run: `bun --cwd prod/cube/scada/basic/editor run typecheck`

Expected: PASS, or report existing baseline errors separately from introduced errors.

### Task 3: Forward live device values through both SDK render modes

**Files:**

- Modify: `prod/cube/scada/basic/studio-sdk/src/direct-scada-page-handle.ts`
- Modify: `prod/cube/scada/scada-studio/src/views/viewer-view.tsx`

- [ ] **Step 1: Pass a runtime value reader during popup enrichment**

Read each bound `propCode` from the existing `ManualDriver`; use `--` when no current value exists.

- [ ] **Step 2: Forward normalized style and device rows through iframe messages**

Include `style` and `deviceData` in `scada:showPopup` without removing any existing fields.

- [ ] **Step 3: Build the SDK**

Run: `bun --cwd prod/cube/scada/basic/studio-sdk run build`

Expected: PASS.

### Task 4: Render custom and device sections together

**Files:**

- Create: `prod/cube/scada/scada-demo/src/views/scada-demo/scada-popup-body.tsx`
- Modify: `prod/cube/scada/scada-demo/src/views/scada-demo/scada-popup-custom.tsx`
- Modify: `prod/cube/scada/scada-demo/src/views/scada-demo/scada-demo.tsx`
- Modify: `prod/cube/scada/scada-studio/src/views/editor-view.tsx`

- [ ] **Step 1: Create a combined popup body renderer**

Render host custom content, configured plain text, and device `{ label, value }` rows as independent sections in that order. Apply content typography to the custom/text wrapper and device typography/layout to the device grid.

- [ ] **Step 2: Replace the Demo's mutually exclusive branches**

Remove early returns that select only custom content or device content. Preserve scrolling and empty-state behavior.

- [ ] **Step 3: Update Studio preview**

Show the same normalized custom text and device rows with their configured styles so users can verify settings before publishing.

- [ ] **Step 4: Build both consuming apps**

Run: `bun --cwd prod/cube/scada/scada-demo run build`

Run: `bun --cwd prod/cube/scada/scada-studio run build`

Expected: both commands PASS.

### Task 5: Final regression verification

**Files:**

- Review all files listed above.

- [ ] **Step 1: Run focused tests and builds fresh**

Run the popup normalization test, SDK build, Demo build, and Studio build again after formatting.

- [ ] **Step 2: Check formatting and whitespace**

Run targeted `oxfmt --check` for changed TypeScript/TSX files and `git diff --check`.

- [ ] **Step 3: Review backward compatibility**

Confirm a legacy action containing only `{ title, contentId, content }` receives defaults, and confirm custom content plus device rows are both present when both are configured.

- [ ] **Step 4: Preserve workspace state**

Do not stage or commit; report verification evidence and any pre-existing baseline failures.
