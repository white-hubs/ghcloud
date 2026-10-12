import { List, Empty, PullRefresh, Cell, CellGroup, Search, Icon } from 'vant'
import { defineComponent, onMounted, reactive, ref } from 'vue'
import styles from './case-list.module.less'
import { useRoute, useRouter } from 'vue-router'
import { cubeMaintainService } from '@/api/server'
import type { FaultCaseType } from '@ghcloud/cube-maintain-service'
import { CubeNavBar } from '@ghcloud/cube-app-generic-component'

/** 故障案例列表 */
export const CaseList = defineComponent({
  setup: () => {
    const router = useRouter()
    const route = useRoute()
    const dataSource = ref<FaultCaseType[]>([])
    const loading = ref(false)
    const finished = ref(false)
    const refreshing = ref(false)
    const headHeight = ref()
    onMounted(() => {
      const bar = document.getElementsByClassName('van-nav-bar')[0].clientHeight
      const search = document.getElementsByClassName('van-search')[0].clientHeight
      headHeight.value = bar + search
    })
    const search = reactive({
      pageNumber: 0,
      total: 1,
      pageSize: 10,
      keyword: ''
    })
    // 获取故障案例列表
    const onLoad = async (): Promise<void> => {
      try {
        loading.value = true
        search.pageNumber++

        const res = await cubeMaintainService.faultCasePage({ ...search })
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
    const onSearch = (): void => {
      search.pageNumber = 0
      finished.value = false
      onLoad()
    }
    // 进入详情
    const toDetail = (id?: string): void => {
      sessionStorage.setItem('query', JSON.stringify(route.query))
      router.push({ path: '/add-case', query: { id } })
    }
    return (): JSX.Element =>
      <div style={{ height: '100vh', background: '#f3f7fa', overflowY: 'scroll' }}>
        <CubeNavBar showBack title='案例库' />
        <Search v-model={search.keyword} placeholder='根据名称进行搜索' onSearch={onSearch} />
        <PullRefresh v-model={refreshing.value} onRefresh={onSearch} style={{ height: `calc(100vh - ${headHeight.value}px)`, overflow: 'auto' }}>
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
                  <CellGroup inset class={styles['fault-cell-group']} key={item.id} onClick={() => {
                    toDetail(item.id)
                  }}>
                    <Cell>
                      <div class={styles['fault-cell-title']}>
                        <div class={styles['name-status']}>
                          <span class={styles.name}>{item.name}</span>
                        </div>
                      </div>
                    </Cell>
                    <Cell class={styles['fault-cell']}>
                      <div class={styles['fault-cell-item']}>
                        <label>故障类型：</label>
                        <span>{item.faultTypeName || '--'}</span>
                      </div>
                    </Cell>
                  </CellGroup>
                )
              })
            }
            {(dataSource.value.length === 0 && search.pageNumber === 1) && <Empty description='暂无数据' />}
          </List>
        </PullRefresh>
        <Icon class={styles.addCase} name='add' color='var(--van-primary-color)' size='50' onClick={() => {
          router.push('/add-case')
        }} />
      </div>
  }
})
