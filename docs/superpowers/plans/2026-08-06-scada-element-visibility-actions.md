# SCADA Element Visibility Actions Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make each element's initial visibility configurable and allow one element event to show or hide another element in preview and runtime modes.

**Architecture:** Reuse the existing `ElementInstance.visible` field as the single persisted source of truth. Add a `setElementVisibility` action whose executor delegates to a host callback, then implement that callback in Studio preview, iframe viewer, and direct SDK mode by immutably replacing the active page element list.

**Tech Stack:** TypeScript, Vue 3 TSX, Ant Design Vue, X6, Vitest, Bun/Vite.

---

### Task 1: Persist initial element visibility

**Files:**
- Modify: `prod/cube/scada/basic/core/src/serialization/page-serializer.ts`
- Modify: `prod/cube/scada/basic/core/src/serialization/tests/page-serializer.test.ts`
- Modify: `prod/cube/scada/basic/editor/src/store/use-editor-store.ts`

- [ ] **Step 1: Add a failing serialization regression test**

Assert that node data `{ visible: false }` becomes `ElementInstance.visible === false`, and that loading an element with `visible: false` writes the same value back into node data.

- [ ] **Step 2: Run the focused serializer test**

Run: `bun test prod/cube/scada/basic/core/src/serialization/tests/page-serializer.test.ts`

Expected: FAIL because visibility is currently hard-coded to `true`.

- [ ] **Step 3: Preserve visibility in both conversion directions**

Use `data.visible !== false` when serializing graph nodes and include `visible: el.visible !== false` in graph node data. Read the same value in `selectedInstance` and allow `updateInstanceMeta()` to update it.

- [ ] **Step 4: Re-run the focused serializer test**

Expected: PASS.

### Task 2: Add the visibility action contract

**Files:**
- Modify: `prod/cube/scada/basic/core/src/types/instance.ts`
- Modify: `prod/cube/scada/basic/engine/src/action/action-executor.ts`
- Modify: `prod/cube/scada/basic/engine/__tests__/action-executor.test.ts`

- [ ] **Step 1: Add a failing executor test**

Execute `{ type: "setElementVisibility", params: { targetElementId: "target-1", visible: false } }` and expect a host callback to receive `("target-1", false)`.

- [ ] **Step 2: Add the action type and callback**

Extend `ActionType`, add `setElementVisibility?: (elementId: string, visible: boolean) => void` to `ActionContext`, and execute it after template resolution. Ignore empty targets.

- [ ] **Step 3: Re-run the executor test**

Run: `bun test prod/cube/scada/basic/engine/__tests__/action-executor.test.ts`

Expected: PASS.

### Task 3: Add editor controls

**Files:**
- Modify: `prod/cube/scada/basic/editor/src/panels/properties-panel.tsx`
- Modify: `prod/cube/scada/basic/editor/src/panels/events-panel.tsx`
- Modify: `prod/cube/scada/basic/editor/src/canvas/scada-node-wrapper.tsx`

- [ ] **Step 1: Add initial visibility control**

Add a visible/hidden selector to the element properties and persist it through `updateInstanceMeta()`.

- [ ] **Step 2: Add the event action form**

Add “设置图元显示隐藏” to action choices. Require a target element and a visible/hidden value; existing mouseenter/mouseleave event choices already cover the requested interaction.

- [ ] **Step 3: Keep hidden elements editable**

Render hidden elements as a translucent design-time ghost with a “运行时隐藏” marker instead of removing them from the X6 canvas.

### Task 4: Apply visibility in preview and runtime

**Files:**
- Modify: `prod/cube/scada/basic/runtime/src/runtime-renderer.tsx`
- Modify: `prod/cube/scada/scada-studio/src/views/editor-view.tsx`
- Modify: `prod/cube/scada/scada-studio/src/views/viewer-view.tsx`
- Modify: `prod/cube/scada/basic/studio-sdk/src/direct-scada-page-handle.ts`

- [ ] **Step 1: Respect initial visibility in the renderer**

Set element wrappers to `display: none` when `element.visible === false`, including unknown-element placeholders.

- [ ] **Step 2: Wire Studio preview actions**

Update `previewPage` immutably when the executor requests a target visibility change.

- [ ] **Step 3: Wire iframe and direct SDK actions**

Update each active page ref immutably so Vue re-renders immediately after mouseenter/mouseleave actions.

### Task 5: Verify the complete interaction

**Files:**
- Review all files above.

- [ ] **Step 1: Run focused tests**

Run the serializer and action-executor test files.

- [ ] **Step 2: Build the SDK and Studio app**

Run: `bun --cwd prod/cube/scada/basic/studio-sdk run build`

Run: `bun --cwd prod/cube/scada/scada-studio run build`

Expected: both PASS.

- [ ] **Step 3: Check formatting and diffs**

Run targeted `oxfmt --check` and `git diff --check`, and confirm no debug instrumentation remains.

- [ ] **Step 4: Preserve workspace state**

Do not stage or commit; report any pre-existing type-check baseline separately.
