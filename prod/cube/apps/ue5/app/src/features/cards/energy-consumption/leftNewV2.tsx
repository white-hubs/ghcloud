import { computed, defineComponent, onMounted, reactive, ref, watch } from "vue";

import { applyEnergyTrendSeriesStyle } from "./utils/energy-trend-chart-style";
import modalAlarmTable from "@/features/equipment/modal-table/modal-alarm-tableNew";
import RollTable from "@/features/panel-shell/tables/roll-table/roll-table";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { dcStatTrend, statCategoryAll, statTimeCategory } from "@/infrastructure/api/energy";
import bus from "@/infrastructure/utils/bus";
import { mapEnergyTrendLabels } from "@/infrastructure/utils/chart-axis-style";
import { getThemeImage } from "@/infrastructure/utils/getImage";
import CountTo from "@/shared-ui/panel/count-to/count-to";
import DateInlineForm from "@/shared-ui/panel/dateInlineForm";
import LineChart from "@/shared-ui/panel/lineChart";
import { ModelValueItf } from "@/shared-ui/panel/types";
import { useVisualTheme } from "@/visualization-core/hooks/use-visual-theme";
import useCommon from "@/visualization-core/hooks/useCommon";
import { useStateStore } from "@/visualization-core/stores/use-state-store";

import "./leftNewV2.module.less";

const processedIcon = getThemeImage("alarm-count-handled.png");
const alarmHandlingIcon = getThemeImage("alarm-count-unhandled.png");
const alarmTotalIcon = getThemeImage("alarm-count.png");
const alarmRecordIcon = getThemeImage("alarm-record.png");
const alarmTrendIcon = getThemeImage("alarm-trend.png");
const carbonEmissionsIcon = getThemeImage("carbon-emissions.png");
const companyIntroIcon = getThemeImage("company-intro.png");
const comprehensiveEnergyConsumptionIcon = getThemeImage("comprehensive-energy-consumption.png");

const cardIcons = {
  alarmTotal: alarmTotalIcon,
  alarmHandling: alarmHandlingIcon,
  processed: processedIcon,
} as const;

const renderAlarmStatus = (record: { alarmStatus?: string }): JSX.Element => {
  if (record.alarmStatus === "ALARM_UN_CONFIRMED") {
    return <span class="status is-pending">待处理</span>;
  }
  if (record.alarmStatus === "ALARM_PROGRESS_CONFIRMED") {
    return <span class="status is-processing">处理中</span>;
  }
  return <span class="status is-done">已处理</span>;
};

