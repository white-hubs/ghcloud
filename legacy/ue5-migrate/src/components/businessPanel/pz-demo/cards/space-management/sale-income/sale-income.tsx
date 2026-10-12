import { defineComponent, onMounted, onUnmounted, ref, watch } from 'vue'
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
import DateInlineForm from "@/components/businessPanel/public/dateInlineForm.vue";

use([
  CanvasRenderer,
  LineChart,
  GridComponent,
  TitleComponent,
  TooltipComponent,
  LegendComponent
])

export const SaleIncome = defineComponent({
  name: 'SaleIncome',
  setup () {
    let chartInstance = null
    const chartRef = ref<HTMLElement | null>(null)
    const timeRange = ref({
      timeType: 'THIS_MONTH',
    })
    const chartData = {
      xAxis: ['1月', '2月', '3月', '4月', '5月', '6月'],
      income: [50000, 80000, 120000, 90000, 150000, 180000]
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
        legend: {
          data: ['销售收益'],
          right: 0,
          top: 0,
          textStyle: {
            fontSize: calcFontSize(12),
            color: '#ffffff'
          }
        },
        grid: {
          left: calcFontSize(30),
          right: calcFontSize(0),
          top: calcFontSize(40),
          bottom: calcFontSize(20)
        },
        xAxis: {
          type: 'category',
          data: chartData.xAxis,
          axisLabel: {
            color: '#ffffff',
            fontSize: calcFontSize(12)
          },
          axisLine: {
            lineStyle: {
              color: '#ffffff'
            }
          }
        },
        yAxis: {
          type: 'value',
          name: '收益额 (元)',
          nameTextStyle: {
            fontSize: calcFontSize(12),
            color: '#ffffff'
          },
          axisLabel: {
            color: '#ffffff',
            fontSize: calcFontSize(12)
          },
          axisLine: {
            lineStyle: {
              color: '#ffffff'
            }
          }
        },
        series: [
          {
            name: '销售收益',
            type: 'line',
            smooth: true,
            data: chartData.income,
            itemStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
                { offset: 0, color: '#91cc75' },
                { offset: 1, color: '#5470c6' }
              ])
            },
            areaStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: 'rgba(84, 112, 198, 0.5)' },
                { offset: 1, color: 'rgba(84, 112, 198, 0.1)' }
              ])
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
      chartRef.value && initChart(chartRef.value as HTMLElement)
      window.addEventListener('resize', chartResize)
    })
    onUnmounted(() => {
      chartInstance && chartInstance.dispose()
      window.removeEventListener('resize', chartResize)
    })

    watch(()=>timeRange.value.timeType, ()=>{
      if (timeRange.value.timeType === 'THIS_MONTH'){
        chartData.xAxis = ['1周', '2周', '3周', '4周']
        chartData.income = [50000, 80000, 120000, 90000]
      } else if (timeRange.value.timeType === 'THIS_QUARTER'){
        chartData.xAxis = ['1月', '2月', '3月']
        chartData.income = [150000, 180000, 200000]
      } else if (timeRange.value.timeType === 'THIS_YEAR'){
        chartData.xAxis = ['Q1', 'Q2', 'Q3', 'Q4']
        chartData.income = [450000, 500000, 550000, 600000]
      }
      chartResize()
    })

    return (): JSX.Element => (
      <SubPanelTemplate v-slots={{
        extra: () => (
          <DateInlineForm v-model:modelValue={timeRange.value} timeList={[
            { label: "本月", value: "THIS_MONTH" },
            { label: "本季度", value: "THIS_QUARTER" },
            { label: "今年", value: "THIS_YEAR" }
          ]}></DateInlineForm>
        )
      }}>
        <div class='card-container-4' ref={chartRef}></div>
      </SubPanelTemplate>
    )
  }
})