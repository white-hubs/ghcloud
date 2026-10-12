import { defineComponent, onMounted, ref, watch } from 'vue'
import * as echarts from 'echarts'

export const Pie = defineComponent({
  props: {
    data: {
      type: Array,
      default: []
    },
    legend: {
      type: Object,
      default: () => {
        return {
          type: 'plain'
        }
      }
    },
    emphasis: {
      type: Object,
      default: () => {
        return {
          label: {
            show: false,
          }
        }
      }
    },
    label: {
      type: Object,
      default: () => {
        return {
          show: false,
          position: 'center'
        }
      }
    },
    labelLine: {
      type: Object,
      default: () => {
        return {
          show: false
        }
      }
    },
    name: {
      type: String,
      default: ''
    },
    center: {
      type: Array,
      default: ['20%', '50%']
    },
    radius: {
      type: Array,
      default: ['35%', '55%']
    },
    tooltipFormatter: {
      type: String || Function,
      default: '{b0}: {c0}'
    }
  },
  setup: (props, context) => {
    const myChart = ref()
    const pie = ref()
    const render = (): void => {
      const option =
    {
      legend: props.legend,
      title: {
        subtext: props.name,
        left: '32%',
        top: '22%'
      },
      tooltip: {
        trigger: 'item',
        formatter: props.tooltipFormatter
      },
      series: [
        {
          type: 'pie',
          radius: props.radius,
          center: props.center,
          avoidLabelOverlap: false,
          label: {
            ...props.label,
            formatter: (params: { name: string; }): string => {
              if (params.name.length > 4) {
                return params.name.substring(0, 4) + '...'
              }
              return params.name
            }
          },
          labelLine: props.labelLine,
          emphasis: props.emphasis,
          data: props.data
        }
      ]
    }

      myChart.value = echarts.init(pie.value)
      option && myChart.value.setOption(option)
    }
    onMounted(() => {
      render()
    })
    watch(() => props.data, () => {
      render()
    })
    context.expose({
      render
    })
    return (): JSX.Element =>
      <>
        <div id='pie' ref={pie} style='width:100%;height:100%' />
      </>
  }
})
