import { computed, defineComponent, onMounted, reactive, ref, watch } from 'vue'
import { DatePickerSelector } from '@/components/date-picker-select'
import styles from './index.module.less'
import { LineChart } from '@/components/charts/line-chart/line-chart'
import { UseGasSafetyStat } from './components/use-gas-safety-stat'
import { cubeSafetyManagementAlarmService, cubeSafetyManagementQuotaService } from '@/api/server'
import { AlarmHandleRank } from './components/alarm-handle-rank'
import { ApplicationCode } from '@ghcloud/cube-safety-management-service'
import type { UseGasCalc } from '@ghcloud/cube-safety-management-service'
import { PullRefresh, showNotify } from 'vant'
import { storeMarket } from '@/store/market'
import { cubeAppService } from '@ghcloud/cube-app-js-sdk'
import { useRouteQuery } from '@/hooks/use-route-query'
type SelectType = 'TODAY' | 'THIS_WEEK' | 'THIS_MONTH' | 'THIS_YEAR' | 'CUSTOM'
/** 用气管理 */
export const UseGasSafety = defineComponent({
  setup () {
    const marketStore = storeMarket()
    const loading = ref(false)
    const { timeType, period } = useRouteQuery()
    const alarmStatData = ref<UseGasCalc[]>([
      { title: '电气报警数', value: 0, ratio: 0 },
      { title: '未处理报警数', value: 0, ratio: 0 },
      { title: '已处理报警数', value: 0, ratio: 0 },
    ])
    const alarmRiskSourceData = ref<UseGasCalc[]>([
      { title: '易燃设备建档数', value: 0, ratio: 0, hideRatio: true },
    ])
    const alarmTrendData = reactive({
      CategoryData: ['10:00', '10:00', '10:00', '10:00', '10:00', '10:00'],
      series: [0, 20, 30, 30, 28, 12, 38]
    })
    const getUseGasSafetyStat = async (): Promise<void> => {
      try {
        const metrics = ['safety_management-alarm-status_distribution']
        const result = await cubeSafetyManagementQuotaService.batchGetGasSafetyQuotaService({ metrics, period: period.value.split(','), applicationCode: ApplicationCode.GAS, marketTenantIDs: marketStore.currentMarket ? [marketStore.currentMarket] : [] })
        alarmStatData.value = result
      } catch (error) {
        const { errorMessage } = (error as { toJSON: () => { errorMessage: string; }; }).toJSON()
        showNotify({ type: 'danger', message: errorMessage || '请求失败' })
      }
    }
    const useSafetyStatData = computed(() => {
      return [...alarmStatData.value, ...alarmRiskSourceData.value]
    })
    const getRiskSourceTypeDistribution = async (): Promise<void> => {
      const result = await cubeSafetyManagementQuotaService.getRiskArchives({ applicationCode: ApplicationCode.GAS, marketTenantIDs: marketStore.currentMarket ? [marketStore.currentMarket] : [] })
      alarmRiskSourceData.value = [{
        ...result,
        ratio: 0,
        hideRatio: true,
      }]
    }
    const periodProp = computed(() => {
      return period.value.split(',')
    })
    // 报警趋势
    const getAlarmTrendAnalysis = async (): Promise<void> => {
      const res = await cubeSafetyManagementAlarmService.alarmTrendAnalysis({ marketTenants: marketStore.currentMarket ? [marketStore.currentMarket] : [], applicationCode: ApplicationCode.GAS, period: period.value, type: timeType.value })
      if (timeType.value === 'TODAY') {
        alarmTrendData.CategoryData = res.alarmTrends.map(item => {
          return item.period + '时'
        })
      } else if (timeType.value === 'THIS_WEEK') {
        alarmTrendData.CategoryData = res.alarmTrends.map(item => {
          return item.period + '日'
        })
      } else if (timeType.value === 'THIS_MONTH') {
        alarmTrendData.CategoryData = res.alarmTrends.map(item => {
          return item.period + '日'
        })
      } else if (timeType.value === 'THIS_YEAR') {
        alarmTrendData.CategoryData = res.alarmTrends.map(item => {
          return item.period + '月'
        })
      } else {
        alarmTrendData.CategoryData = res.alarmTrends.map(item => {
          return item.period
        })
      }
      alarmTrendData.series = res.alarmTrends.map(item => {
        return item.totalNum
      })
    }
    // 时间改变
    const handleChangeDate = (value: { start: string;end: string; }, active: SelectType): void => {
      period.value = [value.start, value.end].join(',')
      timeType.value = active
      getAlarmTrendAnalysis()
      getUseGasSafetyStat()
    }
    const handleClickItem = (item: { status: string;title: string; }): void => {
      if (item.title === '易燃设备建档数') return
      const params = {
        alarmStatus: item.status,
        startTime: period.value.split(',')[0],
        endTime: period.value.split(',')[1],
        marketTenant: marketStore.currentMarket,
        alarmTypeCode: ApplicationCode.GAS
      }
      cubeAppService.toSafetyAlarmRecordPage(JSON.stringify(params))
    }
    watch(() => marketStore.currentMarket, () => {
      onRefresh()
    })
    const onRefresh = async (): Promise<void> => {
      loading.value = true
      await getAlarmTrendAnalysis()
      await getUseGasSafetyStat()
      await getRiskSourceTypeDistribution()
      loading.value = false
    }
    onMounted(async () => {
      document.title = '用气安全'
      onRefresh()
    })
    return (): JSX.Element =>
      <div class={styles.safetyManage}>
        <div style={{ marginBottom: '12px' }}>
          <DatePickerSelector value={periodProp.value} selectType={timeType.value} onChange={handleChangeDate} />
        </div>
        <PullRefresh v-model={loading.value} onRefresh={onRefresh}>
          <div class={[styles.statCard]} style={{ marginTop: '0' }}>
            <div class={styles.title}>用气安全统计</div>
            <UseGasSafetyStat dataSoruce={useSafetyStatData.value} onClickItem={handleClickItem} />
          </div>
          <AlarmHandleRank period={periodProp.value} />
          <div class={styles.alarmCard} style={{ marginBottom: '20px' }}>
            <div class={styles.title} style={{ marginBottom: '14px' }}>报警趋势</div>
            <LineChart CategoryData={alarmTrendData.CategoryData} series={alarmTrendData.series} />
          </div>
        </PullRefresh>
      </div>
  }
})
