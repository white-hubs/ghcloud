import { defineComponent, ref, onMounted, watch, onUnmounted } from 'vue'
import * as echarts from 'echarts'
import './charts.less'
import type { ECharts } from 'echarts'
export const ThermometerCharts = defineComponent({
  props: {
    value: {
      type: Number,
      default: () => 0
    },
    title: {
      type: String,
      default: '汰泡水温度'
    }
  },
  setup: (props) => {
    const meterChart = ref()
    const myChart = ref<ECharts>()
    const setOptions = (): void => {
      if (!myChart.value) return
      const tpValue = props.value
      const kd: string[] = []
      const gradient: { color: string;offset: number; }[] | undefined = []
      let showValue = 0
      let leftColor = ''
      let boxPosition = [65, 0]
      // 刻度使用柱状图模拟，短设置1，长的设置3；构造一个数据
      for (let i = 0, len = 60; i <= len; i += 1) {
        if ((i - 10) % 10 === 0) {
          kd.push('-3')
        } else {
          kd.push('-1')
        }
      }
      // 中间线的渐变色和文本内容
      if (tpValue > 24) {
        gradient.push({
          offset: 0,
          color: '#93FE94'
        }, {
          offset: 0.5,
          color: '#E4D225'
        }, {
          offset: 1,
          color: '#E01F28'
        })
      } else if (tpValue >= 14) {
        gradient.push({
          offset: 0,
          color: '#93FE94'
        }, {
          offset: 1,
          color: '#E4D225'
        })
      } else {
        gradient.push({
          offset: 1,
          color: '#93FE94'
        })
      }
      if (tpValue > 50) {
        showValue = 50
      } else {
        if (tpValue < 0) {
          showValue = 0
        } else {
          showValue = tpValue + 10
        }
      }
      if (tpValue < -10) {
        boxPosition = [65, -120]
      }
      leftColor = gradient[gradient.length - 1].color
      myChart.value.clear()
      const option = {
        grid: {
          x: 80, // 左侧与y轴的距离
          y: -180, // top部与x轴的距离
          x2: -120, // 右侧与y轴的距离
          y2: 20 // bottom部与x轴的距离
        },
        backgroundColor: '#f2f2f2',
        title: {
          text: props.title,
          show: true
        },
        yAxis: [{
          show: false,
          data: [],
          min: 0,
          max: 120,
          axisLine: {
            show: false
          }
        }, {
          show: false,
          min: 0,
          max: 60,
        }],
        xAxis: [{
          show: false,
          min: -10,
          max: 80,
          data: []
        }, {
          show: false,
          min: -10,
          max: 80,
          data: []
        }, {
          show: false,
          min: -10,
          max: 80,
          data: []
        }, {
          show: false,
          min: -5,
          max: 80,

        }],
        series: [{
          name: '条',
          type: 'bar',
          // 对应上面XAxis的第一个对象配置
          xAxisIndex: 0,
          data: [{
            value: showValue,
            label: {
              normal: {
                show: true,
                position: boxPosition,
                width: 20,
                height: 100,
                formatter: `{back|${tpValue}}{unit|°C}\n{downTxt| }`,
                rich: {
                  back: {
                    align: 'center',
                    lineHeight: 50,
                    fontSize: 30,
                    fontFamily: 'digifacewide',
                    color: leftColor
                  },
                  unit: {
                    fontFamily: '微软雅黑',
                    fontSize: 15,
                    lineHeight: 50,
                    color: leftColor
                  },
                  downTxt: {
                    lineHeight: 50,
                    fontSize: 25,
                    align: 'center',
                    color: '#fff'
                  }
                }
              }
            }
          }],
          barWidth: 4,
          itemStyle: {
            normal: {
              color: new echarts.graphic.LinearGradient(0, 1, 0, 0, gradient)
            }
          },
          z: 2
        }, {
          name: '白框',
          type: 'bar',
          xAxisIndex: 1,
          barGap: '-100%',
          data: [60],
          barWidth: 14,
          itemStyle: {
            normal: {
              color: '#0C2E6D',
              barBorderRadius: 50,
            }
          },
          z: 1
        }, {
          name: '外框',
          type: 'bar',
          xAxisIndex: 2,
          barGap: '-100%',
          data: [61],
          barWidth: 24,
          itemStyle: {
            normal: {
              color: '#4577BA',
              barBorderRadius: 50,
            }
          },
          z: 0
        }, {
          name: '圆',
          type: 'scatter',
          hoverAnimation: false,
          data: [0],
          xAxisIndex: 0,
          symbolSize: 20,
          itemStyle: {
            normal: {
              color: '#93FE94',
              opacity: 1,
            }
          },
          z: 2
        }, {
          name: '白圆',
          type: 'scatter',
          hoverAnimation: false,
          data: [0],
          xAxisIndex: 1,
          symbolSize: 24,
          itemStyle: {
            normal: {
              color: '#0C2E6D',
              opacity: 1,
            }
          },
          z: 1
        }, {
          name: '外圆',
          type: 'scatter',
          hoverAnimation: false,
          data: [0],
          xAxisIndex: 2,
          symbolSize: 30,
          itemStyle: {
            normal: {
              color: '#4577BA',
              opacity: 1,
            }
          },
          z: 0
        },
        {
          name: '刻度',
          type: 'bar',
          yAxisIndex: 0,
          xAxisIndex: 3,
          label: {
            normal: {
              show: true,
              position: 'left',
              distance: 10,
              color: '#000',
              fontSize: 14,
              formatter: function (params: { dataIndex: number; }): number | string {
                if ((params.dataIndex - 10) % 10 === 0) {
                  return params.dataIndex - 10
                } else {
                  return ''
                }
              }
            }
          },
          barGap: '-100%',
          data: kd,
          barWidth: 1,
          itemStyle: {
            normal: {
              color: '#000',
              barBorderRadius: 120,
            }
          },
          z: 0
        }
        ]
      }
      myChart.value.setOption(option)
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
