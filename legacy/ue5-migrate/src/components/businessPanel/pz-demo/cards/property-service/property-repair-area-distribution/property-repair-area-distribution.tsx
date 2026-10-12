import { defineComponent, onMounted, onUnmounted, ref, watch } from 'vue'
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue"
import DateInlineForm from "@/components/businessPanel/public/dateInlineForm.vue"
import * as echarts from 'echarts'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { PieChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent
} from 'echarts/components'
import { calcFontSize } from '@/utils/common'
import { PeriodStatTypeEnum } from '@ghcloud/cube-protocol'
import { getTimeRangeInterval, PZService } from '../../../card-service/service'

use([
  CanvasRenderer,
  PieChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent
])

export const PropertyRepairAreaDistribution = defineComponent({
  name: 'PropertyRepairAreaDistribution',
  setup () {
    let chartInstance = null
    const chartRef = ref<HTMLElement | null>(null)
    const timeRange = ref({
      timeType: PeriodStatTypeEnum.THIS_MONTH,
    })
    const getData = async (): Promise<void>=>{
      const res = await PZService.property.getPropertyComplaintRepairAreaDistribution(getTimeRangeInterval(timeRange.value.timeType), timeRange.value.timeType)
      if (res.length){
        chartData.length = 0
        res.forEach(item=>{
          chartData.push({
            value: item.count,
            name: item.name
          })
        })
      }
      chartResize()
    }

    // 模拟数据
    const chartData = [
      { value: 0, name: 'A区' },
      { value: 0, name: 'B区' },
      { value: 0, name: 'C区' },
      { value: 0, name: 'D区' },
      { value: 0, name: 'E区' }
    ]

    const updateChart = (): void => {
      if (!chartInstance) return

      const currentData = chartData
      const total = currentData.reduce((sum, item) => sum + item.value, 0)

      chartInstance.setOption({
        tooltip: {
          trigger: 'item',
          formatter: function (params) {
            const percentage = ((params.value / total) * 100).toFixed(1)
            return `${params.name}<br/>报修数量: ${params.value}个<br/>占比: ${percentage}%`
          },
          textStyle: {
            fontSize: calcFontSize(12)
          }
        },
        series: [
          {
            type: 'pie',
            radius: ['40%', '70%'],
            center: ['40%', '50%'],
            avoidLabelOverlap: false,
            label: {
              show: true,
              position: 'outside',
              formatter: '{b}: {c}个',
              color: '#ffffff',
              fontSize: calcFontSize(12)
            },
            labelLine: {
              lineStyle: {
                color: '#ffffff'
              }
            },
            emphasis: {
              label: {
                show: true,
                fontSize: calcFontSize(14),
                fontWeight: 'bold'
              }
            },
            data: currentData,
            color: [
              '#3b82f6',
              '#8b5cf6',
              '#10b981',
              '#f59e0b',
              '#ef4444'
            ]
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
      <SubPanelTemplate title='物业报修区域分布' v-slots={{
        extra: () => (
          <DateInlineForm v-model:modelValue={timeRange.value} timeList={[
            { label: "本周", value: "THIS_WEEK" },
            { label: "本月", value: "THIS_MONTH" },
            { label: "本季度", value: "THIS_QUARTER" },
            { label: "今年", value: "THIS_YEAR" }
          ]}></DateInlineForm>
        )
      }}>
        <div class='card-container-3' ref={chartRef} ></div>
      </SubPanelTemplate>
    )
  }
})