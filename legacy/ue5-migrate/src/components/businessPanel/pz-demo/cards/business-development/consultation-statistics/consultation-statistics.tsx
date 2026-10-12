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

export const ConsultationStatistics = defineComponent({
  name: 'ConsultationStatistics',
  setup () {
    let chartInstance = null
    const chartRef = ref<HTMLElement | null>(null)
    const chartData = {
      xAxis: ['咨询问题总数', '分享资料数量', '用户反馈数量'],
      series: [120, 85, 65] // 真实统计数据
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
          top: calcFontSize(15),
          bottom: calcFontSize(25)
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
          name: '数量',
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
          name: '数量',
          type: 'bar',
          data: chartData.series,
          itemStyle: {
            color: function (params): string {
              const colorList = ['#36D1DC', '#5B86E5', '#9A60B4'];
              return colorList[params.dataIndex];
            }
          },
          emphasis: {
            itemStyle: {
              color: function (params): string {
                const colorList = ['#2AA8B0', '#4A6FC9', '#8A4EA8'];
                return colorList[params.dataIndex];
              }
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
    const getData = async (): Promise<void> => {
      const res = await PZService.business.getConsultationStatistics()
      const { consultingQuestionNum, shareMaterialNum, userFeedbackNum } = res
      chartData.series = [consultingQuestionNum, shareMaterialNum, userFeedbackNum]
      initChart(chartRef.value as HTMLElement)
    }

    onMounted(() => {
      getData()
      chartRef.value && initChart(chartRef.value as HTMLElement)
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