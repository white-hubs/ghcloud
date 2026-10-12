import { afterEach, beforeEach, expect, mock, test } from "bun:test";
import { effectScope, shallowRef, type EffectScope } from "vue";

import type { ProductProp } from "@ghcloud/cube-iot-center-service";

import type { LinkedDevice } from "./use-device-properties";

const writable: ProductProp = {
  propCode: "power",
  name: "开关",
  dataType: "boolean",
  dataWrite: 1,
  dataConfig: '[{"value":0,"label":"关"},{"value":1,"label":"开"}]',
};
const readonly: ProductProp = { propCode: "temperature", name: "温度", dataType: "float", dataWrite: 0, dataConfig: "[]" };
const detail = mock(async (_input: { deviceId: string }) => ({ productId: "product-1" }));
const definitions = mock(async (_input: unknown): Promise<ProductProp[]> => [writable, readonly]);
const values = mock(async (_input: unknown) => ({ propValList: [{ key: "power", value: 0, ts: 123 }] }));
const issue = mock(async (_input: unknown) => ({ statusCode: "PROCESSING", message: "执行中" }));
const notify = mock((_input: unknown) => {});
mock.module("@/api/server", () => ({
  emergencyDeviceService: {
    getDeviceDetail: detail,
    getEmergencyDevicePropertyValues: values,
    getProductPropList: definitions,
    issueEmergencyDevicePropertyCommand: issue,
  },
}));
mock.module("vant", () => ({ showNotify: notify }));
const { useDeviceProperties } = await import("./use-device-properties");
let scope: EffectScope;
const settle = () => new Promise((resolve) => setTimeout(resolve, 0));
async function setup() {
  scope = effectScope();
  const device = shallowRef<LinkedDevice | undefined>({ deviceId: "device-42", deviceName: "水泵" });
  const state = scope.run(() => useDeviceProperties(device))!;
  await settle();
  return { state, device };
}
beforeEach(() => {
  for (const fn of [detail, definitions, values, issue, notify]) {
    fn.mockClear();
  }
  detail.mockImplementation(async () => ({ productId: "product-1" }));
  definitions.mockImplementation(async () => [writable, readonly]);
  values.mockImplementation(async () => ({ propValList: [{ key: "power", value: 0, ts: 123 }] }));
  issue.mockImplementation(async () => ({ statusCode: "PROCESSING", message: "执行中" }));
});
afterEach(() => scope?.stop());

test("loads the device ID and raw values, and does not open read-only editors", async () => {
  const { state } = await setup();
  expect(detail).toHaveBeenCalledWith({ deviceId: "device-42" });
  expect(state.valueMap.value.get("power")?.value).toBe(0);
  state.edit(readonly);
  expect(state.editor.value).toBeUndefined();
  expect(issue).not.toHaveBeenCalled();
});

test("permission is checked again before issuing a command", async () => {
  const { state } = await setup();
  state.edit(writable);
  state.input.value = "1";
  definitions.mockImplementation(async () => [{ ...writable, dataWrite: 0 }]);
  await state.submit();
  expect(issue).not.toHaveBeenCalled();
  expect(state.editorError.value).toContain("不可写");
});

test("submits string values, refreshes feedback and labels PROCESSING honestly", async () => {
  const { state } = await setup();
  state.edit(writable);
  state.input.value = "0";
  await state.submit();
  await settle();
  expect(issue.mock.calls[0]![0]).toMatchObject({ deviceId: "device-42", propCode: "power", propValue: "0" });
  expect(notify.mock.calls[0]![0]).toMatchObject({ message: "指令已提交，请关注设备实时值" });
  expect(values).toHaveBeenCalledTimes(2);
});

test("business rejection does not report success or close the editor", async () => {
  const { state } = await setup();
  issue.mockImplementation(async () => ({ statusCode: "REJECT", message: "设备拒绝指令" }));
  state.edit(writable);
  state.input.value = "1";
  await state.submit();
  expect(state.editorError.value).toBe("设备拒绝指令");
  expect(state.editor.value).toBeDefined();
  expect(notify).not.toHaveBeenCalled();
});

test("closing the device discards stale in-flight responses", async () => {
  let resolve!: (value: { productId: string }) => void;
  detail.mockImplementation(
    () =>
      new Promise((done) => {
        resolve = done;
      }),
  );
  const { state, device } = await setup();
  device.value = undefined;
  await settle();
  resolve({ productId: "old-product" });
  await settle();
  expect(state.properties.value).toEqual([]);
  expect(definitions).not.toHaveBeenCalled();
});
