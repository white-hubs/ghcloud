import { defineComponent, ref, onMounted, onUnmounted, watch } from 'vue'
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue"
import DateInlineForm from "@/components/businessPanel/public/dateInlineForm.vue"
import * as echarts from 'echarts'
import { use } from 'echarts/core'
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
  BarChart,
  GridComponent,
  TitleComponent,
  TooltipComponent,
  LegendComponent
])

export const EnterpriseScaleAnalysis = defineComponent({
  name: 'EnterpriseScaleAnalysis',
  setup () {
    let chartInstance = null
    const chartRef = ref(null)
    const timeRange = ref({
      timeType: 'THIS_YEAR',
      dateRange: []
    })

    // 模拟数据
    const mockData = {
      EMPLOYEE: {
        xData: ['0-50人', '51-200人', '201-500人', '501-1000人', '1000人以上'],
        yData: [30, 45, 25, 15, 10]
      },
      REVENUE: {
        xData: ['0-100万', '100-500万', '500-1000万', '1000-5000万', '5000万以上'],
        yData: [20, 35, 30, 25, 15]
      }
    }

    const updateChart = async (): Promise<void> => {
      if (!chartInstance) return
      const currentData = mockData[timeRange.value.timeType]

      const option = {
        tooltip: {
          trigger: 'axis',
          formatter: (params): string => {
            const value = params[0].value
            return `${params[0].name}<br/>企业数量：${value}家<br/>占比：${((value / currentData.yData.reduce((a, b) => a + b, 0)) * 100).toFixed(1)}%`
          }
        },
        grid: {
          top: calcFontSize(40),
          left: calcFontSize(10),
          right: calcFontSize(10),
          bottom: calcFontSize(30),
          containLabel: true
        },
        xAxis: {
          type: 'category',
          data: currentData.xData,
          axisLabel: {
            color: '#ffffff',
            fontSize: calcFontSize(12),
            interval: 0,
            rotate: 30
          },
          axisLine: {
            lineStyle: {
              color: 'rgba(255, 255, 255, 0.3)'
            }
          }
        },
        yAxis: {
          type: 'value',
          name: '企业数量',
          nameTextStyle: {
            color: '#ffffff',
            fontSize: calcFontSize(12)
          },
          axisLabel: {
            color: '#ffffff',
            fontSize: calcFontSize(12)
          },
          splitLine: {
            lineStyle: {
              color: 'rgba(255, 255, 255, 0.1)',
              type: 'dashed'
            }
          }
        },
        series: [
          {
            type: 'bar',
            data: currentData.yData,
            barWidth: '40%',
            itemStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: '#3b82f6' },
                { offset: 1, color: 'rgba(59, 130, 246, 0.3)' }
              ])
            },
            label: {
              show: true,
              position: 'top',
              color: '#ffffff',
              fontSize: calcFontSize(12)
            }
          }
        ]
      }

      chartInstance?.setOption(option)
    }

    const initChart = (): void => {
      if (!chartRef.value) return
      chartInstance = echarts.init(chartRef.value)
      updateChart()
    }

    const handleResize = (): void => {
      chartInstance?.resize()
    }

    onMounted(() => {
      initChart()
      window.addEventListener('resize', handleResize)
    })

    onUnmounted(() => {
      chartInstance?.dispose()
      window.removeEventListener('resize', handleResize)
    })

    watch(() => timeRange.value.timeType, updateChart)

    return (): JSX.Element => (
      <SubPanelTemplate title='企业规模分析' v-slots={{
        extra: () => (
          <DateInlineForm v-model:modelValue={timeRange.value} timeList={[
            { label: "按员工数", value: "EMPLOYEE" },
            { label: "按营收", value: "REVENUE" }
          ]}></DateInlineForm>
        )
      }}>
        <div class='card-container-3' ref={chartRef}></div>
      </SubPanelTemplate>
    )
  }
})