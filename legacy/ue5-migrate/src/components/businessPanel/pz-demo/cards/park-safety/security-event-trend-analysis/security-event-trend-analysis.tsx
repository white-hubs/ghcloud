import { defineComponent, ref, watch, onMounted, onUnmounted } from 'vue'
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue"
import DateInlineForm from "@/components/businessPanel/public/dateInlineForm.vue"
import * as echarts from 'echarts'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { LineChart } from 'echarts/charts'
import {
  GridComponent,
  TooltipComponent,
  LegendComponent,
  MarkPointComponent
} from 'echarts/components'
import { calcFontSize } from '@/utils/common'
import { PZService } from '../../../card-service/service'

use([
  CanvasRenderer,
  LineChart,
  GridComponent,
  TooltipComponent,
  LegendComponent,
  MarkPointComponent
])

export const SecurityEventTrendAnalysis = defineComponent({
  name: 'SecurityEventTrendAnalysis',
  setup () {
    let chartInstance = null
    const chartRef = ref<HTMLElement | null>(null)
    const timeRange = ref({
      timeType: 'THIS_WEEK',
      dateRange: []
    })

    // 模拟数据
    let trendData = {
      xData: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
      values: [25, 32, 45, 38, 28, 22, 30],
      max: { value: 45, xAxis: 2 },
      min: { value: 22, xAxis: 5 }
    }
    const getData = async (): Promise<void>=>{
      const result = await PZService.parkSafety.getSecurityEventTrendAnalysis({
        type: timeRange.value.timeType,
        period: timeRange.value.dateRange.join(',')
      })
      trendData.xData = result.map(item=>item.time)
      trendData.values = result.map(item=>item.count)
      trendData.max = { value: Math.max(...result.map(item=>item.count)), xAxis: result.map(item=>item.count).indexOf(Math.max(...result.map(item=>item.count))) }
      trendData.min = { value: Math.min(...result.map(item=>item.count)), xAxis: result.map(item=>item.count).indexOf(Math.min(...result.map(item=>item.count))) }
    }

    const updateChart = (): void => {
      if (!chartInstance) return
      const currentData = trendData
      const option = {
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'line'
          }
        },
        grid: {
          left: calcFontSize(0),
          right: calcFontSize(10),
          top: calcFontSize(50),
          bottom: calcFontSize(0),
          containLabel: true
        },
        xAxis: {
          type: 'category',
          data: currentData.xData,
          axisLabel: {
            interval: timeRange.value.timeType === 'THIS_MONTH' ? 'auto' : 0,
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
          name: '安全事件数量',
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
            type: 'line',
            data: currentData.values,
            smooth: true,
            symbolSize: 8,
            lineStyle: {
              width: 3,
              color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
                { offset: 0, color: '#3b82f6' },
                { offset: 1, color: '#8b5cf6' }
              ])
            },
            itemStyle: {
              color: '#3b82f6'
            },
            areaStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: 'rgba(59, 130, 246, 0.5)' },
                { offset: 1, color: 'rgba(59, 130, 246, 0.1)' }
              ])
            },
            markPoint: {
              data: [
                {
                  type: 'max',
                  name: '最高点',
                  symbolSize: calcFontSize(50),
                  label: {
                    color: '#ffffff',
                    fontSize: calcFontSize(12)
                  },
                  itemStyle: {
                    color: '#f59e0b'
                  }
                },
                {
                  type: 'min',
                  name: '最低点',
                  symbolSize: calcFontSize(50),
                  label: {
                    color: '#ffffff',
                    fontSize: calcFontSize(12)
                  },
                  itemStyle: {
                    color: '#10b981'
                  }
                }
              ]
            }
          }
        ]
      }

      chartInstance.setOption(option)
    }

    const initChart = (): void => {
      if (chartRef.value) {
        chartInstance = echarts.init(chartRef.value as HTMLElement)
        updateChart()
      }
    }

    const handleResize = (): void => {
      chartInstance?.resize()
    }

    onMounted(() => {
      initChart()
      getData()
      window.addEventListener('resize', handleResize)
    })

    onUnmounted(() => {
      chartInstance?.dispose()
      window.removeEventListener('resize', handleResize)
    })

    watch(() => timeRange.value.timeType, updateChart)

    return (): JSX.Element => (
      <SubPanelTemplate title='安全事件趋势分析' v-slots={{
        extra: () => (
          <DateInlineForm v-model:modelValue={timeRange.value} onSearch={getData} ></DateInlineForm>
        )
      }}>
        <div class='card-container-3' ref={chartRef}></div>
      </SubPanelTemplate>
    )
  }
})