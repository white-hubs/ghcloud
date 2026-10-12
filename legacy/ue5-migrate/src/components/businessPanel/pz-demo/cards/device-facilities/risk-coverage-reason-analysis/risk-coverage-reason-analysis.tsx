import { defineComponent, ref, onMounted } from 'vue'
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
import { PZService } from '../../../card-service/service'

use([
  PieChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent
])

export const RiskCoverageReasonAnalysis = defineComponent({
  setup () {
    // 图表实例
    let chartInstance = null
    const chartRef = ref(null)
    const colors = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#6B7280']
    // 故障原因数据
    let reasonData = [
      { name: '设备老化', value: 35, itemStyle: { color: '#3B82F6' } },
      { name: '操作不当', value: 25, itemStyle: { color: '#10B981' } },
      { name: '维护不足', value: 20, itemStyle: { color: '#F59E0B' } },
      { name: '环境因素', value: 12, itemStyle: { color: '#8B5CF6' } },
      { name: '其他原因', value: 8, itemStyle: { color: '#6B7280' } }
    ]

    // 计算总数
    const total = ref(0)
    const getData = async (): Promise<void>=>{
      const result = await PZService.device.getDeviceFaultCauseAnalysis({
        type: '',
        period: ''
      })
      reasonData = result.map((item, index)=>{
        return {
          name: item.name,
          value: item.number,
          itemStyle: { color: colors[index] }
        }
      })
      total.value = reasonData.reduce((sum, item) => sum + item.value, 0)
      initChart()
    }
    // 初始化图表
    const initChart = (): void => {
      if (!chartRef.value) return

      chartInstance = echarts.init(chartRef.value)
      const option = {
        tooltip: {
          trigger: 'item',
          formatter: (params): string => {
            const percentage = ((params.value / total.value) * 100).toFixed(1)
            return `${params.name}<br/>数量：${params.value}次<br/>占比：${percentage}%`
          }
        },
        series: [
          {
            type: 'pie',
            radius: '55%',
            center: ['50%', '50%'],
            avoidLabelOverlap: false,
            data: reasonData,
            label: {
              show: true,
              position: 'outside',
              formatter: (params): string => {
                const percentage = ((params.value / total.value) * 100).toFixed(1)
                return `${params.name}\n${percentage}%`
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

    onMounted(() => {
      initChart()
      getData()
      window.addEventListener('resize', () => {
        chartInstance?.resize()
      })
    })

    return (): JSX.Element => (
      <SubPanelTemplate title={`故障原因分析 (总数：${total}次)`}>
        <div class='card-container-2' ref={chartRef}></div>
      </SubPanelTemplate>
    )
  }
})