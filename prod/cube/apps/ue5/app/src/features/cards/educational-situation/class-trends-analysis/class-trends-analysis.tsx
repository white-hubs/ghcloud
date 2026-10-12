import * as echarts from "echarts";
import { LineChart } from "echarts/charts";
import { GridComponent, TitleComponent, TooltipComponent, LegendComponent } from "echarts/components";
import { use } from "echarts/core";
import { defineComponent, ref, onMounted, onUnmounted, nextTick, provide } from "vue";

import { TreadListItem } from "@ghcloud/cube-third-connection-service";

import CardTitleIcon from "@/features/cards/_shared/card-title-icon/card-title-icon";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { cubeThirdConnectionService } from "@/infrastructure/api/service";
import { calcFontSize } from "@/infrastructure/utils/common";
import { getVisualThemeChartColors, VISUAL_THEME_CHANGE_EVENT } from "@/infrastructure/utils/visual-theme";
import NoData from "@/shared-ui/panel/noData";
import { panelCardLoadedKey } from "@/shared-ui/panel/panel-card-loaded-context";
import PanelCardLoading from "@/shared-ui/panel/panel-card-loading";

import "../educational-situation-v2-shared.module.less";

use([LineChart, GridComponent, TitleComponent, TooltipComponent, LegendComponent]);

const PANEL_CLASS = "visual-v2-sub-panel v2-panel-card educational-v2-panel";
type ChartMode = "normal" | "zoom";

export const classTrendsAnalysis = defineComponent({
  name: "classTrendsAnalysis",
  setup() {
    const chartRefs: Partial<Record<ChartMode, HTMLElement>> = {};
    const chartInstances: Partial<Record<ChartMode, echarts.ECharts>> = {};
    const resultData = ref<TreadListItem[]>([]);
    const loaded = ref(false);
    provide(panelCardLoadedKey, loaded);
    const getData = async (): Promise<void> => {
      try {
        const res = await cubeThirdConnectionService.getEducationalDataOverview();
        resultData.value = res?.treadList ?? [];
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
      const currentData = {
        xData: resultData.value.map((item) => item.year ?? ""),
        training: resultData.value.map((item) => item.trainNumber ?? 0),
        class: resultData.value.map((item) => item.classNumber ?? 0),
      };
      const option = {
        backgroundColor: "transparent",
        tooltip: {
          trigger: "axis",
          backgroundColor: theme.tooltipBg,
          borderColor: theme.tooltipBorder,
          textStyle: { color: theme.tooltipText },
          axisPointer: {
            type: "shadow",
          },
          formatter: (params): string => {
            let result = `${params[0].name}<br/>`;
            params.forEach((param) => {
              const colorSpan = `<span style="display:inline-block;margin-right:5px;border-radius:50%;width:10px;height:10px;background-color:${param.color};"></span>`;
              if (param.seriesName === "培训人数") {
                result += `${colorSpan}培训人数：${param.value}个<br/>`;
              } else if (param.seriesName === "班次总数") {
                result += `${colorSpan}班次总数：${param.value}次<br/>`;
              }
            });
            return result;
          },
        },
        legend: {
          data: ["培训人数", "班次总数"],
          right: "5%",
          top: "2%",
          textStyle: {
            color: theme.axis,
            fontSize: calcFontSize(12),
          },
          // 添加图例图标样式
          icon: "circle",
          itemWidth: calcFontSize(10),
          itemHeight: calcFontSize(10),
          // 设置图例颜色
          inactiveColor: theme.muted,
          // 自定义图例颜色
          formatter: function (name) {
            return name;
          },
        },
        grid: {
          top: calcFontSize(40),
          left: calcFontSize(0),
          right: calcFontSize(20),
          bottom: calcFontSize(0),
          containLabel: true,
        },
        xAxis: {
          type: "category",
          boundaryGap: false,
          data: currentData.xData,
          nameLocation: "end",
          nameGap: calcFontSize(8),
          nameTextStyle: {
            color: theme.axis,
            fontSize: calcFontSize(12),
          },
          axisLine: {
            lineStyle: {
              color: theme.axisLine,
            },
          },
          axisLabel: {
            color: theme.axis,
            fontSize: calcFontSize(12),
            margin: calcFontSize(12),
            interval: "auto",
          },
          axisTick: {
            alignWithLabel: true,
          },
        },
        yAxis: {
          type: "value",
          name: "",
          nameTextStyle: {
            color: theme.axis,
            fontSize: calcFontSize(12),
          },
          axisLine: {
            lineStyle: {
              color: theme.axisLine,
            },
          },
          axisLabel: {
            color: theme.axis,
            fontSize: calcFontSize(12),
          },
          splitLine: {
            lineStyle: {
              color: theme.splitLine,
            },
          },
          // 确保刻度线对齐数据
          alignTicks: true,
        },
        series: [
          {
            name: "培训人数",
            type: "line",
            smooth: true,
            showSymbol: false,
            emphasis: {
              focus: "series",
            },
            data: currentData.training,
            areaStyle: {
              opacity: 0.8,
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: "rgba(16, 185, 129, 0.3)" },
                { offset: 1, color: "rgba(16, 185, 129, 0)" },
              ]),
            },
            lineStyle: {
              color: "#10b981",
            },
            itemStyle: {
              color: "#10b981",
            },
          },
          {
            name: "班次总数",
            type: "line",
            smooth: true,
            showSymbol: false,
            emphasis: {
              focus: "series",
            },
            data: currentData.class,
            areaStyle: {
              opacity: 0.8,
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: "rgba(59, 130, 246, 1)" },
                { offset: 1, color: "rgba(59, 130, 246, 0.2)" },
              ]),
            },
            lineStyle: {
              color: "rgba(59, 130, 246, 1)",
            },
            // 确保图例颜色与线条一致
            itemStyle: {
              color: "rgba(59, 130, 246, 1)",
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
          title="近5年班次走势分析"
          class={PANEL_CLASS}
          zoomable
          zoom-title="近5年班次走势分析详情"
          zoom-width={1000}
          v-slots={{
            titleIcon: () => <CardTitleIcon name="broadcast-trend" />,
            default: () => renderBody("normal"),
            "zoom-content": () => renderBody("zoom"),
          }}
        />
      </div>
    );
  },
});
