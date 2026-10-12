import { defineComponent, onMounted, ref } from 'vue'
import styles from './index.module.less'
import { Cell, PullRefresh } from 'vant'
import { ApplicationMenu } from './components/application-menu'
import { AlarmTotalCount } from './components/alarm-total-count'
import { AlarmCount } from './components/alarm-count'
import { AlarmList } from './components/alarm-list'
import dayjs from 'dayjs'

/** 安全分析 入口页面 */
export const MarketWorkbench = defineComponent({
  setup () {
    document.title = '安全管理'
    const loading = ref(false)
    const alarmListRef = ref<{ getData: () => void; }>()
    const alarmCountRef = ref<{ getData: () => void; }>()
    const alarmTotalCountRef = ref<{ getData: () => void; }>()

    const timeOptions = [
      { label: '今日', value: 'TODAY' },
      { label: '本周', value: 'THIS_WEEK' },
      { label: '本月', value: 'THIS_MONTH' },
      { label: '今年', value: 'THIS_YEAR' },
    ]
    const timeType = ref('THIS_MONTH')
    const period = ref(`${dayjs().startOf('month').format('YYYY-MM-DD 00:00')},${dayjs().format('YYYY-MM-DD HH:mm')}`)
    const timeChange = (value: string): void => {
      timeType.value = value
      switch (timeType.value) {
        case 'TODAY':
          period.value = `${dayjs().format('YYYY-MM-DD 00:00') ?? ''},${dayjs().format('YYYY-MM-DD HH:mm') ?? ''}`
          break
        case 'THIS_WEEK' :
          period.value = `${dayjs().startOf('week').format('YYYY-MM-DD 00:00')},${dayjs().format('YYYY-MM-DD HH:mm')}`
          break
        case 'THIS_MONTH' :
          period.value = `${dayjs().startOf('month').format('YYYY-MM-DD 00:00')},${dayjs().format('YYYY-MM-DD HH:mm')}`
          break
        case 'THIS_YEAR' :
          period.value = `${dayjs().startOf('years').format('YYYY-MM-DD 00:00')},${dayjs().format('YYYY-MM-DD HH:mm')}`
          break
      }
    }
    const getData = (): void => {
      alarmTotalCountRef.value?.getData()
      alarmCountRef.value?.getData()
      alarmListRef.value?.getData()
    }

    const onRefresh = async (): Promise<void> => {
      try {
        loading.value = true
        getData()
        loading.value = false
      } catch {

      } finally {
        loading.value = false
      }
    }
    onMounted(() => {
      getData()
    })
    return (): JSX.Element =>
      <div class={styles.safetyManage}>
        <PullRefresh v-model={loading.value} onRefresh={onRefresh} success-text='刷新成功'>
          <ApplicationMenu period={period.value} timeType={timeType.value} style='margin-top: 12px;' />
          <div class={styles.card}>
            <Cell
              title='安全概览'
              v-slots={{
                value: () => {
                  return (
                    <div class={styles['time-picker']}>
                      {
                        timeOptions.map(e =>
                          <div
                            key={e.label}
                            class={`${e.value === timeType.value ? styles['time-picker-selected'] : ''}`}
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
            <div class={styles.alarmCountStat}>
              <AlarmTotalCount period={period.value} timeType={timeType.value} ref={alarmTotalCountRef} style='background:white' />
              <AlarmCount period={period.value} timeType={timeType.value} ref={alarmCountRef} />
              <AlarmList period={period.value} timeType={timeType.value} ref={alarmListRef} style='background:white' />
            </div>
          </div>
        </PullRefresh>
      </div>
  }
})
