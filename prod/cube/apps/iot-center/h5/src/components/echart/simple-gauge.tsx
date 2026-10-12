import { defineComponent, ref, onMounted, watch, nextTick } from 'vue'
import * as echarts from 'echarts'
import './chart.less'
export const SimpleGauge = defineComponent({
  props: {
    unit: {
      type: String,
      default: '',
    },
    data: {
      type: Number,
      default: 0,
    },
    min: {
      type: Number,
      default: 0,
    },
    max: {
      type: Number,
      default: 100,
    },
    title: {
      type: String,
      default: '',
    },
    detailPosition: {
      type: Array,
      default: () => {
        return [0, '70%']
      }
    },
    axisLineColor: {
      type: Array,
      default: () => {
        return [
          [1, '#F1F6FC']
        ]
      }
    },
    progressShow: {
      type: Boolean,
      default: true
    },
    anchorColor: {
      type: String,
      default: '#1578FF',
    },
    pointerColor: {
      type: String,
      default: '#1578FF',
    },
    id: {
      type: String,
      default: ''
    },
  },
  setup: (props) => {
    const myChart = ref()
    const renderCharts = (): void => {
      const container = document.getElementById(props.id)
      myChart.value = container && echarts.init(container)
      if (!myChart.value) return
      const option = {
        tooltip: {
          confine: true,
          formatter: `${props.title}<br/>{b} : {c}${props.unit}`
        },
        series: [
          {
            type: 'gauge',
            min: Math.min(props.min, props.data),
            max: Math.max(props.max, props.data),
            pointer: {
              itemStyle: {
                color: props.pointerColor
              },
              icon: 'triangle'
            },
            axisLabel: {
              // show: false,
              color: '#3d3d3d',
              fontSize: 10,
              formatter: function (val: number): string {
                return val.toFixed(1)
              },
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
            detail: {
              valueAnimation: false,
              fontSize: 20,
              offsetCenter: props.detailPosition,
              formatter: function (value: number): string {
                return value + props.unit
              },
            },
            axisLine: {
              show: true,
              lineStyle: {
                width: 14,
                shadowBlur: 0,
                color: props.axisLineColor
              }
            },
            data: [
              {
                value: props.data,

              }
            ],
            anchor: {
              show: true,
              showAbove: true,
              size: 12,
              itemStyle: {
                borderWidth: 6,
                borderColor: props.anchorColor
              }
            },
            progress: {
              show: props.progressShow,
              width: 14,
              itemStyle: {
                color: '#1578FF'
              }
            },
          }
        ]
      }
      myChart.value.setOption(option)
    }
    watch(() => props, () => {
      nextTick(() => {
        renderCharts()
      })
    }, { deep: true, immediate: true })
    onMounted(() => {
      nextTick(() => {
        renderCharts()
      })
    })

    return (): JSX.Element => (
      <div id={props.id} class='chart' />
    )
  }
})
