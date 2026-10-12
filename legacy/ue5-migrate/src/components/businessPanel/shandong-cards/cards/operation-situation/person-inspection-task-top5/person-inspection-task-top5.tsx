import { defineComponent, ref, onMounted, watch, onUnmounted, reactive, nextTick } from 'vue'
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
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import styles from './person-inspection-task-top5.module.less'
import DateInlineForm from "@/components/businessPanel/public/dateInlineForm.vue"
import { cubeMaintainStatisticsService } from '@/api/service'
import NoData from "@/components/businessPanel/public/noData.vue";

use([
  BarChart,
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent
])
export const PersonInspectionTaskTop5 = defineComponent({
  name: 'PersonInspectionTaskTop5',
  setup () {
    // 时间范围选择
    const timeRange = ref({
      timeType: 'THIS_MONTH',
      dateRange: []
    })
    // 图表实例
    let chartInstance = null
    const chartRef = ref(null)
    const chartData = reactive({
      names: [],
      totalNumbers: [],
      finishNumbers: [],
    })
    const getData = async (): Promise<void> => {
      const result = await cubeMaintainStatisticsService.getPatrolTaskTop5({
        type: timeRange.value.timeType,
        period: timeRange.value.dateRange.join(',')
      })
      const data = [...result].sort((a, b) => b.total - a.total)
      chartData.names = data.map(item=>item.name)
      chartData.totalNumbers = data.map(item => item.total)
      chartData.finishNumbers = data.map(item => item.finishNum)
    }

    // 更新图表
    const updateChart = async (): Promise<void> => {
      await getData()
      // 确保图表实例存在
      if (!chartInstance && chartRef.value) {
        chartInstance = echarts.init(chartRef.value as HTMLElement)
      }
      const option = {
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          },
          formatter: (params): string => {
            let result = `${params[0].name}<br/>`
            // 为每个数据项添加对应的颜色标识
            params.forEach(param => {
              const color = param.color?.colorStops[0]?.color
              const colorSpan = `<span style="display:inline-block;margin-right:5px;border-radius:50%;width:10px;height:10px;background-color:${color};"></span>`
              if (param.seriesName === '总任务数') {
                result += `${colorSpan}总任务数：${param.value}个<br/>`
              } else if (param.seriesName === '完成任务数') {
                result += `${colorSpan}完成任务数：${param.value}个<br/>`
              }
            })
            
            // 计算完成率
            const totalValue = params.find(p => p.seriesName === '总任务数')?.value || 1
            const finishValue = params.find(p => p.seriesName === '完成任务数')?.value || 0
            result += `完成率：${((finishValue / totalValue) * 100).toFixed(0)}%`
            
            return result
          }
        },
        legend: {
          data: ['总任务数', '完成任务数'],
          right: calcFontSize(35),
          top: calcFontSize(0),
          textStyle: {
            color: '#ffffff',
            fontSize: calcFontSize(12)
          },
          // 添加图例图标样式
          icon: 'circle',
          itemWidth: calcFontSize(10),
          itemHeight: calcFontSize(10),
          // 设置图例颜色
          inactiveColor: 'rgba(255, 255, 255, 0.3)',
          // 自定义图例颜色
          formatter: function(name) {
            return name
          }
        },
        grid: {
          left: '0%',
          right: calcFontSize(35),
          top: calcFontSize(20),
          bottom: calcFontSize(0),
          containLabel: true
        },
        xAxis: {
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
        yAxis: {
          type: 'category',
          data: chartData.names,
          inverse: true, 
          axisLabel: {
            color: '#ffffff',
            fontSize: calcFontSize(12)
          },
          axisLine: {
            lineStyle: {
              color: 'rgba(255, 255, 255, 0.3)'
            }
          },
        },
        series: [
          {
            name: '总任务数',
            type: 'bar',
            data: chartData.totalNumbers,
            itemStyle: {
              color: new echarts.graphic.LinearGradient(1, 0, 0, 0, [
                { offset: 0, color: '#3b82f6' },
                { offset: 1, color: 'rgba(59, 130, 246, 0.3)' }
              ])
            },
            barWidth: chartData.names.length > 3 ? calcFontSize(10) : calcFontSize(15),
            label: {
              show: true,
              position: 'right',
              formatter: '{c}个',
              color: '#ffffff',
              fontSize: calcFontSize(12),
              distance: 5,  // 增加标签与柱子的距离
              overflow: 'truncate'
            }
          },
          {
            name: '完成任务数',
            type: 'bar',
            data: chartData.finishNumbers,
            itemStyle: {
              color: new echarts.graphic.LinearGradient(1, 0, 0, 0, [
                { offset: 0, color: 'rgba(42, 232, 189, 0.8)' },
                { offset: 1, color: 'rgba(42, 232, 189, 0.1)' }
              ])
            },
            barWidth: chartData.names.length > 3 ? calcFontSize(10) : calcFontSize(15),
            label: {
              show: true,
              position: 'right',
              formatter: '{c}个',
              color: '#ffffff',
              fontSize: calcFontSize(12),
              distance: 5,  // 增加标签与柱子的距离
              overflow: 'truncate'
            }
          }
        ]
      }
      chartInstance.setOption(option)
    }
    const initChart = (): void => {
      if (chartRef.value) {
        chartInstance = echarts.init(chartRef.value as HTMLElement)
        updateChart()
      }
    }
    watch(() => timeRange.value.timeType, () => {
      updateChart()
    })

    const handleResize = () => {
      chartInstance && chartInstance.dispose()
      setTimeout(() => {
        initChart()
      }, 1000);
    }
    onMounted(async () => {
      await nextTick()
      initChart()
      window.addEventListener('resize', handleResize)
    })
    onUnmounted(() => {
      chartInstance?.dispose()
      window.removeEventListener('resize', handleResize)
    })


    return (): JSX.Element => (
      <SubPanelTemplate title="人员巡检任务top5" v-slots={{
        extra: () => (
          <DateInlineForm v-model:modelValue={timeRange.value}
          timeList={[
            { label: "本周", value: "THIS_WEEK" },
            { label: "本月", value: "THIS_MONTH" },
            { label: "今年", value: "THIS_YEAR" }
          ]} />
        )
      }}>
        <div class={['card-container-3']} >
          {chartData.names.length === 0 && <NoData />}
          <div ref={chartRef} style="width: 100%; height: 100%" ></div>
        </div>
      </SubPanelTemplate>
    )
  }
})