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

export const ProjectFundingDistribution = defineComponent({
  name: 'ProjectFundingDistribution',
  setup () {
    let chartInstance = null
    const chartRef = ref<HTMLElement | null>(null)
    const chartData = {
      series: [
        { value: 0, name: '科技创新' },
        { value: 0, name: '产业发展' },
        { value: 0, name: '人才培养' },
        { value: 0, name: '基础设施建设' }
      ],
    }
    const getData = async (): Promise<void> => {
      const res = await PZService.public.getPublicProjectIncubationFundSupportRatio()
      if (res.length > 0) {
        chartData.series.length = 0
        for (const item of res) {
          chartData.series.push({
            value: item.count,
            name: item.type
          })
        }
      }
      chartRef.value && initChart(chartRef.value as HTMLElement)
    }

    const initChart = (el: HTMLElement): void => {
      chartInstance = echarts.init(el)
      chartInstance.setOption({

        tooltip: {
          trigger: 'item',
          formatter: '{a} <br/>{b}: {c}万元 ({d}%)',
          textStyle: {
            fontSize: calcFontSize(12)
          }
        },
        series: [
          {
            name: '资金分布',
            type: 'pie',
            radius: ['50%', '70%'],
            avoidLabelOverlap: false,
            data: chartData.series,
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)'
              }
            },
            label: {
              formatter: '{b}: {c} ({d}%)',
              color: '#ffffff',
              fontSize: calcFontSize(12)
            },
            labelLine: {
              lineStyle: {
                color: 'rgba(255, 255, 255, 0.3)'
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