export const LeftNewV2 = defineComponent({
  name: "LeftNewV2",
  setup() {
    const { takeNotes, getAlarmTakeNotes } = useCommon();
    const { globalState } = useStateStore();
    const { currentTheme } = useVisualTheme();

    const workOrderTime = ref<ModelValueItf>();
    const energyConsumption = ref<ModelValueItf>({
      timeType: "THIS_WEEK",
      dateRange: [""],
    });
    const carbonTime = ref<ModelValueItf>({
      timeType: "THIS_WEEK",
      dateRange: [""],
    });
    const alarmsNumber = ref(0);
    const timeList = [
      { label: "本周", value: "THIS_WEEK" },
      { label: "本月", value: "THIS_MONTH" },
      { label: "今年", value: "THIS_YEAR" },
    ];
    const pieData = ref<Array<{ name: string; value: number }>>([]);
    const listData = ref<Array<Record<string, unknown>>>([]);
    const alarmModalShow = ref(false);
    const alarmParameter = ref<Record<string, unknown>>({});

    const column = reactive([
      { title: "报警时间", dataIndex: "alarmTime", width: 120 },
      { title: "报警级别", dataIndex: "alarmLevelName" },
      { title: "报警事件", dataIndex: "alarmEventName" },
      {
        title: "状态",
        dataIndex: "alarmStatus",
        slots: { customRender: "alarmStatus" },
      },
    ]);

    const visitingData = ref([
      {
        title: "综合能耗 tce",
        value: 0,
        ratio: 0,
        iconSrc: comprehensiveEnergyConsumptionIcon,
      },
      {
        title: "碳排放量 kg CO₂e",
        value: 0,
        ratio: 0,
        iconSrc: carbonEmissionsIcon,
      },
    ]);

    const carbonEmissionsData = reactive({
      xData: [] as string[],
      yData: [
        {
          data: [] as number[],
          linearGradientColor: ["rgba(120, 252, 252, 1)", "rgba(120, 252, 252, 0.1)"],
          lineColor: "rgba(120, 252, 252, 1)",
        },
      ],
    });

    const receptionTrendsChartData = reactive({
      xData: [] as string[],
      yData: [
        {
          data: [] as number[],
          linearGradientColor: ["rgba(120, 252, 252, 0.85)", "rgba(120, 252, 252, 0.08)"],
          lineColor: "rgba(120, 252, 252, 1)",
        },
      ],
    });

    const syncTrendSeriesStyle = (): void => {
      applyEnergyTrendSeriesStyle(receptionTrendsChartData.yData[0], currentTheme.value);
      applyEnergyTrendSeriesStyle(carbonEmissionsData.yData[0], currentTheme.value);
    };

    watch(currentTheme, syncTrendSeriesStyle, { immediate: true });

    const alarmStatProcessed = computed(() => pieData.value.find((item) => item.name.includes("已处理"))?.value ?? 0);
    const alarmStatUnprocessed = computed(() => pieData.value.find((item) => item.name.includes("未处理"))?.value ?? 0);

    const alarmStatCards = computed(() => [
      {
        cardClass: "is-total",
        iconSrc: cardIcons.alarmTotal,
        value: alarmsNumber.value,
        label: "报警数",
        valueClass: "",
        clickKey: undefined as string | undefined,
      },
      {
        cardClass: "is-processed",
        iconSrc: cardIcons.processed,
        value: alarmStatProcessed.value,
        label: "已处理数",
        valueClass: "is-processed-value",
        clickKey: "已处理数",
      },
      {
        cardClass: "is-pending",
        iconSrc: cardIcons.alarmHandling,
        value: alarmStatUnprocessed.value,
        label: "未处理数",
        valueClass: "is-pending-value",
        clickKey: "未处理数",
      },
    ]);

    const changeHandleEnergyConsumptionTime = async (): Promise<void> => {
      const params = {
        period: energyConsumption.value.dateRange.join(","),
        type: energyConsumption.value.timeType,
      };
      const res = await dcStatTrend(params);
      receptionTrendsChartData.xData = mapEnergyTrendLabels(
        res.map((item) => item.time),
        energyConsumption.value.timeType,
      );
      receptionTrendsChartData.yData[0].data = res.map((item) => item.value);
    };

    const changeCarbonTime = async (): Promise<void> => {
      const params = {
        period: carbonTime.value.dateRange.join(","),
        type: carbonTime.value.timeType,
        instrumentType: "electricity_meter",
      };
      const res = await statTimeCategory(params);
      carbonEmissionsData.xData = mapEnergyTrendLabels(
        res.map((item) => item.time),
        carbonTime.value.timeType,
      );
      carbonEmissionsData.yData[0].data = res.map((item) => item.value);
    };

    const changeHandleworkOrderTime = async (): Promise<void> => {
      const params = {
        period: workOrderTime.value!.dateRange.join(","),
        type: workOrderTime.value!.timeType,
      };
      const res = await statCategoryAll(params);
      res.forEach((item) => {
        if (item.instrumentType === "carbon") {
          visitingData.value[1].value = item.value;
          visitingData.value[1].ratio = item.qoqValueRate || 0;
        } else if (item.instrumentType === "zh") {
          visitingData.value[0].value = item.value;
          visitingData.value[0].ratio = item.qoqValueRate || 0;
        }
      });
    };

    const changeTakeNotes = async (): Promise<void> => {
      const param = {
        sceneType: globalState.business.currentMenu,
        areaId: globalState.business.currentAreaId,
        period: takeNotes.value.dateRange.join(","),
        type: takeNotes.value.timeType,
        pageSize: 50,
        pageNumber: 1,
      };
      const data = await getAlarmTakeNotes(param);
      listData.value = data.listData;
      alarmsNumber.value = data.alarmsNumber;
      pieData.value = data.pieData?.filter((item) => !item.name.includes("超时")) ?? [];
    };

    const handelClickItemize = (value?: string): void => {
      const base = {
        dateRange: takeNotes.value?.dateRange ?? [],
        areaIds: globalState.business.currentAreaId,
      };
      if (value === "未处理数") {
        alarmParameter.value = { ...base, alarmStatus: "ALARM_UN_CONFIRMED" };
      } else if (value === "已处理数") {
        alarmParameter.value = { ...base, alarmStatus: "ALARM_HANDLER" };
      } else {
        alarmParameter.value = { ...base, alarmStatus: "" };
      }
      alarmModalShow.value = true;
    };

    const handelClickRow = (record: Record<string, unknown>): void => {
      if (record.alarmTargetCode) {
        bus.emit("equipmentPosition", record);
      }
    };

    const closeAlarmModal = (): void => {
      alarmModalShow.value = false;
    };

    const rollTableSlots = {
      alarmStatus: ({ record }: { record: { alarmStatus?: string } }) => renderAlarmStatus(record),
    };

    const renderMetricGrid = (isZoom: boolean): JSX.Element => (
      <div class={["metric-grid", isZoom ? "is-zoom" : ""]}>
        {visitingData.value.map((item) => (
          <div class="metric-card" key={`${isZoom ? "zoom-" : ""}${item.title}`}>
            <div class="metric-icon" aria-hidden="true">
              <img src={item.iconSrc} alt="" class="metric-icon-image" />
            </div>
            <div class="metric-content">
              <div class="metric-label">{item.title}</div>
              <div class="metric-value-row">
                <CountTo class="metric-value" startVal={0} endVal={item.value} separator="" duration={2000} />
                <div class="metric-ratio">
                  <span class="ratio-label">环比</span>
                  <span class={["ratio-arrow", item.ratio > 0 ? "is-up" : "is-down"]} aria-hidden="true"></span>
                  <span class={["ratio-value", item.ratio > 0 ? "is-up" : "is-down"]}>{item.ratio}%</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );

    const renderTrendChart = (isZoom: boolean, chartData: typeof receptionTrendsChartData): JSX.Element => (
      <div class={["chart-panel", isZoom ? "is-zoom" : ""]}>
        <LineChart
          x-data={chartData.xData}
          series={chartData.yData}
          showLegend={false}
          grid-top={isZoom ? "10" : "8"}
          grid-left="2"
          grid-right="2"
          grid-bottom={isZoom ? "18" : "22"}
          visible-count={isZoom ? 8 : 5}
          unit={{ x: "", y: "" }}
        />
      </div>
    );

    const renderAlarmBody = (isZoom: boolean): JSX.Element => (
      <div class="energy-alarm-body">
        <div class="stats-row">
          {alarmStatCards.value.map((item) => (
            <div
              class={["stat-card", item.cardClass]}
              key={`${isZoom ? "zoom-" : ""}${item.label}`}
              onClick={() => handelClickItemize(item.clickKey)}
            >
              <div class="stat-icon stat-icon-image" aria-hidden="true">
                <img src={item.iconSrc} alt="" class="stat-icon-img" />
              </div>
              <div class="stat-content">
                {isZoom ? (
                  <div class={["stat-value", item.valueClass]}>{item.value}</div>
                ) : (
                  <div class={["stat-value", item.valueClass]}>
                    <CountTo startVal={0} endVal={item.value} separator="" duration={2200} />
                  </div>
                )}
                <div class="stat-label">{item.label}</div>
              </div>
            </div>
          ))}
        </div>
        <div class={["table-panel", "visual-v2-roll-table", isZoom ? "is-zoom" : ""]}>
          {isZoom ? (
            <div class="zoom-table-viewport">
              <RollTable
                column={column}
                data={listData.value}
                show-length={9999}
                class="zoom-roll-table"
                onClickRow={handelClickRow}
                v-slots={rollTableSlots}
              />
            </div>
          ) : (
            <RollTable column={column} data={listData.value} onClickRow={handelClickRow} v-slots={rollTableSlots} />
          )}
        </div>
      </div>
    );

    return (): JSX.Element => (
      <div class="energy-left-v2-root">
        <SubPanelTemplate
          title="能耗概览"
          class="visual-v2-sub-panel energy-panel-v2 energy-overview-panel"
          zoomable
          zoom-title="能耗概览详情"
          zoom-width={640}
          v-slots={{
            titleIcon: () => <img src={companyIntroIcon} alt="" class="title-card-icon" />,
            extra: () => (
              <DateInlineForm
                modelValue={workOrderTime.value}
                onUpdate:modelValue={(v) => {
                  workOrderTime.value = v;
                }}
                data-no-zoom
                onSearch={changeHandleworkOrderTime}
              />
            ),
            default: () => (
              <div class="energy-panel-body" data-no-zoom>
                {renderMetricGrid(false)}
              </div>
            ),
            "zoom-content": () => (
              <div class="energy-overview-panel is-zoom" data-no-zoom>
                {renderMetricGrid(true)}
              </div>
            ),
          }}
        />

        <SubPanelTemplate
          title="综合能耗趋势"
          class="visual-v2-sub-panel energy-panel-v2 energy-trend-panel"
          zoomable
          zoom-title="综合能耗趋势详情"
          zoom-width={760}
          v-slots={{
            titleIcon: () => <img src={alarmTrendIcon} alt="" class="title-card-icon" />,
            extra: () => (
              <DateInlineForm
                modelValue={energyConsumption.value}
                onUpdate:modelValue={(v) => {
                  energyConsumption.value = v;
                }}
                timeList={timeList}
                data-no-zoom
                onSearch={changeHandleEnergyConsumptionTime}
              />
            ),
            default: () => (
              <div class="energy-panel-body" data-no-zoom>
                {renderTrendChart(false, receptionTrendsChartData)}
              </div>
            ),
            "zoom-content": () => (
              <div class="energy-panel-body is-zoom" data-no-zoom>
                {renderTrendChart(true, receptionTrendsChartData)}
              </div>
            ),
          }}
        />

        <SubPanelTemplate
          title="碳排量趋势图"
          class="visual-v2-sub-panel energy-panel-v2 energy-carbon-panel"
          zoomable
          zoom-title="碳排量趋势图详情"
          zoom-width={760}
          v-slots={{
            titleIcon: () => <img src={alarmTrendIcon} alt="" class="title-card-icon" />,
            extra: () => (
              <DateInlineForm
                modelValue={carbonTime.value}
                onUpdate:modelValue={(v) => {
                  carbonTime.value = v;
                }}
                timeList={timeList}
                data-no-zoom
                onSearch={changeCarbonTime}
              />
            ),
            default: () => (
              <div class="energy-panel-body" data-no-zoom>
                {renderTrendChart(false, carbonEmissionsData)}
              </div>
            ),
            "zoom-content": () => (
              <div class="energy-panel-body is-zoom" data-no-zoom>
                {renderTrendChart(true, carbonEmissionsData)}
              </div>
            ),
          }}
        />

        <SubPanelTemplate
          title="报警记录"
          class="visual-v2-sub-panel energy-panel-v2 energy-alarm-panel"
          zoomable
          zoom-title="报警记录详情"
          zoom-width={860}
          v-slots={{
            titleIcon: () => <img src={alarmRecordIcon} alt="" class="title-card-icon" />,
            extra: () => (
              <DateInlineForm
                modelValue={takeNotes.value}
                onUpdate:modelValue={(v) => {
                  takeNotes.value = v;
                }}
                data-no-zoom
                onSearch={changeTakeNotes}
              />
            ),
            default: () => (
              <div class="energy-panel-body energy-alarm-body" data-no-zoom>
                {renderAlarmBody(false)}
              </div>
            ),
            "zoom-content": () => (
              <div class="energy-alarm-panel is-zoom energy-alarm-list-zoom" data-no-zoom>
                {renderAlarmBody(true)}
              </div>
            ),
          }}
        />

        <modalAlarmTable show-modal={alarmModalShow.value} parameter={alarmParameter.value} onClose={closeAlarmModal} />
      </div>
    );
  },
});

export default LeftNewV2;
