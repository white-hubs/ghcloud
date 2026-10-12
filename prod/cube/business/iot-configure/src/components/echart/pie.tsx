

import { defineComponent, onMounted, ref, watch } from 'vue'
import * as echarts from 'echarts'

export const Pie = defineComponent({
  props: {
    data: {
      type: Array,
      default: ''
    },
    legend: {},
    name: {
      type: String,
      default: ' '
    },
    center: {
      type: Array,
      default: true
    }
  },
  setup: (props, context) => {
    const myChart = ref()
    const pie = ref()
    const render = (): void => {

      const option =
    {
      tooltip: {

        trigger: 'item'
      },
      legend: props.legend,
      title: {
        subtext: props.name
      },
      series: [
        {

          type: 'pie',
          radius: ['40%', '50%'],
          avoidLabelOverlap: false,
          center: props.center,
          itemStyle: {
            borderRadius: 10,
            borderColor: '#fff',
            borderWidth: 2
          },
          label: {
            show: false,
            position: 'center'
          },
          emphasis: {
            label: {
              show: true,
              fontSize: 20,
              fontWeight: 'bold'
            }
          },
          labelLine: {
            show: false
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
    // defineExpose({
    //   render
    // })
    return (): JSX.Element =>
      <>
        <div id='pie' ref={pie} style='width:100%;height:100%' />
      </>
  }
})
