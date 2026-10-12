import { defineComponent, onMounted, ref, watch } from 'vue'
import styles from './index.module.less'
import { cubeAlarmSafetyAnalysisService } from '@/api/server'
import type { AlarmTypeStatisticsVO } from '@ghcloud/cube-alarm-center-service/src/types/safety-analys'
import { ApplicationCode } from '@ghcloud/cube-safety-supervision-service'
import { goAlarmRecords } from '@/utils'

export const AlarmList = defineComponent({
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
      { name: '消防报警', alarmNum: 0 },
      { name: '电气报警', alarmNum: 0 },
      { name: '安防报警', alarmNum: 0 },
      { name: '用气报警', alarmNum: 0 },
      { name: '动环报警', alarmNum: 0 }
    ]
    const dataSource = ref<AlarmTypeStatisticsVO[]>([...initData])
    const getAlarmStatistics = async (): Promise<void> => {
      const prams = {
        period: props.period,
        type: props.timeType,
        applicationCodeList: ['FIRECONTROL', 'ELECTRICMANAGE', 'SECURITY_MONITORING', 'GAS_MANAGEMENT', 'ROTATINGMANAGE']
      }
      const res = await cubeAlarmSafetyAnalysisService.alarmStatisticsTypeRank(prams)
      if (res.length > 0) {
        res.forEach((item: AlarmTypeStatisticsVO) => {
          dataSource.value.forEach((i) => {
            if (i.name && item.name?.includes(i.name?.substring(0, 2))) {
              i.alarmNum = item.alarmNum ?? 0
            }
          })
        })
      } else {
        dataSource.value = [
          { name: '消防报警', alarmNum: 0 },
          { name: '电气报警', alarmNum: 0 },
          { name: '安防报警', alarmNum: 0 },
          { name: '用气报警', alarmNum: 0 },
          { name: '动环报警', alarmNum: 0 }
        ]
      }
    }
    const linkList = [
      { name: '消防', code: ApplicationCode.FIRE },
      { name: '电气', code: ApplicationCode.ELECTRICAL },
      { name: '安防', code: ApplicationCode.MONITORING },
      { name: '用气', code: ApplicationCode.GAS },
      { name: '动环', code: ApplicationCode.ROTATING },
    ]
    const handleClickItem = (item: AlarmTypeStatisticsVO): void => {
      const link = linkList.filter(p => item.name && item.name.includes(p.name)) ?? []
      const period = typeof props.period === 'string' ? props.period.split(',') : props.period
      if (link) {
        const params = {
          sourceApp: link[0].code,
          startTime: period[0],
          endTime: period[1],
        }
        goAlarmRecords(params)
      }
      emit('change', item)
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
      <div class={[styles.container, dataSource.value.length === 2 && styles.container_two, styles.list]}>
        {dataSource.value.map((item, index) => {
          return (
            <div class={[styles.item]} onClick={() => {
              handleClickItem(item)
            }} key={index}>
              <div class={styles.title}>{item.name}(个)</div>
              <div class={styles.count}> <span>{item.alarmNum}</span></div>
            </div>
          )
        })}
      </div>
  }
})
