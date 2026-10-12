import { defineComponent, ref, watch, type PropType } from 'vue'
import styles from './index.module.less'
import { AlarmCountStatistics } from '@/components/alarm-count-statistics'
import { Rank } from '@/components/rank/rank'
import dayjs from 'dayjs'
import { cubeAlarmSafetyAnalysisService } from '@/api/server'
import { ApplicationCode } from '@ghcloud/cube-safety-supervision-service'
import type { AlarmUserRatioVO, SafetyAnalysisAlarmHandlerRank } from '@ghcloud/cube-alarm-center-service/src/types/safety-analys'
export const AlarmHandleRank = defineComponent({
  props: {
    period: {
      type: Array as PropType<string[]>,
      default: () => [dayjs().format('YYYY-MM-DD 00:00:00'), dayjs().format('YYYY-MM-DD HH:mm:ss')]
    },
    timeType: {
      type: String,
      default: ''
    }
  },
  emits: ['success'],
  setup: (props, { emit, expose }) => {
    const alarmRankRate = ref([
      { title: '响应率', count: 0, field: 'respondedRatio', ratio: 0, unit: '%' },
      { title: '处理率', count: 0, field: 'handlerRatio', ratio: 0, unit: '%' },
      { title: '超时率', count: 0, field: 'timeOutRatio', ratio: 0, unit: '%' }
    ])
    const alarmHandleType = ref('respondedRatio')
    const alarmRanking = ref<{ name: string; value: number; }[]>([])
    const dataSource = ref<SafetyAnalysisAlarmHandlerRank>()
    const getAlarmHandleRank = async (): Promise<void> => {
      const res = await cubeAlarmSafetyAnalysisService.safetyAnalysisAlarmHandlerRank({
        period: props.period.join(','),
        type: props.timeType,
        applicationCode: ApplicationCode.ROTATING
      })
      dataSource.value = res
      alarmRankRate.value = [
        { title: '响应率', count: res.respondedRatio ?? 0, field: 'respondedRatio', ratio: res.respondedRingRatio ?? 0, unit: '%' },
        { title: '处理率', count: res.handlerRatio ?? 0, field: 'handlerRatio', ratio: res.handlerRingRatio ?? 0, unit: '%' },
        { title: '超时率', count: res.timeOutRatio ?? 0, field: 'timeOutRatio', ratio: res.timeOutRingRatio ?? 0, unit: '%' }
      ]
      alarmHandleRank(alarmHandleType.value)
      emit('success')
    }
    /** 报警处理 市场排名 */
    const alarmHandleRank = async (type: string): Promise<void> => {
      type && (alarmHandleType.value = type)
      let list: AlarmUserRatioVO[] = []
      switch (type) {
        case 'respondedRatio':
          list = dataSource.value?.userResponedRatioRankList ?? []
          break
        case 'handlerRatio' :
          list = dataSource.value?.userhandlerRatioRankList ?? []
          break
        case 'timeOutRatio' :
          list = dataSource.value?.usertimeOutRatioRankList ?? []
          break
      }
      alarmRanking.value = list.map(e => {
        return {
          name: e.userName ?? '',
          value: e.ratio ? Number(e.ratio.toFixed(2)) : 0
        }
      })
    }
    watch(() => props.period, () => {
      getAlarmHandleRank()
    }, {
      deep: true, immediate: true
    })
    expose({
      getData: () => {
        getAlarmHandleRank()
      }
    })
    return (): JSX.Element => (
      <div class={styles.card}>
        <div class={styles.title}>报警处理排名</div>
        <div class={styles.alarmCountStat}>
          <AlarmCountStatistics dataSource={alarmRankRate.value} onChange={alarmHandleRank} currentActive={alarmHandleType.value} />
        </div>
        <div class={styles.rank}>
          <Rank rankData={alarmRanking.value} maxValue={100} unit='%' />
        </div>

      </div>
    )
  }
})
