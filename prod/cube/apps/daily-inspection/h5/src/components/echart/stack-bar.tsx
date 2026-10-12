import { defineComponent, onMounted, ref, watch, type VNode } from 'vue'
import * as echarts from 'echarts'

export const StackBar = defineComponent({
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
          left: '50px',
          right: '20px',
          bottom: '40px',
        }
      }
    }
  },
  setup: (props, context) => {
    const myChart = ref()
    const bar = ref()
    const colors = ['#1D66FF', '#24AE83', '#FFAA00', '#ee6666', '#73c0de', '#3ba272', '#fc8452', '#9a60b4', '#ea7ccc']
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
      series: props.data.map((x, i) => {
        return {
          type: 'bar',
          stack: 'x',
          data: x.data,
          itemStyle: {
            color: colors[i]
          }
        }
      })
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
    watch(() => props.xAxis, () => {
      render()
    })
    context.expose({
      render
    })
    return (): VNode =>
      <>
        <div id='bar' ref={bar} style='width:inherit;height:inherit' />
      </>
  }
})
