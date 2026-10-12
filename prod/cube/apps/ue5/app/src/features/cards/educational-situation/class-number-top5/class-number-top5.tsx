import * as echarts from "echarts";
import { BarChart } from "echarts/charts";
import { TooltipComponent, GridComponent } from "echarts/components";
import { use } from "echarts/core";
import { defineComponent, nextTick, onMounted, onUnmounted, ref, provide } from "vue";

import CardTitleIcon from "@/features/cards/_shared/card-title-icon/card-title-icon";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { cubeThirdConnectionService } from "@/infrastructure/api/service";
import { calcFontSize } from "@/infrastructure/utils/common";
import { getVisualThemeChartColors, VISUAL_THEME_CHANGE_EVENT } from "@/infrastructure/utils/visual-theme";
import NoData from "@/shared-ui/panel/noData";
import { panelCardLoadedKey } from "@/shared-ui/panel/panel-card-loaded-context";
import PanelCardLoading from "@/shared-ui/panel/panel-card-loading";

import "../educational-situation-v2-shared.module.less";

use([BarChart, TooltipComponent, GridComponent]);

const PANEL_CLASS = "visual-v2-sub-panel v2-panel-card educational-v2-panel";
type ChartMode = "normal" | "zoom";

export const classNumberTop5 = defineComponent({
  name: "classNumberTop5",
  setup() {
    const resultData = ref<{ name: string; value: number; ratio: number }[]>([]);
    const totalNum = ref(0);
    const loaded = ref(false);
    provide(panelCardLoadedKey, loaded);
    const chartRefs: Partial<Record<ChartMode, HTMLElement>> = {};
    const chartInstances: Partial<Record<ChartMode, echarts.ECharts>> = {};

    const getData = async (): Promise<void> => {
      try {
        const res = await cubeThirdConnectionService.getEducationalDataOverview();
        const sortData = [...(res?.classTopList ?? [])].sort((a, b) => b.value - a.value).slice(0, 5);
        totalNum.value = sortData.reduce((total, item) => total + (Number(item.value) || 0), 0);
        resultData.value = sortData.map((item) => ({
          name: item.name,
          value: Number(item.value) || 0,
          ratio: totalNum.value > 0 ? +((item.value / totalNum.value) * 100).toFixed(2) : 0,
        }));
      } catch {
        resultData.value = [];
      } finally {
        loaded.value = true;
      }
    };

    const updateChart = (mode: ChartMode): void => {
      const chartRef = chartRefs[mode];
      if (!chartRef) return;
      const chartInstance = chartInstances[mode] ?? echarts.init(chartRef);
      chartInstances[mode] = chartInstance;

      const theme = getVisualThemeChartColors();
      const option = {
        tooltip: {
          trigger: "axis",
          backgroundColor: theme.tooltipBg,
          borderColor: theme.tooltipBorder,
          textStyle: { color: theme.tooltipText },
          axisPointer: {
            type: "shadow",
          },
          formatter: (params): string => {
            const data = params[0];
            return `<div style="display:flex;align-items:center;">
              <span>${data.name}</span>
            </div>
            人数：${data.value}个<br/>
            占比：${resultData.value[data.dataIndex].ratio}%`;
          },
        },
        grid: {
          left: calcFontSize(4),
          right: calcFontSize(42),
          top: calcFontSize(10),
          bottom: calcFontSize(4),
          containLabel: true,
        },
        xAxis: {
          type: "value",
          axisLabel: {
            color: theme.axis,
            fontSize: calcFontSize(12),
          },
          splitLine: {
            lineStyle: {
              color: theme.splitLine,
              type: "dashed",
            },
          },
          axisLine: {
            lineStyle: {
              color: theme.axisLine,
            },
          },
        },
        yAxis: {
          type: "category",
          data: resultData.value?.map((item) => item.name),
          inverse: true,
          axisLabel: {
            color: theme.axis,
            fontSize: calcFontSize(12),
            width: calcFontSize(82),
            overflow: "truncate",
          },
          axisLine: {
            lineStyle: {
              color: theme.axisLine,
            },
          },
        },
        series: [
          {
            type: "bar",
            data: resultData.value.map((item) => ({
              value: item.value,
              itemStyle: {
                color: new echarts.graphic.LinearGradient(1, 0, 0, 0, [
                  { offset: 0, color: "#3b82f6" },
                  { offset: 1, color: "rgba(59, 130, 246, 0.3)" },
                ]),
              },
            })),
            barWidth: resultData.value.length > 3 ? calcFontSize(20) : calcFontSize(30),
            label: {
              show: true,
              position: "right",
              formatter: "{c}个",
              color: theme.label,
              fontSize: calcFontSize(12),
              distance: 5,
              overflow: "truncate",
            },
          },
        ],
      };
      chartInstance.setOption(option, true);
    };

    const setChartRef = (mode: ChartMode, element: unknown): void => {
      if (!(element instanceof HTMLElement) || chartRefs[mode] === element) return;
      chartInstances[mode]?.dispose();
      delete chartInstances[mode];
      chartRefs[mode] = element;
      void nextTick(() => updateChart(mode));
    };

    const load = async (): Promise<void> => {
      await getData();
      await nextTick();
      updateChart("normal");
      updateChart("zoom");
    };

    const handleResize = (): void => Object.values(chartInstances).forEach((chart) => chart?.resize());
    const handleThemeChange = (): void => {
      updateChart("normal");
      updateChart("zoom");
    };

    onMounted(async () => {
      await nextTick();
      void load();
      window.addEventListener("resize", handleResize);
      window.addEventListener(VISUAL_THEME_CHANGE_EVENT, handleThemeChange);
    });

    onUnmounted(() => {
      Object.values(chartInstances).forEach((chart) => chart?.dispose());
      window.removeEventListener("resize", handleResize);
      window.removeEventListener(VISUAL_THEME_CHANGE_EVENT, handleThemeChange);
    });

    const renderBody = (mode: ChartMode): JSX.Element => (
      <div class={["educational-card-body", mode === "zoom" ? "is-zoom" : ""]}>
        <div class="educational-chart-wrap">
          <div
            ref={(element) => setChartRef(mode, element)}
            class="educational-chart"
            style={{ visibility: resultData.value.length ? "visible" : "hidden" }}
          />
          {!loaded.value ? (
            <PanelCardLoading zoom={isZoom} />
          ) : resultData.value.length === 0 ? (
            <div class="educational-empty">
              <NoData />
            </div>
          ) : null}
        </div>
      </div>
    );

    return (): JSX.Element => (
      <div class="educational-v2-root v2-panel-root">
        <SubPanelTemplate
          title="班级人数TOP5"
          class={PANEL_CLASS}
          zoomable
          zoom-title="班级人数TOP5详情"
          zoom-width={900}
          v-slots={{
            titleIcon: () => <CardTitleIcon name="broadcast-ranking" />,
            default: () => renderBody("normal"),
            "zoom-content": () => renderBody("zoom"),
          }}
        />
      </div>
    );
  },
});
