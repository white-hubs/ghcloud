import { defineComponent, onMounted, onUnmounted, ref, watch } from 'vue'
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import * as echarts from 'echarts'
import { use } from 'echarts/core'
import { PieChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent
} from 'echarts/components'
import { calcFontSize } from '@/utils/common'
import DateInlineForm from "@/components/businessPanel/public/dateInlineForm.vue";
import { PeriodStatTypeEnum } from '@ghcloud/cube-protocol'
import { PZService } from '../../../card-service/service'

use([
  PieChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent
])

export const EnergyConsumptionAlarmLevel = defineComponent({
  setup () {
    let chartInstance = null
    const chartRef = ref<HTMLElement | null>(null)
    const timeRange = ref({
      timeType: PeriodStatTypeEnum.TODAY,
    })
    const chartData = [
      { value: 335, name: '低级别报警' },
      { value: 310, name: '中级别报警' },
      { value: 234, name: '高级别报警' }
    ]
    const getData = async (): Promise<void> => {
      const res = await PZService.energy.getAlarmLevelStatistics(timeRange.value.timeType)
      chartData.length = 0
      res.forEach(item=>{
        chartData.push({
          value: item.count,
          name: item.levelDesc
        })
      })
      chartResize()
    }

    const initChart = (el: HTMLElement): void => {
      chartInstance = echarts.init(el)
      chartInstance.setOption({
        tooltip: {
          trigger: 'item',
          textStyle: {
            fontSize: calcFontSize(12),
          }
        },
        legend: {
          orient: 'vertical',
          left: 'left',
          textStyle: {
            fontSize: calcFontSize(12),
            color: '#ffffff'
          }
        },
        series: [{
          name: '报警数量',
          type: 'pie',
          radius: ['50%', '70%'],
          avoidLabelOverlap: false,
          label: {
            show: false,
            formatter: '{b}\n{d}%',
            color: '#ffffff'
          },
          emphasis: {
            label: {
              show: true,
              fontSize: calcFontSize(12),
              fontWeight: 'bold',
              formatter: '{b}\n{d}%',
              color: '#ffffff'
            }
          },
          labelLine: {
            show: false
          },
          data: chartData
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