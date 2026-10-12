import { defineComponent, onMounted, onUnmounted, ref, watch } from 'vue'
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import DateInlineForm from "@/components/businessPanel/public/dateInlineForm.vue";
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

export const PropertyPaymentAreaAnalysis = defineComponent({
  name: 'PropertyPaymentAreaAnalysis',
  setup () {
    let chartInstance = null
    const chartRef = ref<HTMLElement | null>(null)
    const timeRange = ref({
      timeType: 'THIS_MONTH',
    })

    // 模拟数据
    const chartData = {
      paid: [120000, 98000, 156000, 85000, 112000],
      unpaid: [25000, 18000, 32000, 15000, 22000]
    }

    const areas = ['A区', 'B区', 'C区', 'D区', 'E区']

    // 格式化金额显示
    const formatAmount = (amount): string=> {
      return amount >= 10000
        ? (amount / 10000).toFixed(2) + '万'
        : amount.toFixed(2)
    }

    const updateChart = (): void => {
      if (!chartInstance) return

      const currentData = chartData

      chartInstance.setOption({
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          },
          formatter: function (params) {
            return `${params[0].name}<br/>
                    ${params[0].seriesName}: ${formatAmount(params[0].value)}元<br/>
                    ${params[1].seriesName}: ${formatAmount(params[1].value)}元`
          },
          textStyle: {
            fontSize: calcFontSize(12)
          }
        },
        grid: {
          left: calcFontSize(0),
          right: calcFontSize(0),
          top: calcFontSize(40),
          bottom: calcFontSize(30),
          containLabel: true
        },
        xAxis: {
          type: 'category',
          data: areas,
          axisLabel: {
            interval: 0,
            color: '#ffffff',
            fontSize: calcFontSize(12)
          },
          axisLine: {
            lineStyle: {
              color: '#ffffff'
            }
          },
          axisTick: {
            alignWithLabel: true,
            lineStyle: {
              color: '#ffffff'
            }
          }
        },
        yAxis: [
          {
            type: 'value',
            name: '已缴金额（元）',
            position: 'left',
            nameTextStyle: {
              color: '#ffffff',
              fontSize: calcFontSize(12)
            },
            axisLabel: {
              color: '#ffffff',
              fontSize: calcFontSize(12),
              formatter: function (value): string {
                return formatAmount(value)
              }
            },
            axisLine: {
              show: true,
              lineStyle: {
                color: '#60a5fa'
              }
            },
            splitLine: {
              lineStyle: {
                color: 'rgba(255, 255, 255, 0.1)',
                type: 'dashed'
              }
            }
          },
          {
            type: 'value',
            name: '欠费金额（元）',
            position: 'right',
            nameTextStyle: {
              color: '#ffffff',
              fontSize: calcFontSize(12)
            },
            axisLabel: {
              color: '#ffffff',
              fontSize: calcFontSize(12),
              formatter: function (value): string {
                return formatAmount(value)
              }
            },
            axisLine: {
              show: true,
              lineStyle: {
                color: '#f87171'
              }
            },
            splitLine: {
              show: false
            }
          }
        ],
        series: [
          {
            name: '已缴金额',
            type: 'bar',
            data: currentData.paid,
            yAxisIndex: 0,
            barWidth: calcFontSize(20),
            itemStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: '#60a5fa' },
                { offset: 1, color: '#3b82f6' }
              ])
            }
          },
          {
            name: '欠费金额',
            type: 'bar',
            data: currentData.unpaid,
            yAxisIndex: 1,
            barWidth: calcFontSize(20),
            itemStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: '#f87171' },
                { offset: 1, color: '#ef4444' }
              ])
            }
          }
        ],
        dataZoom: [
          {
            type: 'slider',
            show: true,
            start: 0,
            end: 33,
            textStyle: {
              color: '#ffffff'
            }
          }
        ]
      })
    }

    const initChart = (el: HTMLElement): void => {
      chartInstance = echarts.init(el)
      updateChart()
    }

    const chartResize = (): void => {
      chartInstance && chartInstance.dispose()
      setTimeout(() => {
        chartRef.value && initChart(chartRef.value as HTMLElement)
      }, 1000);
    }
    const getData = async (): Promise<void>=>{
      try {
        const res = await PZService.property.getPropertyPaymentAnalysisAmountOverview()
        if (res.length){
          chartData.paid.length = 0
          chartData.paid.length = 0
          areas.length = 0
          chartData.paid.push(...res.map(item=>item.amount))
          chartData.unpaid.push(...res.map(item=>item.arrearsAmount))
          areas.push(...res.map(item=>item.area))
        }
      } catch {

      }
      chartResize()
    }
    onMounted(() => {
      getData()
      window.addEventListener('resize', chartResize)
    })
    onUnmounted(() => {
      chartInstance && chartInstance.dispose()
      window.removeEventListener('resize', chartResize)
    })

    watch(() => timeRange.value.timeType, getData)

    return (): JSX.Element => (
      <SubPanelTemplate title='物业缴费区域分析' v-slots={{
        extra: () => (
          <DateInlineForm v-model:modelValue={timeRange.value} timeList={[
            { label: "本月", value: "THIS_MONTH" },
            { label: "本季度", value: "THIS_QUARTER" },
            { label: "今年", value: "THIS_YEAR" }
          ]}></DateInlineForm>
        )
      }}>
        <div class='card-container-4' ref={chartRef} ></div>
      </SubPanelTemplate>
    )
  }
})