import { Cell, CellGroup, showNotify, Skeleton, Circle } from 'vant'
import { defineComponent, onMounted, ref } from 'vue'
import styles from './patrol-statistics.module.less'
import { getPeriodFormat, timeOptions } from '@/utils/timer-picker'
import { getAssetsFile } from '@/utils'
import { cubeElectronPatrolService } from '@/api/server'
/** 巡逻统计卡片 */
export const PatrolStatistics = defineComponent({
  setup: () => {
    const loading = ref(false)
    const timeSelect = ref('TODAY')
    const icon = getAssetsFile('card-icon.png')
    const timeChange = (value: string): void => {
      timeSelect.value = value
      getData()
    }
    const patrolStatistics = ref({
      total: 0,
      normal: 0,
      abnormal: 0,
      completeRate: 0,
      abnormalRate: 0,
      waitReceive: 0,
      executing: 0,
      finished: 0
    })

    const getData = async (): Promise<void> => {
      loading.value = true
      const params = {
        type: timeSelect.value as 'TODAY' | 'THIS_WEEK' | 'THIS_MONTH' | 'THIS_YEAR',
        period: ''
      }
      params.period = getPeriodFormat(timeSelect.value)
      try {
        loading.value = true
        const result = await cubeElectronPatrolService.getElectronTaskStat(params)
        patrolStatistics.value = result
      } catch {
        showNotify('获取数据失败')
      } finally {
        loading.value = false
      }
    }

    onMounted(() => {
      getData()
    })
    return (): JSX.Element =>
      <CellGroup style={{ margin: '0 auto' }} inset class={styles['app-group']}>
        <Cell
          title='巡更概览'
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
        <Cell>
          <div class={styles['patrol-statistics-box']} v-show={!loading.value}>
            <div class={styles['card-top']}>
              <div class={styles['top-left']}>
                <div class={styles['patrol-icon']}>
                  <img src={icon} alt='' srcset='' />
                </div>
                <div class={styles['left-statistics']}>
                  <div class={styles['left-count']}>{patrolStatistics.value.total}</div>
                  <div class={styles['left-label']}>巡更任务</div>
                </div>
              </div>
              <div class={styles.line} />
              <div class={styles['top-right']}>
                <div class={styles['right-statistics']}>
                  <div class={[styles['right-count'], styles['right-count-blue']]}>{patrolStatistics.value.normal}</div>
                  <div class={styles['right-label']}>正常数</div>
                </div>
                <div class={styles['right-statistics']}>
                  <div class={[styles['right-count'], styles['right-count-red']]}>{patrolStatistics.value.abnormal}</div>
                  <div class={styles['right-label']}>异常数</div>
                </div>
              </div>

            </div>
            <div class={styles['card-bottom']}>
              <div class={styles.cards}>
                <div class={styles['card-item']}>
                  <Circle size={60} color='#1578FF' stroke-linecap='square' text='' layer-color='#EBECED' rate={100} stroke-width={240} v-model:current-rate={patrolStatistics.value.completeRate} />
                  <div class={styles['fulfil-text']}>
                    <div class={styles['fulfil-count']}>{patrolStatistics.value.completeRate}%</div>
                    <div>完成率</div>
                  </div>
                </div>
                <div class={styles['card-item']}>
                  <Circle size={60} color='#FE9423' stroke-linecap='square' text='' layer-color='#EBECED' rate={100} stroke-width={240} v-model:current-rate={patrolStatistics.value.abnormalRate} />
                  <div class={styles['fulfil-text']}>
                    <div class={styles['fulfil-count']}>{patrolStatistics.value.abnormalRate}%</div>
                    <div>异常率</div>
                  </div>
                </div>
              </div>
              <div class={styles['bottom-stat']}>
                <div class={styles['bottom-stat-item']}>
                  <div class={styles['bottom-stat-count']}>{patrolStatistics.value.waitReceive}</div>
                  <div class={styles['bottom-stat-label']}>待接收</div>
                </div>
                <div class={styles['bottom-stat-item']}>
                  <div class={styles['bottom-stat-count']}>{patrolStatistics.value.executing}</div>
                  <div class={styles['bottom-stat-label']}>执行中</div>
                </div>
                <div class={styles['bottom-stat-item']}>
                  <div class={styles['bottom-stat-count']}>{patrolStatistics.value.finished}</div>
                  <div class={styles['bottom-stat-label']}>已结束</div>
                </div>
              </div>
            </div>
          </div>
          <Skeleton row={3} animated v-show={loading.value} />
        </Cell>
      </CellGroup>
  }
})
