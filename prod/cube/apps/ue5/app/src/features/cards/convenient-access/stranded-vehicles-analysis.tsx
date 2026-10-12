import { computed, defineComponent, onMounted, reactive, ref } from "vue";

import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { vehicleAnalysisData } from "@/infrastructure/utils/requestData/parkingSpaceManage";
import LineAndPillar from "@/shared-ui/panel/charts/lineAndPillar/lineAndPillar";
import NoData from "@/shared-ui/panel/noData";
import PanelCardLoading from "@/shared-ui/panel/panel-card-loading";

import styles from "./stranded-vehicles-analysis.module.less";

const TitleIcon = (): JSX.Element => (
  <span class="v2-title-icon" aria-hidden="true">
    <svg viewBox="0 0 24 24" class="v2-title-icon-svg">
      <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2Zm1 5v5.2l3.6 2.1-.9 1.5L11 13V7h2Z" fill="currentColor" />
    </svg>
  </span>
);

export const StrandedVehiclesAnalysis = defineComponent({
  name: "StrandedVehiclesAnalysis",
  setup() {
    const loading = ref(true);
    const lineAndPillarData = reactive({
      title: "辆",
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

    const loadData = async (): Promise<void> => {
      loading.value = true;
      try {
        const res = await vehicleAnalysisData();
        lineAndPillarData.xdata = Array.isArray(res?.xdata) ? [...res.xdata] : [];
        lineAndPillarData.yData[0].data = Array.isArray(res?.series?.[0]?.value) ? [...res.series[0].value] : [];
        lineAndPillarData.yData[1].data = Array.isArray(res?.series?.[1]?.value) ? [...res.series[1].value] : [];
      } catch {
        lineAndPillarData.xdata = [];
        lineAndPillarData.yData[0].data = [];
        lineAndPillarData.yData[1].data = [];
      } finally {
        loading.value = false;
      }
    };

    onMounted(() => {
      void loadData();
    });

    const renderChart = (isZoom: boolean): JSX.Element => (
      <div class={[styles.chartShell, isZoom ? styles.isZoomChart : ""]}>
        {loading.value ? (
          <PanelCardLoading zoom={isZoom} />
        ) : isEmpty.value ? (
          <div class={styles.emptySurface}>
            <NoData />
          </div>
        ) : (
          <LineAndPillar title={lineAndPillarData.title} xData={lineAndPillarData.xdata} yData={lineAndPillarData.yData} />
        )}
      </div>
    );

    const renderBody = (isZoom: boolean): JSX.Element => (
      <div class={[styles.cardBody, isZoom ? styles.isZoom : ""]} data-no-zoom>
        {renderChart(isZoom)}
      </div>
    );

    return (): JSX.Element => (
      <div class="v2-panel-root">
        <SubPanelTemplate
          title="滞留车辆分析"
          class="visual-v2-sub-panel v2-panel-card stranded-vehicles-analysis-v2-panel"
          zoomable
          zoom-title="滞留车辆分析详情"
          zoom-width={960}
          v-slots={{
            titleIcon: () => <TitleIcon />,
            default: () => renderBody(false),
            "zoom-content": () => renderBody(true),
          }}
        />
      </div>
    );
  },
});

export default StrandedVehiclesAnalysis;
