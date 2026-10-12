import { defineComponent, onMounted, onUnmounted, ref } from 'vue'
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import * as echarts from 'echarts'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { PieChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent
} from 'echarts/components'
import { calcFontSize } from '@/utils/common'
import { PZService } from '../../../card-service/service'

use([
  CanvasRenderer,
  PieChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent
])

export const AreaAnalysis = defineComponent({
  name: 'AreaAnalysis',
  setup () {
    let chartInstance = null
    const chartRef = ref<HTMLElement | null>(null)
    const chartData = [
      { value: 0, name: '办公区' },
      { value: 0, name: '实验室' },
      { value: 0, name: '会议室' },
      { value: 0, name: '休息区' },
      { value: 0, name: '其他区域' }
    ]
    const getData = async (): Promise<void> => {
      const res = await PZService.public.getPublicComplaintSuggestionComplaintAreaAnalysis()
      if (res.length){
        chartData.length = 0
        res.forEach(item => {
          chartData.push({
            value: item.count,
            name: item.area
          })
        })
      }
      chartRef.value && initChart(chartRef.value as HTMLElement)
    }

    const initChart = (el: HTMLElement): void => {
      chartInstance = echarts.init(el)
      chartInstance.setOption({
        tooltip: {
          trigger: 'item',
          formatter: '{a} <br/>{b}: {c} ({d}%)',
          textStyle: {
            fontSize: calcFontSize(12),
          }
        },
        series: [
          {
            name: '投诉数量',
            type: 'pie',
            radius: ['40%', '70%'],
            avoidLabelOverlap: false,
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)'
              }
            },
            label: {
              formatter: '{b}: {c}',
              color: '#ffffff',
              fontSize: calcFontSize(12),
            },
            labelLine: {
              lineStyle: {
                color: 'rgba(255, 255, 255, 0.3)'
              }
            },
            data: chartData,
            color: [
              '#7e22ce', // 紫色
              '#3b82f6', // 蓝色
              '#10b981', // 绿色
              '#f59e0b', // 黄色
              '#ef4444' // 红色
            ]
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