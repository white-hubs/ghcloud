import { defineComponent, ref, onMounted, onUnmounted } from 'vue'
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue"
import DateInlineForm from "@/components/businessPanel/public/dateInlineForm.vue"
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

export const AlarmLevelStatistics = defineComponent({
  name: 'AlarmLevelStatistics',
  setup () {
    let chartInstance = null
    const chartRef = ref(null)
    const timeRange = ref({
      timeType: 'TODAY',
      dateRange: []
    })

    const getData = async (): Promise<void>=>{
      const result = await PZService.parkSafety.getSecurityEventAlarmLevelStatistics({
        periodType: timeRange.value.timeType,
        period: timeRange.value.dateRange.join(',')
      })
      const data = result.map(item=>{
        return {
          name: item.alarmLevel + '级报警',
          value: item.levelCount
        }
      })
      updateChart(data)
    }

    const updateChart = (currentData: {
      name: string;
      value: number;
    }[]): void => {
      // const currentData = levelData[timeRange.value.timeType]
      const total = currentData.reduce((sum, item) => sum + item.value, 0)

      const option = {
        tooltip: {
          trigger: 'item',
          formatter: (params): string => {
            const percentage = ((params.value / total) * 100).toFixed(1)
            return `${params.name}<br/>数量：${params.value}<br/>占比：${percentage}%`
          }
        },
        series: [
          {
            type: 'pie',
            radius: '65%',
            center: ['45%', '50%'],
            data: currentData,
            avoidLabelOverlap: false,
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)'
              }
            },
            label: {
              show: true,
              formatter: '{b}: {c}个\n{d}%',
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
            color: ['#ef4444', '#f59e0b', '#3b82f6', '#10b981']
          }
        ]
      }

      chartInstance?.setOption(option)
    }

    const initChart = (): void => {
      if (chartRef.value) {
        chartInstance = echarts.init(chartRef.value)
        // updateChart()
        getData()
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

    // watch(() => timeRange.value.timeType, updateChart)

    return (): JSX.Element => (
      <SubPanelTemplate title='报警级别统计' v-slots={{
        extra: () => (
          <DateInlineForm v-model:modelValue={timeRange.value} onSearch={getData} ></DateInlineForm>
        )
      }}>
        <div class='card-container-4' ref={chartRef} ></div>
      </SubPanelTemplate>
    )
  }
})