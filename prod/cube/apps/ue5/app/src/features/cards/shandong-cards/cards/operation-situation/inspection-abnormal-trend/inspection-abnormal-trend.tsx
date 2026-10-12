import { defineComponent, onMounted, ref, provide } from "vue";

import { InspectTaskTrendVo } from "@ghcloud/cube-maintain-service";

import CardTitleIcon from "@/features/cards/_shared/card-title-icon/card-title-icon";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { cubeMaintainStatisticsService } from "@/infrastructure/api/service";
import { generateXAxisData } from "@/infrastructure/utils/common";
import DateInlineForm, { ModelValueItf } from "@/shared-ui/panel/dateInlineForm";
import LineChart from "@/shared-ui/panel/lineChart";
import NoData from "@/shared-ui/panel/noData";
import { panelCardLoadedKey } from "@/shared-ui/panel/panel-card-loaded-context";
import PanelCardLoading from "@/shared-ui/panel/panel-card-loading";

import styles from "./inspection-abnormal-trend.module.less";

export const InspectionAbnormalTrend = defineComponent({
  name: "InspectionAbnormalTrend",
  setup() {
    const timeRange = ref<ModelValueItf>({
      timeType: "THIS_MONTH",
      dateRange: [],
    });
    const resultData = ref<InspectTaskTrendVo[]>([]);
    const xData = ref<string[]>([]);
    const exceptionData = ref<number[]>([]);
    const inspectData = ref<number[]>([]);
    const loaded = ref(false);
    provide(panelCardLoadedKey, loaded);

    const getData = async (): Promise<void> => {
      loaded.value = false;
      try {
        const result = await cubeMaintainStatisticsService.getPatrolTaskTrend({
          type: timeRange.value.timeType,
          period: timeRange.value.dateRange?.join(",") ?? "",
        });
        const rows = Array.isArray(result) ? result : [];
        const xAxisData = generateXAxisData(timeRange.value.timeType);
        const mappedExceptionValues = Array.from({ length: xAxisData.length }, () => 0);
        const mappedInspectValues = Array.from({ length: xAxisData.length }, () => 0);

        rows.forEach((item) => {
          let index = -1;
          switch (timeRange.value.timeType) {
            case "TODAY":
              index = Number.parseInt(String(item.date ?? "").split(":")[0] || "", 10);
              break;
            case "THIS_WEEK":
            case "THIS_MONTH":
            case "THIS_YEAR":
              index = Number.parseInt(String(item.date ?? ""), 10) - 1;
              break;
            default:
              break;
          }

          if (index >= 0 && index < mappedExceptionValues.length) {
            mappedExceptionValues[index] = Number(item.exceptionNum) || 0;
            mappedInspectValues[index] = Number(item.inspectNum) || 0;
          }
        });

        resultData.value = rows;
        xData.value = xAxisData;
        exceptionData.value = mappedExceptionValues;
        inspectData.value = mappedInspectValues;
      } catch {
        resultData.value = [];
        xData.value = [];
        exceptionData.value = [];
        inspectData.value = [];
      } finally {
        loaded.value = true;
      }
    };

    onMounted(() => {
      void getData();
    });

    const renderBody = (isZoom: boolean): JSX.Element => (
      <div class={[styles.cardBody, isZoom ? styles.zoomBody : ""]} data-no-zoom>
        {!loaded.value ? (
          <PanelCardLoading zoom={isZoom} />
        ) : resultData.value.length === 0 ? (
          <div class={styles.emptySurface}>
            <NoData />
          </div>
        ) : (
          <div class={styles.chartSurface}>
            <LineChart
              unit={{ x: "", y: "个" }}
              gridTop={isZoom ? "28" : "26"}
              gridBottom={isZoom ? "10" : "8"}
              x-data={xData.value}
              series={[
                {
                  name: "异常数",
                  data: exceptionData.value,
                  lineColor: "#F14545",
                  linearGradientColor: ["rgba(241, 69, 69, 0.62)", "rgba(241, 69, 69, 0)"],
                },
                {
                  name: "任务总数",
                  data: inspectData.value,
                  lineColor: "#2B7FFF",
                  linearGradientColor: ["rgba(43, 127, 255, 0.55)", "rgba(43, 127, 255, 0)"],
                },
              ]}
              titles={["异常数", "任务总数"]}
              showLegend
              axisPointer
              visibleCount={6}
              scrollable
              dataZoomSlider={false}
            />
          </div>
        )}
      </div>
    );

    return (): JSX.Element => (
      <div class="v2-panel-root">
        <SubPanelTemplate
          title="巡检异常趋势"
          class="visual-v2-sub-panel v2-panel-card inspection-abnormal-trend-v2-panel"
          zoomable
          zoom-title="巡检异常趋势详情"
          zoom-width={900}
          v-slots={{
            titleIcon: () => <CardTitleIcon name="overview-patrol" />,
            extra: () => (
              <div class={styles.headerToolbar} data-no-zoom>
                <DateInlineForm
                  modelValue={timeRange.value}
                  onUpdate:modelValue={(value) => {
                    timeRange.value = value;
                  }}
                  onSearch={getData}
                  timeList={[
                    { label: "本周", value: "THIS_WEEK" },
                    { label: "本月", value: "THIS_MONTH" },
                    { label: "今年", value: "THIS_YEAR" },
                  ]}
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

export default InspectionAbnormalTrend;
