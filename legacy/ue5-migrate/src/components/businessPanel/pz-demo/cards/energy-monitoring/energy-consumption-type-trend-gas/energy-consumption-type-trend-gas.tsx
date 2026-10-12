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
  MarkPointComponent,
  MarkLineComponent
} from 'echarts/components'
import { calcFontSize } from '@/utils/common'
import DateInlineForm from "@/components/businessPanel/public/dateInlineForm.vue";
import { PeriodStatTypeEnum } from '@ghcloud/cube-protocol'
import { PZService } from '../../../card-service/service'

use([
  CanvasRenderer,
  LineChart,
  GridComponent,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  MarkPointComponent,
  MarkLineComponent
])

export const EnergyConsumptionTypeTrendGas = defineComponent({
  setup () {
    let chartInstance = null
    const chartRef = ref<HTMLElement | null>(null)
    const timeRange = ref({
      timeType: PeriodStatTypeEnum.TODAY,
    })
    // 请替换为真实数据
    const chartDataMap = {
      xAxis: ['00:00', '03:00', '06:00', '09:00', '12:00', '15:00', '18:00', '21:00'],
      series: [120, 200, 150, 80, 70, 110, 130, 180]
    }
    const getData = async (): Promise<void> => {
      const res = await PZService.energy.getGasTrend(timeRange.value.timeType)
      chartDataMap.xAxis = res.map(item=>item.desc)
      chartDataMap.series = res.map(item=>item.value)
      if (timeRange.value.timeType === PeriodStatTypeEnum.THIS_WEEK){
        chartDataMap.xAxis = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
      }
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
          }
        },
        legend: {
          data: ['气能耗类型趋势'],
          right: 0,
          top: 0,
          textStyle: {
            fontSize: calcFontSize(12),
            color: '#ffffff'
          }
        },
        grid: {
          left: calcFontSize(50),
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
          data: currentData.xAxis,
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
          name: '气能耗值',
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
          name: '气能耗类型趋势',
          type: 'line',
          smooth: true,
          data: currentData.series,
          markPoint: {
            data: [
              { type: 'max', name: '最高峰' },
              { type: 'min', name: '最低峰' }
            ],
            label: {
              fontSize: calcFontSize(12)
            }
          },
          itemStyle: {
            color: '#5470c6'
          },
          lineStyle: {
            width: 3,
            color: '#5470c6'
          },
          symbolSize: 8,
          // 添加 areaStyle 属性实现颜色渐变
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(84, 112, 198, 0.5)' }, // 折线颜色的半透明版本
              { offset: 1, color: 'rgba(84, 112, 198, 0)' } // 透明
            ])
          }
        }],
        dataZoom: chartDataMap.xAxis.length > 7 ? [
          {
            type: 'slider',
            start: 0,
            end: 15
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
