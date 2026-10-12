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
import styles from './surrounding-facilities.module.less'

use([
  PieChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent
])

interface FacilityData {
  name: string;
  value: number;
  ratio: number;
  itemStyle: {
    color: string;
  };
}

export const SurroundingFacilities = defineComponent({
  name: 'SurroundingFacilities',
  setup () {
    let chartInstance = null
    const chartRef = ref(null)
    const facilityData = ref<FacilityData[]>([])
    const totalCount = ref(0)

    const getData = async (): Promise<void> => {
      try {
        // 模拟数据，实际项目中需替换为API调用
        const data = [
          { name: '教育设施', value: 25 },
          { name: '医疗设施', value: 18 },
          { name: '商业设施', value: 35 },
          { name: '交通设施', value: 28 },
          { name: '文体设施', value: 15 },
          { name: '其他设施', value: 10 }
        ]

        const total = data.reduce((sum, item) => sum + item.value, 0)
        totalCount.value = total

        const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EC4899', '#8B5CF6', '#6B7280']
        facilityData.value = data.map((item, index) => ({
          name: item.name,
          value: item.value,
          ratio: Number(((item.value / total) * 100).toFixed(1)),
          itemStyle: {
            color: colors[index]
          }
        }))
      } catch {
      }
    }

    const initChart = (): void => {
      if (!chartRef.value) return

      chartInstance = echarts.init(chartRef.value)
      const option = {
        tooltip: {
          trigger: 'item',
          formatter: (params): string => {
            return `${params.name}<br/>数量：${params.value}个<br/>占比：${params.data.ratio}%`
          }
        },
        legend: {
          top: calcFontSize(0),
          textStyle: {
            color: '#ffffff',
            fontSize: calcFontSize(12)
          }
        },
        series: [{
          name: '配套设施',
          type: 'pie',
          radius: ['40%', '70%'],
          center: ['50%', '65%'],
          avoidLabelOverlap: false,
          label: {
            show: true,
            position: 'inside',
            formatter: '{d}%',
            fontSize: calcFontSize(12),
            color: '#ffffff'
          },
          emphasis: {
            label: {
              show: true,
              fontSize: calcFontSize(14),
              fontWeight: 'bold'
            }
          },
          data: facilityData.value
        }]
      }

      chartInstance?.setOption(option)
    }

    const handleResize = (): void => {
      chartInstance?.resize()
    }

    onMounted(() => {
      getData().then(() => {
        initChart()
      })
      window.addEventListener('resize', handleResize)
    })

    onUnmounted(() => {
      chartInstance?.dispose()
      window.removeEventListener('resize', handleResize)
    })

    return (): JSX.Element => (
      <SubPanelTemplate title='周边配套分析'>
        <div class='card-container-3'>
          <div class={styles['container']}>
            <div class={styles['total-wrapper']}>
              <div class={styles['total-number']}>{totalCount.value}</div>
              <div class={styles['total-label']}>配套设施总数</div>
            </div>
            <div ref={chartRef} style={{ width: '100%', height: '100%' }}></div>
          </div>
        </div>
      </SubPanelTemplate>
    )
  }
})