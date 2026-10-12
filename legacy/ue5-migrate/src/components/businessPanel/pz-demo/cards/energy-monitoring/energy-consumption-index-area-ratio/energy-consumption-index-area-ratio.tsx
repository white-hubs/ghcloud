import { defineComponent, onMounted, onUnmounted, ref } from 'vue'
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
import { PZService } from '../../../card-service/service'

use([
  CanvasRenderer,
  BarChart,
  GridComponent,
  TitleComponent,
  TooltipComponent,
  LegendComponent
])

export const EnergyConsumptionIndexAreaRatio = defineComponent({
  setup () {
    let chartInstance = null
    const chartRef = ref<HTMLElement | null>(null)
    // 请替换为真实数据
    const chartData = {
      xAxis: ['区域1', '区域2', '区域31'], // 一级区域
      series: [
        {
          name: '水',
          data: [10, 20, 15] // 各区域单位面积水消耗量
        },
        {
          name: '电',
          data: [30, 40, 35] // 各区域单位面积电消耗量
        },
        {
          name: '气',
          data: [5, 8, 6] // 各区域单位面积气消耗量
        }
      ]
    }
    const getData = async (): Promise<void>=>{
      const res = await PZService.energy.getEnergyPerUnitAreaRatioAnalysis()
      chartData.xAxis = Object.keys(res)
      chartData.series.length = 0
      for (const key in res) {
        const element = res[key];
        element.forEach(item=>{
          const find = chartData.series.find(e=>e.name === item.type)
          if (!find){
            chartData.series.push({
              name: item.type,
              data: [item.count]
            })
          } else {
            find.data.push(item.count)
          }
        })
      }
      chartRef.value && initChart(chartRef.value as HTMLElement)
    }

    const initChart = (el: HTMLElement): void => {
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
          data: ['水', '电', '气'],
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
          data: chartData.xAxis,
        },
        yAxis: {
          type: 'value',
          name: '单位面积消耗量',
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
        series: chartData.series.map((item, index) => ({
          ...item,
          type: 'bar',
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: index === 0 ? '#188df0' : index === 1 ? '#91cc75' : '#fac858' },
              { offset: 1, color: index === 0 ? 'rgba(24, 141, 240, 0)' : index === 1 ? 'rgba(145, 204, 117, 0)' : 'rgba(250, 200, 88, 0)' }
            ])
          },
          emphasis: {
            itemStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: index === 0 ? '#2378f7' : index === 1 ? '#73c0de' : '#ee6666' },
                { offset: 1, color: index === 0 ? 'rgba(35, 120, 247, 0)' : index === 1 ? 'rgba(115, 192, 222, 0)' : 'rgba(238, 102, 102, 0)' }
              ])
            }
          }
        }))
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
        <div class='card-container-2' ref={chartRef}></div>
      </SubPanelTemplate>
    )
  }
})