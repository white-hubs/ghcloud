<template>
  <div id="bar" ref="bar" style="width:100%;height:100%" />
</template>
<script lang="ts" setup>
import { onMounted, ref, watch } from 'vue'

import { getDays } from '@/utils/getTime'
import * as echarts from 'echarts'
import { type EChartsOption } from 'echarts'
interface Props {
  /** X轴数据 */
  Xdata?: Array<string|number>;
  // Y轴数据
  ydata?:any;
  legend?:echarts.LegendComponentOption;
  xAxis?:echarts.XAXisComponentOption|undefined;
  yAxis?:echarts.YAXisComponentOption|echarts.YAXisComponentOption[];
  tooltip?:boolean;
  name?:string;
  showtrigger?:boolean;
}

const bar = ref()
const props = withDefaults(defineProps<Props>(), {
  Xdata: () => [],
  ydata: () => [],
  legend: () => { return {} },
  xAxis: () => { return {} },
  yAxis: () => { return {} },
  tooltip: true,
  showtrigger: false,
  name: ''
})
const xaxis:string = JSON.stringify(props.xAxis)
const yaxis:string = JSON.stringify(props.yAxis)
const render = () => {

  const option :EChartsOption = {
    xAxis: xaxis === '{}'
      ? {
          type: 'category',

          axisTick: {
            alignWithLabel: true
          },
          data: !props.Xdata ? props.Xdata : getDays()
        }
      : props.xAxis,
    yAxis: yaxis === '{}'
      ? {
          type: 'value'
        }
      : props.yAxis,
    title: {
      subtext: props.name
    },
    legend: props.legend,
    tooltip: props.showtrigger
      ? {
          show: true,
          formatter: (name:any) => {
            return name.value === 0 ? name.name : name.name + ' ' + name.value * 100 + ' ' + '%'
          }
        }
      : {
          show: props.tooltip,

          trigger: 'axis'

        },
    grid: {
      top: '50px',
      right: '20px',
      left: '20px',
      bottom: '20px',
      containLabel: true
    },
    series: props.ydata
  }

  const myChart = echarts.init(bar.value)
  option && myChart.setOption(option)
}

onMounted(() => {
  render()
})
// watch(props.ydata, () => {
//   render()
// })
watch(() => props.ydata, () => {
  render()
})
watch(() => props.Xdata, () => {

  render()
})
defineExpose({
  render
})
</script>
<style lang="less" scoped>

</style>
