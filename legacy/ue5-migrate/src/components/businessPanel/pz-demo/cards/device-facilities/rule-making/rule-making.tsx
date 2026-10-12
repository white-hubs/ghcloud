import { defineComponent, ref, onMounted } from 'vue'
import * as echarts from 'echarts'
import { use } from 'echarts/core'
import { GraphChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent
} from 'echarts/components'
import { calcFontSize } from '@/utils/common'
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue"
import { PZService } from '../../../card-service/service'

use([
  GraphChart,
  TitleComponent,
  TooltipComponent
])

export const RuleMaking = defineComponent({
  setup () {
    // 图表实例
    let chartInstance = null
    const chartRef = ref(null)
    const colors = ['#EF4444', '#F59E0B', '#F59E0B', '#3B82F6', '3B82F6', '#10B981', '#10B981', '#10B981']
    // 流程图数据
    const flowData = {
      nodes: [
        { name: '设备故障', value: 0, itemStyle: { color: '#EF4444' } },
        { name: '故障检测', value: 1, itemStyle: { color: '#F59E0B' } },
        { name: '故障报警', value: 2, itemStyle: { color: '#F59E0B' } },
        { name: '人工确认', value: 3, itemStyle: { color: '#3B82F6' } },
        { name: '派发工单', value: 4, itemStyle: { color: '#3B82F6' } },
        { name: '维修处理', value: 5, itemStyle: { color: '#10B981' } },
        { name: '验收确认', value: 6, itemStyle: { color: '#10B981' } },
        { name: '处理完成', value: 7, itemStyle: { color: '#10B981' } }
      ],
      links: [
        { source: 0, target: 1 },
        { source: 1, target: 2 },
        { source: 2, target: 3 },
        { source: 3, target: 4 },
        { source: 4, target: 5 },
        { source: 5, target: 6 },
        { source: 6, target: 7 }
      ]
    }
    // 模拟数据
    const getChartData = async (): Promise<void> => {
      const result = await PZService.device.getDeviceRuleSpecification({
        type: '',
        period: ''
      })
      flowData.nodes = result.sort((a, b) => a.sort - b.sort).map((item, index) => {
        return {
          name: item.name,
          value: item.sort,
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
          trigger: 'item'
        },
        series: [
          {
            type: 'graph',
            layout: 'circular',
            symbolSize: 50,
            left: '5%',
            right: '5%',
            roam: false,
            label: {
              show: true,
              color: '#ffffff',
              fontSize: calcFontSize(12)
            },
            edgeSymbol: ['circle', 'arrow'],
            edgeSymbolSize: [3, 8],
            edgeLabel: {
              fontSize: calcFontSize(12)
            },
            data: flowData.nodes,
            links: flowData.links,
            lineStyle: {
              opacity: 0.9,
              width: 2,
              curveness: 0
            }
          }
        ]
      }
      chartInstance.setOption(option)
    }

    onMounted(() => {
      initChart()
      getChartData()
      window.addEventListener('resize', () => {
        chartInstance?.resize()
      })
    })

    return (): JSX.Element => (
      <SubPanelTemplate title="设备故障处理流程">
        <div class='card-container-2' ref={chartRef}></div>
      </SubPanelTemplate>
    )
  }
})