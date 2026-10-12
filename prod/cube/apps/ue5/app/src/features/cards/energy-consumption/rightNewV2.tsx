import { CaretDownOutlined } from "@ant-design/icons-vue";
import { computed, defineComponent, onMounted, reactive, ref, watch } from "vue";

import EnergyAnalysisBody from "./components/energy-analysis-body";
import { applyEnergyTrendSeriesStyle } from "./utils/energy-trend-chart-style";
import { getEnergyUnit } from "./utils/energy-units";
import DeviceStatusBody from "@/features/cards/universal-panel/components/device-status-body";
import modalEquipmentAllTable from "@/features/equipment/modal-table/modal-equipmentAll-table";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { collectConfigList, dcStatTrend, projectStatCategory, statCategoryAll } from "@/infrastructure/api/energy";
import { equipmentTotal } from "@/infrastructure/api/equipment";
import { mapEnergyTrendLabels } from "@/infrastructure/utils/chart-axis-style";
import { getThemeImage } from "@/infrastructure/utils/getImage";
import { buildVisualMenuTagCodes } from "@/infrastructure/utils/visual-menu-tag";
import CountTo from "@/shared-ui/panel/count-to/count-to";
import DateInlineForm from "@/shared-ui/panel/dateInlineForm";
import LineChart from "@/shared-ui/panel/lineChart";
import { ModelValueItf } from "@/shared-ui/panel/types";
import { useVisualTheme } from "@/visualization-core/hooks/use-visual-theme";
import { useStateStore } from "@/visualization-core/stores/use-state-store";

import "./rightNewV2.module.less";

const alarmTrendIcon = getThemeImage("alarm-trend.png");
const deviceSituationIcon = getThemeImage("device-situation.png");
const offlineDeviceIcon = getThemeImage("device-total-offline.png");
const onlineDeviceIcon = getThemeImage("device-total-online.png");
const deviceTotalIcon = getThemeImage("device-total.png");
const energyConsumptionIcon = getThemeImage("energy-consumption-statistics.png");

const deviceCardIcons: Record<string, string> = {
  TOTAL: deviceTotalIcon,
  NORMAL: onlineDeviceIcon,
  OFFLINE: offlineDeviceIcon,
};

const ENERGY_METRIC_GLYPHS = {
  electric: "M13.2 2.5 7.6 13.2h3.7l-1.3 8.3 6.8-12.2h-3.8l.2-6.8Z",
  water: "M12 2.8c.4.6 1.4 2 2.5 3.7 1.7 2.6 3.7 5.8 3.7 8.1a6.2 6.2 0 1 1-12.4 0c0-2.3 2-5.5 3.7-8.1C10.6 4.8 11.6 3.4 12 2.8Z",
  gas: "M12 2.6c2.4 3.1 5.4 5.9 5.4 9.4a5.4 5.4 0 1 1-10.8 0c0-3.5 3-6.3 5.4-9.4Zm0 7.2c-.9 1.1-1.8 2.2-1.8 3.4a1.8 1.8 0 1 0 3.6 0c0-1.2-.9-2.3-1.8-3.4Z",
  default: "M12 3.2a8.8 8.8 0 1 0 0 17.6 8.8 8.8 0 0 0 0-17.6Zm0 2.2a6.6 6.6 0 1 1 0 13.2 6.6 6.6 0 0 1 0-13.2Z",
} as const;

type EnergyMetricKind = keyof typeof ENERGY_METRIC_GLYPHS;

const getEnergyMetricKind = (item: { instrumentType?: string; title?: string }): EnergyMetricKind => {
  const type = String(item.instrumentType || "").toLowerCase();
  const title = String(item.title || "");
  if (type.includes("water") || title.includes("水")) return "water";
  if (type.includes("electric") || title.includes("电")) return "electric";
  if (type.includes("gas") || title.includes("燃") || title.includes("气")) return "gas";
  return "default";
};

const getEnergyMetricGlyph = (item: { instrumentType?: string; title?: string }): string => ENERGY_METRIC_GLYPHS[getEnergyMetricKind(item)];

const getPopupContainer = (): HTMLElement => document.body;

