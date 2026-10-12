import { defineComponent, onMounted, onUnmounted, ref } from 'vue'
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import * as echarts from 'echarts'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { LineChart } from 'echarts/charts'
import {
  GridComponent,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  MarkPointComponent
} from 'echarts/components'
import { calcFontSize } from '@/utils/common'
import { PZService } from '../../../card-service/service'
import dayjs from 'dayjs'

use([
  CanvasRenderer,
  LineChart,
  GridComponent,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  MarkPointComponent
])

export const PrecipitationTrendStatistics = defineComponent({
  setup () {
    let chartInstance = null
    const chartRef = ref<HTMLElement | null>(null)
    // 这里需要替换为真实的降水量数据
    const chartData = {
      xAxis: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '24:00'],
      series: [2, 3, 5, 4, 6, 3, 2] // 降水量数据(mm)
    }

    const initChart = (el: HTMLElement): void => {
      chartInstance = echarts.init(el)
      chartInstance.setOption({
        tooltip: {
          trigger: 'axis',
          formatter: (params) => {
            return `${params[0].name}<br/>降水量: ${params[0].value}mm`
          },
          textStyle: {
            fontSize: calcFontSize(12),
          }
        },
        grid: {
          left: calcFontSize(30),
          right: calcFontSize(0),
          top: calcFontSize(40),
          bottom: calcFontSize(20)
        },
        xAxis: {
          type: 'category',
          data: chartData.xAxis,
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
          name: '降水量(mm)',
          nameTextStyle: {
            fontSize: calcFontSize(12),
            padding: [0, 0, 0, calcFontSize(15)]
          },
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
        series: [{
          name: '降水量',
          type: 'line',
          smooth: true,
          data: chartData.series,
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
              { offset: 0, color: '#5470c6' },
              { offset: 1, color: '#91cc75' }
            ])
          },
          markPoint: {
            data: [
              { type: 'max', name: '最高降水量', symbolSize: calcFontSize(30) },
              { type: 'min', name: '最低降水量', symbolSize: calcFontSize(30) }
            ],
            itemStyle: {
              color: '#ee6666'
            },
            label: {
              color: '#ffffff',
              fontSize: calcFontSize(12)
            }
          },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(84, 112, 198, 0.5)' },
              { offset: 1, color: 'rgba(84, 112, 198, 0)' }
            ])
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
      PZService.laboratory.getPrecipitationTrendStatistics().then(res => {
        chartData.xAxis = res.map(item => dayjs(item.recordTime).format('HH:mm'))
        chartData.series = res.map(item => item.precipitation)
        initChart(chartRef.value as HTMLElement)
      })
      window.addEventListener('resize', chartResize)
    })
    onUnmounted(() => {
      chartInstance && chartInstance.dispose()
      window.removeEventListener('resize', chartResize)
    })

    return (): JSX.Element => (
      <SubPanelTemplate>
        <div class='card-container-4' ref={chartRef}></div>
      </SubPanelTemplate>
    )
  }
})