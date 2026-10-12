import { defineComponent, onMounted, ref } from 'vue'
import styles from './index.module.less'
import { Cell, CellGroup, Skeleton, showNotify } from 'vant'
import { timePeriod } from '@/utils'
import { useRouter } from 'vue-router'
import { cubeWorkCenterService } from '@/api/server'
import { CubeNavBar, EntryMenu } from '@ghcloud/cube-app-generic-component'
import { routes } from '@/router'
import type { TodoHomePageVO } from '@ghcloud/cube-work-center-service/src/type'

/** 工作中心-入口页面 */
export const Entry = defineComponent({
  name: 'Entry',
  setup: () => {
    const router = useRouter()
    const loading = ref(false)
    
    const info = ref<TodoHomePageVO>()
    const getDataSource = async (): Promise<void> => {
      try {
        loading.value = true
        const params = {
          period: Array.isArray(timeSelect.value) ? timeSelect.value.join(',') : timeSelect.value,
        }
        const res = await cubeWorkCenterService.getHomePageNum(params)
        info.value = res
      } catch (error) {
        const { errorMessage } = (error as { toJSON: () => { errorMessage: string; }; }).toJSON()
        showNotify({ type: 'danger', message: errorMessage || '请求失败' })
      } finally {
        setTimeout(() => {
          loading.value = false
        }, 300)
      }
    }
    const timeType = ref('TODAY')
    const timeSelect = ref(timePeriod())
    const timeOptions = [
      { label: '今日', value: timePeriod(), type: 'TODAY' },
      { label: '本周', value: timePeriod('WEEK'), type: 'THIS_WEEK' },
      { label: '本月', value: timePeriod('MONTH'), type: 'THIS_MONTH' },
      { label: '今年', value: timePeriod('YEAR'), type: 'THIS_YEAR' },
    ]
    const timeChange = (item: { value: string; type: string; }): void => {
      timeSelect.value = item.value
      timeType.value = item.type
      getDataSource()
    }
    onMounted(() => {
      getDataSource()
      document.title = '工作中心'
    })
    const handleWork = (type: string): void => {
      router.push({
        path: '/work-list',
        query: {
          typeNum: type,
          period: Array.isArray(timeSelect.value) ? timeSelect.value.join(',') : timeSelect.value,
        },
      })
    }

    return (): JSX.Element =>
      <>
        <CubeNavBar showBack title='工作中心' />
        <div class={styles.container}>
          <EntryMenu title='业务操作' applicationCode='WORK_CENTER' routes={routes} />
          <CellGroup inset class={styles['app-group']}>
            <Cell
              title='数据看板'
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
              <div class={[styles['todo-stat-num']]}>
                <div class={styles['todo-stat-item']} style='background: #FFF9F5;'  onClick={() => {
                    handleWork('totalNum')
                  }}>
                  <Skeleton row={1} animated style='width:100%' v-show={loading.value} />
                  <div class={styles['title-left']}>
                    <div class={styles['todo-stat-item-title']} v-show={!loading.value}>
                      <span>工作事项数</span>
                    </div>
                    <div style='text-align: center;' v-show={!loading.value}>
                      <div class={styles['todo-stat-item-value']}>{info.value?.totalNum}</div>
                    </div>
                  </div>
                  <div class={styles['title-right']}>
                    <div class={styles['todo-stat-item-title']}>当前进度</div>
                    <div class={styles['todo-stat-item-value']}>{info.value?.doneTotalNum}/{info.value?.totalNum}</div>
                  </div>
                </div>
                <div class={styles['item-list']}>
                  <div class={styles['stat-item']} onClick={() => {
                    handleWork('normalNum')
                  }}>
                    <div class={styles['item-label']}>任务数
                      <div class={styles['item-value']}>{info.value?.normalNum}</div>
                    </div>
                    <div class={styles['item-progress']}><span class={styles['item-progress-done']}>已完成</span>{info.value?.doneNormalNum}/{info.value?.normalNum}</div>
                  </div>
                  <div class={styles['stat-item']} onClick={() => {
                    handleWork('alarmNum')
                  }}>
                    <div class={styles['item-label']}>报警数
                    <div class={styles['item-value']}>{info.value?.alarmNum}</div>
                    </div>
                    
                    <div class={styles['item-progress']}><span class={styles['item-progress-done']}>已处理</span>{info.value?.doneAlarmNum}/{info.value?.alarmNum}</div>
                  </div>
                  <div class={styles['stat-item']} onClick={() => {
                    handleWork('approveNum')
                  }}>
                    <div class={styles['item-label']}>工单数
                      <div class={styles['item-value']}>{info.value?.approveNum}</div>
                    </div>
                    <div class={styles['item-progress']}><span class={styles['item-progress-done']}>已审批</span>{info.value?.doneApproveNum}/{info.value?.approveNum}</div>
                  </div>
                </div>

              </div>
              <Skeleton row={3} animated v-show={loading.value} />
            </Cell>
          </CellGroup>
        </div>
      </>
  }
})
