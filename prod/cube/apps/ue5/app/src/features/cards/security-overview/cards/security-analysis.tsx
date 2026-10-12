import moment from "moment";
import { defineComponent, onMounted, provide, reactive, ref } from "vue";

import { createAlarmModalParameter } from "../../_shared/alarm-metrics/alarm-metrics";
import CardTitleIcon from "@/features/cards/_shared/card-title-icon/card-title-icon";
import ModalAlarmTable from "@/features/equipment/modal-table/modal-alarm-tableNew";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { statisticsTrend, statistics } from "@/infrastructure/api/alarm";
import { applicationCode } from "@/infrastructure/api/saftsecurity/overview";
import { hasCompleteCategoryChartData } from "@/infrastructure/utils/chart-data-ready";
import { getThemeImage } from "@/infrastructure/utils/getImage";
import CountTo from "@/shared-ui/panel/count-to/count-to";
import DateInlineForm from "@/shared-ui/panel/dateInlineForm";
import LineChart from "@/shared-ui/panel/lineChart";
import { panelCardLoadedKey } from "@/shared-ui/panel/panel-card-loaded-context";
import PanelCardLoading from "@/shared-ui/panel/panel-card-loading";
import { ModelValueItf } from "@/shared-ui/panel/types";
import { useStateStore } from "@/visualization-core/stores/use-state-store";

import "@/features/cards/access-control/_shared/access-control-v2-shared.module.less";
import "@/features/cards/overview/cards/overview-v2-shared.module.less";
import "./security-analysis.module.less";

const alarmTotalIcon = getThemeImage("alarm-count.png");
const alarmActualIcon = getThemeImage("alarm-count-unhandled.png");
const alarmImpracticalIcon = getThemeImage("alarm-count-handled.png");

