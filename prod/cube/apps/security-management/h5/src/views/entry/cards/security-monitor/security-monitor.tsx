import { Cell, CellGroup, showNotify, Skeleton } from 'vant'
import { defineComponent, onMounted, ref } from 'vue'
import styles from './security-monitor.module.less'
import { cubeAlarmSafetyAnalysisService, cubeOuaaService } from '@/api/server'
const icon = '/resource/v1/security-management/icons/alarm-icon.png'
import { useRouter } from 'vue-router'
import { getPeriodFormat, timeOptions } from '@/utils/timer-picker'

/** 安防监控卡片 */
export const SecurityMonitor = defineComponent({
  setup: () => {
    const loading = ref(false)
    const userId = ref('')
    const router = useRouter()
    const timeSelect = ref('THIS_WEEK')
    const alarmStatistics = ref({
      alarm_un_confirmed: 0,
      alarm_progress_confirmed: 0,
      alarm_suspend: 0,
      alarm_handler: 0,
      alarmNum: 0,
      alarmRingRatio: '0.00'
    })
    const timeChange = (value: string): void => {
      timeSelect.value = value
      getData()
    }
    const getData = async (): Promise<void> => {
      const params = {
        userId: userId.value,
        applicationCode: __ENV__.applicationCode,
        period: ''
      }
      params.period = getPeriodFormat(timeSelect.value)

      try {
        loading.value = true
        const res = await cubeAlarmSafetyAnalysisService.alarmStatistics(params)
        alarmStatistics.value.alarmNum = res.alarmNum ?? 0
        alarmStatistics.value.alarmRingRatio = res.alarmRingRatio as string ?? '0.00'
        alarmStatistics.value.alarm_un_confirmed = res.alarmStatusStatisticsVOS?.find(e => e.alarmStatus === 'ALARM_UN_CONFIRMED')?.alarmNum || 0
        alarmStatistics.value.alarm_progress_confirmed = res.alarmStatusStatisticsVOS?.find(e => e.alarmStatus === 'ALARM_PROGRESS_CONFIRMED')?.alarmNum || 0
        alarmStatistics.value.alarm_suspend = res.alarmStatusStatisticsVOS?.find(e => e.alarmStatus === 'ALARM_SUSPEND')?.alarmNum || 0
        alarmStatistics.value.alarm_handler = res.alarmStatusStatisticsVOS?.find(e => e.alarmStatus === 'ALARM_HANDLER')?.alarmNum || 0
      } catch {
        showNotify({ message: '获取数据失败', type: 'danger' })
      } finally {
        loading.value = false
      }
    }

    onMounted(async () => {
      const userInfo = await cubeOuaaService.getUserMine()
      userId.value = userInfo.id
      getData()
    })
    const handleJump = (status: string, number: number): void => {
      if (!number) return
      router.push({ path: '/baseAlarmRecords', query: { applicationCode: 'SECURITY_MONITORING', alarmStatus: status, period: getPeriodFormat(timeSelect.value), userId: userId.value } })
    }

    return (): JSX.Element=>
      <CellGroup inset class={styles['app-group']}>
        <Cell
          title='安防监控'
          v-slots={{
            value: () => {
              return (
                <div class={styles['time-picker']}>
                  {
                    timeOptions.map(e =>
                      <div
                        key={e.label}
                        class={`${e.value === timeSelect.value ? styles['time-picker-selected'] : ''}`}
                        onClick={() => {
                          timeChange(e.value)
                        }}
                      >
                        {e.label}
                      </div>)
                  }
                </div>
              )
            }
          }}
        />
        {/* if (item.alarmNum && item.alarmNum > 0) {
                      router.push({ path: '/alarm-records', query: { alarmStatus: item.alarmStatus, period: timeSelect.value } })
                    } */}
        <Cell>
          <div class={styles['alarm-statistics']} v-show={!loading.value}>
            <div class={styles['alarm-statistics-box']}>
              <div class={styles['alarm-num']}>
                <div class={styles['alarm-icon']}>
                  <img src={icon} />
                </div>
                <span>报警数</span>
              </div>
              <div class={styles['alarm-value']}>
                <div class={styles['total-value']}>{alarmStatistics.value.alarmNum}</div>
                <div class={styles['total-unit']}>个</div>
                <div class={styles['rate-label']}>环比</div>
                <div class={styles['rate-value']}>{alarmStatistics.value.alarmRingRatio}%</div>
              </div>
            </div>
            <div class={styles['alarm-statistics-items']}>
              <div class={styles['alarm-statistics-item']} onClick={() => {
                handleJump('ALARM_UN_CONFIRMED', alarmStatistics.value.alarm_un_confirmed)
              }}>
                <span class={styles.value}>{alarmStatistics.value.alarm_un_confirmed}</span>
                <span>待接收</span>
              </div>
              <div class={styles['alarm-statistics-item']} onClick={() => {
                handleJump('ALARM_PROGRESS_CONFIRMED', alarmStatistics.value.alarm_progress_confirmed)
              }}>
                <span class={styles.value}>{alarmStatistics.value.alarm_progress_confirmed}</span>
                <span>处理中</span>
              </div>
              <div class={styles['alarm-statistics-item']} onClick={() => {
                handleJump('ALARM_SUSPEND', alarmStatistics.value.alarm_progress_confirmed)
              }}>
                <span class={styles.value}>{alarmStatistics.value.alarm_suspend}</span>
                <span>已挂起</span>
              </div>
              <div class={styles['alarm-statistics-item']} onClick={() => {
                handleJump('ALARM_HANDLER', alarmStatistics.value.alarm_handler)
              }}>
                <span class={styles.value}>{alarmStatistics.value.alarm_handler}</span>
                <span>已处理</span>
              </div>
            </div>
          </div>
          <Skeleton row={4} animated v-show={loading.value} />
        </Cell>
      </CellGroup>
  }
})
