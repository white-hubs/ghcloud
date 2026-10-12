import { defineComponent, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import { calcFontSize } from '@/utils/common'
import DateInlineForm from "@/components/businessPanel/public/dateInlineForm.vue"
import styles from './work-order-statistics.module.less'
import * as echarts from 'echarts'
import { use } from 'echarts/core'
import { PieChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent
} from 'echarts/components'
import { cubeMaintainStatisticsService } from '@/api/service'
import NoData from "@/components/businessPanel/public/noData.vue";

use([
  PieChart,
  TitleComponent,
  TooltipComponent
])
interface ReservationData {
  name: string;
  value: number;
  ratio: number;
  itemStyle: {
    color: string;
  };
}

export const WorkOrderStatistics = defineComponent({
  name: 'WorkOrderStatistics',
  setup () {
    // 时间范围选择
    const timeRange = ref({
      timeType: 'THIS_MONTH',
      dateRange: []
    })
    // 图表实例
    let chartInstance = null
    const chartRef = ref(null)
    const resultData = ref<ReservationData[]>([])
    const totalReservations = ref(0)

    const getData = async (): Promise<void> => {
      const colors = ['#3B82F6', '#10B981', '#F59E0B']
      try {
        const result = await cubeMaintainStatisticsService.getTicketStatistics({
          type: timeRange.value.timeType,
          period: timeRange.value.dateRange.join(',')
        })
        totalReservations.value = result.total
        resultData.value = [
          {
            name: '故障工单',
            value: result.faultNum,
            ratio: result.faultRate,
            itemStyle: {
              color: colors[2]
            }
          },
          {
            name: '维保作业',
            value: result.maintenanceNum,
            ratio: result.maintenanceRate,
            itemStyle: {
              color: colors[1]
            }
          },
          {
            name: '日常巡检',
            value: result.inspectNum,
            ratio: result.inspectRate,
            itemStyle: {
              color: colors[0]
            }
          },
        ]
      } catch {
      }
    }
    const updateChart = async (): Promise<void> => {
      await getData()
      if (!chartInstance && chartRef.value) {
        chartInstance = echarts.init(chartRef.value as HTMLElement)
      }
      const option = {
        tooltip: {
          trigger: 'item',
          formatter: (params): string => {
            return `<div style="display:flex;align-items:center;">
              <span style="display:inline-block;width:10px;height:10px;border-radius:50%;background-color:${params.color};margin-right:5px;"></span>
              <span>${params.name}</span>
            </div>
            预约数量：${params.value}个<br/>占比：${params.data.ratio}%`
          },
          textStyle: {
            fontSize: calcFontSize(12)
          }
        },
        legend: {
          orient: 'vertical',
          right: calcFontSize(10),  // 增加右侧边距，确保不被饼图遮挡
          top: 'center',
          itemWidth: calcFontSize(10),
          itemHeight: calcFontSize(10),
          textStyle: {
            color: '#ffffff',
            fontSize: calcFontSize(12)
          },
          formatter: (name) => {
            const item = resultData.value.find(data => data.name === name);
            return `${name} ${item ? item.value : 0}个`;
          }
        },
        series: [{
          name: '运维工单统计',
          type: 'pie',
          radius: ['30%', '55%'],
          center: ['30%', '50%'],
          label: {
            show: true,
            position: 'outside',
            formatter: (params): string => {
              return `${(params.data.ratio * 100).toFixed(0)}%`
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
          avoidLabelOverlap: true, // 防止标签重叠
          data: resultData.value
        }]
      }

      chartInstance?.setOption(option)
    }
    const initChart = (): void => {
      if (chartRef.value) {
        chartInstance = echarts.init(chartRef.value as HTMLElement)
        updateChart()
      }
    }

    const handleResize = (): void => {
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
    // 监听时间范围变化
    watch(() => timeRange.value.timeType, () => {
      updateChart()
    })


    return (): JSX.Element => (
      <SubPanelTemplate title="运维工单统计" v-slots={{
        extra: () => (
          <DateInlineForm v-model:modelValue={timeRange.value}
          timeList={[
            { label: "本周", value: "THIS_WEEK" },
            { label: "本月", value: "THIS_MONTH" },
            { label: "今年", value: "THIS_YEAR" }
          ]} />
        )
      }}>
        <div class={['card-container-3', styles.container]}>
          {resultData.value.length === 0 && <NoData />}
          <>
            <div class={styles.totalWrapper}>
              <div class={styles.totalNumber}>{totalReservations.value}</div>
              <div class={styles.totalLabel}>工单总数</div>
            </div>
            <div ref={chartRef} style="width: 100%; height: 100%"></div>
          </>
        </div>
      </SubPanelTemplate>
    )
  }
})