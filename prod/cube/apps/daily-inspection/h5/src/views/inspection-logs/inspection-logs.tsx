import { List, Empty, PullRefresh, Cell, CellGroup } from 'vant'
import { defineComponent, reactive, ref, type VNode } from 'vue'
import styles from './inspection-logs.module.less'
import { useRoute } from 'vue-router'
import { Bar } from '../../components/bar/bar'
import { cubeDailyInspectionService } from '@/api/server'
import type { RecordPage } from '@ghcloud/cube-daily-inspection-service'
import { timeFormat } from '@/utils'

/** 巡检记录列表页 */
export const InspectionLogs = defineComponent({
  setup: () => {
    const route = useRoute()
    const dataSource = ref<RecordPage[]>([])
    const loading = ref(false)
    const finished = ref(false)
    const refreshing = ref(false)
    const search = reactive({
      targetId: route.query.entityId as string,
      period: route.query.period as string,
      pageNumber: 0,
      total: 1,
      pageSize: 10
    })
    // 获取巡检记录列表
    const onLoad = async (): Promise<void> => {
      try {
        loading.value = true
        search.pageNumber++
        const res = await cubeDailyInspectionService.ObjStatisticsRepairsDetail({ ...search })
        search.total = res.total

        if (res.total <= search.pageSize) {
          finished.value = true
        }
        if (res.records.length < search.pageSize) {
          finished.value = true
        }
        if (!dataSource.value) {
          dataSource.value = []
        }
        if (search.pageNumber === 1) {
          dataSource.value = []
        }
        dataSource.value = [...dataSource.value, ...res.records]
      } catch (error) {
        finished.value = true
      } finally {
        loading.value = false
        refreshing.value = false
      }
    }
    const onSearch = (): void => {
      search.pageNumber = 0
      finished.value = false
      onLoad()
    }
    return (): VNode =>
      <div>
        <Bar isShowRight={false} />
        <div style={{ height: '95vh', background: '#f3f7fa' }}>
          <PullRefresh v-model={refreshing.value} onRefresh={onSearch} style={{ height: '94vh', overflow: 'auto' }}>
            <List
              v-model:loading={loading.value}
              finished={finished.value}
              finished-text={dataSource.value.length === 0 ? '' : '暂无更多数据'}
              onLoad={onLoad}
            >
              {
                dataSource.value && dataSource.value.length > 0 &&
              dataSource.value.map((item) => {
                return (
                  <CellGroup inset class={styles['log-cell-group']} key={item.id}>
                    <Cell>
                      <div class={styles['log-cell-title']}>
                        <div class={styles['name-status']}>
                          <span class={styles.name}>{item.taskName}</span>
                          <span class={styles.status} style={{ background: `${item.result === 'NORMAL' ? '#eef8e7' : '#f8e5e5'}`, color: `${item.result === 'NORMAL' ? '#6AB539' : '#FF4158'}` }}>{item.result === 'NORMAL' ? '正常' : '异常'}</span>
                        </div>
                      </div>
                    </Cell>
                    <Cell class={styles['log-cell']}>
                      <div class={styles['log-cell-item']}>
                        <label>巡检人员：</label>
                        <span>{item?.userName || '--'}</span>
                      </div>
                      <div class={styles['log-cell-item']}>
                        <label>任务完成时间：</label>
                        <span>{item.endTime ? timeFormat(item.endTime, true) : '--'}</span>
                      </div>
                      <div class={styles['statistics-cell-item']}>
                        <div class={styles.num}>
                          <label>巡更项数</label>
                          <span>{item.itemCount ?? '--'}</span>
                        </div>
                        <div class={styles.num}>
                          <label>正常项数</label>
                          <span>{item.normalItemCount ?? '--'}</span>
                        </div>
                        <div class={styles.num}>
                          <label>异常项数</label>
                          <span>{item.abnormalItemCount ?? '--'}</span>
                        </div>
                      </div>
                    </Cell>
                  </CellGroup>
                )
              })
              }
              {(dataSource.value.length === 0 && search.pageNumber === 1) && <Empty description='暂无数据' />}
            </List>
          </PullRefresh>
        </div>
      </div>
  }
})
