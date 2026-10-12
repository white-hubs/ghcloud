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

use([
  CanvasRenderer,
  PieChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent
])
// todo: 接口暂时缺少数据
export const SecurityEventAnalysis = defineComponent({
  name: 'SecurityEventAnalysis',
  setup () {
    let chartInstance = null
    const chartRef = ref(null)

    // 模拟数据 - 安全事件处理状态统计
    const statusData = [
      { value: 45, name: '处理中', color: '#3b82f6' },
      { value: 68, name: '已处理', color: '#10b981' },
      { value: 23, name: '已挂起', color: '#f59e0b' }
    ]

    const updateChart = (): void => {
      const total = statusData.reduce((sum, item) => sum + item.value, 0)

      const option = {
        tooltip: {
          trigger: 'item',
          formatter: (params): string => {
            const percentage = ((params.value / total) * 100).toFixed(1)
            return `${params.name}<br/>数量：${params.value}起<br/>占比：${percentage}%`
          }
        },
        series: [
          {
            type: 'pie',
            radius: ['40%', '70%'],
            center: ['40%', '50%'],
            avoidLabelOverlap: false,
            label: {
              show: true,
              position: 'outside',
              formatter: '{b}\n{c}起',
              color: '#ffffff',
              fontSize: calcFontSize(12),
              padding: [8, 4], // 添加内边距
              lineHeight: 20 // 增加行高
            },
            labelLine: {
              show: true,
              length: 15, // 增加第一段线长
              length2: 10, // 增加第二段线长
              smooth: true // 添加平滑效果
            },
            emphasis: {
              label: {
                show: true,
                fontSize: calcFontSize(14),
                fontWeight: 'bold'
              },
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)'
              }
            },
            data: statusData.map(item => ({
              ...item,
              itemStyle: {
                color: item.color
              }
            }))
          }
        ]
      }

      chartInstance?.setOption(option)
    }

    const initChart = (): void => {
      if (chartRef.value) {
        chartInstance = echarts.init(chartRef.value)
        updateChart()
      }
    }

    const handleResize = (): void => {
      chartInstance?.resize()
    }

    onMounted(() => {
      initChart()
      window.addEventListener('resize', handleResize)
    })

    onUnmounted(() => {
      chartInstance?.dispose()
      window.removeEventListener('resize', handleResize)
    })

    return (): JSX.Element => (
      <SubPanelTemplate title='安全事件分析'>
        <div class='card-container-4' ref={chartRef}></div>
      </SubPanelTemplate>
    )
  }
})