import { defineComponent, watch, ref, onMounted, type PropType, onUnmounted, nextTick } from 'vue'
import * as echarts from 'echarts'

export const LineChart = defineComponent({
  props: {
    CategoryData: {
      type: Array as PropType<string[]>,
      default: () => []
    },
    showLegend: {
      type: Boolean,
      default: () => true
    },
    series: {
      type: Array,
      default: () =>
        []
    },
  },
  setup: (props, { expose }) => {
    const chart = ref()
    let myChart: echarts.ECharts | null = null

    const initChart = () => {
      if (chart.value) {
        myChart = echarts.init(chart.value)
        setOptions()
      }
    }

    const setOptions = (): void => {
      if (!myChart) return
      const option = {
        xAxis: {
          type: 'category',
          boundaryGap: false,
          axisLine: {
            show: false
          },
          axisTick: {
            show: false
          },
          data: props.CategoryData,
          axisLabel: {
            color: '#A2A2A7',
            formatter: function (value: string, index: number): string {
              if (props.CategoryData.length > 6) {
                if (index === 0 || index === props.CategoryData.length - 1 || (index % 2 === 0 && index < props.CategoryData.length - 1)) {
                  return value
                } else {
                  return ''
                }
              } else {
                return value
              }
            }
          }
        },
        tooltip: {
          trigger: 'axis',

        },
        grid: {
          top: '30px',
          left: '30px',
          right: '30px',
          bottom: '0%',
          containLabel: true
        },
        yAxis: {
          type: 'value',
          axisLabel: {
            color: '#A2A2A7'
          },
          splitLine: {
            lineStyle: {
              type: 'dashed',
              color: '#E5E6EB'
            }
          }
        },
        series: [
          {
            data: props.series,
            type: 'line',
            smooth: true,
            showSymbol: false,
            symbol: 'circle',
            symbolSize: 8,
            areaStyle: {
              opacity: 0.8,
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                {
                  offset: 0,
                  color: 'rgba(22, 93, 255, 0.2)'
                },
                {
                  offset: 1,
                  color: 'rgba(22, 93, 255, 0)'
                }
              ])
            },
            itemStyle: {
                color: '#165DFF'
            },
            lineStyle: {
                width: 2
            }
          }
        ]
      }
      myChart.setOption(option)
    }

    const handleResize = () => {
        myChart?.resize()
    }

    watch(
      () => [props.CategoryData, props.series],
      () => {
        setOptions()
      },
      { deep: true }
    )

    onMounted( async  (): Promise<void> => {
      await nextTick();
      initChart()
      window.addEventListener('resize', handleResize)
    })

    onUnmounted(() => {
      window.removeEventListener('resize', handleResize)
      myChart?.dispose()
    })

    expose({
      setOptions,
      resize: handleResize
    })

    return (): JSX.Element => (
      <div class='chart' ref={chart} style={{ height: '100%', width: '100%' }} />
    )
  }
})
