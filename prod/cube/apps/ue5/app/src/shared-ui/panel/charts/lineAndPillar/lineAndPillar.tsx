import { BarChart, LineChart } from "echarts/charts";
import { DataZoomComponent, GridComponent, LegendComponent, TooltipComponent } from "echarts/components";
import * as echarts from "echarts/core";
import { CanvasRenderer } from "echarts/renderers";
import { defineComponent, nextTick, onBeforeUnmount, onMounted, ref, watch, type PropType } from "vue";

import { buildCategoryXAxis, buildScrollableCategoryAxisConfig } from "@/infrastructure/utils/chart-axis-style";
import { observeChartHostResize } from "@/infrastructure/utils/echarts-chart-host";
import { resolveChartSeriesName } from "@/infrastructure/utils/resolve-chart-series-name";
import { getVisualThemeChartColors, VISUAL_THEME_CHANGE_EVENT } from "@/infrastructure/utils/visual-theme";
import { resolveChartScrollable } from "@/shared-ui/panel/charts/panel-zoom-context";

import "./lineAndPillar.module.less";

echarts.use([BarChart, LineChart, DataZoomComponent, LegendComponent, TooltipComponent, GridComponent, CanvasRenderer]);

type SeriesItem = {
  name?: string;
  type?: string;
  color?: string;
  data?: number[] | null;
};

