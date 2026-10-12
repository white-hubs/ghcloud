import { defineComponent, onMounted, ref, watch } from 'vue'
import * as echarts from 'echarts'

export const Bar = defineComponent({
  props: {
    Xdata: {
      type: Array,
      default: () => []
    },
    ydata: {
      type: Array,
      default: () => []
    },
    legend: {
      type: Object,
      default: () => {
        return {}
      },
    },
    xAxis: {
      type: Object,
      default: () => {
        return {}
      },
    },
    yAxis: {
      type: Object,
      default: () => {
        return {}
      },
    },
    name: {
      type: String,
      default: '',
    },
    showtrigger: {
      type: Boolean,
      default: false,
    },
    tooltip: {
      type: Boolean,
      default: true,
    },

  },
  setup: (props, context) => {
    const xaxis: string = JSON.stringify(props.xAxis)
    const yaxis: string = JSON.stringify(props.yAxis)
    const bar = ref()
    const render = (): void => {
      const option = {
        xAxis: xaxis === '{}'
          ? {
            type: 'category',

            axisTick: {
              alignWithLabel: true
            },
            data: props.Xdata
          }
          : props.xAxis,
        yAxis: yaxis === '{}'
          ? {
            type: 'value'
          }
          : props.yAxis,
        title: {
          subtext: props.name
        },
        legend: props.legend,
        tooltip: props.showtrigger
          ? {
            show: props.tooltip,
            formatter: props.name === '' ? '' : `${props.name}: {c0}`
          }
          : {
            show: props.tooltip,

            trigger: 'axis'

          },
        grid: {
          top: '50px',
          right: '20px',
          left: '20px',
          bottom: '20px',
          containLabel: true
        },
        series: props.ydata
      }
      // const newx = option.xAxis
      // option.xAxis = Object.assign(newx, {
      //   axisLabel: {
      //     show: true,
      //     interval: 0,
      //     rotate: 45
      //   }
      // })

      const myChart = echarts.init(bar.value)
      option && myChart.setOption(option)
    }

    onMounted(() => {
      render()
    })
    watch(() => props.ydata, () => {
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
