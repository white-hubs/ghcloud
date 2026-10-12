import { defineComponent, onMounted, onUnmounted, ref, watch } from 'vue'
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import DateInlineForm from "@/components/businessPanel/public/dateInlineForm.vue";
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
import { getTimeRangeInterval, PZService } from '../../../card-service/service'
import { PeriodStatTypeEnum } from '@ghcloud/cube-protocol'

use([
  CanvasRenderer,
  BarChart,
  GridComponent,
  TitleComponent,
  TooltipComponent,
  LegendComponent
])

export const PropertyRepairWorkOrderTypeStatistics = defineComponent({
  name: 'PropertyRepairWorkOrderTypeStatistics',
  setup () {
    let chartInstance = null
    const chartRef = ref<HTMLElement | null>(null)
    const timeRange = ref({
      timeType: PeriodStatTypeEnum.THIS_MONTH,
    })

    // 模拟数据
    const chartData = {
      values: [],
      total: 0
    }
    const orderTypes = ['水电维修', '门窗维修', '空调维修', '电梯故障', '公共设施', '清洁服务', '其他']
    const getData = async (): Promise<void> => {
      const res = await PZService.property.getPropertyComplaintRepairEventCategoryStatistics(getTimeRangeInterval(timeRange.value.timeType), timeRange.value.timeType)
      if (res.length){
        orderTypes.length = 0
        orderTypes.push(...res.map(item => item.name))
        chartData.values.length = 0
        chartData.values.push(...res.map(item => item.count))
        chartData.total = res.reduce((acc, cur) => acc + cur.count, 0)
      }
      chartResize()
    }
    const updateChart = (): void => {
      if (!chartInstance) return

      const currentData = chartData

      chartInstance.setOption({
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          },
          formatter: function (params) {
            const value = params[0].value
            const percentage = ((value / currentData.total) * 100).toFixed(1)
            return `${params[0].name}<br/>工单数量: ${value}个<br/>占比: ${percentage}%`
          },
          textStyle: {
            fontSize: calcFontSize(12)
          }
        },
        grid: {
          left: calcFontSize(0),
          right: calcFontSize(10),
          top: calcFontSize(40),
          bottom: calcFontSize(0),
          containLabel: true
        },
        xAxis: {
          type: 'category',
          data: orderTypes,
          axisLabel: {
            interval: 'auto', // 设置为'auto'让echarts自动计算间隔，避免标签重叠
            rotate: 0, // 可以设置为一定角度，比如30，使标签倾斜显示
            color: '#ffffff',
            fontSize: calcFontSize(12)
          },
          axisLine: {
            lineStyle: {
              color: '#ffffff'
            }
          },
          axisTick: {
            alignWithLabel: true,
            lineStyle: {
              color: '#ffffff'
            }
          }
        },
        yAxis: {
          type: 'value',
          name: '工单数量（个）',
          nameTextStyle: {
            color: '#ffffff',
            fontSize: calcFontSize(12),
            padding: [0, 0, 0, calcFontSize(30)]
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
          },
        },
        series: [
          {
            type: 'bar',
            data: currentData.values,
            barWidth: calcFontSize(30),
            itemStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: '#10b981' },
                { offset: 1, color: '#059669' }
              ]),
              borderRadius: [calcFontSize(4), calcFontSize(4), 0, 0]
            },
            emphasis: {
              itemStyle: {
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                  { offset: 0, color: '#34d399' },
                  { offset: 1, color: '#10b981' }
                ])
              }
            },
            label: {
              show: true,
              position: 'top',
              color: '#ffffff',
              fontSize: calcFontSize(12)
            }
          }
        ]
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
      <SubPanelTemplate title='物业报修工单类型统计' v-slots={{
        extra: () => (
          <DateInlineForm v-model:modelValue={timeRange.value} timeList={[
            { label: "本月", value: PeriodStatTypeEnum.THIS_MONTH },
            { label: "本季度", value: PeriodStatTypeEnum.THIS_QUARTER },
            { label: "今年", value: PeriodStatTypeEnum.THIS_YEAR }
          ]}></DateInlineForm>
        )
      }}>
        <div class='card-container-4' ref={chartRef} ></div>
      </SubPanelTemplate>
    )
  }
})