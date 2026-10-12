import { LineChart } from "echarts/charts";
import { LegendComponent, TitleComponent, TooltipComponent, GridComponent, DataZoomComponent } from "echarts/components";
import * as echarts from "echarts/core";
import { CanvasRenderer } from "echarts/renderers";
import { defineComponent, nextTick, watch, onMounted, ref, onBeforeUnmount } from "vue";

import { resolveChartScrollable } from "@/features/panel-shell/charts/panel-zoom-context";
import "echarts-liquidfill";

import { buildCategoryXAxis, buildScrollableCategoryAxisConfig, buildValueYAxis } from "@/infrastructure/utils/chart-axis-style";
import { calcFontSize } from "@/infrastructure/utils/common";
import { resolveChartSeriesName } from "@/infrastructure/utils/resolve-chart-series-name";
import { getVisualThemeChartColors, VISUAL_THEME_CHANGE_EVENT } from "@/infrastructure/utils/visual-theme";

import "./stacked-line.module.less";

echarts.use([LegendComponent, TooltipComponent, TitleComponent, GridComponent, DataZoomComponent, LineChart, CanvasRenderer]);

interface YDataItem {
  name: string;
  data: number[];
  colors?: Array<{ offset: number; color: string }>;
}

const StackedLine = defineComponent({
  name: "StackedLine",
  props: {
    title: {
      type: String,
      required: true,
    },
    xData: {
      type: Array as () => Array<string | number>,
      required: true,
    },
    yData: {
      type: Array as () => YDataItem[],
      required: true,
    },
    smooth: {
      type: Number,
    },
    color: {
      type: Array as () => string[],
    },
    gridTop: {
      type: Number,
      // 为顶部 legend + yAxis.name 预留空间，避免图例遮挡曲线峰值
      default: 32,
    },
    legendTop: {
      type: Number,
      default: 0,
    },
    /** 卡片可视窗口类目数；详情全量展示时配合 scrollable=false */
    visibleCount: {
      type: Number,
      default: 6,
    },
    /** false：横轴完整展示；不传时放大弹窗内自动关闭滚动（勿用 Boolean 类型，避免缺省被转成 false） */
    scrollable: {
      type: [Boolean, null] as unknown as () => boolean | null,
      default: null,
    },
    /** 滚动窗口锚定：start=从左起；end=当前/最新时间端 */
    zoomAnchor: {
      type: String as () => "start" | "end",
      default: "start",
    },
    /** 是否展示底部 dataZoom 滑条；卡片紧凑布局建议 false */
    dataZoomSlider: {
      type: Boolean,
      default: true,
    },
  },
  setup(props) {
    const powerFactorRef = ref<HTMLElement | null>(null);
    const enableScroll = resolveChartScrollable(props.scrollable ?? undefined);

    let myChart: echarts.ECharts | null = null;
    let resizeObserver: ResizeObserver | null = null;

    const setOption = () => {
      const themeColors = getVisualThemeChartColors();
      const categoryCount = props.xData.length;
      const shouldRotateXLabel = !enableScroll && categoryCount > 8;
      const xLabelRotate = shouldRotateXLabel ? 30 : 0;
      const axisConfig = buildScrollableCategoryAxisConfig(categoryCount, themeColors, {
        visibleCount: props.visibleCount,
        // 倾斜时保持小 bottom，由 containLabel 统一预留轴标签，避免 Y 轴被裁切
        baseGridBottom: enableScroll ? "8%" : shouldRotateXLabel ? "8" : "4",
        scrollable: enableScroll,
        anchor: props.zoomAnchor,
        slider: props.dataZoomSlider,
      });
      const gridBottom = axisConfig.gridBottom;
      const labelInterval = shouldRotateXLabel ? ("auto" as const) : axisConfig.labelInterval;

      const arr = props.yData.map((item, index) => {
        const data: Record<string, unknown> = {
          type: "line",
          symbol: "none",
          name: resolveChartSeriesName(item.name, { index, fallback: props.title || "数值" }),
          smooth: 0.35,
          emphasis: {
            focus: "series",
          },
          areaStyle: {},
          lineStyle: {},
          data: item.data,
        };
        if (item.colors?.length) {
          const topColor = item.colors[0]?.color ?? "#2989FF";
          const bottomColor = item.colors[item.colors.length - 1]?.color ?? "rgba(41, 137, 255, 0)";
          const strokeColor = props.color?.[index] ?? (typeof topColor === "string" ? topColor.replace(/,\s*[\d.]+\)$/, ", 1)") : topColor);
          data.areaStyle = {
            opacity: 1,
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: topColor },
              { offset: 1, color: bottomColor },
            ]),
          };
          // 折线描边可见，面积用半透明渐变，避免整块“色块背景”感
          data.lineStyle = {
            color: strokeColor,
            width: 2,
          };
        }
        return data;
      });

      return {
        backgroundColor: "transparent",
        color: props.color,
        tooltip: {
          trigger: "axis",
          axisPointer: {
            type: "shadow",
          },
          backgroundColor: themeColors.tooltipBg,
          borderColor: themeColors.tooltipBorder,
          textStyle: {
            color: themeColors.tooltipText,
          },
          formatter: (params: Array<{ color: string; seriesName: string; seriesIndex?: number; value: number; axisValue: string }>) => {
            let dom = "";
            params.forEach((item, index) => {
              const name = resolveChartSeriesName(item.seriesName, {
                index: item.seriesIndex ?? index,
                fallback: props.title || "数值",
              });
              dom += `<div>
            <span style="display:inline-block;margin-right:5px;border-radius:10px;width:10px;height:10px;background-color:${item.color};"></span>
            <span>${name}:</span>
            <span>${item.value}</span>
            <span>${props.title}</span>
            </div>`;
            });
            return `<div>${params[0].axisValue}</div>` + dom;
          },
        },
        legend: {
          top: props.legendTop,
          left: "center",
          itemHeight: 10,
          textStyle: {
            color: themeColors.muted,
          },
        },
        grid: {
          left: "3%",
          right: enableScroll ? "6%" : "4%",
          bottom: gridBottom,
          top: props.gridTop,
          containLabel: true,
        },
        dataZoom: axisConfig.dataZoom,
        xAxis: [
          {
            ...buildCategoryXAxis(themeColors, {
              data: props.xData,
              boundaryGap: false,
              labelInterval,
              fontSize: enableScroll ? 10 : 11,
              margin: shouldRotateXLabel ? 10 : 6,
              rotate: xLabelRotate,
            }),
          },
        ],
        yAxis: [
          buildValueYAxis(themeColors, {
            name: props.title || "",
            nameGap: 8,
            nameTextStyle: {
              color: themeColors.axis,
              fontSize: 11,
              padding: [0, 0, 0, 0],
            },
          }),
        ],
        series: arr,
      };
    };

    const resizeChart = () => {
      nextTick(() => {
        myChart?.resize();
        requestAnimationFrame(() => myChart?.resize());
      });
    };

    const initChart = (container?: HTMLElement | null) => {
      if (!container) return;
      if (!myChart) myChart = echarts.init(container);
      myChart.setOption(setOption(), true);
      resizeChart();
    };

    const handleVisualThemeChange = () => initChart(powerFactorRef.value);

    nextTick(() => {
      initChart(powerFactorRef.value);
    });

    watch(
      () => [...props.xData, ...props.yData.map((item) => item.data).flat()],
      () => {
        initChart(powerFactorRef.value);
      },
    );

    watch(
      () => [enableScroll, props.visibleCount, props.zoomAnchor, props.gridTop, props.legendTop, props.dataZoomSlider],
      () => {
        initChart(powerFactorRef.value);
      },
    );

    onMounted(() => {
      initChart(powerFactorRef.value);
      const chartContainer = powerFactorRef.value;
      const observed = chartContainer?.parentElement ?? chartContainer;
      if (observed) {
        resizeObserver = new ResizeObserver(resizeChart);
        resizeObserver.observe(observed);
      }
      window.addEventListener(VISUAL_THEME_CHANGE_EVENT, handleVisualThemeChange);
    });

    onBeforeUnmount(() => {
      window.removeEventListener(VISUAL_THEME_CHANGE_EVENT, handleVisualThemeChange);
      resizeObserver?.disconnect();
      myChart?.dispose();
      myChart = null;
    });

    return (): JSX.Element => <div class="power-factor" ref={powerFactorRef}></div>;
  },
});

export default StackedLine;
