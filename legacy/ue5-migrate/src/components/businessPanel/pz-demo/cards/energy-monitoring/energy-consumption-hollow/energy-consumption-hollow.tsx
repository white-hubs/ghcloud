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

export const EnergyConsumptionHollow = defineComponent({
  setup () {
    let chartInstance = null
    const chartRef = ref<HTMLElement | null>(null)
    // 请替换为真实的环比和同比数据
    const chartData = {
      monthOnMonth: [
        { value: 0, name: '区域A' },
        { value: 0, name: '区域B' },
        { value: 0, name: '区域C' },
        { value: 0, name: '区域D' },
        { value: 0, name: '区域E' }
      ],
      yearOnYear: [
        { value: 0, name: '区域A' },
        { value: 0, name: '区域B' },
        { value: 0, name: '区域C' },
        { value: 0, name: '区域D' },
        { value: 0, name: '区域E' }
      ]
    }
    const getData = async (): Promise<void> => {
      const res = await PZService.energy.getEnergyAreaRatio();
      chartData.yearOnYear = res.yearOnYear.map(item=>{
        return {
          value: item.count,
          name: item.areaName
        }
      })
      chartData.monthOnMonth = res.chainRatio.map(item=>{
        return {
          value: item.count,
          name: item.areaName
        }
      })
      chartRef.value && initChart(chartRef.value as HTMLElement)
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
        series: [
          {
            name: '环比',
            type: 'pie',
            radius: ['30%', '45%'],
            data: chartData.monthOnMonth,
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
          },
          {
            name: '同比',
            type: 'pie',
            radius: ['50%', '65%'],
            data: chartData.yearOnYear,
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