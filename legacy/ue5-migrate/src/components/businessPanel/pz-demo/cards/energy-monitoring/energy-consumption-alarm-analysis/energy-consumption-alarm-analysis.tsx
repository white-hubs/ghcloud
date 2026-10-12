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
import { PZService } from '../../../card-service/service'

use([
  PieChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent
])

export const EnergyConsumptionAlarmAnalysis = defineComponent({
  setup () {
    let chartInstance = null
    const chartRef = ref<HTMLElement | null>(null)
    const statusType = ref({
      timeType: "1", // 处理中
    })
    const chartData = [
      { value: 0, name: '水' },
      { value: 0, name: '电' },
      { value: 0, name: '气' }
    ]

    const getData = async (): Promise<void> => {
      const res = await PZService.energy.getAlarmEventAnalysis(parseInt(statusType.value.timeType))
      if (res.length){
        chartData.length = 0
        for (let i = 0; i < res.length; i++) {
          chartData.push({
            value: res[i].count,
            name: res[i].typeDesc
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
            fontSize: calcFontSize(14),
            color: '#ffffff'
          },
          emphasis: {
            label: {
              show: true,
              fontSize: calcFontSize(14),
              formatter: '{b}\n{d}%',
              color: '#ffffff',
              fontWeight: 'bold'
            }
          },
          labelLine: {
            lineStyle: {
              color: '#ffffff'
            },
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

    watch(() => statusType.value.timeType, getData)

    return (): JSX.Element => (
      <SubPanelTemplate v-slots={{
        extra: () => (
          <DateInlineForm v-model:modelValue={statusType.value} timeList={[
            { label: "处理中", value: "1" },
            { label: "待处理", value: "0" },
            { label: "已挂起", value: "2" }
          ]}></DateInlineForm>
        )
      }}>
        <div class='card-container-3' ref={chartRef}></div>
      </SubPanelTemplate>
    )
  }
})