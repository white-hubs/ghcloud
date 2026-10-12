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

export const PropertyRentalDecorationApplicationQuantity = defineComponent({
  name: 'PropertyRentalDecorationApplicationQuantity',
  setup () {
    let chartInstance = null
    const chartRef = ref<HTMLElement | null>(null)
    const chartData = {
      xAxis: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'], // 月份
      series: [35, 28, 42, 38, 45, 52, 48, 56, 42, 38, 32, 40] // 示例数据，请替换为实际数据
    }
    const getData = async (): Promise<void>=>{
      try {
        const res = await PZService.property.getPropertyRentAnalysisDecorationApplicationQuantity()
        chartData.xAxis = res.map(item=>item.month)
        chartData.series = res.map(item=>item.decorationCount)
      } catch {

      } finally {
        chartRef.value && initChart(chartRef.value as HTMLElement)
      }
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
          top: calcFontSize(40),
          left: calcFontSize(10),
          right: calcFontSize(10),
          bottom: calcFontSize(10), // 增加底部空间，为滚动条和标签留出更多空间
          containLabel: true
        },
        xAxis: {
          axisLabel: {
            interval: 'auto', // 设置为'auto'让echarts自动计算间隔，避免标签重叠
            rotate: 0, // 可以设置为一定角度，比如30，使标签倾斜显示
            color: '#ffffff',
            fontSize: calcFontSize(12)
          },
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
          nameTextStyle: {
            color: '#ffffff',
            fontSize: calcFontSize(12)
          },
          type: 'category',
          data: chartData.xAxis,
          name: '月份',
        },
        yAxis: {
          type: 'value',
          name: '申请数量',
          axisLabel: {
            interval: 0,
            color: '#ffffff',
            fontSize: calcFontSize(12)
          },
          nameTextStyle: {
            color: '#ffffff',
            fontSize: calcFontSize(12)
          },
          splitLine: {
            lineStyle: {
              color: 'rgba(255, 255, 255, 0.1)',
              type: 'dashed'
            }
          },
          axisLine: {
            lineStyle: {
              color: 'rgba(255, 255, 255, 0.3)'
            }
          }
        },
        series: [{
          name: '装修申请数量',
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
          },
          label: {
            show: true,
            position: 'top',
            formatter: '{c}',
            color: '#ffffff',
            fontSize: calcFontSize(12)
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
      <SubPanelTemplate title='物业租赁装修申请数量'>
        <div class='card-container-4' ref={chartRef}></div>
      </SubPanelTemplate>
    )
  }
})