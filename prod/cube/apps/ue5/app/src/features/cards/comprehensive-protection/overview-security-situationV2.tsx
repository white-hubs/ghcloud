import moment from "moment";
import { computed, defineComponent, onMounted, reactive, ref } from "vue";

import OverviewChartBar from "@/features/cards/hospital/overview-chartBar";
import ModalAlarmTable from "@/features/equipment/modal-table/modal-alarm-tableNew";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { groupStatistics, statisticsStatus } from "@/infrastructure/api/alarm";
import { getThemeImage } from "@/infrastructure/utils/getImage";
import DateInlineForm from "@/shared-ui/panel/dateInlineForm";
import { ModelValueItf } from "@/shared-ui/panel/types";
import { useStateStore } from "@/visualization-core/stores/use-state-store";

import "@/features/cards/access-control/_shared/access-control-v2-shared.module.less";
import "./overview-security-situationV2.module.less";

const alarmTotalIcon = getThemeImage("alarm-total.png");
const processedIcon = getThemeImage("processed.png");
const securitySituationIcon = getThemeImage("security-situation.png");

const buildBuiltinRange = (timeType: string): string[] => {
  const fmt = "YYYY-MM-DD HH:mm:ss";
  if (timeType === "TODAY") {
    return [moment().format("YYYY-MM-DD 00:00:00"), moment().format(fmt)];
  }
  if (timeType === "THIS_WEEK") {
    return [moment().startOf("week").add(1, "days").format("YYYY-MM-DD 00:00:00"), moment().endOf("week").add(1, "days").format(fmt)];
  }
  if (timeType === "THIS_MONTH") {
    return [moment().startOf("month").format("YYYY-MM-DD 00:00:00"), moment().endOf("month").format(fmt)];
  }
  return [moment().startOf("year").format("YYYY-MM-DD 00:00:00"), moment().endOf("year").format(fmt)];
};

