<template>
  <div :class="['pie-box', props.class]">
    <div :class="['power-factor', props.pieClass]" ref="powerFactorRef"></div>
    <div class="content">
      <slot></slot>
    </div>
  </div>
</template>

<script lang="ts" setup>
// 1. 引入
import { nextTick, watch, onMounted, ref, computed } from "vue";
import * as echarts from "echarts/core";
import { PieChart } from "echarts/charts";
import {
  LegendComponent,
  TitleComponent,
  TitleComponentOption,
  TooltipComponent,
} from "echarts/components";
import "echarts-liquidfill";
echarts.use([PieChart, LegendComponent, TooltipComponent, TitleComponent]);
const powerFactorRef = ref();
const props = defineProps({
  pieData: {
    type: [] as any,
    required: true,
  },
  class: String,
  pieClass: String,
});
const pieValue = computed<string>(() => {
  return props.pieData.map((item) => {
    return item.value;
  });
});
const pieColor = computed<string>(() => {
  return props.pieData.map((item) => {
    return item.color;
  });
});

let myChart: echarts.ECharts | null = null;
const initChart = (container?: HTMLElement) => {
  if (!myChart) myChart = echarts.init(container as HTMLElement);
  myChart.setOption(option());
};

watch(
  () => [...props.pieData],
  (newVal) => {
    initChart(powerFactorRef.value);
  },
  {deep:true}
);
onMounted(() => {
  initChart(powerFactorRef.value);
});
// 4.配置项

const option = () => {
  let option = {
    color: pieColor.value,
    series: [
      {
        name: "Access From",
        type: "pie",
        radius: ["80%", "70%"],
        avoidLabelOverlap: true,
        label: {
          show: false,
          position: "center",
        },
        data: pieValue.value,
      },
    ],
  };
  return option;
};
</script>
<style lang="less" scoped>
#load-chart,
.power-factor {
  width: 154px;
  height: 154px;
}

.pie-box {
  position: relative;
  width: 154px;
  height: 154px;

  &::after {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 50px;
    height: 50px;
    transform: translate(-50%, -50%);
    content: "";
    border-radius: 50%;
    background-color: rgba(0, 0, 0, 0.445);
    z-index: -1;
  }

  &::before {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 95px;
    height: 95px;
    transform: translate(-50%, -50%);
    content: " ";
    border-radius: 50%;
    border: 1px dashed rgba(203, 226, 255, 0.5);
    z-index: -1;
  }

  .content {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 1;
  }
}
</style>
