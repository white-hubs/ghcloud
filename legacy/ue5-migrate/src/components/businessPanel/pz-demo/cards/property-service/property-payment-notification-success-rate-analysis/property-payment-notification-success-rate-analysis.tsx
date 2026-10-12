import { defineComponent, onMounted, onUnmounted, ref } from 'vue'
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import * as echarts from 'echarts'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { PieChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent
} from 'echarts/components'
import { calcFontSize } from '@/utils/common'
import { PZService } from '../../../card-service/service'

use([
  CanvasRenderer,
  PieChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent
])

export const PropertyPaymentNotificationSuccessRateAnalysis = defineComponent({
  name: 'PropertyPaymentNotificationSuccessRateAnalysis',
  setup () {
    let chartInstance = null
    const chartRef = ref<HTMLElement | null>(null)

    // 模拟数据
    const chartData = [
      { value: 92, name: '发送成功' },
      { value: 8, name: '发送失败' }
    ]
    const getData = async (): Promise<void> => {
      const res = await PZService.property.getPropertyPaymentAnalysisPaymentNotificationSuccessRateAnalysis()
      if (res.length){
        chartData.length = 0
        res.forEach(item => {
          chartData.push({
            value: item.count,
            name: item.sendResult
          })
        })
      }
      chartRef.value && initChart(chartRef.value as HTMLElement)
    }

    const initChart = (el: HTMLElement): void => {
      chartInstance = echarts.init(el)
      chartInstance.setOption({
        tooltip: {
          trigger: 'item',
          formatter: '{b}: {c}%',
          textStyle: {
            fontSize: calcFontSize(12)
          }
        },
        legend: {
          orient: 'horizontal',
          bottom: '5%',
          left: 'center',
          itemWidth: calcFontSize(15),
          itemHeight: calcFontSize(10),
          textStyle: {
            color: '#ffffff',
            fontSize: calcFontSize(12)
          }
        },
        series: [
          {
            name: '通知发送状态',
            type: 'pie',
            radius: ['50%', '70%'],
            center: ['50%', '45%'],
            avoidLabelOverlap: false,
            label: {
              show: true,
              position: 'center',
              formatter: function (): string {
                return `{a|通知成功率}\n{b|${chartData[0].value}%}`
              },
              rich: {
                a: {
                  fontSize: calcFontSize(12),
                  color: '#ffffff',
                  lineHeight: calcFontSize(20)
                },
                b: {
                  fontSize: calcFontSize(14),
                  color: '#ffffff',
                  fontWeight: 'bold'
                }
              }
            },
            emphasis: {
              label: {
                show: true,
                fontSize: calcFontSize(14),
                fontWeight: 'bold'
              }
            },
            data: chartData,
            color: [
              '#10b981', // 成功 - 绿色
              '#ef4444' // 失败 - 红色
            ]
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
      <SubPanelTemplate title='物业缴费通知成功率分析'>
        <div class='card-container-4' ref={chartRef}></div>
      </SubPanelTemplate>
    )
  }
})