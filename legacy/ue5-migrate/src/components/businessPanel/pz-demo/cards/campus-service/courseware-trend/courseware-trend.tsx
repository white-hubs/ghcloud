import { defineComponent, reactive, ref, onMounted, onUnmounted } from 'vue'
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue"
import * as echarts from 'echarts'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { LineChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
  MarkPointComponent
} from 'echarts/components'
import { calcFontSize } from '@/utils/common'
import { TimeSelector } from '../courseware-overview/time-selector'
import { PeriodStatTypeEnum } from '@ghcloud/cube-protocol'
import { PZService } from '../../../card-service/service'
use([
  CanvasRenderer,
  LineChart,
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
  MarkPointComponent
])

export const CoursewareTrend = defineComponent({
  name: 'CoursewareTrend',
  setup () {
    // 图表实例
    let chartInstance: echarts.ECharts | null = null
    const chartRef = ref(null)
    const selectedTime = ref({
      timeType: PeriodStatTypeEnum.THIS_WEEK,
      dateRange: [],
    })

    // 模拟数据
    const coursewareData = reactive({
      xAxis: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
      data: [20, 25, 20, 22, 23, 22, 28]
    })

    // 初始化图表
    const initChart = (el: HTMLElement): void => {
      chartInstance = echarts.init(el)
      updateChart()
    }

    // 更新图表
    const updateChart = (): void => {
      if (!chartInstance) return

      // const currentData = coursewareData[selectedTimeOption.value]

      const option = {
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow',
            shadowStyle: {
              color: 'rgba(0, 191, 255, 0.1)'
            }
          },
          textStyle: {
            fontSize: calcFontSize(12)
          },
          backgroundColor: 'rgba(0, 30, 60, 0.8)',
          borderColor: 'rgba(0, 191, 255, 0.3)',
          borderWidth: 1
        },
        grid: {
          top: calcFontSize(40),
          left: calcFontSize(20),
          right: calcFontSize(10),
          bottom: calcFontSize(30), // 增加底部空间，为滚动条和标签留出更多空间
          containLabel: true
        },
        xAxis: {
          type: 'category',
          data: coursewareData.xAxis,
          boundaryGap: false,
          axisLine: {
            lineStyle: {
              color: 'rgba(255, 255, 255, 0.3)'
            }
          },
          axisLabel: {
            color: '#ffffff',
            fontSize: calcFontSize(12),
            margin: 8
          }
        },
        yAxis: {
          type: 'value',
          name: '新增课件数量',
          nameTextStyle: {
            color: '#ffffff',
            fontSize: calcFontSize(12),
            padding: [0, calcFontSize(30), 0, 0]
          },
          axisLine: {
            lineStyle: {
              color: 'rgba(255, 255, 255, 0.3)'
            }
          },
          splitLine: {
            lineStyle: {
              color: 'rgba(255, 255, 255, 0.1)',
              type: 'dashed'
            }
          },
          axisLabel: {
            color: '#ffffff',
            fontSize: calcFontSize(12)
          }
        },
        series: [
          {
            name: '新增课件数量',
            type: 'line',
            data: coursewareData.data,
            smooth: true,
            symbol: 'emptyCircle',
            symbolSize: 8,
            showSymbol: false,
            emphasis: {
              focus: 'series',
              scale: true,
              showSymbol: true
            },
            markPoint: {
              data: [
                { type: 'max', name: '最高峰' }
              ],
              label: {
                color: '#ffffff',
                fontSize: calcFontSize(12)
              }
            },
            itemStyle: {
              color: '#00BFFF',
              borderWidth: 2,
              borderColor: '#ffffff'
            },
            lineStyle: {
              width: 4,
              shadowColor: 'rgba(0, 191, 255, 0.5)',
              shadowBlur: 10,
              color: {
                type: 'linear',
                x: 0,
                y: 0,
                x2: 1,
                y2: 0,
                colorStops: [
                  { offset: 0, color: '#00BFFF' },
                  { offset: 0.5, color: '#1E90FF' },
                  { offset: 1, color: '#00BFFF' }
                ]
              }
            },
            areaStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: 'rgba(0, 191, 255, 0.6)' },
                { offset: 0.5, color: 'rgba(0, 191, 255, 0.2)' },
                { offset: 1, color: 'rgba(0, 191, 255, 0.05)' }
              ]),
              shadowColor: 'rgba(0, 191, 255, 0.2)',
              shadowBlur: 20
            }
          }
        ]
      }

      chartInstance.setOption(option)
    }

    // 处理时间选择变化
    const handleTimeChange = (): void => {
      getData()
    }
    const getData = async (): Promise<void> =>{
      const result = await PZService.school.getCoursewareTrendAnalysis({
        type: selectedTime.value.timeType,
        period: selectedTime.value.dateRange.join(',')
      })
      coursewareData.xAxis = result.map(item=>item.time)
      coursewareData.data = result.map(item=>item.count)
      updateChart()
    }

    // 图表重绘
    const chartResize = (): void => {
      chartInstance && chartInstance.resize()
    }

    onMounted(() => {
      chartRef.value && initChart(chartRef.value as HTMLElement)
      window.addEventListener('resize', chartResize)
    })

    onUnmounted(() => {
      chartInstance && chartInstance.dispose()
      window.removeEventListener('resize', chartResize)
    })

    // 定义插槽
    const panelSlots = {
      extra: (): JSX.Element => (
        <TimeSelector v-model:value={selectedTime.value} onTimeChange={handleTimeChange} />
      )
    }

    return (): JSX.Element => (
      <SubPanelTemplate title="课件趋势" v-slots={panelSlots}>
        <div class="card-container-2" ref={chartRef}></div>
      </SubPanelTemplate>
    )
  }
})