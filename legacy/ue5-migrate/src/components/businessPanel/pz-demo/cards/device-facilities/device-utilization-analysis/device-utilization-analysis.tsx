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

export const DeviceUtilizationAnalysis = defineComponent({
  setup () {
    // 设备利用率数据
    const utilizationData = ref([
      { area: 'A区', rate: 85.5 },
      { area: 'B区', rate: 78.2 },
      { area: 'C区', rate: 92.3 },
      { area: 'D区', rate: 71.8 },
      { area: 'E区', rate: 88.6 }
    ])

    // 图表实例
    let chartInstance = null
    const chartRef = ref(null)
    const getData = async (): Promise<void>=>{
      const result = await PZService.device.getDeviceUtilizationAnalysis({
        type: '',
        period: ''
      })
      utilizationData.value = result.map(item=>{
        return {
          area: item.name,
          rate: item.number
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
          formatter: '{b}<br/>利用率: {c}%'
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          data: utilizationData.value.map(item => item.area),
          axisLine: {
            lineStyle: {
              color: 'rgba(255, 255, 255, 0.3)'
            }
          },
          axisLabel: {
            color: '#ffffff',
            fontSize: calcFontSize(12)
          }
        },
        yAxis: {
          type: 'value',
          name: '利用率(%)',
          nameTextStyle: {
            color: '#ffffff',
            fontSize: calcFontSize(12)
          },
          axisLabel: {
            formatter: '{value}%',
            color: '#ffffff',
            fontSize: calcFontSize(12)
          },
          max: 100,
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
            data: utilizationData.value.map(item => ({
              value: item.rate,
              itemStyle: {
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                  { offset: 0, color: '#3b82f6' },
                  { offset: 1, color: 'rgba(59, 130, 246, 0.3)' }
                ])
              }
            })),
            barWidth: '40%',
            label: {
              show: true,
              position: 'top',
              formatter: '{c}%',
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
      <SubPanelTemplate title="设备利用率分析">
        <div class='card-container-3' ref={chartRef}></div>
      </SubPanelTemplate>
    )
  }
})