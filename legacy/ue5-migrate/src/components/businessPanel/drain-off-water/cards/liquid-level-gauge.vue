<template>
  <div ref="chartRef" class="liquid-level-gauge" />
</template>

<script lang="ts" setup>
import * as echarts from "echarts";
import { onBeforeUnmount, onMounted, ref, watch } from "vue";
import "echarts-liquidfill";

const props = withDefaults(
  defineProps<{
    value: number | null;
  }>(),
  {
    value: null,
  },
);

const MIN_LIQUID_LEVEL = 0;
const MAX_LIQUID_LEVEL = 2;
const chartRef = ref<HTMLDivElement>();
let chart: echarts.ECharts | null = null;

const formatValue = (value: number | null): string => {
  if (value == null || !Number.isFinite(value)) {
    return "--";
  }
  return String(value);
};

const getLiquidRatio = (value: number | null): number => {
  if (value == null || !Number.isFinite(value)) {
    return 0;
  }
  return Math.min(1, Math.max(0, (value - MIN_LIQUID_LEVEL) / (MAX_LIQUID_LEVEL - MIN_LIQUID_LEVEL)));
};

const renderChart = (): void => {
  if (chartRef.value == null) {
    return;
  }
  chart ??= echarts.init(chartRef.value);
  const value = formatValue(props.value);
  const ratio = getLiquidRatio(props.value);
  const path =
    "path://M800 0h-576c-17.92 0-32 14.08-32 32v960c0 17.92 14.08 32 32 32h576c17.92 0 32-14.08 32-32V32c0-17.92-14.08-32-32-32z";
  chart.setOption({
    series: [
      {
        type: "liquidFill",
        shape: path,
        radius: "95%",
        center: ["50%", "50%"],
        data: [ratio, ratio],
        color: ["#2d8bff"],
        waveLength: "88%",
        phase: 0,
        amplitude: 3, //水波振幅
        backgroundStyle: {
          color: "rgba(45, 139, 255, 0.22)",
        },
        outline: {
          show: true,
          borderDistance: 1,
          itemStyle: {
            borderWidth: 1,
            borderColor: "rgba(118, 191, 255, 0.9)",
          },
        },
        itemStyle: {
          opacity: 1,
        },
        label: {
          color: "#ffffff",
          fontWeight: 600,
          formatter: `{value|${value}}{unit| m}`,
          rich: {
            value: {
              fontSize: 16,
              fontFamily: "DIN Alternate, Arial, sans-serif",
              fontWeight: 700,
            },
            unit: {
              fontSize: 12,
              fontWeight: 500,
            },
          },
        },
      },
    ],
  });
};

const resizeChart = (): void => {
  chart?.resize();
};

watch(
  () => props.value,
  () => {
    renderChart();
  },
);

onMounted(() => {
  renderChart();
  window.addEventListener("resize", resizeChart);
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", resizeChart);
  chart?.dispose();
  chart = null;
});
</script>

<style lang="less" scoped>
.liquid-level-gauge {
  width: 96px;
  height: 156px;
}
</style>
