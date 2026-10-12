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

export const RiskCoverageDataCollection = defineComponent({
  setup () {
    // 图表实例
    let chartInstance = null
    const chartRef = ref(null)

    // 故障事件数据
    let faultData = [
      { type: '空调设备', count: 45, details: [
        { name: '温控故障', count: 20 },
        { name: '制冷故障', count: 15 },
        { name: '其他故障', count: 10 }
      ] },
      { type: '照明设备', count: 32, details: [
        { name: '灯具损坏', count: 15 },
        { name: '线路故障', count: 12 },
        { name: '其他故障', count: 5 }
      ] },
      { type: '监控设备', count: 28, details: [
        { name: '信号丢失', count: 12 },
        { name: '画面模糊', count: 10 },
        { name: '其他故障', count: 6 }
      ] },
      { type: '电梯设备', count: 25, details: [
        { name: '门控故障', count: 10 },
        { name: '平层故障', count: 8 },
        { name: '其他故障', count: 7 }
      ] },
      { type: '门禁设备', count: 20, details: [
        { name: '读卡故障', count: 8 },
        { name: '开关故障', count: 7 },
        { name: '其他故障', count: 5 }
      ] }
    ]
    const getData = async (): Promise<void>=>{
      const result = await PZService.device.getDeviceFaultDataCollection({
        type: '',
        period: ''
      })
      faultData = result.map(item=>{
        const total = item.types.reduce((prev, cur)=>{
          return prev + cur.number
        }, 0)
        return {
          type: item.name,
          count: total,
          details: item.types.map(type=>{
            return {
              name: type.type,
              count: type.number
            }
          })
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
            const data = faultData[params[0].dataIndex]
            let html = `${data.type}<br/>`
            data.details.forEach(item => {
              html += `${item.name}: ${item.count}次<br/>`
            })
            html += `<br/>总计: ${data.count}次`
            return html
          }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          data: faultData.map(item => item.type),
          axisLabel: {
            color: '#ffffff',
            fontSize: calcFontSize(12),
            interval: 0
          }
        },
        yAxis: {
          type: 'value',
          name: '故障次数',
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
              color: 'rgba(255, 255, 255, 0.1)'
            }
          }
        },
        series: [
          {
            type: 'bar',
            data: faultData.map(item => ({
              value: item.count,
              itemStyle: {
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                  { offset: 1, color: 'rgba(59, 130, 246, 0.3)' },
                  { offset: 0, color: '#3b82f6' },
                ])
              }
            })),
            barWidth: '40%',
            label: {
              show: true,
              position: 'top',
              color: '#ffffff',
              fontSize: calcFontSize(12),
              formatter: '{c}次'
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
      <SubPanelTemplate title="设备故障事件统计">
        <div class='card-container-2' ref={chartRef}></div>
      </SubPanelTemplate>
    )
  }
})