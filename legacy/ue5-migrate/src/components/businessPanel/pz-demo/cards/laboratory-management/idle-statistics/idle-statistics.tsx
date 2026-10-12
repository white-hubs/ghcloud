import { defineComponent, onMounted, onUnmounted, ref } from 'vue'
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import * as echarts from 'echarts'
import { use } from 'echarts/core'
import { PieChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent
} from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import { calcFontSize } from '@/utils/common'
import { PZService } from '../../../card-service/service'

use([
  CanvasRenderer,
  PieChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent
])

export const IdleStatistics = defineComponent({
  setup () {
    let chartInstance = null
    const chartRef = ref<HTMLElement | null>(null)
    // 请替换为真实数据
    const chartData = [
      { value: 0, name: '空闲' },
      { value: 0, name: '占用' }
    ]

    const initChart = (el: HTMLElement): void => {
      chartInstance = echarts.init(el)
      chartInstance.setOption({
        tooltip: {
          trigger: 'item',
          textStyle: {
            fontSize: calcFontSize(12),
          }
        },
        legend: {
          orient: 'vertical',
          right: 0,
          textStyle: {
            color: '#ffffff',
            fontSize: calcFontSize(12)
          }
        },
        series: [
          {
            name: '实验室状态',
            type: 'pie',
            radius: ['50%', '70%'],
            avoidLabelOverlap: false,
            label: {
              textStyle: {
                color: '#ffffff',
                fontSize: calcFontSize(12)
              }
            },
            emphasis: {
              label: {
                show: true,
                fontSize: calcFontSize(30),
                fontWeight: 'bold'
              }
            },
            labelLine: {
              lineStyle: {
                color: '#ffffff'
              }
            },
            data: chartData,
            itemStyle: {
              color: (params): string => {
                const colorMap = {
                  '空闲': '#52c41a',
                  '占用': '#ff4d4f'
                }
                return colorMap[params.data.name]
              }
            }
          }
        ]
      })
    }

    const chartResize = (): void => {
      chartInstance && chartInstance.dispose()
      setTimeout(() => {
        chartRef.value && initChart(chartRef.value as HTMLElement)
      }, 1000);
    }

    const getData = async (): Promise<void> => {
      const res = await PZService.laboratory.getIdleStatistics()
      // 请替换为真实数据
      chartData[0].value = res.idleCount
      chartData[1].value = res.occupiedCount
      initChart(chartRef.value as HTMLElement)
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