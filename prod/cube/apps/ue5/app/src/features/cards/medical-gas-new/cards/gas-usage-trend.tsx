import { computed, defineComponent, onMounted, ref } from "vue";

import CardTitleIcon from "@/features/cards/_shared/card-title-icon/card-title-icon";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { gasUsageTrend } from "@/infrastructure/api/device";
import DateInlineForm from "@/shared-ui/panel/dateInlineForm";
import LineChart from "@/shared-ui/panel/lineChart";
import NoData from "@/shared-ui/panel/noData";
import { ModelValueItf } from "@/shared-ui/panel/types";
import { useStateStore } from "@/visualization-core/stores/use-state-store";

import "./medical-gas-v2-shared.module.less";

const PANEL_CLASS = "visual-v2-sub-panel v2-panel-card medical-gas-v2-panel";

type GasTrendSeries = {
  name: string;
  data: number[];
  linearGradientColor?: string[];
  lineColor?: string;
  showSymbol?: boolean;
  smooth?: boolean;
  symbolSize?: number;
};

export const GasUsageTrend = defineComponent({
  name: "GasUsageTrend",
  setup() {
    const { globalState } = useStateStore();
    const gasTime = ref<ModelValueItf>({ timeType: "TODAY", dateRange: [] });
    const titles = ref<string[]>([]);
    const xDataGas = ref<string[]>([]);
    const yDataGas = ref<GasTrendSeries[]>([]);
    const hasChartData = computed(
      () =>
        xDataGas.value.length > 0 &&
        yDataGas.value.some((series) => Array.isArray(series.data) && series.data.some((value) => Number(value) > 0)),
    );

    const getGasData = async () => {
      const params = {
        sceneType: globalState.business.currentMenu,
        areaId: globalState.business.currentAreaId,
        period: gasTime.value.dateRange.join(","),
        type: gasTime.value.timeType,
      };
      const res = (await gasUsageTrend(params)) || {};
      const xTitle = Array.isArray(res.xtitle) ? res.xtitle : [];
      const gasDataMap = res.medicalGasDataVos || {};

      xDataGas.value = xTitle;
      titles.value = [];
      yDataGas.value = [];

      Object.keys(gasDataMap).forEach((key) => {
        const sourceList = Array.isArray(gasDataMap[key]) ? gasDataMap[key] : [];
        const data = xTitle.map((timeFlag: string) => {
          const matched = sourceList.find((item: any) => item?.timeFlag === timeFlag);
          return Number(matched?.num || 0);
        });
        titles.value.push(key);
        yDataGas.value.push({ name: key, data });
      });
    };

    onMounted(() => {
      getGasData();
    });

    const renderToolbar = (): JSX.Element => (
      <div class="medical-gas-v2-toolbar" data-no-zoom>
        <DateInlineForm
          modelValue={gasTime.value}
          onUpdate:modelValue={(v) => {
            gasTime.value = v;
          }}
          onSearch={getGasData}
        />
      </div>
    );

    const renderBody = (isZoom: boolean): JSX.Element => (
      <div class={["medical-gas-v2-body", isZoom ? "is-zoom" : ""]} data-no-zoom>
        {hasChartData.value ? (
          <div class={["medical-gas-chart", "medical-gas-v2-surface", isZoom ? "is-zoom" : ""]}>
            <LineChart
              x-data={xDataGas.value}
              series={yDataGas.value}
              showLegend={true}
              showBackground={true}
              titles={titles.value}
              gridTop="15"
              gridBottom="10"
              axisPointer={true}
            />
          </div>
        ) : (
          <div class={["medical-gas-v2-empty", "medical-gas-v2-surface", isZoom ? "is-zoom" : ""]}>
            <NoData />
          </div>
        )}
      </div>
    );

    return (): JSX.Element => (
      <div class="medical-gas-v2-root">
        <SubPanelTemplate
          title="气体使用趋势"
          class={PANEL_CLASS}
          zoomable
          zoom-title="气体使用趋势详情"
          zoom-width={1000}
          v-slots={{
            titleIcon: () => <CardTitleIcon name="medical-gas-trend" />,
            extra: renderToolbar,
            default: () => renderBody(false),
            "zoom-content": () => renderBody(true),
          }}
        />
      </div>
    );
  },
});

export default GasUsageTrend;
