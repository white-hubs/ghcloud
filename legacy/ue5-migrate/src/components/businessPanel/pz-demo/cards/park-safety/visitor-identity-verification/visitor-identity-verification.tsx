import { defineComponent, onMounted, onUnmounted, ref } from 'vue'
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue"
import * as echarts from 'echarts'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { BarChart } from 'echarts/charts'
import {
  GridComponent,
  TooltipComponent,
  LegendComponent
} from 'echarts/components'
import { calcFontSize } from '@/utils/common'
import { PZService } from '../../../card-service/service'

use([
  CanvasRenderer,
  BarChart,
  GridComponent,
  TooltipComponent,
  LegendComponent
])

export const VisitorIdentityVerification = defineComponent({
  name: 'VisitorIdentityVerification',
  setup () {
    let chartInstance = null
    const chartRef = ref<HTMLElement | null>(null)

    const chartData = {
      categories: ['验证通过', '验证失败', '未验证'],
      values: [156, 23, 65]
    }

    // const total = verificationData.verified + verificationData.failed + verificationData.unverified
    // 计算总数
    const total = ref(0)
    const getData = async (): Promise<void>=>{
      const result = await PZService.parkSafety.getVisitorIdentityVerification()
      const authStatusArr = ['', '验证通过', '验证失败', '未验证']
      chartData.categories = result.map((item)=>authStatusArr[item.authStatus])
      chartData.values = result.map((item)=>item.authStatusCount)
      total.value = chartData.values.reduce((prev, curr) => prev + curr, 0)
      updateChart()
    }
    const updateChart = (): void => {
      const option = {
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          },
          formatter: (params): string => {
            const value = params[0].value
            const percentage = ((value / total.value) * 100).toFixed(1)
            return `${params[0].name}<br/>数量：${value}<br/>占比：${percentage}%`
          }
        },
        grid: {
          left: calcFontSize(0),
          right: calcFontSize(10),
          top: calcFontSize(40),
          bottom: calcFontSize(10),
          containLabel: true
        },
        xAxis: {
          type: 'category',
          data: chartData.categories,
          axisLabel: {
            color: '#ffffff',
            fontSize: calcFontSize(12)
          },
          axisLine: {
            lineStyle: {
              color: '#ffffff'
            }
          }
        },
        yAxis: {
          type: 'value',
          axisLabel: {
            color: '#ffffff',
            fontSize: calcFontSize(12)
          },
          splitLine: {
            lineStyle: {
              color: 'rgba(255, 255, 255, 0.1)',
              type: 'dashed'
            }
          },
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
              fontSize: calcFontSize(12)
            }
          }
        ]
      }

      chartInstance?.setOption(option)
    }

    const initChart = (): void => {
      if (chartRef.value) {
        chartInstance = echarts.init(chartRef.value as HTMLElement)
        updateChart()
      }
    }

    const handleResize = (): void => {
      chartInstance?.resize()
    }

    onMounted(() => {
      initChart()
      getData()
      window.addEventListener('resize', handleResize)
    })

    onUnmounted(() => {
      chartInstance?.dispose()
      window.removeEventListener('resize', handleResize)
    })

    return (): JSX.Element => (
      <SubPanelTemplate title='访客身份验证'>
        <div class='card-container-2' ref={chartRef}></div>
      </SubPanelTemplate>
    )
  }
})