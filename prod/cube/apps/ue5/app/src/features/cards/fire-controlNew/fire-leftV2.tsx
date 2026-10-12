import { defineComponent, onMounted, reactive, ref } from "vue";

import OverviewChartBar from "@/features/cards/hospital/overview-chartBar";
import modalAlarmTable from "@/features/equipment/modal-table/modal-alarm-tableNew";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { alarmEventTypeStatisticsc, statisticsSituation } from "@/infrastructure/api/alarm";
import { getThemeImage } from "@/infrastructure/utils/getImage";
import { alarmTrend } from "@/infrastructure/utils/requestData/alarm";
import CountTo from "@/shared-ui/panel/count-to/count-to";
import DateInlineForm from "@/shared-ui/panel/dateInlineForm";
import LineChart from "@/shared-ui/panel/lineChart";
import noData from "@/shared-ui/panel/noData";
import PanelCardLoading from "@/shared-ui/panel/panel-card-loading";
import { ModelValueItf } from "@/shared-ui/panel/types";
import { useStateStore } from "@/visualization-core/stores/use-state-store";

import "./fire-leftV2.module.less";

const alarmAccuracyRateIcon = getThemeImage("alarm-accuracy-rate.png");
const alarmEventIcon = getThemeImage("alarm-event.png");
const alarmHandlingRateIcon = getThemeImage("alarm-handling-rate.png");
const alarmSituationIcon = getThemeImage("alarm-record.png");
const alarmTimeoutRateIcon = getThemeImage("alarm-timeout-rate.png");
const alarmTrendIcon = getThemeImage("alarm-trend.png");
const fireAlarmProportionIcon = getThemeImage("fire-alarm-proportion.png");

interface ContentItem {
  name: string;
  field: string;
  value: number;
  iconClass: string;
  iconSrc: string;
  accentColor: string;
}

const clampPercent = (value: number) => Math.max(0, Math.min(Number(value) || 0, 100));

