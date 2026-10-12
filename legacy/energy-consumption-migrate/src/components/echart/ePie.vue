<template>
  <div id="pie" ref="pie" style="width:100%;height:100%" ></div>
</template>

<script lang="ts" setup>
import * as echarts from 'echarts'
import { type EChartsOption } from 'echarts'
import { onMounted, ref, watch } from 'vue'
interface Props {
  data?: {
    value:number;
    name:string;
  }[];
  legend?:echarts.LegendComponentOption;
  name?:string;
  center?:Array<string>;
  radius?:Array<string>;
  label?:Object;
}
const pie = ref()
const props = withDefaults(defineProps<Props>(), {
  data: () => [],
  name: '',
  center: () => ['50%', '50%'],
  radius:() => ['40%', '70%'],
  label:() =>{return {show: false,position: 'center'}}
})
const myChart = ref()
const render = () => {
  const total = props.data.reduce((a:any, b:any) => {
    return parseFloat(a) + parseFloat(b.value)
  }, 0)

  const option :EChartsOption =
{
  tooltip: {
    formatter: (name:any) => {
      return name.value === 0 ? name.name : name.name + ' ' + name.value + ' ' + (name.value / total * 100).toFixed(2) + '%'
    },
    trigger: 'item'
  },
  legend: props.legend as echarts.LegendComponentOption,
  title: {
    subtext: props.name
  },
  series: [
    {
      name: props.name,
      type: 'pie',
      radius: props.radius,
      avoidLabelOverlap: false,
      center: props.center,
      itemStyle: {
        borderRadius: 0,
        borderColor: '#fff',
        borderWidth: 2
      },
      label: props.label,
      emphasis: {
        label: {
          show: true,
          fontSize: 20,
          fontWeight: 'bold'
        }
      },
      labelLine: {
        show: false
      },
      data: props.data
    }
  ]
}
  myChart.value = echarts.init(pie.value)
  option && myChart.value.setOption(option)

  // if (props.data.length > 15) {
  //   (document.getElementById('pie') as any).style.height = 300 + 'px'
  //   myChart.value.resize()
  // }
}

onMounted(() => {
  render()
})
watch(() => props.data, () => {
  render()
})
defineExpose({
  render
})
</script>
<style lang="less" scoped></style>
