import { defineComponent, onMounted, reactive, ref } from "vue";

import CardTitleIcon from "@/features/cards/_shared/card-title-icon/card-title-icon";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { recordTrend } from "@/infrastructure/api/broadcast";
import DateInlineForm from "@/shared-ui/panel/dateInlineForm";
import LineChart from "@/shared-ui/panel/lineChart";
import { ModelValueItf } from "@/shared-ui/panel/types";
import { useStateStore } from "@/visualization-core/stores/use-state-store";

import styles from "./record-trend.module.less";

const LINE_COLOR = "#2989FF";

export const RecordTrend = defineComponent({
  name: "RecordTrend",
  setup() {
    const { globalState } = useStateStore();
    const alarmTypeTime = ref<ModelValueItf>({
      timeType: "TODAY",
      dateRange: [],
    });
    const chartData = reactive<{ xData: string[]; yData: number[] }>({
      xData: [],
      yData: [],
    });

    const areaAlarmStatistic = async (): Promise<void> => {
      const params = {
        type: alarmTypeTime.value.timeType,
        period: alarmTypeTime.value.dateRange.join(","),
        sceneType: globalState.business.currentMenu,
        areaId: globalState.business.currentAreaId,
      };
      try {
        const res = await recordTrend(params);
        const rows = Array.isArray(res) ? res : [];
        chartData.xData = rows.map((item: any) => String(item.timeFlag ?? ""));
        chartData.yData = rows.map((item: any) => Number(item.num) || 0);
      } catch {
        chartData.xData = [];
        chartData.yData = [];
      }
    };

    onMounted(() => {
      void areaAlarmStatistic();
    });

    const renderBody = (isZoom: boolean): JSX.Element => (
      <div class={[styles.cardBody, isZoom ? styles.isZoom : ""]} data-no-zoom>
        <div class={[styles.chartSurface, isZoom ? styles.isZoomChart : ""]}>
          <LineChart
            x-data={chartData.xData}
            series={[
              {
                name: "播放次数",
                data: chartData.yData,
                smooth: true,
                showSymbol: false,
                symbolSize: 5,
                lineColor: LINE_COLOR,
                linearGradientColor: ["rgba(41, 137, 255, 0.42)", "rgba(41, 137, 255, 0)"],
              },
            ]}
            colors={[LINE_COLOR]}
            showLegend={false}
            gridTop="28"
            gridLeft="4"
            gridRight="4"
            gridBottom="10"
            unit={{ x: "", y: "次" }}
            axisPointer
            height={isZoom ? 360 : 198}
          />
        </div>
      </div>
    );

    return (): JSX.Element => (
      <div class="v2-panel-root">
        <SubPanelTemplate
          title="广播记录趋势"
          class="visual-v2-sub-panel v2-panel-card broadcast-record-trend-v2-panel"
          zoomable
          zoom-title="广播记录趋势详情"
          zoom-width={1000}
          v-slots={{
            titleIcon: () => <CardTitleIcon name="broadcast-trend" />,
            extra: () => (
              <div class={styles.headerToolbar} data-no-zoom>
                <DateInlineForm
                  modelValue={alarmTypeTime.value}
                  onUpdate:modelValue={(v) => {
                    alarmTypeTime.value = v;
                  }}
                  onSearch={areaAlarmStatistic}
                />
              </div>
            ),
            "zoom-content": () => renderBody(true),
            default: () => renderBody(false),
          }}
        />
      </div>
    );
  },
});

export default RecordTrend;
