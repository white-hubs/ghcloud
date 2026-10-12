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

use([
  CanvasRenderer,
  LineChart,
  GridComponent,
  TooltipComponent,
  LegendComponent,
  MarkPointComponent
])

export const SafetyEventTrendAnalysis = defineComponent({
  name: 'SafetyEventTrendAnalysis',
  setup () {
    let chartInstance = null
    const chartRef = ref<HTMLElement | null>(null)
    const timeRange = ref({
      timeType: 'THIS_WEEK'
    })

    // 模拟数据
    const trendData = {
      THIS_WEEK: {
        xData: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
        values: [25, 32, 45, 38, 28, 22, 30],
        max: { value: 45, xAxis: 2 },
        min: { value: 22, xAxis: 5 }
      },
      THIS_MONTH: {
        xData: Array.from({length: 30}, (_, i) => `${i + 1}日`),
        values: Array.from({length: 30}, () => Math.floor(Math.random() * 50) + 20),
        max: { value: 65, xAxis: 15 },
        min: { value: 18, xAxis: 25 }
      },
      THIS_QUARTER: {
        xData: Array.from({length: 12}, (_, i) => `${Math.floor(i / 4) + 1}月${(i % 4) * 7 + 1}日`),
        values: Array.from({length: 12}, () => Math.floor(Math.random() * 60) + 30),
        max: { value: 85, xAxis: 6 },
        min: { value: 28, xAxis: 10 }
      },
      THIS_YEAR: {
        xData: Array.from({length: 12}, (_, i) => `${i + 1}月`),
        values: [120, 132, 145, 138, 158, 165, 145, 138, 142, 135, 128, 140],
        max: { value: 165, xAxis: 5 },
        min: { value: 120, xAxis: 0 }
      }
    }

    const updateChart = () => {
      if (!chartInstance) return
      
      const currentData = trendData[timeRange.value.timeType]
      
      const option = {
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'line'
          }
        },
        grid: {
          left: calcFontSize(50),
          right: calcFontSize(20),
          top: calcFontSize(50),
          bottom: calcFontSize(30),
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
          axisLine: {
            show: true,
            lineStyle: {
              color: '#ffffff'
            }
          },
          splitLine: {
            show: false
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
              color: '#3b82f6'
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
                  name: '最大值',
                  coord: [currentData.max.xAxis, currentData.max.value],
                  value: currentData.max.value,
                  symbolSize: [50, 50],
                  itemStyle: {
                    color: '#f59e0b'
                  },
                  label: {
                    color: '#ffffff',
                    fontSize: calcFontSize(12)
                  }
                },
                {
                  name: '最小值',
                  coord: [currentData.min.xAxis, currentData.min.value],
                  value: currentData.min.value,
                  symbolSize: [50, 50],
                  itemStyle: {
                    color: '#10b981'
                  },
                  label: {
                    color: '#ffffff',
                    fontSize: calcFontSize(12)
                  }
                }
              ]
            }
          }
        ]
      }

      chartInstance.setOption(option)
    }

    const initChart = () => {
      if (chartRef.value) {
        chartInstance = echarts.init(chartRef.value)
        updateChart()
      }
    }

    const handleResize = () => {
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
      <SubPanelTemplate title='安全事件趋势分析' v-slots={{
        extra: () => (
          <DateInlineForm v-model:modelValue={timeRange.value} timeList={[
            { label: "本周", value: "THIS_WEEK" },
            { label: "本月", value: "THIS_MONTH" },
            { label: "本季度", value: "THIS_QUARTER" },
            { label: "今年", value: "THIS_YEAR" }
          ]}></DateInlineForm>
        )
      }}>
        <div class='card-container-3' ref={chartRef} style="height: 300px;"></div>
      </SubPanelTemplate>
    )
  }
})