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
import { PZService } from '@/components/businessPanel/pz-demo/card-service/service'
import { TimeSelector } from './time-selector'
import { PeriodStatTypeEnum } from '@ghcloud/cube-protocol'
import { calcFontSize } from '@/utils/common'

use([
  CanvasRenderer,
  LineChart,
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
  MarkPointComponent
])

export const CoursewareOverview = defineComponent({
  name: 'CoursewareOverview',
  setup () {
    // 图表实例
    let chartInstance: echarts.ECharts | null = null
    const chartRef = ref<HTMLElement | null>(null)
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
            type: 'line',
            lineStyle: {
              color: 'rgba(255, 255, 255, 0.3)',
              width: 1,
              type: 'solid'
            }
          },
          textStyle: {
            fontSize: calcFontSize(12)
          },
        },
        grid: {
          top: calcFontSize(40),
          left: calcFontSize(10),
          right: calcFontSize(10),
          bottom: calcFontSize(30), // 增加底部空间，为滚动条和标签留出更多空间
          containLabel: true
        },
        xAxis: {
          type: 'category',
          data: coursewareData.xAxis,
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
          name: '数量',
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
            symbol: 'circle',
            symbolSize: 8,
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
              color: '#3B82F6'
            },
            lineStyle: {
              width: 3,
              color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
                { offset: 0, color: '#3B82F6' },
                { offset: 1, color: '#8B5CF6' }
              ])
            },
            areaStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: 'rgba(59, 130, 246, 0.5)' },
                { offset: 1, color: 'rgba(59, 130, 246, 0.1)' }
              ])
            }
          }
        ]
      }

      chartInstance.setOption(option)
    }
    const handleTimeChange = (): void=>{
      getData()
    }

    // todo: 时间需要单独处理
    const getData = async (): Promise<void>=>{
      const result = await PZService.school.getCoursewareOverview({
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
      getData()
      window.addEventListener('resize', chartResize)
    })

    onUnmounted(() => {
      chartInstance && chartInstance.dispose()
      window.removeEventListener('resize', chartResize)
    })

    // 定义插槽
    const panelSlots = {
      extra: (): JSX.Element => <TimeSelector v-model:value={selectedTime.value} onTimeChange={handleTimeChange} />
    }

    return (): JSX.Element => (
      <SubPanelTemplate title="课件总览" v-slots={panelSlots}>
        <div class="card-container-2" ref={chartRef}></div>
      </SubPanelTemplate>
    )
  }
})