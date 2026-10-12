
import { defineComponent, onMounted, ref, watch, type PropType } from 'vue'
import * as echarts from 'echarts'
import type { ECBasicOption } from 'echarts/types/dist/shared'
import styles from './statistics-card.module.less'
import { useUtils } from '@/hook/use-utils'

interface YData {
  data: number[];
  name?: string;
  color: string[];
}

/** 柱状图 */
export const OverviewChartBar = defineComponent({
  props: {
    yData: {
      type: Array as PropType<YData[]>,
      required: true,
      default: () => []
    },
    xData: {
      type: Array as PropType<string[]>,
      required: true,
      default: () => []
    },
    title: {
      type: String,
      required: false,
      default: () => ''
    },
    gridLeft: {
      type: String,
      required: false,
      default: () => '6%'
    },
    isTransport: {
      type: Boolean,
      required: false,
      default: false
    }
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
      const series = props.yData.map(x => {
        return {
          name: x.name,
          data: x.data,
          type: 'bar',
          barWidth: 12,
          itemStyle: {
            normal: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                offset: 0,
                color: x.color[0] // 0% 处的颜色
              }, {
                offset: 1,
                color: x.color[1] // 100% 处的颜色
              }], false),
              shadowColor: 'rgba(0,160,221,1)',
            }
          },
        }
      })
      const option = {
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
          left: props.gridLeft,
          top: '15%',
          right: '3%',
          bottom: '20%',
        },
        xAxis: {
          type: 'category',
          data: props.xData,
          axisLine: {
            show: true,
            lineStyle: {
              color: '#fff',
              width: 0,
              type: 'solid'
            }
          },
          axisLabel: {
            color: '#C2D5EA',
            fontSize: utils.calcChartFontSize(7)
          },
        },
        yAxis: {
          type: 'value',
          nameTextStyle: {
            color: '#C2D5EA',
            fontSize: utils.calcChartFontSize(7)
          },
          name: props.title,
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
            fontSize: utils.calcChartFontSize(7),
            fontWeight: 300,
          },
        },
        legend: {
          itemHeight: 5,
          itemWidth: 10,
          show: false,
          textStyle: {
            color: '#fff'
          }
        },
        series
      }
      return option
    }
    watch(props.yData, () => {
      initChart()
    })
    onMounted(() => {
      initChart()
    })
    return (): JSX.Element => (
      <div class={`${styles['bar-container']} ${props.isTransport ? styles.h170 : ''}`} ref={powerFactorRef} />
    )
  }
})
