import { defineComponent, onMounted, onUnmounted, ref } from 'vue'
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import * as echarts from 'echarts'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { BarChart } from 'echarts/charts'
import {
  GridComponent,
  TitleComponent,
  TooltipComponent,
  LegendComponent
} from 'echarts/components'
import { calcFontSize } from '@/utils/common'

use([
  CanvasRenderer,
  BarChart,
  GridComponent,
  TitleComponent,
  TooltipComponent,
  LegendComponent
])

export const BuildingStatistics = defineComponent({
  name: 'BuildingStatistics',
  setup () {
    let chartInstance = null
    const chartRef = ref<HTMLElement | null>(null)

    // 模拟数据 - 实际项目中应该通过API获取
    const chartData = {
      areas: ['城东区', '城西区', '城南区', '城北区', '中心商圈'],
      buildingCount: [42, 35, 28, 38, 50],
      totalArea: [85, 72, 56, 78, 95],
      avgFloors: [25, 22, 30, 24, 40]
    }

    const initChart = (el: HTMLElement): void => {
      chartInstance = echarts.init(el)
      chartInstance.setOption({
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          },
          formatter: function (params) {
            const area = params[0].axisValue
            const buildingCount = params[0].value
            const totalArea = params[1].value
            const avgFloors = params[2].value
            return `${area}<br/>
                    建筑数量：${buildingCount}栋<br/>
                    总面积：${totalArea}㎡<br/>
                    平均层数：${avgFloors}层`
          }
        },
        grid: {
          left: calcFontSize(10),
          right: calcFontSize(10),
          top: calcFontSize(40),
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
          data: chartData.areas,
          axisLabel: {
            color: '#ffffff',
            fontSize: calcFontSize(12)
          },
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
          },
          axisLine: {
            lineStyle: {
              color: 'rgba(255, 255, 255, 0.3)'
            }
          }
        },
        series: [
          {
            name: '建筑数量',
            type: 'bar',
            data: chartData.buildingCount,
            itemStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: '#3b82f6' },
                { offset: 1, color: 'rgba(59, 130, 246, 0.3)' }
              ])
            },
            // barWidth: calcFontSize(30),
          },
          {
            name: '总面积(㎡/100)',
            type: 'bar',
            data: chartData.totalArea,
            itemStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: '#10b981' },
                { offset: 1, color: 'rgba(16, 185, 129, 0.3)' }
              ])
            },
            // barWidth: calcFontSize(30),
          },
          {
            name: '平均层数',
            type: 'bar',
            data: chartData.avgFloors,
            itemStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: '#f59e0b' },
                { offset: 1, color: 'rgba(245, 158, 11, 0.3)' }
              ])
            },
            // barWidth: calcFontSize(30),
          }
        ]
      })
    }

    const chartResize = (): void => {
      chartInstance && chartInstance.dispose()
      setTimeout(() => {
        chartRef.value && initChart(chartRef.value as HTMLElement)
      }, 1000);
    }

    onMounted(() => {
      chartRef.value && initChart(chartRef.value as HTMLElement)
      window.addEventListener('resize', chartResize)
    })

    onUnmounted(() => {
      chartInstance && chartInstance.dispose()
      window.removeEventListener('resize', chartResize)
    })

    return (): JSX.Element => (
      <SubPanelTemplate title="建筑统计">
        <div class='card-container-4' ref={chartRef}></div>
      </SubPanelTemplate>
    )
  }
})