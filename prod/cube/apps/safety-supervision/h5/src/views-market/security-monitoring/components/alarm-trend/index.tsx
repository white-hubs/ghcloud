import { defineComponent, watch, type PropType, reactive } from 'vue'
import styles from './index.module.less'
import dayjs from 'dayjs'
import { cubeAlarmSafetyAnalysisService } from '@/api/server'
import { LineChart } from '@/components/charts/line-chart/line-chart'
import { ApplicationCode } from '@ghcloud/cube-safety-supervision-service'
type SelectType = 'TODAY' | 'THIS_WEEK' | 'THIS_MONTH' | 'THIS_YEAR' | 'CUSTOM'
export const AlarmTrend = defineComponent({
  props: {
    period: {
      type: Array as PropType<string[]>,
      default: () => [dayjs().format('YYYY-MM-DD 00:00:00'), dayjs().format('YYYY-MM-DD HH:mm:ss')]
    },
    timeType: {
      type: String as PropType<SelectType>,
      default: 'THIS_MONTH'
    }
  },
  emits: ['success'],
  setup: (props, { emit, expose }) => {
    const alarmTrendData = reactive<{
      CategoryData: string[];
      series: number[];
    }>({
      CategoryData: [],
      series: []
    })
    const getAlarmTrendAnalysis = async (): Promise<void> => {
      const res = await cubeAlarmSafetyAnalysisService.alarmTrendAnalysis({
        applicationCode: ApplicationCode.MONITORING,
        period: props.period.join(','),
        type: props.timeType,
      })
      if (props.timeType === 'TODAY') {
        alarmTrendData.CategoryData = res.map(item => {
          return item.period + '时'
        })
      } else if (props.timeType === 'THIS_WEEK') {
        alarmTrendData.CategoryData = res.map(item => {
          return item.period + '日'
        })
      } else if (props.timeType === 'THIS_MONTH') {
        alarmTrendData.CategoryData = res.map(item => {
          return item.period + '日'
        })
      } else if (props.timeType === 'THIS_YEAR') {
        alarmTrendData.CategoryData = res.map(item => {
          return item.period + '月'
        })
      } else {
        alarmTrendData.CategoryData = res.map(item => {
          return item.period ?? ''
        })
      }
      alarmTrendData.series = res.map(item => {
        return item.alarmNum ?? 0
      })
      emit('success')
    }
    watch(() => props.period, () => {
      getAlarmTrendAnalysis()
    }, {
      deep: true, immediate: true
    })
    expose({
      getData: () => {
        getAlarmTrendAnalysis()
      }
    })
    return (): JSX.Element => (
      <div class={styles.card}>
        <div class={styles.title}>报警趋势</div>
        <div class={styles.rank}>
          <LineChart CategoryData={alarmTrendData.CategoryData} series={alarmTrendData.series} />
        </div>

      </div>
    )
  }
})
