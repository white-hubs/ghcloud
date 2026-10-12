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
import dayjs from 'dayjs'

use([
  CanvasRenderer,
  BarChart,
  GridComponent,
  TitleComponent,
  TooltipComponent,
  LegendComponent
])

export const TotalIncome = defineComponent({
  name: 'TotalIncome',
  setup () {
    let chartInstance = null
    const chartRef = ref<HTMLElement | null>(null)
    const totalIncome = ref(0)
    const chartData = {
      xAxis: [],
      series: [] // 示例数据，请替换为实际数据
    }
    const getData = async (): Promise<void>=>{
      const res = await PZService.public.getPublicConsumptionAnalysisIncome(dayjs().startOf('year').format('YYYY-MM-DD HH:mm:ss') + "," + dayjs().endOf('month').format('YYYY-MM-DD HH:mm:ss'))
      let totalIncome = 0
      let currentMonth = 1
      res.forEach((item, index) => {
        if (index !== 0 && item.time === '1号') {
          chartData.series.push(totalIncome)
          chartData.xAxis.push(`${currentMonth}月`)
          currentMonth ++
          totalIncome = 0
        }
        totalIncome += item.count
        if (index === res.length - 1){
          chartData.series.push(totalIncome)
          chartData.xAxis.push(`${currentMonth}月`)
        }
      })
      chartRef.value && initChart(chartRef.value as HTMLElement)
    }

    const initChart = (el: HTMLElement): void => {
      totalIncome.value = chartData.series.reduce((sum, current) => sum + current, 0)
      chartInstance = echarts.init(el)
      chartInstance.setOption({
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          },
          formatter: '{b}<br/>收入: {c}元',
          textStyle: {
            fontSize: calcFontSize(12),
          }
        },
        title: {
          text: `今年总收入: ${totalIncome.value}元`,
          left: 'center',
          top: 20,
          textStyle: {
            color: '#ffffff',
            fontSize: calcFontSize(14)
          }
        },
        grid: {
          left: calcFontSize(30),
          right: calcFontSize(0),
          top: calcFontSize(60),
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
          name: '收入(元)',
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
          name: '收入',
          type: 'bar',
          data: chartData.series,
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#188df0' },
              { offset: 1, color: 'rgba(24, 141, 240, 0)' }
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