import { defineComponent, ref, onMounted } from 'vue'
import * as echarts from 'echarts'
import { use } from 'echarts/core'
import { BarChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent
} from 'echarts/components'
import { calcFontSize } from '@/utils/common'
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue"
import { PZService } from '../../../card-service/service'

use([
  BarChart,
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent
])
// todo: 接口暂时少字段无法处理
export const RiskCoverageCycle = defineComponent({
  setup () {
    // 图表实例
    let chartInstance = null
    const chartRef = ref(null)

    // 保养周期数据
    let maintenanceData = [
      { cycle: '按月保养', count: 45, details: [
        { type: '空调设备', count: 20 },
        { type: '照明设备', count: 15 },
        { type: '其他设备', count: 10 }
      ] },
      { cycle: '按季度保养', count: 35, details: [
        { type: '空调设备', count: 15 },
        { type: '照明设备', count: 12 },
        { type: '其他设备', count: 8 }
      ] },
      { cycle: '按年保养', count: 20, details: [
        { type: '空调设备', count: 8 },
        { type: '照明设备', count: 7 },
        { type: '其他设备', count: 5 }
      ] }
    ]
    const getData = async (): Promise<void> => {
      const result = await PZService.device.getDeviceMaintenanceCycle({
        type: '',
        period: ''
      })
      if (!result) return
      maintenanceData = result.map(item=>{
        const total = item.details.reduce((acc, cur) => acc + cur.number, 0)
        return {
          cycle: item.type,
          count: total,
          details: item.details.map(detail => ({
            type: detail.name,
            count: detail.number
          }))
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
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          },
          formatter: (params): string => {
            const data = maintenanceData[params[0].dataIndex]
            let html = `${data.cycle}<br/>`
            data.details.forEach(item => {
              html += `${item.type}: ${item.count}台<br/>`
            })
            html += `总计: ${data.count}台`
            return html
          }
        },
        grid: {
          top: calcFontSize(50),
          left: calcFontSize(10),
          right: calcFontSize(10),
          bottom: calcFontSize(10), // 增加底部空间，为滚动条和标签留出更多空间
          containLabel: true
        },
        xAxis: {
          type: 'category',
          data: maintenanceData.map(item => item.cycle),
          axisLabel: {
            color: '#ffffff',
            fontSize: calcFontSize(12)
          },
          nameTextStyle: {
            color: '#ffffff',
            fontSize: calcFontSize(12),
            align: 'right'
          },
          axisLine: {
            lineStyle: {
              color: 'rgba(255, 255, 255, 0.3)'
            }
          },
        },
        yAxis: {
          type: 'value',
          name: '设备数量(台)',
          nameTextStyle: {
            color: '#ffffff',
            fontSize: calcFontSize(12)
          },
          axisLabel: {
            color: '#ffffff',
            fontSize: calcFontSize(12)
          },
          splitLine: {
            lineStyle: {
              color: 'rgba(255, 255, 255, 0.1)',
              type: 'dashed'
            }
          },
          axisLine: {
            lineStyle: {
              color: 'rgba(255, 255, 255, 0.3)'
            }
          }
        },
        series: [
          {
            type: 'bar',
            data: maintenanceData.map(item => ({
              value: item.count,
              itemStyle: {
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                  { offset: 0, color: '#3b82f6' },
                  { offset: 1, color: 'rgba(59, 130, 246, 0.3)' }
                ])
              }
            })),
            barWidth: calcFontSize(30), // 固定柱子宽度
            label: {
              show: true,
              position: 'top',
              color: '#ffffff',
              fontSize: calcFontSize(12)
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
      <SubPanelTemplate title="设备保养周期分布">
        <div class='card-container-3' ref={chartRef}></div>
      </SubPanelTemplate>
    )
  }
})