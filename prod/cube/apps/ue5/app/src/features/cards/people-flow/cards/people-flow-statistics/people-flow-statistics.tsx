import { computed, defineComponent, onMounted, reactive, ref } from "vue";

import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { cubeTrafficStatisticsService } from "@/infrastructure/api/service";
import { mapTrendPeriodLabels } from "@/infrastructure/utils/chart-axis-style";
import { getThemeImage } from "@/infrastructure/utils/getImage";
import CountTo from "@/shared-ui/panel/count-to/count-to";
import DateInlineForm from "@/shared-ui/panel/dateInlineForm";
import LineChart from "@/shared-ui/panel/lineChart";
import NoData from "@/shared-ui/panel/noData";

import "./people-flow-statistics.module.less";

const passengerFlowAnalysisIcon = getThemeImage("passenger-flow-analysis.png");
const metricIcon = getThemeImage("cumulative-person-times.png");

export const PeopleFlowStatistics = defineComponent({
  name: "PeopleFlowStatistics",
  setup() {
    const through = ref({
      timeType: "TODAY",
      dateRange: [] as string[],
    });
    const numberPasses = ref(0);
    const echartsData = reactive({
      xData: [] as string[],
      yData: [] as number[],
    });

    const chartSeries = computed(() => [
      {
        name: "人流量",
        data: echartsData.yData,
        lineColor: "#568EFF",
        linearGradientColor: ["rgba(86, 142, 255, 0.55)", "rgba(86, 142, 255, 0)"],
        smooth: true,
        showSymbol: true,
        symbolSize: 6,
      },
    ]);

    const chartUnit = { x: "", y: "人次" };

    const getData = async (): Promise<void> => {
      try {
        const params = {
          type: through.value.timeType,
          period: through.value.dateRange.join(","),
        };
        const result = await Promise.all([
          cubeTrafficStatisticsService.getTrafficPersonStatistics(params),
          cubeTrafficStatisticsService.getTrafficTrendStat(params),
        ]);
        numberPasses.value = result[0]?.totalNumber ?? 0;
        echartsData.xData = mapTrendPeriodLabels(result[1]?.map((e) => e?.period) ?? [], through.value.timeType);
        echartsData.yData = result[1]?.map((e) => e?.totalPersonNumber) ?? [];
      } catch {}
    };

    onMounted(() => {
      void getData();
    });

    const renderBody = (isZoom: boolean): JSX.Element => (
      <div class={["people-flow-statistics-v2", "people-flow-statistics-v2-panel", "v2-panel-body", isZoom ? "is-zoom" : ""]}>
        <div class={["metric-banner", isZoom ? "is-zoom" : ""]} data-no-zoom>
          <div class="metric-banner-glow" aria-hidden="true" />
          <div class="metric-banner-inner">
            <div class="metric-icon" aria-hidden="true">
              <img src={metricIcon} alt="" class="metric-icon-svg" />
            </div>
            <div class="metric-content">
              <span class="metric-label">人流量数</span>
              <div class="metric-value-row">
                <span class={["v2-metric-value", "metric-value", isZoom ? "is-zoom-value" : ""]}>
                  <CountTo startVal={0} endVal={numberPasses.value} separator="" duration={2200} />
                </span>
                <span class={["metric-unit", isZoom ? "is-zoom-unit" : ""]}>人次</span>
              </div>
            </div>
          </div>
        </div>
        <div class={["v2-chart-panel", "chart-panel", isZoom ? "is-zoom" : ""]} data-no-zoom>
          {echartsData.xData.length ? (
            <LineChart
              x-data={echartsData.xData}
              series={chartSeries.value}
              unit={chartUnit}
              showLegend={false}
              height={isZoom ? 380 : undefined}
              scrollable={false}
              visible-count={echartsData.xData.length || 6}
              x-axis-label-rotate-threshold={8}
            />
          ) : (
            <NoData />
          )}
        </div>
      </div>
    );

    return () => (
      <div class="people-flow-statistics-v2-root v2-panel-root">
        <SubPanelTemplate
          title="人流量分析"
          class="visual-v2-sub-panel people-flow-statistics-v2-panel v2-panel-card"
          zoomable
          zoom-title="人流量分析详情"
          zoom-width={720}
          v-slots={{
            titleIcon: () => <img src={passengerFlowAnalysisIcon} alt="" class="title-card-icon" />,
            extra: () => <DateInlineForm v-model:modelValue={through.value} data-no-zoom onSearch={getData} />,
            "zoom-content": () => renderBody(true),
          }}
        >
          {renderBody(false)}
        </SubPanelTemplate>
      </div>
    );
  },
});
