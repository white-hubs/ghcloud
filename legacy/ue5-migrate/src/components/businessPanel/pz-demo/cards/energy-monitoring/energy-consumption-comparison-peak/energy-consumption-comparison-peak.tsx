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
  LegendComponent,
  MarkPointComponent,
  MarkLineComponent
} from 'echarts/components'
import { calcFontSize } from '@/utils/common'
import DateInlineForm from "@/components/businessPanel/public/dateInlineForm.vue";
import { PZService } from '../../../card-service/service'

use([
  CanvasRenderer,
  BarChart,
  GridComponent,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  MarkPointComponent,
  MarkLineComponent
])

export const EnergyConsumptionComparisonPeak = defineComponent({
  setup () {
    let chartInstance = null
    const chartRef = ref<HTMLElement | null>(null)
    const energyType = ref({
      timeType: 'WATER',
    })
    // 请替换为真实数据
    const chartDataMap = {
      xAxis: ['本园', '同类'],
      series: [120, 150]
    }
    const getData = async (): Promise<void> =>{
      // @ts-ignore
      const res = await PZService.energy.getSimilarBuildingPeakComparison(energyType.value.timeType)
      chartDataMap.series = [res.value ?? 0, res.sameTypeValue ?? 0]
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
          data: ['时长'],
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
          name: '能耗数/高峰总时长（分）',
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
          name: '时长',
          type: 'bar',
          data: currentData.series,
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#5470c6' },
              { offset: 1, color: 'rgba(84, 112, 198, 0)' }
            ])
          },
          barWidth: '40%'
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