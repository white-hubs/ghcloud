import { defineComponent, onMounted, onUnmounted, ref, watch } from 'vue'
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import * as echarts from 'echarts'
import { use } from 'echarts/core'
import { PieChart } from 'echarts/charts'
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
  PieChart,
  GridComponent,
  TitleComponent,
  TooltipComponent,
  LegendComponent
])

export const PropertyRepairEventCategoryStatistics = defineComponent({
  name: 'PropertyRepairEventCategoryStatistics',
  setup () {
    let chartInstance: echarts.ECharts | null = null
    const chartRef = ref<HTMLElement | null>(null)
    const timeRange = ref({
      timeType: PeriodStatTypeEnum.THIS_WEEK,
    })
    // 模拟不同分类事件数据
    const eventData = [
      { value: 0, name: '电力' },
      { value: 0, name: '卫生' },
      { value: 0, name: '空调' },
      { value: 0, name: '电梯' }
    ]
    const getData = async (): Promise<void> => {
      const res = await PZService.property.getPropertyComplaintRepairEventCategoryStatistics(getTimeRangeInterval(timeRange.value.timeType), timeRange.value.timeType)
      if (res.length) {
        eventData.length = 0
        for (const item of res) {
          eventData.push({
            value: item.count,
            name: item.name
          })
        }
      }
      chartResize()
    }

    const initChart = (el: HTMLElement): void => {
      chartInstance = echarts.init(el)
      chartInstance.setOption({
        tooltip: {
          trigger: 'item',
          formatter: '{a} <br/>{b}: {c} 件 ({d}%)',
          textStyle: {
            fontSize: calcFontSize(12)
          }
        },
        series: [
          {
            name: '事件分类',
            type: 'pie',
            radius: ['50%', '70%'],
            avoidLabelOverlap: false,
            label: {
              show: true,
              position: 'outside',
              formatter: '{b}: {d}%',
              fontSize: calcFontSize(12),
              color: '#ffffff'
            },
            emphasis: {
              label: {
                show: true,
                fontSize: calcFontSize(14),
                fontWeight: 'bold'
              }
            },
            labelLine: {
              show: true,
              lineStyle: {
                color: '#ffffff' // 设置线条颜色为白色
              }
            },
            data: eventData,
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
      getData()
      window.addEventListener('resize', chartResize)
    })

    onUnmounted(() => {
      if (chartInstance) {
        chartInstance.dispose()
      }
      window.removeEventListener('resize', chartResize)
    })

    watch(() => timeRange.value.timeType, getData)

    return (): JSX.Element => (
      <SubPanelTemplate v-slots={{
        extra: () => (
          <DateInlineForm v-model:modelValue={timeRange.value} timeList={[
            { label: "本周", value: "THIS_WEEK" },
            { label: "本月", value: "THIS_MONTH" },
            { label: "本季度", value: "THIS_QUARTER" },
            { label: "今年", value: "THIS_YEAR" }
          ]}></DateInlineForm>
        )
      }}>
        <div class='card-container-4' ref={chartRef}></div>
      </SubPanelTemplate>
    )
  }
})