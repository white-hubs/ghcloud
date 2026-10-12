# Electrical Center Device Health Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Populate the Electrical Center safety score and device-health distribution from the new backend statistic endpoint.

**Architecture:** Add the OpenAPI response and a typed `getDeviceHealthDistribution` operation to the electrical-safety service interface/client. Load it with the existing overview data, then render its distribution counts and lowest-scoring devices in the already-styled health section.

**Tech Stack:** Vue 3 JSX, ECharts, Cube service interface/client.

---

### Task 1: Add the service operation

**Files:**
- Modify: `prod/cube-services/interfaces/src/electrical-safety/response.ts`
- Modify: `prod/cube-services/interfaces/src/electrical-safety/gateway.ts`
- Modify: `prod/cube-services/client/src/electrical-safety.client.ts`

- [ ] **Step 1: Define the OpenAPI response**

Add `ElectricalDeviceHealthDistribution` with `totalCount`, `healthyCount`, `attentionCount`, `abnormalCount`, `unknownCount`, and `attentionTop5` entries containing `deviceId`, `deviceName`, and `healthScore`.

- [ ] **Step 2: Implement the GET client**

Expose `getDeviceHealthDistribution()` and call `/home/statistics/device-health-distribution` through the authenticated electrical-management JSON client.

### Task 2: Render the health data

**Files:**
- Modify: `prod/cube/apps/electrical-safety/app/src/views/electrical-center/electrical-center.tsx`

- [ ] **Step 1: Load health data with the other dashboard statistics**

Use `Promise.allSettled` so a health-statistics failure does not prevent alarms, facilities, or line loss from rendering.

- [ ] **Step 2: Replace the health placeholder**

Show a donut distribution, total device count, health/attention/abnormal/unknown counts, and the API-provided low-score Top5. Clicking an item opens its device monitoring detail.

### Task 3: Verify

**Files:**
- Verify: `prod/cube/apps/electrical-safety/app/src/views/electrical-center/electrical-center.tsx`

- [ ] **Step 1: Build the target application**

Run: `bun -F @ghcloud/cube-electrical-safety-app build`

Expected: exit code 0.

- [ ] **Step 2: Check whitespace**

Run: `git diff --check`

Expected: no output.
