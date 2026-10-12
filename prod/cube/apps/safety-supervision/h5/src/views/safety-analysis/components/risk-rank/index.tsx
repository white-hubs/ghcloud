import { defineComponent, ref, watch } from 'vue'
import styles from './index.module.less'
import { useRouter } from 'vue-router'
import { logger } from '@/logger'
import { Rank } from '@/components/rank/rank'
import { Icon } from 'vant'
import { storeMarket } from '@/store/market'
import { cubeSafetySupervisionService } from '@/api/server'
import type { RiskIndexVO } from '@ghcloud/cube-safety-supervision-service'
import dayjs from 'dayjs'

/** 安全分析 安全风险指数排名 */
interface Props {
  times: {
    timeType: string;
    period: string[];
  };
}
export const RiskRank = defineComponent({
  props: ['times'],
  emits: ['success'],
  setup (props: Props, { emit, expose }) {
    const router = useRouter()
    const piniaStoreMarket = storeMarket()

    const rankList = ref<{ name: string;value: number; marketTenant: number | null ; }[]>([])
    const getRankList = async (): Promise<void> => {
      // 获取上一周的时间范围
      const lastWeekStartDate = dayjs().subtract(1, 'week').startOf('week').format('YYYY-MM-DD HH:mm:ss')
      const lastWeekEndDate = dayjs().subtract(1, 'week').endOf('week').format('YYYY-MM-DD HH:mm:ss')
      const param = {
        period: [lastWeekStartDate, lastWeekEndDate].join(','),
        marketTenant: piniaStoreMarket.currentMarket,
      }
      logger.debug(param)
      const res: RiskIndexVO[] = await cubeSafetySupervisionService.riskIndexRank(param)
      const data = await cubeSafetySupervisionService.getMarketList() as { status: boolean; marketTenant: number; marketName: string; }[]
      res.forEach(item => {
        data.forEach(e => {
          if (item.marketTenant === e.marketTenant) {
            item.status = e.status
          }
        })
      })
      emit('success')
      rankList.value = res.map((item) => {
        return {
          name: item.marketName ?? '',
          value: item.status ? 100 - Number(item.riskIndex) : 0,
          marketTenant: item.marketTenant ?? null,
        }
      }).sort((a, b) => {
        return b.value - a.value
      })
    }
    watch(() => props.times, () => {
      getRankList()
    }, { deep: true, immediate: true })

    expose({
      getData: () => {
        getRankList()
      }
    })

    return (): JSX.Element =>
      <div class={styles.container}>
        <div
          class={styles.title} onClick={() => {
            router.push({ path: '/risk-tip' })
          }}
        >
          <div>
            安全风险指数排名
            <Icon name='question-o' class={styles.icon} />
          </div>
          <span class={styles.tipspan}>默认上周数据</span>
        </div>
        <Rank
          rankData={rankList.value} onItemClick={(item) => {
            const tenant = rankList.value.filter(r => r.name === item.name)[0].marketTenant
            router.push({ path: '/risk-detail', query: { period: props.times.period.join(','), marketTenant: tenant } })
          }}
        />
      </div>
  }
})
