
import { Cell, CellGroup, Skeleton } from 'vant'
import { defineComponent, onMounted, ref } from 'vue'
import styles from './small-cards.module.less'
const icon = '/resource/v1/small-engineering/images/small-icon.svg'
import { getPeriodFormat, timeOptions } from '@/utils/timer-picker'
import { cubeSmallEngineeringService } from '@/api/server'
import type { ProjectHomeStatistics } from '@ghcloud/cube-small-engineering-service'
import { useRouter } from 'vue-router'

/** 小散工程卡片 */
export const SmallCards = defineComponent({
  setup: () => {
    const loading = ref(false)
    const timeSelect = ref('THIS_WEEK')
    const smallStatistics = ref<ProjectHomeStatistics>({
      total: 0,
      ringRatio: 0,
      apply: 0,
      signing: 0,
      underway: 0,
      waitAccept: 0,
      completed: 0,
      abnormal: 0,
      normal: 0
    })
    const router = useRouter()

    const timeChange = (value: string): void => {
      timeSelect.value = value
      getData()
    }
    const getData = async (): Promise<void> => {
      loading.value = true
      const params = {
        period: '',
        type: timeSelect.value
      }
      params.period = getPeriodFormat(timeSelect.value)
      smallStatistics.value = await cubeSmallEngineeringService.projectHomeStatistics(params)
      loading.value = false
    }
    const goEngineeringAllList = (type: string): void => {
      router.push({
        name: 'engineeringAllList',
        query: {
          type,
          period: getPeriodFormat(timeSelect.value)
        }
      })
    }
    onMounted(async () => {
      getData()
    })

    return (): JSX.Element =>
      <CellGroup inset class={styles['app-group']}>
        <Cell
          title='小散工程'
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
          <div class={styles['alarm-statistics']} v-show={!loading.value}>
            <div class={styles['small-card-box']}>
              <div class={styles['small-card-box-left']}>
                <div class={styles['small-card-icon']}>
                  <img src={icon} />
                </div>
                <div class={styles['small-card-value']}>
                  <div>
                    <span class={styles['small-card-num']}>{smallStatistics.value.total}</span>
                    <span class={styles['small-card-unit']}>
                      环比
                    </span>
                    <span class={styles['small-card-rate']}>{smallStatistics.value.ringRatio}%</span>
                  </div>
                  <div class={styles['small-card-text']}>工程数</div>
                </div>
              </div>
              <div class={styles['small-card-box-right']}>
                <div class={styles['small-card-box-item']}>
                  <span class={styles.value}>{smallStatistics.value.normal}</span>
                  <span>正常数</span>
                </div>
                <div class={styles['small-card-box-item']}>
                  <span class={styles.value}>{smallStatistics.value.abnormal}</span>
                  <span>异常数</span>
                </div>
              </div>
            </div>
            <div class={styles['alarm-statistics-items']}>
              <div class={styles['alarm-statistics-item']} onClick={() => {
                goEngineeringAllList('UNDERWAY')
              }}>
                <span class={styles.value}>{smallStatistics.value.underway || 0}</span>
                <span>进行中</span>
              </div>
              <div class={styles['alarm-statistics-item']} onClick={() => {
                goEngineeringAllList('WAIT_ACCEPT')
              }}>
                <span class={styles.value}>{smallStatistics.value.waitAccept || 0}</span>
                <span>待验收</span>
              </div>
              <div class={styles['alarm-statistics-item']} onClick={() => {
                goEngineeringAllList('COMPLETED')
              }}>
                <span class={styles.value}>{smallStatistics.value.completed || 0}</span>
                <span>已完成</span>
              </div>
            </div>
          </div>
          <Skeleton row={4} animated v-show={loading.value} />
        </Cell>
      </CellGroup>
  }
})
