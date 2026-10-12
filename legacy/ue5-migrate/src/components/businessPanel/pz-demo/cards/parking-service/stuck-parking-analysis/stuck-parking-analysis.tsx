import { defineComponent, ref, onMounted, onUnmounted } from 'vue'
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue"
import * as echarts from 'echarts'
import { use } from 'echarts/core'
import { PieChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent
} from 'echarts/components'
import { calcFontSize } from '@/utils/common'
import { PZService } from '../../../card-service/service'

use([
  PieChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent
])

interface StuckParkingData {
  name: string;
  value: number;
  ratio: number;
  itemStyle: {
    normal: {
      color: string;
    };
  };
}

export const StuckParkingAnalysis = defineComponent({
  name: 'StuckParkingAnalysis',
  setup () {
    let chartInstance = null
    const chartRef = ref(null)
    const parkingData = ref<StuckParkingData[]>([])

    const getData = async (): Promise<{ name: string; value: number; }[]> => {
      try {
        const result = await PZService.parking.getStayedParkingAnalysis()
        const data = result?.map(item => ({
          name: item.areaName,
          value: item.remainingParkCount,
        }))
        return data
      } catch {
      }
    }
    // 模拟获取滞留车辆数据，实际项目中替换为真实API调用
    const fetchStuckParkingData = async (): Promise<void> => {
      // 这里替换为实际API调用
      const colors = ['#F59E0B', '#EF4444', '#3B82F6', '#10B981', '#8B5CF6']
      let data = [
        { name: 'A区', value: 15 },
        { name: 'B区', value: 8 },
        { name: 'C区', value: 12 },
        { name: 'D区', value: 6 },
        { name: 'E区', value: 9 }
      ]
      data = await getData()
      const total = data.reduce((sum, item) => sum + item.value, 0)
      parkingData.value = data.map((item, index) => ({
        name: item.name,
        value: item.value,
        ratio: Number(((item.value / total) * 100).toFixed(1)),
        itemStyle: {
          normal: {
            color: colors[index]
          }
        }
      }))
    }

    const initChart = (): void => {
      if (!chartRef.value) return

      chartInstance = echarts.init(chartRef.value)
      const option = {
        tooltip: {
          trigger: 'item',
          formatter: (params): string => {
            return `${params.name}<br/>滞留车辆：${params.value}辆<br/>占比：${params.data.ratio}%`
          },
          textStyle: {
            fontSize: calcFontSize(12)
          }
        },
        series: [{
          name: '滞留车辆分析',
          type: 'pie',
          radius: ['40%', '70%'],
          center: ['50%', '50%'],
          avoidLabelOverlap: false,
          label: {
            show: true,
            position: 'outside',
            formatter: '{b}\n{c}辆',
            color: '#ffffff',
            fontSize: calcFontSize(12),
            lineHeight: 15 // 增加行高
          },
          emphasis: {
            label: {
              show: true,
              fontSize: calcFontSize(14),
              fontWeight: 'bold'
            },
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          },
          labelLine: {
            show: true,
            length: 5, // 增加第一段线长
            length2: 5, // 增加第二段线长
            smooth: true, // 添加平滑效果
          },
          data: parkingData.value
        }]
      }

      chartInstance.setOption(option)
    }

    const handleResize = (): void => {
      chartInstance?.resize()
    }

    onMounted(() => {
      fetchStuckParkingData().then(() => {
        initChart()
      })
      window.addEventListener('resize', handleResize)
    })

    onUnmounted(() => {
      chartInstance?.dispose()
      window.removeEventListener('resize', handleResize)
    })

    return (): JSX.Element => (
      <SubPanelTemplate title='滞留停车分析'>
        <div class='card-container-4' ref={chartRef}></div>
      </SubPanelTemplate>
    )
  }
})