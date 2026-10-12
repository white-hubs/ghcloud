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
    name: {
      type: String || Number,
      default: ''
    },
    subName: {
      type: String,
      default: '报警总数'
    },
    center: {
      type: Array,
      default: ['50%', '50%']
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
      legend: props.legend,
      title: {
        text: props.name,
        subtext: props.subName,
        left: 'center',
        top: '30%'
      },
      series: [
        {
          type: 'pie',
          radius: ['75%', '100%'],
          center: props.center,
          label: {
            overflow: 'truncate',
            position: 'center',
            alignTo: 'edge',
            edgeDistance: 0,
          },
          labelLine: {
            show: false,
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
    return (): JSX.Element =>
      <>
        <div id='pie' ref={pie} style='width:100%;height:100%' />
      </>
  }
})
