import { defineComponent, onMounted, ref, watch, type VNode } from 'vue'
import * as echarts from 'echarts'

export const Pie = defineComponent({
  props: {
    data: {
      type: Array,
      default: []
    },
    name: {
      type: String || Number,
      default: ''
    },
    subName: {
      type: String,
      default: ''
    },
    center: {
      type: Array,
      default: ['50%', '45%']
    },
    color: {
      type: Array,
      default: () => {
        return ['#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de', '#3ba272', '#fc8452', '#9a60b4', '#ea7ccc']
      }
    }
  },
  setup: (props, context) => {
    const myChart = ref()
    const pie = ref()

    const render = (): void => {
      const option =
      {
        legend: {
          icon: 'circle',
          bottom: 0
        },
        title: {
          text: props.name,
          subtext: props.subName,
          left: 'center',
          top: 'center'
        },
        tooltip: {
          showL: true
        },
        series: [
          {
            type: 'pie',
            radius: ['40%', '70%'],
            center: props.center,
            label: {
              overflow: 'truncate',
              position: 'outer',
              alignTo: 'edge',
              margin: 0,
            },
            labelLine: {
              show: true,
              length: 5,
              length2: 5
            },
            itemStyle: {
              color: function (params: { dataIndex: number; }): unknown {
                return props.color?.[params.dataIndex]
              },

            },
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
    return (): VNode =>
      <>
        <div id='pie' ref={pie} style={{ width: 'inherit', height: 'inherit' }} />
      </>
  }
})
