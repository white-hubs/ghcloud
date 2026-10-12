import { Cell, CellGroup, showNotify, Skeleton } from 'vant'
import { defineComponent, ref, watch } from 'vue'
import styles from './alarm-handle-analysis.module.less'
import { getPeriodFormat } from '@/utils/timer-picker'
import { cubeAlarmCenterService } from '@/api/server'
import { Table } from './table'

interface Props {
  type: string;
}

/** 报警处理分析 */
export const AlarmHandleAnalysis = defineComponent({
  props: ['type'],
  setup: (props: Props) => {
    const loading = ref(true)
    const topData = ref<{ name: string;num: number; }[]>([])
    const BotData = ref<{ name: string;num: number; }[]>([])
    const getData = async (): Promise<void> => {
      const params = {
        period: getPeriodFormat(props.type)
      }
      const res = await cubeAlarmCenterService.getAlarmHandleAnalysis(params)
      topData.value = res.topTenUserHandlerStatisticsVOS.map(item => ({
        name: item.name,
        num: item.alarmHandlerTotalNum
      })).reverse()
      BotData.value = res.lastTopTenUserHandlerStatisticsVOS.map(item => ({
        name: item.name,
        num: item.alarmHandlerTotalNum
      }))
      try {
        loading.value = true
      } catch {
        showNotify('获取数据失败')
      } finally {
        loading.value = false
      }
    }
    watch(() => props.type, () => {
      getData()
    }, { immediate: true })
    return (): JSX.Element =>
      <CellGroup inset class={styles['alarm-handle-analysis']}>
        <Cell title='报警处理分析' />
        <Cell>
          <div class={styles.title}>处理报警数排名Top10</div>
          <Skeleton row={4} animated v-show={loading.value} />
          <Table data={topData.value} v-show={!loading.value} />
          <div class={styles.title}>处理报警数倒数排名Bot10</div>
          <Skeleton row={4} animated v-show={loading.value} />
          <Table data={BotData.value} v-show={!loading.value} />
        </Cell>
      </CellGroup>
  }
})
