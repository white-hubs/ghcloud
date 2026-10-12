import { defineComponent, onMounted, onUnmounted, ref } from 'vue'
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
import { TimeSelector } from '../courseware-overview/time-selector';
import { PeriodStatTypeEnum } from '@ghcloud/cube-protocol'
import { PZService } from '../../../card-service/service'
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
    const chartRef = ref(null)
    // const timeRange = ref({
    //   timeType: 'THIS_WEEK',
    // })
    const selectedTime = ref({
      timeType: PeriodStatTypeEnum.THIS_WEEK,
      dateRange: [],
    })

    // 模拟数据
    const chartData = {
      xAxis: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
      series: [25, 32, 28, 35, 40, 30, 20]
    }

    // // 当前显示的数据
    // const currentData = ref({
    //   xAxis: chartData.week.xAxis,
    //   series: chartData.week.series
    // })

    const initChart = (el: HTMLElement): void => {
      chartInstance = echarts.init(el)
      updateChart()
    }

    // 动态计算标签间隔和旋转角度
    const getAxisLabelConfig = (dataLength: number) => {
      if (dataLength <= 7) {
        return {
          interval: 0,
          rotate: 0,
          margin: 8
        }
      } else if (dataLength <= 15) {
        return {
          interval: 1,
          rotate: 45,
          margin: 15
        }
      } else if (dataLength <= 30) {
        return {
          interval: Math.ceil(dataLength / 8),
          rotate: 45,
          margin: 20
        }
      } else {
        return {
          interval: Math.ceil(dataLength / 6),
          rotate: 60,
          margin: 25
        }
      }
    }

    // 更新图表
    const updateChart = (): void => {
      if (!chartInstance) return

      const labelConfig = getAxisLabelConfig(chartData.xAxis.length)

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
          left: calcFontSize(0),
          right: calcFontSize(10),
          top: calcFontSize(50),
          bottom: calcFontSize(labelConfig.rotate > 0 ? 60 : 30),
        },
        xAxis: {
          axisTick: {
            lineStyle: {
              color: '#ffffff'
            }
          },
          type: 'category',
          data: chartData.xAxis,
          name: '',
          axisLine: {
            lineStyle: {
              color: 'rgba(255, 255, 255, 0.3)'
            }
          },
          axisLabel: {
            interval: labelConfig.interval,
            rotate: labelConfig.rotate,
            margin: labelConfig.margin,
            color: '#ffffff',
            fontSize: calcFontSize(12),
            overflow: 'truncate',
            width: labelConfig.rotate > 0 ? 60 : undefined
          },
          nameTextStyle: {
            color: '#ffffff',
            fontSize: calcFontSize(12)
          }
        },
        yAxis: {
          type: 'value',
          name: '活动数量',
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
        series: [{
          name: '活动数量',
          type: 'line',
          smooth: true,
          data: chartData.series,
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
    const getData = async (): Promise<void>=>{
      // TODO: 获取数据
      const result = await PZService.school.getActivityTrendAnalysis({
        type: selectedTime.value.timeType,
        period: selectedTime.value.dateRange.join(',')
      })
      chartData.series = result.map(item=>item.count)
      chartData.xAxis = result.map(item=>item.time)
      updateChart()
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
    const handleTimeChange = (): void => {
      getData()
    }

    // watch(()=>timeRange.value.timeType, ()=>{
    //   if (timeRange.value.timeType === 'THIS_WEEK'){
    //     currentData.value = {
    //       xAxis: chartData.week.xAxis,
    //       series: chartData.week.series
    //     }
    //   } else if (timeRange.value.timeType === 'THIS_MONTH'){
    //     currentData.value = {
    //       xAxis: chartData.month.xAxis,
    //       series: chartData.month.series
    //     }
    //   } else if (timeRange.value.timeType === 'THIS_SEMESTER'){
    //     currentData.value = {
    //       xAxis: chartData.semester.xAxis,
    //       series: chartData.semester.series
    //     }
    //   }
    //   updateChart()
    // })

    return (): JSX.Element => (
      <SubPanelTemplate title="活动趋势走向" v-slots={{
        extra: () => (
          <TimeSelector v-model:value={selectedTime.value} onTimeChange={handleTimeChange} />
        )
      }}>
        <div class='card-container-2' ref={chartRef} ></div>
      </SubPanelTemplate>
    )
  }
})