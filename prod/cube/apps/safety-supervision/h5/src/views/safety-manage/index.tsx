import { computed, defineComponent, onMounted, ref, watch } from 'vue'
import { DatePickerSelector } from '@/components/date-picker-select'
import { SafetyWorkState } from './components/safety-work-state'
import styles from './index.module.less'
import { AlarmHandleRank } from './components/alarm-handle-rank'
import { HiddenDangerRank } from './components/hidden-danger-rank'
import { LooseWorkerStat } from './components/loose-worker-stat'
import { PullRefresh } from 'vant'
import { storeMarket } from '@/store/market'
import { useRouteQuery } from '@/hooks/use-route-query'
export enum HiddenEnum {
  WAITING_CONFIRM = '待确认',
  WAITING_FOR_HANDLE = '待处理',
  TO_BE_CLOSED = '待关闭',
  CONFIRMED = '已确认',
  FINISHED = '已结束'
}
type SelectType = 'TODAY' | 'THIS_WEEK' | 'THIS_MONTH' | 'THIS_YEAR' | 'CUSTOM'
/** 安全管理 */
export const SafetyManage = defineComponent({
  setup () {
    const marketStore = storeMarket()
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
      return period.value.split(',')
    })
    const onRefresh = async (): Promise<void> => {
      loading.value = true
      safetyWorkStateRef.value?.getData()
      alarmHandleRankRef.value?.getData()
      hiddenDangerRankRef.value?.getData()
      looseWorkerStatRef.value?.getData()
      loading.value = false
    }
    watch(() => marketStore.currentMarket, () => {
      onRefresh()
    })
    onMounted(() => {
      document.title = '安全管理'
    })
    return (): JSX.Element =>
      <div class={styles.safetyManage}>
        <div style={{ marginBottom: '12px' }}><DatePickerSelector value={periodProp.value} selectType={timeType.value} onChange={handleChangeDate} /></div>
        <PullRefresh v-model={loading.value} onRefresh={onRefresh}>
          <SafetyWorkState onSuccess={() => successNum.value++} period={periodProp.value} ref={safetyWorkStateRef} />
          <AlarmHandleRank onSuccess={() => successNum.value++} period={periodProp.value} ref={alarmHandleRankRef} />
          <HiddenDangerRank onSuccess={() => successNum.value++} period={periodProp.value} ref={hiddenDangerRankRef} />
          <LooseWorkerStat style={{ marginBottom: '20px' }} onSuccess={() => successNum.value++} period={periodProp.value} ref={looseWorkerStatRef} />
        </PullRefresh>
      </div>
  }
})
