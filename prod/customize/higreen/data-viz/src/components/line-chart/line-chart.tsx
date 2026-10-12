import { defineComponent, onMounted, shallowRef, watch } from 'vue'
import { createUniqueId } from '@/utils'
import * as echarts from 'echarts'
import type { ECharts } from 'echarts'
import { useUtils } from '@/hook/use-utils'
interface YAxis {
  name: string;
  interval: number | null;
}
interface Series {
  name: string;
  color: string;
  LinearGradientConfig: {
    offsetZeroColor: string;
    offsetOneColor: string;
  };
  data: number[] | string[];
}
export const LineChart = defineComponent({
  props: {
    id: {
      type: String,
      default: () => createUniqueId()
    },
    yAxis: {
      type: Object as () => YAxis,
      default: () => ({ name: '次', interval: 25 })
    },
    xData: {
      type: Array as () => string[],
      default: () => ['7.8', '7.9', '7.10', '7.11', '7.12', '7.13', '7.14']
    },
    legendData: {
      type: Array as () => string[],
      default: () => ['次数']
    },
    seriesData: {
      type: Array as () => Series[],
      default: () => [{
        name: '次数',
        color: '#02EDB2',
        LinearGradientConfig: {
          offsetZeroColor: 'rgba(65,228,187,0.40)',
          offsetOneColor: 'rgba(65,228,187,0.00)'
        },
        data: [75, 25, 35, 44, 90, 40, 50]
      }]
    }
  },
  setup: (props) => {
    const myChart = shallowRef<ECharts>()
    const utils = useUtils()
    const renderCharts = (): void => {
      if (!myChart.value) return
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
        legend: {
          show: true,
          padding: 0,
          top: 1,
          icon: 'roundRect',
          itemHeight: 2,
          itemWidth: 12,
          data: props.legendData,
          textStyle: {
            color: '#d0deee',
            fontSize: utils.calcChartFontSize(7)
          }
        },
        grid: {
          top: '12',
          left: '0%',
          right: '5%',
          bottom: '2%',
          containLabel: true
        },
        xAxis: {
          boundaryGap: false,
          axisTick: {
            show: false,
          },
          axisLabel: {
            color: '#C2D5EA',
            fontSize: utils.calcChartFontSize(7),
            interval: 0,
            showMaxLabel: true
          },
          data: props.xData
        },
        yAxis: {
          ...props.yAxis,
          splitLine: { // 分割线配置
            show: true,
            lineStyle: {
              type: 'dashed', // 虚线
              color: ['rgba(255,255,255,0.3)'],
              width: 1,
            }
          },
          type: 'value',
          axisLabel: { color: '#C2D5EA', fontSize: utils.calcChartFontSize(7) },
          nameTextStyle: { color: '#C2D5EA' }
        },
        series: props.seriesData.map(item => {
          return {
            ...item,
            type: 'line',
            smooth: true,
            showSymbol: false,
            areaStyle: {
              opacity: 1,
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                {
                  offset: 0,
                  color: item.LinearGradientConfig.offsetZeroColor
                },
                {
                  offset: 1,
                  color: item.LinearGradientConfig.offsetOneColor
                }
              ])
            },
            emphasis: {
              focus: 'series'
            },
            data: item.data
          }
        })
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
    watch(() => props.seriesData, () => {
      renderCharts()
    }, {
      deep: true
    })
    return (): JSX.Element => (
      <div id={props.id} style='height: 100%;' />
    )
  }
})
