# Electrical Safety Content UI Adjustment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Align the electrical center dashboard and device monitoring content areas with the supplied UI references while keeping the existing CubeLayout shell and data-loading flow unchanged.

**Architecture:** Keep route components and existing API/state orchestration intact. Adjust only the content render details and scoped Less in the two target views; use the existing cube-ui components and local data models for interactions and values.

**Tech Stack:** Vue 3, Vue JSX, TypeScript, Less, `@ghcloud/cube-ui`, `@ghcloud/cube-app-design`, ECharts.

---

### Task 1: Device monitoring content visual pass

**Files:**
- Modify: `prod/cube/apps/electrical-safety/app/src/views/device-monitoring/device-monitoring.tsx`
- Modify: `prod/cube/apps/electrical-safety/app/src/views/device-monitoring/device-monitoring.less`

- [ ] **Step 1: Keep the existing facility sidebar and query-driven view state, and update only the content card markup to expose the reference card sections: overview metrics, filters, device status badge, six metrics, health score, and online footer.**
- [ ] **Step 2: Add scoped styles for the light-blue page background, white overview panel, three-column device cards, compact metric cells, alarm badge, overflow menu affordance, and responsive fallback without changing `.monitor-layout` or the CubeLayout shell selectors.**
- [ ] **Step 3: Run the target app build and inspect the generated page for JSX/Less regressions.**

### Task 2: Electrical center dashboard visual pass

**Files:**
- Modify: `prod/cube/apps/electrical-safety/app/src/views/electrical-center/electrical-center.tsx`
- Modify: `prod/cube/apps/electrical-safety/app/src/views/electrical-center/electrical-center.less`

- [ ] **Step 1: Make the dashboard the default content view while preserving the explicit `?view=scada` path and existing header controls.**
- [ ] **Step 2: Add the reference-style KPI icon blocks, alarm severity chips, facility status cards, health distribution layout, and risk list styling using existing computed data and click handlers.**
- [ ] **Step 3: Keep the layout slots and outer shell untouched, then run the target app build.**

### Task 3: Final verification

**Files:**
- Verify: `prod/cube/apps/electrical-safety/app/package.json`
- Verify: the two target view files and their Less files

- [ ] **Step 1: Run the exact package build script from `package.json` and confirm exit code 0.**
- [ ] **Step 2: Review `git diff` and `git status --short` to confirm only the requested content-area files plus this plan changed, while preserving pre-existing staged work.**
- [ ] **Step 3: Report any verification limitation, including Mockplus authentication preventing direct inspection.**
