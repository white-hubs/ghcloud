import { LineChart as EChartsLineChart, LineSeriesOption } from "echarts/charts";
import { BarChart } from "echarts/charts";
import { DataZoomComponent, LegendComponent } from "echarts/components";
import { GridComponent, GridComponentOption, TooltipComponent, TitleComponent } from "echarts/components";
import * as echarts from "echarts/core";
import { UniversalTransition } from "echarts/features";
import { CanvasRenderer } from "echarts/renderers";
import { computed, defineComponent, nextTick, onBeforeUnmount, onMounted, ref, watch, type PropType } from "vue";

import {
  buildCategoryXAxis,
  buildScrollableCategoryAxisConfig,
  buildValueYAxis,
  resolveChartGridGap,
} from "@/infrastructure/utils/chart-axis-style";
import { hasCompleteCategoryChartData } from "@/infrastructure/utils/chart-data-ready";
import { calcFontSize } from "@/infrastructure/utils/common";
import { resolveChartSeriesName } from "@/infrastructure/utils/resolve-chart-series-name";
import { getVisualThemeChartColors, VISUAL_THEME_CHANGE_EVENT } from "@/infrastructure/utils/visual-theme";
import { resolveChartScrollable } from "@/shared-ui/panel/charts/panel-zoom-context";

import "./lineChart.module.less";

echarts.use([
  BarChart,
  GridComponent,
  EChartsLineChart,
  CanvasRenderer,
  UniversalTransition,
  TooltipComponent,
  LegendComponent,
  TitleComponent,
  DataZoomComponent,
]);

interface SeriesItf {
  name?: string;
  data?: number[];
  linearGradientColor?: string[];
  smooth?: boolean;
  showSymbol?: boolean;
  lineColor?: string;
  symbolSize?: number;
  type?: string;
}

