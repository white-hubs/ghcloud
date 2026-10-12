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

export const EnergyConsumptionIndexRatio = defineComponent({
  setup () {
    let chartInstance = null
    const chartRef = ref<HTMLElement | null>(null)
    const energyType = ref({
      timeType: 'WATER',
    })
    const getData = async (): Promise<void>=>{
      // @ts-ignore
      const res = await PZService.energy.getEnergyRatioAnalysis(energyType.value.timeType)
      if (res.length){
        chartDataMap.length = 0
        res.forEach(item=>{
          chartDataMap.push({
            value: item.count,
            name: item.type
          })
        })
      }
      chartResize()
    }
    // 请替换为真实数据
    const chartDataMap = [
      { value: 0, name: '区域1' },
      { value: 0, name: '区域2' },
      { value: 0, name: '区域3' },
      { value: 0, name: '区域4' },
      { value: 0, name: '区域5' }
    ]


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
          name: '消耗总量',
          type: 'pie',
          radius: ['50%', '70%'],
          avoidLabelOverlap: false,
          label: {
            show: false,
            position: 'center'
          },
          emphasis: {
            label: {
              show: true,
              fontSize: calcFontSize(12),
              color: '#ffffff',
              fontWeight: 'bold',
              formatter: '{b}: {c} \n {d}%'
            }
          },
          labelLine: {
            show: false
          },
          data: chartDataMap
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

    watch(() => energyType.value.timeType, getData)

    return (): JSX.Element => (
      <SubPanelTemplate v-slots={{
        extra: () => (
          <DateInlineForm v-model:modelValue={energyType.value} timeList={[
            { label: "水", value: "WATER" },
            { label: "电", value: "ELECTRIC" },
            { label: "气", value: "GAS" }
          ]}></DateInlineForm>
        )
      }}>
        <div class='card-container-2' ref={chartRef}></div>
      </SubPanelTemplate>
    )
  }
})