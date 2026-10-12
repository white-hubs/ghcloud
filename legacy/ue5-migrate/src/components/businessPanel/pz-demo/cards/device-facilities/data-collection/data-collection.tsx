import { defineComponent, ref, onMounted } from 'vue'
import * as echarts from 'echarts'
import { use } from 'echarts/core'
import { BarChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent
} from 'echarts/components'
import { calcFontSize } from '@/utils/common'
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue"
import DateInlineForm from "@/components/businessPanel/public/dateInlineForm.vue"
import { PZService } from '../../../card-service/service'

use([
  BarChart,
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent
])

export const DataCollection = defineComponent({
  setup () {
    // 时间范围选择
    const timeRange = ref({
      timeType: 'TODAY',
      dateRange: []
    })

    // 图表实例
    let chartInstance = null
    const chartRef = ref(null)

    // 模拟数据
    // 模拟数据
    const getChartData = async (): Promise<void> => {
      const result = await PZService.device.getDeviceDataCollection({
        type: timeRange.value.timeType,
        period: timeRange.value.dateRange.join(',')
      })
      const deviceTypes = result.map(item=>item.name)
      const faultEvents = result.map(item => item.eventsNumber)
      const runningTime = result.map(item => item.runningTime)
      updateChart({ deviceTypes, faultEvents, runningTime })
    }

    // 更新图表
    const updateChart = (chartData: {
      deviceTypes: string[];
      faultEvents: number[];
      runningTime: number[];
    }): void => {
      if (!chartInstance) return
      // const chartData = getChartData(timeRange.value.timeType)
      const option = {
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          }
        },
        legend: {
          data: ['故障事件数', '运行时长(小时)'],
          textStyle: {
            color: '#ffffff'
          },
          top: 0
        },
        grid: {
          top: calcFontSize(40),
          left: calcFontSize(10),
          right: calcFontSize(10),
          bottom: calcFontSize(10), // 增加底部空间，为滚动条和标签留出更多空间
          containLabel: true
        },
        xAxis: {
          type: 'category',
          data: chartData.deviceTypes,
          axisLabel: {
            color: '#ffffff',
            fontSize: calcFontSize(12)
          },
          axisLine: {
            lineStyle: {
              color: 'rgba(255, 255, 255, 0.3)'
            }
          }
        },
        yAxis: {
          type: 'value',
          axisLabel: {
            color: '#ffffff',
            fontSize: calcFontSize(12)
          },
          splitLine: {
            lineStyle: {
              color: 'rgba(255, 255, 255, 0.1)'
            }
          }
        },
        series: [
          {
            name: '故障事件数',
            type: 'bar',
            data: chartData.faultEvents,
            itemStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: '#3b82f6' },
                { offset: 1, color: 'rgba(59, 130, 246, 0.3)' }
              ])
            },
            barGap: '30%',
            barWidth: '20%'
          },
          {
            name: '运行时长(小时)',
            type: 'bar',
            data: chartData.runningTime,
            itemStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: 'rgba(42, 232, 189, 0.8)' },
                { offset: 1, color: 'rgba(42, 232, 189, 0.1)' }
              ])
            },
            barWidth: '20%'
          }
        ]
      }
      chartInstance.setOption(option)
    }

    // 监听时间范围变化
    // watch(() => timeRange.value.timeType, () => {
    //   updateChart()
    // })

    onMounted(() => {
      chartInstance = echarts.init(chartRef.value)
      // updateChart()
      window.addEventListener('resize', () => {
        chartInstance?.resize()
      })
    })

    return (): JSX.Element => (
      <SubPanelTemplate
        title="设备数据采集统计"
        v-slots={{
          extra: () => (
            <DateInlineForm
              v-model:modelValue={timeRange.value}
              onSearch={getChartData}
            />
          )
        }}
      >
        <div class='card-container-3' ref={chartRef}></div>
      </SubPanelTemplate>
    )
  }
})