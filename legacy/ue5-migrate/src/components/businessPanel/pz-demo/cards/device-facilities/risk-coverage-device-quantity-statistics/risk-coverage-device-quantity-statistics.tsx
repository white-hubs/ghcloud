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

export const RiskCoverageDeviceQuantityStatistics = defineComponent({
  setup () {
    // 图表实例
    let chartInstance = null
    const chartRef = ref(null)
    const colors = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899']
    // 设备类型数据
    let deviceData = [
      { name: '空调设备', value: 55, itemStyle: { color: '#3B82F6' } },
      { name: '照明设备', value: 43, itemStyle: { color: '#10B981' } },
      { name: '监控设备', value: 34, itemStyle: { color: '#F59E0B' } },
      { name: '电梯设备', value: 23, itemStyle: { color: '#8B5CF6' } },
      { name: '门禁设备', value: 32, itemStyle: { color: '#EC4899' } }
    ]

    // 计算总数
    const total = ref(0)
    const getData = async (): Promise<void>=>{
      const result = await PZService.device.getDeviceAlarmDeviceCountStatistics({
        type: '',
        period: ''
      })
      deviceData = result.map((item, index)=>{
        return {
          name: item.name,
          value: item.number,
          itemStyle: { color: colors[index] }
        }
      })
      total.value = deviceData.reduce((sum, item) => sum + item.value, 0)
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
            return `${params.name}<br/>数量：${params.value}台<br/>占比：${percentage}%`
          }
        },
        series: [
          {
            type: 'pie',
            radius: ['50%', '70%'],
            center: ['50%', '50%'],
            avoidLabelOverlap: false,
            data: deviceData,
            label: {
              show: true,
              position: 'outside',
              formatter: (params): string => {
                return `${params.name}\n${params.value}台`
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
      <SubPanelTemplate title={`设备类型分布 (总数：${total.value}台)`}>
        <div class='card-container-3' ref={chartRef}></div>
      </SubPanelTemplate>
    )
  }
})