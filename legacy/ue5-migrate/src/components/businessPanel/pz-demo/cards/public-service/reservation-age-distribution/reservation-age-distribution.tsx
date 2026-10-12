
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

export const ReservationAgeDistribution = defineComponent({
  name: 'ReservationAgeDistribution',
  setup () {
    let chartInstance = null
    const chartRef = ref<HTMLElement | null>(null)
    const chartData = {
      xAxis: ['18-25', '26-35', '36-45', '46+'],
      series: [0, 0, 0, 0] // 示例数据，请替换为实际数据
    }
    const getData = async (): Promise<void> => {
      const res = await PZService.public.getPublicSharedSpaceAgeDistribution()
      if (res.length !== 0) {
        chartData.xAxis = res.map(item => item.ageGroup)
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
        // 为了消除底部空隙，调整 grid 组件的 bottom 属性
        grid: {
          left: calcFontSize(30),
          right: calcFontSize(0),
          top: calcFontSize(40),
          bottom: calcFontSize(30)
        },
        xAxis: {
          axisLine: {
            lineStyle: {
              color: '#ffffff' // 设置x轴线条颜色为白色
            }
          },
          axisTick: {
            lineStyle: {
              color: '#ffffff' // 设置x轴刻度线颜色为白色
            }
          },
          axisLabel: {
            interval: 0,
            color: '#ffffff', // 设置 x 轴文字颜色为白色
            fontSize: calcFontSize(12) // 设置 x 轴文字字体大小为 12
          },
          nameTextStyle: {
            color: '#ffffff', // 设置 x 轴名称文字颜色为白色
            fontSize: calcFontSize(12)
          },
          type: 'category',
          data: chartData.xAxis,
        },
        yAxis: {
          type: 'value',
          name: '预定数量',
          axisLabel: {
            interval: 0,
            color: '#ffffff', // 设置 x 轴文字颜色为白色
            fontSize: calcFontSize(12) // 设置 x 轴文字字体大小为 12
          },
          nameTextStyle: {
            color: '#ffffff', // 设置 x 轴名称文字颜色为白色
            fontSize: calcFontSize(12)
          },
        },
        series: [{
          name: '预定数量',
          type: 'bar',
          data: chartData.series,
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#188df0' }, // 顶部不透明
              { offset: 1, color: 'rgba(24, 141, 240, 0)' } // 底部完全透明
            ])
          },
          emphasis: {
            itemStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: '#2378f7' },
                { offset: 1, color: 'rgba(35, 120, 247, 0)' }
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
        <div class='card-container-3' ref={chartRef}></div>
      </SubPanelTemplate>
    )
  }
})