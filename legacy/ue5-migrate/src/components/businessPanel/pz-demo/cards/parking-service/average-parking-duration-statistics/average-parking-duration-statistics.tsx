import { defineComponent, ref, onMounted, onUnmounted, watch } from 'vue'
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue"
import DateInlineForm from "@/components/businessPanel/public/dateInlineForm.vue"
import * as echarts from 'echarts'
import { use } from 'echarts/core'
import { BarChart } from 'echarts/charts'
import {
  GridComponent,
  TitleComponent,
  TooltipComponent,
  LegendComponent
} from 'echarts/components'
import { calcFontSize } from '@/utils/common'
import { PZService } from '../../../card-service/service'

use([
  BarChart,
  GridComponent,
  TitleComponent,
  TooltipComponent,
  LegendComponent
])

export const AverageParkingDurationStatistics = defineComponent({
  name: 'AverageParkingDurationStatistics',
  setup () {
    let chartInstance = null
    const chartRef = ref(null)
    const timeRange = ref({
      timeType: 'THIS_MONTH',
      dateRange: []
    })

    // 模拟数据
    const mockData = {
      TODAY: {
        xData: ['00:00', '02:00', '04:00', '06:00', '08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00'],
        yData: [45, 35, 30, 40, 120, 180, 150, 160, 140, 130, 90, 60]
      },
      THIS_WEEK: {
        xData: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
        yData: [120, 130, 140, 150, 145, 110, 100]
      },
      THIS_MONTH: {
        xData: Array.from({ length: 30 }, (_, i) => `${i + 1}日`),
        yData: Array.from({ length: 30 }, () => Math.floor(Math.random() * 30 + 60))
      },
      THIS_YEAR: {
        xData: Array.from({ length: 12 }, (_, i) => `${i + 1}`),
        yData: Array.from({ length: 12 }, () => Math.floor(Math.random() * 30 + 60))
      }
    }

    const updateChart = async (): Promise<void> =>{
      await getData()
      if (!chartInstance) return

      const currentData = mockData[timeRange.value.timeType]
      const option = {
        backgroundColor: 'transparent',
        tooltip: {
          trigger: 'axis',
          formatter: (params): string => {
            const value = params[0].value
            return `${params[0].name}<br/>平均停车时长：${value}分钟`
          }
        },
        grid: {
          top: calcFontSize(40),
          left: calcFontSize(10),
          right: calcFontSize(10),
          bottom: calcFontSize(30), // 增加底部空间，为滚动条和标签留出更多空间
          containLabel: true
        },
        dataZoom: [
          {
            type: 'slider',
            show: true,
            xAxisIndex: [0],
            bottom: calcFontSize(5),
            height: calcFontSize(15),
            start: 0,
            end: timeRange.value.timeType === 'THIS_MONTH' ? 20 : // 本月默认显示20%
              timeRange.value.timeType === 'THIS_YEAR' ? 50 : // 本年显示全部
                timeRange.value.timeType === 'THIS_WEEK' ? 100 :
                  timeRange.value.timeType === 'TODAY' ? 50 : 100,
            zoomLock: false, // 允许缩放
            brushSelect: false, // 禁用刷选
            handleIcon: 'path://M306.1,413c0,2.2-1.8,4-4,4h-59.8c-2.2,0-4-1.8-4-4V200.8c0-2.2,1.8-4,4-4h59.8c2.2,0,4,1.8,4,4V413z',
            handleSize: '110%',
            handleStyle: {
              color: '#3b82f6',
              borderColor: '#3b82f6',
              borderWidth: 1
            },
            moveHandleStyle: {
              color: '#3b82f6'
            },
            fillerColor: 'rgba(59, 130, 246, 0.1)',
            backgroundColor: 'rgba(255,255,255,0.05)',
            borderColor: 'transparent',
            textStyle: {
              color: '#ffffff',
              fontSize: calcFontSize(10)
            },
            emphasis: {
              handleStyle: {
                color: '#60a5fa',
                borderColor: '#60a5fa'
              }
            }
          },
          {
            type: 'inside', // 添加内置缩放，支持鼠标滚轮
            xAxisIndex: [0],
            start: 0,
            end: 20,
            zoomOnMouseWheel: 'shift', // 按住shift时才能缩放，避免误触
            moveOnMouseMove: true // 支持拖动
          }
        ],
        xAxis: {
          type: 'category',
          data: currentData.xData,
          nameLocation: 'end',
          nameGap: 5,
          nameTextStyle: {
            color: '#ffffff',
            fontSize: calcFontSize(12),
            align: 'right'
          },
          axisLine: {
            lineStyle: {
              color: 'rgba(255, 255, 255, 0.3)'
            }
          },
          axisLabel: {
            color: '#ffffff',
            fontSize: calcFontSize(12),
            interval: timeRange.value.timeType === 'THIS_MONTH' ? 'auto' : 0, // 本月视图自动计算间隔
            margin: calcFontSize(8),
            align: 'center',
            formatter: (value): string => {
              return value
            }
          },
          axisTick: {
            show: true,
            alignWithLabel: true,
            length: calcFontSize(3)
          }
        },
        yAxis: {
          type: 'value',
          name: '分钟',
          nameTextStyle: {
            color: '#ffffff',
            fontSize: calcFontSize(12)
          },
          axisLabel: {
            color: '#ffffff',
            fontSize: calcFontSize(12)
          },
          splitLine: {
            lineStyle: {
              color: 'rgba(255, 255, 255, 0.1)',
              type: 'dashed'
            }
          },
          axisLine: {
            lineStyle: {
              color: 'rgba(255, 255, 255, 0.3)'
            }
          }
        },
        series: [
          {
            name: '平均停车时长',
            type: 'bar',
            data: currentData.yData,
            itemStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: '#3b82f6' },
                { offset: 1, color: 'rgba(59, 130, 246, 0.3)' }
              ])
            },
            barWidth: calcFontSize(20), // 固定柱子宽度
            barGap: '30%', // 固定柱子间距
            barCategoryGap: '40%', // 增加类目间距
            animation: true,
            animationDuration: 1000,
            animationEasing: 'cubicInOut'
          }
        ]
      }

      chartInstance?.setOption(option)
    }

    const getData = async (): Promise<void> =>{
      try {
        const result = await PZService.parking.getAverageParkingDurationStatistics({
          type: timeRange.value.timeType,
          period: timeRange.value.dateRange.join(',')
        })
        mockData[timeRange.value.timeType] = {
          xData: result.map(item=>item.time),
          yData: result.map(item=>item.count)
        }
      } catch {
      }
    }
    const initChart = (): void => {
      if (chartRef.value) {
        chartInstance = echarts.init(chartRef.value)
        updateChart()
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

    watch(() => timeRange.value.timeType, updateChart)

    return (): JSX.Element => (
      <SubPanelTemplate title='平均停车时长统计' v-slots={{
        extra: () => (
          <DateInlineForm v-model:modelValue={timeRange.value}></DateInlineForm>
        )
      }}>
        <div class='card-container-4' ref={chartRef}></div>
      </SubPanelTemplate>
    )
  }
})