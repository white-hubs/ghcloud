
import { defineComponent, onMounted, shallowRef, watch } from 'vue'
import { createUniqueId } from '@/utils'
import * as echarts from 'echarts'
import type { ECharts } from 'echarts'
import { useUtils } from '@/hook/use-utils'
export const TriangleBarChart = defineComponent({
  props: {
    id: {
      type: String,
      default: () => createUniqueId()
    },
    dataList: {
      type: Array as () => number[],
      default: () => [65, 15, 8, 5, 5]
    },
    xData: {
      type: Array as () => string[],
      default: () => ['广东', '湖南', '广西', '江西', '福建']
    }
  },
  setup: (props) => {
    const myChart = shallowRef<ECharts>()
    const utils = useUtils()
    const renderCharts = (): void => {
      if (!myChart.value) return
      const option = {
        xAxis: {
          data: props.xData,
          axisTick: { show: false },
          axisLine: { show: true, lineStyle: { color: 'rgba(255,255,255,0.20)', width: 0.5 } },
          axisLabel: {
            margin: 3,
            textStyle: {
              color: '#c2d5ea',
              fontSize: utils.calcChartFontSize(6)
            }
          }
        },
        grid: {
          bottom: '10%',
          left: '0',
          right: '0',
          containLabel: true,
          height: '80%'
        },
        yAxis: {
          splitLine: { show: false },
          axisTick: { show: false },
          axisLine: { show: false },
          max: 100,
          axisLabel: { show: false }
        },
        series: [{
          name: 'hill',
          type: 'pictorialBar',
          barCategoryGap: 12,
          symbol: 'triangle',
          barWidth: 10,
          label: {
            show: true,
            distance: 3,
            position: 'top',
            color: '#d1e2ff',
            formatter: (params: { data: number; }): string => {
              return params.data + '%'
            },
            fontSize: utils.calcChartFontSize(6)
          },
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
              offset: 0,
              color: '#2ae8bd'
            }, {
              offset: 1,
              color: 'rgba(30,231,231,0.35)'
            }])
          },
          data: props.dataList.map(e => parseInt(String(e))),
          z: 10
        }]
      }
      myChart.value.setOption(option)
    }
    // watch(() => props.value, () => {
    //   renderCharts()
    // })
    onMounted(() => {
      myChart.value = echarts.init(document.getElementById(props.id) as HTMLDivElement)
      window.addEventListener('resize', () => {
        myChart.value?.resize()
      })
      renderCharts()
    })
    watch(() => props.dataList, () => {
      renderCharts()
    })
    return (): JSX.Element => (
      <div id={props.id} style='height: 100%;' />
    )
  }
})
