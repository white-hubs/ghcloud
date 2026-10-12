<script setup lang="ts">
import { init } from "echarts";
import {  onMounted, ref, watch } from "vue";
let L = new URL("../../assets/education.png", import.meta.url).href;
const lineChart = ref<HTMLDivElement>();
interface Props {
  data: any;
}
const props = withDefaults(defineProps<Props>(), {
  data: [],
});
watch(
  () => props.data,
  (value) => {
    setOption(value);
  }
);
const setOption = (data: any) => {
  const xAxisData = data.map((item: { name: any }) => item.name);
  const seriesData = data.map((item: { num: any }) => item.num);
  const chart = init(lineChart.value as HTMLDivElement);

  const options = {
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "shadow",
      },
    },
    grid: {
      left: "3%",
      right: "4%",
      bottom: "3%",
      containLabel: true,
    },
    xAxis: [
      {
        type: "category",
        data: xAxisData,
        axisTick: {
          alignWithLabel: true,
        },
      },
    ],
    yAxis: [
      {
        type: "value",
        splitLine: {//分割线配置
          show: true,
          lineStyle: {
            color: "#F2F3F5",
          }
        }
      },
    ],
    color: ['#3662EC'],
    series: [
      {
        name: "数量",
        type: "bar",
        barWidth: 16,
        data: seriesData,
      },
    ],
  };
  options && chart.setOption(options);
  window.addEventListener("resize", function () {
    chart.resize();
  });
};
onMounted(() => {
});
</script>

<template>
  <div class="chart" ref="lineChart"></div>
</template>

<style scoped>
.chart {
  width: 100%;
  height: 330px;
}
</style>
