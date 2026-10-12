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
import { PeriodStatTypeEnum } from '@ghcloud/cube-protocol'
import { getTimeRangeInterval, PZService } from '../../../card-service/service'

use([
  CanvasRenderer,
  LineChart,
  GridComponent,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  MarkPointComponent
])

export const VehiclePassageAnalysis = defineComponent({
  name: 'VehiclePassageAnalysis',
  setup () {
    let chartInstance = null
    const chartRef = ref<HTMLElement | null>(null)
    const timeRange = ref({
      timeType: PeriodStatTypeEnum.TODAY,
    })
    const chartData = {
      xAxis: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00'],
      series: []
    }
    const getData = async (): Promise<void> => {
      const res = await PZService.property.getPropertyVehiclePassageAnalysis(getTimeRangeInterval(timeRange.value.timeType), timeRange.value.timeType)
      if (res.length > 0) {
        chartData.xAxis = res.map(item => item.time)
        chartData.series = res.map(item => item.count)
      }
      if (timeRange.value.timeType === PeriodStatTypeEnum.THIS_WEEK){
        chartData.xAxis = ['周一', '周二', '周三', '周四', '周五', '周六', '周天']
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
          data: ['通行数量'],
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
          name: '通行数量',
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
          name: '通行数量',
          type: 'line',
          smooth: true,
          data: chartData.series,
          markPoint: {
            data: [
              { type: 'max', name: '高峰时段' }
            ],
            label: {
              show: true,
              color: '#ffffff',
              fontSize: calcFontSize(12)
            }
          },
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#FF9A9E' },
              { offset: 1, color: '#FAD0C4' }
            ])
          },
          lineStyle: {
            width: 3,
            color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
              { offset: 0, color: '#FF9A9E' },
              { offset: 1, color: '#FAD0C4' }
            ])
          },
          symbolSize: 8,
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(255, 154, 158, 0.5)' },
              { offset: 1, color: 'rgba(250, 208, 196, 0.1)' }
            ])
          }
        }],
        dataZoom: [PeriodStatTypeEnum.TODAY, PeriodStatTypeEnum.THIS_MONTH].includes(timeRange.value.timeType) ? [
          {
            type: 'slider',
            start: 0,
            end: 33
          },
        ] : []
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

    watch(()=>timeRange.value.timeType, getData)

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