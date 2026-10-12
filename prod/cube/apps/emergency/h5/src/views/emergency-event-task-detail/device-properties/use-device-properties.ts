import { showNotify } from "vant";
import { computed, onScopeDispose, shallowRef, watch, type Ref } from "vue";

import type { ProductProp } from "@ghcloud/cube-iot-center-service";
import type { DevicePropertyValue } from "@ghcloud/cube-iot-center-service/src/emergency-device.service";

import { commandPropertyValue } from "./property-value";
import { emergencyDeviceService as devices } from "@/api/server";

export interface LinkedDevice {
  deviceId?: string | number;
  deviceName?: string;
  deviceCode?: string;
}

export function useDeviceProperties(device: Ref<LinkedDevice | undefined>) {
  const properties = shallowRef<ProductProp[]>([]);
  const values = shallowRef<DevicePropertyValue[]>([]);
  const loading = shallowRef(false);
  const refreshing = shallowRef(false);
  const submitting = shallowRef(false);
  const error = shallowRef("");
  const editor = shallowRef<ProductProp>();
  const input = shallowRef("");
  const editorError = shallowRef("");
  const productId = shallowRef("");
  let generation = 0;
  let timer: ReturnType<typeof setInterval> | undefined;
  const valueMap = computed(() => new Map(values.value.map((item) => [item.key, item])));

  function stopRefresh() {
    if (timer !== undefined) {
      clearInterval(timer);
    }
    timer = undefined;
  }

  async function refresh() {
    if (!device.value?.deviceId || loading.value || refreshing.value || submitting.value) {
      return;
    }
    const current = generation;
    const id = String(device.value.deviceId);
    refreshing.value = true;
    try {
      const [definitions, realtime] = await Promise.all([
        devices.getProductPropList({ prodId: productId.value }),
        devices.getEmergencyDevicePropertyValues({ deviceId: id }),
      ]);
      if (current !== generation) {
        return;
      }
      properties.value = definitions;
      values.value = realtime.propValList;
      error.value = "";
    } catch {
      if (current === generation) {
        error.value = "实时参数刷新失败，当前显示上次数据，请重试。";
      }
    } finally {
      if (current === generation) {
        refreshing.value = false;
      }
    }
  }

  async function load() {
    stopRefresh();
    const current = (generation += 1);
    properties.value = [];
    values.value = [];
    editor.value = undefined;
    error.value = "";
    productId.value = "";
    refreshing.value = false;
    submitting.value = false;
    loading.value = false;
    if (!device.value?.deviceId) {
      return;
    }
    const id = String(device.value.deviceId);
    loading.value = true;
    try {
      const detail = await devices.getDeviceDetail({ deviceId: id });
      if (current !== generation) {
        return;
      }
      if (!detail.productId) {
        throw new Error("设备缺少产品信息");
      }
      productId.value = String(detail.productId);
      const [definitions, realtime] = await Promise.all([
        devices.getProductPropList({ prodId: productId.value }),
        devices.getEmergencyDevicePropertyValues({ deviceId: id }),
      ]);
      if (current !== generation) {
        return;
      }
      properties.value = definitions;
      values.value = realtime.propValList;
      timer = setInterval(() => {
        if (!editor.value) {
          void refresh();
        }
      }, 5000);
    } catch {
      if (current === generation) {
        error.value = "设备属性加载失败，请重试。";
      }
    } finally {
      if (current === generation) {
        loading.value = false;
      }
    }
  }

  function edit(property: ProductProp) {
    if (property.dataWrite !== 1 || error.value || submitting.value) {
      return;
    }
    editor.value = property;
    input.value = "";
    editorError.value = "";
  }

  async function submit() {
    if (!editor.value || !device.value?.deviceId || submitting.value) {
      return;
    }
    const current = generation;
    const id = String(device.value.deviceId);
    const selected = editor.value;
    editorError.value = "";
    try {
      commandPropertyValue(selected, input.value);
    } catch (error) {
      editorError.value = error instanceof Error ? error.message : "属性值无效";
      return;
    }
    submitting.value = true;
    try {
      // 下发前重新读取物模型，避免弹窗打开期间读写权限或约束发生变化。
      const definitions = await devices.getProductPropList({ prodId: productId.value });
      if (current !== generation) {
        return;
      }
      properties.value = definitions;
      const latest = definitions.find((item) => item.propCode === selected.propCode);
      if (!latest) {
        throw new Error("该属性已不存在，请刷新设备属性");
      }
      const propValue = commandPropertyValue(latest, input.value);
      const receipt = await devices.issueEmergencyDevicePropertyCommand({
        commandSeq: `${Date.now()}${Math.floor(Math.random() * 1_000_000)
          .toString()
          .padStart(6, "0")}`,
        deviceId: id,
        propCode: latest.propCode!,
        propValue,
      });
      if (current !== generation) {
        return;
      }
      if (!["PROCESSING", "ACCEPT", "SUCCESS"].includes(receipt.statusCode)) {
        throw new Error(receipt.message || "设备未接受该指令");
      }
      editor.value = undefined;
      showNotify({ type: "success", message: receipt.statusCode === "SUCCESS" ? "设备指令执行成功" : "指令已提交，请关注设备实时值" });
    } catch (error) {
      if (current === generation) editorError.value = error instanceof Error ? error.message : "指令下发失败";
    } finally {
      if (current === generation) {
        submitting.value = false;
        if (!editor.value) {
          void refresh();
        }
      }
    }
  }

  watch(device, load, { immediate: true });
  onScopeDispose(() => {
    generation += 1;
    stopRefresh();
  });
  return { properties, valueMap, loading, refreshing, submitting, error, editor, input, editorError, load, refresh, edit, submit };
}
