import { Loading, Tab, Tabs } from "vant";
import { computed, defineComponent, onMounted, ref } from "vue";
import { useRoute } from "vue-router";

import type { DeviceInstanceDetail } from "@ghcloud/cube-iot-center-service";
import { CubePlayer } from "@ghcloud/cube-player";

import { DeviceMonitor } from "../device-monitor/device-monitor";
import { History } from "../history/history";
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

export const MonitorDetail = defineComponent({
  setup() {
    useMetaTitle();
    const route = useRoute();
    const activeTab = ref(normalizeRouteQueryValue(route.query.tab) || "");
    const videoList = ref<unknown[]>([]);
    const deviceDetail = ref<DeviceInstanceDetail | null>(null);
    const detailLoading = ref(true);
    const routeDeviceId = computed((): string => normalizeRouteQueryValue(route.query.deviceId || route.query.id));

    const productId = computed((): string => {
      const id = route.query.productId || deviceDetail.value?.productInfo?.id;
      return id != null && id !== "" ? String(id) : "";
    });

    const getVideoData = async (id: number): Promise<void> => {
      try {
        await cubeDeviceCenterService.getDeviceAssociatedVideos(id).then((res) => {
          videoList.value = [...videoList.value, ...(res as unknown[])];
        });
      } catch {}
    };

    const loadDeviceDetail = async (): Promise<void> => {
      const id = routeDeviceId.value;
      if (!id) {
        detailLoading.value = false;
        return;
      }
      try {
        deviceDetail.value = await cubeDeviceCenterService.getDeviceInstanceDetail({ deviceId: id });
      } catch {
        deviceDetail.value = null;
      } finally {
        detailLoading.value = false;
      }
    };

    onMounted(() => {
      void getVideoData(routeDeviceId.value as unknown as number);
      void loadDeviceDetail();
    });

    return (): JSX.Element => {
      const deviceId = routeDeviceId.value;
      const showScadaTab = activeTab.value === "scada";

      return (
        <>
          <Bar />
          <Tabs v-model:active={activeTab.value} style={{ border: "none" }}>
            <Tab key="realTime" name="realTime" title="实时数据">
              <DeviceMonitor />
            </Tab>
            <Tab key="history" name="history" title="历史数据">
              <History />
            </Tab>
            <Tab key="scada" name="scada" title="二维组态">
              {showScadaTab && detailLoading.value ? (
                <div style={{ display: "flex", justifyContent: "center", padding: "32px 0" }}>
                  <Loading vertical>加载设备信息…</Loading>
                </div>
              ) : showScadaTab && !deviceId ? (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    minHeight: "160px",
                    color: "rgba(0,0,0,0.45)",
                    padding: "16px",
                  }}
                >
                  缺少设备标识
                </div>
              ) : showScadaTab && !productId.value ? (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    minHeight: "160px",
                    color: "rgba(0,0,0,0.45)",
                    padding: "16px",
                    textAlign: "center",
                  }}
                >
                  当前设备未关联产品，无法匹配二维组态
                </div>
              ) : showScadaTab ? (
                <ScadaDeviceTab deviceId={deviceId} productId={productId.value} />
              ) : null}
            </Tab>
            <Tab key="monitor" name="monitor" title="关联监控">
              <div style={{ height: "180px" }}>
                {videoList.value?.map((v) => (v as { id: string }).id && <CubePlayer deviceId={(v as { id: string }).id} control={true} />)}
                {videoList.value?.length === 0 && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      height: "100%",
                      width: "100%",
                      justifyContent: "center",
                      color: "rgba(0,0,0,0.3)",
                    }}
                  >
                    该设备暂无关联监控
                  </div>
                )}
              </div>
            </Tab>
          </Tabs>
        </>
      );
    };
  },
});
