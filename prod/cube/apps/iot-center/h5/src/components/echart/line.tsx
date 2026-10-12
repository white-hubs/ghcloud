import { defineComponent, onMounted, ref, watch } from 'vue'
import * as echarts from 'echarts'

export const Line = defineComponent({
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
    xAxis: {
      type: Array,
      default: []
    },
    rotate: { // x轴倾斜角度
      type: Number,
      default: 0
    },
  },
  setup: (props, context) => {
    const myChart = ref()
    const line = ref()
    const render = (): void => {
      const option =
    {
      legend: props.legend,
      grid: { // 让图表占满容器
        top: '20px',
        left: '30px',
        right: '20px',
        bottom: '40px'
      },
      xAxis: {
        data: props.xAxis,
        axisLabel: {
          rotate: props.rotate
        },
        boundaryGap: false // 不留白，从原点开始 
      },
      yAxis: { type: 'value' },
      lineStyle: {
        color: '#2e6af2'
      },
      series: [
        {
          smooth: true,
          type: 'line',
          data: props.data
        }
      ]
    }
      myChart.value = echarts.init(line.value)
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
        <div id='line' ref={line} style='width:100%;height:100%' />
      </>
  }
})
