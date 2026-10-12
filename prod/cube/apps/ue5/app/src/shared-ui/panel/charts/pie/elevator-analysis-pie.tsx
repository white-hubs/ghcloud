import { PieChart, GaugeChart } from "echarts/charts";
import { LegendComponent, TitleComponent, TooltipComponent } from "echarts/components";
import * as echarts from "echarts/core";
import { CanvasRenderer } from "echarts/renderers";
import { defineComponent, watch, onMounted, ref, onBeforeUnmount } from "vue";

import { getVisualThemeChartColors, resolveThemeSuccessColor, VISUAL_THEME_CHANGE_EVENT } from "@/infrastructure/utils/visual-theme";
import "echarts-liquidfill";

import "./elevator-analysis-pie.module.less";

echarts.use([PieChart, LegendComponent, TooltipComponent, TitleComponent, GaugeChart, CanvasRenderer]);

interface PieDataItem {
  name: string;
  value: number;
  color: string;
}

/** 圆环统一对齐动环设备：外装饰环 / 刻度环 / 内数据环 */
const OUTER_DECOR_RADIUS = ["85%", "100%"] as const;
const DATA_RING_RADIUS = ["70%", "80%"] as const;
const TICK_RING_RADIUS = "78%";

/** 外环固定四分段：实色弧 + 透明间隙，形成方位缺口 */
const buildOuterDecorSegments = (splitColor: string) => {
  const segments: Array<{ value: number; itemStyle: { color: string } }> = [];
  for (let i = 0; i < 4; i += 1) {
    segments.push({ value: 88, itemStyle: { color: splitColor } });
    segments.push({ value: 8, itemStyle: { color: "rgba(0,0,0,0)" } });
  }
  return segments;
};

const ElevatorAnalysisPie = defineComponent({
  name: "ElevatorAnalysisPie",
  props: {
    pieData: {
      type: Array as () => PieDataItem[],
      required: true,
      default: () => [{ name: "", value: 0, color: "" }],
    },
    class: {
      type: String,
      required: true,
      default: "",
    },
    pieClass: {
      type: String,
      required: true,
      default: "",
    },
    radius: {
      type: String,
      required: false,
      default: "",
    },
    /** @deprecated 圆环已统一为动环设备结构，该属性保留仅为调用方兼容 */
    ringVariant: {
      type: String as () => "default" | "clean",
      required: false,
      default: "default",
    },
  },
  emits: ["clickbar"],
  setup(props, { emit, slots }) {
    const powerFactorRef = ref<HTMLElement | null>(null);
    const pieBoxRef = ref<HTMLElement | null>(null);

    let myChart: echarts.ECharts | null = null;
    let resizeObserver: ResizeObserver | null = null;
    let resizeTimer: ReturnType<typeof setTimeout> | null = null;

    const buildPieItems = () =>
      props.pieData.map((item) => ({
        value: item.value,
        name: item.name,
        itemStyle: {
          color: resolveThemeSuccessColor(item.color),
        },
        originData: item,
      }));

    const option = () => {
      const themeColors = getVisualThemeChartColors();
      const pieItems = buildPieItems();
      const minimalWhite = document.documentElement.dataset.visualTheme === "minimal-white";

      // 科技蓝 / 极简白同一套动环设备圆环：外装饰环 + 刻度 + 连续数据环
      return {
        series: [
          {
            type: "pie" as const,
            radius: OUTER_DECOR_RADIUS,
            silent: true,
            clockwise: true,
            startAngle: 90,
            z: 0,
            label: { show: false },
            labelLine: { show: false },
            data: buildOuterDecorSegments(themeColors.splitLine),
          },
          {
            type: "gauge" as const,
            name: "tick-ring",
            radius: TICK_RING_RADIUS,
            startAngle: 0,
            endAngle: -359.99,
            splitNumber: 50,
            z: 1,
            pointer: { show: false },
            progress: { show: false },
            anchor: { show: false },
            title: { show: false },
            detail: { show: false },
            axisLine: {
              show: false,
              lineStyle: {
                width: 0,
                opacity: 0,
                color: [[1, "transparent"]],
              },
            },
            axisTick: { show: false },
            splitLine: {
              show: !minimalWhite,
              length: 5,
              distance: 0,
              lineStyle: {
                color: themeColors.ringTick,
                width: 2,
                type: "solid",
                opacity: 0.75,
              },
            },
            axisLabel: { show: false },
            data: [{ value: 0 }],
          },
          {
            name: "Access From",
            type: "pie" as const,
            radius: DATA_RING_RADIUS,
            avoidLabelOverlap: false,
            clockwise: true,
            startAngle: 90,
            z: 2,
            label: { show: false },
            labelLine: { show: false },
            data: pieItems,
          },
        ],
      };
    };

    const initChart = (container?: HTMLElement | null) => {
      if (!container) return;
      if (container.clientWidth <= 0 || container.clientHeight <= 0) return;
      if (myChart) {
        myChart.dispose();
        myChart = null;
      }
      myChart = echarts.init(container);
      myChart.off("click");
      myChart.on("click", (params) => {
        emit("clickbar", params);
      });
      myChart.setOption(option(), true);
    };

    const scheduleInit = () => {
      if (resizeTimer) clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        const container = powerFactorRef.value;
        if (!container) return;
        if (myChart && container.clientWidth > 0 && container.clientHeight > 0) {
          myChart.resize();
          myChart.setOption(option(), true);
          return;
        }
        initChart(container);
      }, 50);
    };

    const resize = () => {
      if (resizeTimer) clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        initChart(powerFactorRef.value);
      }, 200);
    };

    watch(
      () => props.pieData,
      () => {
        scheduleInit();
      },
      { deep: true },
    );

    onMounted(() => {
      initChart(powerFactorRef.value);
      window.addEventListener("resize", resize);
      window.addEventListener(VISUAL_THEME_CHANGE_EVENT, resize);
      const observeTarget = pieBoxRef.value || powerFactorRef.value;
      if (observeTarget && typeof ResizeObserver !== "undefined") {
        resizeObserver = new ResizeObserver(() => scheduleInit());
        resizeObserver.observe(observeTarget);
      }
    });

    onBeforeUnmount(() => {
      window.removeEventListener("resize", resize);
      window.removeEventListener(VISUAL_THEME_CHANGE_EVENT, resize);
      resizeObserver?.disconnect();
      resizeObserver = null;
      if (resizeTimer) clearTimeout(resizeTimer);
      myChart?.dispose();
      myChart = null;
    });

    return (): JSX.Element => (
      <div class={["elevator-analysis-pie-box", props.class]} ref={pieBoxRef}>
        <div class={["power-factor", props.pieClass]} ref={powerFactorRef}></div>
        <div class="content">{slots.default?.()}</div>
      </div>
    );
  },
});

export default ElevatorAnalysisPie;
