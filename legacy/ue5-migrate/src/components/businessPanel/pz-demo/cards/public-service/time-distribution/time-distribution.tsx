import { defineComponent, onMounted, onUnmounted, ref } from 'vue'
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import * as echarts from 'echarts'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { BarChart } from 'echarts/charts'
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
  BarChart,
  GridComponent,
  TitleComponent,
  TooltipComponent,
  LegendComponent
])

export const TimeDistribution = defineComponent({
  name: 'TimeDistribution',
  setup () {
    let chartInstance = null
    const chartRef = ref<HTMLElement | null>(null)
    const chartData = {
      xAxis: ['00-02', '02-04', '04-06', '06-08', '08-10', '10-12', '12-14', '14-16', '16-18', '18-20', '20-22', '22-24'],
      series: [5, 3, 2, 8, 15, 20, 25, 22, 18, 12, 7, 4] // 真实投诉数据
    }
    const getData = async (): Promise<void> => {
      const res = await PZService.public.getPublicComplaintSuggestionComplaintTimeRatio()
      if (res.length){
        chartData.xAxis = res.map(item => item.time)
        chartData.series = res.map(item => item.count)
      }
      chartRef.value && initChart(chartRef.value as HTMLElement)
    }

    const initChart = (el: HTMLElement): void => {
      chartInstance = echarts.init(el)
      chartInstance.setOption({
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
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
        dataZoom: [
          {
            type: 'slider',
            show: true,
            xAxisIndex: [0],
            start: 0,
            end: 33, // 初始显示50%的数据
          }
        ],
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
            fontSize: calcFontSize(12),
            rotate: 30 // 标签旋转30度避免重叠
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
          name: '投诉数量',
          axisLabel: {
            interval: 0,
            color: '#ffffff',
            fontSize: calcFontSize(12)
          },
          nameTextStyle: {
            color: '#ffffff',
            fontSize: calcFontSize(12)
          },
        },
        series: [{
          name: '投诉数量',
          type: 'bar',
          data: chartData.series,
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#2196F3' },
              { offset: 1, color: 'rgba(36, 80, 176, 0)' } // 底部渐变至透明
            ])
          },
          emphasis: {
            itemStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: '#3b82f6' },
                { offset: 1, color: '#93c5fd' }
              ])
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
        <div class='card-container-4' ref={chartRef}></div>
      </SubPanelTemplate>
    )
  }
})