import { defineComponent, ref, onMounted, onUnmounted } from 'vue'
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue"
import * as echarts from 'echarts'
import { use } from 'echarts/core'
import { PieChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent
} from 'echarts/components'
import { calcFontSize } from '@/utils/common'
import styles from './parking-reservation-overview.module.less'
import { PZService } from '../../../card-service/service'

use([
  PieChart,
  TitleComponent,
  TooltipComponent
])

interface ReservationData {
  name: string;
  value: number;
  ratio: number;
  itemStyle: {
    color: string;
  };
}

export const ParkingReservationOverview = defineComponent({
  name: 'ParkingReservationOverview',
  setup () {
    let chartInstance = null
    const chartRef = ref(null)
    const reservationData = ref<ReservationData[]>([])
    const totalReservations = ref(0)

    const getData = async (): Promise<{ name: string; value: number; }[]> => {
      try {
        const result = await PZService.parking.getBookingOverview()
        const data = result?.map(item => ({
          name: item.type === 'LARGE' ? '大型车' :
            item.type === 'MEDIUM' ? '中型车' :
              item.type === 'SMALL' ? '小型车' : '未知类型',
          value: item.count,
        }))
        return data
      } catch {
      }
    }
    // 模拟获取预约数据，实际项目中替换为真实API调用
    const fetchReservationData = async (): Promise<void> => {
      // 这里替换为实际API调用
      const colors = ['#3B82F6', '#10B981', '#F59E0B']
      let data = [
        { name: '小型车', value: 80 },
        { name: '中型车', value: 50 },
        { name: '大型车', value: 30 }
      ]
      data = await getData()

      const total = data.reduce((sum, item) => sum + item.value, 0)
      totalReservations.value = total

      reservationData.value = data.map((item, index) => ({
        name: item.name,
        value: item.value,
        ratio: Number(((item.value / total) * 100).toFixed(1)),
        itemStyle: {
          color: colors[index]
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
            return `${params.name}<br/>预约数量：${params.value}个<br/>占比：${params.data.ratio}%`
          },
          textStyle: {
            fontSize: calcFontSize(12)
          }
        },
        series: [{
          name: '预约车位统计',
          type: 'pie',
          radius: ['30%', '55%'],
          center: ['50%', '50%'],
          avoidLabelOverlap: false,
          label: {
            show: true,
            position: 'outside',
            formatter: (params): string => {
              return `${params.name}\n${params.value}个`
            },
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
          data: reservationData.value
        }]
      }

      chartInstance?.setOption(option)
    }

    const handleResize = (): void => {
      chartInstance?.resize()
    }

    onMounted(() => {
      fetchReservationData().then(() => {
        initChart()
      })
      window.addEventListener('resize', handleResize)
    })

    onUnmounted(() => {
      chartInstance?.dispose()
      window.removeEventListener('resize', handleResize)
    })

    return (): JSX.Element => (
      <SubPanelTemplate title='停车预约总览'>
        <div class={['card-container-2', styles.container]}>
          <div class={styles.totalWrapper}>
            <div class={styles.totalNumber}>{totalReservations.value}</div>
            <div class={styles.totalLabel}>总预约数</div>
          </div>
          <div ref={chartRef} style="width: 100%; height: 100%"></div>
        </div>
      </SubPanelTemplate>
    )
  }
})