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

export const ReservationGenderDistribution = defineComponent({
  name: 'ReservationGenderDistribution',
  setup () {
    let chartInstance = null
    const chartRef = ref<HTMLElement | null>(null)
    const chartData = [

    ]
    const getData = async (): Promise<void> => {
      try {
        const res = await PZService.public.getPublicSharedSpaceGenderRatio()
        if (res.length !== 0) {
          chartData.length = 0
          res.forEach(item => {
            chartData.push({ value: item.count, name: item.gender })
          })
        } else {
          chartData.push({ value: 0, name: '男性' })
          chartData.push({ value: 0, name: '女性' })
        }
      } catch {

      }
      chartRef.value && initChart(chartRef.value as HTMLElement)
    }

    const initChart = (el: HTMLElement): void=> {
      chartInstance = echarts.init(el)
      chartInstance.setOption({
        tooltip: {
          trigger: 'item',
          formatter: '{a} <br/>{b}: {c} ({d}%)',
          textStyle: {
            fontSize: calcFontSize(12)
          }
        },
        legend: {
          orient: 'vertical',
          left: 'left',
          textStyle: {
            color: '#ffffff',
            fontSize: calcFontSize(12)
          }
        },
        series: [
          {
            center: ['50%', '60%'], // 调整饼图位置
            name: '预定数量',
            type: 'pie',
            radius: '50%',
            data: chartData,
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)'
              }
            },
            label: {
              formatter: '{b}: {c}',
              textStyle: {
                color: '#ffffff',
                fontSize: calcFontSize(12)
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
        <div class='card-container-3' ref={chartRef}></div>
      </SubPanelTemplate>
    )
  }
})