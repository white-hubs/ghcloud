<template>
  <div :id="props.id" style="width: 100%; height: 100%;"></div>
</template>

<script setup>
import { reactive, toRefs, onMounted, watch, ref } from 'vue';
import * as echarts from "echarts";
import { getUniqueId } from '@/utils/index'
const myChart = ref()
const props = defineProps({
  id: {
    type: String,
    default: () => getUniqueId()
  },
  value: {
    type: Number,
    default: () => 100
  },
  unit: {
    type: String,
    default: () => 'V'
  },
  min: {
    type: Number,
    default: () => 0
  },
  max: {
    type: Number,
    default: () => 400
  }
})
const renderCharts = () => {
  if (!myChart.value) return
  const option = {
    series: [
      {
        type: 'gauge',
        startAngle: 220,
        endAngle: -40,
        min: Math.min(Number(props.value), props.min),
        radius: '100%',
        center: ['50%', '50%'],
        max: Math.max(Number(props.value), props.max),
        itemStyle: {
          color: '#1578FF',
          shadowColor: 'rgba(0,138,255,0.45)',
        },
        progress: {
          show: true,
          width: 8
        },
        pointer: {
          icon: 'triangle',
          length: '70%',
          width: 10,
          offsetCenter: [0, 0]
        },
        axisLine: {
          lineStyle: {
            width: 8
          }
        },
        axisTick: {
          distance: 0,
          length: 5,
          lineStyle: {
            color: '#86909C',
            width: 1 // 刻度线线宽
          }
        },
        splitLine: {
          length: 12,
          distance: 0,
          lineStyle: {
            width: 1,
            color: '#EDF0F3'
          }
        },
        axisLabel: {
          color: '#272c3d',
          distance: 10,
          fontSize: 10,
          show: true,
        },
        title: {
          show: false
        },
        anchor: {
          show: true,
          icon: 'circle',
          size: 8,
          showAbove: true,
          offsetCenter: [0, 0],
          itemStyle: {
            color: '#fff',
            borderWidth: 14,
            borderColor: '#1578FF',
          }
        },
        detail: {
          width: '60%',
          lineHeight: 40,
          height: 40,
          offsetCenter: [0, '60%'],
          valueAnimation: true,
          formatter: function (value) {
            return '{value|' + value + '}' + '{unit|' + props.unit + '}'
          },
          rich: {
            value: {
              fontSize: 20,
              fontWeight: 'bolder',
              color: '#4E5969'
            },
            unit: {
              fontSize: 20,
              fontWeight: 'bolder',
              color: '#4E5969'
            }
          }
        },
        data: [
          {
            value: Number(props.value),
            name: 'A相电压'
          }
        ]
      },
    ]
  }
  myChart.value.setOption(option)
}
watch(() => props.value, () => {
  renderCharts()
})
onMounted(() => {
  myChart.value = echarts.init(document.getElementById(props.id))
  renderCharts()
})

</script>
<style scoped lang='less'></style>