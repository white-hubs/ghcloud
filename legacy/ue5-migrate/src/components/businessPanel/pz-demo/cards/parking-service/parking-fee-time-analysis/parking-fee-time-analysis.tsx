import { defineComponent, ref, onMounted, onUnmounted } from 'vue'
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue"
import * as echarts from 'echarts'
import { use } from 'echarts/core'
import { BoxplotChart } from 'echarts/charts'
import {
  GridComponent,
  TitleComponent,
  TooltipComponent
} from 'echarts/components'
import { calcFontSize } from '@/utils/common'
import { PZService } from '../../../card-service/service'
import type { AreaParkTimeAnalysisPO } from '../../../card-service/modules/parking'

use([
  BoxplotChart,
  GridComponent,
  TitleComponent,
  TooltipComponent
])

export const ParkingFeeTimeAnalysis = defineComponent({
  name: 'ParkingFeeTimeAnalysis',
  setup () {
    let chartInstance = null
    const chartRef = ref(null)

    const getData = async (): Promise<AreaParkTimeAnalysisPO[]> => {
      try {
        return PZService.parking.getParkingTimeAnalysis2()
      } catch {
      }
    }
    // 模拟获取停车时长数据，实际项目中替换为真实API调用
    const fetchParkingDurationData = async (): Promise<{ timeSlots: string[]; boxData: number[][]; }> => {
      // 生成更真实的停车时长数据（单位：分钟）
      const generateTimeData = (count: number, baseTime: number, variance: number): number[] => {
        return Array.from({ length: count }, () => {
          const randomVariance = Math.random() * variance * 2 - variance
          return Math.max(5, Math.floor(baseTime + randomVariance))
        }).sort((a, b) => a - b)
      }

      // 不同时段的数据特征
      const timeSlots = [
        { name: '00:00-06:00', base: 360, variance: 120 }, // 夜间停车较长
        { name: '06:00-09:00', base: 40, variance: 20 }, // 早高峰较短
        { name: '09:00-12:00', base: 120, variance: 60 }, // 上午办公
        { name: '12:00-14:00', base: 90, variance: 30 }, // 午休时段
        { name: '14:00-17:00', base: 150, variance: 70 }, // 下午办公
        { name: '17:00-20:00', base: 45, variance: 25 }, // 晚高峰较短
        { name: '20:00-24:00', base: 180, variance: 90 } // 夜间娱乐
      ]
      let times = timeSlots.map(slot => slot.name)
      let data = []
      let boxData = timeSlots.map(slot => {
        data = generateTimeData(100, slot.base, slot.variance)
        return [
          data[0], // 最小值
          data[Math.floor(data.length * 0.25)], // Q1
          data[Math.floor(data.length * 0.5)], // 中位数
          data[Math.floor(data.length * 0.75)], // Q3
          data[data.length - 1] // 最大值
        ]
      })
      const res = await getData()
      if (res) {
        data = res
        times = data.map(item => item.timeRange)
        boxData = data.map(item => {
          return [
            item.min, // 最小值
            item.lowerQuartile, // Q1
            item.median, // 中位数
            item.upperQuartile, // Q3
            item.max // 最大值
          ]
        })
      }
      return {
        timeSlots: times,
        boxData
      }
    }

    const initChart = async (): Promise<void> => {
      if (!chartRef.value) return

      const data = await fetchParkingDurationData()
      chartInstance = echarts.init(chartRef.value)

      const option = {
        tooltip: {
          trigger: 'item',
          axisPointer: {
            type: 'shadow'
          },
          formatter: (params): string => {
            const data = params.data
            return `${params.name}<br/>
                    最大值：${data[4]}分钟<br/>
                    上四分位：${data[3]}分钟<br/>
                    中位数：${data[2]}分钟<br/>
                    下四分位：${data[1]}分钟<br/>
                    最小值：${data[0]}分钟`
          }
        },
        grid: {
          top: calcFontSize(50),
          left: '0%',
          right: calcFontSize(5),
          bottom: calcFontSize(5),
          containLabel: true
        },
        xAxis: {
          type: 'category',
          data: data.timeSlots,
          axisLine: {
            lineStyle: {
              color: 'rgba(255, 255, 255, 0.3)'
            }
          },
          axisLabel: {
            color: '#ffffff',
            fontSize: calcFontSize(12),
            interval: 'auto',
          }
        },
        yAxis: {
          type: 'value',
          name: '时长(分钟)',
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
            fontSize: calcFontSize(12)
          },
          splitLine: {
            lineStyle: {
              color: 'rgba(255, 255, 255, 0.1)',
              type: 'dashed'
            }
          }
        },
        series: [
          {
            name: '停车时长分布',
            type: 'boxplot',
            data: data.boxData,
            itemStyle: {
              color: '#3B82F6',
              borderColor: '#60A5FA'
            },
            emphasis: {
              itemStyle: {
                borderColor: '#93C5FD',
                borderWidth: 2,
                shadowBlur: 5,
                shadowColor: 'rgba(147, 197, 253, 0.3)'
              }
            }
          }
        ]
      }

      chartInstance?.setOption(option)
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
      <SubPanelTemplate title='停车费用时间分析'>
        <div class='card-container-3' ref={chartRef}></div>
      </SubPanelTemplate>
    )
  }
})