import { defineComponent, ref, watch, type PropType } from 'vue'
import styles from './index.module.less'
import { AlarmCountStatistics } from '@/components/alarm-count-statistics'
import { Rank } from '@/components/rank/rank'
import { ApplicationCode } from '@ghcloud/cube-safety-supervision-service'
import dayjs from 'dayjs'
import { cubeSafetySupervisionAlarmHandleService } from '@/api/server'
import { storeMarket } from '@/store/market'
export const AlarmHandleRank = defineComponent({
  props: {
    period: {
      type: Array as PropType<string[]>,
      default: () => [dayjs().format('YYYY-MM-DD 00:00:00'), dayjs().format('YYYY-MM-DD HH:mm:ss')]
    }
  },
  setup: (props) => {
    const marketStore = storeMarket()
    const alarmRankRate = ref([
      { title: '响应率', count: 0, field: 'response', ratio: 10, unit: '%' },
      { title: '处理率', count: 0, field: 'handled', ratio: -10, unit: '%' },
      { title: '超时率', count: 0, field: 'timeout', ratio: -10, unit: '%' }
    ])
    /** 报警处理 响应率 超时率 处理率 */
    const alarmHandleRate = async (): Promise<void> => {
      try {
        const params = {
          applicationCodes: [ApplicationCode.GAS],
          createdPeriod: props.period.join(','),
          marketTenantIDs: marketStore.currentMarket ? [marketStore.currentMarket] : []
        }
        await Promise.all([
          cubeSafetySupervisionAlarmHandleService.getAlarmHandleTimeOutRate(params).then(res => {
            alarmRankRate.value[2].count = res.rate
            alarmRankRate.value[2].ratio = res.qoq
          }),
          cubeSafetySupervisionAlarmHandleService.getAlarmHandlerRate(params).then(res => {
            alarmRankRate.value[1].count = res.rate
            alarmRankRate.value[1].ratio = res.qoq
          }),
          cubeSafetySupervisionAlarmHandleService.getAlarmHandleResponseRate(params).then(res => {
            alarmRankRate.value[0].count = res.rate
            alarmRankRate.value[0].ratio = res.qoq
          })
        ])
      } catch {

      }
    }
    const alarmHandleType = ref<'response' | 'timeout' | 'handled'>('response')
    const alarmRanking = ref<{ name: string; value: number; }[]>([])
    /** 报警处理 市场排名 */
    const alarmHandleRank = async (type?: 'response' | 'timeout' | 'handled'): Promise<void> => {
      type && (alarmHandleType.value = type)
      const res = await cubeSafetySupervisionAlarmHandleService.getMarketRankByMetric({
        metric: alarmHandleType.value,
        applicationCodes: [ApplicationCode.GAS],
        createdPeriod: props.period.join(','),
        marketTenantIDs: marketStore.currentMarket ? [marketStore.currentMarket] : []
      })
      alarmRanking.value = res.map(e => {
        return {
          name: e.marketName,
          value: e.rate
        }
      })
    }
    watch(() => props.period, () => {
      alarmHandleRate()
      alarmHandleRank()
    }, {
      deep: true,
      immediate: true
    })
    return (): JSX.Element => (
      <div class={styles.card}>
        <div class={styles.title}>报警处理排名</div>
        <div class={styles.alarmCountStat}>
          <AlarmCountStatistics dataSource={alarmRankRate.value} onChange={alarmHandleRank} currentActive={alarmHandleType.value} />
        </div>
        {!marketStore.currentMarket &&
          <div class={styles.rank}>
            <Rank rankData={alarmRanking.value} maxValue={100} unit='%' />
          </div>}

      </div>
    )
  }
})
