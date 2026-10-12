import { defineComponent, onMounted, ref, watch, type VNode } from 'vue'
import * as echarts from 'echarts'

export const RatioPie = defineComponent({
  props: {
    ratio: {
      type: Number,
      default: 0
    },
    legend: {
      type: Object,
      default: () => {
        return {
          type: 'plain'
        }
      }
    },
    color: {
      type: String,
      default: '#2d6af2'
    },
    name: {
      type: String || Number,
      default: ''
    },
    center: {
      type: Array,
      default: ['50%', '50%']
    },
    radius: {
      type: Array,
      default: () => {
        return ['70%', '100%']
      }
    },
    titlePosition: {
      type: Object,
      default: () => {
        return {
          left: '38%',
          top: '25%'
        }
      }
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
        left: props.titlePosition.left,
        top: props.titlePosition.top,
        textAlign: 'center',
        textVerticalAlign: 'middle'
      },
      series: [
        {
          type: 'pie',
          radius: props.radius,
          center: props.center,
          label: {
            overflow: 'truncate',
            position: 'outer',
            alignTo: 'edge',
            margin: 0,
          },
          labelLine: {
            show: false,
          },
          itemStyle: {
            color: (colors: { dataIndex: number; }): string => {
              const color = [props.color, '#d0d1d3']
              return color[colors.dataIndex]
            }
          },
          data: [props.ratio, 100 - props.ratio]
        }
      ]
    }

      myChart.value = echarts.init(pie.value)
      option && myChart.value.setOption(option)
    }
    onMounted(() => {
      render()
    })
    watch(() => props.ratio, () => {
      render()
    })
    context.expose({
      render
    })
    return (): VNode =>
      <>
        <div id='pie' ref={pie} style='width:inherit;height:inherit' />
      </>
  }
})
