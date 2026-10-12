import { defineComponent, watch, ref, onMounted, type PropType } from 'vue'
import * as echarts from 'echarts'
import './chart.less'
// 条形图
export const LineChart = defineComponent({
  props: {
    CategoryData: {
      type: Array as PropType<string[]>,
      default: () => ['10:00', '10:00', '10:00', '10:00', '10:00', '10:00']
    },
    showLegend: {
      type: Boolean,
      default: () => true
    },
    series: {
      type: Array,
      default: () =>
        [0, 20, 30, 30, 28, 12, 38]
    },
    title: {
      type: String,
      default: ''
    },
  },
  setup: (props, { expose }) => {
    const chart = ref()
    const setOptions = (): void => {
      const option = {
        title: {
          subtext: props.title
        },
        xAxis: {
          type: 'category',
          boundaryGap: false,
          axisLabel: {
            color: '#A2A2A7'
          },
          axisLine: {
            show: false
          },
          axisTick: {
            show: false
          },
          data: props.CategoryData
        },
        tooltip: {
          trigger: 'axis',
          formatter: props.title === '' ? '' : `${props.title}: {c0}`
        },
        grid: {
          top: '20%',
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        yAxis: {
          type: 'value',
          axisLabel: {
            color: '#A2A2A7'
          },
        },
        series: [
          {
            data: props.series,
            type: 'line',
            smooth: true,
            showSymbol: false,
            symbol: 'circle',
            symbolSize: 12,
            areaStyle: {
              opacity: 0.8,
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                {
                  offset: 0,
                  color: 'rgba(29,102,255,0.2)'
                },
                {
                  offset: 1,
                  color: 'rgba(29,102,255,0)'
                }
              ])
            },
          }
        ]
      }
      const myChart = echarts.init(chart.value)
      myChart.clear()
      myChart.setOption(option)
      myChart.resize()
    }
    watch(
      () => [...props.CategoryData],
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
