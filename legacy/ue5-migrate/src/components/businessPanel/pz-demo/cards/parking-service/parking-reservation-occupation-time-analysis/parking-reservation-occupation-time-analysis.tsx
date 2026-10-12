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

export const ParkingReservationOccupationTimeAnalysis = defineComponent({
  setup () {
    let chartInstance = null
    const chartRef = ref(null)
    const timeRange = ref({
      timeType: 'TODAY',
      dateRange: []
    })

    // 模拟数据
    const mockData = {
      TODAY: {
        xData: ['00:00', '02:00', '04:00', '06:00', '08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00'],
        occupied: [30, 25, 20, 35, 80, 120, 100, 110, 90, 85, 60, 40],
        available: [70, 75, 80, 65, 20, 30, 50, 40, 60, 65, 90, 110]
      },
      THIS_WEEK: {
        xData: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
        occupied: [80, 85, 90, 95, 88, 70, 65],
        available: [20, 15, 10, 5, 12, 30, 35]
      },
      THIS_MONTH: {
        xData: Array.from({ length: 30 }, (_, i) => `${i + 1}`),
        occupied: Array.from({ length: 30 }, () => Math.floor(Math.random() * 50 + 30)),
        available: Array.from({ length: 30 }, () => Math.floor(Math.random() * 30 + 20))
      },
      THIS_YEAR: {
        xData: Array.from({ length: 12 }, (_, i) => `${i + 1}`),
        occupied: Array.from({ length: 12 }, () => Math.floor(Math.random() * 50 + 30)),
        available: Array.from({ length: 12 }, () => Math.floor(Math.random() * 30 + 20))
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
          axisPointer: {
            type: 'shadow'
          },
          formatter: (params): string => {
            const unit = timeRange.value.timeType === 'THIS_MONTH' ? '日' :
              timeRange.value.timeType === 'THIS_YEAR' ? '月' : ''
            const total = params[0].value + params[1].value
            return `${params[0].name}${unit}<br/>
                    总车位：${total}个<br/>
                    已占用：${params[0].value}个<br/>
                    空闲：${params[1].value}个<br/>
                    占用率：${((params[0].value / total) * 100).toFixed(1)}%`
          }
        },
        legend: {
          data: ['已占用', '空闲'],
          right: '5%',
          top: '2%',
          textStyle: {
            color: '#ffffff',
            fontSize: calcFontSize(12)
          }
        },
        grid: {
          top: calcFontSize(50),
          left: '0%',
          right: calcFontSize(5),
          bottom: calcFontSize(30),
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
            end: timeRange.value.timeType === 'THIS_MONTH' ? 40 : // 本月默认显示40%
              timeRange.value.timeType === 'THIS_YEAR' ? 100 : // 本年显示全部
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
          },
          {
            type: 'inside', // 添加内置缩放，支持鼠标滚轮
            xAxisIndex: [0],
            start: 0,
            end: 50,
            zoomOnMouseWheel: 'shift', // 按住shift时才能缩放，避免误触
            moveOnMouseMove: true // 支持拖动
          }
        ],
        xAxis: {
          type: 'category',
          data: currentData.xData,
          nameLocation: 'end',
          nameGap: calcFontSize(8),
          nameTextStyle: {
            color: '#ffffff',
            fontSize: calcFontSize(12)
          },
          axisLine: {
            lineStyle: {
              color: 'rgba(255, 255, 255, 0.3)'
            }
          },
          axisLabel: {
            color: '#ffffff',
            fontSize: calcFontSize(12),
            margin: calcFontSize(12),
            interval: timeRange.value.timeType === 'THIS_WEEK' ? 0 : 'auto',
          },
          axisTick: {
            alignWithLabel: true
          }
        },
        yAxis: {
          type: 'value',
          name: '车位数量',
          nameTextStyle: {
            color: '#ffffff',
            fontSize: calcFontSize(12)
          },
          nameGap: calcFontSize(35),
          axisLine: {
            show: true,
            lineStyle: {
              color: 'rgba(255, 255, 255, 0.3)'
            }
          },
          axisLabel: {
            color: '#ffffff',
            fontSize: calcFontSize(12),
            margin: calcFontSize(12),
            formatter: '{value}'
          },
          splitLine: {
            lineStyle: {
              color: 'rgba(255, 255, 255, 0.1)',
              type: 'dashed'
            }
          },
          // 添加最小值和最大值设置
          min: 0,
          // 设置网格间隔
          interval: 100,
          // 强制显示所有标签
          minInterval: 1,
          // 确保刻度线对齐数据
          alignTicks: true
        },
        series: [
          {
            name: '已占用',
            type: 'bar',
            stack: 'total',
            barWidth: '60%',
            data: currentData.occupied,
            itemStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: '#f97316' },
                { offset: 1, color: 'rgba(249, 115, 22, 0.3)' }
              ])
            }
          },
          {
            name: '空闲',
            type: 'bar',
            stack: 'total',
            barWidth: '60%',
            data: currentData.available,
            itemStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: '#3b82f6' },
                { offset: 1, color: 'rgba(59, 130, 246, 0.3)' }
              ])
            }
          }
        ]
      }

      chartInstance?.setOption(option)
    }

    const getData = async (): Promise<void> =>{
      try {
        const result = await PZService.parking.getParkingOccupancyTimeAnalysis({
          type: timeRange.value.timeType,
          period: timeRange.value.dateRange.join(',')
        })
        mockData[timeRange.value.timeType] = {
          xData: result.map(item=>item.time),
          occupied: result.map(item=>item.occupyNum),
          available: result.map(item=>item.freeNum),
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
      <SubPanelTemplate title='停车预约占用时间分析' v-slots={{
        extra: () => (
          <DateInlineForm v-model:modelValue={timeRange.value}></DateInlineForm>
        )
      }}>
        <div class='card-container-2' ref={chartRef}></div>
      </SubPanelTemplate>
    )
  }
})