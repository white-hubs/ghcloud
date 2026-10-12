import { defineComponent, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import styles from './fault-object-rank-top5.module.less'
import DateInlineForm from "@/components/businessPanel/public/dateInlineForm.vue"
import { calcFontSize } from '@/utils/common'
import * as echarts from 'echarts'
import { use } from 'echarts/core'
import { BarChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent
} from 'echarts/components'
import { cubeMaintainStatisticsService } from '@/api/service'
import NoData from "@/components/businessPanel/public/noData.vue";

use([
  BarChart,
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent
])

export const FaultObjectRankTop5 = defineComponent({
  name: 'FaultObjectRankTop5',
  setup () {
    // 时间范围选择
    const timeRange = ref({
      timeType: 'THIS_MONTH',
      dateRange: []
    })
    const resultData = ref<{  name: string, value: number, ratio: number }[]>([])

    const totalDevices = ref(0)

    // 图表实例
    let chartInstance = null
    const chartRef = ref(null)
    const getData = async (): Promise<void>=>{
      const result = await cubeMaintainStatisticsService.getFaultObjectTop5({
        type: timeRange.value.timeType,
        period: timeRange.value.dateRange.join(',')
      })
      const data = [...result].sort((a, b) => b.faultNum - a.faultNum)
      totalDevices.value = data.reduce((total, item) => total + item.faultNum, 0)
      resultData.value = data.map(item=>{
        return {
          name: item.faultObject,
          value: item.faultNum,
          ratio: +((item.faultNum / totalDevices.value) * 100).toFixed(2)
        }
      })
    }

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
            const data = params[0]
            return `<div style="display:flex;align-items:center;">
              <span>${data.name}</span>
            </div>
            数量：${data.value}个<br/>
            占比：${resultData.value[data.dataIndex].ratio}%`
          }
        },
        grid: {
          left: '0%',
          right: '20%',
          top: calcFontSize(10),
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
          data: resultData.value?.map(item => item.name),
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
            type: 'bar',
            data: resultData.value.map(item => ({
              value: item.value,
              itemStyle: {
                color: new echarts.graphic.LinearGradient(1, 0, 0, 0, [
                  { offset: 0, color: '#3b82f6' },
                  { offset: 1, color: 'rgba(59, 130, 246, 0.3)' }
                ])
              }
            })),
            barWidth: resultData.value.length > 3 ? calcFontSize(20) : calcFontSize(30),
            label: {
              show: true,
              position: 'right',
              formatter: '{c}个',
              color: '#ffffff',
              fontSize: calcFontSize(12),
              distance: 5,  // 增加标签与柱子的距离
              overflow: 'truncate'  // 如果空间不足，截断文本而不是完全隐藏
            }
          }
        ]
      }
      chartInstance.setOption(option)
    }
    // 初始化图表
    const initChart = (): void => {
      if (chartRef.value) {
        chartInstance = echarts.init(chartRef.value as HTMLElement)
        updateChart()
      }
    }

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

    watch(() => timeRange.value.timeType, () => {
      updateChart()
    })

    return (): JSX.Element => (
      <SubPanelTemplate title="故障对象排行榜top5" v-slots={{
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
          {resultData.value.length === 0 && <NoData />}
          <div ref={chartRef} style="width: 100%; height: 100%" ></div>
        </div>
      </SubPanelTemplate>
    )
  }
})