export const OverviewSecuritySituationV2 = defineComponent({
  name: "OverviewSecuritySituationV2",
  setup() {
    const { globalState } = useStateStore();
    // 对齐 legacy：DateInlineForm 默认今年；预填 dateRange 保证 period 有效
    const overviewTime = ref<ModelValueItf>({
      timeType: "THIS_YEAR",
      dateRange: buildBuiltinRange("THIS_YEAR"),
    });
    const alarmModalShow = ref(false);
    const alarmParameter = ref<Record<string, unknown>>({});

    const barData = reactive({
      xData: ["安防报警", "消防报警", "电气报警", "入侵报警"],
      yData: [
        {
          data: [] as number[] | string[],
          name: "已处理",
          color: ["rgba(41, 137, 255, 0.80)", "rgba(41, 137, 255, 0)"],
        },
        {
          data: [] as number[] | string[],
          name: "处理中",
          color: ["rgba(255, 110, 35, 0.80)", "rgba(255, 110, 35, 0)"],
        },
      ],
    });

    const deviceStatisticsData1 = reactive({
      title: "告警总量",
      total: 0,
      itemize: [{ name: "处理占比", label: "已处理", value: 0, key: "OFFLINE" }],
    });

    const processedCount = computed(() => deviceStatisticsData1.itemize[0].value);

    const processedRate = computed(() => {
      if (!deviceStatisticsData1.total) return "0.00";
      return ((deviceStatisticsData1.itemize[0].value / deviceStatisticsData1.total) * 100).toFixed(2);
    });

    const resolvePeriod = (): string => {
      const range = overviewTime.value?.dateRange;
      if (range?.[0] && range?.[1]) return `${range[0]},${range[1]}`;
      const fallback = buildBuiltinRange(overviewTime.value?.timeType || "THIS_YEAR");
      return `${fallback[0]},${fallback[1]}`;
    };

    /** 对齐 legacy：statisticsStatus / groupStatistics({ sceneType, areaId, period, type }) */
    const getAlarmsNumbers = async (): Promise<void> => {
      const params = {
        sceneType: globalState.business.currentMenu,
        areaId: globalState.business.currentAreaId,
        period: resolvePeriod(),
        type: overviewTime.value?.timeType || "THIS_YEAR",
      };
      try {
        const status = await statisticsStatus(params);
        deviceStatisticsData1.total = Number(status?.alarmNum) || 0;
        const statusList = Array.isArray(status?.alarmStatusStatistics) ? status.alarmStatusStatistics : [];
        statusList.forEach((item) => {
          if (item.alarmStatusName === "已处理") {
            deviceStatisticsData1.itemize[0].value = Number(item.alarmNum) || 0;
          }
        });
        const res = await groupStatistics(params);
        const rows = Array.isArray(res) ? res : [];
        const categories = rows.map((item) => item.applicationName);
        const handled = rows.map((item) => Number(item.alarmHandler) || 0);
        const processing = rows.map((item) => Number(item.alarmProgressConfirmed) || 0);
        const fallbackCategories = ["安防报警", "消防报警", "电气报警", "入侵报警"];
        barData.xData = categories.length > 0 ? categories : fallbackCategories;
        const padSeries = (values: number[], length: number): number[] => {
          if (values.length >= length) {
            return values.slice(0, length);
          }
          return [...values, ...Array.from({ length: length - values.length }, () => 0)];
        };
        barData.yData[0].data = padSeries(handled, barData.xData.length);
        barData.yData[1].data = padSeries(processing, barData.xData.length);
      } catch {
        deviceStatisticsData1.total = 0;
        deviceStatisticsData1.itemize[0].value = 0;
        barData.yData[0].data = [0, 0, 0, 0];
        barData.yData[1].data = [0, 0, 0, 0];
      }
    };

    const openAlarmModal = (alarmStatus = ""): void => {
      alarmParameter.value = {
        dateRange: overviewTime.value?.dateRange?.length
          ? overviewTime.value.dateRange
          : buildBuiltinRange(overviewTime.value?.timeType || "THIS_YEAR"),
        alarmStatus,
      };
      alarmModalShow.value = true;
    };

    const handelClickDeviceNum = (): void => {
      openAlarmModal("");
    };

    const handelClickProcessed = (): void => {
      openAlarmModal("ALARM_HANDLER");
    };

    const closeModal = (): void => {
      alarmModalShow.value = false;
    };

    const handleBarClick = (_value: unknown): void => {
      // reserved for future drill-down
    };

    onMounted(() => {
      void getAlarmsNumbers();
    });

    const renderBody = (isZoom: boolean): JSX.Element => (
      <div class={["overview-security-situation-v2", "overview-security-situation-v2-panel", isZoom ? "is-zoom" : ""]}>
        <div class="stats-row" data-no-zoom>
          <div class="stat-card is-total" onClick={handelClickDeviceNum}>
            <div class="stat-icon stat-icon-image">
              <img src={alarmTotalIcon} alt="" class="stat-icon-img" />
            </div>
            <div class="stat-content">
              <div class="stat-label">告警总量</div>
              <div class="stat-value-row">
                <div class="stat-value">{deviceStatisticsData1.total}</div>
                <span class="stat-unit">次</span>
              </div>
            </div>
          </div>

          <div class="stat-card is-processed" onClick={handelClickProcessed}>
            <div class="stat-icon stat-icon-image">
              <img src={processedIcon} alt="" class="stat-icon-img" />
            </div>
            <div class="stat-content">
              <div class="stat-label">已处理</div>
              <div class="stat-value-row">
                <div class="stat-value is-processed-value">{processedCount.value}</div>
                <span class="stat-unit">次</span>
              </div>
              <div class="stat-sub">处置率 {processedRate.value}%</div>
            </div>
          </div>
        </div>

        <div class={["chart-panel", isZoom ? "is-zoom" : ""]} data-no-zoom>
          <OverviewChartBar
            bottom={isZoom ? "8%" : "0"}
            gridTop={isZoom ? 52 : 44}
            height={isZoom ? 320 : undefined}
            title="次"
            xData={barData.xData}
            yData={barData.yData}
            onClickbar={handleBarClick}
          />
        </div>
      </div>
    );

    return () => (
      <div class="v2-panel-root overview-security-situation-v2-root">
        <SubPanelTemplate
          title="安全态势总览"
          class="visual-v2-sub-panel v2-panel-card access-control-v2-panel access-control-card-theme overview-security-situation-v2-panel"
          zoomable
          zoom-title="安全态势总览详情"
          zoom-width={760}
          v-slots={{
            titleIcon: () => <img src={securitySituationIcon} alt="" class="title-card-icon" />,
            extra: () => (
              <div class="access-control-header-toolbar" data-no-zoom>
                <DateInlineForm
                  modelValue={overviewTime.value}
                  onUpdate:modelValue={(v) => {
                    overviewTime.value = {
                      timeType: v.timeType,
                      dateRange: v.dateRange?.length ? v.dateRange : buildBuiltinRange(v.timeType || "THIS_YEAR"),
                    };
                  }}
                  onSearch={getAlarmsNumbers}
                />
              </div>
            ),
            default: () => renderBody(false),
            "zoom-content": () => renderBody(true),
          }}
        />
        {alarmModalShow.value && (
          <ModalAlarmTable show-modal={alarmModalShow.value} parameter={alarmParameter.value} onClose={closeModal} />
        )}
      </div>
    );
  },
});

export default OverviewSecuritySituationV2;
