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

interface VehicleData {
  name: string;
  value: number;
  ratio: number;
  itemStyle: {
    normal: {
      color: string;
    };
  };
}

export const ParkingTypeStatistics = defineComponent({
  setup () {
    let chartInstance = null
    const chartRef = ref(null)
    const vehicleData = ref<VehicleData[]>([])

    const getData = async (): Promise<{ name: string; value: number; }[]> => {
      try {
        const result = await PZService.parking.getParkingTypeStatistics()
        const data = result?.map(item => ({
          name: item.area,
          value: item.count,
        }))
        return data
      } catch {
      }
    }
    // 模拟获取车辆类型数据，实际项目中替换为真实API调用
    const fetchVehicleData = async (): Promise<void> => {
      // 这里替换为实际API调用
      const colors = ['#1989fa', '#07c160']
      let data = [
        { name: '油车', value: 180 },
        { name: '新能源车', value: 120 }
      ]
      data = await getData()
      const total = data.reduce((sum, item) => sum + item.value, 0)
      vehicleData.value = data.map((item, index) => ({
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
            return `${params.name}<br/>数量：${params.value}辆<br/>占比：${params.data.ratio}%`
          },
          textStyle: {
            fontSize: calcFontSize(12)
          }
        },
        series: [{
          name: '车辆类型统计',
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
          labelLine: {
            show: true,
            length: 5, // 增加第一段线长
            length2: 5, // 增加第二段线长
            smooth: true // 添加平滑效果
          },
          data: vehicleData.value
        }]
      }

      chartInstance.setOption(option)
    }

    const handleResize = (): void => {
      chartInstance?.resize()
    }

    onMounted(() => {
      fetchVehicleData().then(() => {
        initChart()
      })
      window.addEventListener('resize', handleResize)
    })

    onUnmounted(() => {
      chartInstance?.dispose()
      window.removeEventListener('resize', handleResize)
    })

    return (): JSX.Element => (
      <SubPanelTemplate title='车辆类型统计'>
        <div class='card-container-4' ref={chartRef}></div>
      </SubPanelTemplate>
    )
  }
})