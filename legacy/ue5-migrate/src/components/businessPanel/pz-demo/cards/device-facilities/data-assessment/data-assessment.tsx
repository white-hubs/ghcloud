import { defineComponent, ref, onMounted } from 'vue'
import * as echarts from 'echarts'
import { use } from 'echarts/core'
import { RadarChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent
} from 'echarts/components'
import { calcFontSize } from '@/utils/common'
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue"
import { PZService } from '../../../card-service/service'

use([
  RadarChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent
])

export const DataAssessment = defineComponent({
  setup () {
    // 评估数据
    const assessmentData = ref({
      indicators: [
        { name: '运行效率', max: 100 },
        { name: '维修时间', max: 100 },
        { name: '设备故障率', max: 100 },
        { name: '能耗', max: 100 },
      ],
      data: [85, 25, 65, 30] // 对应每个指标的评估值
    })

    // 图表实例
    let chartInstance = null
    const chartRef = ref(null)
    const getData = async (): Promise<void>=>{
      const result = await PZService.device.getDeviceDataEvaluation({
        type: '',
        period: ''
      })
      const maxCount = Math.max(...Object.values(result))
      assessmentData.value.indicators = assessmentData.value.indicators.map(item=>{
        return {
          name: item.name,
          max: maxCount
        }
      })
      assessmentData.value.data = Object.values(result)
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
        radar: {
          indicator: assessmentData.value.indicators,
          shape: 'circle',
          splitNumber: 5,
          axisName: {
            color: '#ffffff',
            fontSize: calcFontSize(12)
          },
          splitLine: {
            lineStyle: {
              color: 'rgba(255, 255, 255, 0.1)'
            }
          },
          splitArea: {
            show: true,
            areaStyle: {
              color: ['rgba(255, 255, 255, 0.02)', 'rgba(255, 255, 255, 0.05)']
            }
          },
          axisLine: {
            lineStyle: {
              color: 'rgba(255, 255, 255, 0.1)'
            }
          }
        },
        series: [
          {
            type: 'radar',
            data: [
              {
                value: assessmentData.value.data,
                name: '评估结果',
                symbol: 'circle',
                symbolSize: 6,
                lineStyle: {
                  width: 2,
                  color: '#3B82F6'
                },
                areaStyle: {
                  color: {
                    type: 'linear',
                    x: 0,
                    y: 0,
                    x2: 1,
                    y2: 1,
                    colorStops: [{
                      offset: 0,
                      color: 'rgba(59, 130, 246, 0.3)'
                    }, {
                      offset: 1,
                      color: 'rgba(59, 130, 246, 0.1)'
                    }]
                  }
                }
              }
            ]
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
      <SubPanelTemplate title="设备数据评估">
        <div class='card-container-3' ref={chartRef}></div>
      </SubPanelTemplate>
    )
  }
})