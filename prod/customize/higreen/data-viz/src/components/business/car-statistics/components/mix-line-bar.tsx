
import { defineComponent, onMounted, ref, watch, type PropType } from 'vue'
import * as echarts from 'echarts'
import type { ECBasicOption } from 'echarts/types/dist/shared'
import styles from '../car-statistics.module.less'
import { useUtils } from '@/hook/use-utils'

interface CategoryData {
  color: string;
  name: string;
  value: number[];
}
/** 折线柱状混合图 */
export const MixLineBar = defineComponent({
  props: {
    yData: {
      type: Array as PropType<CategoryData[]>,
      required: true,
      default: () => []
    },
    xData: {
      type: Array as PropType<string[]>,
      required: true,
      default: () => []
    },
  },
  setup (props) {
    const powerFactorRef = ref()
    const utils = useUtils()
    let myChart: echarts.ECharts | null = null
    const initChart = (): void => {
      if (myChart) {
        myChart.dispose()
      }
      myChart = echarts.init(powerFactorRef.value)
      myChart.setOption(getOption())
      window.addEventListener('resize', () => {
        myChart?.resize()
      })
    }
    const getOption = (): ECBasicOption => {
      const series = props.yData.map(item => {
        if (item.name === '总车流') {
          return {
            name: item.name,
            type: 'bar',
            barWidth: utils.calcChartFontSize(5),
            itemStyle: {
              normal: {
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                  offset: 0,
                  color: '#194FA1' // 0% 处的颜色
                }, {
                  offset: 1,
                  color: '#1B6AB9' // 100% 处的颜色
                }], false),
                shadowColor: 'rgba(0,160,221,1)',
              }
            },
            data: item.value
          }
        } else {
          return {
            name: item.name,
            type: 'line',
            color: item.color,
            data: item.value,
            lineStyle: {
              width: 1
            }
          }
        }
      })
      const legendData = [
        {
          textStyle: {
            color: '#D0DEEE',
            fontSize: utils.calcChartFontSize(7)
          },
          left: '30%',
          data: [{
            name: '总车流',
            icon: 'square'
          }
          ],
          itemHeight: 10,
          itemWidth: 10,
        }, {
          textStyle: {
            color: '#D0DEEE',
            fontSize: utils.calcChartFontSize(7)
          },
          left: '43%',
          data: [
            {
              name: '来货车',
              icon: 'rect'
            },
            {
              name: '采购车',
              icon: 'rect'
            },
            {
              name: '其他',
              icon: 'rect'
            },
          ],
          itemHeight: 3,
          itemWidth: 10,
        }
      ]

      const option = {
        tooltip: {
          trigger: 'axis',
          backgroundColor: 'rgba(4,13,32,0.80)',
          borderColor: 'rgba(4,13,32,0.80)',
          textStyle: {
            color: '#ffffff',
            fontSize: utils.calcChartFontSize(9)
          }
        },
        legend: legendData,
        grid: {
          left: '10%',
          right: '10%',
          top: '15%',
          bottom: '10%'
        },
        xAxis: [
          {
            type: 'category',
            data: props.xData,
            axisPointer: {
              type: 'shadow'
            },
            axisLabel: {
              color: '#C2D5EA',
              fontSize: utils.calcChartFontSize(7)
            },
            axisLine: {
              show: true,
              lineStyle: {
                color: '#fff',
                width: 0,
                type: 'solid'
              }
            },
          }
        ],
        yAxis: [
          {
            type: 'value',
            name: '辆',
            nameTextStyle: {
              color: '#C2D5EA',
              fontSize: utils.calcChartFontSize(7),

            },
            splitLine: { // 分割线配置
              show: true,
              lineStyle: {
                type: 'dashed', // 虚线
                color: ['rgba(255,255,255,0.3)'],
                width: 1,
              }
            },
            axisLabel: {
              show: true,
              color: '#ffffff',
              fontSize: utils.calcChartFontSize(9),
              fontWeight: 300,
            },
          }
        ],
        series
      }
      return option
    }

    watch(() => props.yData, () => {
      initChart()
    }, { deep: true })

    onMounted(() => {
      initChart()
    })
    return (): JSX.Element => (
      <div class={styles['line-bar-container']} ref={powerFactorRef} />
    )
  }
})
