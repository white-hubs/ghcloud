
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
/** 堆叠柱状图 */
export const StackBar = defineComponent({
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
      const option = {
        legend: {
          itemHeight: 5,
          itemWidth: 10,
          x: 'center',
          y: 'top',
          padding: [0, 0, 0, 0],
          textStyle: {
            color: '#fff',
            fontSize: utils.calcChartFontSize(7)
          }
        },
        tooltip: {
          trigger: 'axis',
          backgroundColor: 'rgba(4,13,32,0.80)',
          borderColor: 'rgba(4,13,32,0.80)',
          axisPointer: {
            type: 'shadow'
          },
          textStyle: {
            color: '#ffffff',
            fontSize: utils.calcChartFontSize(9)
          }
        },
        grid: {
          left: '10%',
          right: '3%',
          top: '15%',
          bottom: '12%'
        },
        yAxis: {
          type: 'value',
          axisLabel: {
            show: true,
            color: '#ffffff',
            fontSize: utils.calcChartFontSize(9),
            fontWeight: 300,
          },
          splitLine: { // 分割线配置
            show: true,
            lineStyle: {
              type: 'dashed', // 虚线
              color: ['rgba(255,255,255,0.3)'],
              width: 1,
            }
          },
        },
        xAxis: {
          type: 'category',
          data: props.xData,
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
        },
        series: props.yData.map((item) => {
          return {
            name: item.name,
            type: 'bar',
            stack: 'total',
            barWidth: '10%',
            itemStyle: {
              color: item.color
            },
            data: item.value
          }
        })
      }
      return option
    }

    watch(() => props.yData, () => {
      initChart()
    }, { deep: true })

    onMounted(() => {
      initChart()
    })
    return (): JSX.Element=> (
      <div class={styles['chart-container']} ref={powerFactorRef} />
    )
  }
})
