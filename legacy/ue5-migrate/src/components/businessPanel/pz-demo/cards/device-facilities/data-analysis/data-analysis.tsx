import { defineComponent, ref, onMounted } from 'vue'
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

export const DataAnalysis = defineComponent({
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
    const getChartData = async (): Promise<void> => {
      const result = await PZService.device.getDeviceDataAnalysis({
        type: timeRange.value.timeType,
        period: timeRange.value.dateRange.join(',')
      })
      updateChart(result)
      // const data = {
      //   TODAY: {
      //     xAxis: ['00:00', '03:00', '06:00', '09:00', '12:00', '15:00', '18:00', '21:00'],
      //     runningTime: [2, 3, 4, 5, 4.5, 4, 3.5, 3],
      //     faultFrequency: [1, 0, 2, 1, 3, 1, 0, 1]
      //   },
      //   THIS_WEEK: {
      //     xAxis: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
      //     runningTime: [18, 20, 22, 21, 19, 17, 16],
      //     faultFrequency: [5, 3, 4, 6, 3, 2, 4]
      //   },
      //   THIS_MONTH: {
      //     xAxis: ['第1周', '第2周', '第3周', '第4周'],
      //     runningTime: [85, 90, 88, 92],
      //     faultFrequency: [15, 12, 18, 14]
      //   },
      //   THIS_YEAR: {
      //     xAxis: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
      //     runningTime: [360, 380, 400, 420, 410, 430, 440, 420, 400, 390, 380, 370],
      //     faultFrequency: [45, 40, 50, 48, 52, 45, 42, 47, 43, 41, 44, 46]
      //   }
      // }
      // return data[timeType]
    }

    // 更新图表
    const updateChart = (chartData: {
      xAxis: string[];
      runningTime: number[];
      faultFrequency: number[];
    }): void => {
      if (!chartInstance) return

      // const chartData = getChartData(timeRange.value.timeType)
      const option = {
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross'
          },
          formatter: (params): string => {
            let result = params[0].axisValue + '<br/>'
            params.forEach(item => {
              const unit = item.seriesName === '运行时间' ? '小时' : '次'
              result += `${item.marker} ${item.seriesName}: ${item.value}${unit}<br/>`
            })
            return result
          }
        },
        legend: {
          data: ['运行时间', '故障频率'],
          textStyle: {
            color: '#ffffff'
          },
          top: 0
        },
        grid: {
          left: calcFontSize(40),
          right: calcFontSize(0),
          top: calcFontSize(50),
          bottom: calcFontSize(30)
        },
        xAxis: {
          axisLine: {
            lineStyle: {
              color: '#ffffff'
            }
          },
          axisTick: {
            lineStyle: {
              color: '#ffffff'
            }
          },
          type: 'category',
          data: chartData.xAxis,
          axisLabel: {
            color: '#ffffff',
            fontSize: calcFontSize(12)
          },
          nameTextStyle: {
            color: '#ffffff',
            fontSize: calcFontSize(12)
          }
        },
        yAxis: [
          {
            type: 'value',
            name: '运行时间(小时)',
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
                color: 'rgba(255, 255, 255, 0.1)'
              }
            }
          },
          {
            type: 'value',
            name: '故障频率(次)',
            nameTextStyle: {
              color: '#ffffff',
              fontSize: calcFontSize(12)
            },
            axisLabel: {
              color: '#ffffff',
              fontSize: calcFontSize(12)
            },
            splitLine: {
              show: false
            }
          }
        ],
        series: [
          {
            name: '运行时间',
            type: 'line',
            smooth: true,
            data: chartData.runningTime,
            symbolSize: 6,
            itemStyle: {
              color: '#5470c6'
            },
            lineStyle: {
              width: 2
            },
            areaStyle: {
              color: new echarts.graphic.LinearGradient(
                0, 0, 0, 1, // 从顶部到底部的渐变
                [
                  { offset: 0, color: 'rgba(84, 112, 198, 0.8)' }, // 起始颜色保持一定透明度
                  { offset: 1, color: 'rgba(84, 112, 198, 0)' } // 渐变至透明
                ]
              )
            }
          },
          {
            name: '故障频率',
            type: 'line',
            smooth: true,
            yAxisIndex: 1,
            data: chartData.faultFrequency,
            symbolSize: 6,
            itemStyle: {
              color: '#91cc75'
            },
            lineStyle: {
              width: 2
            },
            areaStyle: {
              color: new echarts.graphic.LinearGradient(
                0, 0, 0, 1, // 从顶部到底部的渐变
                [
                  { offset: 0, color: 'rgba(145, 204, 117, 0.8)' }, // 起始颜色保持一定透明度
                  { offset: 1, color: 'rgba(145, 204, 117, 0)' } // 渐变至透明
                ]
              )
            }
          }
        ]
      }
      chartInstance.setOption(option)
    }

    // // 监听时间范围变化
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
        title="设备数据分析"
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