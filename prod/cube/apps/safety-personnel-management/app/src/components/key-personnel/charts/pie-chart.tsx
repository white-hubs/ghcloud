import * as echarts from "echarts";
import type { ECharts } from "echarts";
import { defineComponent, onMounted, onUnmounted, ref, watch, type PropType } from "vue";

import "./charts.less";

export const PieChart = defineComponent({
  props: {
    data: {
      type: Array as PropType<{ name: string; value: number }[]>,
      default: () => [],
    },
    title: { type: String, default: "" },
  },
  setup(props) {
    const chartRef = ref<HTMLDivElement>();
    let chart: ECharts | null = null;

    const render = (): void => {
      if (!chart) return;
      chart.setOption({
        tooltip: { trigger: "item" },
        legend: { orient: "vertical", right: "8%", top: "center" },
        series: [
          {
            type: "pie",
            radius: ["40%", "65%"],
            center: ["35%", "50%"],
            data: props.data,
          },
        ],
      });
    };

    onMounted(() => {
      if (chartRef.value) {
        chart = echarts.init(chartRef.value);
        render();
      }
    });
    watch(() => props.data, render, { deep: true });
    onUnmounted(() => chart?.dispose());

    return (): JSX.Element => <div class="chart-box" ref={chartRef} />;
  },
});
