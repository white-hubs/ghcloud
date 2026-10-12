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
import styles from './project-format.module.less'

use([
  PieChart,
  TitleComponent,
  TooltipComponent
])

interface FormatData {
  name: string;
  value: number;
  ratio: number;
  itemStyle: {
    color: string;
  };
}

export const ProjectFormat = defineComponent({
  name: 'ProjectFormat',
  setup () {
    let chartInstance = null
    const chartRef = ref(null)
    const formatData = ref<FormatData[]>([])
    const totalArea = ref(0)

    const getData = async (): Promise<void> => {
      try {
        // 这里替换为实际API调用
        const data = [
          { name: '商业', value: 3000 },
          { name: '办公', value: 5000 },
          { name: '住宅', value: 7000 }
        ]

        const total = data.reduce((sum, item) => sum + item.value, 0)
        totalArea.value = total

        const colors = ['#3B82F6', '#10B981', '#F59E0B']
        formatData.value = data.map((item, index) => ({
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
            return `${params.name}<br/>面积：${params.value}㎡<br/>占比：${params.data.ratio}%`
          },
          textStyle: {
            fontSize: calcFontSize(12)
          }
        },
        series: [{
          name: '业态占比',
          type: 'pie',
          radius: ['30%', '55%'],
          center: ['50%', '50%'],
          avoidLabelOverlap: false,
          label: {
            show: true,
            position: 'outside',
            formatter: (params): string => {
              return `${params.name}\n${params.value}㎡`
            },
            color: '#ffffff',
            fontSize: calcFontSize(12),
            lineHeight: 15,
            padding: [0, 0, 0, 0],
            alignTo: 'edge',
            edgeDistance: calcFontSize(10),
            bleedMargin: calcFontSize(10)
          },
          labelLine: {
            show: true,
            minTurnAngle: 90,
            smooth: 0.2
          },
          data: formatData.value
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
      <SubPanelTemplate title='业态占比分析'>
        <div class='card-container-4'>
          <div class={styles.container}>
            <div class={styles.totalWrapper}>
              <div class={styles.totalNumber}>{totalArea.value}</div>
              <div class={styles.totalLabel}>总面积(㎡)</div>
            </div>
            <div ref={chartRef} style={{ width: '100%', height: '100%' }} ></div>
          </div>
        </div>
      </SubPanelTemplate>
    )
  }
})