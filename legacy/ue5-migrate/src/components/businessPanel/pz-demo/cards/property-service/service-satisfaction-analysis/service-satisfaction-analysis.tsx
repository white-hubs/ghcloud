import { defineComponent, onMounted, onUnmounted, ref } from 'vue'
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import * as echarts from 'echarts'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { RadarChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  RadarComponent
} from 'echarts/components'
import { calcFontSize } from '@/utils/common'
import { PZService } from '../../../card-service/service'

use([
  CanvasRenderer,
  RadarChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  RadarComponent
])

export const ServiceSatisfactionAnalysis = defineComponent({
  name: 'ServiceSatisfactionAnalysis',
  setup () {
    let chartInstance = null
    const chartRef = ref<HTMLElement | null>(null)
    const indicator = [
      { name: '卫生', max: 100 },
      { name: '设备维修', max: 100 },
      { name: '服务态度', max: 100 },
      { name: '响应速度', max: 100 }
    ]
    const seriesData = [
      {
        value: [],
        name: '满意度评分'
      }
    ]

    const getData = async (): Promise<void> => {
      try {
        const res = await PZService.property.getPropertyServiceSatisfactionStatistics()
        if (res.length){
          indicator.length = 0
          seriesData.length = 0
          res.forEach(item => {
            indicator.push({
              name: item.type,
              max: 100
            })
          })
          seriesData.push({
            value: res.map(item=>item.score),
            name: '满意度评分'
          })
        }
      } catch {
      }
      chartRef.value && initChart(chartRef.value as HTMLElement)
    }

    const initChart = (el: HTMLElement): void => {
      chartInstance = echarts.init(el)
      chartInstance.setOption({
        tooltip: {
          trigger: 'item',
          textStyle: {
            fontSize: calcFontSize(12),
          }
        },
        radar: {
          indicator: indicator,
          axisName: {
            color: '#ffffff'
          },
          splitArea: {
            areaStyle: {
              color: ['rgba(255, 255, 255, 0.1)']
            }
          },
          axisLine: {
            lineStyle: {
              color: 'rgba(255, 255, 255, 0.5)'
            }
          },
          splitLine: {
            lineStyle: {
              color: 'rgba(255, 255, 255, 0.5)'
            }
          }
        },
        series: [{
          name: '满意度',
          type: 'radar',
          data: seriesData,
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(154, 96, 180, 0.8)' },
              { offset: 1, color: 'rgba(59, 130, 246, 0.2)' }
            ])
          },
          lineStyle: {
            width: 2,
            color: '#9a60b4'
          },
          symbolSize: 6,
          itemStyle: {
            color: '#9a60b4',
            textStyle: {
              color: '#ffffff',
              fontSize: calcFontSize(12)
            }
          }
        }]
      })
    }

    const chartResize = (): void => {
      chartInstance && chartInstance.dispose()
      setTimeout(() => {
        chartRef.value && initChart(chartRef.value as HTMLElement)
      }, 1000);
    }

    onMounted(() => {
      getData()
      window.addEventListener('resize', chartResize)
    })
    onUnmounted(() => {
      chartInstance && chartInstance.dispose()
      window.removeEventListener('resize', chartResize)
    })

    return (): JSX.Element => (
      <SubPanelTemplate>
        <div class='card-container-3' ref={chartRef}></div>
      </SubPanelTemplate>
    )
  }
})