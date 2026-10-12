import { computed, defineComponent, ref } from 'vue'
import { DatePickerSelector } from '@/components/date-picker-select'
import { SafetyWorkState } from './components/safety-work-state'
import styles from './index.module.less'
import { AlarmHandleRank } from './components/alarm-handle-rank'
import { PullRefresh } from 'vant'
import { useRouteQuery } from '@/hooks/use-route-query'
import { HiddenDangerRatio } from './components/hidden-danger-ratio'
import { LooseWorkerTrend } from './components/loose-worker-trend'

type SelectType = 'TODAY' | 'THIS_WEEK' | 'THIS_MONTH' | 'THIS_YEAR' | 'CUSTOM'
/** 安全管理 */
export const SafetyManage = defineComponent({
  setup () {
    document.title = '安全管理'
    const { timeType, period } = useRouteQuery()
    const loading = ref(false)
    const successNum = ref(0)
    const safetyWorkStateRef = ref<{ getData: () => void; }>()
    const alarmHandleRankRef = ref<{ getData: () => void; }>()
    const hiddenDangerRankRef = ref<{ getData: () => void; }>()
    const looseWorkerStatRef = ref<{ getData: () => void; }>()
    const handleChangeDate = (value: { start: string;end: string; }, active: SelectType): void => {
      timeType.value = active
      period.value = [value.start, value.end].join(',')
    }
    const periodProp = computed(() => {
      return typeof period.value === 'string' ? period.value.split(',') : period.value
    })
    const onRefresh = async (): Promise<void> => {
      loading.value = true
      safetyWorkStateRef.value?.getData()
      alarmHandleRankRef.value?.getData()
      hiddenDangerRankRef.value?.getData()
      looseWorkerStatRef.value?.getData()
      loading.value = false
    }

    return (): JSX.Element =>
      <div class={styles.safetyManage}>
        <div style={{ marginBottom: '12px' }}><DatePickerSelector value={periodProp.value} selectType={timeType.value} onChange={handleChangeDate} /></div>
        <PullRefresh v-model={loading.value} onRefresh={onRefresh} success-text='刷新成功'>
          <SafetyWorkState onSuccess={() => successNum.value++} period={periodProp.value} timeType={timeType.value} ref={safetyWorkStateRef} />
          <AlarmHandleRank onSuccess={() => successNum.value++} period={periodProp.value} timeType={timeType.value} ref={alarmHandleRankRef} />
          <HiddenDangerRatio onSuccess={() => successNum.value++} period={periodProp.value} timeType={timeType.value} ref={hiddenDangerRankRef} />
          <LooseWorkerTrend onSuccess={() => successNum.value++} period={periodProp.value} timeType={timeType.value} ref={looseWorkerStatRef} />
        </PullRefresh>
      </div>
  }
})
