<template>
  <div class="bar-chart">
    <div ref="powerFactorRef" class="power-factor" v-if="xData?.length"/>
    <Empty v-if="!xData.length"/>
  </div>
</template>

<script lang="ts" setup>
import { nextTick, onMounted, ref, watch } from 'vue';
import * as echarts from 'echarts'
import type { EChartsOption } from 'echarts'
const powerFactorRef = ref();

const props = withDefaults(defineProps<{
  title: string;
  data:{
    color?:string;
    data:number[]|string[]|undefined;
    name:string;
  }[];
  xData:string[]|undefined;
}>(), {
  title: '部门巡检任务Top5',
  data: () => [],
  xData: () => []
});
const render = () => {
  const series:any = props.data.map(x => {
    if (x.data) {
      return {
        type: 'bar',
        data: props.title === '对象巡检任务数Last10' || props.title === '部门巡检任务last5' ? x.data.map(item => Number(item)) : x.data.map(item => Number(item)).reverse(),
        color: x.color,
        name: x.name,
        barWidth: 10
      }
    } else {
      return ''
    }
  })
  const option: EChartsOption = {
    title: {
      text: props.title,
      textStyle: {
        color: '#333',
        fontSize: 14
      }
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    legend: {},
    grid: {
      left: 180,
      right: 50
    },
    xAxis: {
      type: 'value',
      boundaryGap: [0, 0.01]
    },
    yAxis: {
      type: 'category',
      axisLabel: {
    formatter: function (value) {
      return value.length > 10 ? value.slice(0, 10) + '...' : value;
    }
  },
      data: props.title === '对象巡检任务数Last10' || props.title === '部门巡检任务last5' ? props.xData : props.xData.reverse()
    },
    series
  };
  nextTick(() => {
    const myChart = echarts.init(powerFactorRef.value)
    option && myChart.setOption(option)
  })
};
watch(
  () => props.xData,
  () => {
    
    if (props.xData.length) {
      render();
    }
  }
);
</script>
<style lang="less" scoped>
.bar-chart{
  height: 100%;
  width: 100%;
}
#load-chart,
.power-factor {
  width: 100%;
  height: 100%;
}
</style>
