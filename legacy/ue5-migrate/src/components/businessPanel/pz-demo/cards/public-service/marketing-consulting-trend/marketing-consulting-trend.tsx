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
  LegendComponent,
  MarkPointComponent
} from 'echarts/components'
import { calcFontSize } from '@/utils/common'
import DateInlineForm from "@/components/businessPanel/public/dateInlineForm.vue";
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

export const MarketingConsultingTrend = defineComponent({
  name: 'MarketingConsultingTrend',
  setup () {
    let chartInstance = null
    const chartRef = ref<HTMLElement | null>(null)
    const timeRange = ref({
      timeType: PeriodStatTypeEnum.THIS_WEEK,
    })
    const chartData = {
      xAxis: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
      series: [42, 48, 45, 52, 50, 38, 35] // 工作日咨询量较高，周末下降
    }
    const getData = async (): Promise<void> => {
      const res = await PZService.public.getPublicExpertConsultationMarketingConsultationTrend(getTimeRangeInterval(timeRange.value.timeType), timeRange.value.timeType)
      chartData.xAxis = res.map(e=>e.time)
      chartData.series = res.map(e=>e.count)
      if (timeRange.value.timeType === PeriodStatTypeEnum.THIS_WEEK) {
        chartData.xAxis = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
      }
      chartResize()
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
        legend: {
          data: ['咨询数量'],
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
          top: calcFontSize(35),
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
          type: 'category',
          data: chartData.xAxis,
          name: '',
          axisLabel: {
            interval: 0,
            color: '#ffffff',
            fontSize: calcFontSize(12)
          },
          nameTextStyle: {
            color: '#ffffff',
            fontSize: calcFontSize(12)
          }
        },
        yAxis: {
          type: 'value',
          name: '市场营销咨询数量',
          axisLabel: {
            interval: 0,
            color: '#ffffff',
            fontSize: calcFontSize(12)
          },
          nameTextStyle: {
            color: '#ffffff',
            fontSize: calcFontSize(12)
          },
          min: 0
        },
        series: [{
          name: '咨询数量',
          type: 'line',
          smooth: true,
          data: chartData.series,
          markPoint: {
            data: [
              { type: 'max', name: '最高峰' }
            ],
            label: {
              show: true,
              color: '#ffffff',
              fontSize: calcFontSize(12)
            }
          },
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#9a60b4' },
              { offset: 1, color: '#ea7ccc' }
            ])
          },
          lineStyle: {
            width: 3,
            color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
              { offset: 0, color: '#9a60b4' },
              { offset: 1, color: '#ea7ccc' }
            ])
          },
          symbolSize: 8,
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(234, 124, 204, 0.5)' },
              { offset: 1, color: 'rgba(234, 124, 204, 0.1)' }
            ])
          }
        }],
        dataZoom: timeRange.value.timeType === PeriodStatTypeEnum.THIS_MONTH ? [{
          type: 'slider',
          show: true,
          start: 0,
          end: 33,
          textStyle: {
            color: '#ffffff'
          }
        }] : undefined
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

    watch(()=>timeRange.value.timeType, ()=>{
      getData()
    })

    return (): JSX.Element => (
      <SubPanelTemplate v-slots={{
        extra: () => (
          <DateInlineForm v-model:modelValue={timeRange.value} timeList={[
            { label: "本周", value: "THIS_WEEK" },
            { label: "本月", value: "THIS_MONTH" },
            { label: "今年", value: "THIS_YEAR" }
          ]}></DateInlineForm>
        )
      }}>
        <div class='card-container-3' ref={chartRef}></div>
      </SubPanelTemplate>
    )
  }
})