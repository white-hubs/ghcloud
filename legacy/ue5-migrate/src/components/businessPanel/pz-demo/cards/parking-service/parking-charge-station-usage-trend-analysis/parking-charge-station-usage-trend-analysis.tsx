import { defineComponent, ref, onMounted, watch } from 'vue'
import * as echarts from 'echarts'
import { use } from 'echarts/core'
import { LineChart } from 'echarts/charts'
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
  LineChart,
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent
])

export const ParkingChargeStationUsageTrendAnalysis = defineComponent({
  setup () {
    // 时间范围选择
    const timeRange = ref({
      timeType: 'TODAY',
      dateRange: []
    })

    // 图表实例
    let chartInstance = null
    const chartRef = ref(null)

    const getData = async (): Promise<{ xAxis: string[]; data: number[]; }> =>{
      try {
        const result = await PZService.parking.getChargingStationUsageTrendAnalysis({
          type: timeRange.value.timeType,
          period: timeRange.value.dateRange.join(','),
        })
        return {
          xAxis: result.map(item => item.time),
          data: result.map(item => item.count),
        }
      } catch {
      }
    }
    // 模拟不同时间范围的数据
    const getChartData = async (timeType): Promise<{ xAxis: string[]; data: number[]; }> => {
      const data = {
        TODAY: {
          xAxis: ['00:00', '03:00', '06:00', '09:00', '12:00', '15:00', '18:00', '21:00'],
          data: [30, 42, 55, 85, 75, 88, 70, 45]
        },
        THIS_WEEK: {
          xAxis: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
          data: [65, 72, 78, 75, 82, 88, 70]
        },
        THIS_MONTH: {
          xAxis: ['第1周', '第2周', '第3周', '第4周'],
          data: [70, 75, 82, 85]
        },
        THIS_YEAR: {
          xAxis: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
          data: [60, 65, 70, 75, 80, 85, 82, 78, 75, 72, 68, 70]
        }
      }
      let res = data[timeType]
      res = await getData()
      return res
    }

    // 初始化图表
    const initChart = (): void => {
      if (!chartRef.value) return

      chartInstance = echarts.init(chartRef.value)
      updateChart()
    }

    // 更新图表数据
    const updateChart = async (): Promise<void> => {
      const chartData = await getChartData(timeRange.value.timeType)
      const option = {
        tooltip: {
          trigger: 'axis',
          formatter: '{b}<br/>{a}: {c}%'
        },
        grid: {
          top: calcFontSize(40),
          left: calcFontSize(0),
          right: calcFontSize(0),
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
          data: chartData.xAxis,
          name: timeRange.value.timeType === 'THIS_MONTH' ? '月' :
            timeRange.value.timeType === 'THIS_YEAR' ? '年' : '',
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
            interval: 0,
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
          min: 0,
          max: 100,
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
          },
          axisLabel: {
            formatter: '{value}%',
            color: '#ffffff',
            fontSize: calcFontSize(12)
          }
        },
        series: [
          {
            name: '使用率',
            type: 'line',
            smooth: true,
            data: chartData.data,
            itemStyle: {
              color: '#10B981'
            },
            areaStyle: {
              color: {
                type: 'linear',
                x: 0,
                y: 0,
                x2: 0,
                y2: 1,
                colorStops: [{
                  offset: 0,
                  color: 'rgba(16, 185, 129, 0.3)'
                }, {
                  offset: 1,
                  color: 'rgba(16, 185, 129, 0)'
                }]
              }
            }
          }
        ]
      }
      chartInstance.setOption(option)
    }

    // 监听时间范围变化
    watch(() => timeRange.value.timeType, () => {
      updateChart()
    })

    onMounted(() => {
      initChart()
      window.addEventListener('resize', () => {
        chartInstance?.resize()
      })
    })

    return (): JSX.Element => (
      <SubPanelTemplate
        title="停车充电站使用趋势分析"
        v-slots={{
          extra: () => (
            <DateInlineForm
              v-model:modelValue={timeRange.value}
            />
          )
        }}
      >
        <div class='card-container-2' ref={chartRef}></div>
      </SubPanelTemplate>
    )
  }
})