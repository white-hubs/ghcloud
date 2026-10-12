import { defineComponent, ref, watch } from 'vue'
import styles from './index.module.less'
import { AlarmCountStatistics } from '@/components/alarm-count-statistics'
import { cubeSafetyManagementAlarmService } from '@/api/server'
import { storeMarket } from '@/store/market'
import { cubeAppService } from '@ghcloud/cube-app-js-sdk'

/** 安全分析 报警统计 */
interface Props {
  times: {
    timeType: string;
    period: string[];
  };
}
export const AlarmStatistics = defineComponent({
  props: ['times'],
  emits: ['success'],
  setup (props: Props, { emit, expose }) {
    const piniaStoreMarket = storeMarket()
    const alarmStatistics = ref([
      { title: '安全报警数', count: 0, ratio: 0 },
      { title: '未处理报警数', count: 0, ratio: 0 },
      { title: '已处理报警数', count: 0, ratio: 0 },
    ])
    const getAlarmStatistics = async (): Promise<void> => {
      const prams = {
        period: props.times.period.join(','),
        marketTenants: !piniaStoreMarket.currentMarket ? [] : [piniaStoreMarket.currentMarket],
      }
      const res = await cubeSafetyManagementAlarmService.alarmStatisticsGroup(prams)
      emit('success')
      alarmStatistics.value = res.map((item: { statusName: string; totalNum: number; ratio: number; }) => {
        return {
          title: item.statusName === '报警数' ? '安全' + item.statusName : item.statusName,
          count: item.totalNum,
          ratio: item.ratio,
          field: item
        }
      })
    }

    watch(() => piniaStoreMarket.currentMarket, () => {
      getAlarmStatistics()
    }, { deep: true, immediate: true })
    watch(() => props.times, () => {
      getAlarmStatistics()
    }, { deep: true })

    expose({
      getData: () => {
        getAlarmStatistics()
      }
    })

    const alarmEvent = (item: { status: string; }): void => {
      const params = {
        alarmStatus: item.status,
        startTime: props.times.period[0],
        endTime: props.times.period[1],
        marketTenant: piniaStoreMarket.currentMarket,
        alarmTypeCode: ''
      }
      cubeAppService.toSafetyAlarmRecordPage(JSON.stringify(params))
    }

    return (): JSX.Element =>
      <div class={styles.container}>
        <AlarmCountStatistics onChange={alarmEvent} disabled dataSource={alarmStatistics.value} style='background:white' />
      </div>
  }
})
