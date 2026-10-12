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
import { PZService } from '../../../card-service/service'

use([
  CanvasRenderer,
  BarChart,
  GridComponent,
  TitleComponent,
  TooltipComponent,
  LegendComponent
])

export const PropertyPaymentCategoryAnalysis = defineComponent({
  name: 'PropertyPaymentCategoryAnalysis',
  setup () {
    let chartInstance = null
    const chartRef = ref<HTMLElement | null>(null)

    // 模拟数据
    const chartData = {
      categories: ['物业费', '水电费', '停车费', '空调费', '维修费', '其他费用'],
      values: []
    }
    const getData = async (): Promise<void> => {
      const res = await PZService.property.getPropertyPaymentAnalysisPaymentCategoryAnalysis()
      if (res.length){
        chartData.categories = res.map(item => item.type)
        chartData.values = res.map(item => item.amount)
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
            return `${params[0].name}<br/>金额: ${formatAmount(params[0].value)}元`
          },
          textStyle: {
            fontSize: calcFontSize(12)
          }
        },
        grid: {
          left: calcFontSize(0),
          right: calcFontSize(20),
          top: calcFontSize(40),
          bottom: calcFontSize(10),
          containLabel: true
        },
        xAxis: {
          type: 'category',
          data: chartData.categories,
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
          name: '金额（元）',
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
            barWidth: calcFontSize(30),
            itemStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: '#188df0' }, // 顶部不透明
                { offset: 1, color: 'rgba(24, 141, 240, 0)' } // 底部完全透明
              ])
            },
            emphasis: {
              itemStyle: {
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                  { offset: 0, color: '#2378f7' },
                  { offset: 1, color: 'rgba(35, 120, 247, 0)' }
                ])
              }
            },
            label: {
              show: true,
              position: 'top',
              color: '#ffffff',
              fontSize: calcFontSize(12),
              // @ts-ignore
              formatter: function (params): string {
                return formatAmount(params.value) + '元'
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
      <SubPanelTemplate title='物业缴费分类分析'>
        <div class='card-container-4' ref={chartRef}></div>
      </SubPanelTemplate>
    )
  }
})