import { computed, defineComponent, onMounted, reactive, ref, provide } from "vue";

import CardTitleIcon from "@/features/cards/_shared/card-title-icon/card-title-icon";
import overviewChartBar from "@/features/cards/hospital/overview-chartBar";
import stackedLine from "@/features/panel-shell/charts/stacked-line/stacked-line";
import GridContainer from "@/features/panel-shell/metrics/grid-container/grid-container";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { statisticsStatus } from "@/infrastructure/api/alarm";
import { deviceAlarmArea, deviceAlarmTrend } from "@/infrastructure/api/device";
import DateInlineForm from "@/shared-ui/panel/dateInlineForm";
import NoData from "@/shared-ui/panel/noData";
import { panelCardLoadedKey } from "@/shared-ui/panel/panel-card-loaded-context";
import PanelCardLoading from "@/shared-ui/panel/panel-card-loading";
import { ModelValueItf } from "@/shared-ui/panel/types";
import { useStateStore } from "@/visualization-core/stores/use-state-store";

import styles from "./alarm-trend.module.less";

const COLOR_LIST = ["#2AE8BD", "#99C7FF", "#FFC700", "#F14545"];

export const AlarmTrend = defineComponent({
  name: "AlarmTrend",
  emits: ["open-modal"],
  setup(_props, { emit }) {
    const { globalState } = useStateStore();
    const topTimeFrame = ref<ModelValueItf>({
      timeType: "TODAY",
      dateRange: [],
    });
    const alarmTrend = ref("trend");
    const alarmStatusData = ref<any[]>([]);
    const loaded = ref(false);
    provide(panelCardLoadedKey, loaded);
    const lineData = reactive({
      title: "次",
      xData: [] as string[],
      yData: [] as any[],
    });
    const barData = reactive({
      xData: [] as string[],
      yData: [] as any[],
    });

    const hasAlarmStatusData = computed(() => alarmStatusData.value.length > 0);
    const hasLineData = computed(() => lineData.xData.length > 0 && lineData.yData.length > 0);
    const hasBarData = computed(() => barData.xData.length > 0 && barData.yData.length > 0);

    const clickItem = (data: any): void => {
      emit("open-modal", {
        alarmStatus: data.alarmStatus,
        dateRange: topTimeFrame.value.dateRange,
      });
    };

    const changeTopTimeFrame = async (): Promise<void> => {
      const params = {
        sceneType: globalState.business.currentMenu,
        areaId: globalState.business.currentAreaId,
        period: topTimeFrame.value.dateRange.join(","),
        type: topTimeFrame.value.timeType,
      };
      try {
        const [Status, Trend, area] = await Promise.all([statisticsStatus(params), deviceAlarmTrend(params), deviceAlarmArea(params)]);
        const trendRes = Trend || {};
        lineData.yData = [];
        lineData.xData = [];
        for (const key in trendRes) {
          const rows = Array.isArray(trendRes[key]) ? trendRes[key] : [];
          lineData.xData = rows.map((item: any) => {
            let period = String(item.period ?? "");
            if (params.type === "TODAY") period += "时";
            else if (params.type === "THIS_YEAR") period += "月";
            else period += "号";
            return period;
          });
          lineData.yData.push({
            name: key,
            data: rows.map((item: any) => Number(item.alarmNum) || 0),
          });
        }
        alarmStatusData.value = (Status?.alarmStatusStatistics || []).map((item: any, index: number) => ({
          ...item,
          color: COLOR_LIST[index % COLOR_LIST.length],
        }));
        const areaRows = Array.isArray(area) ? area : [];
        barData.xData = areaRows.map((item: any) => item.name);
        barData.yData = [
          {
            name: "区域",
            data: areaRows.map((item: any) => Number(item.num) || 0),
          },
        ];
      } catch {
        alarmStatusData.value = [];
        lineData.xData = [];
        lineData.yData = [];
        barData.xData = [];
        barData.yData = [];
      } finally {
        loaded.value = true;
      }
    };

    onMounted(() => {
      void changeTopTimeFrame();
    });

    const renderBody = (isZoom: boolean): JSX.Element => (
      <div class={[styles.cardBody, isZoom ? styles.isZoom : ""]} data-no-zoom>
        <div class={styles.segmentedWrap}>
          <a-radio-group
            onChange={changeTopTimeFrame}
            class={styles.segmented}
            value={alarmTrend.value}
            onUpdate:value={(v) => {
              alarmTrend.value = v;
            }}
            button-style="solid"
          >
            <a-radio-button value="trend">设备报警趋势</a-radio-button>
            <a-radio-button value="statistics">区域报警统计</a-radio-button>
          </a-radio-group>
        </div>

        <div class={styles.statusSurface}>
          {!loaded.value ? (
            <PanelCardLoading zoom={isZoom} />
          ) : hasAlarmStatusData.value ? (
            <GridContainer onClickItem={clickItem} data={alarmStatusData.value} />
          ) : (
            <div class={styles.statusEmpty}>
              <NoData />
            </div>
          )}
        </div>

        <div class={[styles.chartSurface, isZoom ? styles.isZoomChart : ""]}>
          {!loaded.value ? (
            <PanelCardLoading zoom={isZoom} />
          ) : alarmTrend.value === "trend" && hasLineData.value ? (
            <stackedLine title={lineData.title} yData={lineData.yData} xData={lineData.xData} color={["#2989FF", "#FF6E23"]} />
          ) : alarmTrend.value === "statistics" && hasBarData.value ? (
            <overviewChartBar xData={barData.xData} yData={barData.yData} gridTop={28} />
          ) : (
            <div class={styles.chartEmpty}>
              <NoData />
            </div>
          )}
        </div>
      </div>
    );

    return (): JSX.Element => (
      <div class="v2-panel-root">
        <SubPanelTemplate
          title="报警趋势"
          class="visual-v2-sub-panel v2-panel-card hospital-alarm-trend-v2-panel"
          zoomable
          zoom-title="报警趋势详情"
          zoom-width={1000}
          v-slots={{
            titleIcon: () => <CardTitleIcon name="child-hospital-trend" />,
            extra: () => (
              <div class={styles.headerToolbar} data-no-zoom>
                <DateInlineForm
                  modelValue={topTimeFrame.value}
                  onUpdate:modelValue={(v) => {
                    topTimeFrame.value = v;
                  }}
                  onSearch={changeTopTimeFrame}
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

export default AlarmTrend;
