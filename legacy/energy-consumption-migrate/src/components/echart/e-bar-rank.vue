<template>
  <div id="bar" ref="bar" style="width:100%;height:100%" />
</template>
<script lang="ts" setup>
import { onMounted, ref, watch } from 'vue'
import * as echarts from 'echarts'
import { type EChartsOption } from 'echarts'
interface Props {
  /** X轴数据 */
  Xdata?: Array<string|number>;
  // Y轴数据
  series?:any;
  legend?:echarts.LegendComponentOption;
  xAxis?:echarts.XAXisComponentOption|undefined;
  yAxis?:echarts.YAXisComponentOption|echarts.YAXisComponentOption[];
  tooltip?:boolean;
  name?:string;
  showtrigger?:boolean;
  customTooltip?:any;
}

const bar = ref()
const props = withDefaults(defineProps<Props>(), {
  Xdata: () => [],
  series: () => [],
  legend: () => { return {} },
  xAxis: () => { return {} },
  yAxis: () => { return {} },
  tooltip: true,
  showtrigger: false,
  customTooltip:false,
  name: ''
})
const render = () => {
  const option :EChartsOption = {
    xAxis: props.xAxis,
    yAxis:  props.yAxis,
    title: {
      subtext: props.name
    },
    legend: props.legend,
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      },
      formatter: '{b}: {c}'
    },
    grid: {
      top: '50px',
      right: '20px',
      left: '20px',
      bottom: '20px',
      containLabel: true
    },
    series: props.series
  }
  const newx:any = option.xAxis
  option.xAxis = Object.assign(newx, {
    axisLabel: {
      show: true,
      interval: 0,
      rotate: 0
    }
  })

  const myChart = echarts.init(bar.value)
  option && myChart.setOption(option)
}

onMounted(() => {
  render()
})
watch(() => props.series, () => {
  render()
})
watch(() => props.Xdata, () => {

  render()
})
defineExpose({
  render
})
</script>
