<template>
  <div class="power-factor" ref="linePillar"></div>
</template>

<script lang="ts" setup>
// 1. 引入
import { nextTick, watch, onMounted, ref } from "vue";
import * as echarts from "echarts/core";
import { LineChart, BarChart } from "echarts/charts";
import {
  LegendComponent,
  TitleComponent,
  TitleComponentOption,
  TooltipComponent,
  GridComponent,
} from "echarts/components";
echarts.use([
  BarChart,
  LineChart,
  LegendComponent,
  TooltipComponent,
  TitleComponent,
  GridComponent,
]);
const linePillar = ref();
const props = defineProps({
  title: {
    type: String,
    required: true,
  },
  xData: {
    type: [] as any,
    required: true,
  },
  yData: {
    type: [] as any,
    required: true,
  },
});

nextTick(() => {
  // 2. 容器
  const container = linePillar.value as HTMLElement;
  if (container) initChart(container);
});
// 3. 初始化 echarts 实例, 将配置添加给 echarts 实例
let myChart: echarts.ECharts | null = null;
const initChart = (container?: HTMLElement) => {
  if (!myChart) myChart = echarts.init(container as HTMLElement);
  myChart.setOption(setOption());
};

watch(
  () => [...props.xData],
  (newVal) => {
    initChart(linePillar.value);
  }
);
function setOption() {
  let arr = props.yData.map((item, index) => {
    return {
      name: item.name,
      type: index === 0 ? "bar" : "line",
      color: item.color,
      data: item.data,
    };
  });
  arr[1].yAxisIndex = 1;
  let option = {
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "shadow",
      },
      backgroundColor: "#fff",
      borderColor: "rgba(75, 253, 238, 0.4)",
      textStyle: {
        color: "#333",
      },
      formatter: "{b} <br/>{a} : {c}<br/> {a1} : {c1}%",
    },
    toolbox: {
      // feature: {
      //   dataView: { show: true, readOnly: false },
      //   magicType: { show: true, type: ["line", "bar"] },
      //   restore: { show: true },
      //   saveAsImage: { show: true },
      // },
    },
    legend: {
      data: ["滞留车辆数", "滞留车辆占比"],
      textStyle: {
        color: "#fff",
      },
    },
    grid: {
      left: "3%",
      right: "4%",
      bottom: 0,
      containLabel: true,
    },
    xAxis: [
      {
        type: "category",
        name: "天",
        nameGap: 20,
        nameLocation: "end",
        data: props.xData,
        axisPointer: {
          type: "shadow",
        },
        axisLine: {
          lineStyle: {
            color: "#fff",
          },
        },
      },
    ],
    yAxis: [
      // Math.max(...arr)
      {
        type: "value",
        // name: "滞留车辆数",
        interval: Math.max(...arr[0].data) > 5 ? null : 1,
        splitLine: {
          show: true,
          lineStyle: {
            type: "dashed",//虚线
						color: ["rgba(255,255,255,0.3)"],
						width: 1,
          },
        },
        axisLabel: {
          //y轴文字的配置
          textStyle: {
            color: "#fff",
          },
        },
      },
      {
        type: "value",
        // name: "滞留车辆占比",
        min: 0,
        max: 100,
        interval: 20,
        splitLine: {
          show: true,
          lineStyle: {
            type: "dashed",//虚线
						color: ["rgba(255,255,255,0.3)"],
						width: 1,
          },
        },
        axisLabel: {
          //y轴文字的配置
          textStyle: {
            color: "#fff",
          },
        },
      },
    ],
    series: arr,
  };
  return option;
}
onMounted(() => {
  nextTick(() => {
    initChart(linePillar.value);
  });
});
</script>
<style lang="less" scoped>
#load-chart,
.power-factor {
  width: 100%;
  height: 100%;
}
</style>
