import { defineComponent, onMounted, reactive, ref } from "vue";

import CardTitleIcon from "@/features/cards/_shared/card-title-icon/card-title-icon";
import { BOILER_PANEL_CLASS, boilerZoomClass } from "@/features/cards/boiler/_shared/boiler-panel-context";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { getTemperatureTrend } from "@/infrastructure/api/securitymanagement";
import DateInlineForm from "@/shared-ui/panel/dateInlineForm";
import LineChart from "@/shared-ui/panel/lineChart";
import { ModelValueItf } from "@/shared-ui/panel/types";
import { useStateStore } from "@/visualization-core/stores/use-state-store";

import "../_shared/boiler-v2-shared.module.less";

import styles from "./temperature-trend.module.less";

const LINE_COLORS = ["#2989FF", "#19F8F7", "#FFC700", "#FF6E23"];

export const TemperatureTrend = defineComponent({
  name: "TemperatureTrend",
  setup() {
    const { globalState } = useStateStore();
    const RunTimeTime = ref<ModelValueItf>({
      timeType: "TODAY",
      dateRange: [],
    });
    const state = reactive({
      temperTrendData: {
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

    const changeRunTimeTimeTime = async (): Promise<void> => {
      const param = {
        sceneType: globalState.business.currentMenu,
        areaId: globalState.business.currentAreaId,
        period: RunTimeTime.value.dateRange.join(","),
        type: RunTimeTime.value.timeType,
      };
      try {
        const result = await getTemperatureTrend(param);
        const dataMap = result?.dataMap && Object.keys(result.dataMap).length ? result.dataMap : {};
        const xtitle = Array.isArray(result?.xtitle) ? result.xtitle : [];
        state.temperTrendData.xData = xtitle.map((item: string) => {
          if (RunTimeTime.value.timeType === "TODAY") return `${item}时`;
          if (RunTimeTime.value.timeType === "THIS_YEAR") return `${item}月`;
          return item;
        });
        state.temperTrendData.data = handleDataMap(xtitle, dataMap);
        state.temperTrendData.title = Object.keys(dataMap);
      } catch {
        state.temperTrendData.xData = [];
        state.temperTrendData.data = [];
        state.temperTrendData.title = [];
      }
    };

    onMounted(() => {
      void changeRunTimeTimeTime();
    });

    const renderBody = (isZoom: boolean): JSX.Element => (
      <div class={[styles.body, "boiler-card-body", isZoom ? boilerZoomClass : ""]} data-no-zoom>
        <div class={[styles.chart, "boiler-chart-surface", isZoom ? styles.zoomChart : ""]}>
          <LineChart
            titles={state.temperTrendData.title}
            colors={LINE_COLORS}
            gridTop="28"
            gridLeft="4"
            gridRight="4"
            gridBottom="10"
            showLegend
            unit={{ x: "", y: "℃" }}
            axisPointer
            height={isZoom ? 360 : 198}
            x-data={state.temperTrendData.xData}
            series={state.temperTrendData.data}
          />
        </div>
      </div>
    );

    return (): JSX.Element => (
      <div class="boiler-v2-root v2-panel-root">
        <SubPanelTemplate
          title="实时温度趋势"
          class={BOILER_PANEL_CLASS}
          zoomable
          zoom-title="实时温度趋势详情"
          zoom-width={1000}
          v-slots={{
            titleIcon: () => <CardTitleIcon name="boiler-temperature" />,
            extra: () => (
              <div class="boiler-header-toolbar" data-no-zoom>
                <DateInlineForm
                  modelValue={RunTimeTime.value}
                  onUpdate:modelValue={(v) => {
                    RunTimeTime.value = v;
                  }}
                  onSearch={changeRunTimeTimeTime}
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

export default TemperatureTrend;
