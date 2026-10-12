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

export const EnergyConsumptionComparisonTimeTrend = defineComponent({
  setup () {
    let chartInstance = null
    const chartRef = ref<HTMLElement | null>(null)
    const energyType = ref({
      timeType: 'WATER',
    })
    // 请替换为真实数据
    const chartDataMap = {
      xAxis: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
      series: [
        {
          name: '本园',
          data: []
        },
        {
          name: '同类',
          data: []
        }
      ]
    }
    const getData = async (): Promise<void>=>{
      // @ts-ignore
      const res = await PZService.energy.getSimilarBuildingEnergyTimeTrendComparison(energyType.value.timeType)
      chartDataMap.xAxis = res.map(item=>item.time)
      chartDataMap.series[0].data = res.map(item=>item.value)
      chartDataMap.series[1].data = res.map(item=>item.sameTypeValue)
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
          data: ['本园', '同类'],
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
          name: '能耗量',
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
        series: currentData.series.map((item, index) => ({
          ...item,
          type: 'line',
          smooth: true,
          markPoint: {
            data: [
              { type: 'max', name: '最高峰' },
              { type: 'min', name: '最低峰' }
            ],
            label: {
              fontSize: calcFontSize(12),
              color: '#ffffff'
            }
          },
          lineStyle: {
            width: 3,
            color: index === 0 ? '#5470c6' : '#91cc75'
          },
          symbolSize: 8,
          // 添加 areaStyle 实现填充渐变
          areaStyle: {
            color: new echarts.graphic.LinearGradient(
              0, 0, 0, 1, // 从顶部到底部的渐变
              index === 0
                ? [
                  { offset: 0, color: 'rgba(84, 112, 198, 0.8)' }, // 起始颜色保持一定透明度
                  { offset: 1, color: 'rgba(84, 112, 198, 0)' } // 渐变至透明
                ]
                : [
                  { offset: 0, color: 'rgba(145, 204, 117, 0.8)' }, // 起始颜色保持一定透明度
                  { offset: 1, color: 'rgba(145, 204, 117, 0)' } // 渐变至透明
                ]
            )
          }
        })),
        dataZoom: chartDataMap.xAxis.length > 7 ? [
          {
            start: 0,
            end: 20
          }
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