export const RightNewV2 = defineComponent({
  name: "RightNewV2",
  setup() {
    const { globalState } = useStateStore();
    const { currentTheme } = useVisualTheme();

    const deviceParameter = reactive({
      areaId: globalState.business.currentAreaId,
      tagCodes: buildVisualMenuTagCodes(globalState.business.currentMenu),
      deviceState: true as boolean | undefined,
    });

    const deviceStatusType: Record<string, string> = {
      ALARM: "报警",
      TROUBLE: "故障",
      OFFLINE: "离线",
      NORMAL: "在线",
    };

    const workOrderTime = ref<ModelValueItf>();
    const energyUsageTime = ref<ModelValueItf>();
    const energyCarbonTime = ref<ModelValueItf>();
    const colorList = ["#FFAB10", "#2F8DFF", "#F14545", "#19F8F7"];
    const statusColorMap: Record<string, string> = {
      NORMAL: "#26C2BC",
      OFFLINE: "#FF4D4F",
      TROUBLE: "#7786a3",
      ALARM: "#FFAB10",
    };
    const statusClassMap: Record<string, { cardClass: string; iconClass: string; valueClass: string }> = {
      NORMAL: { cardClass: "is-online", iconClass: "icon-online", valueClass: "is-online-value" },
      OFFLINE: { cardClass: "is-offline", iconClass: "icon-offline", valueClass: "is-offline-value" },
      TROUBLE: { cardClass: "is-trouble", iconClass: "icon-trouble", valueClass: "is-trouble-value" },
      ALARM: { cardClass: "is-alarm", iconClass: "icon-alarm", valueClass: "is-alarm-value" },
    };

    const deviceTotal = ref(0);
    const deviceStatusItems = ref<Array<{ name: string; num: number }>>([]);
    const state = ref("water_meter");
    const deviceStateList = ref<Array<{ label: string; value: string }>>([]);
    const deviceModalShow = ref(false);
    const energyAnalysis = ref([
      { data: [] as Array<{ label: string; value: number; color: string }>, title: "电力", unit: "kWh" },
      { data: [] as Array<{ label: string; value: number; color: string }>, title: "水", unit: "m³" },
      { data: [] as Array<{ label: string; value: number; color: string }>, title: "燃气", unit: "m³" },
    ]);
    const visitingData = ref<Array<{ ratio: number; value: number; title: string; unit: string; instrumentType: string }>>([]);

    const receptionTrendsChartData = reactive({
      xData: ["4", "8", "12", "16", "20", "24h"],
      yData: [
        {
          data: [] as number[],
          linearGradientColor: ["rgba(120, 252, 252, 0.85)", "rgba(120, 252, 252, 0.08)"],
          lineColor: "rgba(120, 252, 252, 1)",
        },
      ],
      yUnit: "m³",
    });

    const trendChartUnit = computed(() => ({ x: "", y: receptionTrendsChartData.yUnit || "" }));

    const syncTrendSeriesStyle = (): void => {
      applyEnergyTrendSeriesStyle(receptionTrendsChartData.yData[0], currentTheme.value);
    };

    watch(currentTheme, syncTrendSeriesStyle, { immediate: true });

    const changeHandleworkOrderTime = async (): Promise<void> => {
      const params = {
        period: workOrderTime.value!.dateRange.join(","),
        type: workOrderTime.value!.timeType,
      };
      let res = await statCategoryAll(params);
      res = res.filter((item) => item.instrumentType !== "zh" && item.instrumentType !== "carbon");
      visitingData.value = res.map((item) => ({
        ratio: item.qoqValueRate || 0,
        value: item.value,
        title: item.instrumentTypeName || "",
        unit: getEnergyUnit(item.instrumentType),
        instrumentType: item.instrumentType,
      }));
    };

    const deviceStatusPieData = computed(() =>
      deviceStatusItems.value.map((item) => ({
        name: deviceStatusType[item.name] || item.name,
        value: item.num || 0,
        color: statusColorMap[item.name] || colorList[0],
        statusKey: item.name,
      })),
    );

    const deviceStatCards = computed(() => {
      const statusCards = ["NORMAL", "OFFLINE"]
        .map((key) => {
          const item = deviceStatusItems.value.find((row) => row.name === key);
          if (!item) return null;
          const classInfo = statusClassMap[key];
          return {
            label: deviceStatusType[key],
            value: item.num || 0,
            statusKey: key,
            iconSrc: deviceCardIcons[key],
            ...classInfo,
          };
        })
        .filter(Boolean);

      return [
        {
          label: "设备总数",
          value: deviceTotal.value,
          cardClass: "is-total",
          iconClass: "icon-total",
          iconSrc: deviceCardIcons.TOTAL,
          valueClass: "",
          statusKey: "TOTAL",
        },
        ...statusCards,
      ];
    });

    const handleDeviceStatClick = (card: { label?: string; statusKey?: string }): void => {
      if (card.statusKey === "TOTAL") {
        deviceParameter.deviceState = undefined;
      } else if (card.statusKey === "NORMAL" || card.label === "在线") {
        deviceParameter.deviceState = true;
      } else if (card.statusKey === "OFFLINE" || card.label === "离线") {
        deviceParameter.deviceState = false;
      } else {
        return;
      }
      deviceModalShow.value = true;
    };

    const changeEnergyCarbonTime = async (): Promise<void> => {
      const params = {
        type: energyCarbonTime.value!.timeType,
        period: energyCarbonTime.value!.dateRange.join(","),
        instrumentType: state.value,
      };
      const res = await dcStatTrend(params);
      receptionTrendsChartData.xData = mapEnergyTrendLabels(
        res.map((item) => item.time),
        energyCarbonTime.value!.timeType,
      );
      receptionTrendsChartData.yData[0].data = res.map((item) => item.value);
      receptionTrendsChartData.yUnit = getEnergyUnit(state.value);
    };

    const changeAppointmentTime = async (): Promise<void> => {
      const params = {
        period: energyUsageTime.value!.dateRange.join(","),
        type: energyUsageTime.value!.timeType,
        projectCategory: "ITEM",
      };
      const electricity = await projectStatCategory(Object.assign(params, { instrumentType: "electricity_meter" }));
      energyAnalysis.value[0].data = electricity.map((item, index) => ({
        label: item.name,
        value: item.value,
        color: colorList[index],
      }));
      const water = await projectStatCategory(Object.assign(params, { instrumentType: "water_meter" }));
      energyAnalysis.value[1].data = water.map((item, index) => ({
        label: item.name,
        value: item.value,
        color: colorList[index],
      }));
      const gasMeter = await projectStatCategory(Object.assign(params, { instrumentType: "gas_meter" }));
      energyAnalysis.value[2].data = gasMeter.map((item, index) => ({
        label: item.name,
        value: item.value,
        color: colorList[index],
      }));
    };

    const getCollectConfigList = async (): Promise<void> => {
      const res = await collectConfigList();
      deviceStateList.value = res.map((e) => ({
        label: e.categoryName,
        value: e.categoryCode,
      }));
      const waterItem = deviceStateList.value.find((item) => item.value === "water_meter" || item.label === "水");
      state.value = waterItem?.value ?? deviceStateList.value[0]?.value ?? "water_meter";
      if (energyCarbonTime.value) {
        await changeEnergyCarbonTime();
      }
    };

    const deviceDataInfo = async (): Promise<void> => {
      const params = {
        sceneType: globalState.business.currentMenu,
        areaId: globalState.business.currentAreaId,
      };
      const res = await equipmentTotal(params);
      if (!res?.deviceNum) {
        deviceTotal.value = 0;
        deviceStatusItems.value = [];
        return;
      }
      deviceTotal.value = res.deviceNum;
      deviceStatusItems.value = res.deviceStatusNums || [];
    };

    onMounted(() => {
      deviceDataInfo();
      getCollectConfigList();
    });

    const renderStatisticsGrid = (isZoom: boolean): JSX.Element => (
      <div class={["statistics-grid", isZoom ? "is-zoom" : ""]}>
        {visitingData.value.map((item) => (
          <div class="stat-metric-card" key={`${isZoom ? "zoom-" : ""}${item.title}`}>
            <div class={["stat-metric-icon", `is-${getEnergyMetricKind(item)}`]} aria-hidden="true">
              <span class="stat-metric-badge">
                <svg class="stat-metric-badge-svg" viewBox="0 0 24 24">
                  <path d={getEnergyMetricGlyph(item)} fill="currentColor" />
                </svg>
              </span>
            </div>
            <div class="stat-metric-content">
              <div class="stat-metric-label">{item.title}</div>
              <div class="stat-metric-value-row">
                <div class="stat-metric-value-wrap">
                  <CountTo class="stat-metric-value" startVal={0} endVal={item.value} separator="" duration={2000} />
                  {item.unit ? <span class="stat-metric-unit">{item.unit}</span> : null}
                </div>
                <div class="stat-metric-ratio">
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

    const renderTypeSelect = (isZoom: boolean): JSX.Element => (
      <div class={["type-select-bar", isZoom ? "is-zoom" : ""]}>
        <a-select
          value={state.value}
          onUpdate:value={(v: string) => {
            state.value = v;
          }}
          class="panel-filter-select energy-type-select"
          popupClassName="visual-data-modal-dropdown"
          dropdownClassName="visual-data-modal-dropdown"
          getPopupContainer={getPopupContainer}
          dropdownMatchSelectWidth={false}
          onChange={changeEnergyCarbonTime}
          v-slots={{
            suffixIcon: () => <CaretDownOutlined class="type-filter-arrow" />,
          }}
        >
          {deviceStateList.value.map((item) => (
            <a-select-option key={`${isZoom ? "zoom-" : ""}${item.value}`} value={item.value}>
              {item.label}
            </a-select-option>
          ))}
        </a-select>
      </div>
    );

    const renderUsageTrend = (isZoom: boolean): JSX.Element => (
      <>
        {renderTypeSelect(isZoom)}
        <div class={["chart-panel", isZoom ? "is-zoom" : ""]}>
          <LineChart
            x-data={receptionTrendsChartData.xData}
            series={receptionTrendsChartData.yData}
            showLegend={false}
            grid-top={isZoom ? "10" : "8"}
            grid-left="2"
            grid-right="2"
            grid-bottom={isZoom ? "18" : "22"}
            visible-count={isZoom ? 8 : 5}
            unit={trendChartUnit.value}
          />
        </div>
      </>
    );

    return (): JSX.Element => (
      <div class="energy-right-v2-root">
        <SubPanelTemplate
          title="能耗用能统计"
          class="visual-v2-sub-panel energy-panel-v2 energy-statistics-panel"
          zoomable
          zoom-title="能耗用能统计详情"
          zoom-width={640}
          v-slots={{
            titleIcon: () => <img src={energyConsumptionIcon} alt="" class="title-card-icon" />,
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
                {renderStatisticsGrid(false)}
              </div>
            ),
            "zoom-content": () => (
              <div class="energy-statistics-panel is-zoom" data-no-zoom>
                {renderStatisticsGrid(true)}
              </div>
            ),
          }}
        />

        <SubPanelTemplate
          title="能耗用能趋势图"
          class="visual-v2-sub-panel energy-panel-v2 energy-usage-trend-panel"
          zoomable
          zoom-title="能耗用能趋势图详情"
          zoom-width={760}
          v-slots={{
            titleIcon: () => <img src={alarmTrendIcon} alt="" class="title-card-icon" />,
            extra: () => (
              <DateInlineForm
                modelValue={energyCarbonTime.value}
                onUpdate:modelValue={(v) => {
                  energyCarbonTime.value = v;
                }}
                data-no-zoom
                onSearch={changeEnergyCarbonTime}
              />
            ),
            default: () => (
              <div class="energy-panel-body" data-no-zoom>
                {renderUsageTrend(false)}
              </div>
            ),
            "zoom-content": () => (
              <div class="energy-usage-trend-panel is-zoom" data-no-zoom>
                {renderUsageTrend(true)}
              </div>
            ),
          }}
        />

        <SubPanelTemplate
          title="用能分析"
          class="visual-v2-sub-panel energy-panel-v2 energy-analysis-panel"
          zoomable
          zoom-title="用能分析详情"
          zoom-width={720}
          v-slots={{
            titleIcon: () => <img src={alarmTrendIcon} alt="" class="title-card-icon" />,
            extra: () => (
              <DateInlineForm
                modelValue={energyUsageTime.value}
                onUpdate:modelValue={(v) => {
                  energyUsageTime.value = v;
                }}
                data-no-zoom
                onSearch={changeAppointmentTime}
              />
            ),
            default: () => (
              <div class="energy-panel-body" data-no-zoom>
                <EnergyAnalysisBody categories={energyAnalysis.value} />
              </div>
            ),
            "zoom-content": () => (
              <div class="energy-panel-body energy-analysis-panel is-zoom" data-no-zoom>
                <EnergyAnalysisBody categories={energyAnalysis.value} isZoom expandAll />
              </div>
            ),
          }}
        />

        <SubPanelTemplate
          title="设备状态分布"
          class="visual-v2-sub-panel energy-panel-v2 energy-device-panel"
          zoomable
          zoom-title="设备状态分布详情"
          zoom-width={720}
          v-slots={{
            titleIcon: () => <img src={deviceSituationIcon} alt="" class="title-card-icon" />,
            default: () => (
              <div class="energy-panel-body" data-no-zoom>
                <div class="energy-device-panel equipment-status-overview-v2-panel">
                  <DeviceStatusBody
                    statCards={deviceStatCards.value as never}
                    pieData={deviceStatusPieData.value}
                    deviceTotal={deviceTotal.value}
                    onClick-stat={handleDeviceStatClick}
                  />
                </div>
              </div>
            ),
            "zoom-content": () => (
              <div class="energy-device-panel equipment-status-overview-v2-panel is-zoom" data-no-zoom>
                <DeviceStatusBody
                  statCards={deviceStatCards.value as never}
                  pieData={deviceStatusPieData.value}
                  deviceTotal={deviceTotal.value}
                  isZoom
                  onClick-stat={handleDeviceStatClick}
                />
              </div>
            ),
          }}
        />

        <modalEquipmentAllTable
          show-modal={deviceModalShow.value}
          parameter={deviceParameter}
          onClose={() => {
            deviceModalShow.value = false;
          }}
        />
      </div>
    );
  },
});

export default RightNewV2;
