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
import { getTimeRangeInterval, PZService } from '../../../card-service/service'
import { PeriodStatTypeEnum } from '@ghcloud/cube-protocol'

use([
  CanvasRenderer,
  LineChart,
  GridComponent,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  MarkPointComponent
])

export const PropertyNoticeTimeAnalysis = defineComponent({
  name: 'PropertyNoticeTimeAnalysis',
  setup () {
    let chartInstance = null
    const chartRef = ref<HTMLElement | null>(null)
    const chartData = {
      xAxis: ['00:00', '02:00', '04:00', '06:00', '08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00'],
      series: [5, 3, 2, 1, 8, 12, 15, 10, 12, 18, 20, 15]
    }
    const getData = async (): Promise<void> => {
      const res = await PZService.property.getPropertyPropertyNotificationTimeAnalysis(getTimeRangeInterval(PeriodStatTypeEnum.TODAY), PeriodStatTypeEnum.TODAY)
      if (res.length){
        chartData.xAxis = res.map(item => item.time)
        chartData.series = res.map(item => item.count)
      }
      chartResize()
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
          top: calcFontSize(50),
          bottom: calcFontSize(60)
        },
        dataZoom: [
          {
            type: 'slider',
            show: true,
            xAxisIndex: [0],
            bottom: 10,
            height: calcFontSize(20),
            handleSize: '80%',
            handleStyle: {
              color: '#9a60b4'
            },
            textStyle: {
              color: '#ffffff',
              fontSize: calcFontSize(12)
            },
            start: 66, // 默认从66%开始显示
            end: 100 // 默认显示到100%
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
          name: '通知数量',
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
          name: '通知数量',
          type: 'line',
          smooth: true,
          data: chartData.series,
          markPoint: {
            data: [
              { type: 'max', name: '高峰时段' }
            ],
            label: {
              show: true,
              color: '#ffffff',
              fontSize: calcFontSize(12)
            }
          },
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#9a60b4' },
              { offset: 1, color: '#3b82f6' }
            ])
          },
          lineStyle: {
            width: 3,
            color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
              { offset: 0, color: '#9a60b4' },
              { offset: 1, color: '#3b82f6' }
            ])
          },
          symbolSize: 8,
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(154, 96, 180, 0.5)' },
              { offset: 1, color: 'rgba(59, 130, 246, 0.1)' }
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