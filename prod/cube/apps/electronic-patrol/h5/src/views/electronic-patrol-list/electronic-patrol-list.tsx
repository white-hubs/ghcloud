import { List, Empty, PullRefresh, Cell, CellGroup } from 'vant'
import { defineComponent, reactive, ref } from 'vue'
import styles from './electronic-patrol-list.module.less'
import { useRoute, useRouter } from 'vue-router'
import dayjs from 'dayjs'
import { cubeMaintainService } from '@/api/server'
import { SearchFilter } from '../components/search-filter/search-filter'
import type { ElectronicPatrols } from '@ghcloud/cube-risk-management-service'
import { CubeNavBar } from '@ghcloud/cube-app-generic-component'
/** 巡更记录列表页 */
export const PatrolsList = defineComponent({
  setup: () => {
    const router = useRouter()
    const dataSource = ref<ElectronicPatrols[]>([])
    const loading = ref(false)
    const finished = ref(false)
    const refreshing = ref(false)
    const route = useRoute()
    const search = reactive({
      keyword: '',
      period: route.query.period as string,
      locationId: route.query.entityId as string,
      pageNumber: 0,
      total: 1,
      pageSize: 10,
    })
    // 获取巡更列表
    const onLoad = async (): Promise<void> => {
      try {
        loading.value = true
        search.pageNumber++

        const res = await cubeMaintainService.getElectronicPatrolsPage({ ...search })
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
      } catch {
        finished.value = true
      } finally {
        loading.value = false
        refreshing.value = false
      }
    }
    const onSearch = (searchState: {
      keyword: string;
      period: string;
    }): void => {
      search.keyword = searchState?.keyword ?? ''
      search.period = searchState?.period ?? ''
      search.pageNumber = 0
      dataSource.value = []
      finished.value = false
      onLoad()
    }
    // 进入详情
    const toDetail = (id?: string): void => {
      router.push({ path: '/record-detail', query: { id } })
    }
    return (): JSX.Element =>
      <>
        <CubeNavBar showBack title={route.meta.title} />
        <div style={{ height: 'calc(100vh - 53px)', background: '#f3f7fa', overflowY: 'scroll' }}>
          <SearchFilter placeholder='根据巡更任务名称进行搜索' onConfirm={onSearch} />
          <PullRefresh v-model={refreshing.value} onRefresh={onSearch} style={{ height: '87vh', overflow: 'auto' }}>
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
                  <CellGroup inset class={styles['electronic-patrol-cell-group']} key={item.formInstanceId}>
                    <Cell>
                      <div class={styles['electronic-patrol-cell-title']}>
                        <div class={styles['name-status']}>
                          <span class={styles.name}>{item.taskName}</span>
                        </div>
                      </div>
                    </Cell>
                    <Cell class={styles['electronic-patrol-cell']} onClick={() => {
                      toDetail(item.id)
                    }}>
                      <div class={styles['electronic-patrol-cell-item']}>
                        <label>巡更人员：</label>
                        <span>{item.userName || '--'}</span>
                      </div>
                      <div class={styles['electronic-patrol-cell-item']}>
                        <label>完成时间：</label>
                        <span>{item.completeDate ? dayjs(item.completeDate).format('YYYY-MM-DD HH:mm') : '--'}</span>
                      </div>
                      <div class={styles['patrols-cell-item']}>
                        <div class={styles.item}>
                          <div>巡更点数</div>
                          <div style={{ color: '#3D3D3D', fontWeight: '500' }}>{item.patrolLocationNum}</div>
                        </div>
                        <div class={styles.item}>
                          <div>已巡</div>
                          <div style={{ color: '#6AB539', fontWeight: '500' }}>{item.completedNum}</div>
                        </div>
                        <div class={styles.item}>
                          <div>漏巡</div>
                          <div style={{ color: '#FFAA26', fontWeight: '500' }}>{item.undoneNum}</div>
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
      </>
  }
})
