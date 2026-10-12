import { defineComponent, reactive, watch, type PropType } from 'vue'
import styles from './index.module.less'
import { AlarmCountStatistics } from '@/components/alarm-count-statistics'
import { Rank } from '@/components/rank/rank'
import { cubeSafetyManagementHiddenDangerService } from '@/api/server'
import { storeMarket } from '@/store/market'
import dayjs from 'dayjs'
import type { HiddenDangerMarketState, HiddenDangerResultState, RankResult } from '@ghcloud/cube-safety-management-service'
import { showNotify } from 'vant'
import { cubeAppService } from '@ghcloud/cube-app-js-sdk'
interface HiddenDangerRankState {
  currentHiddenDangeRankField: string;
  hiddenDangerRankData: RankResult[];
  hiddenDangerSourceData: HiddenDangerSourceData[];
}
interface HiddenDangerSourceData {
  title: string;
  count: number;
  ratio: number;
  field: keyof HiddenDangerResultState;
}
export const HiddenDangerRank = defineComponent({
  props: {
    period: {
      type: Array as PropType<string[]>,
      default: () => [dayjs().format('YYYY-MM-DD 00:00:00'), dayjs().format('YYYY-MM-DD HH:mm:ss')]
    }
  },
  emits: ['success'],
  setup: (props, { emit, expose }) => {
    const marketStore = storeMarket()
    const state = reactive<HiddenDangerRankState>({
      currentHiddenDangeRankField: 'all',
      hiddenDangerRankData: [] as RankResult[],
      hiddenDangerSourceData: [
        { title: '安全隐患数', count: 0, ratio: 0, field: 'all' },
        { title: '已处理报警数', count: 0, ratio: 0, field: 'handle' },
        { title: '未处理报警数', count: 0, ratio: 0, field: 'unhandle' },
      ]
    })
    let hiddenDangerMarkerState: HiddenDangerMarketState[] = []
    // 获取隐患排名
    const getHiddenDangerRank = async (): Promise<void> => {
      try {
        const params = {
          marketTenantIDs: marketStore.currentMarket,
          createdPeriod: props.period.join(','),
        }
        const result = await cubeSafetyManagementHiddenDangerService.getSafetyHiddenDangerRank(params)
        hiddenDangerMarkerState = result
        const handleRes = cubeSafetyManagementHiddenDangerService.computedRankResult(hiddenDangerMarkerState, state.currentHiddenDangeRankField)
        state.hiddenDangerRankData = handleRes
        emit('success')
      } catch (error) {
        const { errorMessage } = (error as { toJSON: () => { errorMessage: string; }; }).toJSON()
        showNotify({ type: 'danger', message: errorMessage || '请求失败' })
      }
    }
    // 获取隐患统计
    const getHiddenDangerStat = async (): Promise<void> => {
      const params = {
        marketTenantIDs: marketStore.currentMarket,
        createdPeriod: props.period.join(','),
      }
      try {
        const result = await cubeSafetyManagementHiddenDangerService.getSafetyHiddenDangerHandleState(params)
        const handleState: { title: string;count: number;ratio: number;field: keyof HiddenDangerResultState; }[] = [
          { title: '安全隐患数', count: 0, ratio: 0, field: 'all' },
          { title: '已处理报警数', count: 0, ratio: 0, field: 'handle' },
          { title: '未处理报警数', count: 0, ratio: 0, field: 'unhandle' },
        ]
        for (const item of handleState) {
          item.count = result[item.field].count
          item.ratio = Number(result[item.field].ratio)
        }
        state.hiddenDangerSourceData = handleState
      } catch (error) {
        const { errorMessage } = (error as { toJSON: () => { errorMessage: string; }; }).toJSON()
        showNotify({ type: 'danger', message: errorMessage || '请求失败' })
      }
    }
    const handleChangeCheck = (value: string): void => {
      state.currentHiddenDangeRankField = value
      const handleRes = cubeSafetyManagementHiddenDangerService.computedRankResult(hiddenDangerMarkerState, state.currentHiddenDangeRankField)
      state.hiddenDangerRankData = handleRes
    }
    const handleItemClick = (item: RankResult): void => {
      const params = {
        startTime: props.period[0],
        endTime: props.period[1],
        marketTenant: item?.id || '',
      }
      cubeAppService.toSafetyHiddenDangerRecordPage(JSON.stringify(params))
    }
    watch(() => props.period, () => {
      getHiddenDangerRank()
      getHiddenDangerStat()
    }, {
      deep: true, immediate: true
    })
    expose({
      getData: () => {
        getHiddenDangerRank(); getHiddenDangerStat()
      }
    })
    return (): JSX.Element => (
      <div class={styles.alarmCard}>
        <div class={styles.title}>
          {!marketStore.currentMarket ? '隐患排名' : '隐患统计'}
        </div>
        <div class={styles.alarmCountStat}>
          <AlarmCountStatistics onChange={handleChangeCheck} currentActive={state.currentHiddenDangeRankField} dataSource={state.hiddenDangerSourceData} />
        </div>
        {!marketStore.currentMarket &&
          <div class={styles.rank}>
            <Rank onItemClick={handleItemClick} maxValue={Math.max(...state.hiddenDangerRankData.map(item => item.value)) ? Math.max(...state.hiddenDangerRankData.map(item => item.value)) : 100} rankData={state.hiddenDangerRankData} />
          </div>}

      </div>
    )
  }
})
