import { defineComponent, onMounted, ref, onUnmounted, watch } from 'vue'
import { Radio } from 'ant-design-vue'
import * as echarts from 'echarts'
import styles from './line-loss-trend.module.less'

export const LineLossTrend = defineComponent({
  name: 'LineLossTrend',
  setup() {
    const chartRef = ref<HTMLDivElement | null>(null)
    const chartInstance = ref<echarts.ECharts | null>(null)
    const timeRange = ref<'week' | 'month' | 'year'>('month')

    const initChart = () => {
      if (chartRef.value) {
        chartInstance.value = echarts.init(chartRef.value)
        updateChart()
        window.addEventListener('resize', handleResize)
      }
    }

    const handleResize = () => {
      chartInstance.value?.resize()
    }

    const getMockData = (range: string) => {
      let xData: string[] = []
      let yData: number[] = []

      if (range === 'week') {
        xData = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
        yData = [2.1, 3.5, 2.8, 4.2, 3.9, 4.5, 3.8]
      } else if (range === 'month') {
        xData = ['1日', '5日', '10日', '15日', '20日', '25日', '30日']
        yData = [2.0, 5.2, 4.8, 6.3, 4.9, 6.5, 4.8, 6.8]
        // Interpolate for smooth curve appearance if fewer points
      } else {
        xData = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
        yData = [3.2, 3.5, 3.8, 3.1, 3.9, 4.2, 4.5, 4.1, 3.8, 3.5, 3.2, 3.0]
      }
      return { xData, yData }
    }

    const updateChart = () => {
      if (!chartInstance.value) return

      const { xData, yData } = getMockData(timeRange.value)

      const option: echarts.EChartsOption = {
        grid: {
          top: 30,
          left: 20,
          right: 20,
          bottom: 20,
          containLabel: true,
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'line',
            lineStyle: {
              color: 'rgba(91, 143, 249, 0.6)'
            }
          },
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          borderColor: '#eee',
          borderWidth: 1,
          textStyle: {
            color: '#333'
          },
          formatter: (params: any) => {
            const item = Array.isArray(params) ? params[0] : params
            if (!item) return ''
            let relVal = '线损率'
            relVal +=
              '<br/>' +
              item.marker +
              item.name +
              ' : ' +
              item.value +
              '%' +
              '<br/> 统计时间 <br/> ' +
              item.axisValueLabel
            return relVal
          }
        },
        xAxis: {
          type: 'category',
          boundaryGap: false,
          data: xData,
          axisLine: {
            lineStyle: {
              color: '#eee'
            }
          },
          axisLabel: {
            color: '#666',
            interval: 0,
            // formatter: function (value) {
            //   if (props.dayType === "TODAY") {
            //     return value + "时";
            //   } else if (props.dayType === "THIS_WEEK") {
            //     return value + '号';
            //   } else if (props.dayType === "THIS_MONTH") {
            //     return value + '号';
            //   } else {
            //     return value + '月';
            //   }
            // },
          },
          axisTick: {
            show: false
          }
        },
        yAxis: {
          type: 'value',
          minInterval: 1,
          axisLine: {
            show: false
          },
          axisTick: {
            show: false
          },
          splitLine: {
            lineStyle: {
              type: 'dashed',
              color: '#eee'
            },
          },
          axisLabel: {
            formatter: '{value}%',
            color: '#666'
          }
        },
        series: [
          {
            data: yData,
            type: 'line',
            smooth: true,
            symbol: 'circle',
            showSymbol: false,
            symbolSize: 6,
            // itemStyle: {
            //   color: '#5B8FF9',
            //   borderWidth: 2
            // },
            lineStyle: {
              color: '#5B8FF9',
              width: 2
            },
            areaStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                {
                  offset: 0,
                  color: 'rgba(91, 143, 249, 0.2)'
                },
                {
                  offset: 1,
                  color: 'rgba(91, 143, 249, 0)'
                }
              ])
            }
          }
        ]
      }

      chartInstance.value.setOption(option)
    }

    watch(timeRange, () => {
      updateChart()
    })

    onMounted(() => {
      initChart()
    })

    onUnmounted(() => {
      window.removeEventListener('resize', handleResize)
      chartInstance.value?.dispose()
    })

    return () => (
      <div class={styles['line-loss-trend']}>
        <div class={styles.header}>
          <div class={styles['unit-info']}>
            X轴：时间 {timeRange.value === 'week' || timeRange.value === 'month' ? '(d)' : '(m)'} &nbsp;&nbsp; Y轴：线损率 (%)
          </div>
          <div class={styles.filter}>
            <Radio.Group value={timeRange.value} onChange={(e: any) => timeRange.value = e.target.value} buttonStyle="solid">
              <Radio.Button value="week">本周</Radio.Button>
              <Radio.Button value="month">本月</Radio.Button>
              <Radio.Button value="year">今年</Radio.Button>
            </Radio.Group>
          </div>
        </div>
        <div ref={chartRef} class={styles['chart-container']}></div>
      </div>
    )
  }
})
