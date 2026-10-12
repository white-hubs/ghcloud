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
    const colors = ['#1989fa', 'green']
    const render = (): void => {
      const option =
    {
      legend: props.legend,
      tooltip: {
        show: true,
      },
      grid: { // 让图表占满容器
        top: '20px',
        left: '30px',
        right: '20px',
        bottom: '60px'
      },
      xAxis: {
        data: props.xAxis,
        axisLabel: {
          rotate: props.rotate
        },
        boundaryGap: false // 不留白，从原点开始
      },
      yAxis: { type: 'value' },
      series: props.data.map((x, i) => {
        return {
          smooth: true,
          type: 'line',
          name: (x as { name: string; }).name,
          data: (x as { data: unknown; }).data,
          lineStyle: {
            color: colors[i]
          }
        }
      })
    }
      myChart.value = echarts.init(line.value)
      option && myChart.value.setOption(option)
    }
    onMounted(() => {
      render()
    })
    watch(() => props.data, () => {
      render()
    }, { deep: true })
    watch(() => props.xAxis, () => {
      render()
    }, { deep: true })
    context.expose({
      render
    })
    return (): JSX.Element =>
      <>
        <div id='line' ref={line} style='width:inherit;height:inherit' />
      </>
  }
})
