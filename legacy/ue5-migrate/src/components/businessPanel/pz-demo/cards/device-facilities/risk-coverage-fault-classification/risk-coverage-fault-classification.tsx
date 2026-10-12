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

export const RiskCoverageFaultClassification = defineComponent({
  setup () {
    // 图表实例
    let chartInstance = null
    const chartRef = ref(null)
    const colors = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#6B7280']
    // 故障类型数据
    let faultData = [
      { name: '机械故障', value: 38, itemStyle: { color: '#3B82F6' } },
      { name: '电路故障', value: 32, itemStyle: { color: '#10B981' } },
      { name: '控制系统故障', value: 25, itemStyle: { color: '#F59E0B' } },
      { name: '传感器故障', value: 18, itemStyle: { color: '#8B5CF6' } },
      { name: '通信故障', value: 15, itemStyle: { color: '#EC4899' } },
      { name: '其他故障', value: 12, itemStyle: { color: '#6B7280' } }
    ]

    // 计算总故障数
    let totalFaults = ref(0)
    const getData = async (): Promise<void>=>{
      const result = await PZService.device.getDeviceFaultClassification({
        type: '',
        period: ''
      })
      faultData = result.map((item, index)=>{
        return {
          name: item.name,
          value: item.number,
          itemStyle: { color: colors[index] }
        }
      })
      totalFaults.value = faultData.reduce((sum, item) => sum + item.value, 0)
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
            const percentage = ((params.value / totalFaults.value) * 100).toFixed(1)
            return `${params.name}<br/>数量：${params.value}次<br/>占比：${percentage}%`
          }
        },
        series: [
          {
            name: '故障类型',
            type: 'pie',
            radius: ['50%', '70%'],
            center: ['48%', '50%'],
            avoidLabelOverlap: false,
            label: {
              show: true,
              position: 'outside',
              formatter: (params): string => {
                return `${params.name}\n${params.value}次`
              },
              color: '#ffffff',
              fontSize: calcFontSize(12),
              // padding: [8, 4], // 添加内边距
              lineHeight: 20 // 增加行高
            },
            labelLine: {
              show: true,
              length: 15,
              length2: 0,
              maxSurfaceAngle: 80,
              smooth: true // 添加平滑效果
            },
            data: faultData,

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
      <SubPanelTemplate title={`故障类型分布 (总数：${totalFaults.value}次)`}>
        <div class='card-container-2' ref={chartRef}></div>
      </SubPanelTemplate>
    )
  }
})