export const LineAndPillar = defineComponent({
  name: "LineAndPillar",
  props: {
    title: {
      type: String,
      required: true,
    },
    xData: {
      type: Array as PropType<Array<string | number>>,
      required: true,
    },
    yData: {
      type: Array as PropType<SeriesItem[]>,
      required: true,
    },
    /** false：横轴完整展示；不传时放大弹窗内自动关闭滚动 */
    scrollable: {
      type: Boolean as PropType<boolean | undefined>,
      required: false,
      default: undefined,
    },
  },
  setup(props) {
    const linePillar = ref<HTMLElement | null>(null);
    let myChart: echarts.ECharts | null = null;
    let resizeObserver: ResizeObserver | null = null;
    const enableScroll = resolveChartScrollable(props.scrollable);

    const toNumberList = (data?: number[] | null) => (Array.isArray(data) ? data.map((n) => Number(n) || 0) : []);

    const getBarMax = (data: number[]) => {
      if (!data.length) return 0;
      return Math.max(...data);
    };

    const setOption = () => {
      const themeColors = getVisualThemeChartColors();
      const visibleCount = 6;
      const axisConfig = buildScrollableCategoryAxisConfig(props.xData.length, themeColors, {
        visibleCount,
        baseGridBottom: enableScroll ? "8%" : "12%",
        scrollable: enableScroll,
      });

      const seriesList = (props.yData || []).map((item, index) => {
        const isBar = (item.type || (index === 0 ? "bar" : "line")) === "bar";

        return {
          name: item.name,
          type: isBar ? ("bar" as const) : ("line" as const),
          data: toNumberList(item.data),
          yAxisIndex: isBar ? 0 : 1,
          smooth: isBar ? false : 0.2,
          symbol: isBar ? "none" : "circle",
          symbolSize: isBar ? 0 : 6,
          showSymbol: !isBar,
          barMaxWidth: 18,
          itemStyle: {
            color: item.color,
            borderRadius: isBar ? ([3, 3, 0, 0] as [number, number, number, number]) : 0,
          },
          lineStyle: isBar
            ? undefined
            : {
                color: item.color,
                width: 2,
              },
          areaStyle: isBar
            ? undefined
            : {
                opacity: 0.18,
                color: item.color,
              },
          emphasis: {
            focus: "series" as const,
          },
        };
      });

      const barMax = getBarMax(seriesList[0]?.data || []);

      return {
        backgroundColor: "transparent",
        tooltip: {
          trigger: "axis" as const,
          axisPointer: {
            type: "shadow" as const,
          },
          backgroundColor: themeColors.tooltipBg,
          borderColor: themeColors.tooltipBorder,
          textStyle: {
            color: themeColors.tooltipText,
          },
          formatter: (params: Array<{ marker: string; seriesName: string; seriesIndex?: number; value: number; axisValue: string }>) => {
            const list = Array.isArray(params) ? params : [params];
            const rows = list
              .map((item, index) => {
                const unit = index === 0 ? "辆" : "%";
                const name = resolveChartSeriesName(item.seriesName, {
                  index: item.seriesIndex ?? index,
                  fallback: "数值",
                });
                return `${item.marker}${name}：${item.value}${unit}`;
              })
              .join("<br/>");
            return `${list[0]?.axisValue ?? ""}<br/>${rows}`;
          },
        },
        legend: {
          top: 0,
          left: "center",
          itemWidth: 18,
          itemHeight: 10,
          data: seriesList.map((item) => item.name).filter(Boolean) as string[],
          textStyle: {
            color: themeColors.muted,
          },
        },
        grid: {
          left: "3%",
          right: "4%",
          top: 38,
          bottom: axisConfig.gridBottom,
          containLabel: true,
        },
        dataZoom: axisConfig.dataZoom,
        xAxis: [
          {
            ...buildCategoryXAxis(themeColors, {
              data: Array.isArray(props.xData) ? props.xData : [],
              boundaryGap: true,
              labelInterval: axisConfig.labelInterval,
              fontSize: 10,
              margin: 8,
              rotate: !enableScroll && props.xData.length > 20 ? 30 : 0,
              chartWidth: linePillar.value?.clientWidth,
              visibleCount: axisConfig.hasDataZoom ? visibleCount : props.xData.length,
            }),
            axisPointer: {
              type: "shadow" as const,
            },
          },
        ],
        yAxis: [
          {
            type: "value" as const,
            minInterval: barMax > 5 ? undefined : 1,
            splitLine: {
              show: true,
              lineStyle: {
                type: "dashed" as const,
                color: themeColors.splitLine,
                width: 1,
              },
            },
            axisLabel: {
              color: themeColors.axis,
            },
            axisLine: {
              show: false,
            },
            axisTick: {
              show: false,
            },
          },
          {
            type: "value" as const,
            min: 0,
            max: 100,
            interval: 20,
            splitLine: {
              show: false,
            },
            axisLabel: {
              color: themeColors.axis,
              formatter: "{value}%",
            },
            axisLine: {
              show: false,
            },
            axisTick: {
              show: false,
            },
          },
        ],
        series: seriesList,
      };
    };

    const renderChart = (): void => {
      const container = linePillar.value;
      if (!container) return;
      if (container.clientWidth <= 0 || container.clientHeight <= 0) {
        nextTick(() => {
          if (linePillar.value && linePillar.value.clientWidth > 0) {
            if (!myChart) myChart = echarts.init(linePillar.value);
            myChart.setOption(setOption(), true);
            myChart.resize();
          }
        });
        return;
      }
      if (!myChart) {
        myChart = echarts.init(container);
      }
      myChart.setOption(setOption(), true);
      nextTick(() => {
        myChart?.resize();
      });
    };

    const resize = (): void => {
      myChart?.resize();
    };

    const handleVisualThemeChange = (): void => {
      renderChart();
    };

    watch(
      () => [props.xData, props.yData, props.scrollable],
      () => {
        renderChart();
      },
      { deep: true },
    );

    onMounted(() => {
      nextTick(() => {
        renderChart();
      });
      resizeObserver = observeChartHostResize(linePillar.value?.parentElement ?? linePillar.value, resize);
      window.addEventListener("resize", resize);
      window.addEventListener(VISUAL_THEME_CHANGE_EVENT, handleVisualThemeChange);
    });

    onBeforeUnmount(() => {
      window.removeEventListener("resize", resize);
      window.removeEventListener(VISUAL_THEME_CHANGE_EVENT, handleVisualThemeChange);
      resizeObserver?.disconnect();
      myChart?.dispose();
      myChart = null;
    });

    return (): JSX.Element => <div class="power-factor line-and-pillar" ref={linePillar} />;
  },
});

export default LineAndPillar;
