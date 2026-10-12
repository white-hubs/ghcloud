import { defineComponent, ref, onMounted, watch, onUnmounted } from 'vue'
import * as echarts from 'echarts'
import type { ECharts } from 'echarts'
import './charts.less'
export const MeterCharts = defineComponent({
  props: {
    value: {
      type: Number,
      default: () => 0
    },
    title: {
      type: String,
      default: () => '钛泡实时温度'
    }
  },
  setup: (props) => {
    const meterChart = ref()
    const myChart = ref<ECharts>()
    const setOptions = (): void => {
      if (!myChart.value) return
      myChart.value.clear()
      myChart.value.setOption({
        series: [
          {
            type: 'gauge',
            min: -99,
            max: 99,
            radius: '100%',
            detail: {
              valueAnimation: true,
              rich: {
                a: {
                  fontSize: 14,
                  color: '#000'
                },
              },
              formatter: `{a|${props.title}}\n{value}`
            },
            pointer: {
              itemStyle: {
                color: 'auto'
              }
            },
            axisLabel: {
              color: '#B7C1CE',
              fontSize: 12
            },
            axisTick: {
              show: true,
              lineStyle: {
                color: '#B7C1CE',
                width: 1
              },

            },
            splitLine: {
              show: true,
              lineStyle: {
                color: '#B7C1CE'
              }
            },
            axisLine: {
              show: true,
              lineStyle: {
                width: 10,
                shadowBlur: 0,
                color: [
                  [0.3, '#64D040'],
                  [0.7, '#FDAD30'],
                  [1, '#FF625D']
                ]
              }
            },
            data: [
              {
                value: props.value || 0,
              }
            ]
          }
        ]
      })
    }
    const handleResize = (): void => {
      if (!myChart.value) return
      myChart.value.resize()
    }
    watch(() => props.value, () => {
      setOptions()
    })
    onMounted(() => {
      myChart.value = echarts.init(meterChart.value)
      window.addEventListener('resize', handleResize)
      setOptions()
    })
    onUnmounted(() => {
      window.removeEventListener('resize', handleResize)
    })

    return (): JSX.Element => (
      <div class='canvas' ref={meterChart} />
    )
  }
})
