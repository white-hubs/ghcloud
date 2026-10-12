import * as echarts from "echarts";
import type { ECharts } from "echarts";
import { defineComponent, onMounted, onUnmounted, ref, watch, type PropType } from "vue";

import "./charts.less";

export const BarChart = defineComponent({
  props: {
    categories: { type: Array as PropType<string[]>, default: () => [] },
    series: { type: Array as PropType<number[]>, default: () => [] },
  },
  setup(props) {
    const chartRef = ref<HTMLDivElement>();
    let chart: ECharts | null = null;

    const render = (): void => {
      if (!chart) return;
      chart.setOption({
        tooltip: { trigger: "axis" },
        grid: { left: 50, right: 20, bottom: 40, top: 30 },
        xAxis: { type: "category", data: props.categories },
        yAxis: { type: "value", minInterval: 1 },
        series: [
          {
            type: "bar",
            data: props.series,
            itemStyle: { color: "#3b82f6" },
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
    watch([() => props.categories, () => props.series], render, { deep: true });
    onUnmounted(() => chart?.dispose());

    return (): JSX.Element => <div class="chart-box" ref={chartRef} />;
  },
});
