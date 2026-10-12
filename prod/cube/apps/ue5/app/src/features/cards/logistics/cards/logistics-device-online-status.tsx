import { computed, defineComponent, onBeforeUnmount, onMounted, ref, watch, provide } from "vue";

import stackedBarChart from "@/features/cards/Information-release/stacked-bar-chart";
import UniversalPanelCardIcon from "@/features/cards/universal-panel/_shared/universal-panel-card-icon";
import { UNIVERSAL_PANEL_V2_CLASS, universalPanelZoomClass } from "@/features/cards/universal-panel/_shared/universal-panel-v2";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { statusNum } from "@/infrastructure/api/securitymanagement";
import NoData from "@/shared-ui/panel/noData";
import { panelCardLoadedKey } from "@/shared-ui/panel/panel-card-loaded-context";
import PanelCardLoading from "@/shared-ui/panel/panel-card-loading";
import { useStateStore } from "@/visualization-core/stores/use-state-store";

import "@/features/cards/universal-panel/_shared/universal-panel-v2-shared.less";

import styles from "./logistics-device-online-status.module.less";

type BarSeries = { name: string; data: number[]; color: string };

export const LogisticsDeviceOnlineStatus = defineComponent({
  name: "LogisticsDeviceOnlineStatus",
  props: {
    title: { type: String, default: "设备在线情况" },
  },
  setup(props) {
    const { globalState } = useStateStore();
    const loaded = ref(false);
    provide(panelCardLoadedKey, loaded);
    const barXData = ref<string[]>([]);
    const barYData = ref<BarSeries[]>([
      { name: "正常", data: [], color: "#2AE8BD" },
      { name: "离线", data: [], color: "#2989FF" },
    ]);
    let timer: ReturnType<typeof setInterval> | null = null;

    const hasStructure = computed(() => barXData.value.length > 0);

    const getStatusNum = async (): Promise<void> => {
      try {
        const res: any = await statusNum({ applicationCode: "LOGISTICS" });
        const rows = Array.isArray(res?.areaStatusNum) ? res.areaStatusNum : [];
        barXData.value = rows.map((item: { areaName?: string }) => String(item.areaName ?? ""));
        barYData.value = [
          {
            name: "正常",
            data: rows.map((item: { onNum?: number }) => Number(item.onNum) || 0),
            color: "#2AE8BD",
          },
          {
            name: "离线",
            data: rows.map((item: { offlineNum?: number }) => Number(item.offlineNum) || 0),
            color: "#2989FF",
          },
        ];
      } catch {
        barXData.value = [];
        barYData.value = [
          { name: "正常", data: [], color: "#2AE8BD" },
          { name: "离线", data: [], color: "#2989FF" },
        ];
      } finally {
        loaded.value = true;
      }
    };

    const startLoop = (): void => {
      if (timer) clearInterval(timer);
      void getStatusNum();
      timer = setInterval(
        () => {
          void getStatusNum();
        },
        (window as Window & { config?: { pageLoopRequestTime?: number } }).config?.pageLoopRequestTime ?? 60000,
      );
    };

    watch(
      () => globalState.business.currentAreaId,
      () => {
        startLoop();
      },
    );

    onMounted(() => {
      startLoop();
    });

    onBeforeUnmount(() => {
      if (timer) clearInterval(timer);
    });

    const renderBody = (isZoom: boolean): JSX.Element => (
      <div class={[styles.cardBody, isZoom ? styles.isZoom : "", ...(isZoom ? universalPanelZoomClass : [])]} data-no-zoom>
        {!loaded.value ? (
          <PanelCardLoading zoom={isZoom} />
        ) : !hasStructure.value ? (
          <div class={styles.emptySurface}>
            <NoData />
          </div>
        ) : (
          <div class={[styles.chartPanel, isZoom ? styles.isZoom : ""]}>
            <stackedBarChart x-data={barXData.value} y-data={barYData.value} />
          </div>
        )}
      </div>
    );

    return (): JSX.Element => (
      <div class="v2-panel-root">
        <SubPanelTemplate
          title={props.title}
          class={`${UNIVERSAL_PANEL_V2_CLASS} logistics-device-online-status-v2-panel`}
          zoomable
          zoom-title={`${props.title}详情`}
          zoom-width={760}
          v-slots={{
            titleIcon: () => <UniversalPanelCardIcon name="device" />,
            default: () => renderBody(false),
            "zoom-content": () => renderBody(true),
          }}
        />
      </div>
    );
  },
});

export default LogisticsDeviceOnlineStatus;
