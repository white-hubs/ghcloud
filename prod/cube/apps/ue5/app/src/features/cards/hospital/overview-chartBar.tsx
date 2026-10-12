import { BarChart, LineChart, PictorialBarChart } from "echarts/charts";
import { DataZoomComponent, GridComponent, LegendComponent, TitleComponent, TooltipComponent } from "echarts/components";
import * as echarts from "echarts/core";
import { CanvasRenderer } from "echarts/renderers";
import { defineComponent, nextTick, onBeforeUnmount, onMounted, ref, watch, type PropType } from "vue";

import { resolveChartScrollable } from "@/features/panel-shell/charts/panel-zoom-context";
import {
  buildCategoryXAxis,
  buildScrollableCategoryAxisConfig,
  buildValueYAxis,
  resolveChartGridGap,
} from "@/infrastructure/utils/chart-axis-style";
import { calcFontSize } from "@/infrastructure/utils/common";
import { getVisualThemeChartColors, VISUAL_THEME_CHANGE_EVENT } from "@/infrastructure/utils/visual-theme";
import { storeMarket } from "@/visualization-core/stores/other";

import "./overview-chartBar.module.less";

echarts.use([
  LegendComponent,
  TooltipComponent,
  TitleComponent,
  GridComponent,
  DataZoomComponent,
  LineChart,
  PictorialBarChart,
  BarChart,
  CanvasRenderer,
]);

type YDataItem = {
  data: number[] | string[];
  name: string;
  color?: string[];
  list?: unknown;
};

