import { CaretDownOutlined } from "@ant-design/icons-vue";
import moment from "moment";
import { computed, defineComponent, onMounted, reactive, ref, watch } from "vue";

import { applyEnergyTrendSeriesStyle } from "../utils/energy-trend-chart-style";
import { getEnergyUnit } from "../utils/energy-units";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { collectConfigList, statYearTrend } from "@/infrastructure/api/energy";
import { getThemeImage } from "@/infrastructure/utils/getImage";
import LineChart from "@/shared-ui/panel/lineChart";
import { useVisualTheme } from "@/visualization-core/hooks/use-visual-theme";

import "./annual-energy-consumption-trend.module.less";

const titleIcon = getThemeImage("alarm-trend.png");
const getPopupContainer = (): HTMLElement => document.body;
const ENERGY_TREND_SERIES_NAME_BY_TYPE: Record<string, string> = {
  electricity_meter: "用电量",
  water_meter: "用水量",
  gas_meter: "用气量",
  fuel_meter: "燃油用量",
  heat_meter: "供热量",
  cool_meter: "供冷量",
  renewable_energy: "可再生能源用量",
  carbon: "碳排放量",
  zh: "综合能耗",
  other: "其他用能量",
};

export const AnnualEnergyConsumptionTrend = defineComponent({
  name: "AnnualEnergyConsumptionTrend",
  props: {
    title: { type: String, required: true, default: "年度用能趋势图" },
  },
  setup(props) {
    const { currentTheme } = useVisualTheme();
    const state = ref("electricity_meter");
    const deviceStateList = ref<Array<{ label: string; value: string }>>([]);
    const deviceFailureTrendCharData = reactive({
      xData: [] as number[],
      yData: [
        {
          name: "用电量",
          data: [] as number[],
          showSymbol: true,
          linearGradientColor: ["rgba(120, 252, 252, 0.85)", "rgba(120, 252, 252, 0.08)"],
          lineColor: "rgba(120, 252, 252, 1)",
        },
      ],
    });

    const trendChartUnit = computed(() => ({ x: "", y: getEnergyUnit(state.value) }));

    const getTrendSeriesName = (): string => {
      const configuredName = ENERGY_TREND_SERIES_NAME_BY_TYPE[state.value];
      if (configuredName) return configuredName;

      const categoryName = deviceStateList.value.find((item) => item.value === state.value)?.label?.trim();
      if (!categoryName) return "用能量";
      return /(?:用量|用能|能耗|排放量|供热量|供冷量)$/.test(categoryName) ? categoryName : `${categoryName}用量`;
    };

    const syncTrendSeriesStyle = (): void => {
      applyEnergyTrendSeriesStyle(deviceFailureTrendCharData.yData[0], currentTheme.value);
    };

    watch(currentTheme, syncTrendSeriesStyle, { immediate: true });

    const getCollectConfigList = async (): Promise<void> => {
      const res = await collectConfigList();
      deviceStateList.value = res.map((e: { categoryName: string; categoryCode: string }) => ({
        label: e.categoryName,
        value: e.categoryCode,
      }));
      if (deviceStateList.value.length > 0) {
        state.value = deviceStateList.value[0].value;
      }
    };

    const changeEnergyCarbonTime = async (): Promise<void> => {
      deviceFailureTrendCharData.yData[0].name = getTrendSeriesName();
      const params = {
        instrumentType: state.value,
        period: moment().subtract(10, "years").format("YYYY-MM-DD HH:mm:ss") + "," + moment().format("YYYY-MM-DD HH:mm:ss"),
      };
      const year = Number(moment().subtract(10, "years").format("YYYY"));
      const thisYear = Number(moment().format("YYYY"));
      const data: { xData: number; value: number }[] = [];
      for (let index = year; index <= thisYear; index++) {
        data.push({ xData: index, value: 0 });
      }
      const res = await statYearTrend(params);
      data.forEach((item) => {
        res.forEach((e: { time: number; ddValue: number }) => {
          if (item.xData === e.time) {
            item.value = e.ddValue;
          }
        });
      });
      deviceFailureTrendCharData.xData = data.map((e) => e.xData);
      deviceFailureTrendCharData.yData[0].data = data.map((e) => e.value);
    };

    onMounted(async () => {
      await getCollectConfigList();
      await changeEnergyCarbonTime();
    });

    const renderBody = (isZoom: boolean): JSX.Element => (
      <div class={["energy-v2-body", isZoom ? "is-zoom" : ""]} data-no-zoom>
        <div class={["energy-v2-chart-panel", isZoom ? "is-zoom" : ""]}>
          <LineChart
            xData={deviceFailureTrendCharData.xData}
            series={deviceFailureTrendCharData.yData}
            showLegend={false}
            grid-top={isZoom ? "28" : "30"}
            grid-left="2"
            grid-right="2"
            grid-bottom={isZoom ? "18" : "22"}
            visible-count={isZoom ? 8 : 5}
            unit={trendChartUnit.value}
            tooltip-axis-value-suffix="年"
            height={isZoom ? 450 : undefined}
          />
        </div>
      </div>
    );

    return (): JSX.Element => (
      <div class="v2-panel-root annual-energy-consumption-trend-v2-root">
        <SubPanelTemplate
          title={props.title}
          class="visual-v2-sub-panel v2-panel-card energy-v2-panel annual-energy-consumption-trend-v2-panel"
          zoomable
          zoom-title={`${props.title}详情`}
          zoom-width={760}
          v-slots={{
            titleIcon: () => <img src={titleIcon} alt="" class="energy-v2-title-icon" />,
            extra: () => (
              <a-select
                value={state.value}
                onUpdate:value={(v: string) => {
                  state.value = v;
                }}
                class="panel-filter-select energy-v2-type-select"
                popupClassName="visual-data-modal-dropdown"
                dropdownClassName="visual-data-modal-dropdown"
                getPopupContainer={getPopupContainer}
                dropdownMatchSelectWidth={false}
                onChange={changeEnergyCarbonTime}
                data-no-zoom
                v-slots={{
                  suffixIcon: () => <CaretDownOutlined class="type-filter-arrow" />,
                }}
              >
                {deviceStateList.value.map((item) => (
                  <a-select-option key={item.value} value={item.value}>
                    {item.label}
                  </a-select-option>
                ))}
              </a-select>
            ),
            default: () => renderBody(false),
            "zoom-content": () => renderBody(true),
          }}
        />
      </div>
    );
  },
});

export default AnnualEnergyConsumptionTrend;
