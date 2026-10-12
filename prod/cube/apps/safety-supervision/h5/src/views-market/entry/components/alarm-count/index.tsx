import { defineComponent, onMounted, ref, watch } from 'vue'
import styles from './index.module.less'
import { Icon } from 'vant'
import { cubeAlarmSafetyAnalysisService } from '@/api/server'
import type { AlarmStatisticsVO, AlarmStatusStatisticsVO } from '@ghcloud/cube-alarm-center-service/src/types/safety-analys'
import { goAlarmRecords } from '@/utils'
export enum AlarmStatusEnum {
  ALARM_UN_CONFIRMED = '待确认',
  ALARM_PROGRESS_CONFIRMED = '处理中',
  ALARM_HANDLER = '已处理',
  ALARM_SUSPEND = '已挂起',
}

export const AlarmCount = defineComponent({
  props: {
    period: {
      type: String,
      default: ''
    },
    timeType: {
      type: String,
      default: ''
    }
  },
  emits: ['change', 'success'],
  setup (props, { emit, expose }) {
    const initData = [
      { alarmStatusName: '待确认', alarmNum: 0, alarmStatus: 'ALARM_UN_CONFIRMED' },
      { alarmStatusName: '处理中', alarmNum: 0, alarmStatus: 'ALARM_PROGRESS_CONFIRMED' },
      { alarmStatusName: '已处理', alarmNum: 0, alarmStatus: 'ALARM_HANDLER' },
      { alarmStatusName: '已挂起', alarmNum: 0, alarmStatus: 'ALARM_SUSPEND' },
    ]
    const dataSource = ref<AlarmStatusStatisticsVO[]>([
      ...initData
    ])
    const getAlarmStatistics = async (): Promise<void> => {
      const prams = {
        period: props.period,
        type: props.timeType,
      }
      const res: AlarmStatisticsVO = await cubeAlarmSafetyAnalysisService.alarmStatistics(prams)
      if (res.alarmStatusStatisticsVOS?.length) {
        res.alarmStatusStatisticsVOS.forEach((item: AlarmStatusStatisticsVO) => {
          dataSource.value.forEach((i: AlarmStatusStatisticsVO) => {
            if (i.alarmStatus === item.alarmStatus) {
              i.alarmNum = item.alarmNum ?? 0
            }
          })
        })
      } else {
        dataSource.value = [
          { alarmStatusName: '待确认', alarmNum: 0, alarmStatus: 'ALARM_UN_CONFIRMED' },
          { alarmStatusName: '处理中', alarmNum: 0, alarmStatus: 'ALARM_PROGRESS_CONFIRMED' },
          { alarmStatusName: '已处理', alarmNum: 0, alarmStatus: 'ALARM_HANDLER' },
          { alarmStatusName: '已挂起', alarmNum: 0, alarmStatus: 'ALARM_SUSPEND' },
        ]
      }
    }
    const handleClickItem = (item: AlarmStatusStatisticsVO): void => {
      emit('change', item)
      const period = typeof props.period === 'string' ? props.period.split(',') : props.period
      const params = {
        alarmStatus: item.alarmStatus ?? '',
        startTime: period[0],
        endTime: period[1],
      }
      goAlarmRecords(params)
    }
    onMounted(() => {
      // getAlarmStatistics()
    })
    watch(() => props.period, () => {
      getAlarmStatistics()
    })

    expose({
      getData: () => {
        getAlarmStatistics()
      }
    })
    return (): JSX.Element =>
      <div class={[styles.container, dataSource.value.length === 2 && styles.container_two]}>
        {dataSource.value.map((item, index) => {
          return (
            <div class={[styles.item]} onClick={() => {
              handleClickItem(item)
            }} key={index}>
              <div class={styles.title}>
                {item.alarmStatusName}
                <Icon class={styles.arrow} name='arrow-up' />
              </div>
              <div class={styles.count}> <span>{item.alarmNum}</span></div>
            </div>
          )
        })}
      </div>
  }
})
