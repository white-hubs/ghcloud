import { defineComponent, onMounted, shallowRef, watch } from 'vue'
import { createUniqueId } from '@/utils'
import * as echarts from 'echarts'
import type { ECharts } from 'echarts'
import { useUtils } from '@/hook/use-utils'
export const StripBarChart = defineComponent({
  props: {
    id: {
      type: String,
      default: () => createUniqueId()
    },
    dataList: {
      type: Array as () => number[],
      default: () => [80, 5, 5, 5]
    },
    xData: {
      type: Array as () => string[],
      default: () => ['广东', '宁夏', '湖北', '云南']
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
          bottom: '5%',
          left: '0',
          top: '20%',
          right: '0',
          containLabel: true,
          height: '75%'
        },
        yAxis: {
          splitLine: { show: false },
          axisTick: { show: false },
          axisLine: { show: false },
          max: 100,
          axisLabel: { show: false }
        },
        series: [{
          name: '数量',
          type: 'pictorialBar',
          symbol: 'rect',
          itemStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                {
                  offset: 0, color: 'rgba(41,137,255,0.00)'
                },
                {
                  offset: 0.5, color: 'rgba(41,137,255,0.50)'
                },
                {
                  offset: 1, color: '#2989ff'
                }
              ],
              global: false
            },
            shadowBlur: 1.5,
            shadowColor: '#2989ff'
          },
          symbolRepeat: true,
          symbolSize: [5, 1.75],
          symbolPosition: 'start',
          z: -20,
          data: props.dataList.map(e => parseInt(String(e))),
          label: {
            normal: {
              show: true,
              position: 'top',
              distance: 3,
              color: '#d1e2ff',
              formatter: (params: { data: number; }): string => {
                return params.data + '%'
              },
              fontSize: utils.calcChartFontSize(6)
            }
          }
        },
        {
          name: '',
          type: 'bar',
          barWidth: 9,
          showBackground: true,
          itemStyle: {
            color: 'rgba(108,128,151,0.05)',
            opacity: 0.1
          },
          label: {
            show: false,
          },
          data: [1, 1, 1, 1, 1]
        }
        ]
      }
      myChart.value.setOption(option)
    }
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
