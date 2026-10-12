import { DatePickerSelector } from '@/components/date-picker-select'
import { computed, defineComponent, onMounted, ref } from 'vue'
import { PullRefresh } from 'vant'
import { useRouteQuery } from '@/hooks/use-route-query'
import { AlarmStatistics } from './components/alarm-statistics'
import { RiskInfo } from './components/risk-info'
import { SafetyNav } from './components/safety-nav'
import { AlarmLevelRatio } from './components/alarm-level-ratio'
type SelectType = 'TODAY' | 'THIS_WEEK' | 'THIS_MONTH' | 'THIS_YEAR' | 'CUSTOM'

/** 安全分析 */
export const SafetyAnalysis = defineComponent({
  setup () {
    document.title = '安全分析'
    const loading = ref(false)
    const successNum = ref(0)
    const { period, timeType } = useRouteQuery()
    const alarmStatisticsRef = ref<{ getData: () => void; }>()
    const riskInfoRef = ref<{ getData: () => void; }>()
    const safetyNavRef = ref<{ getData: () => void; }>()
    const alarmLevelRatioRef = ref<{ getData: () => void; }>()
    const handleChangeDate = (value: { start: string; end: string; }, active: SelectType): void => {
      period.value = [value.start, value.end].join(',')
      timeType.value = active
    }
    const periodProp = computed(() => {
      return typeof period.value === 'string' ? period.value.split(',') : period.value
    })
    const onRefresh = (): void => {
      loading.value = true
      successNum.value = 0
      alarmStatisticsRef.value?.getData()
      riskInfoRef.value?.getData()
      safetyNavRef.value?.getData()
      alarmLevelRatioRef.value?.getData()
      loading.value = false
    }
    onMounted(() => {
      onRefresh()
    })
    return (): JSX.Element =>
      <div style={{ width: '100%', padding: '0 12px', background: '#F3F7FA' }}>
        <div style={{ marginBottom: '10px' }}>
          <DatePickerSelector value={periodProp.value} selectType={timeType.value} onChange={handleChangeDate} />
        </div>
        <PullRefresh v-model={loading.value} onRefresh={onRefresh} success-text='刷新成功'>
          <RiskInfo
            timeType={timeType.value} period={periodProp.value} onSuccess={() => successNum.value++} ref={riskInfoRef}
          />
          <AlarmStatistics
            timeType={timeType.value} period={periodProp.value} onSuccess={() => successNum.value++} ref={alarmStatisticsRef}
          />
          <AlarmLevelRatio
            timeType={timeType.value} period={periodProp.value} onSuccess={() => successNum.value++} ref={alarmLevelRatioRef}
          />
          <SafetyNav
            timeType={timeType.value} period={periodProp.value} onSuccess={() => successNum.value++} ref={safetyNavRef}
          />
        </PullRefresh>
      </div>
  }
})
