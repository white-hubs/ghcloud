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

export const RiskCoverageTemplate = defineComponent({
  setup () {
    // 图表实例
    let chartInstance = null
    const chartRef = ref(null)
    const colors = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6']
    // 模板类型数据
    let templateData = [
      { name: '标准保险模板', value: 45, itemStyle: { color: '#3B82F6' } },
      { name: '定制保险模板', value: 30, itemStyle: { color: '#10B981' } },
      { name: '标准保养模板', value: 15, itemStyle: { color: '#F59E0B' } },
      { name: '定制保养模板', value: 10, itemStyle: { color: '#8B5CF6' } }
    ]
    const getData = async (): Promise<void>=>{
      const result = await PZService.device.getDeviceInsuranceTemplateSelection({
        type: '',
        period: ''
      })
      templateData = result.map((item, index)=>{
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
          formatter: '{b}<br/>数量: {c}个<br/>占比: {d}%'
        },
        series: [
          {
            name: '模板类型',
            type: 'pie',
            radius: ['50%', '70%'],
            center: ['45%', '50%'],
            avoidLabelOverlap: false,
            label: {
              show: true,
              position: 'outside',
              formatter: '{b}\n{d}%',
              color: '#ffffff',
              fontSize: calcFontSize(12),
              // padding: [8, 4], // 添加内边距
              lineHeight: 15, // 增加行高
              // fontWeight: 'bold'
            },
            labelLine: {
              show: true,
              length: 10, // 增加第一段线长
              length2: 10, // 增加第二段线长
              smooth: true // 添加平滑效果
            },
            data: templateData,
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)'
              },
              label: {
                show: true,
                fontSize: calcFontSize(14),
                fontWeight: 'bold'
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
      <SubPanelTemplate title="保险/保养模板分布">
        <div class='card-container-3' ref={chartRef}></div>
      </SubPanelTemplate>
    )
  }
})