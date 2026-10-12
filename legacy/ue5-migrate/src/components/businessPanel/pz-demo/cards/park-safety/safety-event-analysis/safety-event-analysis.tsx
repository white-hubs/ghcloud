import { defineComponent, ref, onMounted, onUnmounted } from 'vue'
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue"
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

export const SafetyEventAnalysis = defineComponent({
  name: 'SafetyEventAnalysis',
  setup () {
    let chartInstance = null
    const chartRef = ref<HTMLElement | null>(null)
    const statusArr = ['已挂起', '处理中', '已处理']
    // 模拟数据
    let statusData = [
      { value: 45, name: '处理中' },
      { value: 65, name: '已处理' },
      { value: 25, name: '已挂起' }
    ]
    const getData = async (): Promise<void>=>{
      const result = await PZService.parkSafety.getSecurityEventAnalysis()
      statusData = result.map(item=>{
        return {
          value: item.processingStatusCount,
          name: statusArr[item.processingStatus]
        }
      })
      updateChart()
    }
    const updateChart = (): void => {
      const total = statusData.reduce((sum, item) => sum + item.value, 0)

      const option = {
        tooltip: {
          trigger: 'item',
          formatter: (params): string => {
            const percentage = ((params.value / total) * 100).toFixed(1)
            return `${params.name}<br/>数量：${params.value}<br/>占比：${percentage}%`
          }
        },
        legend: {
          orient: 'vertical',
          right: '5%',
          top: 'center',
          textStyle: {
            color: '#ffffff',
            fontSize: calcFontSize(12)
          }
        },
        series: [
          {
            type: 'pie',
            radius: ['40%', '70%'],
            center: ['40%', '50%'],
            avoidLabelOverlap: false,
            itemStyle: {
              borderRadius: 4,
              borderColor: '#fff',
              borderWidth: 1
            },
            label: {
              show: true,
              position: 'outside',
              formatter: '{b}: {c}个',
              color: '#ffffff',
              fontSize: calcFontSize(12)
            },
            emphasis: {
              label: {
                show: true,
                fontSize: calcFontSize(14),
                fontWeight: 'bold'
              }
            },
            data: statusData,
            color: ['#3b82f6', '#10b981', '#f59e0b']
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
      <SubPanelTemplate title='安全事件分析'>
        <div class='card-container-3' ref={chartRef} style="height: 300px;"></div>
      </SubPanelTemplate>
    )
  }
})