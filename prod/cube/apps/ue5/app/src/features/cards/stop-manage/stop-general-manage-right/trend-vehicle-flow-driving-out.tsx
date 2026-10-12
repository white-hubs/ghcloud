import { Spin } from "ant-design-vue";
import { defineComponent, onMounted, reactive, ref } from "vue";

import StackedLine from "@/features/panel-shell/charts/stacked-line/stacked-line";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { mapTrendPeriodLabels } from "@/infrastructure/utils/chart-axis-style";
import { getThemeImage } from "@/infrastructure/utils/getImage";
import { trafficFlowTrend } from "@/infrastructure/utils/requestData/parkingSpaceManage";
import CountTo from "@/shared-ui/panel/count-to/count-to";
import DateInlineForm from "@/shared-ui/panel/dateInlineForm";
import { ModelValueItf } from "@/shared-ui/panel/types";

import styles from "./trend-vehicle-flow-driving-out.module.less";

const exitIcon = getThemeImage("vehicle-exit.png");
const chartColors = ["#FF6E23"];

const TitleIcon = (): JSX.Element => (
  <span class="v2-title-icon" aria-hidden="true">
    <svg viewBox="0 0 24 24" class="v2-title-icon-svg">
      <path
        d="M4 18V6M4 18h16M7 14l3-3 3 2 5-6M16 7h3v3"
        fill="none"
        stroke="currentColor"
        stroke-width="1.8"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  </span>
);

export const TrendVehicleFlowDrivingOut = defineComponent({
  name: "TrendVehicleFlowDrivingOut",
  setup() {
    const loading = ref(false);
    const exitTotal = ref(0);
    const timeType = ref<ModelValueItf>({
      timeType: "THIS_YEAR",
      dateRange: [],
    });

    const lineData = reactive({
      title: "辆",
      xData: [] as string[],
      yData: [
        {
          data: [] as number[],
          name: "驶出",
          colors: [
            { offset: 0, color: "rgba(255, 110, 35, 0.28)" },
            { offset: 1, color: "rgba(255, 110, 35, 0)" },
          ],
        },
      ],
    });

    const loadData = async (): Promise<void> => {
      loading.value = true;
      try {
        const dimension = timeType.value?.timeType || "THIS_YEAR";
        const res = await trafficFlowTrend({ dimension });
        lineData.xData = mapTrendPeriodLabels(res?.xdata ?? [], dimension);
        const values = Array.isArray(res?.series?.[1]?.value) ? res.series[1].value : [];
        lineData.yData[0].data = values.map((item: number) => Number(item) || 0);
        exitTotal.value = Number(res?.series?.[1]?.total) || lineData.yData[0].data.reduce((sum, n) => sum + n, 0);
      } catch {
        lineData.xData = [];
        lineData.yData[0].data = [];
        exitTotal.value = 0;
      } finally {
        loading.value = false;
      }
    };

    onMounted(() => {
      void loadData();
    });

    const renderBody = (isZoom: boolean): JSX.Element => {
      if (loading.value) {
        return (
          <div class={[styles.loading, isZoom ? styles.isZoomLoading : ""]} data-no-zoom>
            <Spin size="large" tip="数据加载中..." />
          </div>
        );
      }

      return (
        <div class={[styles.cardBody, isZoom ? styles.isZoom : ""]} data-no-zoom>
          <div class={styles.statCard}>
            <span class={styles.statIcon} aria-hidden="true">
              <img src={exitIcon} alt="" />
            </span>
            <span class={styles.statContent}>
              <span class={styles.statLabel}>驶出总量</span>
              <span class={styles.statValueRow}>
                <span class={styles.statValue}>
                  <CountTo startVal={0} endVal={exitTotal.value} separator="" duration={1400} />
                </span>
                <span class={styles.statUnit}>辆</span>
              </span>
            </span>
          </div>
          <div class={[styles.chartPanel, isZoom ? styles.isZoomChart : ""]}>
            <StackedLine
              title={lineData.title}
              yData={lineData.yData}
              xData={lineData.xData}
              color={chartColors}
              gridTop={isZoom ? 42 : 38}
              zoomAnchor="start"
              scrollable={false}
              dataZoomSlider={false}
              visibleCount={lineData.xData.length || 6}
            />
          </div>
        </div>
      );
    };

    return (): JSX.Element => (
      <div class="v2-panel-root">
        <SubPanelTemplate
          title="车流驶出趋势"
          class="visual-v2-sub-panel v2-panel-card trend-vehicle-out-v2-panel"
          zoomable
          zoom-title="车流驶出趋势详情"
          zoom-width={960}
          v-slots={{
            titleIcon: () => <TitleIcon />,
            extra: () => (
              <div class={styles.headerToolbar} data-no-zoom>
                <DateInlineForm
                  modelValue={timeType.value}
                  onUpdate:modelValue={(v) => {
                    timeType.value = v;
                  }}
                  onSearch={loadData}
                />
              </div>
            ),
            default: () => renderBody(false),
            "zoom-content": () => renderBody(true),
          }}
        />
      </div>
    );
  },
});

export default TrendVehicleFlowDrivingOut;
