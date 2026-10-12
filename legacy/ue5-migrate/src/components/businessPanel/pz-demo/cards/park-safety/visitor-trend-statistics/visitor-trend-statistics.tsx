import { defineComponent, ref, onMounted, onUnmounted } from 'vue'
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

export const VisitorTrendStatistics = defineComponent({
  name: 'VisitorTrendStatistics',
  setup () {
    let chartInstance = null
    const chartRef = ref<HTMLElement | null>(null)
    const timeRange = ref({
      timeType: 'TODAY',
      dateRange: []
    })

    const getData = async (): Promise<void>=>{
      const result = await PZService.parkSafety.getVisitorTrendStatistics({
        type: timeRange.value.timeType,
        period: timeRange.value.dateRange.join(',')
      })
      const xData = result.map((item)=>item.time)
      const values = result.map((item)=>item.count)
      updateChart({
        xData,
        values
      })
    }
    const updateChart = (currentData: {
      xData: string[];
      values: number[];
    }): void => {

      const option = {
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'line'
          }
        },
        grid: {
          left: calcFontSize(0),
          right: calcFontSize(0),
          top: calcFontSize(70),
          bottom: calcFontSize(10),
          containLabel: true
        },
        xAxis: {
          type: 'category',
          data: currentData.xData,
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
          name: '访客数量',
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
                  type: 'max',
                  name: '最高点',
                  symbolSize: [50, 50],
                  label: {
                    color: '#ffffff',
                    fontSize: calcFontSize(12)
                  },
                }
              ]
            }
          }
        ]
      }

      chartInstance?.setOption(option)
    }

    const initChart = (): void => {
      if (chartRef.value) {
        chartInstance = echarts.init(chartRef.value as HTMLElement)
        updateChart({
          xData: ['08:00', '10:00', '12:00', '14:00', '16:00', '18:00'],
          values: [20, 45, 35, 60, 30, 25],
        })
      }
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

    return (): JSX.Element => (
      <SubPanelTemplate title='访客趋势统计' v-slots={{
        extra: () => (
          <DateInlineForm onSearch={getData} v-model:modelValue={timeRange.value} timeList={[
            { label: "今日", value: "TODAY" },
            { label: "本周", value: "THIS_WEEK" },
            { label: "本月", value: "THIS_MONTH" }
          ]}></DateInlineForm>
        )
      }}>
        <div class='card-container-2' ref={chartRef}></div>
      </SubPanelTemplate>
    )
  }
})