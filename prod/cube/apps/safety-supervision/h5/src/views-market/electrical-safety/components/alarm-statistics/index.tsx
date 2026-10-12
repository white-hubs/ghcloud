import { defineComponent, ref, watch, type PropType } from 'vue'
import styles from './index.module.less'
import { AlarmCountStatistics } from '@/components/alarm-count-statistics'
import { cubeAlarmSafetyAnalysisService } from '@/api/server'
import dayjs from 'dayjs'
import { ApplicationCode } from '@ghcloud/cube-safety-supervision-service'
import { goAlarmRecords } from '@/utils'

/** 报警统计 */
type SelectType = 'TODAY' | 'THIS_WEEK' | 'THIS_MONTH' | 'THIS_YEAR' | 'CUSTOM'
export const AlarmStatistics = defineComponent({
  props: {
    period: {
      type: Array as PropType<string[]>,
      default: () => [dayjs().format('YYYY-MM-DD 00:00:00'), dayjs().format('YYYY-MM-DD HH:mm:ss')]
    },
    timeType: {
      type: String as PropType<SelectType>,
      default: 'THIS_MONTH'
    }
  },
  emits: ['success'],
  setup (props, { emit, expose }) {
    const alarmStatistics = ref([
      { title: '电气报警数', count: 0, field: 'all', ratio: 0 },
      { title: '未处理报警数', count: 0, field: 'ALARM_UN_CONFIRMED', ratio: 0 },
      { title: '已处理报警数', count: 0, field: 'ALARM_HANDLER', ratio: 0 },
    ])
    const getAlarmStatistics = async (): Promise<void> => {
      const prams = {
        period: props.period.join(','),
        type: props.timeType,
        applicationCode: ApplicationCode.ELECTRICAL
      }
      const res = await cubeAlarmSafetyAnalysisService.safetyAnalysisAlarmTotal(prams)
      emit('success')
      alarmStatistics.value = [
        { title: '电气报警数', count: res.alarmNum ?? 0, field: 'all', ratio: res?.ringAlarmNumRatio ?? 0 },
        { title: '未处理报警数', count: res.noHandlerNum ?? 0, field: 'ALARM_UN_CONFIRMED', ratio: res?.ringNoHandlerRatio ?? 0 },
        { title: '已处理报警数', count: res.handlerNum ?? 0, field: 'ALARM_HANDLER', ratio: res?.ringHandlerNumRatio ?? 0 },
      ]
    }
    watch(() => props.period, () => {
      getAlarmStatistics()
    }, { deep: true })

    expose({
      getData: () => {
        getAlarmStatistics()
      }
    })

    const alarmEvent = (status: string): void => {
      const params = {
        alarmStatus: status,
        startTime: props.period[0],
        endTime: props.period[1],
        sourceApp: ApplicationCode.ELECTRICAL
      }
      goAlarmRecords(params)
    }

    return (): JSX.Element =>
      <div class={styles.container}>
        <AlarmCountStatistics onChange={alarmEvent} disabled dataSource={alarmStatistics.value} style='background:white' />
      </div>
  }
})
