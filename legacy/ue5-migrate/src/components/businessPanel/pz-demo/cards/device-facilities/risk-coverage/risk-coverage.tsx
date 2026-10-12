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

export const RiskCoverage = defineComponent({
  setup () {
    // 图表实例
    let chartInstance = null
    const chartRef = ref(null)
    const colors = ['#EF4444', '#F59E0B', '#3B82F6', '#8B5CF6', '#10B981']

    // 风险类型数据
    let riskData = [
      { name: '设备损坏', value: 45, itemStyle: { color: '#EF4444' } },
      { name: '火灾隐患', value: 25, itemStyle: { color: '#F59E0B' } },
      { name: '盗窃风险', value: 15, itemStyle: { color: '#3B82F6' } },
      { name: '电路故障', value: 10, itemStyle: { color: '#8B5CF6' } },
      { name: '其他风险', value: 5, itemStyle: { color: '#10B981' } }
    ]
    const getData = async (): Promise<void>=>{
      const result = await PZService.device.getDeviceInsuranceRiskCoverage({
        type: '',
        period: ''
      })
      riskData = result.map((item, index)=>{
        return {
          name: item.name,
          value: item.number,
          itemStyle: { color: colors[index] }
        }
      })
      initChart()
    }

    // 初始化图表
    const initChart = (): void => {
      if (!chartRef.value) return

      chartInstance = echarts.init(chartRef.value)
      const option = {
        tooltip: {
          trigger: 'item',
          formatter: '{b}<br/>数量: {c}<br/>占比: {d}%'
        },
        series: [
          {
            name: '风险类型',
            type: 'pie',
            radius: ['40%', '70%'],
            center: ['50%', '50%'],
            avoidLabelOverlap: false,
            label: {
              show: true,
              position: 'outside',
              formatter: '{b}\n{d}%',
              color: '#ffffff',
              fontSize: calcFontSize(12),
              padding: [8, 4], // 添加内边距
              lineHeight: 20 // 增加行高
            },
            labelLine: {
              show: true,
              length: 10,
              length2: 10, // 增加第二段线长
              smooth: true, // 添加平滑效果
            },
            data: riskData,
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
      <SubPanelTemplate title="设备风险类型分布">
        <div class='card-container-3' ref={chartRef}></div>
      </SubPanelTemplate>
    )
  }
})