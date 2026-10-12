# Gateway Global Error Notification Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make electrical-safety API failures show one global, backend-message-first notification without page-level notification wrappers.

**Architecture:** `@ghcloud/cube-gateway` remains UI-agnostic and emits normalized failure events while preserving rejected promises. The electrical-safety app registers one toast handler at bootstrap; gateway detects transport and common business-envelope failures, while existing response readers continue returning typed data. Requests display errors by default and pass `showErrorMessage: false` only when an endpoint must be silent.

**Tech Stack:** TypeScript, Fetch, Bun test, Vue 3, `@ghcloud/cube-ui`.

---

### Task 1: Add gateway-level failure reporting

**Files:**
- Modify: `standard/infrastructure/gateway/src/core.ts`
- Modify: `standard/infrastructure/gateway/src/gateway.ts`

- [ ] **Step 1: Write failing gateway tests**

```ts
it("reports an HTTP failure before rejecting", async () => {
  const remove = addGatewayErrorInterceptor((event) => received.push(event));
  await expect(makeGETRequest({ url: "/failure" }).send()).rejects.toThrow("后端提示");
  expect(resolveGatewayErrorMessage(received[0]!)).toBe("后端提示");
  remove();
});

it("rejects and reports a successful HTTP response with a failed business envelope", async () => {
  await expect(makeGETRequest({ url: "/business-failure" }).send()).rejects.toThrow("业务失败");
});
```

- [ ] **Step 2: Run the focused test and verify it fails**


Expected: FAIL because the error-interceptor API does not exist.

- [ ] **Step 3: Implement the UI-independent interceptor API**

```ts
export interface CubeGatewayErrorEvent {
  error: unknown;
  options: CubeGatewayRequestOptions;
  responseBody?: unknown;
  status?: number;
}

export const addGatewayErrorInterceptor = (interceptor: GatewayErrorInterceptor): (() => void) => {
  gatewayErrorInterceptors.add(interceptor);
  return () => gatewayErrorInterceptors.delete(interceptor);
};
```

Have `send()` report both rejected Fetch/non-2xx results and recognizable `{ success: false }` or non-success `{ code, msg/message }` payloads, then reject with `CubeGatewayResponseError`.

- [ ] **Step 4: Run the focused test and verify it passes**


Expected: PASS.

### Task 2: Register global electric-safety UI feedback

**Files:**
- Modify: `prod/cube/apps/electrical-safety/app/package.json`
- Modify: `prod/cube/apps/electrical-safety/app/src/main.ts`
- Modify: `prod/cube/apps/electrical-safety/app/src/utils/request-error.ts`
- Modify: `prod/cube/apps/electrical-safety/app/src/views/electrical-center/electrical-center.tsx`

- [ ] **Step 1: Add the direct workspace dependency**

```json
"@ghcloud/cube-gateway": "workspace:^"
```

- [ ] **Step 2: Register and clean up the app handler**

```ts
this.removeGatewayErrorInterceptor = addGatewayErrorInterceptor((event) => {
  message.error(resolveGatewayErrorMessage(event));
});
```

Register before mounting the app and invoke the returned function during qiankun unmount.

- [ ] **Step 3: Remove redundant page feedback**

Delete the aggregate `"部分首页统计加载失败"` warning and the direct alarm-load error toast. Keep all `catch` blocks that reset local state and all `Promise.allSettled` partial-success handling.

- [ ] **Step 4: Remove page-level error wrappers**

Replace every `requestWithMessage(() => request, options)` call in the electrical-safety app with `request`, retain any required success toast after the request resolves, delete `src/utils/request-error.ts`, and use `showErrorMessage: false` only for deliberately silent requests.

### Task 3: Verify affected packages

**Files:**
- Verify: `prod/cube/apps/electrical-safety/app`

- [ ] **Step 1: Run focused gateway tests**


Expected: PASS.

- [ ] **Step 2: Build the electrical-safety application**

Run: `bun -F @ghcloud/cube-electrical-safety-app build`

Expected: exit code 0.

- [ ] **Step 3: Inspect the final changes**

Run: `git diff --check && git status --short`

Expected: no whitespace errors; only the gateway, electrical-safety, and plan files changed.
