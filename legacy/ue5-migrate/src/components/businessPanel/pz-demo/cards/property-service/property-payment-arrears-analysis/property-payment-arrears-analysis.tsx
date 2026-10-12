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

export const PropertyPaymentArrearsAnalysis = defineComponent({
  name: 'PropertyPaymentArrearsAnalysis',
  setup () {
    let chartInstance = null
    const chartRef = ref<HTMLElement | null>(null)

    // 模拟数据
    const chartData = {
      categories: ['物业费', '水电费', '停车费', '空调费', '维修费', '其他费用'],
      series: [
        {
          name: '轻微欠费',
          data: [15000, 12000, 8000, 6000, 5000, 3000],
          color: '#5470c6'
        },
        {
          name: '严重欠费',
          data: [25000, 18000, 16000, 12000, 10000, 8000],
          color: '#fac858' // 红色
        }
      ]
    }
    const getData = async (): Promise<void> => {
      const res = await PZService.property.getPropertyPaymentAnalysisArrearsAnalysis()
      if (res.length){
        chartData.categories = res.map(item => item.type)
        chartData.series[0].data = res.map(item => item.minorArrearsAmount)
        chartData.series[1].data = res.map(item => item.seriousArrearsAmount)
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
            let result = `${params[0].name}<br/>`
            params.forEach(param => {
              result += `${param.seriesName}: ${formatAmount(param.value)}元<br/>`
            })
            const total = params.reduce((sum, param) => sum + param.value, 0)
            result += `总欠费: ${formatAmount(total)}元`
            return result
          },
          textStyle: {
            fontSize: calcFontSize(12)
          }
        },
        legend: {
          data: ['轻微欠费', '严重欠费'],
          right: calcFontSize(10),
          top: calcFontSize(10),
          textStyle: {
            color: '#ffffff',
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
          name: '欠费金额（元）',
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
        series: chartData.series.map(item => ({
          name: item.name,
          type: 'bar',
          stack: '欠费',
          data: item.data,
          itemStyle: {
            color: item.color
          },
          emphasis: {
            itemStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: item.color },
                { offset: 1, color: 'rgba(35, 120, 247, 0)' }
              ])
            }
          },
          label: {
            show: true,
            position: 'inside',
            color: '#ffffff',
            fontSize: calcFontSize(10),
            formatter: function (params): string {
              return formatAmount(params.value)
            }
          }
        }))
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
      <SubPanelTemplate title='物业欠费分析'>
        <div class='card-container-4' ref={chartRef} ></div>
      </SubPanelTemplate>
    )
  }
})