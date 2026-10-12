import * as echarts from "echarts";
import { PieChart } from "echarts/charts";
import { TooltipComponent, LegendComponent } from "echarts/components";
import { use } from "echarts/core";
import { defineComponent, ref, onMounted, onUnmounted, nextTick } from "vue";

import CardTitleIcon from "@/features/cards/_shared/card-title-icon/card-title-icon";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { cubeThirdConnectionService } from "@/infrastructure/api/service";
import { calcFontSize } from "@/infrastructure/utils/common";
import { getVisualThemeChartColors, VISUAL_THEME_CHANGE_EVENT } from "@/infrastructure/utils/visual-theme";

import "../educational-situation-v2-shared.module.less";

use([PieChart, TooltipComponent, LegendComponent]);

const PANEL_CLASS = "visual-v2-sub-panel v2-panel-card educational-v2-panel";
type ChartMode = "normal" | "zoom";
export const classNumberStatistics = defineComponent({
  name: "classNumberStatistics",
  setup() {
    const chartRefs: Partial<Record<ChartMode, HTMLElement>> = {};
    const chartInstances: Partial<Record<ChartMode, echarts.ECharts>> = {};
    const colors = ["#3B82F6", "#F59E0B", "#10B981"];
    const resultData = ref<{ name: string; value: number; ratio: number; itemStyle: { color: string } }[]>([
      {
        name: "市委党校",
        value: 0,
        ratio: 0,
        itemStyle: { color: colors[0] },
      },
      {
        name: "社会主义学院",
        value: 0,
        ratio: 0,
        itemStyle: { color: colors[1] },
      },
      {
        name: "委托办班",
        value: 0,
        ratio: 0,
        itemStyle: { color: colors[2] },
      },
    ]);
    const getData = async (): Promise<void> => {
      try {
        const res = await cubeThirdConnectionService.getEducationalDataOverview();
        if (!res) return;
        const { wtbb_num = 0, shzyxy_num = 0, swdx_num = 0 } = res;
        const total = wtbb_num + shzyxy_num + swdx_num;
        resultData.value = [
          {
            name: "市委党校",
            value: swdx_num ?? 0,
            ratio: swdx_num && total ? (swdx_num / total) * 100 : 0,
            itemStyle: { color: colors[0] },
          },
          {
            name: "社会主义学院",
            value: shzyxy_num ?? 0,
            ratio: shzyxy_num && total ? (shzyxy_num / total) * 100 : 0,
            itemStyle: { color: colors[1] },
          },
          {
            name: "委托办班",
            value: wtbb_num ?? 0,
            ratio: wtbb_num && total ? (wtbb_num / total) * 100 : 0,
            itemStyle: { color: colors[2] },
          },
        ];
      } catch {
        // 保留固定统计结构，接口失败或全 0 时仍展示三个业务分类。
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
          trigger: "item",
          backgroundColor: theme.tooltipBg,
          borderColor: theme.tooltipBorder,
          textStyle: { color: theme.tooltipText },
          formatter: (params): string => {
            const percentage = params.data.ratio ? params.data.ratio.toFixed(0) : 0;
            return `<div style="display:flex;align-items:center;">
              <span style="display:inline-block;width:10px;height:10px;border-radius:50%;background-color:${params.color};margin-right:5px;"></span>
              <span>${params.name}</span>
            </div>
            数量：${params.value}次<br/>占比：${percentage}%`;
          },
        },
        legend: {
          orient: "vertical",
          right: calcFontSize(10),
          top: "center",
          itemWidth: calcFontSize(10),
          itemHeight: calcFontSize(10),
          textStyle: {
            color: theme.axis,
            fontSize: calcFontSize(12),
          },
          formatter: (name) => {
            const item = resultData.value.find((data) => data.name === name);
            if (item) {
              return `${name}  ${item.value}次`;
            }
            return name;
          },
        },
        series: [
          {
            type: "pie",
            radius: "55%",
            center: ["35%", "50%"],
            avoidLabelOverlap: true,
            data: resultData.value,

            label: {
              show: true,
              position: "inside",
              formatter: (params): string => {
                return `${params.data.value}次`;
              },
              color: theme.label,
              fontSize: calcFontSize(12),
              lineHeight: 15,
              padding: [0, -5, 0, -5],
              distance: calcFontSize(5),
              overflow: "none",
            },
            labelLine: {
              show: true,
              smooth: 0.2,
              length: calcFontSize(12),
              length2: calcFontSize(12),
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
          <div ref={(element) => setChartRef(mode, element)} class="educational-chart" />
        </div>
      </div>
    );

    return (): JSX.Element => (
      <div class="educational-v2-root v2-panel-root">
        <SubPanelTemplate
          title="班次数量统计"
          class={PANEL_CLASS}
          zoomable
          zoom-title="班次数量统计详情"
          zoom-width={860}
          v-slots={{
            titleIcon: () => <CardTitleIcon name="asset-management-classification" />,
            default: () => renderBody("normal"),
            "zoom-content": () => renderBody("zoom"),
          }}
        />
      </div>
    );
  },
});
