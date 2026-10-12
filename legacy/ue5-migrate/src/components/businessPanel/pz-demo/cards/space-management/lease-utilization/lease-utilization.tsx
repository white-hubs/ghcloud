import { defineComponent, onMounted, onUnmounted, ref } from 'vue'
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import * as echarts from 'echarts'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { GaugeChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent
} from 'echarts/components'
import { calcFontSize } from '@/utils/common'

use([
  CanvasRenderer,
  GaugeChart,
  TitleComponent,
  TooltipComponent
])

export const LeaseUtilization = defineComponent({
  setup () {
    let chartInstance = null
    const chartRef = ref<HTMLElement | null>(null)
    const availableSpaces = 100
    const leasedSpaces = 75
    const utilizationRate = (leasedSpaces / availableSpaces * 100).toFixed(2)

    const initChart = (el: HTMLElement): void => {
      chartInstance = echarts.init(el)
      chartInstance.setOption({
        tooltip: {
          formatter: `可租空间: ${availableSpaces}<br/>已租空间: ${leasedSpaces}<br/>租赁利用率: ${utilizationRate}%`,
          textStyle: {
            fontSize: calcFontSize(12),
          }
        },
        series: [
          {
            type: 'gauge',
            center: ['50%', '60%'], // 调整仪表盘整体位置
            startAngle: 200,
            endAngle: -20,
            min: 0,
            max: 100,
            splitNumber: 10,
            itemStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
                { offset: 0, color: '#91cc75' },
                { offset: 1, color: '#5470c6' }
              ])
            },
            progress: {
              show: true,
              width: 30
            },
            pointer: {
              show: false
            },
            axisLine: {
              lineStyle: {
                width: 30,
              }
            },
            axisTick: {
              distance: -35,
              splitNumber: 5,
              lineStyle: {
                width: 2,
                color: '#ffffff'
              }
            },
            splitLine: {
              distance: -42,
              length: 14,
              lineStyle: {
                width: 3,
                color: '#ffffff'
              }
            },
            axisLabel: {
              distance: -10,
              color: '#ffffff',
              fontSize: calcFontSize(10)
            },
            anchor: {
              show: false
            },
            title: {
              show: false
            },
            detail: {
              valueAnimation: true,
              width: '60%',
              lineHeight: 40,
              borderRadius: 8,
              offsetCenter: [0, '-15%'],
              fontSize: calcFontSize(20),
              fontWeight: 'bolder',
              formatter: '{value}%',
              color: '#fff'
            },
            data: [
              {
                value: utilizationRate
              }
            ]
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
      chartRef.value && initChart(chartRef.value as HTMLElement)
      window.addEventListener('resize', chartResize)
    })
    onUnmounted(() => {
      chartInstance && chartInstance.dispose()
      window.removeEventListener('resize', chartResize)
    })

    return (): JSX.Element => (
      <SubPanelTemplate>
        <div class='card-container-4' ref={chartRef} ></div>
      </SubPanelTemplate>
    )
  }
})