import { defineComponent, watch, ref, onMounted, type PropType } from 'vue'
import * as echarts from 'echarts'
import '../line-chart/chart.less'
// 条形图
export const BarChart = defineComponent({
  props: {
    xAxis: {
      type: Array as PropType<string[]>,
      default: () => []
    },
    series: {
      type: Array,
      default: () =>
        []
    },
  },
  setup: (props, { expose }) => {
    const chart = ref()
    const setOptions = (): void => {
      const option = {
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          top: '5%',
          containLabel: true
        },
        xAxis: {
          type: 'value',
          boundaryGap: [0, 0.01]
        },
        yAxis: {
          type: 'category',
          data: props.xAxis
        },
        series: [
          {
            name: '',
            type: 'bar',
            data: props.series
          }
        ]
      }
      const myChart = echarts.init(chart.value)
      myChart.clear()
      myChart.setOption(option)
      myChart.resize()
    }
    watch(
      () => [...props.xAxis],
      () => {
        setOptions()
      },
      { deep: true }
    )
    onMounted(() => {
      setOptions()
    })

    expose({
      setOptions

    })
    return () => (
      <div class='chart' ref={chart} />
    )
  }
})