export const OverviewChartBar = defineComponent({
  name: "OverviewChartBar",
  props: {
    xData: { type: Array as PropType<string[]>, required: true },
    yData: { type: Array as PropType<YDataItem[]>, required: true },
    xFontSize: { type: Number, required: false },
    title: { type: String, required: false },
    bottom: { type: String, required: false, default: "10%" },
    /** 顶部留白；有单位标题时建议 ≥28，避免与 Y 轴刻度重叠 */
    gridTop: { type: [Number, String] as PropType<number | string>, required: false },
    /** 传 0 可强制不旋转，长标签走截断，避免侧栏卡片绘图区被斜标签压扁 */
    xRotate: { type: Number, required: false },
    height: { type: [Number, String], required: false },
    scrollable: { type: Boolean as PropType<boolean | undefined>, required: false, default: undefined },
  },
  emits: ["clickbar"],
  setup(props, { emit }) {
    const piniaStoreMarket = storeMarket();
    const powerFactorRef = ref<HTMLElement | null>(null);
    let myChart: echarts.ECharts | null = null;
    const enableScroll = resolveChartScrollable(props.scrollable);

    const setOption = (data: YDataItem[] = [], xdata: string[] = []) => {
      const themeColors = getVisualThemeChartColors();
      const list = data.length === 0 ? props.yData : data;
      const xlist = xdata.length === 0 ? props.xData : xdata;
      const visibleCount = 4;
      const resolvedBottom = resolveChartGridGap(props.bottom, 8);
      const axisConfig = buildScrollableCategoryAxisConfig(xlist.length, themeColors, {
        visibleCount,
        baseGridBottom: typeof resolvedBottom === "number" ? `${resolvedBottom}px` : resolvedBottom,
        scrollable: enableScroll,
      });
      const dataZoom = axisConfig.dataZoom;
      const gridBottom = resolveChartGridGap(axisConfig.gridBottom, 8);
      const chartWidth = powerFactorRef.value?.clientWidth || powerFactorRef.value?.getBoundingClientRect().width || 0;
      const xFontSize = props.xFontSize ?? calcFontSize(11);
      const hasLegend = list.length > 1;
      // 单位标题在左上、图例在右上，二者共用顶部条带；grid 必须低于图例底边，否则图例压住柱子
      const titleBand = props.title ? Number(calcFontSize(14)) || 14 : 0;
      const legendTop = hasLegend ? (titleBand > 0 ? Math.max(2, titleBand - 2) : 0) : 0;
      const legendBand = hasLegend ? legendTop + (Number(calcFontSize(22)) || 22) : 0;
      const minGridTop = Math.max(
        titleBand + (Number(calcFontSize(10)) || 10),
        legendBand,
        props.title ? Number(calcFontSize(28)) || 28 : 0,
      );
      const parsedGridTop = props.gridTop != null ? Number(props.gridTop) : NaN;
      const gridTop = Number.isFinite(parsedGridTop) ? Math.max(parsedGridTop, minGridTop) : minGridTop || "5%";

      const series = list.map((x) => {
        const item: Record<string, unknown> = {
          name: x.name,
          data: x.data,
          type: "bar",
          barWidth: Math.max(8, Number(calcFontSize(12)) || 12),
          // 全 0 时仍保留可悬停热区，避免只有首个类目能出提示
          barMinHeight: 2,
          itemStyle: {},
        };
        if (x.color) {
          item.itemStyle = {
            color: new echarts.graphic.LinearGradient(
              0,
              0,
              0,
              1,
              [
                { offset: 0, color: x.color[0] },
                { offset: 1, color: x.color[1] },
              ],
              false,
            ),
            borderRadius: [2, 2, 0, 0],
          };
        }
        return item;
      });

      return {
        backgroundColor: "transparent",
        title: {
          text: props.title,
          textStyle: {
            lineHeight: calcFontSize(12),
            fontSize: calcFontSize(12),
            color: themeColors.title,
          },
        },
        tooltip: {
          trigger: "axis",
          axisPointer: { type: "shadow" },
          // 侧栏卡片多为 overflow:hidden，挂到 body 避免提示框被裁切
          appendToBody: true,
          confine: false,
          extraCssText: "z-index: 10050; max-width: 240px; pointer-events: none;",
          backgroundColor: themeColors.tooltipBg,
          borderColor: themeColors.tooltipBorder,
          borderWidth: 1,
          padding: [8, 10],
          textStyle: { color: themeColors.tooltipText, fontSize: calcFontSize(12) },
          formatter: (params: unknown) => {
            const listParams = (Array.isArray(params) ? params : [params]) as Array<{
              axisValueLabel?: string;
              name?: string;
              seriesName?: string;
              data?: number | string;
              color?: string | { colorStops?: Array<{ color: string }> };
            }>;
            if (listParams.length === 0) {
              return "";
            }
            const title = listParams[0]?.name || listParams[0]?.axisValueLabel || "";
            const sizeDot = calcFontSize(8);
            const sizeText = calcFontSize(12);
            const rows = listParams
              .map((item) => {
                const rawColor = item.color;
                const color = typeof rawColor === "string" ? rawColor : rawColor?.colorStops?.[0]?.color || "rgba(41, 137, 255, 1)";
                const value = item.data ?? 0;
                const dot = `<span style="display:inline-block;margin-right:6px;border-radius:50%;width:${sizeDot}px;height:${sizeDot}px;background:${color}"></span>`;
                return `<div style="display:flex;align-items:center;justify-content:space-between;gap:12px;font-size:${sizeText}px;line-height:1.5">${dot}<span>${item.seriesName ?? ""}</span><span style="font-weight:600">${value}</span></div>`;
              })
              .join("");
            return `<div style="font-size:${sizeText}px;font-weight:600;margin-bottom:4px">${title}</div>${rows}`;
          },
        },
        grid: {
          left: "2%",
          top: gridTop,
          right: "3%",
          bottom: gridBottom,
          // 与 legacy 一致：始终预留轴标签，避免侧栏卡片裁切 Y 轴
          containLabel: true,
        },
        dataZoom,
        xAxis: {
          ...buildCategoryXAxis(themeColors, {
            data: xlist,
            boundaryGap: true,
            labelInterval: axisConfig.labelInterval,
            fontSize: xFontSize,
            chartWidth,
            visibleCount: axisConfig.hasDataZoom ? visibleCount : xlist.length,
            ...(props.xRotate != null ? { rotate: props.xRotate } : {}),
          }),
          splitLine: { show: false },
          // 扩大类目热区，保证每个柱都能触发 axis tooltip
          axisPointer: {
            type: "shadow",
            shadowStyle: {
              color: "rgba(41, 137, 255, 0.08)",
            },
          },
        },
        yAxis: buildValueYAxis(themeColors),
        legend: hasLegend
          ? {
              top: legendTop,
              right: "2%",
              left: "auto",
              orient: "horizontal",
              itemHeight: 8,
              itemWidth: 12,
              itemGap: 10,
              textStyle: {
                color: themeColors.muted,
                fontSize: calcFontSize(11),
              },
            }
          : { show: false },
        series,
      };
    };

    let resizeObserver: ResizeObserver | null = null;
    let lastLayoutWidth = 0;
    let lastLayoutHeight = 0;

    const resizeChart = (): void => {
      nextTick(() => {
        const width = powerFactorRef.value?.clientWidth ?? 0;
        const height = powerFactorRef.value?.clientHeight ?? 0;
        const layoutChanged =
          (width > 0 && Math.abs(width - lastLayoutWidth) >= 4) || (height > 0 && Math.abs(height - lastLayoutHeight) >= 4);
        if (myChart && layoutChanged) {
          lastLayoutWidth = width;
          lastLayoutHeight = height;
          myChart.setOption(setOption(), true);
        }
        myChart?.resize();
        requestAnimationFrame(() => myChart?.resize());
      });
    };

    const renderChart = (container?: HTMLElement | null): void => {
      const target = container || powerFactorRef.value;
      if (!target) return;
      if (!myChart) {
        myChart = echarts.init(target);
        myChart.on("click", (params) => {
          emit("clickbar", params);
        });
      }
      lastLayoutWidth = target.clientWidth || lastLayoutWidth;
      lastLayoutHeight = target.clientHeight || lastLayoutHeight;
      myChart.setOption(setOption(), true);
      myChart.resize();
    };

    const resize = (): void => {
      window.setTimeout(() => {
        myChart?.resize();
        renderChart(powerFactorRef.value);
      }, 150);
    };

    watch(
      () => [...props.xData, ...props.yData.map((item) => item.data).flat()],
      () => {
        renderChart(powerFactorRef.value);
      },
      { deep: true },
    );

    watch(
      () => piniaStoreMarket.currentMarketName,
      () => {
        renderChart(powerFactorRef.value);
      },
    );

    onMounted(() => {
      renderChart(powerFactorRef.value);
      const chartContainer = powerFactorRef.value;
      if (chartContainer) {
        resizeObserver = new ResizeObserver(resizeChart);
        resizeObserver.observe(chartContainer);
        if (chartContainer.parentElement) {
          resizeObserver.observe(chartContainer.parentElement);
        }
      }
      window.addEventListener("resize", resize);
      window.addEventListener(VISUAL_THEME_CHANGE_EVENT, resize);
    });

    onBeforeUnmount(() => {
      window.removeEventListener("resize", resize);
      window.removeEventListener(VISUAL_THEME_CHANGE_EVENT, resize);
      resizeObserver?.disconnect();
      myChart?.dispose();
      myChart = null;
    });

    return (): JSX.Element => (
      <div
        class="power-factor"
        ref={powerFactorRef}
        style={props.height != null ? { height: typeof props.height === "number" ? `${props.height}px` : props.height } : undefined}
      />
    );
  },
});

export default OverviewChartBar;
