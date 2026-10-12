
import { defineComponent, onMounted, onUnmounted, ref, watch } from 'vue'
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue"
import DateInlineForm from "@/components/businessPanel/public/dateInlineForm.vue"
import * as echarts from 'echarts'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { LineChart } from 'echarts/charts'
import {
  GridComponent,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  MarkPointComponent
} from 'echarts/components'
import { calcFontSize } from '@/utils/common'
import { getTimeRangeInterval, PZService } from '../../../card-service/service'
import { PeriodStatTypeEnum } from '@ghcloud/cube-protocol'

use([
  CanvasRenderer,
  LineChart,
  GridComponent,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  MarkPointComponent
])

export const PropertyRepairTimeTrend = defineComponent({
  name: 'PropertyRepairTimeTrend',
  setup () {
    let chartInstance = null
    const chartRef = ref<HTMLElement | null>(null)
    const timeRange = ref({
      timeType: PeriodStatTypeEnum.THIS_MONTH,
    })
    // 模拟数据
    const chartData = {
      xData: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
      values: [],
    }
    const getData = async (): Promise<void>=>{
      try {
        const res = await PZService.property.getPropertyComplaintRepairTimeTrend(getTimeRangeInterval(timeRange.value.timeType), timeRange.value.timeType)
        if (res.length){
          chartData.values = res.map(item=>item.count)
          chartData.xData = res.map(item=>item.time)
        }
      } catch {

      }
      if (timeRange.value.timeType === PeriodStatTypeEnum.THIS_WEEK){
        chartData.xData = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
      }
      chartResize()
    }

    const updateChart = (): void => {
      if (!chartInstance) return

      const currentData = chartData

      chartInstance.setOption({
        tooltip: {
          trigger: 'axis',
          textStyle: {
            fontSize: calcFontSize(12)
          }
        },
        grid: {
          left: calcFontSize(0),
          right: calcFontSize(0),
          top: calcFontSize(40),
          bottom: calcFontSize(20),
          containLabel: true
        },
        xAxis: {
          type: 'category',
          data: currentData.xData,
          axisLabel: {
            interval: timeRange.value.timeType === 'THIS_YEAR' ? 0 : 'auto',
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
          name: '报修数量',
          nameTextStyle: {
            color: '#ffffff',
            fontSize: calcFontSize(12)
          },
          axisLabel: {
            color: '#ffffff',
            fontSize: calcFontSize(12)
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
              color: '#8b5cf6'
            },
            itemStyle: {
              color: '#8b5cf6'
            },
            areaStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: 'rgba(139, 92, 246, 0.5)' },
                { offset: 1, color: 'rgba(139, 92, 246, 0.1)' }
              ])
            },
            markPoint: {
              data: [
                { type: 'max', name: '高峰' }
              ],
              itemStyle: {
                color: ''
              },
              label: {
                color: '#ffffff',
                fontSize: calcFontSize(12)
              }
            },
          }
        ],
        dataZoom: timeRange.value.timeType === PeriodStatTypeEnum.THIS_MONTH ? [{
          type: 'slider',
          show: true,
          start: 0,
          end: 33,
          textStyle: {
            fontSize: calcFontSize(12),
            color: '#ffffff'
          }
        }] : []
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
      }, 1000)
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
      <SubPanelTemplate title='物业报修时间趋势' v-slots={{
        extra: () => (
          <DateInlineForm v-model:modelValue={timeRange.value} timeList={[
            { label: "本周", value: PeriodStatTypeEnum.THIS_WEEK },
            { label: "本月", value: PeriodStatTypeEnum.THIS_MONTH },
            { label: "本季度", value: PeriodStatTypeEnum.THIS_QUARTER },
            { label: "今年", value: PeriodStatTypeEnum.THIS_YEAR }
          ]}></DateInlineForm>
        )
      }}>
        <div class='card-container-3' ref={chartRef}></div>
      </SubPanelTemplate>
    )
  }
})