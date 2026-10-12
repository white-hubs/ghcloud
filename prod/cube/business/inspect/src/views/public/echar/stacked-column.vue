<template>
  <div ref="chartDom" class="chart" />
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import * as echarts from 'echarts'
const chartDom = ref();

const props = withDefaults(defineProps<{
  yData: {
    color?:string;
    data:string[];
    name:string;
  }[];
  xData:string[];
  title?:string;
}>(), {
  yData: () => [],
  xData: () => [],
  title: '部门任务完成情况'
});
const render = () => {
  const option: any = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    title: {
      text: props.title,
      textStyle: {
        color: '#333',
        fontSize: 14
      }
    },
    legend: {
      itemGap: 30,
      itemHeight: 8,
      itemWidth: 8,
      textStyle: {
        fontSize: 14,
        lineHeight: 14,
        rich: {
          a: {
            verticalAlign: 'middle'
          }
        },
        padding: [0, 0, -2, 0]
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: [
      {
        type: 'category',
        data: props.xData
      }
    ],
    yAxis: [
      {
        type: 'value'
      }
    ],
    series: props.yData.map((item:any) => {
      return {
        name: item.name,
        type: 'bar',
        color: item.color,
        barWidth: 20,
        stack: 'Search Engine',
        emphasis: {
          focus: 'series'
        },
        data: item.data
      }
    })
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
</style>
