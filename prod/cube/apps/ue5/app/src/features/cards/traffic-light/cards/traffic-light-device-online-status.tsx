import { defineComponent, onBeforeUnmount, onMounted, ref, watch } from "vue";

import stackedBarChart from "@/features/cards/Information-release/stacked-bar-chart";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { statusNum } from "@/infrastructure/api/securitymanagement";
import { getThemeImage } from "@/infrastructure/utils/getImage";
import { useStateStore } from "@/visualization-core/stores/use-state-store";

import "./traffic-light-device-online-status.module.less";

const deviceSituationIcon = getThemeImage("device-situation.png");

export const TrafficLightDeviceOnlineStatus = defineComponent({
  name: "TrafficLightDeviceOnlineStatus",
  props: {
    title: { type: String, default: "设备在线情况" },
  },
  setup(props) {
    const { globalState } = useStateStore();
    const barXData = ref<string[]>([]);
    const barYData = ref<{ name: string; data: number[]; color: string }[]>([
      { name: "正常", data: [], color: "#2AE8BD" },
      { name: "离线", data: [], color: "#2989FF" },
    ]);
    let timer: ReturnType<typeof setInterval> | null = null;

    const getStatusNum = async (): Promise<void> => {
      const res = await statusNum({ applicationCode: "TRAFFIC_LIGHT_SYS" });
      barXData.value = res.areaStatusNum.map((item) => item.areaName);
      barYData.value[0].data = res.areaStatusNum.map((item) => item.onNum);
      barYData.value[1].data = res.areaStatusNum.map((item) => item.offlineNum);
    };

    const init = (): void => {
      void getStatusNum();
    };

    watch(
      () => globalState.business.currentAreaId,
      () => {
        if (timer) clearInterval(timer);
        timer = setInterval(
          () => {
            init();
          },
          (window as Window & { config?: { pageLoopRequestTime?: number } }).config?.pageLoopRequestTime ?? 60000,
        );
        init();
      },
    );

    onMounted(() => {
      init();
      timer = setInterval(
        () => {
          init();
        },
        (window as Window & { config?: { pageLoopRequestTime?: number } }).config?.pageLoopRequestTime ?? 60000,
      );
    });

    onBeforeUnmount(() => {
      if (timer) clearInterval(timer);
    });

    const renderBody = (isZoom: boolean): JSX.Element => (
      <div class={["traffic-light-online-status-v2", "traffic-light-online-status-v2-panel", isZoom ? "is-zoom" : ""]}>
        <div class={["v2-chart-panel", isZoom ? "is-zoom" : ""]} data-no-zoom>
          <stackedBarChart x-data={barXData.value} y-data={barYData.value} />
        </div>
      </div>
    );

    return (): JSX.Element => (
      <div class="v2-panel-root traffic-light-online-status-v2-root">
        <SubPanelTemplate
          title={props.title}
          class="visual-v2-sub-panel v2-panel-card traffic-light-online-status-v2-panel"
          zoomable
          zoom-title={`${props.title}详情`}
          zoom-width={760}
          v-slots={{
            titleIcon: () => <img src={deviceSituationIcon} alt="" class="title-icon-img" />,
            default: () => renderBody(false),
            "zoom-content": () => renderBody(true),
          }}
        />
      </div>
    );
  },
});

export default TrafficLightDeviceOnlineStatus;
