import { CaretDownOutlined } from "@ant-design/icons-vue";
import { computed, defineComponent, onMounted, reactive, ref, watch } from "vue";

import { applyEnergyTrendSeriesStyle } from "../utils/energy-trend-chart-style";
import { getEnergyUnit } from "../utils/energy-units";
import EnergyUsingEnergyTrendModal from "./energy-using-energy-trend-modal";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { collectConfigList, dcStatTrend } from "@/infrastructure/api/energy";
import { mapEnergyTrendLabels } from "@/infrastructure/utils/chart-axis-style";
import { getThemeImage } from "@/infrastructure/utils/getImage";
import DateInlineForm from "@/shared-ui/panel/dateInlineForm";
import LineChart from "@/shared-ui/panel/lineChart";
import NoData from "@/shared-ui/panel/noData";
import { ModelValueItf } from "@/shared-ui/panel/types";
import { useVisualTheme } from "@/visualization-core/hooks/use-visual-theme";

import "./energy-consumption-trend.module.less";

const titleIcon = getThemeImage("alarm-trend.png");
const getPopupContainer = (): HTMLElement => document.body;

export const EnergyConsumptionTrend = defineComponent({
  name: "EnergyConsumptionTrend",
  props: {
    title: { type: String, required: true, default: "能耗用能趋势图" },
  },
  setup(props) {
    const { currentTheme } = useVisualTheme();
    const deviceStateList = ref<Array<{ label: string; value: string }>>([]);
    const state = ref("electricity_meter");
    const timeFrame = ref<ModelValueItf>({ timeType: "THIS_MONTH", dateRange: ["", ""] });
    const receptionTrendsChartData = reactive({
      xData: [] as string[],
      yData: [
        {
          data: [] as number[],
          linearGradientColor: ["rgba(120, 252, 252, 0.85)", "rgba(120, 252, 252, 0.08)"],
          lineColor: "rgba(120, 252, 252, 1)",
        },
      ],
      yUnit: "",
    });
    const show = ref(false);

    const trendChartUnit = computed(() => ({ x: "", y: receptionTrendsChartData.yUnit || "" }));
    const hasChartData = computed(
      () =>
        receptionTrendsChartData.xData.length > 0 &&
        receptionTrendsChartData.yData.some((series) => series.data.some((value) => Number(value) !== 0)),
    );

    const syncTrendSeriesStyle = (): void => {
      applyEnergyTrendSeriesStyle(receptionTrendsChartData.yData[0], currentTheme.value);
    };

    watch(currentTheme, syncTrendSeriesStyle, { immediate: true });

    const changeEnergyCarbonTime = async (): Promise<void> => {
      receptionTrendsChartData.xData = [];
      receptionTrendsChartData.yData[0].data = [];
      const params = {
        type: timeFrame.value.timeType,
        period: timeFrame.value.dateRange.join(","),
        instrumentType: state.value,
      };
      const res = await dcStatTrend(params);
      receptionTrendsChartData.xData = mapEnergyTrendLabels(
        res.map((item: { time: string | number }) => item.time),
        timeFrame.value.timeType,
      );
      receptionTrendsChartData.yData[0].data = res.map((item: { value: number }) => Number(item.value) || 0);
      receptionTrendsChartData.yUnit = getEnergyUnit(state.value);
    };

    const getCollectConfigList = async (): Promise<void> => {
      const res = await collectConfigList();
      deviceStateList.value = res.map((e: { categoryName: string; categoryCode: string }) => ({
        label: e.categoryName,
        value: e.categoryCode,
      }));
      if (deviceStateList.value.length > 0) {
        state.value = deviceStateList.value[0].value;
        await changeEnergyCarbonTime();
      }
    };

    const handleAll = (): void => {
      show.value = true;
    };

    const close = (): void => {
      show.value = false;
    };

    onMounted(() => {
      void getCollectConfigList();
    });

    const renderTypeSelect = (isZoom: boolean): JSX.Element => (
      <div class={["energy-v2-type-select-bar", isZoom ? "is-zoom" : ""]} data-no-zoom>
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

    const renderBody = (isZoom: boolean): JSX.Element => (
      <div class={["energy-v2-body", isZoom ? "is-zoom" : ""]} data-no-zoom>
        {renderTypeSelect(isZoom)}
        <div class={["energy-v2-chart-panel", isZoom ? "is-zoom" : ""]}>
          {hasChartData.value ? (
            <LineChart
              x-data={receptionTrendsChartData.xData}
              series={receptionTrendsChartData.yData}
              showLegend={false}
              grid-top={isZoom ? "28" : "30"}
              grid-left="8"
              grid-right="4"
              grid-bottom={isZoom ? "18" : "22"}
              visible-count={isZoom ? 8 : 5}
              unit={trendChartUnit.value}
              height={isZoom ? 450 : undefined}
            />
          ) : (
            <NoData />
          )}
        </div>
      </div>
    );

    return (): JSX.Element => (
      <div class="v2-panel-root energy-consumption-trend-v2-root">
        <SubPanelTemplate
          title={props.title}
          class="visual-v2-sub-panel v2-panel-card energy-v2-panel energy-consumption-trend-v2-panel"
          zoomable
          zoom-title={`${props.title}详情`}
          zoom-width={760}
          v-slots={{
            titleIcon: () => <img src={titleIcon} alt="" class="energy-v2-title-icon" />,
            extra: () => (
              <div class="energy-v2-filter-group" data-no-zoom>
                <DateInlineForm
                  modelValue={timeFrame.value}
                  onUpdate:modelValue={(v) => {
                    timeFrame.value = v;
                  }}
                  onSearch={changeEnergyCarbonTime}
                />
                <button
                  type="button"
                  class="energy-v2-more-link"
                  onPointerdown={(e) => e.stopPropagation()}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAll();
                  }}
                >
                  更多
                </button>
              </div>
            ),
            default: () => renderBody(false),
            "zoom-content": () => renderBody(true),
          }}
        />
        <EnergyUsingEnergyTrendModal showModal={show.value} onClose={close} />
      </div>
    );
  },
});

export default EnergyConsumptionTrend;
