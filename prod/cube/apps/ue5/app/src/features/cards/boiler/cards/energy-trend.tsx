import { defineComponent, onMounted, reactive, ref } from "vue";

import CardTitleIcon from "@/features/cards/_shared/card-title-icon/card-title-icon";
import { BOILER_PANEL_CLASS, boilerZoomClass } from "@/features/cards/boiler/_shared/boiler-panel-context";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { getElectricityTrend } from "@/infrastructure/api/securitymanagement";
import DateInlineForm from "@/shared-ui/panel/dateInlineForm";
import LineChart from "@/shared-ui/panel/lineChart";
import { ModelValueItf } from "@/shared-ui/panel/types";
import { useStateStore } from "@/visualization-core/stores/use-state-store";

import "../_shared/boiler-v2-shared.module.less";

import styles from "./energy-trend.module.less";

const LINE_COLORS = ["#2989FF", "#19F8F7", "#FFC700", "#FF6E23"];

export const EnergyTrend = defineComponent({
  name: "EnergyTrend",
  setup() {
    const { globalState } = useStateStore();
    const energyTime = ref<ModelValueItf>({
      timeType: "TODAY",
      dateRange: [],
    });
    const state = reactive({
      electricityTrend: {
        xData: [] as string[],
        data: [] as Array<{ name: string; data: number[]; lineColor?: string; smooth?: boolean; showSymbol?: boolean }>,
        title: [] as string[],
      },
    });

    const handleDataMap = (xData: string[], dataMap: Record<string, Array<{ timeFlag?: string; dataValue?: number }>>) => {
      return Object.keys(dataMap || {}).map((item, index) => ({
        name: item,
        smooth: true,
        showSymbol: false,
        lineColor: LINE_COLORS[index % LINE_COLORS.length],
        data: xData.map((xItem) => {
          const hit = (dataMap[item] || []).find((row) => String(row.timeFlag) === String(xItem));
          return Number(hit?.dataValue) || 0;
        }),
      }));
    };

    const changeEnergyTime = async (): Promise<void> => {
      const param = {
        sceneType: globalState.business.currentMenu,
        areaId: globalState.business.currentAreaId,
        period: energyTime.value.dateRange.join(","),
        type: energyTime.value.timeType,
      };
      try {
        const result = await getElectricityTrend(param);
        const dataMap = result?.dataMap && Object.keys(result.dataMap).length ? result.dataMap : {};
        const xtitle = Array.isArray(result?.xtitle) ? result.xtitle : [];
        state.electricityTrend.xData = xtitle.map((item: string) => {
          if (energyTime.value.timeType === "TODAY") return `${item}时`;
          if (energyTime.value.timeType === "THIS_YEAR") return `${item}月`;
          return item;
        });
        state.electricityTrend.data = handleDataMap(xtitle, dataMap);
        state.electricityTrend.title = Object.keys(dataMap);
      } catch {
        state.electricityTrend.xData = [];
        state.electricityTrend.data = [];
        state.electricityTrend.title = [];
      }
    };

    onMounted(() => {
      void changeEnergyTime();
    });

    const renderBody = (isZoom: boolean): JSX.Element => (
      <div class={[styles.body, "boiler-card-body", isZoom ? boilerZoomClass : ""]} data-no-zoom>
        <div class={[styles.chart, "boiler-chart-surface", isZoom ? styles.zoomChart : ""]}>
          <LineChart
            titles={state.electricityTrend.title}
            colors={LINE_COLORS}
            gridTop="28"
            gridLeft="4"
            gridRight="4"
            gridBottom="10"
            showLegend
            unit={{ x: "", y: "kWh" }}
            axisPointer
            height={isZoom ? 360 : 198}
            x-data={state.electricityTrend.xData}
            series={state.electricityTrend.data}
          />
        </div>
      </div>
    );

    return (): JSX.Element => (
      <div class="boiler-v2-root v2-panel-root">
        <SubPanelTemplate
          title="用电趋势"
          class={BOILER_PANEL_CLASS}
          zoomable
          zoom-title="用电趋势详情"
          zoom-width={1000}
          v-slots={{
            titleIcon: () => <CardTitleIcon name="boiler-energy" />,
            extra: () => (
              <div class="boiler-header-toolbar" data-no-zoom>
                <DateInlineForm
                  modelValue={energyTime.value}
                  onUpdate:modelValue={(v) => {
                    energyTime.value = v;
                  }}
                  onSearch={changeEnergyTime}
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

export default EnergyTrend;
