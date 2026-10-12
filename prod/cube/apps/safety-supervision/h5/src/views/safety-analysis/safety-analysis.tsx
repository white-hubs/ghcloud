import { DatePickerSelector } from '@/components/date-picker-select'
import { SafetyNav } from '@/views/safety-analysis/components/safety-nav'
import { defineComponent, onMounted, ref, watch } from 'vue'
import { AlarmStatistics } from './components/alarm-statistics'
import { RiskRank } from './components/risk-rank'
import { PullRefresh } from 'vant'
import { storeMarket } from '@/store/market'
import { useRouteQuery } from '@/hooks/use-route-query'
type SelectType = 'TODAY' | 'THIS_WEEK' | 'THIS_MONTH' | 'THIS_YEAR' | 'CUSTOM'

/** 安全分析 入口页面 */
export const SafetyAnalysis = defineComponent({
  setup () {
    const loading = ref(false)
    const successNum = ref(0)
    const { period, timeType } = useRouteQuery()
    const alarmStatisticsRef = ref<{ getData: () => void; }>()
    const riskRankRef = ref<{ getData: () => void; }>()
    const safetyNavRef = ref<{ getData: () => void; }>()
    const handleChangeDate = (value: { start: string; end: string; }, active: SelectType): void => {
      period.value = [value.start, value.end].join(',')
      timeType.value = active
    }
    watch(() => successNum.value, () => {
      if (successNum.value === 3) {
        loading.value = false
      }
    })
    const onRefresh = (): void => {
      try {
        successNum.value = 0
        loading.value = true
        alarmStatisticsRef.value?.getData()
        riskRankRef.value?.getData()
        safetyNavRef.value?.getData()
      } catch {

      } finally {
        loading.value = false
      }
    }

    const marketStore = storeMarket()
    watch(() => marketStore.currentMarket, () => {
      onRefresh()
    }, { immediate: true, deep: true })
    onMounted(() => {
      document.title = '安全分析'
    })
    return (): JSX.Element =>
      <div style={{ width: '100%', padding: '0 12px', background: '#F3F7FA' }}>
        <div style={{ marginBottom: '10px' }}>
          <DatePickerSelector value={period.value.split(',')} selectType={timeType.value} onChange={handleChangeDate} />
        </div>
        <PullRefresh v-model={loading.value} onRefresh={onRefresh}>
          <AlarmStatistics
            times={{
              timeType: timeType.value,
              period: period.value.split(',')
            }} onSuccess={() => successNum.value++} ref={alarmStatisticsRef}
          />
          <RiskRank
            times={{
              timeType: timeType.value,
              period: period.value.split(',')
            }} onSuccess={() => successNum.value++} ref={riskRankRef}
          />
          <SafetyNav
            times={{
              timeType: timeType.value,
              period: period.value.split(',')
            }} onSuccess={() => successNum.value++} ref={safetyNavRef}
          />
        </PullRefresh>
      </div>
  }
})
