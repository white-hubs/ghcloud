import { defineComponent, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import styles from './security-patrol-route.module.less'
import { Button, Cell, CellGroup, Empty, List, PullRefresh, Search } from 'vant'
import { cubeSecurityManagementService } from '@/api/server'
import type { CameraPatrolLine } from '@ghcloud/cube-security-management-service'
import dayjs from 'dayjs'
import { CubeNavBar } from '@ghcloud/cube-app-generic-component'

/** 巡逻路线 */
export const SecurityPatrolRoutes = defineComponent({
  setup () {
    document.title = '巡逻路线'
    const router = useRouter()
    const refreshing = ref(false)
    const loading = ref(false)
    const finished = ref(false)
    const dataSource = ref<CameraPatrolLine[]>([])
    const search = reactive({
      pageNumber: 0,
      total: 1,
      pageSize: 20,
      keyword: ''
    })
    const onRefresh = async (): Promise<void> => {
      search.pageNumber = 0
      finished.value = false
      await onLoad()
    }

    const onLoad = async (): Promise<void> => {
      try {
        loading.value = true
        search.pageNumber++
        const res = await cubeSecurityManagementService.getCameraPatrolLineAuthPage({
          pageNumber: search.pageNumber,
          pageSize: search.pageSize,
          keyword: search.keyword,
        })
        if (res.total <= search.pageSize) {
          finished.value = true
        }
        if (res.records.length < search.pageSize) {
          finished.value = true
        }
        if (res.pages <= search.pageNumber) {
          finished.value = true
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

    const toDetailPage = (id: string): void => {
      router.push({
        name: 'security-patrol-route-detail',
        query: {
          id
        }
      })
    }

    return (): JSX.Element =>
      <div class={styles.page}>
        <CubeNavBar showBack title='巡逻路线' />
        <div class={styles['search-bar']}>
          <Search
            v-model={search.keyword}
            placeholder='根据巡逻路线名称进行搜索'
            onSearch={onRefresh}
          />
        </div>
        <PullRefresh v-model={refreshing.value} onRefresh={onRefresh} class={styles.content}>
          <List
            v-model:loading={loading.value}
            finished={finished.value}
            finished-text={dataSource.value.length === 0 ? '' : '暂无更多数据'}
            onLoad={onLoad}
          >
            {
              dataSource.value.map(e => {
                return (
                  <CellGroup inset key={e.id}>
                    <Cell
                      title={e.name}
                      v-slots={{
                        label: () =>
                          <>
                            <div class={styles['card-content']}>
                              <div>
                                <span>监控点数</span>
                                <span>{e.cameraNum}</span>
                              </div>
                              <div>
                                <span>巡逻人员</span>
                                <span>{e.patrolUserNames}</span>
                              </div>
                              <div>
                                <span>最近巡逻时间</span>
                                <span>{dayjs(e.patrolLastTime).format('YYYY-MM-DD HH:mm:ss')}</span>
                              </div>
                            </div>
                            <div style='display:flex;justify-content:flex-end;'>
                              <Button size='mini' type='primary' onClick={() => {
                                toDetailPage(e.id)
                              }}>开始巡逻</Button>
                            </div>
                          </>
                        ,
                      }}
                    />
                  </CellGroup>
                )
              })
            }
            {(dataSource.value.length === 0 && search.pageNumber === 1 && !loading.value) && <Empty description='暂无数据' />}
          </List>
        </PullRefresh>
      </div>
  }
})
