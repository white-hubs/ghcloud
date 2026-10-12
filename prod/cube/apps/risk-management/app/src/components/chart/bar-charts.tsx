import { defineComponent, ref, onMounted, watch, onUnmounted, markRaw } from 'vue'
import * as echarts from 'echarts'
import type { ECharts } from 'echarts'
import './charts.less'
export const BarCharts = defineComponent({
  props: {
    value: {
      type: String,
      default: () => 0
    },
    xAxisData: {
      type: Array,
      default: () => ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    },
    yAxisOption: {
      type: Array,
      default: () => {
        return [
          {
            type: 'value',
            name: '用户',
            min: 0,
            max: 250,
            interval: 50,
            axisLabel: {
              formatter: '{value} ml'
            }
          },
          {
            type: 'value',
            name: '设备活跃率',
            min: 0,
            max: 25,
            interval: 5,
            axisLabel: {
              formatter: '{value} °C'
            }
          }
        ]
      }
    },
    series: {
      type: Array,
      default: () => [
        {
          name: '用户',
          type: 'bar',
          barWidth: 10,
          tooltip: {
            valueFormatter: function (value: string): string {
              return value + ' ml'
            }
          },
          data: [
            2.0, 4.9, 7.0, 23.2, 25.6, 76.7, 135.6, 162.2, 32.6, 20.0, 6.4, 3.3
          ]
        },
        {
          name: '设备活跃率',
          type: 'bar',
          barWidth: 10,
          tooltip: {
            valueFormatter: function (value: string): string {
              return value + ' °C'
            }
          },
          data: [2.0, 2.2, 3.3, 4.5, 6.3, 10.2, 20.3, 23.4, 23.0, 16.5, 12.0, 6.2]
        }
      ]
    }
  },

  setup: (props) => {
    const chartRef = ref()
    const myChart = ref<ECharts>()
    const setOptions = (): void => {
      if (!myChart.value) return
      myChart.value.clear()
      myChart.value.setOption({
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross',
            crossStyle: {
              color: '#999'
            }
          }
        },
        legend: {
          data: props.series.map(item => (item as { name: string; }).name)
        },
        grid: { // 让图表占满容器
          top: '14%',
          left: '4%',
          right: '4%',
          bottom: '8%'
        },
        xAxis: [
          {
            type: 'category',
            data: props.xAxisData,
            axisPointer: {
              type: 'shadow'
            }
          }
        ],
        yAxis: props.yAxisOption,
        series: props.series
      })
    }
    const handleResize = (): void => {
      if (!myChart.value) return
      myChart.value.resize()
    }
    watch(() => props, () => {
      setOptions()
    }, { deep: true })
    onUnmounted(() => {
      window.removeEventListener('resize', handleResize)
    })
    onMounted(() => {
      myChart.value = markRaw(echarts.init(chartRef.value))
      window.addEventListener('resize', handleResize)
      setOptions()
    })

    return (): JSX.Element => (
      <div class='canvas' ref={chartRef} />
    )
  }
})
