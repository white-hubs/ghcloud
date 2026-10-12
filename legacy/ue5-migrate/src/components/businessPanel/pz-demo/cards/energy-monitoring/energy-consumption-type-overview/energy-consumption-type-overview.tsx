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
  LegendComponent,
  MarkPointComponent,
  MarkLineComponent
} from 'echarts/components'
import { calcFontSize } from '@/utils/common'
import DateInlineForm from "@/components/businessPanel/public/dateInlineForm.vue";
import { PeriodStatTypeEnum } from '@ghcloud/cube-protocol'
import { PZService } from '../../../card-service/service'

use([
  CanvasRenderer,
  BarChart,
  GridComponent,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  MarkPointComponent,
  MarkLineComponent
])

export const EnergyConsumptionTypeOverview = defineComponent({
  setup () {
    let chartInstance = null
    const chartRef = ref<HTMLElement | null>(null)
    const timeRange = ref({
      timeType: PeriodStatTypeEnum.TODAY,
    })
    // 请替换为真实数据
    const chartDataMap = {
      total: 0,
      monthOnMonth: 0,
      yearOnYear: 0
    }
    const getData = async (): Promise<void> => {
      const res = await PZService.energy.getWaterOverview(timeRange.value.timeType)
      chartDataMap.total = res.total
      chartDataMap.monthOnMonth = res.chainRatio
      chartDataMap.yearOnYear = res.yearOnYear
      chartResize()
    }

    const initChart = (el: HTMLElement): void => {
      const currentData = chartDataMap
      chartInstance = echarts.init(el)
      chartInstance.setOption({
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          },
          textStyle: {
            fontSize: calcFontSize(12),
          },
          formatter: (params): string => {
            if (params[0].dataIndex === 0){
              return `
                ${currentData.total} 吨`
            }
            if (params[0].dataIndex === 1){
              return `${currentData.monthOnMonth}%`
            }
            if (params[0].dataIndex === 2){
              return `${currentData.yearOnYear}%`
            }
          }
        },
        grid: {
          left: calcFontSize(50),
          right: calcFontSize(0),
          top: calcFontSize(10),
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
          data: ['用水总量', '环比', '同比'],
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
        series: [{
          name: '数据',
          type: 'bar',
          data: [currentData.total, currentData.monthOnMonth, currentData.yearOnYear],
          itemStyle: {
            color: new echarts.graphic.LinearGradient(
              0, 0, 0, 1, // 从顶部到底部的渐变
              [
                { offset: 0, color: '#5470c6' }, // 起始颜色
                { offset: 1, color: 'rgba(84, 112, 198, 0)' } // 结束颜色，透明
              ]
            )
          },
          barWidth: '40%'
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

    watch(() => timeRange.value.timeType, getData)

    return (): JSX.Element => (
      <SubPanelTemplate v-slots={{
        extra: () => (
          <DateInlineForm v-model:modelValue={timeRange.value} timeList={[
            { label: "今日", value: PeriodStatTypeEnum.TODAY },
            { label: "本周", value: PeriodStatTypeEnum.THIS_WEEK },
            { label: "本月", value: PeriodStatTypeEnum.THIS_MONTH },
            { label: "今年", value: PeriodStatTypeEnum.THIS_YEAR }
          ]}></DateInlineForm>
        )
      }}>
        <div class='card-container-3' ref={chartRef}></div>
      </SubPanelTemplate>
    )
  }
})