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
import { PZService } from '../../../card-service/service'

use([
  BarChart,
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent
])

export const ParkingChargeStationAreaDistributionAnalysis = defineComponent({
  setup () {
    // 区域分布数据
    const distributionData = ref({
      total: 120,
      areas: [
        { name: 'A区', count: 35, ratio: 29.2 },
        { name: 'B区', count: 28, ratio: 23.3 },
        { name: 'C区', count: 25, ratio: 20.8 },
        { name: 'D区', count: 20, ratio: 16.7 },
        { name: 'E区', count: 12, ratio: 10.0 }
      ]
    })
    const getData = async (): Promise<void> =>{
      try {
        const result = await PZService.parking.getChargingStationAreaDistributionAnalysis()
        distributionData.value = {
          areas: result.map(item => ({
            name: item.areaName,
            count: item.count,
            ratio: item.ratio
          })),
          total: result.reduce((acc, cur) => acc + cur.count, 0)
        }
      } catch {
      }
    }

    // 图表实例
    let chartInstance = null
    const chartRef = ref(null)

    // 初始化图表
    const initChart = async (): Promise<void> => {
      await getData()
      if (!chartRef.value) return

      chartInstance = echarts.init(chartRef.value)
      const option = {
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          },
          formatter: (params): string => {
            const data = params[0]
            return `${data.name}<br/>
                    数量：${data.value}个<br/>
                    占比：${distributionData.value.areas[data.dataIndex].ratio}%`
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
            end: 100,
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
          data: distributionData.value.areas.map(item => item.name),
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
            name: '充电桩数量',
            type: 'bar',
            data: distributionData.value.areas.map(item => item.count),
            itemStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: '#3b82f6' },
                { offset: 1, color: 'rgba(59, 130, 246, 0.3)' }
              ])
            },
            barWidth: '40%'
          }
        ]
      }
      chartInstance.setOption(option)
    }

    onMounted(() => {
      initChart()
      window.addEventListener('resize', () => {
        chartInstance?.resize()
      })
    })

    return (): JSX.Element => (
      <SubPanelTemplate title={`停车充电站区域分析 (总数：${distributionData.value.total})`}>
        <div class='card-container-2' ref={chartRef}></div>
      </SubPanelTemplate>
    )
  }
})