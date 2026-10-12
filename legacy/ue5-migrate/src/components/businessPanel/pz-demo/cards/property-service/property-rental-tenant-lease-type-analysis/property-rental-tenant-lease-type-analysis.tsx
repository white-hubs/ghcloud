import { defineComponent, onMounted, onUnmounted, ref } from 'vue'
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue"
import * as echarts from 'echarts'
import { use } from 'echarts/core'
import { LineChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent
} from 'echarts/components'
import { calcFontSize } from '@/utils/common'
import { PZService } from '../../../card-service/service'

use([
  LineChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent
])

export const PropertyRentalTenantLeaseTypeAnalysis = defineComponent({
  name: 'PropertyRentalTenantLeaseTypeAnalysis',
  setup () {
    let chartInstance = null
    const chartRef = ref<HTMLElement | null>(null)

    // 模拟数据
    let months = Array.from({ length: 12 }, (_, i) => `${i + 1}月`)
    const chartData = {
      longTerm: Array.from({ length: 12 }, () => Math.floor(Math.random() * 30 + 50)),
      shortTerm: Array.from({ length: 12 }, () => Math.floor(Math.random() * 20 + 30)),
      temporary: Array.from({ length: 12 }, () => Math.floor(Math.random() * 10 + 10))
    }
    const getData = async (): Promise<void>=> {
      try {
        const res = await PZService.property.getPropertyRentAnalysisLeaseTypeAnalysis()
        months = res.map(item => item.time)
        chartData.longTerm = res.map(item => item.count)
        chartData.shortTerm = res.map(item => item.count2)
        chartData.temporary = res.map(item => item.count3)
      } finally {
        chartRef.value && initChart(chartRef.value as HTMLElement)
      }
    }

    const initChart = (el: HTMLElement): void => {
      chartInstance = echarts.init(el)
      chartInstance.setOption({
        backgroundColor: 'transparent',
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'line',
            lineStyle: {
              color: 'rgba(255, 255, 255, 0.2)',
              width: 1,
              type: 'solid'
            }
          },
          formatter: (params) => {
            let result = `${params[0].axisValue}<br/>`
            params.forEach(item => {
              result += `${item.marker} ${item.seriesName}：${item.value}家<br/>`
            })
            return result
          }
        },
        legend: {
          data: ['长租', '短租', '临时租赁'],
          right: calcFontSize(10),
          top: calcFontSize(10),
          textStyle: {
            color: '#ffffff',
            fontSize: calcFontSize(12)
          }
        },
        grid: {
          top: calcFontSize(50),
          left: calcFontSize(5),
          right: calcFontSize(5),
          bottom: calcFontSize(10),
          containLabel: true
        },
        xAxis: {
          type: 'category',
          boundaryGap: false,
          data: months,
          axisLine: {
            lineStyle: {
              color: 'rgba(255, 255, 255, 0.3)'
            }
          },
          axisLabel: {
            color: '#ffffff',
            fontSize: calcFontSize(12),
            margin: calcFontSize(12),
            // interval: 'auto' // 自动计算间隔，避免标签重叠
          },
          axisTick: {
            show: false
          }
        },
        yAxis: {
          type: 'value',
          name: '租赁数量（家）',
          nameTextStyle: {
            color: '#ffffff',
            fontSize: calcFontSize(12),
            padding: [0, 30, 0, 0]
          },
          axisLine: {
            show: true,
            lineStyle: {
              color: 'rgba(255, 255, 255, 0.3)'
            }
          },
          axisLabel: {
            color: '#ffffff',
            fontSize: calcFontSize(12),
            margin: calcFontSize(12)
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
            name: '长租',
            type: 'line',
            data: chartData.longTerm,
            smooth: true,
            symbol: 'circle',
            symbolSize: 8,
            itemStyle: {
              color: '#3b82f6'
            },
            lineStyle: {
              width: 2
            },
            areaStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: 'rgba(59, 130, 246, 0.3)' },
                { offset: 1, color: 'rgba(59, 130, 246, 0)' }
              ])
            },
          },
          {
            name: '短租',
            type: 'line',
            data: chartData.shortTerm,
            smooth: true,
            symbol: 'circle',
            symbolSize: 8,
            itemStyle: {
              color: '#10b981'
            },
            lineStyle: {
              width: 2
            },
            areaStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: 'rgba(16, 185, 129, 0.3)' },
                { offset: 1, color: 'rgba(16, 185, 129, 0)' }
              ])
            }
          },
          {
            name: '临时租赁',
            type: 'line',
            data: chartData.temporary,
            smooth: true,
            symbol: 'circle',
            symbolSize: 8,
            itemStyle: {
              color: '#f59e0b'
            },
            lineStyle: {
              width: 2
            },
            areaStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: 'rgba(245, 158, 11, 0.3)' },
                { offset: 1, color: 'rgba(245, 158, 11, 0)' }
              ])
            }
          }
        ]
      })
    }

    const handleResize = (): void => {
      chartInstance?.resize()
    }

    onMounted(() => {
      getData()
      window.addEventListener('resize', handleResize)
    })

    onUnmounted(() => {
      chartInstance?.dispose()
      window.removeEventListener('resize', handleResize)
    })

    return (): JSX.Element => (
      <SubPanelTemplate title='租赁类型趋势分析'>
        <div class='card-container-3' ref={chartRef}></div>
      </SubPanelTemplate>
    )
  }
})