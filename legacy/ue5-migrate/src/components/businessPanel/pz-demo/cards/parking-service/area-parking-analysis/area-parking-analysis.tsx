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

interface ParkingData {
  name: string;
  value: number;
  ratio: number;
  itemStyle: {
    normal: {
      color: string;
    };
  };
}

export const AreaParkingAnalysis = defineComponent({
  setup () {
    let chartInstance = null
    const chartRef = ref(null)
    const parkingData = ref<ParkingData[]>([])

    const getData = async (): Promise<{ name: string; value: number; }[]> => {
      try {
        const result = await PZService.parking.getParkingAreaAnalysis()
        const data = result?.map(item => ({
          name: item.area,
          value: item.count,
        }))
        return data
      } catch {
      }
    }
    // 模拟获取停车场数据，实际项目中替换为真实API调用
    const fetchParkingData = async (): Promise<void> => {
      // 这里替换为实际API调用
      const colors = ['#1989fa', '#0d924d', '#07c160', '#ff976a', '#F53F3F']
      let data = [
        { name: 'A区', value: 120 },
        { name: 'B区', value: 80 },
        { name: 'C区', value: 150 },
        { name: 'D区', value: 70 },
        { name: 'E区', value: 100 }
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
            return `${params.name}<br/>停车数量：${params.value}<br/>占比：${params.data.ratio}%`
          },
          textStyle: {
            fontSize: calcFontSize(12)
          }
        },
        series: [{
          name: '区域停车分析',
          type: 'pie',
          radius: ['40%', '70%'],
          center: ['45%', '50%'],
          avoidLabelOverlap: false,
          label: {
            show: true,
            position: 'outer',
            formatter: '{b}\n{c}辆',
            color: '#ffffff',
            fontSize: calcFontSize(12),
            lineHeight: 15, // 增加行高
            padding: [0, 0, 0, 0], // 移除内边距以确保对齐效果
            alignTo: 'edge', // 标签对齐到边缘
            edgeDistance: calcFontSize(10), // 标签和图形边缘的距离
            bleedMargin: calcFontSize(10), // 超出画布的边距
          },
          labelLine: {
            show: true,
            // length: 5, // 增加第一段线长
            // length2: 5, // 增加第二段线长
            minTurnAngle: 90, // 最小转角
            smooth: 0.2 // 平滑度
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
      fetchParkingData().then(() => {
        initChart()
      })
      window.addEventListener('resize', handleResize)
    })

    onUnmounted(() => {
      chartInstance?.dispose()
      window.removeEventListener('resize', handleResize)
    })

    return (): JSX.Element => (
      <SubPanelTemplate>
        <div class='card-container-3' ref={chartRef}></div>
      </SubPanelTemplate>
    )
  }
})