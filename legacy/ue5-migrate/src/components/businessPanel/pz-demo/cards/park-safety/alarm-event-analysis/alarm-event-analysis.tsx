import { defineComponent, ref, watch, onMounted, onUnmounted } from 'vue'
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue"
import styles from './alarm-event-analysis.module.less'
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

export const AlarmEventAnalysis = defineComponent({
  name: 'AlarmEventAnalysis',
  setup () {
    let chartInstance = null
    const chartRef = ref<HTMLElement | null>(null)
    const statusFilter = ref(1)

    // 模拟数据
    const alarmData = ref(
      [ // 处理中
        { value: 35, name: '水报警' },
        { value: 45, name: '电报警' },
        { value: 25, name: '气报警' }
      ],
    )
    const getData = async (): Promise<void>=>{
      const result = await PZService.parkSafety.getAlarmEventAnalysis({
        processingStatus: statusFilter.value
      })
      const types = ['', '气', '电', '水']
      alarmData.value = result.map(item=>{
        return {
          value: item.alarmTypeCount,
          name: types[item.alarmType] + '报警'
        }
      })

      updateChart()
    }

    const updateChart = (): JSX.Element => {
      if (!chartInstance) return
      const currentData = alarmData.value
      const total = currentData.reduce((sum, item) => sum + item.value, 0)
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
            radius: '45%',
            center: ['50%', '50%'],
            avoidLabelOverlap: false,
            data: currentData,
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)'
              }
            },
            label: {
              show: true,
              formatter: '{b}\n{c}起\n{d}%',
              color: '#ffffff',
              fontSize: calcFontSize(12),
              padding: [8, 4], // 添加内边距
              lineHeight: 20 // 增加行高
            },
            labelLine: {
              show: true,
              length: 15, // 增加第一段线长
              length2: 10, // 增加第二段线长
              smooth: true // 添加平滑效果
            },
            color: ['#3b82f6', '#f59e0b', '#10b981']
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

    watch(() => statusFilter.value, updateChart)

    return (): JSX.Element => (
      <SubPanelTemplate title='报警事件分析'>
        <div class={styles.container}>
          <div class={styles.tabContainer}>
            <div
              class={{
                [styles.tabItem]: true,
                [styles.active]: statusFilter.value === 1
              }}
              onClick={() => statusFilter.value = 1}
            >
              处理中
            </div>
            <div
              class={{
                [styles.tabItem]: true,
                [styles.active]: statusFilter.value === 2
              }}
              onClick={() => statusFilter.value = 2}
            >
              待处理
            </div>
            <div
              class={{
                [styles.tabItem]: true,
                [styles.active]: statusFilter.value === 0
              }}
              onClick={() => statusFilter.value = 0}
            >
              已挂起
            </div>
          </div>
          <div class='card-container-3' ref={chartRef}></div>
        </div>
      </SubPanelTemplate>
    )
  }
})