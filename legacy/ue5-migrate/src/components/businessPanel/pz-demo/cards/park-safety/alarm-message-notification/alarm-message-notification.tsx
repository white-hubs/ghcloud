import { defineComponent, ref, onMounted, onUnmounted } from 'vue'
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue"
import DateInlineForm from "@/components/businessPanel/public/dateInlineForm.vue"
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

export const AlarmMessageNotification = defineComponent({
  name: 'AlarmMessageNotification',
  setup () {
    let chartInstance = null
    const chartRef = ref(null)
    const timeRange = ref({
      timeType: 'TODAY',
      dateRange: []
    })

    const getData = async (): Promise<void>=>{
      const result = await PZService.parkSafety.getAlarmMessageNotification({
        type: timeRange.value.timeType,
        period: timeRange.value.dateRange.join(',')
      })
      const types = ['', '电话通知', '短信通知', '微信通知']
      const currentData = result.map(item=>{
        return {
          name: types[item.noticeType],
          value: item.noticeCount
        }
      })
      updateChart(currentData)
      // updateChart({
      //   xData,
      //   values
      // })
    }
    const updateChart = (currentData: {
      name: string;
      value: number;
    }[]): void => {
      if (!chartInstance) return

      // const currentData = notificationData[timeRange.value.timeType]
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
            data: currentData,
            avoidLabelOverlap: false,
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)'
              }
            },
            label: {
              show: true,
              formatter: '{b}\n{c}个\n{d}%',
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
            color: ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6']
          }
        ]
      }

      chartInstance?.setOption(option)
    }

    const initChart = (): void => {
      if (chartRef.value) {
        chartInstance = echarts.init(chartRef.value)
        getData()
      }
    }

    const handleResize = (): void => {
      chartInstance?.resize()
    }

    onMounted(() => {
      initChart()
      window.addEventListener('resize', handleResize)
    })

    onUnmounted(() => {
      chartInstance?.dispose()
      window.removeEventListener('resize', handleResize)
    })

    return (): JSX.Element => (
      <SubPanelTemplate title='报警消息通知' v-slots={{
        extra: () => (
          <DateInlineForm v-model:modelValue={timeRange.value} onSearch={getData} ></DateInlineForm>
        )
      }}>
        <div class='card-container-2' ref={chartRef}></div>
      </SubPanelTemplate>
    )
  }
})