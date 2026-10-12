import { defineComponent, onMounted, onUnmounted, reactive, ref } from 'vue'
import styles from './entry.module.less'
import { Cell, CellGroup, Skeleton, showNotify } from 'vant'
import { CubeAppService } from '@ghcloud/cube-app-js-sdk'
import { EntryMenu, CubeNavBar } from '@ghcloud/cube-app-generic-component'
import { routes } from '../../router'
import { getEnvironment } from '@ghcloud/cube-app-js-sdk/src/js/cube-h5-config'
import { useMetaTitle } from '../../utils/use-meta-title-hook'
import { getAssetsFile, timePeriod } from '../../utils'
import { cubeAlarmCenterService, cubeAlarmSafetyAnalysisService, cubeOuaaService } from '../../api/server'
import type { AlarmStatusStatisticsVO, AlarmTypeStatisticsVO } from '@ghcloud/cube-alarm-center-service/src/types/safety-analys'
import { TypeRankImg } from './type'
import 'vant/es/notify/style'
import { useGlobalRouter } from '../../hook/use-global-router'
/** 入口页面 */
export const Entry = defineComponent({
  name: 'Entry',
  setup: () => {
    useMetaTitle()
    const isApp = getEnvironment() === 'cubeApp'
    const { router } = useGlobalRouter()
    const loading = ref(false)
    const timeSelect = ref(timePeriod())
    const timeType = ref('TODAY')
    const userId = ref('')
    const timeOptions = [
      { label: '今日', value: timePeriod(), type: 'TODAY' },
      { label: '本周', value: timePeriod('WEEK'), type: 'THIS_WEEK' },
      { label: '本月', value: timePeriod('MONTH'), type: 'THIS_MONTH' },
      { label: '今年', value: timePeriod('YEAR'), type: 'THIS_YEAR' },
    ]
    const alarmTotal = reactive({
      total: 0,
      radio: '0'
    })
    const typeRankData = ref<AlarmTypeStatisticsVO[]>([])
    const statistics = ref<AlarmStatusStatisticsVO[]>([])
    const getData = async (): Promise<void> => {
      try {
        loading.value = true
        // 获取用户ID
        const { id } = await cubeOuaaService.getUserMine()
        userId.value = id
        // 获取报警总数
        const { alarmNum, alarmStatusStatisticsVOS } = await cubeAlarmSafetyAnalysisService.alarmStatistics({ period: timeSelect.value })
        const { ringRatio } = await cubeAlarmCenterService.getAlarmStatisticsRingRatioAnalysis({ period: timeSelect.value, type: timeType.value })
        alarmTotal.radio = ringRatio ?? ''
        alarmTotal.total = alarmNum ?? 0
        const statisticType = ['ALARM_PROGRESS_CONFIRMED', 'ALARM_UN_CONFIRMED', 'ALARM_SUSPEND', 'ALARM_HANDLER']
        statistics.value = alarmStatusStatisticsVOS?.filter(x => statisticType.includes(x.alarmStatus ?? '')) ?? []
        // 报警类型排名统计
        typeRankData.value = await cubeAlarmSafetyAnalysisService.alarmStatisticsTypeRank({ period: timeSelect.value })
      } catch {
        showNotify({ message: '获取数据失败', type: 'danger' })
      } finally {
        setTimeout(() => {
          loading.value = false
        }, 0)
      }
    }
    const handlePopState = (): void => {
      const cubeAppService = CubeAppService.getInstance()
      history.pushState(null, '', location.href)
      cubeAppService.closePage()
    }
    const toAlarm = async (): Promise<void> => {
      if (alarmTotal.total > 0) {
        router.push({
          path: '/alarm-records',
          query: { alarmStatus: '', period: timeSelect.value }
        })
      }
    }
    const timeChange = (item: { value: string; type: string; }): void => {
      timeSelect.value = item.value
      timeType.value = item.type
      getData()
    }
    onMounted(() => {
      getData()
      if (isApp) {
        history.pushState(null, '', location.href)
        window.addEventListener('popstate', handlePopState, false)
      }
    })
    onUnmounted(() => {
      window.removeEventListener('popstate', handlePopState, false)
    })

    return (): JSX.Element =>
      <>
        <CubeNavBar showBack title='报警中心' />
        <div class={styles.container}>
          <EntryMenu title='业务操作' applicationCode={__ENV__.applicationCode} routes={routes} />
          <CellGroup inset class={styles['app-group']}>
            <Cell
              border={false}
              title='报警中心'
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
                              timeChange(e)
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
            <Cell>
              <div class={styles['alarm-statistic']}>
                <p>报警总数</p>
                <div class={styles.content} onClick={() => {
                  toAlarm()
                }}>
                  <div style={{ marginTop: '16px' }}>
                    <span style={{ color: 'black', fontSize: '22px', marginRight: '4px' }}>{alarmTotal.total}</span>
                    <span style={{ fontSize: '12px', marginTop: '20px' }}>环比</span>
                    <span style={{ fontSize: '12px', color: `${alarmTotal.radio.includes('-') ? 'green' : 'red'}`, marginTop: '20px' }}>
                      {alarmTotal.radio}%<img width='10' src={alarmTotal.radio.includes('-') ? getAssetsFile('ic_trend_down.svg') : getAssetsFile('ic_trend_up.svg')} alt='' />
                    </span>
                  </div>
                  <img src={getAssetsFile('ic_card_chart.svg')} width='100' alt='2' />
                </div>
              </div>
              <Skeleton row={3} animated v-show={loading.value} />
              <div class={styles['stat-bottom']} v-show={!loading.value}>
                {statistics.value.map(item =>
                  <div
                    class={styles['stat-bottom-item']} key={item.alarmStatusName ?? ''}
                    onClick={() => {
                      if (item.alarmNum && item.alarmNum > 0) {
                        router.push({ path: '/alarm-records', query: { alarmStatus: item.alarmStatus, period: timeSelect.value } })
                      }
                    }}
                  >
                    <div class={styles['stat-bottom-item-title']}>{item.alarmNum}</div>
                    <div class={styles['stat-bottom-item-value']}>{item.alarmStatusName}</div>
                  </div>)}
              </div>
            </Cell>
            <Cell border={false}>
              <div class={styles['type-rank']} v-show={!loading.value}>
                {typeRankData.value.map(item =>
                  <div
                    class={styles.item} key={item.id ?? ''}
                    onClick={() => {
                      router.push({
                        path: '/alarm-records',
                        query: { alarmStatus: '', period: timeSelect.value, applicationCode: item.applicationCode, alarmTypeCode: item.id }
                      })
                    }}
                  >
                    <div class={styles.img}>
                      <img src={getAssetsFile(`${TypeRankImg.get(item.applicationCode ?? '') ?? 'ic_card_record.svg'}`)} alt='' />
                    </div>
                    <div class={styles.content}>
                      <span style='white-space:nowrap;display:inline-block'>{item.name}</span>
                      <span>{item.alarmNum}</span>
                    </div>
                  </div>)}
              </div>
            </Cell>
          </CellGroup>
        </div>
      </>
  }
})
