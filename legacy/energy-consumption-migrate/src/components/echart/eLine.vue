<template>
  <div id="line" ref="line" style="width:100%;height:100%" />
</template>
<script setup lang="ts">
import * as echarts from 'echarts'
import { type EChartsOption } from 'echarts'
import { onMounted, ref, watch } from 'vue'

import { getDays, getHour, getMonth } from '@/utils/getTime'

interface Props {
  /** X轴数据 */
  xData?: 'year'|'month'|'day'|string[];
  // Y轴数据
  series?: echarts.SeriesOption | echarts.SeriesOption[] | undefined;
  title?:string;
  legend?:echarts.LegendComponentOption;
  rotate?:number;
}
const line = ref()
let myChart:any = null
const props = withDefaults(defineProps<Props>(), {
  xData: 'year',
  series: () => [],
  title: '',
  rotate:0
})
const render = () => {
  const option :EChartsOption = {
    title: {
      show: !!props.title,
      subtext: props.title
    },
    tooltip: {
      trigger: 'axis',
      formatter: props.title === '' ? '' : `${props.title}: {c0}`
    },
    legend: props.legend ?? {},
    grid: {
      left: '3%',
      right: '4%',
      bottom: '5%',
      containLabel: true
    },

    xAxis: {
      type: 'category',
      boundaryGap: false,
      axisLabel: {
        show: true,
        interval: 0,
        rotate: props.rotate
      },
      data: props.xData === 'year' ? getMonth() : props.xData === 'month' ? getDays() : props.xData === 'day' ? getHour() : props.xData
    },
    yAxis: {
      type: 'value'
    },
    series: props.series
  }
  myChart = echarts.init(line.value)
  option && myChart.setOption(option, true)
}

onMounted(() => {
  render()
})
watch(() => props.series, () => {
  render()
})
watch(props.series, () => {
  render()
})
const clear = () => {
  if (myChart) {
    myChart.clear()
    echarts.dispose(myChart)
  }
}
defineExpose({
  clear,
  render
})
</script>
<style lang="less" scoped>

</style>
