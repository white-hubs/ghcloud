<template>
  <div ref="powerFactorRef" class="power-factor" />
</template>

<script lang="ts" setup>
import { onMounted, ref, watch } from 'vue';
import * as echarts from 'echarts'
import type { EChartsOption } from 'echarts'
const powerFactorRef = ref();

const props = withDefaults(defineProps<{
  colors?: string[];
  xData:string[] |undefined;
  yData1:number[] |undefined;
  yData2:number[] |undefined;
}>(), {
  colors: () => ['#FD683E', '#1890FF'],
  xData: () => [],
  yData1: () => [],
  yData2: () => []
});
const render = () => {
  const option: EChartsOption = {
    title: {
      text: '巡检次数趋势',
      textStyle: {
        color: '#333',
        fontSize: 14
      }
    },
    tooltip: {
      trigger: 'axis'
    },
    grid: {
      left: 50,
      right: 50
    },
    xAxis: {
      type: 'category',
      data: props.xData
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: '巡检任务数',
        color: '#FD683E',
        data: props.yData1,
        type: 'line',
        smooth: true
      }, {
        name: '巡检次数',
        color: '#1890FF',
        data: props.yData2,
        type: 'line',
        smooth: true
      }
    ]
  };
  const myChart = echarts.init(powerFactorRef.value)
  option && myChart.setOption(option)
};
watch(
  () => [...props.yData1], () => {
    render()
  }
);
onMounted(() => {
  render()
});
</script>
<style lang="less" scoped>
#load-chart,
.power-factor {
  width: 100%;
  height: 100%;
}
</style>
