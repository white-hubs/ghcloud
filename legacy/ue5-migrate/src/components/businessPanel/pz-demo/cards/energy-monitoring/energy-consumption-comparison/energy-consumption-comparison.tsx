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
import { PZService } from '../../../card-service/service'

use([
  CanvasRenderer,
  BarChart,
  GridComponent,
  TitleComponent,
  TooltipComponent,
  LegendComponent
])

export const EnergyConsumptionComparison = defineComponent({
  setup () {
    let chartInstance = null
    const chartRef = ref<HTMLElement | null>(null)
    const energyType = ref({
      timeType: 'WATER',
    })
    // 请替换为真实数据
    const chartDataMap = {
      xAxis: ['本园区', '同类建筑'],
      series: [50, 60]
    }
    const getData = async (): Promise<void> =>{
      // @ts-ignore
      const res = await PZService.energy.getSimilarBuildingEnergyComparison(energyType.value.timeType)
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
          data: ['能耗数'],
          right: 0,
          top: 0,
          textStyle: {
            fontSize: calcFontSize(12),
            color: '#ffffff'
          }
        },
        grid: {
          left: calcFontSize(30),
          right: calcFontSize(45),
          top: calcFontSize(40),
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
          axisLabel: {
            interval: 0,
            color: '#ffffff',
            fontSize: calcFontSize(12)
          },
          nameTextStyle: {
            color: '#ffffff',
            fontSize: calcFontSize(12)
          },
          type: 'category',
          data: currentData.xAxis,
          name: '',
        },
        yAxis: {
          type: 'value',
          name: '能耗数',
          axisLabel: {
            interval: 0,
            color: '#ffffff',
            fontSize: calcFontSize(12)
          },
          nameTextStyle: {
            color: '#ffffff',
            fontSize: calcFontSize(12)
          },
        },
        series: [{
          name: '能耗数',
          type: 'bar',
          data: currentData.series,
          itemStyle: {
            // 设置颜色渐变
            color: new echarts.graphic.LinearGradient(
              0, 0, 0, 1, // 渐变起点和终点位置，这里是从上到下
              [
                { offset: 0, color: '#5470c6' }, // 渐变起始颜色
                { offset: 1, color: '#324e9f00' } // 渐变结束颜色
              ]
            )
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