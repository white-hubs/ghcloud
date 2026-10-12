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
import { getTimeRangeInterval, PZService } from '../../../card-service/service'
import { PeriodStatTypeEnum } from '@ghcloud/cube-protocol'

use([
  CanvasRenderer,
  BarChart,
  GridComponent,
  TitleComponent,
  TooltipComponent,
  LegendComponent
])

export const PropertyPaymentTimePeriodAnalysis = defineComponent({
  name: 'PropertyPaymentTimePeriodAnalysis',
  setup () {
    let chartInstance = null
    const chartRef = ref<HTMLElement | null>(null)

    // 生成时间段数据（每2小时一个时间段）
    const generateTimeRanges = (): unknown[] => {
      const ranges = []
      for (let i = 0; i < 24; i += 2) {
        const start = i.toString().padStart(2, '0')
        const end = (i + 2).toString().padStart(2, '0')
        ranges.push(`${start}:00-${end}:00`)
      }
      return ranges
    }

    // 模拟数据
    const chartData = {
      timeRanges: generateTimeRanges(),
      values: [
        5, 3, 2, 1, 2, 4, // 凌晨阶段 (0-12点)
        8, 15, 25, 18, 12, 10, // 白天阶段 (12-24点)
      ]
    }
    const getData = async (): Promise<void>=>{
      const res = await PZService.property.getPropertyPaymentAnalysisPaymentTimePeriodAnalysis(getTimeRangeInterval(PeriodStatTypeEnum.THIS_YEAR), PeriodStatTypeEnum.THIS_YEAR)
      if (res.length){
        chartData.timeRanges = res.map(item => item.time)
        chartData.values = res.map(item => item.count)
      }
      chartRef.value && initChart(chartRef.value as HTMLElement)
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
            return `${params[0].name}<br/>缴费人数: ${params[0].value}人`
          },
          textStyle: {
            fontSize: calcFontSize(12)
          }
        },
        grid: {
          left: calcFontSize(0),
          right: calcFontSize(0),
          top: calcFontSize(40),
          bottom: calcFontSize(0),
          containLabel: true
        },
        xAxis: {
          type: 'category',
          data: chartData.timeRanges,
          axisLabel: {
            interval: 'auto', // 设置为'auto'让echarts自动计算间隔，避免标签重叠
            rotate: 0, // 可以设置为一定角度，比如30，使标签倾斜显示
            color: '#ffffff',
            fontSize: calcFontSize(12)
          },
          axisLine: {
            lineStyle: {
              color: '#ffffff'
            }
          },
          axisTick: {
            alignWithLabel: true,
            lineStyle: {
              color: '#ffffff'
            }
          }
        },
        yAxis: {
          type: 'value',
          name: '缴费人数',
          nameTextStyle: {
            color: '#ffffff',
            fontSize: calcFontSize(12),
            padding: [0, 0, 0, calcFontSize(30)]
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
            type: 'bar',
            data: chartData.values.map((value) => ({
              value: value,
              itemStyle: {
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                  { offset: 0, color: '#188df0' }, // 顶部不透明
                  { offset: 1, color: 'rgba(24, 141, 240, 0)' } // 底部完全透明
                ])
              },
            })),
            barWidth: calcFontSize(20),
            emphasis: {
              itemStyle: {
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                  { offset: 0, color: '#2378f7' },
                  { offset: 1, color: 'rgba(35, 120, 247, 0)' }
                ])
              }
            },
            label: {
              show: true,
              position: 'top',
              color: '#ffffff',
              fontSize: calcFontSize(12)
            }
          }
        ],
        dataZoom: [{
          type: 'slider',
          show: true,
          start: 0,
          end: 33,
          textStyle: {
            color: '#ffffff'
          }
        }]
      })
    }

    const chartResize = (): void => {
      chartInstance && chartInstance.dispose()
      setTimeout(() => {
        chartRef.value && initChart(chartRef.value as HTMLElement)
      }, 1000);
    }

    onMounted(() => {
      getData()
      window.addEventListener('resize', chartResize)
    })
    onUnmounted(() => {
      chartInstance && chartInstance.dispose()
      window.removeEventListener('resize', chartResize)
    })

    return (): JSX.Element => (
      <SubPanelTemplate title='物业缴费时间段分析'>
        <div class='card-container-4' ref={chartRef}></div>
      </SubPanelTemplate>
    )
  }
})