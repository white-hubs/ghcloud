import { defineComponent, onMounted, onUnmounted, ref, watch } from 'vue'
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import * as echarts from 'echarts'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { LineChart } from 'echarts/charts'
import {
  GridComponent,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  MarkPointComponent
} from 'echarts/components'
import { calcFontSize } from '@/utils/common'
import DateInlineForm from "@/components/businessPanel/public/dateInlineForm.vue";

use([
  CanvasRenderer,
  LineChart,
  GridComponent,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  MarkPointComponent
])

export const ActivityTrend = defineComponent({
  name: 'ActivityTrend',
  setup () {
    let chartInstance = null
    const chartRef = ref<HTMLElement | null>(null)
    const timeRange = ref({
      timeType: 'THIS_WEEK',
    })
    
    // 模拟数据
    const chartData = {
      week: {
        xAxis: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
        series: [25, 32, 28, 35, 40, 30, 20]
      },
      month: {
        xAxis: ['第1周', '第2周', '第3周', '第4周'],
        series: [120, 140, 130, 150]
      },
      semester: {
        xAxis: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
        series: [80, 90, 110, 130, 150, 160, 140, 120, 170, 190, 200, 180]
      }
    }
    
    // 当前显示的数据
    const currentData = ref({
      xAxis: chartData.week.xAxis,
      series: chartData.week.series
    })

    const initChart = (el: HTMLElement): void => {
      chartInstance = echarts.init(el)
      updateChart()
    }
    
    // 更新图表
    const updateChart = (): void => {
      if (!chartInstance) return
      
      const dataLength = currentData.value.xAxis.length
      
      // 根据数据量动态计算标签间隔和旋转角度
      const getAxisConfig = (length: number) => {
        if (length <= 4) {
          return { interval: 0, rotate: 0, fontSize: calcFontSize(12) }
        } else if (length <= 7) {
          return { interval: 0, rotate: 0, fontSize: calcFontSize(10) }
        } else if (length <= 10) {
          return { interval: 0, rotate: 30, fontSize: calcFontSize(10) }
        } else {
          return { interval: 1, rotate: 45, fontSize: calcFontSize(9) }
        }
      }
      
      const axisConfig = getAxisConfig(dataLength)
      
      chartInstance.setOption({
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          },
          textStyle: {
            fontSize: calcFontSize(12),
          }
        },
        legend: {
          data: ['活动数量'],
          right: 0,
          top: 0,
          textStyle: {
            fontSize: calcFontSize(12),
            color: '#ffffff'
          }
        },
        grid: {
          left: calcFontSize(30),
          right: calcFontSize(10),
          top: calcFontSize(50),
          bottom: dataLength > 7 ? calcFontSize(60) : calcFontSize(40) // 根据是否旋转调整底部空间
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
          data: currentData.value.xAxis,
          name: '',
          axisLabel: {
            interval: axisConfig.interval,
            color: '#ffffff',
            fontSize: axisConfig.fontSize,
            rotate: axisConfig.rotate,
            margin: 10,
            overflow: 'truncate',
            width: dataLength > 10 ? 60 : undefined // 长标签时限制宽度
          },
          nameTextStyle: {
            color: '#ffffff',
            fontSize: calcFontSize(12)
          }
        },
        yAxis: {
          type: 'value',
          name: '活动数量',
          axisLabel: {
            interval: 0,
            color: '#ffffff',
            fontSize: calcFontSize(12)
          },
          nameTextStyle: {
            color: '#ffffff',
            fontSize: calcFontSize(12)
          },
          min: 0
        },
        series: [{
          name: '活动数量',
          type: 'line',
          smooth: true,
          data: currentData.value.series,
          markPoint: {
            data: [
              { type: 'max', name: '最高峰' }
            ],
            label: {
              show: true,
              color: '#ffffff',
              fontSize: calcFontSize(12)
            }
          },
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#3B82F6' },
              { offset: 1, color: '#93C5FD' }
            ])
          },
          lineStyle: {
            width: 3,
            color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
              { offset: 0, color: '#3B82F6' },
              { offset: 1, color: '#93C5FD' }
            ])
          },
          symbolSize: 8,
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(59, 130, 246, 0.5)' },
              { offset: 1, color: 'rgba(59, 130, 246, 0.1)' }
            ])
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
      chartRef.value && initChart(chartRef.value as HTMLElement)
      window.addEventListener('resize', chartResize)
    })
    
    onUnmounted(() => {
      chartInstance && chartInstance.dispose()
      window.removeEventListener('resize', chartResize)
    })

    watch(()=>timeRange.value.timeType, ()=>{
      if (timeRange.value.timeType === 'THIS_WEEK'){
        currentData.value = {
          xAxis: chartData.week.xAxis,
          series: chartData.week.series
        }
      } else if (timeRange.value.timeType === 'THIS_MONTH'){
        currentData.value = {
          xAxis: chartData.month.xAxis,
          series: chartData.month.series
        }
      } else if (timeRange.value.timeType === 'THIS_SEMESTER'){
        currentData.value = {
          xAxis: chartData.semester.xAxis,
          series: chartData.semester.series
        }
      }
      updateChart()
    })

    return (): JSX.Element => (
      <SubPanelTemplate title="活动趋势走向" v-slots={{
        extra: () => (
          <DateInlineForm v-model:modelValue={timeRange.value} timeList={[
            { label: "按周", value: "THIS_WEEK" },
            { label: "按月", value: "THIS_MONTH" },
            { label: "按学期", value: "THIS_SEMESTER" }
          ]}></DateInlineForm>
        )
      }}>
        <div class='card-container-3' ref={chartRef} style="height: 300px;"></div>
      </SubPanelTemplate>
    )
  }
})