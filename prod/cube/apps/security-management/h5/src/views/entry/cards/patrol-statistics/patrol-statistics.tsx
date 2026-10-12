import { Cell, CellGroup, showNotify, Skeleton } from 'vant'
import { defineComponent, onMounted, ref } from 'vue'
import styles from './patrol-statistics.module.less'
const icon = '/resource/v1/security-management/icons/patrol-icon.png'
import { cubeSecurityManagementService } from '@/api/server'
import { getPeriodFormat, timeOptions } from '@/utils/timer-picker'
/** 巡逻统计卡片 */
export const PatrolStatistics = defineComponent({
  setup: () => {
    const loading = ref(false)
    const timeSelect = ref('TODAY')
    const timeChange = (value: string): void => {
      timeSelect.value = value
      getData()
    }
    const patrolStatistics = ref({
      patrolNum: 0,
      patrolRingRatio: '0.00'
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
        const res = await cubeSecurityManagementService.getCameraPatrolGrowthRate(params)
        patrolStatistics.value.patrolNum = res.totalNum
        patrolStatistics.value.patrolRingRatio = res.ringRatio
      } catch {
        showNotify('获取数据失败')
      } finally {
        loading.value = false
      }
    }

    onMounted(() => {
      getData()
    })
    return (): JSX.Element=>
      <CellGroup inset class={styles['app-group']}>
        <Cell
          title='巡逻统计'
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
            <div class={styles['patrol-num']}>
              <div class={styles['patrol-icon']}>
                <img src={icon} />
              </div>
              <span>巡逻次数</span>
            </div>
            <div class={styles['patrol-value']}>
              <div class={styles['total-value']}>{patrolStatistics.value.patrolNum}</div>
              <div class={styles['total-unit']}>个</div>
              <div class={styles['rate-label']}>环比</div>
              <div class={styles['rate-value']}>{patrolStatistics.value.patrolRingRatio}%</div>
            </div>
          </div>
          <Skeleton row={3} animated v-show={loading.value} />
        </Cell>
      </CellGroup>
  }
})
