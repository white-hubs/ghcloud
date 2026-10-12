import { defineComponent, ref, onMounted, onUnmounted } from 'vue'
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue"
import * as echarts from 'echarts'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import 'echarts-liquidfill'
import { calcFontSize } from '@/utils/common'

use([CanvasRenderer])

export const AlarmProcessingDuration = defineComponent({
  name: 'AlarmProcessingDuration',
  setup () {
    let chartInstance = null
    const chartRef = ref<HTMLElement | null>(null)

    // 模拟数据 - 平均处理时长（分钟）
    const avgProcessingTime = 45
    const maxProcessingTime = 120

    const updateChart = () => {
      const percentage = avgProcessingTime / maxProcessingTime

      const option = {
        series: [{
          type: 'liquidFill',
          data: [percentage, percentage - 0.1, percentage - 0.2],
          radius: '80%',
          color: ['rgba(59, 130, 246, 0.8)', 'rgba(59, 130, 246, 0.5)', 'rgba(59, 130, 246, 0.3)'],
          backgroundStyle: {
            color: 'rgba(255, 255, 255, 0.1)'
          },
          label: {
            normal: {
              formatter: () => {
                return `${avgProcessingTime}分钟\n平均处理时长`
              },
              textStyle: {
                fontSize: calcFontSize(16),
                color: '#ffffff'
              }
            }
          },
          outline: {
            show: false
          }
        }]
      }

      chartInstance?.setOption(option)
    }

    // ... 初始化和清理代码 ...

    return (): JSX.Element => (
      <SubPanelTemplate title='报警处理时长统计'>
        <div class='card-container-3' ref={chartRef}></div>
      </SubPanelTemplate>
    )
  }
})