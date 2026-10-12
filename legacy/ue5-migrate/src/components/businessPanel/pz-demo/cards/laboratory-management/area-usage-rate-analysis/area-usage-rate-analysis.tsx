import { defineComponent, onMounted, onUnmounted, ref } from 'vue'
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import * as echarts from 'echarts'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { PieChart } from 'echarts/charts'
import {
  GridComponent,
  TitleComponent,
  TooltipComponent,
  LegendComponent
} from 'echarts/components'
import { calcFontSize } from '@/utils/common'
import { PZService } from '../../../card-service/service'

use([
  CanvasRenderer,
  PieChart,
  GridComponent,
  TitleComponent,
  TooltipComponent,
  LegendComponent
])

export const AreaUsageRateAnalysis = defineComponent({
  setup () {
    let chartInstance = null
    const chartRef = ref<HTMLElement | null>(null)
    // 请替换为真实的不同区域使用率数据
    const chartData = [
      { value: 335, name: '区域 A' },
      { value: 310, name: '区域 B' },
      { value: 234, name: '区域 C' },
      { value: 135, name: '区域 D' },
      { value: 1548, name: '区域 E' }
    ]
    const getData = async (): Promise<void> => {
      const res = await PZService.laboratory.getAreaUsageAnalysis()
      chartData.length = 0
      for (const item of res) {
        chartData.push({
          value: item.usageRate,
          name: item.areaName
        })
      }
      chartRef.value && initChart(chartRef.value as HTMLElement)
    }

    const initChart = (el: HTMLElement): void => {
      chartInstance = echarts.init(el)
      chartInstance.setOption({
        tooltip: {
          trigger: 'item',
          textStyle: {
            fontSize: calcFontSize(12),
          },
          formatter: '{a} <br/>{b} : {d}%'
        },
        legend: {
          orient: 'vertical',
          left: 'left',
          textStyle: {
            color: '#ffffff',
            fontSize: calcFontSize(12)
          }
        },
        series: [
          {
            name: '区域使用率',
            type: 'pie',
            radius: '50%',
            data: chartData,
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)'
              }
            },
            label: {
              show: true,
              fontSize: calcFontSize(12),
              color: '#ffffff'
            },
            labelLine: {
              show: true,
              lineStyle: {
                color: '#ffffff'
              }
            },
            itemStyle: {
              color: (params): string => {
                const colorList = [
                  '#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de'
                ];
                return colorList[params.dataIndex % colorList.length];
              }
            }
          }
        ]
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

    return (): JSX.Element => (
      <SubPanelTemplate>
        <div class='card-container-3' ref={chartRef}></div>
      </SubPanelTemplate>
    )
  }
})