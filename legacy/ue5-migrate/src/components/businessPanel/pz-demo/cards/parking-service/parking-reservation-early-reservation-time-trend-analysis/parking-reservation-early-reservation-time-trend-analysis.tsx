import { defineComponent, ref, onMounted, onUnmounted, watch } from 'vue'
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue"
import DateInlineForm from "@/components/businessPanel/public/dateInlineForm.vue"
import * as echarts from 'echarts'
import { use } from 'echarts/core'
import { LineChart } from 'echarts/charts'
import {
  GridComponent,
  TitleComponent,
  TooltipComponent,
  LegendComponent
} from 'echarts/components'
import { calcFontSize } from '@/utils/common'
import { PZService } from '../../../card-service/service'

use([
  LineChart,
  GridComponent,
  TitleComponent,
  TooltipComponent,
  LegendComponent
])

export const ParkingReservationEarlyReservationTimeTrendAnalysis = defineComponent({
  name: 'ParkingReservationEarlyReservationTimeTrendAnalysis',
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
        reservedData: [20, 25, 30, 45, 80, 85, 75, 90, 85, 70, 60, 40],
        totalData: [100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100]
      },
      THIS_WEEK: {
        xData: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
        reservedData: [150, 180, 200, 220, 190, 160, 140],
        totalData: [300, 300, 300, 300, 300, 300, 300]
      },
      THIS_MONTH: {
        xData: Array.from({ length: 30 }, (_, i) => `${i + 1}日`),
        reservedData: Array.from({ length: 30 }, () => Math.floor(Math.random() * 200 + 100)),
        totalData: Array.from({ length: 30 }, () => 300)
      },
      THIS_YEAR: {
        xData: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
        reservedData: [1500, 1600, 1800, 2000, 1900, 1700, 1800, 2100, 2000, 1900, 1800, 1700],
        totalData: Array(12).fill(3000)
      }
    }

    const updateChart = async (): Promise<void> =>{
      await getData()
      if (!chartInstance) return

      const currentData = mockData[timeRange.value.timeType]
      const reservationRates = currentData.reservedData.map((reserved, index) =>
        Number(((reserved / currentData.totalData[index]) * 100).toFixed(1)))

      const option = {
        tooltip: {
          trigger: 'axis',
          formatter: (params): string => {
            const value = params[0].value
            return `${params[0].name}<br/>预约率：${value}%<br/>预约数：${currentData.reservedData[params[0].dataIndex]}<br/>总车位：${currentData.totalData[params[0].dataIndex]}`
          }
        },
        grid: {
          top: calcFontSize(40),
          left: '0%',
          right: calcFontSize(5),
          bottom: calcFontSize(5),
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
            end: 50,
            zoomOnMouseWheel: 'shift', // 按住shift时才能缩放，避免误触
            moveOnMouseMove: true // 支持拖动
          }
        ],
        xAxis: {
          type: 'category',
          boundaryGap: false,
          data: currentData.xData,
          axisLine: {
            lineStyle: {
              color: 'rgba(255, 255, 255, 0.3)'
            }
          },
          axisLabel: {
            color: '#ffffff',
            fontSize: calcFontSize(12),
            interval: timeRange.value.timeType === 'THIS_WEEK' ? 0 : 'auto',
          }
        },
        yAxis: {
          type: 'value',
          name: '预约率(%)',
          nameTextStyle: {
            color: '#ffffff',
            fontSize: calcFontSize(12),
          },
          min: 0,
          max: 100,
          splitNumber: 5,
          axisLabel: {
            color: '#ffffff',
            fontSize: calcFontSize(12),
            formatter: '{value}%'
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
            name: '预约率',
            type: 'line',
            smooth: true,
            symbol: 'circle',
            symbolSize: 8,
            data: reservationRates,
            itemStyle: {
              color: '#3b82f6'
            },
            areaStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                {
                  offset: 0,
                  color: 'rgba(59, 130, 246, 0.3)'
                },
                {
                  offset: 1,
                  color: 'rgba(59, 130, 246, 0.1)'
                }
              ])
            },
            lineStyle: {
              width: 3,
              color: '#3b82f6'
            }
          }
        ]
      }

      chartInstance?.setOption(option)
    }

    const getData = async (): Promise<void> =>{
      try {
        const result = await PZService.parking.getEarlyBookingTimeTrendAnalysis({
          type: timeRange.value.timeType,
          period: timeRange.value.dateRange.join(',')
        })
        mockData[timeRange.value.timeType] = {
          xData: result.map(item=>item.time),
          reservedData: result.map(item=>item.count),
          totalData: result.map(item=>item.totalParkingSpace),
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
      <SubPanelTemplate title='停车预约提前预约时间趋势分析' v-slots={{
        extra: () => (
          <DateInlineForm v-model:modelValue={timeRange.value}></DateInlineForm>
        )
      }}>
        <div class='card-container-2' ref={chartRef}></div>
      </SubPanelTemplate>
    )
  }
})