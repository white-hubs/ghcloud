import { GaugeChart } from "echarts/charts";
import { LegendComponent, TitleComponent, TooltipComponent, GridComponent } from "echarts/components";
import * as echarts from "echarts/core";
import { CanvasRenderer } from "echarts/renderers";
import { defineComponent, nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue";

import { isMinimalWhiteTheme, VISUAL_THEME_CHANGE_EVENT } from "@/infrastructure/utils/visual-theme";

import styles from "./dashboard.module.less";

echarts.use([LegendComponent, TooltipComponent, TitleComponent, GridComponent, GaugeChart, CanvasRenderer]);

const buildGaugeGradient = (minimalWhite: boolean): echarts.graphic.LinearGradient =>
  new echarts.graphic.LinearGradient(
    0,
    0,
    1,
    0,
    minimalWhite
      ? [
          { offset: 0, color: "#1aa57a" },
          { offset: 0.42, color: "#c4b44a" },
          { offset: 0.7, color: "#d48806" },
          { offset: 1, color: "#d4380d" },
        ]
      : [
          { offset: 0, color: "#2AE8BD" },
          { offset: 0.5, color: "#C3F87A" },
          { offset: 0.7, color: "#FCFE7E" },
          { offset: 1, color: "#FA6A36" },
        ],
  );

export const Dashboard = defineComponent({
  name: "Dashboard",
  props: {
    data: {
      type: Number,
      required: true,
    },
    pointerColor: {
      type: String,
      default: "#FFEF4B",
    },
  },
  setup(props) {
    const powerFactorRef = ref<HTMLElement>();
    let myChart: echarts.ECharts | null = null;

    const setOption = () => {
      const minimalWhite = isMinimalWhiteTheme();
      const gradient = buildGaugeGradient(minimalWhite);
      const tickColor = minimalWhite ? "rgba(116, 158, 210, 0.55)" : "#263b35";
      const splitColor = minimalWhite ? "#5aa884" : "#4aca96";
      return {
        backgroundColor: "transparent",
        series: [
          {
            name: "刻度",
            type: "gauge",
            center: ["50%", "72%"],
            radius: "88%",
            min: 0,
            max: 100,
            splitNumber: 10,
            startAngle: 180,
            endAngle: 0,
            axisLine: {
              show: true,
              roundCap: true,
              lineStyle: {
                width: 1,
                color: [[1, gradient]],
              },
            },
            axisLabel: { show: false },
            axisTick: {
              show: true,
              splitNumber: 1,
              lineStyle: {
                color: tickColor,
                width: 1,
              },
              length: minimalWhite ? 6 : -10,
            },
            splitLine: {
              show: true,
              length: minimalWhite ? 8 : -10,
              lineStyle: {
                color: splitColor,
                width: 2,
              },
            },
          },
          {
            type: "gauge",
            radius: "100%",
            center: ["50%", "72%"],
            splitNumber: 0,
            startAngle: 180,
            endAngle: 0,
            axisLine: {
              show: true,
              roundCap: true,
              lineStyle: {
                width: minimalWhite ? 12 : 10,
                color: [[1, gradient]],
              },
            },
            splitLine: { show: false },
            axisLabel: { show: false },
            axisTick: { show: false },
            pointer: {
              show: true,
              length: "72%",
              width: "5%",
              itemStyle: {
                color: props.pointerColor,
              },
            },
            detail: { show: false },
            data: [{ value: props.data }],
          },
        ],
      };
    };

    const initChart = (container?: HTMLElement): void => {
      if (!container) return;
      try {
        if (!myChart) myChart = echarts.init(container);
        myChart.setOption(setOption());
        myChart.resize();
      } catch {
        // ignore chart init failures
      }
    };

    const resizeChart = (): void => {
      myChart?.resize();
    };

    const refreshChart = (): void => {
      initChart(powerFactorRef.value);
    };

    watch(
      () => [props.data, props.pointerColor] as const,
      () => {
        initChart(powerFactorRef.value);
      },
    );

    onMounted(() => {
      nextTick(() => {
        initChart(powerFactorRef.value);
        requestAnimationFrame(() => initChart(powerFactorRef.value));
      });
      window.addEventListener("resize", resizeChart);
      window.addEventListener(VISUAL_THEME_CHANGE_EVENT, refreshChart);
    });

    onBeforeUnmount(() => {
      window.removeEventListener("resize", resizeChart);
      window.removeEventListener(VISUAL_THEME_CHANGE_EVENT, refreshChart);
      myChart?.dispose();
      myChart = null;
    });

    return (): JSX.Element => <div class={styles.powerFactor} ref={powerFactorRef} />;
  },
});

export default Dashboard;
