# 二维组态自动单双设备形态 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将二维组态从电气中心、电气设施房、设备组态三种人工分类，收敛为由画布内容自动推导的单设备、多设备两种形态。

**Architecture:** `@cube-scada/core` 是形态推导的唯一来源。统计页面 `elements` 中 `deviceBinding === "required"` 的图元数量：0–1 个为 `singleDevice`，2 个及以上为 `multiDevice`。Studio 不提供形态选择或锁定；序列化、反序列化、画布转换都会重新推导 `sceneScope`。Demo 仅为单设备提供产品与属性绑定入口，多设备的真实设备绑定留在业务应用。

**Tech Stack:** TypeScript、Vue 3 JSX、Pinia、Ant Design Vue、Bun、Vitest

---

## 文件职责

- `prod/cube/scada/basic/core/src/scene-scope.ts`：纯函数推导形态，并保留旧三形态读取兼容。
- `prod/cube/scada/basic/core/src/serialization/page-serializer.ts`：创建、保存、加载和画布转换时写入派生形态。
- `prod/cube/scada/basic/editor/src/store/use-editor-store.ts`：基于当前 X6 图元实时派生形态。
- `prod/cube/scada/basic/editor/src/panels/page-settings-drawer.tsx`：只读展示自动推导结果和规则。
- `prod/cube/scada/scada-studio/src/views/editor-view.tsx`：直接保存，不再弹出形态选择。
- `prod/cube/scada/scada-demo/src/views/scada-demo/scada-demo.tsx`：单设备显示绑定入口，多设备仅显示业务绑定说明。
- `prod/cube/scada/scada-studio-service/src/pages/page.service.ts`：不再执行电气中心唯一性校验。
- `prod/cube/apps/electrical-safety/app/src/utils/scada-pages.ts`：只兼容旧业务形态，不自动绑定新多设备页面。

## Vue 组件边界

- `EditorView`：页面加载、导入、保存和预览；不维护形态输入状态。
- `PageSettingsDrawer`：展示 `store.pageSceneScope`，无形态修改事件。
- `ScadaDemo`：按已派生的 `sceneScope` 控制演示配置入口。
- `useEditorStore`：监听图元新增、删除和数据变化，以 `computed` 暴露当前形态。

### Task 1: 固定自动推导规则

**Files:**
- Modify: `prod/cube/scada/basic/core/src/scene-scope.test.ts`

- [x] **Step 1: 写推导规则测试**

```ts
expect(inferSceneScopeFromElements([])).toBe("singleDevice");
expect(inferSceneScopeFromElements([{ deviceBinding: "required" }])).toBe("singleDevice");
expect(
  inferSceneScopeFromElements([
    { deviceBinding: "required" },
    { deviceBinding: "required" },
  ]),
).toBe("multiDevice");
```

- [x] **Step 2: 验证保存值不能覆盖画布事实**

分别验证“保存为多设备但只有一个 required 图元”恢复为单设备，以及“保存为单设备但有两个 required 图元”恢复为多设备。

- [x] **Step 3: 运行红灯与绿灯测试**

```bash
bun test prod/cube/scada/basic/core/src/scene-scope.test.ts
```

Expected: 实现前缺少推导函数而 FAIL；实现后 PASS。

### Task 2: 统一 core 推导与序列化

**Files:**
- Modify: `prod/cube/scada/basic/core/src/scene-scope.ts`
- Modify: `prod/cube/scada/basic/core/src/serialization/page-serializer.ts`
- Modify: `prod/cube/scada/basic/core/src/types/page.ts`

- [x] **Step 1: 实现推导函数**

```ts
export function inferSceneScopeFromElements(
  elements: ReadonlyArray<{ deviceBinding?: unknown }>,
): SceneScopeKind {
  let requiredBindingCount = 0;
  for (const element of elements) {
    if (element.deviceBinding !== "required") continue;
    requiredBindingCount++;
    if (requiredBindingCount > 1) return "multiDevice";
  }
  return "singleDevice";
}
```

- [x] **Step 2: 让完整页面优先使用图元**

`resolvePageSceneScope(page)` 在 `elements` 为数组时调用推导函数；只有列表摘要等没有 `elements` 的数据才读取旧 `sceneScope`。

- [x] **Step 3: 覆盖所有持久化入口**

`createDefaultPage`、`graphToPageModel`、`serializePage`、`deserializePage` 均根据页面图元生成 `sceneScope`，不接受人工覆盖。

### Task 3: 删除 Studio 人工选择流程

**Files:**
- Modify: `prod/cube/scada/basic/editor/src/store/use-editor-store.ts`
- Modify: `prod/cube/scada/basic/editor/src/panels/page-settings-drawer.tsx`
- Modify: `prod/cube/scada/basic/editor/src/panels/validation-panel.tsx`
- Modify: `prod/cube/scada/scada-studio/src/views/editor-view.tsx`

- [x] **Step 1: 将 store 形态改为派生值**

`pageSceneScope` 使用 `computed`，读取当前 X6 节点 `deviceBinding`；`node:added`、`node:removed`、`node:change:data` 更新依赖修订号。

- [x] **Step 2: 删除人工状态**

删除 `pageSceneScopeLocked`、首次保存弹窗、`pendingSceneScope`、`needsSceneScopePrompt` 及所有赋值代码。

- [x] **Step 3: 改为只读说明**

页面设置展示当前标签，并说明“0–1 个为单设备，2 个及以上为多设备”。

### Task 4: Demo 与业务边界

**Files:**
- Modify: `prod/cube/scada/scada-demo/src/views/scada-demo/scada-demo.tsx`
- Modify: `prod/cube/scada/scada-demo/src/views/scada-demo/scene-scope-meta.ts`
- Modify: `prod/cube/scada/scada-studio-service/src/pages/page.service.ts`
- Modify: `prod/cube/apps/electrical-safety/app/src/utils/scada-pages.ts`

- [x] **Step 1: Demo 根据派生形态控制入口**

`singleDevice` 显示“产品与属性绑定”，`multiDevice` 不显示绑定入口并提示真实设备在业务侧绑定。

- [x] **Step 2: 移除旧唯一性**

服务端保存多设备页面时不执行“电气中心唯一”校验。

- [x] **Step 3: 隔离尚未完成的业务绑定**

电气业务仅解析历史 `electricalCenter / facilityRoom / device` 原值；新 `multiDevice` 不自动进入绑定列表。

### Task 5: 验证

- [x] **Step 1: 运行相关测试**

```bash
bun test prod/cube/scada/basic/core/src/scene-scope.test.ts prod/cube/scada/scada-demo/src/views/scada-demo/scene-scope-meta.test.ts prod/cube/apps/electrical-safety/app/src/utils/scada-pages.test.ts
```

- [x] **Step 2: 构建受影响应用**

```bash
bun -F @ghcloud/cube-scada-studio-app build
bun -F @ghcloud/cube-scada-demo-app build
bun -F @ghcloud/cube-scada-studio-service build
bun -F @ghcloud/cube-electrical-safety-app build
```

- [x] **Step 3: 检查人工选择残留和格式**

```bash
rg -n 'pageSceneScopeLocked|needsSceneScopePrompt|pendingSceneScope|sceneScopeModalVisible' prod/cube/scada
bun lint
git diff --check
```

Expected: 人工选择符号无残留，测试和构建退出码为 0，lint 与 diff 检查通过。
