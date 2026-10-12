import { defineComponent, watch, type PropType, reactive } from 'vue'
import styles from './index.module.less'
import dayjs from 'dayjs'
import { cubeAlarmSafetyAnalysisService } from '@/api/server'
import { LineChart } from '@/components/charts/line-chart/line-chart'
import { AlarmCountStatistics } from '@/components/alarm-count-statistics'
import type { RankResult } from '@ghcloud/cube-safety-management-service'
import { cubeAppService } from '@ghcloud/cube-app-js-sdk'

interface CountStatState {
  title: string;
  count: number;
  ratio: number;
  field: string ;
  ratioField: string;
}
interface LooseWorkerStatState {
  looseWorkerStatData: CountStatState[];
  looseWorkerRankData: RankResult[];
  currentCheckField: string;
}
type SelectType = 'TODAY' | 'THIS_WEEK' | 'THIS_MONTH' | 'THIS_YEAR' | 'CUSTOM'
export const LooseWorkerTrend = defineComponent({
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
    const state = reactive<LooseWorkerStatState>({
      looseWorkerStatData: [
        { title: '小散工程数', count: 0, ratio: 0, field: 'total', ratioField: 'totalRingRatio' },
        { title: '进行中工程数', count: 0, ratio: 0, field: 'underway', ratioField: 'underwayRingRatio' },
        { title: '异常工程数', count: 0, ratio: 0, field: 'abnormal', ratioField: 'abnormalRingRatio' },
      ],
      currentCheckField: 'totalNum',
      looseWorkerRankData: [],
    })
    // 小散工程统计
    const getLooseWorker = async (): Promise<void> => {
      try {
        const prams = {
          period: props.period.join(','),
          type: props.timeType,
        }
        const res = await cubeAlarmSafetyAnalysisService.getProjectRatioSafety(prams)
        emit('success')
        state.looseWorkerStatData = [
          { title: '小散工程数', count: res.total ?? 0, ratio: res?.totalRingRatio ?? 0, field: 'total', ratioField: 'totalRingRatio' },
          { title: '进行中工程数', count: res.underway ?? 0, ratio: res?.underwayRingRatio ?? 0, field: 'underway', ratioField: 'underwayRingRatio' },
          { title: '异常工程数', count: res.abnormal ?? 0, ratio: res?.abnormalRingRatio ?? 0, field: 'abnormal', ratioField: 'abnormalRingRatio' },
        ]
        emit('success')
      } catch {
      }
    }
    const getAlarmTrendAnalysis = async (): Promise<void> => {
      const res = await cubeAlarmSafetyAnalysisService.getProjectTrendSafety({
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
        return item.num ?? 0
      })
    }
    const handleChange = (field: string): void => {
      state.currentCheckField = field
      const params = {
        startTime: props.period[0],
        endTime: props.period[1],
        engineeringType: '',
      }
      cubeAppService.toSmallEngineeringRecordPage(JSON.stringify(params))
    }
    watch(() => props.period, () => {
      getLooseWorker()
      getAlarmTrendAnalysis()
    }, {
      deep: true, immediate: true
    })
    expose({
      getData: () => {
        getLooseWorker()
        getAlarmTrendAnalysis()
      }
    })
    return (): JSX.Element => (
      <div class={styles.card}>
        <div class={styles.title}>小散工程统计</div>
        <div class={styles.alarmCountStat}>
          <AlarmCountStatistics currentActive={state.currentCheckField} onChange={handleChange} disabled dataSource={state.looseWorkerStatData} />
        </div>
        <div class={styles.rank}>
          <LineChart CategoryData={alarmTrendData.CategoryData} series={alarmTrendData.series} />
        </div>

      </div>
    )
  }
})
