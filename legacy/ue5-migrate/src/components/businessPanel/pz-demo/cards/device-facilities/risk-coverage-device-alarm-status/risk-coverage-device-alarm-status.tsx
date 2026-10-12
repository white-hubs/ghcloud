import { defineComponent, onMounted, ref } from 'vue'
import * as echarts from 'echarts'
import { use } from 'echarts/core'
import { PieChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent
} from 'echarts/components'
import { calcFontSize } from '@/utils/common'
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue"
import DateInlineForm from "@/components/businessPanel/public/dateInlineForm.vue"
import { PZService } from '../../../card-service/service'

use([
  PieChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent
])

export const RiskCoverageDeviceAlarmStatus = defineComponent({
  setup () {
    // 时间范围选择
    const timeRange = ref({
      timeType: 'THIS_WEEK',
      dateRange: []
    })

    // 图表实例
    let chartInstance = null
    const chartRef = ref(null)
    const colors = ['#EF4444', '#F59E0B', '#3B82F6', '#10B981']
    let chartData = [
      { name: '紧急报警', value: 15, itemStyle: { color: '#EF4444' } },
      { name: '重要报警', value: 25, itemStyle: { color: '#F59E0B' } },
      { name: '一般报警', value: 35, itemStyle: { color: '#3B82F6' } },
      { name: '提示信息', value: 45, itemStyle: { color: '#10B981' } }
    ]
    const getData = async (): Promise<void>=>{
      const result = await PZService.device.getDeviceAlarmDeviceAlarmStatus({
        type: timeRange.value.timeType,
        period: timeRange.value.dateRange.join(',')
      })
      chartData = result.map((item, index)=>{
        return {
          name: item.name,
          value: item.number,
          itemStyle: { color: colors[index] }
        }
      })
      initChart()
    }

    // 更新图表
    const updateChart = (): void => {
      if (!chartInstance) return

      const total = chartData.reduce((sum, item) => sum + item.value, 0)

      const option = {
        tooltip: {
          trigger: 'item',
          formatter: (params): string => {
            const percentage = ((params.value / total) * 100).toFixed(1)
            return `${params.name}<br/>数量：${params.value}次<br/>占比：${percentage}%`
          }
        },
        series: [
          {
            type: 'pie',
            radius: '70%',
            center: ['50%', '50%'],
            avoidLabelOverlap: false,
            data: chartData,
            label: {
              show: true,
              position: 'outside',
              formatter: (params): string => {
                return `${params.name}\n${params.value}次`
              },
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
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)'
              }
            }
          }
        ]
      }
      chartInstance.setOption(option)
    }


    // 初始化图表
    const initChart = (): void => {
      if (!chartRef.value) return
      chartInstance = echarts.init(chartRef.value)
      updateChart()
    }

    onMounted(() => {
      initChart()
      window.addEventListener('resize', () => {
        chartInstance?.resize()
      })
    })

    return (): JSX.Element => (
      <SubPanelTemplate
        title="设备报警状态分布"
        v-slots={{
          extra: () => (
            <DateInlineForm
              v-model:modelValue={timeRange.value}
              onSearch={getData}
            />
          )
        }}
      >
        <div class='card-container-3' ref={chartRef}></div>
      </SubPanelTemplate>
    )
  }
})