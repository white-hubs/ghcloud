import { Empty, Loading } from "vant";
import { computed, defineComponent, onMounted, ref } from "vue";
import { useRoute } from "vue-router";

import type { DeviceInstanceDetail } from "@ghcloud/cube-iot-center-service";

import ScadaDeviceTab from "./scada-device-tab.vue";
import { cubeDeviceCenterService } from "@/api/server";
import { Bar } from "@/components/bar/bar";
import { useMetaTitle } from "@/hooks/use-meta-title-hook";

function normalizeRouteQueryValue(value: unknown): string {
  if (Array.isArray(value)) {
    return String(value[0] ?? "");
  }
  return value != null ? String(value) : "";
}

export const ScadaPage = defineComponent({
  setup() {
    useMetaTitle();
    const route = useRoute();
    const deviceDetail = ref<DeviceInstanceDetail | null>(null);
    const loading = ref(false);

    const deviceId = computed((): string => normalizeRouteQueryValue(route.query.deviceId || route.query.id));
    const productId = computed((): string => {
      const id = route.query.productId || deviceDetail.value?.productInfo?.id;
      return normalizeRouteQueryValue(id);
    });

    const loadDeviceDetail = async (): Promise<void> => {
      if (!deviceId.value || productId.value) {
        return;
      }
      loading.value = true;
      try {
        deviceDetail.value = await cubeDeviceCenterService.getDeviceInstanceDetail({ deviceId: deviceId.value });
      } catch {
        deviceDetail.value = null;
      } finally {
        loading.value = false;
      }
    };

    onMounted(() => {
      void loadDeviceDetail();
    });

    return (): JSX.Element => (
      <div>
        <Bar />
        <div style={{ padding: "8px 12px 12px" }}>
          {loading.value ? (
            <div style={{ display: "flex", justifyContent: "center", padding: "32px 0" }}>
              <Loading vertical>加载设备信息…</Loading>
            </div>
          ) : !deviceId.value ? (
            <Empty description="缺少设备标识 deviceId" />
          ) : !productId.value ? (
            <Empty description="当前设备未关联产品，无法匹配二维组态" />
          ) : (
            <ScadaDeviceTab deviceId={deviceId.value} productId={productId.value} />
          )}
        </div>
      </div>
    );
  },
});
