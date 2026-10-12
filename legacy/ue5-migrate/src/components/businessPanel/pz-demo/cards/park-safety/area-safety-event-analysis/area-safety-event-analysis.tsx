import { defineComponent, ref, onMounted, onUnmounted } from 'vue'
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue"
import * as echarts from 'echarts'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { BarChart } from 'echarts/charts'
import {
  GridComponent,
  TooltipComponent,
  LegendComponent
} from 'echarts/components'
import { calcFontSize } from '@/utils/common'

use([
  CanvasRenderer,
  BarChart,
  GridComponent,
  TooltipComponent,
  LegendComponent
])

export const AreaSafetyEventAnalysis = defineComponent({
  name: 'AreaSafetyEventAnalysis',
  setup () {
    let chartInstance = null
    const chartRef = ref<HTMLElement | null>(null)

    // 模拟数据
    const areaData = {
      areas: ['A区', 'B区', 'C区', 'D区', 'E区'],
      values: [45, 32, 28, 36, 42]
    }

    const initChart = () => {
      if (chartRef.value) {
        chartInstance = echarts.init(chartRef.value)
        
        const option = {
          tooltip: {
            trigger: 'axis',
            axisPointer: {
              type: 'shadow'
            }
          },
          grid: {
            left: calcFontSize(50),
            right: calcFontSize(20),
            top: calcFontSize(40),
            bottom: calcFontSize(30),
            containLabel: true
          },
          xAxis: {
            type: 'category',
            data: areaData.areas,
            axisLabel: {
              color: '#ffffff',
              fontSize: calcFontSize(12)
            },
            axisLine: {
              lineStyle: {
                color: '#ffffff'
              }
            }
          },
          yAxis: {
            type: 'value',
            name: '事件数量',
            nameTextStyle: {
              color: '#ffffff',
              fontSize: calcFontSize(12)
            },
            axisLabel: {
              color: '#ffffff',
              fontSize: calcFontSize(12)
            },
            axisLine: {
              show: true,
              lineStyle: {
                color: '#ffffff'
              }
            },
            splitLine: {
              show: false
            }
          },
          series: [
            {
              type: 'bar',
              data: areaData.values.map(value => ({
                value,
                itemStyle: {
                  color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                    { offset: 0, color: '#60a5fa' },
                    { offset: 1, color: '#3b82f6' }
                  ])
                }
              })),
              barWidth: calcFontSize(30),
              itemStyle: {
                borderRadius: [calcFontSize(4), calcFontSize(4), 0, 0]
              },
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
    }

    const handleResize = () => {
      chartInstance?.resize()
    }

    onMounted(() => {
      initChart()
      window.addEventListener('resize', handleResize)
    })

    onUnmounted(() => {
      chartInstance?.dispose()
      window.removeEventListener('resize', handleResize)
    })

    return (): JSX.Element => (
      <SubPanelTemplate title='区域安全事件分析'>
        <div class='card-container-3' ref={chartRef}></div>
      </SubPanelTemplate>
    )
  }
})