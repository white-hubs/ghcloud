import { defineComponent, ref, onMounted, onUnmounted, watch, reactive, nextTick } from 'vue'
import * as echarts from 'echarts'
import { use } from 'echarts/core'
import { PieChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent
} from 'echarts/components'
import { calcFontSize } from '@/utils/common'
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import styles from './fault-object-status-statistics.module.less'
import DateInlineForm from "@/components/businessPanel/public/dateInlineForm.vue"
import { cubeMaintainStatisticsService } from '@/api/service'
import NoData from "@/components/businessPanel/public/noData.vue";
import { FaultHandleStatus, FaultHandleStatusMap } from '@ghcloud/cube-maintain-service'

use([
  PieChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent
])
export const FaultObjectStatusStatistics = defineComponent({
  name: 'FaultObjectStatusStatistics',
  setup () {
    // 时间范围选择
    const timeRange = ref({
      timeType: 'THIS_MONTH',
      dateRange: []
    })
    // 图表实例
    let chartInstance = null
    const chartRef = ref(null)
    const faultData= ref<{  name: string, value: number, ratio: number, itemStyle: { color: string }} []>([])
    const FaultHandleColorMap = new Map([
      [FaultHandleStatus.HANDLING, '#3B82F6'],
      [FaultHandleStatus.REJECT, '#F59E0B'],
      [FaultHandleStatus.UNDO, '#8B5CF6'],
      [FaultHandleStatus.PASS, '#10B981']
    ]);

    const getData = async (): Promise<void>=>{
      const result = await cubeMaintainStatisticsService.getFaultHandleStatusStatistics({
        type: timeRange.value.timeType,
        period: timeRange.value.dateRange.join(',')
      })
      const data = result.map((item, index)=>{
        return {
          name: FaultHandleStatusMap.get(item.statusType),
          value: item.num,
          ratio: item.rate,
          itemStyle: { color: FaultHandleColorMap.get(item.statusType) }
          // itemStyle: { color: colors[index] }
        }
      })
      faultData.value = data
    }
    const updateChart = async (): Promise<void> => {
      await getData()
      // 确保图表实例存在
      if (!chartInstance && chartRef.value) {
        chartInstance = echarts.init(chartRef.value as HTMLElement)
      }
      const option = {
        tooltip: {
          trigger: 'item',
          formatter: (params): string => {
            const percentage = params.data.ratio ? (params.data.ratio * 100).toFixed(0) : 0
            return `<div style="display:flex;align-items:center;">
              <span style="display:inline-block;width:10px;height:10px;border-radius:50%;background-color:${params.color};margin-right:5px;"></span>
              <span>${params.name}</span>
            </div>
            数量：${params.value}次<br/>占比：${percentage}%`
          }
        },
        legend: {
          orient: 'vertical',
          right: calcFontSize(10),
          top: 'center',
          itemWidth: calcFontSize(10),
          itemHeight: calcFontSize(10),
          textStyle: {
            color: '#ffffff',
            fontSize: calcFontSize(12)
          },
          formatter: (name) => {
            const item = faultData.value.find(data => data.name === name)
            if (item) {
              return `${name}  ${item.value}次`
            }
            return name
          }
        },
        series: [
          {
            type: 'pie',
            radius: '55%',
            center: ['35%', '50%'], // 将饼图位置调整到左侧
            avoidLabelOverlap: true,
            data: faultData.value,
            
          label: {
            show: true,
            position: 'inside',
            formatter: (params): string => {
              const percentage = params.data.ratio ? (params.data.ratio * 100).toFixed(0) : 0
              return `${percentage}%`
            },
            color: '#ffffff',
            fontSize: calcFontSize(12),
            lineHeight: 15,
            padding: [0, -5, 0, -5], // 减少内边距，使文字更紧凑
            distance: calcFontSize(5), // 减少标签到图形的距离
            overflow: 'none' // 确保文字不被截断
          },
          labelLine: {
            show: true,
            smooth: 0.2,
            length: calcFontSize(12), // 减少第一段引导线长度
            length2: calcFontSize(12) // 减少第二段引导线长度
          },
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
      <SubPanelTemplate title="故障对象状态统计" v-slots={{
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
          {faultData.value.length === 0 && <NoData />}
          <div ref={chartRef} style="width: 100%; height: 100%" ></div>
        </div>
      </SubPanelTemplate>
    )
  }
})