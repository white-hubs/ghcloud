import { defineComponent, onMounted, reactive, ref } from "vue";

import CardTitleIcon from "@/features/cards/_shared/card-title-icon/card-title-icon";
import { BOILER_PANEL_CLASS, boilerZoomClass } from "@/features/cards/boiler/_shared/boiler-panel-context";
import OverviewChartBar from "@/features/cards/hospital/overview-chartBar";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { getBoilerOverTemperStatistics } from "@/infrastructure/api/securitymanagement";
import ElevatorAnalysisPie from "@/shared-ui/panel/charts/pie/elevator-analysis-pie";
import CountTo from "@/shared-ui/panel/count-to/count-to";
import DateInlineForm from "@/shared-ui/panel/dateInlineForm";
import NoData from "@/shared-ui/panel/noData";
import { ModelValueItf } from "@/shared-ui/panel/types";
import { useStateStore } from "@/visualization-core/stores/use-state-store";

import "../_shared/boiler-v2-shared.module.less";

import styles from "./over-temperature-stats.module.less";

const COLOR_LIST = ["#F14545", "#FFAB10", "#328BF7", "#19F8F7", "#FF6E23"];

type OverTempItem = {
  name: string;
  value: number;
  color: string;
  percent: number;
};

export const OverTemperatureStats = defineComponent({
  name: "OverTemperatureStats",
  setup() {
    const { globalState } = useStateStore();
    const transactionTime = ref<ModelValueItf>({
      timeType: "TODAY",
      dateRange: [],
    });
    const barData = reactive({
      xData: [] as string[],
      yData: [
        {
          data: [] as number[],
          name: "超温次数",
          color: ["rgba(241, 69, 69, 0.85)", "rgba(241, 69, 69, 0)"],
        },
      ],
    });
    const overTemperData = ref<OverTempItem[]>([]);
    const temperatureAlarmTotal = ref(0);

    const changeTransactionTime = async (): Promise<void> => {
      const param = {
        sceneType: globalState.business.currentMenu,
        period: transactionTime.value.dateRange.join(","),
        type: transactionTime.value.timeType,
      };
      try {
        const result = await getBoilerOverTemperStatistics(param);
        const xtitle = Array.isArray(result?.xtitle) ? result.xtitle : [];
        const timeGroup = Array.isArray(result?.timeGroupStatistics) ? result.timeGroupStatistics : [];
        const deviceStats = Array.isArray(result?.deviceStatistics) ? result.deviceStatistics : [];
        barData.xData = xtitle;
        barData.yData[0].data = xtitle.map((xItem: string) => {
          const hit = timeGroup.find((item: any) => item.dateFlag === xItem);
          return Number(hit?.alarmNum) || 0;
        });
        let total = 0;
        const mapped = deviceStats.map((item: any, index: number) => {
          const value = Number(item.alarmNum) || 0;
          total += value;
          return {
            name: String(item.deviceName || "--"),
            value,
            color: COLOR_LIST[index % COLOR_LIST.length],
            percent: 0,
          };
        });
        const base = total || 1;
        overTemperData.value = mapped.map((item) => ({
          ...item,
          percent: Math.round((item.value / base) * 1000) / 10,
        }));
        temperatureAlarmTotal.value = total;
      } catch {
        barData.xData = [];
        barData.yData[0].data = [];
        overTemperData.value = [];
        temperatureAlarmTotal.value = 0;
      }
    };

    onMounted(() => {
      void changeTransactionTime();
    });

    const renderBody = (isZoom: boolean): JSX.Element => (
      <div class={[styles.body, "boiler-card-body", isZoom ? boilerZoomClass : ""]} data-no-zoom>
        <div class={styles.pieSurface}>
          <div class={styles.chartWrap}>
            <ElevatorAnalysisPie pieData={overTemperData.value}>
              <div class={styles.pieCenterValue}>
                <CountTo startVal={0} endVal={temperatureAlarmTotal.value} separator="" duration={1600} />
              </div>
              <div class={styles.pieCenterLabel}>超温总数</div>
            </ElevatorAnalysisPie>
          </div>
          <div class={styles.levelList}>
            {overTemperData.value.length ? (
              overTemperData.value.map((item) => (
                <div class={styles.levelItem} key={item.name}>
                  <span class={styles.levelTop}>
                    <span class={styles.levelName}>{item.name}</span>
                    <span class={styles.levelCount}>{item.value}</span>
                  </span>
                  <span class={styles.levelBarRow}>
                    <span class={styles.levelColor} style={{ background: item.color }} />
                    <span class={styles.levelBarTrack}>
                      <span
                        class={styles.levelBarFill}
                        style={{
                          width: `${Math.max(item.percent, item.value > 0 ? 4 : 0)}%`,
                          background: `linear-gradient(90deg, ${item.color}, ${item.color}88)`,
                        }}
                      />
                    </span>
                  </span>
                  <span class={styles.levelShare}>占比 {item.percent}%</span>
                </div>
              ))
            ) : (
              <div class={styles.emptyHint}>
                <NoData />
              </div>
            )}
          </div>
        </div>
        <div class={[styles.barChart, "boiler-chart-surface", isZoom ? styles.zoomBarChart : ""]}>
          <OverviewChartBar bottom="0%" title="次" gridTop={28} xData={barData.xData} yData={barData.yData} />
        </div>
      </div>
    );

    return (): JSX.Element => (
      <div class="boiler-v2-root v2-panel-root">
        <SubPanelTemplate
          title="超温统计"
          class={BOILER_PANEL_CLASS}
          zoomable
          zoom-title="超温统计详情"
          zoom-width={1000}
          v-slots={{
            titleIcon: () => <CardTitleIcon name="boiler-over-temperature" />,
            extra: () => (
              <div class="boiler-header-toolbar" data-no-zoom>
                <DateInlineForm
                  modelValue={transactionTime.value}
                  onUpdate:modelValue={(v) => {
                    transactionTime.value = v;
                  }}
                  onSearch={changeTransactionTime}
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

export default OverTemperatureStats;
