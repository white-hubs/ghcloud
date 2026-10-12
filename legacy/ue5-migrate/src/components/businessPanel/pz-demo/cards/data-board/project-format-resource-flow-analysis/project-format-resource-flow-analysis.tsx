import { defineComponent, ref, onMounted, onUnmounted, nextTick } from 'vue'
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue"
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

use([
  LineChart,
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent
])

export const ProjectFormatResourceFlowAnalysis = defineComponent({
  name: 'ProjectFormatResourceFlowAnalysis',
  setup () {
    let chartInstance = null
    const chartRef = ref(null)

    const initChart = (): void => {
      if (!chartRef.value) return

      try {
        if (chartInstance) {
          chartInstance.dispose()
          chartInstance = null
        }

        chartInstance = echarts.init(chartRef.value)
        const option = {
          tooltip: {
            trigger: 'axis',
            axisPointer: {
              type: 'line',
              lineStyle: {
                color: '#ffffff',
                opacity: 0.3
              }
            },
            padding: [8, 12],
            textStyle: {
              fontSize: calcFontSize(12),
              lineHeight: calcFontSize(20)
            },
            formatter: (params): string => {
              let result = `${params[0].axisValue}<br/>`
              params.forEach(param => {
                result += `${param.marker} ${param.seriesName}：${param.value}㎡<br/>`
              })
              return result
            },
            position: function (point, params, dom, rect, size) {
              // 根据图表大小和鼠标位置自动调整提示框位置
              const [x, y] = point
              const objWidth = size.contentSize[0]
              const objHeight = size.contentSize[1]
              const viewWidth = size.viewSize[0]
              const viewHeight = size.viewSize[1]
              
              let posX = x + 20
              let posY = y + 20
              
              // 右边界检测
              if (posX + objWidth > viewWidth) {
                posX = x - objWidth - 20
              }
              
              // 下边界检测
              if (posY + objHeight > viewHeight) {
                posY = y - objHeight - 20
              }
              
              return [posX, posY]
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
              end: 50,
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
            data: ['1月', '2月', '3月', '4月', '5月', '6月'],
            axisLine: {
              lineStyle: {
                color: '#ffffff',
                opacity: 0.3
              }
            },
            axisLabel: {
              color: '#ffffff',
              fontSize: calcFontSize(12)
            }
          },
          yAxis: {
            type: 'value',
            name: '面积（㎡）',
            nameTextStyle: {
              color: '#ffffff',
              fontSize: calcFontSize(12)
            },
            axisLine: {
              lineStyle: {
                color: '#ffffff',
                opacity: 0.3
              }
            },
            axisLabel: {
              color: '#ffffff',
              fontSize: calcFontSize(12)
            },
            splitLine: {
              lineStyle: {
                color: '#ffffff',
                opacity: 0.1
              }
            }
          },
          series: [
            {
              name: '商业零售',
              type: 'line',
              smooth: true,
              showSymbol: false,
              data: [1200, 1100, 1300, 1150, 1400, 1250],
              itemStyle: { color: '#3B82F6' },
              areaStyle: {
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                  { offset: 0, color: 'rgba(59, 130, 246, 0.3)' },
                  { offset: 1, color: 'rgba(59, 130, 246, 0.05)' }
                ])
              }
            },
            {
              name: '餐饮服务',
              type: 'line',
              smooth: true,
              showSymbol: false,
              data: [800, 850, 900, 950, 1000, 1100],
              itemStyle: { color: '#10B981' },
              areaStyle: {
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                  { offset: 0, color: 'rgba(16, 185, 129, 0.3)' },
                  { offset: 1, color: 'rgba(16, 185, 129, 0.05)' }
                ])
              }
            },
            {
              name: '办公空间',
              type: 'line',
              smooth: true,
              showSymbol: false,
              data: [2000, 1900, 1800, 1700, 1600, 1500],
              itemStyle: { color: '#F59E0B' },
              areaStyle: {
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                  { offset: 0, color: 'rgba(245, 158, 11, 0.3)' },
                  { offset: 1, color: 'rgba(245, 158, 11, 0.05)' }
                ])
              }
            },
            {
              name: '文化娱乐',
              type: 'line',
              smooth: true,
              showSymbol: false,
              data: [600, 650, 700, 750, 800, 850],
              itemStyle: { color: '#EC4899' },
              areaStyle: {
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                  { offset: 0, color: 'rgba(236, 72, 153, 0.3)' },
                  { offset: 1, color: 'rgba(236, 72, 153, 0.05)' }
                ])
              }
            },
            {
              name: '公共服务',
              type: 'line',
              smooth: true,
              showSymbol: false,
              data: [400, 450, 500, 550, 600, 650],
              itemStyle: { color: '#8B5CF6' },
              areaStyle: {
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                  { offset: 0, color: 'rgba(139, 92, 246, 0.3)' },
                  { offset: 1, color: 'rgba(139, 92, 246, 0.05)' }
                ])
              }
            },
            {
              name: '创新产业',
              type: 'line',
              smooth: true,
              showSymbol: false,
              data: [300, 400, 500, 600, 700, 800],
              itemStyle: { color: '#6366F1' },
              areaStyle: {
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                  { offset: 0, color: 'rgba(99, 102, 241, 0.3)' },
                  { offset: 1, color: 'rgba(99, 102, 241, 0.05)' }
                ])
              }
            }
          ]
        }

        chartInstance.setOption(option)
      } catch (error) {
      }
    }

    const handleResize = (): void => {
      chartInstance?.resize()
    }

    onMounted(() => {
      nextTick(() => {
        initChart()
        window.addEventListener('resize', handleResize)
      })
    })

    onUnmounted(() => {
      chartInstance?.dispose()
      window.removeEventListener('resize', handleResize)
    })

    return (): JSX.Element => (
      <SubPanelTemplate title='业态资源流动分析'>
        <div ref={chartRef} class='card-container-3'></div>
      </SubPanelTemplate>
    )
  }
})