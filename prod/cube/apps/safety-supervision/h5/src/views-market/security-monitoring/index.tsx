import { computed, defineComponent, ref } from 'vue'
import { DatePickerSelector } from '@/components/date-picker-select'
import styles from './index.module.less'
import { AlarmHandleRank } from './components/alarm-handle-rank'
import { PullRefresh } from 'vant'
import { useRouteQuery } from '@/hooks/use-route-query'
import { AlarmEventRatio } from './components/alarm-event-ratio'
import { AlarmTrend } from './components/alarm-trend'
import { AlarmStatistics } from './components/alarm-statistics'
import { AlarmEventStat } from './components/alarm-event-stat'

type SelectType = 'TODAY' | 'THIS_WEEK' | 'THIS_MONTH' | 'THIS_YEAR' | 'CUSTOM'
/** 安防监控 */
export const SecurityMonitoring = defineComponent({
  setup () {
    document.title = '安防监控'
    const { timeType, period } = useRouteQuery()
    const loading = ref(false)
    const successNum = ref(0)

    const alarmStatisticsRef = ref<{ getData: () => void; }>()
    const alarmEventRatioRef = ref<{ getData: () => void; }>()
    const alarmEventStatRef = ref<{ getData: () => void; }>()
    const alarmHandleRankRef = ref<{ getData: () => void; }>()
    const alarmTrendRef = ref<{ getData: () => void; }>()
    const handleChangeDate = (value: { start: string;end: string; }, active: SelectType): void => {
      timeType.value = active
      period.value = [value.start, value.end].join(',')
    }
    const periodProp = computed(() => {
      return typeof period.value === 'string' ? period.value.split(',') : period.value
    })
    const onRefresh = async (): Promise<void> => {
      loading.value = true
      alarmStatisticsRef.value?.getData()
      alarmEventRatioRef.value?.getData()
      alarmEventStatRef.value?.getData()
      alarmHandleRankRef.value?.getData()
      alarmTrendRef.value?.getData()
      loading.value = false
    }
    return (): JSX.Element =>
      <div class={styles.safetyManage}>
        <div style={{ marginBottom: '12px' }}><DatePickerSelector value={periodProp.value} selectType={timeType.value} onChange={handleChangeDate} /></div>
        <PullRefresh v-model={loading.value} onRefresh={onRefresh} success-text='刷新成功'>
          <AlarmStatistics onSuccess={() => successNum.value++} period={periodProp.value} timeType={timeType.value} ref={alarmStatisticsRef} />
          <AlarmEventRatio onSuccess={() => successNum.value++} period={periodProp.value} timeType={timeType.value} ref={alarmEventRatioRef} />
          <div class={[styles.statCard]}>
            <div class={styles.title}>报警事件正确率</div>
            <AlarmEventStat onSuccess={() => successNum.value++} period={periodProp.value} timeType={timeType.value} ref={alarmEventStatRef} />
          </div>
          <AlarmHandleRank onSuccess={() => successNum.value++} period={periodProp.value} timeType={timeType.value} ref={alarmHandleRankRef} />
          <AlarmTrend onSuccess={() => successNum.value++} period={periodProp.value} timeType={timeType.value} ref={alarmTrendRef} />
        </PullRefresh>
      </div>
  }
})
