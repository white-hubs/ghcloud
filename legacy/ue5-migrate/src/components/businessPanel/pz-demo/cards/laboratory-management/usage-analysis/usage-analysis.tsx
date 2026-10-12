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
  LegendComponent
} from 'echarts/components'
import { calcFontSize } from '@/utils/common'
import { PZService } from '../../../card-service/service'

use([
  CanvasRenderer,
  LineChart,
  GridComponent,
  TitleComponent,
  TooltipComponent,
  LegendComponent
])

export const UsageAnalysis = defineComponent({
  setup () {
    let chartInstance = null
    const chartRef = ref<HTMLElement | null>(null)
    // 请替换为真实的当月使用率数据
    const chartData = {
      xAxis: ['第1周', '第2周', '第3周', '第4周'],
      series: [60, 65, 70, 75]
    }
    const getData = async (): Promise<void> => {
      const res = await PZService.laboratory.getUsageAnalysis()
      chartData.xAxis = res.map(item=>"第" + item.weekOfMonth + '周')
      chartData.series = res.map(item=>item.usageRate)
      chartRef.value && initChart(chartRef.value as HTMLElement)
    }

    const initChart = (el: HTMLElement): void => {
      chartInstance = echarts.init(el)
      chartInstance.setOption({
        tooltip: {
          trigger: 'axis',
          textStyle: {
            fontSize: calcFontSize(12),
          }
        },
        grid: {
          left: calcFontSize(40),
          right: calcFontSize(0),
          top: calcFontSize(40),
          bottom: calcFontSize(30)
        },
        xAxis: {
          axisLine: {
            lineStyle: {
              color: '#ffffff'
            }
          },
          axisTick: {
            lineStyle: {
              color: '#ffffff'
            }
          },
          axisLabel: {
            interval: 0,
            color: '#ffffff',
            fontSize: calcFontSize(12)
          },
          nameTextStyle: {
            color: '#ffffff',
            fontSize: calcFontSize(12)
          },
          type: 'category',
          data: chartData.xAxis,
        },
        yAxis: {
          type: 'value',
          name: '使用率(%)',
          axisLabel: {
            interval: 0,
            color: '#ffffff',
            fontSize: calcFontSize(12),
            formatter: '{value} %'
          },
          nameTextStyle: {
            color: '#ffffff',
            fontSize: calcFontSize(12)
          },
        },
        series: [{
          name: '使用率',
          type: 'line',
          data: chartData.series,
          itemStyle: {
            color: '#5470c6'
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