import { defineComponent, onMounted, ref, watch } from 'vue'
import * as echarts from 'echarts'

export const Bar = defineComponent({
  props: {
    data: {
      type: Array,
      default: []
    },
    xAxis: {
      type: Array,
      default: []
    },
    rotate: { // x轴倾斜角度
      type: Number,
      default: 0
    },
    name: {
      type: String,
      default: ''
    },
    grid: {
      type: Object,
      default: () => {
        return { // 图表在容器中的位置
          top: '20px',
          left: '30px',
          right: '20px',
          bottom: '40px',
        }
      }
    }
  },
  setup: (props, context) => {
    const myChart = ref()
    const bar = ref()
    const render = (): void => {
      const option =
    {
      tooltip: {
        trigger: 'item',
        axisPointer: {
          type: 'shadow'
        },
      },
      legend: {
        data: [props.name],
        icon: 'circle',
        top: '-4',
        left: '10%'
      },
      color: '#2e6af2',
      grid: props.grid,
      xAxis: {
        data: props.xAxis,
        axisLabel: {
          interval: 0,
          width: 60,
          overflow: 'truncate',
          rotate: props.rotate
        },
      },
      yAxis: { },
      series: [
        {
          name: props.name ?? '平均耗时',
          type: 'bar',
          data: props.data
        }
      ]
    }
      myChart.value = echarts.init(bar.value)
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
        <div id='bar' ref={bar} style='width:100%;height:100%' />
      </>
  }
})
