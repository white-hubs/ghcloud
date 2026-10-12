<template>
  <div ref="chartRef" class="application-device-bar-chart" />
</template>

<script setup lang="ts">
import { BarChart } from "echarts/charts";
import { DataZoomComponent, GridComponent, LegendComponent, TooltipComponent } from "echarts/components";
import * as echarts from "echarts/core";
import { CanvasRenderer } from "echarts/renderers";
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue";

echarts.use([BarChart, CanvasRenderer, DataZoomComponent, GridComponent, LegendComponent, TooltipComponent]);

interface ChartSeries {
  name: string;
  color: string;
  data: number[];
}

interface Props {
  categories: string[];
  series: ChartSeries[];
}

const props = defineProps<Props>();
const chartRef = ref<HTMLElement>();
let chart: echarts.ECharts | undefined;

function formatApplicationName(name: string) {
  return name.length > 4 ? `${name.slice(0, 4)}…` : name;
}

function renderChart() {
  if (!chartRef.value) return;
  chart ??= echarts.init(chartRef.value);
  chart.setOption(
    {
      color: props.series.map((item) => item.color),
      grid: { top: props.series.length > 1 ? 38 : 16, right: 12, bottom: 54, left: 44 },
      legend: {
        show: props.series.length > 1,
        top: 4,
        textStyle: { color: "#d0deee", fontSize: 12 },
      },
      tooltip: {
        trigger: "axis",
        axisPointer: { type: "shadow" },
      },
      xAxis: {
        type: "category",
        data: props.categories,
        axisLine: { lineStyle: { color: "rgba(113, 179, 230, 0.35)" } },
        axisLabel: {
          color: "#b6c9db",
          fontSize: 11,
          interval: 0,
          hideOverlap: true,
          formatter: formatApplicationName,
        },
        axisTick: { show: false },
      },
      yAxis: {
        type: "value",
        minInterval: 1,
        splitLine: { lineStyle: { color: "rgba(75, 143, 204, 0.18)", type: "dashed" } },
        axisLabel: { color: "#b6c9db", fontSize: 12 },
        axisLine: { show: false },
        axisTick: { show: false },
      },
      series: props.series.map((item) => ({
        name: item.name,
        type: "bar",
        barMaxWidth: 24,
        data: item.data,
        itemStyle: { borderRadius: [4, 4, 0, 0] },
        label: { show: true, position: "top", color: item.color, fontSize: 11 },
      })),
      dataZoom: [
        { type: "inside", startValue: 0, endValue: 7 },
        {
          type: "slider",
          startValue: 0,
          endValue: 7,
          height: 10,
          bottom: 6,
          borderColor: "rgba(87, 169, 242, 0.4)",
          fillerColor: "rgba(61, 157, 255, 0.28)",
          backgroundColor: "rgba(16, 64, 112, 0.35)",
          handleSize: 8,
          textStyle: { color: "transparent" },
        },
      ],
    },
    true,
  );
}

function resizeChart() {
  chart?.resize();
}

watch(() => [props.categories, props.series], renderChart, { deep: true });

onMounted(async () => {
  await nextTick();
  renderChart();
  window.addEventListener("resize", resizeChart);
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", resizeChart);
  chart?.dispose();
  chart = undefined;
});
</script>

<style lang="less" scoped>
.application-device-bar-chart {
  width: 100%;
  height: 100%;
}
</style>
