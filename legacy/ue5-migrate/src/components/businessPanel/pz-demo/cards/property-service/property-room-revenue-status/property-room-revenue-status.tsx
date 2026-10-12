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

export const PropertyRoomRevenueStatus = defineComponent({
  name: 'PropertyRoomRevenueStatus',
  setup () {
    let chartInstance = null
    const chartRef = ref<HTMLElement | null>(null)
    const timeRange = ref({
      timeType: PeriodStatTypeEnum.THIS_WEEK,
    })
    const chartData = {
      xAxis: ['会议室A', '会议室B', '会议室C', '会议室D'],
      series: []
    }
    const getData = async (): Promise<void> => {
      const res = await PZService.property.getPropertyMeetingRoomRevenueStatus(getTimeRangeInterval(timeRange.value.timeType), timeRange.value.timeType)
      if (res.length){
        chartData.xAxis.length = 0
        res.forEach(item => {
          chartData.xAxis.push(item.name)
          chartData.series.push(item.amount)
        })
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
          data: ['营收金额'],
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
          top: calcFontSize(50),
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
          name: '营收金额（元）',
          axisLabel: {
            interval: 0,
            color: '#ffffff',
            fontSize: calcFontSize(12)
          },
          nameTextStyle: {
            color: '#ffffff',
            fontSize: calcFontSize(12)
          },
          min: 0 // 确保Y轴从0开始
        },
        series: [{
          name: '营收金额',
          type: 'bar',
          data: chartData.series,
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#ff6b6b' },
              { offset: 1, color: '#4ecdc4' }
            ])
          },
          barWidth: '60%'
        }],
        dataZoom: chartData.xAxis.length > 3 ? [{
          type: 'slider',
          show: true,
          start: 0,
          end: 50,
          textStyle: {
            color: '#ffffff'
          }
        }] : []
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

    watch(() => timeRange.value.timeType, () => {
      if (timeRange.value.timeType === 'THIS_WEEK') {
        chartData.xAxis = ['会议室A', '会议室B', '会议室C', '会议室D']
        chartData.series = [1500, 2000, 1800, 2500]
      } else if (timeRange.value.timeType === 'THIS_MONTH') {
        chartData.xAxis = ['会议室A', '会议室B', '会议室C', '会议室D']
        chartData.series = [5000, 6000, 5500, 7000]
      } else if (timeRange.value.timeType === 'THIS_QUARTER') {
        chartData.xAxis = ['会议室A', '会议室B', '会议室C', '会议室D']
        chartData.series = [12000, 13000, 12500, 14000]
      } else if (timeRange.value.timeType === 'THIS_YEAR') {
        chartData.xAxis = ['会议室A', '会议室B', '会议室C', '会议室D']
        chartData.series = [50000, 55000, 53000, 60000]
      }
      chartResize()
    })

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
        <div class='card-container-2' ref={chartRef}></div>
      </SubPanelTemplate>
    )
  }
})