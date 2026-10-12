# Electrical Device Property Control Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let device-detail realtime properties issue a typed control command for read-write properties and show readable command-result statuses.

**Architecture:** Extend the electrical-safety service contract/client with the OpenAPI property-control endpoint and the metadata returned by realtime properties. The existing Vue TSX modal will select an editor from each property data type, validate and normalize its value, then refresh realtime values and control history after accepted commands.

**Tech Stack:** Vue 3 JSX, TypeScript, @ghcloud/cube-ui, Cube service interface/client.

---

### Task 1: Extend the electrical-safety contract and client

**Files:**
- Modify: `prod/cube-services/interfaces/src/electrical-safety/request.ts`
- Modify: `prod/cube-services/interfaces/src/electrical-safety/response.ts`
- Modify: `prod/cube-services/interfaces/src/electrical-safety/gateway.ts`
- Modify: `prod/cube-services/client/src/electrical-safety.client.ts`

- [ ] **Step 1: Define realtime metadata and the property-control request/response**

Add `dataWrite`, `dataConfig`, and `precision` to each realtime property, plus `DevicePropertyControlRequest { propValue: string }` and a response containing `commandSeq`, `commandHandle`, `statusCode`, and `message`.

- [ ] **Step 2: Expose the typed gateway/client operation**

Add `controlDeviceProperty(deviceId, propertyCode, payload)` to `ElectricalSafetyGateway`, and implement it as `POST /monitoring/devices/{deviceId}/properties/{propertyCode}:control` through the existing authenticated JSON client.

### Task 2: Implement typed property control in the details modal

**Files:**
- Modify: `prod/cube/apps/electrical-safety/app/src/views/device-monitoring/device-detail-modal.tsx`

- [ ] **Step 1: Render a setting action only for `dataWrite === 1` properties**

Open a dedicated property-control modal from each eligible realtime card while retaining the existing device-method action flow.

- [ ] **Step 2: Select and validate the appropriate editor**

Use `Select` for `enum`/`boolean` values from `dataConfig`; use `InputNumber` with range and precision for `int`, `long`, `float`, and `double`; use `Input` for other types. Normalize all accepted values to OpenAPI's required string `propValue`.

- [ ] **Step 3: Submit and refresh affected data**

Call the new client method, surface its `message` and accepted status, close on success, then refresh the realtime and control-record tabs.

- [ ] **Step 4: Translate command-record result enums**

Map known result/status codes such as `SUCCESS`, `FAIL`, `PENDING`, `PROCESSING`, `TIMEOUT`, and `CANCELLED` to Chinese labels and tag colors, while preserving unknown backend values.

### Task 3: Verify

**Files:**
- Verify: `prod/cube-services/interfaces/src/electrical-safety/{request,response,gateway}.ts`
- Verify: `prod/cube-services/client/src/electrical-safety.client.ts`
- Verify: `prod/cube/apps/electrical-safety/app/src/views/device-monitoring/device-detail-modal.tsx`

- [ ] **Step 1: Run the target application build**

Run: `bun -F @ghcloud/cube-electrical-safety-app build`

Expected: Vite and TypeScript compilation exit with code 0.

- [ ] **Step 2: Review the final diff**

Run: `git diff --check && git diff -- <the five modified source files>`

Expected: no whitespace errors; the client URL and UI payload match the supplied OpenAPI document.
