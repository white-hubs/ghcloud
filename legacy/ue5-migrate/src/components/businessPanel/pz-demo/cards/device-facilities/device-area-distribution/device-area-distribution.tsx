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

export const DeviceAreaDistribution = defineComponent({
  setup () {
    // 区域分布数据
    const distributionData = ref({
      total: 120,
      areas: [
        { name: 'A区', value: 35, ratio: 29.2 },
        { name: 'B区', value: 28, ratio: 23.3 },
        { name: 'C区', value: 25, ratio: 20.8 },
        { name: 'D区', value: 20, ratio: 16.7 },
        { name: 'E区', value: 12, ratio: 10.0 }
      ]
    })

    // 图表实例
    let chartInstance = null
    const chartRef = ref(null)
    const getData = async (): Promise<void>=>{
      const result = await PZService.device.getDeviceUtilizationAnalysis({
        type: '',
        period: ''
      })
      distributionData.value.total = result.reduce((total, item) => total + item.number, 0)
      distributionData.value.areas = result.map(item=>{
        return {
          name: item.name,
          value: item.number,
          ratio: (item.number / distributionData.value.total) * 100
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
          formatter: (params): string => {
            return `${params.name}<br/>
                    设备数量：${params.value}台<br/>
                    占比：${params.percent}%`
          }
        },
        series: [
          {
            name: '设备分布',
            type: 'pie',
            radius: ['40%', '70%'],
            center: ['50%', '50%'],
            avoidLabelOverlap: false,
            label: {
              show: true,
              position: 'outside',
              formatter: '{b}\n{c}台',
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
            data: distributionData.value.areas.map(item => ({
              name: item.name,
              value: item.value,
              itemStyle: {
                color: item.name === 'A区' ? '#3B82F6' :
                  item.name === 'B区' ? '#10B981' :
                    item.name === 'C区' ? '#F59E0B' :
                      item.name === 'D区' ? '#8B5CF6' :
                        '#EC4899'
              }
            }))
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
      <SubPanelTemplate title={`设备区域分布 (总数：${distributionData.value.total}台)`}>
        <div class='card-container-3' ref={chartRef}></div>
      </SubPanelTemplate>
    )
  }
})