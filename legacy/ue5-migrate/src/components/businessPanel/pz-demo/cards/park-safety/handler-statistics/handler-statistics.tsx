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

export const HandlerStatistics = defineComponent({
  name: 'HandlerStatistics',
  setup () {
    let chartInstance = null
    const chartRef = ref<HTMLElement | null>(null)

    // 模拟数据
    const handlerData = [
      { value: 45, name: '安全主管' },
      { value: 65, name: '安全员' },
      { value: 35, name: '保安队长' },
      { value: 55, name: '保安' }
    ]

    const updateChart = () => {
      const total = handlerData.reduce((sum, item) => sum + item.value, 0)

      const option = {
        tooltip: {
          trigger: 'item',
          formatter: (params) => {
            const percentage = ((params.value / total) * 100).toFixed(1)
            return `${params.name}<br/>处理数量：${params.value}<br/>占比：${percentage}%`
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
            data: handlerData,
            color: ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6']
          }
        ]
      }

      chartInstance?.setOption(option)
    }

    const initChart = () => {
      if (chartRef.value) {
        chartInstance = echarts.init(chartRef.value)
        updateChart()
      }
    }

    const handleResize = () => {
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
      <SubPanelTemplate title='处理人员统计'>
        <div class='card-container-3' ref={chartRef} style="height: 300px;"></div>
      </SubPanelTemplate>
    )
  }
})