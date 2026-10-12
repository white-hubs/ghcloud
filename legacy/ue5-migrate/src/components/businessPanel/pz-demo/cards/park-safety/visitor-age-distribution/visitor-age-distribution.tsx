import { defineComponent, onMounted, onUnmounted, ref } from 'vue'
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue"
import * as echarts from 'echarts'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { PieChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent
} from 'echarts/components'
import { calcFontSize } from '@/utils/common'
import { PZService } from '../../../card-service/service'

use([
  CanvasRenderer,
  PieChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent
])

export const VisitorAgeDistribution = defineComponent({
  name: 'VisitorAgeDistribution',
  setup () {
    let chartInstance = null
    const chartRef = ref<HTMLElement | null>(null)

    // 模拟数据
    let ageData: {
      value: number;
      name: string;
      min?: number;
      max?: number;
    }[] = [
      { value: 15, name: '18岁以下', min: 0, max: 18 },
      { value: 45, name: '18-30岁', min: 18, max: 30 },
      { value: 30, name: '30-50岁', min: 30, max: 50 },
      { value: 10, name: '50岁以上', min: 50, max: Infinity }
    ]

    const getData = async (): Promise<void>=>{
      const result = await PZService.parkSafety.getVisitorInfoEntryAndAgeStat()
      ageData = ageData.map(item=>{
        const count = result.reduce((sum, cur) =>{
          if (cur.age >= item.min && cur.age <= item.max){
            return sum + item.value
          } else {
            return sum
          }
        }, 0)
        return {
          value: count,
          name: item.name,
        }
      })

      // processorData = result.map(item=>{
      //   return {
      //     name: item.personnelLevel + '级安全员',
      //     value: item.personnelLevelCount,
      //     level: item.personnelLevel + '级'
      //   }
      // })
      updateChart()
    }
    const updateChart = (): void => {
      const total = ageData.reduce((sum, item) => sum + item.value, 0)
      const option = {
        backgroundColor: 'transparent',
        tooltip: {
          trigger: 'item',
          formatter: (params): string => {
            const percentage = ((params.value / total) * 100).toFixed(1)
            return `${params.name}<br/>数量：${params.value}<br/>占比：${percentage}%`
          }
        },
        series: [
          {
            type: 'pie',
            radius: ['30%', '50%'],
            center: ['50%', '50%'],
            avoidLabelOverlap: false,
            labelLine: {
              show: true,
              length: 15,
              length2: 20,
              smooth: true,
              lineStyle: {
                width: 1,
                type: 'solid'
              }
            },
            label: {
              show: true,
              position: 'outside',
              formatter: (params): string => {
                const percent = ((params.value / total) * 100).toFixed(1)
                return `${params.value}人\n${percent}%`
              },
              color: '#ffffff',
              fontSize: calcFontSize(12),
              lineHeight: 16,
              padding: [4, 8]
            },
            emphasis: {
              label: {
                show: true,
                fontSize: calcFontSize(14),
                fontWeight: 'bold'
              }
            },
            data: ageData,
            color: ['#60a5fa', '#34d399', '#f59e0b', '#f472b6']
          }
        ]
      }

      chartInstance?.setOption(option)
    }

    const initChart = (): void => {
      if (chartRef.value) {
        chartInstance = echarts.init(chartRef.value as HTMLElement)
        updateChart()
      }
    }

    const handleResize = (): void => {
      chartInstance?.resize()
    }

    onMounted(() => {
      initChart()
      getData()
      window.addEventListener('resize', handleResize)
    })

    onUnmounted(() => {
      chartInstance?.dispose()
      window.removeEventListener('resize', handleResize)
    })

    return (): JSX.Element => (
      <SubPanelTemplate title='访客年龄分布'>
        <div class='card-container-2' ref={chartRef}></div>
      </SubPanelTemplate>
    )
  }
})