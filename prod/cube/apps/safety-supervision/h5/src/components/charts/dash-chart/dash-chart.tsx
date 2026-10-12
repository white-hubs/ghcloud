import { defineComponent, watch, ref, onMounted, onUnmounted } from 'vue'
import * as echarts from 'echarts'
import './chart.less'
// 仪表盘
export const DashChart = defineComponent({
  props: {
    data: {
      type: Number,
      required: true,
    },
    pointerColor: {
      type: String,
      default: '#FFEF4B',
    },
  },
  setup: (props, { expose }) => {
    const chart = ref()
    const setOptions = (): void => {
      const option = {
        backgroundColor: 'transparent',

        series: [
          {
            name: '刻度',
            type: 'gauge',
            center: ['50%', '70%'],
            radius: '90%',
            min: 0, // 最小刻度
            max: 100, // 最大刻度
            splitNumber: 15, // 刻度数量
            startAngle: 180,
            endAngle: 0,
            axisLine: {
              show: true,
              lineStyle: {
                width: 1,
                color: [
                  [
                    1, new echarts.graphic.LinearGradient(
                      0, 0, 1, 0, [{
                        offset: 0,
                        color: '#FA6A36',
                      },
                      {
                        offset: 0.5,
                        color: '#FCFE7E',
                      }, {
                        offset: 0.7,
                        color: '#C3F87A',
                      }, {
                        offset: 1,
                        color: '#2AE8BD',
                      },
                      ]
                    )
                  ],
                ],
              },
            }, // 仪表盘轴线
            axisLabel: {
              show: false,
              color: '#fff',
              fontSize: 12,
              distance: -50,
              formatter: function (v: unknown): unknown {
                return v
              },
            }, // 刻度标签。
            axisTick: {
              show: true,
              splitNumber: 1,
              lineStyle: {
                color: '#4aca96',
                width: 1,
                // length:10
              },
              length: -5,
            }, // 刻度样式
            splitLine: {
              show: true,
              length: -5,
              lineStyle: {
                color: '#4aca96',
                width: 2
              },
            }, // 分隔线样式
          },
          {
            type: 'gauge',
            radius: '120%',
            center: ['50%', '70%'],
            splitNumber: 0, // 刻度数量
            startAngle: 180,
            endAngle: 0,
            axisLine: {
              show: true,
              lineStyle: {
                width: 10,
                color: [
                  [
                    1, new echarts.graphic.LinearGradient(
                      0, 0, 1, 0, [{
                        offset: 0,
                        color: '#FA6A36',
                      },
                      {
                        offset: 0.5,
                        color: '#FCFE7E',
                      }, {
                        offset: 0.7,
                        color: '#C3F87A',
                      }, {
                        offset: 1,
                        color: '#2AE8BD',
                      },
                      ]
                    )
                  ],
                ],
              },
            },
            // 分隔线样式。
            splitLine: {
              show: false,
            },
            axisLabel: {
              show: false,
            },
            axisTick: {
              show: false,
            },
            pointer: {
              show: true,
              length: '80%',
              width: '6%',
              itemStyle: {
                color: props.pointerColor
              }
            },
            detail: {
              show: false,
              offsetCenter: [0, '-40%'],
              color: '#ffffff',
              textStyle: {
                fontSize: 60,
                color: '#4aca96'
              },
            },
            data: [{
              value: props.data,
            }],
          }
        ]
      }
      const myChart = echarts.init(chart.value)
      myChart.clear()
      myChart.setOption(option)
      myChart.resize()
    }
    watch(
      () => [props.pointerColor],
      () => {
        setOptions()
      },
      { deep: true }
    )
    watch(
      () => [props.data],
      () => {
        setOptions()
      },
      { deep: true }
    )
    onMounted(() => {
      setOptions()
      window.addEventListener('resize', () => {
        setOptions()
      })
    })
    onUnmounted(() => {
      window.removeEventListener('resize', setOptions)
    })

    expose({
      setOptions

    })
    return (): JSX.Element => (
      <div class='dash-chart' ref={chart} />
    )
  }
})