export const FireLeftV2 = defineComponent({
  name: "FireLeftV2",
  setup() {
    const { globalState } = useStateStore();

    let eventDataList: Array<{ id: string; name: string }> = [];
    const alarmModalShow = ref(false);
    const parameter = reactive({
      alarmEventTypeId: "",
      dateRange: [] as string[],
    });

    const alarmtimeType = ref<ModelValueItf>({
      timeType: "THIS_YEAR",
      dateRange: [],
    });

    const contentList = ref<ContentItem[]>([
      {
        name: "消防报警占比",
        field: "ratio",
        value: 0,
        iconClass: "is-fire",
        iconSrc: fireAlarmProportionIcon,
        accentColor: "#ff7a45",
      },
      {
        name: "报警处理率",
        field: "handlerRatio",
        value: 0,
        iconClass: "is-handle",
        iconSrc: alarmHandlingRateIcon,
        accentColor: "#5b9ce2",
      },
      {
        name: "报警正确率",
        field: "actualRatio",
        value: 0,
        iconClass: "is-accuracy",
        iconSrc: alarmAccuracyRateIcon,
        accentColor: "#3ecf8e",
      },
      {
        name: "报警超时率",
        field: "timeoutRatio",
        value: 0,
        iconClass: "is-timeout",
        iconSrc: alarmTimeoutRateIcon,
        accentColor: "#faad14",
      },
    ]);

    const trend = reactive<ModelValueItf>({
      timeType: "THIS_YEAR",
      dateRange: [],
    });

    const barData = reactive({
      xData: [] as string[],
      yData: [
        {
          data: [] as number[],
          name: "",
          color: ["rgba(41, 137, 255, 0.80)", "rgba(41, 137, 255, 0)"],
        },
      ],
    });
    const trendLoaded = ref(false);

    const xData = reactive<{ arr: string[] }>({ arr: [] });
    const series = reactive([
      {
        data: [] as number[],
        linearGradientColor: ["rgb(86, 142, 255)", "rgb(86, 142, 255,0)"],
      },
    ]);

    const overviewTime = ref<ModelValueItf>({
      timeType: "THIS_YEAR",
      dateRange: [],
    });

    const alarmClickBar = (value: { name: string }) => {
      const findItem = eventDataList.find((item) => item.name === value.name);
      if (findItem) {
        parameter.alarmEventTypeId = findItem.id;
        parameter.dateRange = overviewTime.value.dateRange;
        alarmModalShow.value = true;
      }
    };

    const closeModal = () => {
      alarmModalShow.value = false;
    };

    const getAlarmSituation = async () => {
      const params = {
        sceneType: globalState.business.currentMenu,
        areaId: globalState.business.currentAreaId,
        period: alarmtimeType.value.dateRange.join(","),
        type: alarmtimeType.value.timeType,
      };
      const res = await statisticsSituation(params);
      contentList.value = contentList.value.map((item) => ({
        ...item,
        value: +res[item.field],
      }));
    };

    const getAlarmEvent = async () => {
      const params = {
        sceneType: globalState.business.currentMenu,
        areaId: globalState.business.currentAreaId,
        period: overviewTime.value.dateRange.join(","),
        type: overviewTime.value.timeType,
      };
      const result = await alarmEventTypeStatisticsc(params);
      barData.xData = result.map((item) => item.name);
      barData.yData[0].data = result.map((item) => item.totalNum);
      eventDataList = result;
    };

    const getAlarmTrend = async () => {
      trendLoaded.value = false;
      const param = {
        sceneType: globalState.business.currentMenu,
        areaId: globalState.business.currentAreaId,
        period: trend.dateRange.join(","),
        type: trend.timeType,
      };
      try {
        const data = await alarmTrend(param);
        xData.arr = data.xdata;
        series[0].data = data.ydata;
      } catch {
        xData.arr = [];
        series[0].data = [];
      } finally {
        trendLoaded.value = true;
      }
    };

    onMounted(() => {
      void getAlarmSituation();
      void getAlarmEvent();
      void getAlarmTrend();
    });

    const renderMetricRows = (isZoom: boolean): JSX.Element => (
      <div class={["alarm-metric-panel", isZoom ? "is-zoom" : ""]}>
        {contentList.value.map((item) => (
          <div key={`${isZoom ? "zoom-" : ""}${item.name}`} class={["alarm-metric-row", item.iconClass]}>
            <div class="row-icon">
              <img src={item.iconSrc} alt="" class="row-icon-svg" />
            </div>
            <div class="row-body">
              <div class="row-head">
                <span class="row-label">{item.name}</span>
                <span class={["row-value", `${item.iconClass}-value`]}>
                  <CountTo startVal={0} endVal={Number(item.value)} separator="" duration={2000} />
                  <span class="row-unit">%</span>
                </span>
              </div>
              <div class="row-track">
                <div
                  class="row-fill"
                  style={{
                    width: `${clampPercent(item.value)}%`,
                    background: item.accentColor,
                  }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    );

    const renderSituationBody = (isZoom: boolean): JSX.Element => (
      <div class={["fire-alarm-situation-panel", isZoom ? "is-zoom" : ""]} data-no-zoom>
        {renderMetricRows(isZoom)}
      </div>
    );

    const renderEventBody = (isZoom: boolean): JSX.Element => (
      <div class={["fire-panel-body", isZoom ? "is-zoom" : ""]} data-no-zoom>
        <div class={["chart-panel", isZoom ? "is-zoom" : ""]}>
          {barData.xData.length ? (
            <OverviewChartBar
              bottom={isZoom ? "12%" : "22%"}
              height={isZoom ? 360 : undefined}
              scrollable={false}
              xData={barData.xData}
              yData={barData.yData}
              onClickbar={alarmClickBar}
            />
          ) : (
            <noData />
          )}
        </div>
      </div>
    );

    const renderTrendBody = (isZoom: boolean): JSX.Element => (
      <div class={["fire-panel-body", isZoom ? "is-zoom" : ""]} data-no-zoom>
        <div class={["trend-chart-panel", isZoom ? "is-zoom" : ""]}>
          {!trendLoaded.value ? (
            <PanelCardLoading zoom={isZoom} />
          ) : !series[0].data.every((value) => value === 0) ? (
            <LineChart
              x-data={xData.arr}
              series={series}
              showLegend={false}
              unit={{ x: "", y: "次" }}
              scrollable={xData.arr.length > 12}
              dataZoomSlider={false}
            />
          ) : (
            <div class={["no-data-wrap", isZoom ? "is-zoom" : ""]}>
              <noData />
            </div>
          )}
        </div>
      </div>
    );

    return () => (
      <div class="fire-left-v2-root">
        <SubPanelTemplate
          title="报警情况统计"
          class="visual-v2-sub-panel fire-panel-v2 fire-alarm-situation-panel"
          zoomable
          zoom-title="报警情况统计详情"
          zoom-width={720}
          v-slots={{
            titleIcon: () => <img src={alarmSituationIcon} alt="" class="title-card-icon" />,
            extra: () => (
              <DateInlineForm
                modelValue={alarmtimeType.value}
                onUpdate:modelValue={(v) => {
                  alarmtimeType.value = v;
                }}
                data-no-zoom
                onSearch={getAlarmSituation}
              />
            ),
            default: () => (
              <div class="fire-panel-body" data-no-zoom>
                {renderSituationBody(false)}
              </div>
            ),
            "zoom-content": () => renderSituationBody(true),
          }}
        />

        <SubPanelTemplate
          title="报警事件统计"
          class="visual-v2-sub-panel fire-panel-v2 fire-alarm-event-panel"
          zoomable
          zoom-title="报警事件统计详情"
          zoom-width={720}
          v-slots={{
            titleIcon: () => <img src={alarmEventIcon} alt="" class="title-card-icon" />,
            extra: () => (
              <DateInlineForm
                modelValue={overviewTime.value}
                onUpdate:modelValue={(v) => {
                  overviewTime.value = v;
                }}
                data-no-zoom
                onSearch={getAlarmEvent}
              />
            ),
            default: () => renderEventBody(false),
            "zoom-content": () => renderEventBody(true),
          }}
        />

        <div class="alarm-event">
          <SubPanelTemplate
            title="设备报警趋势"
            class="visual-v2-sub-panel fire-panel-v2 fire-alarm-trend-panel"
            zoomable
            zoom-title="设备报警趋势详情"
            zoom-width={760}
            v-slots={{
              titleIcon: () => <img src={alarmTrendIcon} alt="" class="title-card-icon" />,
              extra: () => (
                <DateInlineForm
                  modelValue={trend}
                  onUpdate:modelValue={(v) => {
                    Object.assign(trend, v);
                  }}
                  data-no-zoom
                  onSearch={getAlarmTrend}
                />
              ),
              default: () => renderTrendBody(false),
              "zoom-content": () => renderTrendBody(true),
            }}
          />
        </div>

        <modalAlarmTable show-modal={alarmModalShow.value} parameter={parameter} onClose={closeModal} />
      </div>
    );
  },
});

export default FireLeftV2;
