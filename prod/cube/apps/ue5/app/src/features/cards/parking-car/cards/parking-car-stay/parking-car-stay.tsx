import { computed, defineComponent, onMounted, reactive, ref } from "vue";

import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { cubeParkingLotService } from "@/infrastructure/api/service";
import LineAndPillar from "@/shared-ui/panel/charts/lineAndPillar/lineAndPillar";
import NoData from "@/shared-ui/panel/noData";
import PanelCardLoading from "@/shared-ui/panel/panel-card-loading";

import "./parking-car-stay.module.less";

const TitleIcon = (): JSX.Element => (
  <span class="v2-title-icon" aria-hidden="true">
    <svg viewBox="0 0 24 24" class="v2-title-icon-svg">
      <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2Zm1 5v5.2l3.6 2.1-.9 1.5L11 13V7h2Z" fill="currentColor" />
    </svg>
  </span>
);

export const ParkingCarStay = defineComponent({
  name: "ParkingCarStay",
  setup() {
    const loading = ref(true);

    const lineAndPillarData = reactive({
      title: "滞留车辆数",
      xdata: [] as string[],
      yData: [
        {
          name: "滞留车辆数",
          type: "bar",
          data: [] as number[],
          color: "#FFB020",
        },
        {
          name: "滞留车辆占比",
          type: "line",
          data: [] as number[],
          color: "#2989FF",
        },
      ],
    });

    const isEmpty = computed(() => {
      const hasX = lineAndPillarData.xdata.length > 0;
      const hasSeries = lineAndPillarData.yData.some((series) => Array.isArray(series.data) && series.data.length > 0);
      return !hasX && !hasSeries;
    });

    const stayCarData = async (): Promise<void> => {
      loading.value = true;
      try {
        const res = await cubeParkingLotService.getRetentionTrafficTrend();
        const xdata = (res as any)?.xdata ?? (res as any)?.xData ?? [];
        const series = (res as any)?.series ?? [];
        lineAndPillarData.xdata = Array.isArray(xdata) ? [...xdata] : [];
        lineAndPillarData.yData[0].data = Array.isArray(series[0]?.value)
          ? [...series[0].value]
          : Array.isArray(series[0]?.data)
            ? [...series[0].data]
            : [];
        lineAndPillarData.yData[1].data = Array.isArray(series[1]?.value)
          ? [...series[1].value]
          : Array.isArray(series[1]?.data)
            ? [...series[1].data]
            : [];
      } catch {
        lineAndPillarData.xdata = [];
        lineAndPillarData.yData[0].data = [];
        lineAndPillarData.yData[1].data = [];
      } finally {
        loading.value = false;
      }
    };

    onMounted(() => {
      stayCarData();
    });

    const renderChart = (isZoom: boolean): JSX.Element => (
      <div class={["v2-chart-panel", "chart-panel", "stay-chart-shell", isZoom ? "is-zoom" : ""]}>
        {loading.value ? (
          <PanelCardLoading zoom={isZoom} />
        ) : isEmpty.value ? (
          <NoData class="stay-empty" />
        ) : (
          <LineAndPillar title={lineAndPillarData.title} xData={lineAndPillarData.xdata} yData={lineAndPillarData.yData} />
        )}
      </div>
    );

    const renderBody = (isZoom: boolean): JSX.Element => (
      <div class={["v2-panel-body", isZoom ? "parking-stay-v2-panel is-zoom" : ""]} data-no-zoom>
        {renderChart(isZoom)}
      </div>
    );

    return () => (
      <div class="v2-panel-root parking-stay-v2-root">
        <SubPanelTemplate
          title="滞留车辆分析"
          class="visual-v2-sub-panel v2-panel-card parking-stay-v2-panel"
          zoomable
          zoom-title="滞留车辆分析详情"
          zoom-width={1200}
          v-slots={{
            titleIcon: () => <TitleIcon />,
            "zoom-content": () => renderBody(true),
            default: () => renderBody(false),
          }}
        />
      </div>
    );
  },
});

export default ParkingCarStay;
