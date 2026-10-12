<template>
  <div ref="chartDom" class="chart" />
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import * as echarts from 'echarts'
import type { EChartsOption } from 'echarts'

const chartDom = ref();

const props = withDefaults(defineProps<{
  xData?: string[];
  yData?:string[];
}>(), {
  xData: () => [''],
  yData: () => ['']
});
const render = () => {
  const option: EChartsOption = {
    title: {
      text: '任务耗时统计',
      textStyle: {
        color: '#333',
        fontSize: 14
      }
    },
    tooltip: {
      trigger: 'item'
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
        data: props.yData,
        type: 'bar',
        barWidth: '3%',
        color: '#1890FF'
      }
    ]
  };
  const myChart = echarts.init(chartDom.value)
  option && myChart.setOption(option)
};
watch(
  () => [...props.yData],
  () => {
    render();
  }
);
onMounted(() => {
  render()
});
</script>
<style scoped lang="less">
.chart {
width: 100%;
min-height: 200px;
}
</style>
