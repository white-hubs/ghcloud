import { defineComponent, onMounted, watch } from 'vue'
import * as echarts from 'echarts'

export const LineChart = defineComponent({
  props: {
    areaColor: {
      type: String,
      default: 'rgba(230, 161, 59, 0.1)'
    },
    lineColor: {
      type: String,
      default: '#E6A13B'
    },
    xData: {
      type: Array,
      default: () => {
        return []
      }
    },
    yData: {
      type: Array,
      default: () => {
        return []
      }
    },
    chartId: {
      type: String,
      default: 'lineChart'
    }
  },
  setup: (props) => {
    onMounted(() => {
      setOptions()
    })
    watch(() => props.yData, () => {
      setOptions()
    })
    const setOptions = (): void => {
      const myChart = echarts.init(document.getElementById(props.chartId) as HTMLDivElement)
      myChart.setOption({
        backgroundColor: 'transparent',
        tooltip: {
          trigger: 'axis',
          backgroundColor: '#FFFFFF',
          borderWidth: 0,
          padding: [5, 10],
          textStyle: {
            color: '#000000',
          },
        },
        grid: {
          top: 20,
          left: 40,
          right: 40,
          bottom: 40,
          containLabel: false
        },
        toolbox: {
          show: false,
        },
        xAxis: {
          type: 'category',
          boundaryGap: false, // 坐标轴两边留白
          data: props.xData,
          axisLabel: {
            textStyle: {
              color: 'rgba(0, 0, 0, 0.6)',
            }
          },
          axisLine: {
            lineStyle: {
              color: 'rgba(0, 0, 0, 0.6)',
              opacity: 0.3,
            }
          },
          axisTick: {
            show: false,
          },
        },
        yAxis: [
          {
            type: 'value',
            splitNumber: 5,
            splitLine: {
              lineStyle: {
                color: 'rgba(0, 0, 0, 0.6)',
                opacity: 0.3,
              },
            },
            axisLabel: {
              textStyle: {
                color: 'rgba(0, 0, 0, 0.6)',
              },
            },
          },
        ],
        series: [
          {
            type: 'line',
            symbol: 'none',
            itemStyle: {
              normal: {
                color: '#E6A13B',
                lineStyle: {
                  color: props.lineColor,
                  width: 2,
                },
                areaStyle: {
                  // 区域填充样式
                  color: new echarts.graphic.LinearGradient(0, 1, 0, 0, [
                    {
                      offset: 0,
                      color: props.areaColor,
                    },
                    {
                      offset: 1,
                      color: props.areaColor,
                    },
                  ]),
                },
              },
            },
            toolbox: {
              show: false,
            },
            data: props.yData,
          },
        ],
      })
    }
    return (): JSX.Element=>
      <>

        <div id={props.chartId} style={{ width: '100%', height: '100%' }} />

      </>
  }
})
