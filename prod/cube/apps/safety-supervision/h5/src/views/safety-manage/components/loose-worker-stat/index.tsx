import { defineComponent, reactive, watch, type PropType } from 'vue'
import styles from './index.module.less'
import { AlarmCountStatistics } from '@/components/alarm-count-statistics'
import { Rank } from '@/components/rank/rank'
import type { RankResult } from '@ghcloud/cube-safety-management-service'
import dayjs from 'dayjs'
import { cubeSafetyManagementLooseWorkerService } from '@/api/server'
import { storeMarket } from '@/store/market'
import { showNotify } from 'vant'
import { cubeAppService } from '@ghcloud/cube-app-js-sdk'

interface CountStatState {
  title: string;
  count: number;
  ratio: number;
  field: string ;
  ratioField: string;
}
interface LooseWorkerStatState {
  looseWorkerStatData: CountStatState[];
  looseWorkerRankData: RankResult[];
  currentCheckField: string;
}
export const LooseWorkerStat = defineComponent({
  props: {
    period: {
      type: Array as PropType<string[]>,
      default: () => [dayjs().format('YYYY-MM-DD 00:00:00'), dayjs().format('YYYY-MM-DD HH:mm:ss')]
    }
  },
  emits: ['success'],
  setup: (props, { emit, expose }) => {
    const state = reactive<LooseWorkerStatState>({
      looseWorkerStatData: [
        { title: '小散工程数', count: 0, ratio: 0, field: 'totalNum', ratioField: 'chainRatio' },
        { title: '进行中工程数', count: 0, ratio: 0, field: 'underwayNum', ratioField: 'underwayChainRatio' },
        { title: '异常工程数', count: 0, ratio: 0, field: 'abnormalNum', ratioField: 'abnormalChainRatio' },
      ],
      currentCheckField: 'totalNum',
      looseWorkerRankData: [],
    })
    const marketStore = storeMarket()
    // 小散工程统计
    const getLooseWorker = async (): Promise<void> => {
      const params = {
        period: props.period.join(','),
        marketTenant: marketStore.currentMarket,
      }
      try {
        const result = await cubeSafetyManagementLooseWorkerService.getLooseWorkerStat(params)
        result.abnormalChainRatio = Number(result.abnormalChainRatio)
        result.chainRatio = Number(result.chainRatio)
        result.underwayChainRatio = Number(result.underwayChainRatio)
        const handleState: CountStatState[] = [
          { title: '小散工程数', count: 0, ratio: 0, field: 'totalNum', ratioField: 'chainRatio' },
          { title: '进行中工程数', count: 0, ratio: 0, field: 'underwayNum', ratioField: 'underwayChainRatio' },
          { title: '异常工程数', count: 0, ratio: 0, field: 'abnormalNum', ratioField: 'abnormalChainRatio' },
        ]
        const resState = handleState.map(item => {
          return {
            ...item,
            count: result[item.field],
            ratio: result[item.ratioField]
          }
        })
        state.looseWorkerStatData = resState
        emit('success')
      } catch (error) {
        const { errorMessage } = (error as { toJSON: () => { errorMessage: string; }; }).toJSON()
        showNotify({ type: 'danger', message: errorMessage || '请求失败' })
      }
    }
    // 获取小散统计排名
    const getLooseWorkerRankList = async (): Promise<void> => {
      const activeFieldForStateRange: Record<string, string> = {
        totalNum: '',
        underwayNum: 'UNDERWAY',
        abnormalNum: 'ABNORMAL'
      }
      const params = {
        period: props.period.join(','),
        stateRange: activeFieldForStateRange[state.currentCheckField],
        marketTenant: marketStore.currentMarket
      }
      const result = await cubeSafetyManagementLooseWorkerService.getLooseWorkerRank(params)
      const dataSource = result.records.map(item => {
        return {
          name: item.marketName,
          value: Number(item.totalNum),
          tenantId: item.marketTenant
        }
      }).sort((a, b) => b.value - a.value)
      state.looseWorkerRankData = dataSource
    }
    const handleChange = (field: string): void => {
      state.currentCheckField = field
      getLooseWorkerRankList()
    }
    watch(() => props.period, () => {
      getLooseWorker()
      getLooseWorkerRankList()
    }, { deep: true, immediate: true })
    const handleRankClick = (item: unknown): void => {
      const params = {
        startTime: props.period[0],
        endTime: props.period[1],
        marketTenant: (item as { tenantId: number; }).tenantId.toString(),
      }
      cubeAppService.toSafetyEngineeringRecordPage(JSON.stringify(params))
    }
    expose({
      getData: () => {
        getLooseWorker(); getLooseWorkerRankList()
      }
    })
    return (): JSX.Element => (
      <div class={styles.card}>
        <div class={styles.title}>
          小散工程统计
        </div>
        <div class={styles.alarmCountStat}>
          <AlarmCountStatistics currentActive={state.currentCheckField} onChange={handleChange} dataSource={state.looseWorkerStatData} />
        </div>
        {
          !marketStore.currentMarket &&
            <div class={styles.rank}>
              <Rank rankData={state.looseWorkerRankData} maxValue={Math.max(...state.looseWorkerRankData.map(item => item.value)) ? Math.max(...state.looseWorkerRankData.map(item => item.value)) : 100} onItemClick={handleRankClick} />
            </div>
        }

      </div>
    )
  }
})
