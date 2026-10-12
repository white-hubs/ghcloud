import { defineComponent, onMounted, onUnmounted, ref } from 'vue'
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import * as echarts from 'echarts'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { BarChart } from 'echarts/charts'
import {
  GridComponent,
  TitleComponent,
  TooltipComponent,
  LegendComponent
} from 'echarts/components'
import { calcFontSize } from '@/utils/common'
import { getTimeRangeInterval, PZService } from '../../../card-service/service'
import { PeriodStatTypeEnum } from '@ghcloud/cube-protocol'

use([
  CanvasRenderer,
  BarChart,
  GridComponent,
  TitleComponent,
  TooltipComponent,
  LegendComponent
])

export const PropertyPaymentPaidStatistics = defineComponent({
  name: 'PropertyPaymentPaidStatistics',
  setup () {
    let chartInstance = null
    const chartRef = ref<HTMLElement | null>(null)

    // 获取当前年份
    const currentYear = new Date().getFullYear()

    // 模拟数据 - 今年各月份的缴费金额
    const chartData = {
      months: Array.from({ length: 12 }, (_, i) => `${i + 1}月`),
      values: [
        280000, 320000, 350000, 310000, 380000, 420000,
        450000, 380000, 360000, 400000, 350000, 320000
      ]
    }
    const getData = async (): Promise<void> => {
      try {
        const res = await PZService.property.getPropertyPaymentAnalysisPaidStatistics(getTimeRangeInterval(PeriodStatTypeEnum.THIS_YEAR), PeriodStatTypeEnum.THIS_YEAR)
        if (res.length){
          chartData.months = res.map(item => item.time)
          chartData.values = res.map(item => item.count)
        }
      } catch {

      }
      chartRef.value && initChart(chartRef.value as HTMLElement)
    }
    // 格式化金额显示
    const formatAmount = (amount): string => {
      return amount >= 10000
        ? (amount / 10000).toFixed(2) + '万'
        : amount.toFixed(2)
    }

    const initChart = (el: HTMLElement): void => {
      chartInstance = echarts.init(el)
      chartInstance.setOption({
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          },
          formatter: function (params) {
            return `${currentYear}年${params[0].name}<br/>已缴金额: ${formatAmount(params[0].value)}元`
          },
          textStyle: {
            fontSize: calcFontSize(12)
          }
        },
        grid: {
          left: calcFontSize(0),
          right: calcFontSize(20),
          top: calcFontSize(40),
          bottom: calcFontSize(30),
          containLabel: true
        },
        xAxis: {
          type: 'category',
          data: chartData.months,
          axisLabel: {
            interval: 0,
            color: '#ffffff',
            fontSize: calcFontSize(12)
          },
          axisLine: {
            lineStyle: {
              color: '#ffffff'
            }
          },
          axisTick: {
            alignWithLabel: true,
            lineStyle: {
              color: '#ffffff'
            }
          }
        },
        yAxis: {
          type: 'value',
          name: '已缴金额（元）',
          nameTextStyle: {
            color: '#ffffff',
            fontSize: calcFontSize(12),
            padding: [0, 0, 0, calcFontSize(30)]
          },
          axisLabel: {
            color: '#ffffff',
            fontSize: calcFontSize(12),
            formatter: function (value) {
              return formatAmount(value)
            }
          },
          splitLine: {
            lineStyle: {
              color: 'rgba(255, 255, 255, 0.1)',
              type: 'dashed'
            }
          }
        },
        series: [
          {
            type: 'bar',
            data: chartData.values,
            barWidth: calcFontSize(20),
            itemStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: '#4ade80' }, // 浅绿色
                { offset: 1, color: '#22c55e' } // 深绿色
              ]),
              borderRadius: [calcFontSize(4), calcFontSize(4), 0, 0]
            },
            emphasis: {
              itemStyle: {
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                  { offset: 0, color: '#86efac' },
                  { offset: 1, color: '#4ade80' }
                ])
              }
            }
          }
        ]
      })
    }

    const chartResize = (): void => {
      chartInstance && chartInstance.dispose()
      setTimeout(() => {
        chartRef.value && initChart(chartRef.value as HTMLElement)
      }, 1000);
    }

    onMounted(() => {
      getData()
      window.addEventListener('resize', chartResize)
    })
    onUnmounted(() => {
      chartInstance && chartInstance.dispose()
      window.removeEventListener('resize', chartResize)
    })

    return (): JSX.Element => (
      <SubPanelTemplate title='物业已缴费统计'>
        <div class='card-container-3' ref={chartRef} style="height: 300px;"></div>
      </SubPanelTemplate>
    )
  }
})