import { defineComponent, ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
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

use([
  LineChart,
  GridComponent,
  TitleComponent,
  TooltipComponent,
  LegendComponent
])

export const ResourceTrendAnalysis = defineComponent({
  name: 'ResourceTrendAnalysis',
  setup () {
    let chartInstance = null
    const chartRef = ref(null)
    const timeRange = ref({
      timeType: 'THIS_YEAR',
      dateRange: []
    })

    // 模拟数据 - 包含所有时间维度的数据
    const mockData = {
      TODAY: {
        xData: ['00:00', '03:00', '06:00', '09:00', '12:00', '15:00', '18:00', '21:00'],
        series: [
          {
            name: '零售',
            data: [32, 34, 31, 35, 38, 36, 33, 35]
          },
          {
            name: '餐饮',
            data: [20, 19, 21, 24, 26, 25, 22, 20]
          },
          {
            name: '办公',
            data: [25, 24, 26, 28, 29, 27, 26, 25]
          },
          {
            name: '文娱',
            data: [15, 14, 16, 18, 19, 17, 16, 15]
          },
          {
            name: '新能源',
            data: [8, 7, 9, 11, 12, 10, 9, 8]
          }
        ]
      },
      THIS_WEEK: {
        xData: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
        series: [
          {
            name: '零售',
            data: [33, 35, 34, 36, 35, 32, 34]
          },
          {
            name: '餐饮',
            data: [22, 23, 24, 25, 24, 21, 20]
          },
          {
            name: '办公',
            data: [28, 27, 29, 28, 26, 25, 27]
          },
          {
            name: '文娱',
            data: [16, 17, 18, 17, 16, 15, 16]
          },
          {
            name: '新能源',
            data: [9, 10, 11, 10, 9, 8, 9]
          }
        ]
      },
      THIS_MONTH: {
        xData: Array.from({ length: 30 }, (_, i) => `${i + 1}日`),
        series: [
          {
            name: '零售',
            data: [34, 35, 33, 32, 34, 36, 35, 33, 34, 35, 36, 34, 33, 35, 34, 32, 33, 35, 36, 34, 33, 32, 34, 35, 36, 34, 33, 35, 34, 33]
          },
          {
            name: '餐饮',
            data: [22, 23, 24, 23, 22, 21, 23, 24, 25, 24, 23, 22, 21, 23, 24, 25, 24, 23, 22, 21, 23, 24, 25, 24, 23, 22, 21, 23, 24, 25]
          },
          {
            name: '办公',
            data: [27, 28, 29, 28, 27, 26, 28, 29, 30, 29, 28, 27, 26, 28, 29, 30, 29, 28, 27, 26, 28, 29, 30, 29, 28, 27, 26, 28, 29, 30]
          },
          {
            name: '文娱',
            data: [16, 17, 18, 17, 16, 15, 17, 18, 19, 18, 17, 16, 15, 17, 18, 19, 18, 17, 16, 15, 17, 18, 19, 18, 17, 16, 15, 17, 18, 19]
          },
          {
            name: '新能源',
            data: [9, 10, 11, 10, 9, 8, 10, 11, 12, 11, 10, 9, 8, 10, 11, 12, 11, 10, 9, 8, 10, 11, 12, 11, 10, 9, 8, 10, 11, 12]
          }
        ]
      },
      THIS_YEAR: {
        xData: ['2023-01', '2023-02', '2023-03', '2023-04', '2023-05', '2023-06', '2023-07', '2023-08', '2023-09', '2023-10', '2023-11', '2023-12'],
        series: [
          {
            name: '零售',
            data: [35, 34, 33, 32, 34, 36, 35, 33, 32, 34, 35, 36]
          },
          {
            name: '餐饮',
            data: [20, 21, 22, 23, 24, 25, 24, 23, 22, 21, 20, 22]
          },
          {
            name: '办公',
            data: [30, 29, 28, 27, 26, 25, 26, 27, 28, 27, 25, 24]
          },
          {
            name: '文娱',
            data: [12, 13, 14, 15, 16, 17, 16, 18, 17, 16, 15, 14]
          },
          {
            name: '新能源',
            data: [3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 11, 10]
          }
        ]
      }
    }

    const updateChart = (): void => {
      if (!chartInstance) {
        // (function(){})('图表实例未初始化')
        return
      }

      try {
        const currentData = mockData[timeRange.value.timeType]
        if (!currentData) {
          // (function(){})('未找到对应时间范围的数据')
          return
        }

        const option = {
          tooltip: {
            trigger: 'axis',
            formatter: (params): string => {
              let result = `${params[0].axisValue}<br/>`
              params.forEach(param => {
                if (param.value !== null) {
                  result += `${param.marker}${param.seriesName}：${param.value}%<br/>`
                }
              })
              return result
            }
          },
          grid: {
            top: calcFontSize(40),
            left: calcFontSize(10),
            right: calcFontSize(0),
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
            data: currentData.xData,
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
            name: '面积占比(%)',
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
          series: currentData.series.map((item, index) => ({
            name: item.name,
            type: 'line',
            data: item.data,
            smooth: true,
            showSymbol: false, // 不显示数据点
            symbol: 'none', // 确保不显示数据点
            itemStyle: {
              color: ['#3B82F6', '#10B981', '#F59E0B', '#EC4899', '#8B5CF6'][index]
            },
            lineStyle: {
              width: 3
            },
            areaStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                {
                  offset: 0,
                  color: [
                    'rgba(59, 130, 246, 0.3)',
                    'rgba(16, 185, 129, 0.3)',
                    'rgba(245, 158, 11, 0.3)',
                    'rgba(236, 72, 153, 0.3)',
                    'rgba(139, 92, 246, 0.3)'
                  ][index]
                },
                {
                  offset: 1,
                  color: [
                    'rgba(59, 130, 246, 0.05)',
                    'rgba(16, 185, 129, 0.05)',
                    'rgba(245, 158, 11, 0.05)',
                    'rgba(236, 72, 153, 0.05)',
                    'rgba(139, 92, 246, 0.05)'
                  ][index]
                }
              ])
            }
          }))
        }

        chartInstance.setOption(option)
      } catch {
      }
    }

    const initChart = (): void => {
      if (!chartRef.value) return
      chartInstance = echarts.init(chartRef.value)
      updateChart()
    }

    const chartResize = (): void => {
      if (chartInstance) {
        chartInstance.resize()
      }
    }

    onMounted(() => {
      nextTick(() => {
        initChart()
        window.addEventListener('resize', chartResize)
      })
    })

    onUnmounted(() => {
      chartInstance?.dispose()
      window.removeEventListener('resize', chartResize) // 修正：使用正确的函数名chartResize
    })

    watch(() => timeRange.value.timeType, updateChart)

    return (): JSX.Element => (
      <SubPanelTemplate title='项目业态资源趋势分析' v-slots={{
        extra: () => (
          <DateInlineForm v-model:modelValue={timeRange.value}></DateInlineForm>
        )
      }}>
        <div class='card-container-3' ref={chartRef}></div>
      </SubPanelTemplate>
    )
  }
})