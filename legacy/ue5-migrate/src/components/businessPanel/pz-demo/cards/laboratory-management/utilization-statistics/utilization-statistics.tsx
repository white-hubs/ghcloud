import { defineComponent, onMounted, onUnmounted, ref, watch } from 'vue'
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import * as echarts from 'echarts'
import { use } from 'echarts/core'
import { LineChart } from 'echarts/charts'
import {
  GridComponent,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  ToolboxComponent
} from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import { calcFontSize } from '@/utils/common'
import { DatePicker } from 'ant-design-vue';
const { RangePicker } = DatePicker;
import styles from './utilization-statistics.module.less'
import { PZService } from '../../../card-service/service'
import dayjs from 'dayjs'

use([
  CanvasRenderer,
  LineChart,
  GridComponent,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  ToolboxComponent
])

export const UtilizationStatistics = defineComponent({
  setup () {
    const dateRange = ref([dayjs('2025-01-01'), dayjs().endOf('day')])
    let chartInstance = null
    const chartRef = ref<HTMLElement | null>(null)

    const chartData = {
      xAxis: [],
      // 请替换为真实的利用率数据
      series: []
    }

    const getData = async (): Promise<void> => {
      let period = dayjs(dateRange.value[0]).startOf('day').format('YYYY-MM-DD HH:mm:ss') + ',' + dayjs(dateRange.value[1]).endOf('day').format('YYYY-MM-DD HH:mm:ss')
      if (dateRange.value.length === 0) {
        period = dayjs().startOf('day').format('YYYY-MM-DD HH:mm:ss') + ',' + dayjs().endOf('day').format('YYYY-MM-DD HH:mm:ss')
      }
      const res = await PZService.laboratory.getUtilizationStatistics(period)
      chartData.xAxis = res.map(item => {
        return dayjs(item.recordDate).format('MM月')
      })
      chartData.series = res.map(item => {
        return item.utilizationRate
      })
      initChart(chartRef.value as HTMLElement)
    }

    const initChart = (el: HTMLElement): void => {
      chartInstance = echarts.init(el)
      chartInstance.setOption({
        tooltip: {
          trigger: 'axis',
          textStyle: {
            fontSize: calcFontSize(12),
          }
        },
        grid: {
          top: calcFontSize(40),
          left: calcFontSize(40),
          right: calcFontSize(0),
          bottom: calcFontSize(30),
        },
        xAxis: {
          type: 'category',
          data: chartData.xAxis,
          axisLabel: {
            fontSize: calcFontSize(12),
            color: '#ffffff' // 设置 x 轴刻度文字颜色为白色
          },
          axisLine: {
            lineStyle: {
              color: '#ffffff' // 设置 x 轴轴线颜色为白色
            }
          },
          axisTick: {
            lineStyle: {
              color: '#ffffff' // 设置 x 轴刻度线颜色为白色
            }
          }
        },
        yAxis: {
          type: 'value',
          name: '利用率(%)',
          axisLabel: {
            fontSize: calcFontSize(12),
            formatter: '{value} %',
            color: '#ffffff' // 设置 y 轴刻度文字颜色为白色
          },
          nameTextStyle: {
            fontSize: calcFontSize(12),
            color: '#ffffff' // 设置 y 轴名称文字颜色为白色
          },
          axisLine: {
            lineStyle: {
              color: '#ffffff' // 设置 y 轴轴线颜色为白色
            }
          },
          axisTick: {
            lineStyle: {
              color: '#ffffff' // 设置 y 轴刻度线颜色为白色
            }
          }
        },
        legend: {
          textStyle: {
            fontSize: calcFontSize(12),
            color: '#ffffff' // 设置图例文字颜色为白色
          },
          right: '10%'
        },
        series: [{
          name: '利用率',
          type: 'line',
          data: chartData.series,
          itemStyle: {
            color: '#5470c6'
          },
          // 添加 areaStyle 属性实现渐变效果
          areaStyle: {
            color: new echarts.graphic.LinearGradient(
              0, 0, 0, 1,
              [
                { offset: 0, color: 'rgba(84, 112, 198, 0.5)' }, // 曲线附近颜色
                { offset: 1, color: 'rgba(84, 112, 198, 0)' } // x 轴附近颜色
              ]
            )
          }
        }]
      })
    }

    const chartResize = (): void => {
      chartInstance && chartInstance.dispose()
      setTimeout(() => {
        chartRef.value && initChart(chartRef.value as HTMLElement)
      }, 1000);
    }

    watch(() => dateRange.value, getData)

    onMounted(() => {
      getData()
      window.addEventListener('resize', chartResize)
    })

    onUnmounted(() => {
      chartInstance && chartInstance.dispose()
      window.removeEventListener('resize', chartResize)
    })

    return (): JSX.Element => (
      <SubPanelTemplate v-slots={{
        extra: <RangePicker
          v-model:value={dateRange.value}
          class={styles.datePicker}
          style={{ marginLeft: '0.15rem' }}
          disabledDate={(current) => {
            return current.isBefore(dayjs('2025-01-01'))
          }}
        />
      }}>
        <div class='card-container-3' ref={chartRef}></div>
      </SubPanelTemplate>
    )
  }
})