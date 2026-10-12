import { defineComponent, ref, onMounted, watch, type PropType, onUnmounted, markRaw } from 'vue'
import * as echarts from 'echarts'
import './index.less'
import type { ECharts } from 'echarts'
export const LineChart = defineComponent({
  props: {
    value: {
      type: Array,
      default: () => [2.0, 2.2, 3.3, 4.5, 6.3, 10.2, 20.3, 23.4, 23.0, 16.5, 12.0, 6.2]
    },
    unit: {
      type: String,
      default: () => ''
    },
    xAxisData: {
      type: Array,
      deafult: () => ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
    },
    seriesName: {
      type: Array as PropType<string[]>,
      deafult: () => ['报警次数']
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
          show: true,
          trigger: 'axis',
        },
        legend: {
          data: props.seriesName,
        },
        grid: { // 让图表占满容器
          top: '4%',
          left: '6.6%',
          right: '4%',
          bottom: '8%'
        },
        xAxis: [
          {
            type: 'category',
            data: props.xAxisData,
            axisPointer: {
              type: 'shadow'
            },
            axisLabel: {
              formatter: (value: string): string => {
                const showTxtCount = 7
                return value.slice(0, showTxtCount) + '...'
              }
            }
          }
        ],
        yAxis: [
          {
            type: 'value',
            name: '',
            min: 0,
            axisLine: {
              show: true,
            },
            max: (value: { max: number; }): number => {
              return value.max
            },
            axisLabel: {
              formatter: `{value} ${props.unit}`,
              margin: 0
            }
          },
        ],
        series: [
          {
            name: props.seriesName ? props.seriesName[0] : props.seriesName,
            type: 'line',
            smooth: true,
            symbolSize: 8,
            yAxisIndex: 0,
            showSymbol: false,
            symbol: 'circle',
            // areaStyle: {
            //   opacity: 0.8,
            //   color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            //     {
            //       offset: 0,
            //       color: 'rgba(29,102,255,0.2)'
            //     },
            //     {
            //       offset: 1,
            //       color: 'rgba(29,102,255,0)'
            //     }
            //   ])
            // },
            tooltip: {
              valueFormatter: function (value: string): string {

                return value + props.unit
              }
            },
            data: props.value
          }
        ]
      })
    }
    const handleResize = (): void => {
      if (!myChart.value) return
      myChart.value.resize()
    }
    onUnmounted(() => {
      window.removeEventListener('resize', handleResize)
    })
    watch(() => props, () => {
      setOptions()
    }, { deep: true })
    onMounted(() => {
      // markRaw echarts初始化后不为响应式 markRaw处理
      myChart.value = markRaw(echarts.init(chartRef.value))
      window.addEventListener('resize', handleResize)
      setOptions()
    })

    return (): JSX.Element => (
      <div class='canvas' ref={chartRef} />
    )
  }
})
