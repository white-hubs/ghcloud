import { defineComponent, onMounted, onUnmounted, ref } from 'vue'
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import * as echarts from 'echarts'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { LineChart } from 'echarts/charts'
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
  LineChart,
  GridComponent,
  TitleComponent,
  TooltipComponent,
  LegendComponent
])

export const PropertyPaymentEfficiencyAnalysis = defineComponent({
  name: 'PropertyPaymentEfficiencyAnalysis',
  setup () {
    let chartInstance = null
    const chartRef = ref<HTMLElement | null>(null)

    // 获取当前年份
    const currentYear = new Date().getFullYear()

    // 模拟数据 - 今年各月份的缴费完成比例
    const chartData = {
      months: [],
      values: []
    }
    const getData = async (): Promise<void> => {
      try {
        const res = await PZService.property.getPropertyPaymentAnalysisPaymentEfficiencyAnalysis(getTimeRangeInterval(PeriodStatTypeEnum.THIS_YEAR), PeriodStatTypeEnum.THIS_YEAR)
        if (res.length){
          chartData.months = res.map(item => item.time)
          chartData.values = res.map(item => item.count)
        }
      } catch {

      }
      chartRef.value && initChart(chartRef.value as HTMLElement)
    }

    const initChart = (el: HTMLElement): void => {
      chartInstance = echarts.init(el)
      chartInstance.setOption({
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'line'
          },
          formatter: function (params) {
            return `${currentYear}年${params[0].name}<br/>缴费完成比例: ${params[0].value}%`
          },
          textStyle: {
            fontSize: calcFontSize(12)
          }
        },
        grid: {
          left: calcFontSize(0),
          right: calcFontSize(20),
          top: calcFontSize(40),
          bottom: calcFontSize(0),
          containLabel: true
        },
        xAxis: {
          type: 'category',
          boundaryGap: false,
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
          name: '完成比例（%）',
          min: 0,
          max: 100,
          nameTextStyle: {
            color: '#ffffff',
            fontSize: calcFontSize(12),
            padding: [0, 0, 0, calcFontSize(30)]
          },
          axisLabel: {
            color: '#ffffff',
            fontSize: calcFontSize(12),
            formatter: '{value}%'
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
            name: '缴费完成比例',
            type: 'line',
            data: chartData.values,
            smooth: true,
            symbol: 'circle',
            symbolSize: 8,
            itemStyle: {
              color: '#3b82f6'
            },
            lineStyle: {
              width: 3,
              color: '#3b82f6'
            },
            areaStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: 'rgba(59, 130, 246, 0.5)' },
                { offset: 1, color: 'rgba(59, 130, 246, 0.1)' }
              ])
            },
            markPoint: {
              data: [
                { type: 'max', name: '最大值' }
              ],
              label: {
                color: '#ffffff',
                fontSize: calcFontSize(12),
                formatter: (params): string => {
                  return params.value + '%'
                }
              }
            },
            emphasis: {
              focus: 'series',
              itemStyle: {
                color: '#60a5fa'
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
      <SubPanelTemplate title='物业缴费效率分析'>
        <div class='card-container-4' ref={chartRef} ></div>
      </SubPanelTemplate>
    )
  }
})