import { computed, defineComponent, onMounted, reactive, ref } from 'vue'
import { DatePickerSelector } from '@/components/date-picker-select'
import styles from './index.module.less'
import { LineChart } from '@/components/charts/line-chart/line-chart'
import { UseGasSafetyStat } from './components/use-gas-safety-stat'
import { cubeAlarmSafetyAnalysisService } from '@/api/server'
import { AlarmHandleRank } from './components/alarm-handle-rank'
import { ApplicationCode } from '@ghcloud/cube-safety-supervision-service'
import type { UseGasCalc } from '@ghcloud/cube-safety-management-service'
import { PullRefresh } from 'vant'
import { useRouteQuery } from '@/hooks/use-route-query'
import { goAlarmRecords, goRiskList } from '@/utils'
type SelectType = 'TODAY' | 'THIS_WEEK' | 'THIS_MONTH' | 'THIS_YEAR' | 'CUSTOM'
/** 用气管理 */
export const UseGasSafety = defineComponent({
  setup () {
    document.title = '用气安全'
    const loading = ref(false)
    const alarmHandleRankRef = ref<{ getData: () => void; }>()
    const { timeType, period } = useRouteQuery()
    const alarmStatData = ref<UseGasCalc[]>([
      { title: '用气报警数', value: 0, ratio: 0 },
      { title: '未处理报警数', value: 0, ratio: 0 },
      { title: '已处理报警数', value: 0, ratio: 0 },
      { title: '易燃设备建档数', value: 0, ratio: null },
    ])
    const alarmTrendData = reactive({
      CategoryData: ['10:00', '10:00', '10:00', '10:00', '10:00', '10:00'],
      series: [0, 20, 30, 30, 28, 12, 38]
    })
    const getUseGasSafetyStat = async (): Promise<void> => {
      try {
        const prams = {
          period: period.value,
          type: timeType.value,
          applicationCode: ApplicationCode.GAS,
        }
        const res = await cubeAlarmSafetyAnalysisService.safetyAnalysisAlarmTotal(prams)
        alarmStatData.value = [
          { title: '电气报警数', value: res.alarmNum ?? 0, ratio: res?.ringAlarmNumRatio ?? 0 },
          { title: '未处理报警数', value: res.noHandlerNum ?? 0, ratio: res?.ringNoHandlerRatio ?? 0 },
          { title: '已处理报警数', value: res.handlerNum ?? 0, ratio: res?.ringHandlerNumRatio ?? 0 },
          { title: '易燃设备建档数', value: res.inflammableDeviceNum ?? 0, ratio: null },
        ]
      } catch {
      }
    }
    const periodProp = computed(() => {
      return typeof period.value === 'string' ? period.value.split(',') : period.value
    })
    // 报警趋势
    const getAlarmTrendAnalysis = async (): Promise<void> => {
      const res = await cubeAlarmSafetyAnalysisService.alarmTrendAnalysis({
        applicationCode: ApplicationCode.GAS,
        period: period.value,
        type: timeType.value,
      })
      if (timeType.value === 'TODAY') {
        alarmTrendData.CategoryData = res.map(item => {
          return item.period + '时'
        })
      } else if (timeType.value === 'THIS_WEEK') {
        alarmTrendData.CategoryData = res.map(item => {
          return item.period + '日'
        })
      } else if (timeType.value === 'THIS_MONTH') {
        alarmTrendData.CategoryData = res.map(item => {
          return item.period + '日'
        })
      } else if (timeType.value === 'THIS_YEAR') {
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
    }
    // 时间改变
    const handleChangeDate = (value: { start: string;end: string; }, active: SelectType): void => {
      period.value = [value.start, value.end].join(',')
      timeType.value = active
      getAlarmTrendAnalysis()
      getUseGasSafetyStat()
      alarmHandleRankRef.value?.getData()
    }
    const handleClickItem = (item: { status: string;title: string; }): void => {
      const status = item.title.includes('未处理') ? 'ALARM_UN_CONFIRMED' : item.title.includes('已处理') ? 'ALARM_HANDLER' : ''
      if (item.title === '易燃设备建档数') {
        goRiskList({ typeCode: 'FLAMMABLE_EQUIPMENT', typeCodeName: '易燃设备', period: '' })
      } else {
        if (Array.isArray(period.value)) period.value = period.value.join(',')
        const params = {
          alarmStatus: status,
          startTime: period.value.split(',')[0],
          endTime: period.value.split(',')[1],
          sourceApp: ApplicationCode.GAS
        }
        goAlarmRecords(params)
      }
    }
    const onRefresh = async (): Promise<void> => {
      loading.value = true
      await getAlarmTrendAnalysis()
      await getUseGasSafetyStat()
      alarmHandleRankRef.value?.getData()
      loading.value = false
    }
    onMounted(async () => {
      await getAlarmTrendAnalysis()
      await getUseGasSafetyStat()
      onRefresh()
    })
    return (): JSX.Element =>
      <div class={styles.safetyManage}>
        <div style={{ marginBottom: '12px' }}>
          <DatePickerSelector value={periodProp.value} selectType={timeType.value} onChange={handleChangeDate} />
        </div>
        <PullRefresh v-model={loading.value} onRefresh={onRefresh} success-text='刷新成功'>
          <div class={[styles.statCard]} style={{ marginTop: '0' }}>
            <div class={styles.title}>用气安全统计</div>
            <UseGasSafetyStat dataSoruce={alarmStatData.value} onClickItem={handleClickItem} />
          </div>
          <AlarmHandleRank period={periodProp.value} timeType={timeType.value} ref={alarmHandleRankRef} />
          <div class={styles.alarmCard} style={{ marginBottom: '20px' }}>
            <div class={styles.title} style={{ marginBottom: '14px' }}>报警趋势</div>
            <LineChart CategoryData={alarmTrendData.CategoryData} series={alarmTrendData.series} />
          </div>
        </PullRefresh>
      </div>
  }
})
