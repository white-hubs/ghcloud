import { defineComponent, ref, onMounted, watch, nextTick } from 'vue'
import * as echarts from 'echarts'
import './chart.less'
// 条形图
export const BarChart = defineComponent({
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
    }
  },
  setup: (props) => {
    const gaugeChart = ref(null)
    const setOptions = (): void => {
      const myChart = echarts.init(gaugeChart.value)
      myChart.clear()
      myChart.setOption({
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
                color: '#F2A226'
              },
              icon: 'triangle'
            },
            axisLabel: {
              // show: false,
              color: '#B7C1CE',
              fontSize: 10,
              formatter: function (val: number) {
                return Math.ceil(val)
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
              valueAnimation: true,
              fontSize: 20,
              offsetCenter: props.detailPosition,
              formatter: function (value: number) {
                return value + props.unit
              },
            },
            axisLine: {
              show: true,
              lineStyle: {
                width: 10,
                shadowBlur: 0,
                color: [
                  [0.35, '#64D040'],
                  [0.65, '#FDAD30'],
                  [1, '#FF625D']
                ]
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
                borderColor: '#F2A226'
              }
            },
          }
        ]
      })
      nextTick(() => {
        myChart.resize()
      })
      setTimeout(() => {
        myChart.resize()
      }, 400)
    }
    watch(() => props, () => {
      setOptions()
    }, { deep: true })
    onMounted(() => {
      setOptions()
    })

    return () => (
      <div class='chart' ref={gaugeChart} />
    )
  }
})