export const LineChart = defineComponent({
  name: "LineChart",
  props: {
    colors: { type: Array as PropType<string[]>, required: false, default: () => ["#568EFF", "#78FCFC", "#FFC700", "#F14545"] },
    /** 顶部边距，纯数字按 px；有 Y 轴单位时至少约 32px，避免被当成百分比把图压矮 */
    gridTop: { type: String, required: false, default: "12" },
    gridLeft: { type: String, required: false, default: "3" },
    gridRight: { type: String, required: false, default: "3" },
    /** 底部边距，纯数字按 px；勿再传百分数，否则矮槽把折线压成一条、高槽底部空一截 */
    gridBottom: { type: String, required: false, default: "32" },
    titles: { type: Array as PropType<string[]>, required: false, default: () => [] },
    legendFontSize: { type: Number, required: false, default: calcFontSize(12) },
    xData: { type: Array as PropType<Array<string | number>>, required: false, default: () => ["1月", "2月", "3月", "4月", "5月", "6月"] },
    series: { type: Array as PropType<SeriesItf[]>, required: false, default: () => [] },
    showLegend: { type: Boolean, required: false, default: true },
    title: { type: String, required: false, default: "" },
    unit: { type: Object as PropType<{ x: string; y: string }>, required: false, default: () => ({ x: "", y: "" }) },
    tooltipAxisValueSuffix: { type: String, required: false, default: "" },
    axisPointer: { type: Boolean, required: false, default: false },
    visibleCount: { type: Number, required: false, default: 6 },
    /** false：横轴完整展示；不传时放大弹窗内自动关闭滚动 */
    scrollable: { type: Boolean as PropType<boolean | undefined>, required: false, default: undefined },
    /** 非滚动模式下，横轴数据超过该数量后自动抽稀并旋转标签 */
    xAxisLabelRotateThreshold: { type: Number, required: false, default: 16 },
    /** 侧栏卡片：类目数不超过该值时横轴完整展示（如「今年」12 个月） */
    fitAllCategoryThreshold: { type: Number, required: false, default: 12 },
    /** 是否展示底部 dataZoom 滑条；侧栏卡片建议 false */
    dataZoomSlider: { type: Boolean, required: false, default: false },
    height: { type: [Number, String] as PropType<number | string>, required: false },
  },
  setup(props, { expose }) {
    type EChartsOption = echarts.ComposeOption<GridComponentOption | LineSeriesOption>;
    const chartDom = ref<HTMLElement | null>(null);
    const chartOption = ref<EChartsOption>();
    let myChart: echarts.ECharts | null = null;
    let resizeObserver: ResizeObserver | null = null;
    let initTimer: ReturnType<typeof setTimeout> | null = null;
    const enableScroll = resolveChartScrollable(props.scrollable);

    const chartStyle = computed(() => {
      if (props.height == null || props.height === "") return undefined;
      const height = typeof props.height === "number" ? `${props.height}px` : String(props.height);
      return { height, minHeight: height };
    });

    const resolveUnitY = (): string => {
      const unitY = props.unit?.y?.trim() ?? "";
      if (unitY) return unitY;
      // 兼容历史误用 title 传 Y 轴单位（如 title="次"）
      const legacyTitle = props.title?.trim() ?? "";
      if (legacyTitle && legacyTitle.length <= 6) return legacyTitle;
      return "";
    };

    const getChartOption = (): EChartsOption => {
      const themeColors = getVisualThemeChartColors();
      const categoryCount = props.xData.length;
      const unitY = resolveUnitY();
      const fitAllCategories = categoryCount > 0 && categoryCount <= props.fitAllCategoryThreshold;
      const axisScrollable = enableScroll && !fitAllCategories;
      const axisVisibleCount = fitAllCategories ? categoryCount : props.visibleCount;
      const shouldRotateXLabel =
        (fitAllCategories && categoryCount >= 8) || (!axisScrollable && categoryCount > props.xAxisLabelRotateThreshold);
      const unitGridTopPx = props.showLegend ? 56 : 40;
      let minGridTopPx = 8;
      if (props.showLegend) minGridTopPx = 28;
      if (unitY) minGridTopPx = unitGridTopPx;
      const resolvedGridTop = resolveChartGridGap(props.gridTop, minGridTopPx);
      const resolvedGridBottom = resolveChartGridGap(props.gridBottom, 32);
      const xLabelFontSize = categoryCount >= 10 ? calcFontSize(10) : calcFontSize(11);
      const axisConfig = buildScrollableCategoryAxisConfig(categoryCount, themeColors, {
        visibleCount: axisVisibleCount,
        baseGridBottom: typeof resolvedGridBottom === "number" ? `${resolvedGridBottom}px` : resolvedGridBottom,
        scrollable: axisScrollable,
        slider: props.dataZoomSlider,
      });
      const gridBottom = axisConfig.gridBottom;
      const labelInterval = shouldRotateXLabel ? (0 as const) : axisConfig.labelInterval;
      const chartTitle = unitY && props.title?.trim() === unitY ? "" : props.title;

      return {
        backgroundColor: "transparent",
        title: {
          text: chartTitle,
          textStyle: {
            color: themeColors.title,
            fontSize: calcFontSize(12),
          },
        },
        tooltip: {
          trigger: "axis",
          backgroundColor: themeColors.tooltipBg,
          borderColor: themeColors.tooltipBorder,
          textStyle: {
            color: themeColors.tooltipText,
          },
          formatter: function (params) {
            const list = Array.isArray(params) ? params : [params];
            if (!list.length) return "";
            const size_dot = calcFontSize(10);
            const size_text = calcFontSize(12);
            const unitYLabel = unitY;
            const axisValue = `${list[0].axisValue ?? ""}${props.tooltipAxisValueSuffix}`;
            const unitText = unitYLabel ? ` ${unitYLabel}` : "";
            let result = `<span style="font-size:${size_text}px">${axisValue}</span><br/>`;
            list.forEach((item, index) => {
              const color = typeof item.color === "string" ? item.color : "#568EFF";
              const dotHtml = `<div style="display:inline-block;margin-right:5px;border-radius:${size_dot}px;width:${size_dot}px;height:${size_dot}px;background-color:${color}"></div>`;
              const name = resolveChartSeriesName(item.seriesName, {
                index: typeof item.seriesIndex === "number" ? item.seriesIndex : index,
                titles: props.titles,
                fallback: "数值",
              });
              result += `<div style="display:flex;justify-content: space-between;align-items: center;gap:12px;font-size:${size_text}px">${dotHtml}<span>${name}：${item.data}${unitText}</span></div>`;
            });
            return result;
          },
        },
        legend: {
          top: 0,
          left: "center",
          show: props.showLegend,
          width: "100%",
          itemHeight: 10,
          data: props.titles,
          textStyle: {
            fontSize: calcFontSize(props.legendFontSize),
            color: themeColors.muted,
          },
        },
        grid: {
          left: `${props.gridLeft}%`,
          right: `${props.gridRight}%`,
          bottom: gridBottom,
          top: resolvedGridTop,
          containLabel: true,
        },
        dataZoom: axisConfig.dataZoom,
        color: props.colors,
        xAxis: [
          {
            ...buildCategoryXAxis(themeColors, {
              data: props.xData,
              boundaryGap: true,
              labelInterval,
              fontSize: xLabelFontSize,
              margin: shouldRotateXLabel ? 12 : 6,
              rotate: shouldRotateXLabel ? 38 : 0,
            }),
            name: props.unit.x,
            nameLocation: "end",
            nameTextStyle: {
              fontSize: calcFontSize(12),
              color: themeColors.axis,
              verticalAlign: "middle",
              align: "right",
              padding: [0, 5, 0, 0],
            },
            animationEasing: "cubicOut",
          },
        ],
        yAxis: [
          buildValueYAxis(themeColors, {
            name: unitY,
            nameGap: calcFontSize(18),
            nameTextStyle: {
              fontSize: calcFontSize(11),
              color: themeColors.axis,
              fontWeight: 400,
              align: "right",
              verticalAlign: "bottom",
              padding: [0, 8, 8, 0],
            },
          }),
        ],
        series: props.series.map((e: SeriesItf, index: number) => {
          const item: LineSeriesOption | any = {
            name: resolveChartSeriesName(e.name, {
              index,
              titles: props.titles,
              fallback: "数值",
            }),
            type: e.type ? e.type : "line",
            symbol: "circle",
            label: {
              normal: {
                show: e.showSymbol,
                position: "top",
                color: themeColors.label,
                fontWeight: "bold",
                formatter: function (params) {
                  if (params.dataIndex === (e.data?.length ?? 0) - 1) {
                    return "预测";
                  }
                  return "";
                },
              },
            },
            smooth: e.smooth === undefined ? true : e.smooth,
            showSymbol: e.showSymbol,
            symbolSize: 5.5,
            data: e.data,
            lineStyle: {
              width: 1.5,
              color: e.lineColor || (e.linearGradientColor ? e.linearGradientColor[0] : undefined),
            },
            itemStyle: {
              normal: {
                color: e.lineColor || (e.linearGradientColor ? e.linearGradientColor[0] : ""),
              },
            },
          };
          if (e.linearGradientColor && e.linearGradientColor.length == 2) {
            item.areaStyle = {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: e.linearGradientColor[0] },
                { offset: 1, color: e.linearGradientColor[1] },
              ]),
            };
          }
          return item;
        }),
      };
    };

    const hasValidSize = (el?: HTMLElement | null): boolean => !!el && el.clientWidth > 8 && el.clientHeight > 8;

    const render = (): void => {
      const el = chartDom.value;
      if (!el) return;
      if (!hasCompleteCategoryChartData(props.xData, props.series)) {
        if (initTimer) clearTimeout(initTimer);
        myChart?.clear();
        return;
      }
      if (!hasValidSize(el)) {
        if (initTimer) clearTimeout(initTimer);
        initTimer = setTimeout(() => render(), 50);
        return;
      }
      chartOption.value = getChartOption();
      if (!myChart) {
        myChart = echarts.init(el);
      }
      myChart.setOption(chartOption.value, true);
      myChart.resize();
    };

    const resize = (): void => {
      nextTick(() => {
        const el = chartDom.value;
        if (!el || !hasValidSize(el)) {
          render();
          return;
        }
        if (!myChart) {
          render();
          return;
        }
        myChart.resize();
        requestAnimationFrame(() => myChart?.resize());
      });
    };

    watch(
      () => [...props.xData, ...(props.series ?? []).flatMap((item) => [item?.name ?? "", ...(item?.data ?? [])])],
      () => {
        render();
      },
      { deep: true },
    );

    watch(
      () => [
        props.unit,
        props.title,
        props.tooltipAxisValueSuffix,
        props.gridTop,
        props.gridLeft,
        props.gridRight,
        props.gridBottom,
        props.showLegend,
        props.visibleCount,
        props.fitAllCategoryThreshold,
        enableScroll,
        props.height,
        props.dataZoomSlider,
        props.xAxisLabelRotateThreshold,
      ],
      () => {
        render();
      },
      { deep: true },
    );

    expose({ render });

    onMounted(() => {
      render();
      const observeTarget = chartDom.value?.parentElement ?? chartDom.value;
      if (observeTarget && typeof ResizeObserver !== "undefined") {
        resizeObserver = new ResizeObserver(resize);
        resizeObserver.observe(observeTarget);
        if (chartDom.value && chartDom.value !== observeTarget) {
          resizeObserver.observe(chartDom.value);
        }
      }
      window.addEventListener("resize", resize);
      window.addEventListener(VISUAL_THEME_CHANGE_EVENT, render as EventListener);
    });

    onBeforeUnmount(() => {
      window.removeEventListener("resize", resize);
      window.removeEventListener(VISUAL_THEME_CHANGE_EVENT, render as EventListener);
      if (initTimer) clearTimeout(initTimer);
      resizeObserver?.disconnect();
      myChart?.dispose();
      myChart = null;
    });

    return (): JSX.Element => <div class="gh-line-chart chart" ref={chartDom} style={chartStyle.value} />;
  },
});

export default LineChart;