export const SecurityAnalysis = defineComponent({
  name: "SecurityAnalysis",
  props: {
    title: { type: String, required: false, default: "安全分析" },
  },
  setup(props) {
    const { globalState } = useStateStore();

    const overviewTime = ref<ModelValueItf>({
      timeType: "THIS_YEAR",
      dateRange: [moment().startOf("year").format("YYYY-MM-DD 00:00:00"), moment().endOf("year").format("YYYY-MM-DD HH:mm:ss")],
    });

    const loaded = ref(false);
    provide(panelCardLoadedKey, loaded);
    const alarmModalShow = ref(false);
    const alarmParameter = ref<Record<string, any>>({});
    const trendsData = reactive({
      xData: [] as string[],
      yData: [
        {
          name: "报警数",
          data: [] as number[],
          linearGradientColor: ["rgba(47, 141, 255, 0.50)", "rgba(47, 141, 255, 0.02)"],
          lineColor: "rgba(47, 141, 255, 0.50)",
        },
      ],
    });

    const alarmStatisticsData = reactive({
      title: "报警总量",
      total: 0,
      ratio: 0,
      itemize: [
        {
          label: "真实报警",
          value: 0,
          ratio: 0,
          color: "#2AE8BD",
          className: "is-actual",
          iconSrc: alarmActualIcon,
          alarmHandlerResult: "ALARM_ACTUAL",
        },
        {
          label: "误报数",
          value: 0,
          ratio: 0,
          color: "#FFAB10",
          className: "is-false",
          iconSrc: alarmImpracticalIcon,
          alarmHandlerResult: "ALARM_IMPRACTICAL",
        },
      ],
      list: [],
    });

    async function changeHandleOverviewTime(): Promise<void> {
      const { timeType, dateRange } = overviewTime.value;
      if (!dateRange?.length) return;
      const params = {
        sceneType: globalState.business.currentMenu,
        areaId: globalState.business.currentAreaId,
        period: dateRange.join(","),
        type: timeType,
      };
      loaded.value = false;
      try {
        const Status = await statistics({ ...params, deviceTags: [...applicationCode.keys()] });
        const Trend = await statisticsTrend({ ...params, deviceTags: [...applicationCode.keys()].toString() });
        alarmStatisticsData.total = Status.totalNum;
        alarmStatisticsData.ratio = Status.ratio;
        alarmStatisticsData.itemize[0].value = Status.actualNum;
        alarmStatisticsData.itemize[0].ratio = Status.actualRatio;
        alarmStatisticsData.itemize[1].value = Status.impracticalNum;
        alarmStatisticsData.itemize[1].ratio = Status.impracticalRatio;
        const nextXData: string[] = [];
        const nextYData: number[] = [];
        (Trend ?? []).forEach((item) => {
          let time = "";
          if (params.type === "TODAY") time = "时";
          else if (params.type === "THIS_YEAR") time = "月";
          else time = "号";
          nextXData.push(item.period + time);
          nextYData.push(item.alarmNum);
        });
        trendsData.xData = nextXData;
        trendsData.yData[0].data = nextYData;
      } finally {
        loaded.value = true;
      }
    }

    const handelClickAlarm = (item?: { alarmHandlerResult?: string }): void => {
      alarmParameter.value = {
        ...createAlarmModalParameter(overviewTime.value),
        alarmHandleResult: item?.alarmHandlerResult,
        alarmHandlerResult: item?.alarmHandlerResult,
        deviceTags: [...applicationCode.keys()].join(","),
        sceneType: globalState.business.currentMenu,
        areaId: globalState.business.currentAreaId,
        type: overviewTime.value.timeType,
      };
      alarmModalShow.value = true;
    };

    onMounted(() => {
      void changeHandleOverviewTime();
    });

    const renderRatio = (ratio: number): JSX.Element => (
      <span class="analysis-stat-ratio">
        <span class="analysis-stat-ratio-label">环比</span>
        <span class={["analysis-stat-ratio-arrow", ratio > 0 ? "is-up" : "is-down"]} />
        <span class={["analysis-stat-ratio-value", ratio < 0 ? "is-down" : "is-up"]}>{ratio}%</span>
      </span>
    );

    const renderMetricCards = (): JSX.Element => (
      <div class="safe-overview-analysis-stats" data-no-zoom>
        <button type="button" class="analysis-stat-card is-total" onClick={() => handelClickAlarm()}>
          <span class="analysis-stat-icon">
            <img src={alarmTotalIcon} alt="" />
          </span>
          <span class="analysis-stat-main">
            <span class="analysis-stat-label">报警总量</span>
            <span class="analysis-stat-value">
              <CountTo startVal={0} endVal={alarmStatisticsData.total} duration={1200} separator="" />
            </span>
            {renderRatio(alarmStatisticsData.ratio)}
          </span>
        </button>
        {alarmStatisticsData.itemize.map((item) => (
          <button
            type="button"
            class={["analysis-stat-card", item.className]}
            key={item.alarmHandlerResult}
            onClick={() => handelClickAlarm(item)}
          >
            <span class="analysis-stat-icon">
              <img src={item.iconSrc} alt="" />
            </span>
            <span class="analysis-stat-main">
              <span class="analysis-stat-label">{item.label}</span>
              <span class="analysis-stat-value">
                <CountTo startVal={0} endVal={item.value} duration={1200} separator="" />
              </span>
              {renderRatio(item.ratio)}
            </span>
          </button>
        ))}
      </div>
    );

    const renderBody = (isZoom: boolean): JSX.Element => (
      <div class={["overview-v2-body safe-overview-analysis-body", isZoom ? "is-zoom" : ""]} data-no-zoom>
        {!loaded.value ? (
          <PanelCardLoading zoom={isZoom} />
        ) : (
          <>
            {renderMetricCards()}
            <div class={["safe-overview-analysis-chart", "v2-chart-panel", isZoom ? "is-zoom" : ""]} data-no-zoom>
              {hasCompleteCategoryChartData(trendsData.xData, trendsData.yData) ? (
                <LineChart
                  x-data={trendsData.xData}
                  series={trendsData.yData}
                  showLegend={false}
                  showBackground={false}
                  unit={{ x: "", y: "次" }}
                  gridTop="28"
                  gridBottom="32"
                  scrollable
                  dataZoomSlider={false}
                  axisPointer
                />
              ) : null}
            </div>
          </>
        )}
      </div>
    );

    return (): JSX.Element => (
      <>
        <div class="v2-panel-root overview-v2-root">
          <SubPanelTemplate
            title={props.title}
            class="visual-v2-sub-panel v2-panel-card access-control-v2-panel access-control-card-theme overview-v2-panel safe-overview-panel safe-analysis-panel"
            zoomable
            zoom-title={`${props.title}详情`}
            zoom-width={760}
            v-slots={{
              titleIcon: () => <CardTitleIcon name="overview-alarm" />,
              extra: () => (
                <div class="access-control-header-toolbar" data-no-zoom>
                  <DateInlineForm
                    modelValue={overviewTime.value}
                    onUpdate:modelValue={(v) => {
                      overviewTime.value = v;
                    }}
                    onSearch={changeHandleOverviewTime}
                    data-no-zoom
                  />
                </div>
              ),
              default: () => renderBody(false),
              "zoom-content": () => renderBody(true),
            }}
          />
        </div>
        {alarmModalShow.value && (
          <ModalAlarmTable
            showModal={alarmModalShow.value}
            onClose={() => (alarmModalShow.value = false)}
            parameter={alarmParameter.value}
          />
        )}
      </>
    );
  },
});

export default SecurityAnalysis;
