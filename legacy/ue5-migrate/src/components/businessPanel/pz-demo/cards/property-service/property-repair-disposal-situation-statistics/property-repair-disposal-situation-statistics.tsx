import { defineComponent, onMounted, onUnmounted, ref, watch } from 'vue'
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
import DateInlineForm from "@/components/businessPanel/public/dateInlineForm.vue";
import { PeriodStatTypeEnum } from '@ghcloud/cube-protocol'
import { getTimeRangeInterval, PZService } from '../../../card-service/service'

use([
  CanvasRenderer,
  BarChart,
  GridComponent,
  TitleComponent,
  TooltipComponent,
  LegendComponent
])

export const PropertyRepairDisposalSituationStatistics = defineComponent({
  name: 'PropertyRepairDisposalSituationStatistics',
  setup () {
    let chartInstance: echarts.ECharts | null = null
    const chartRef = ref<HTMLElement | null>(null)
    const timeRange = ref({
      timeType: PeriodStatTypeEnum.THIS_WEEK,
    })
    // 模拟事件类型及其处理率数据
    const disposalRateData = [
      { name: '电力', processed: 80, total: 100 },
      { name: '卫生', processed: 90, total: 120 },
      { name: '空调', processed: 70, total: 90 },
      { name: '电梯', processed: 85, total: 110 }
    ]
    const getData = async (): Promise<void> => {
      const res = await PZService.property.getPropertyComplaintRepairDisposalCaseStatistics(getTimeRangeInterval(timeRange.value.timeType), timeRange.value.timeType)
      if (res.length > 0) {
        disposalRateData.length = 0
        for (const item of res) {
          disposalRateData.push({
            name: item.name,
            processed: item.handlerCount,
            total: item.count
          })
        }
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
          formatter: (params) => {
            const data = disposalRateData[params[0].dataIndex]
            return `${data.name}<br/>处理率: ${((data.processed / data.total) * 100).toFixed(2)}%`
          },
          textStyle: {
            fontSize: calcFontSize(12)
          }
        },
        grid: {
          left: calcFontSize(30),
          right: calcFontSize(0),
          top: calcFontSize(40),
          bottom: calcFontSize(30)
        },
        xAxis: {
          type: 'category',
          data: disposalRateData.map(item => item.name),
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
            alignWithLabel: true
          }
        },
        yAxis: {
          type: 'value',
          name: '处理率 (%)',
          nameTextStyle: {
            color: '#ffffff',
            fontSize: calcFontSize(12)
          },
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
          min: 0,
          max: 100
        },
        series: [
          {
            name: '处理率',
            type: 'bar',
            data: disposalRateData.map(item => (item.processed / item.total) * 100),
            itemStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: '#91cc75' },
                { offset: 1, color: '#5470c6' }
              ])
            },
            barWidth: '60%'
          }
        ]
      })
    }

    const chartResize = (): void => {
      chartInstance && chartInstance.dispose()
      setTimeout(() => {
        if (chartRef.value) {
          initChart(chartRef.value as HTMLElement)
        }
      }, 1000)
    }

    onMounted(() => {
      if (chartRef.value) {
        getData()
      }
      window.addEventListener('resize', chartResize)
    })

    onUnmounted(() => {
      window.removeEventListener('resize', chartResize)
      chartInstance?.dispose()
    })

    watch(() => timeRange.value.timeType, getData)

    return (): JSX.Element => (
      <SubPanelTemplate v-slots={{
        extra: () => (
          <DateInlineForm v-model:modelValue={timeRange.value} timeList={[
            { label: "本周", value: PeriodStatTypeEnum.THIS_WEEK },
            { label: "本月", value: PeriodStatTypeEnum.THIS_MONTH },
            { label: "本季度", value: PeriodStatTypeEnum.THIS_QUARTER },
            { label: "今年", value: PeriodStatTypeEnum.THIS_YEAR }
          ]}></DateInlineForm>
        )
      }}>
        <div class='card-container-4' ref={chartRef}></div>
      </SubPanelTemplate>
    )
  }
})