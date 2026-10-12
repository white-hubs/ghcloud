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

export const PropertyRepairReceiverProcessRate = defineComponent({
  setup () {
    let chartInstance: echarts.ECharts | null = null
    const chartRef = ref<HTMLElement | null>(null)

    // 模拟处理人及其处理率数据
    const processRateData = [
      { name: '处理人A', processed: 0, total: 0 },
      { name: '处理人B', processed: 0, total: 0 },
      { name: '处理人C', processed: 0, total: 0 },
      { name: '处理人D', processed: 0, total: 0 }
    ]
    const getData = async (): Promise<void>=>{
      const res = await PZService.property.getPropertyComplaintRepairReceiverProcessingRate()
      if (res.length){
        processRateData.length = 0
        res.forEach(item=>{
          processRateData.push({
            name: item.name,
            processed: item.handlerCount,
            total: item.count
          })
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
          formatter: (params) => {
            const data = processRateData[params[0].dataIndex]
            return `${data.name}<br/>处理率: ${((data.processed / data.total) * 100).toFixed(2)}%`
          },
          textStyle: {
            fontSize: calcFontSize(12)
          }
        },
        grid: {
          left: calcFontSize(30),
          right: calcFontSize(0),
          top: calcFontSize(40),
          bottom: calcFontSize(20)
        },
        xAxis: {
          type: 'category',
          data: processRateData.map(item => item.name),
          axisLabel: {
            interval: 0,
            color: '#ffffff',
            fontSize: calcFontSize(12)
          },
          axisLine: {
            lineStyle: {
              color: '#ffffff'
            }
          },
          axisTick: {
            alignWithLabel: true
          }
        },
        yAxis: {
          type: 'value',
          name: '处理率 (%)',
          nameTextStyle: {
            color: '#ffffff',
            fontSize: calcFontSize(12)
          },
          axisLabel: {
            interval: 0,
            color: '#ffffff',
            fontSize: calcFontSize(12)
          },
          axisLine: {
            lineStyle: {
              color: '#ffffff'
            }
          },
          min: 0,
          max: 100
        },
        series: [
          {
            name: '处理率',
            type: 'bar',
            data: processRateData.map(item => (item.processed / item.total) * 100),
            itemStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: '#91cc75' },
                { offset: 1, color: '#5470c6' }
              ])
            },
            barWidth: '60%'
          }
        ]
      })
    }

    const chartResize = (): void => {
      chartInstance && chartInstance.dispose()
      setTimeout(() => {
        if (chartRef.value) {
          initChart(chartRef.value as HTMLElement)
        }
      }, 1000)
    }

    onMounted(() => {
      if (chartRef.value) {
        getData()
      }
      window.addEventListener('resize', chartResize)
    })

    onUnmounted(() => {
      window.removeEventListener('resize', chartResize)
      chartInstance?.dispose()
    })

    return (): JSX.Element => (
      <SubPanelTemplate>
        <div class='card-container-4' ref={chartRef}></div>
      </SubPanelTemplate>
    )
  }
})