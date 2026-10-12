import { defineComponent, reactive, onMounted, onUnmounted, ref } from 'vue'
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue"
import DateInlineForm from "@/components/businessPanel/public/dateInlineForm.vue"
import * as echarts from 'echarts'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { BarChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent
} from 'echarts/components'
import { calcFontSize } from '@/utils/common'
import { PZService } from '@/components/businessPanel/pz-demo/card-service/service'

use([
  CanvasRenderer,
  BarChart,
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent
])

export const StudentAttendanceStatistics = defineComponent({
  name: 'StudentAttendanceStatistics',
  setup () {
    // 图表实例
    let chartInstance: echarts.ECharts | null = null
    const chartRef = ref(null)

    // 当前选中的时间范围
    const selectedTime = ref({
      timeType: 'THIS_YEAR',
      dateRange: []
    })

    // 模拟考勤数据
    const attendanceData = reactive({
      xAxisData: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
      fullAttendance: [120, 132, 101, 134, 90, 30, 110, 120, 132, 101, 134, 90], // 全勤数据
      late: [20, 32, 21, 34, 20, 10, 20, 20, 32, 21, 34, 20], // 迟到数据
      absent: [10, 12, 11, 14, 10, 5, 10, 10, 12, 11, 14, 10]// 旷课数据
    })

    // 初始化图表
    const initChart = (el: HTMLElement): void => {
      chartInstance = echarts.init(el)

      const option = {
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          },
          textStyle: {
            fontSize: calcFontSize(12)
          }
        },
        legend: {
          data: ['全勤', '迟到', '旷课'],
          textStyle: {
            color: '#ffffff',
            fontSize: calcFontSize(12)
          },
          top: 0,
          right: 0, // 将图例放置在右侧
          orient: 'horizontal', // 水平排列
          itemGap: calcFontSize(5) // 增加图例项之间的间距
        },
        grid: {
          left: calcFontSize(10),
          right: calcFontSize(10),
          top: calcFontSize(50),
          bottom: calcFontSize(20),
          containLabel: true
        },
        xAxis: {
          type: 'category',
          data: attendanceData.xAxisData,
          axisLine: {
            lineStyle: {
              color: 'rgba(255, 255, 255, 0.3)'
            }
          },
          axisLabel: {
            color: '#ffffff',
            fontSize: calcFontSize(12)
          }
        },
        yAxis: {
          type: 'value',
          name: '学生数量',
          nameTextStyle: {
            color: '#ffffff',
            fontSize: calcFontSize(12),
            padding: [0, calcFontSize(30), 0, 0] // 增加Y轴名称的右侧内边距
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
            name: '全勤',
            type: 'bar',
            stack: '考勤',
            emphasis: {
              focus: 'series'
            },
            itemStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: '#36D399' },
                { offset: 1, color: 'rgba(54, 211, 153, 0.5)' }
              ])
            },
            data: attendanceData.fullAttendance
          },
          {
            name: '迟到',
            type: 'bar',
            stack: '考勤',
            emphasis: {
              focus: 'series'
            },
            itemStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: '#FBBD23' },
                { offset: 1, color: 'rgba(251, 189, 35, 0.5)' }
              ])
            },
            data: attendanceData.late
          },
          {
            name: '旷课',
            type: 'bar',
            stack: '考勤',
            emphasis: {
              focus: 'series'
            },
            itemStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: '#F87272' },
                { offset: 1, color: 'rgba(248, 114, 114, 0.5)' }
              ])
            },
            data: attendanceData.absent
          }
        ]
      }

      chartInstance.setOption(option)
    }

    // 处理时间选择器变化
    const handleTimeChange = (): void => {
      // // 模拟数据更新
      // if (selectedTime.value.timeType === 'TODAY') {
      //   // 今日数据，按小时统计
      //   attendanceData.xAxisData = ['8时', '9时', '10时', '11时', '12时', '13时', '14时', '15时', '16时', '17时', '18时', '19时']
      //   attendanceData.fullAttendance = [45, 50, 55, 60, 30, 40, 55, 60, 65, 60, 55, 40]
      //   attendanceData.late = [5, 3, 2, 1, 0, 4, 2, 1, 0, 0, 0, 0]
      //   attendanceData.absent = [2, 1, 1, 0, 0, 1, 0, 0, 0, 1, 2, 1]
      // } else if (selectedTime.value.timeType === 'THIS_WEEK') {
      //   // 本周数据，按天统计
      //   attendanceData.xAxisData = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
      //   attendanceData.fullAttendance = [120, 132, 101, 134, 90, 30, 20]
      //   attendanceData.late = [20, 15, 18, 12, 10, 5, 2]
      //   attendanceData.absent = [10, 8, 12, 6, 5, 2, 1]
      // } else if (selectedTime.value.timeType === 'THIS_MONTH') {
      //   // 本月数据，按周统计
      //   attendanceData.xAxisData = ['第1周', '第2周', '第3周', '第4周', '第5周']
      //   attendanceData.fullAttendance = [480, 520, 510, 490, 450]
      //   attendanceData.late = [60, 55, 50, 45, 40]
      //   attendanceData.absent = [30, 25, 28, 22, 20]
      // } else if (selectedTime.value.timeType === 'THIS_YEAR') {
      //   // 今年数据，按月统计
      //   attendanceData.xAxisData = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
      //   attendanceData.fullAttendance = [120, 132, 101, 134, 90, 30, 110, 120, 132, 101, 134, 90]
      //   attendanceData.late = [20, 32, 21, 34, 20, 10, 20, 20, 32, 21, 34, 20]
      //   attendanceData.absent = [10, 12, 11, 14, 10, 5, 10, 10, 12, 11, 14, 10]
      // }
      getData()

      // 更新图表
      chartResize()
    }

    // 图表重绘
    const chartResize = (): void => {
      chartInstance && chartInstance.dispose()
      setTimeout(() => {
        chartRef.value && initChart(chartRef.value as HTMLElement)
      }, 100)
    }
    const getData = async (): Promise<void>=>{
      const result = await PZService.school.getStudentAttendanceStatistics({
        type: selectedTime.value.timeType,
        period: selectedTime.value.dateRange.join(',')
      })
      attendanceData.xAxisData = result.map(item=>item.time)
      attendanceData.fullAttendance = result.map(item=>item.full)
      attendanceData.late = result.map(item=>item.beLate)
      attendanceData.absent = result.map(item=>item.playTruant)
      chartRef.value && initChart(chartRef.value as HTMLElement)
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
      extra: (): JSX.Element => <DateInlineForm v-model:modelValue={selectedTime.value} onSearch={() => handleTimeChange()} />
    }

    return (): JSX.Element => (
      <SubPanelTemplate title="学生考勤统计" v-slots={panelSlots}>
        <div class="card-container-2" ref={chartRef}></div>
      </SubPanelTemplate>
    )
  }
})