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

export const ProcessorStatistics = defineComponent({
  name: 'ProcessorStatistics',
  setup () {
    let chartInstance = null
    const chartRef = ref<HTMLElement | null>(null)

    // 模拟数据 - 不同级别安全事件处理人员统计
    let processorData = [
      { value: 28, name: '一级安全员', level: '一级' },
      { value: 42, name: '二级安全员', level: '二级' },
      { value: 35, name: '三级安全员', level: '三级' },
      { value: 15, name: '四级安全员', level: '四级' }
    ]
    const getData = async (): Promise<void>=>{
      const result = await PZService.parkSafety.getSecurityEventHandlerStatistics()
      processorData = result.map(item=>{
        return {
          name: item.personnelLevel + '级安全员',
          value: item.personnelLevelCount,
          level: item.personnelLevel + '级'
        }
      })
      updateChart()
    }
    const updateChart = (): void => {
      const total = processorData.reduce((sum, item) => sum + item.value, 0)

      const option = {
        tooltip: {
          trigger: 'item',
          formatter: (params): string => {
            const percentage = ((params.value / total) * 100).toFixed(1)
            return `${params.name}<br/>处理人数：${params.value}人<br/>占比：${percentage}%`
          }
        },
        series: [
          {
            type: 'pie',
            radius: ['40%', '70%'],
            center: ['45%', '50%'],
            avoidLabelOverlap: false,
            label: {
              show: true,
              position: 'outside',
              formatter: '{b}\n{c}人',
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
            data: processorData,
            color: ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6']
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
      <SubPanelTemplate title='处理人员统计'>
        <div style={{ marginTop: '30px' }}>
          <div class='card-container-4' ref={chartRef}></div>
        </div>
      </SubPanelTemplate>
    )
  }
})