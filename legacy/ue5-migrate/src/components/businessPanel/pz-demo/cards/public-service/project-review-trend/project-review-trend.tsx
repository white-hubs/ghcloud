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
import { getTimeRangeInterval, PZService } from '../../../card-service/service'
import { PeriodStatTypeEnum } from '@ghcloud/cube-protocol'


use([
  CanvasRenderer,
  LineChart,
  GridComponent,
  TitleComponent,
  TooltipComponent,
  LegendComponent
])

export const ProjectReviewTrend = defineComponent({
  name: 'ProjectReviewTrend',
  setup () {
    let chartInstance = null
    const timeRange = ref({
      timeType: PeriodStatTypeEnum.THIS_MONTH,
    })
    const chartRef = ref<HTMLElement | null>(null)
    const chartData = {
      xAxis: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
      series: [15, 18, 20, 22, 25, 12, 10] // 工作日评审量较高，周末下降
    }
    const getData = async (): Promise<void> => {
      const res = await PZService.public.getPublicProjectIncubationProjectReviewTrendAnalysis(getTimeRangeInterval(timeRange.value.timeType), timeRange.value.timeType)
      if (res.length !== 0) {
        chartData.xAxis = res.map(item => item.time)
        chartData.series = res.map(item => item.count)
      }
      chartResize()
    }
    watch(()=>timeRange.value.timeType, getData)

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
          data: ['评审数量'],
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
          name: '时间',
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
          name: '评审数量',
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
          name: '评审数量',
          type: 'line',
          smooth: true,
          data: chartData.series,
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

    return (): JSX.Element => (
      <SubPanelTemplate v-slots={{
        extra: () => (
          <DateInlineForm v-model:modelValue={timeRange.value} timeList={[
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