import { List, Empty, PullRefresh, Cell, CellGroup, Search, Icon } from 'vant'
import { defineComponent, reactive, ref } from 'vue'
import styles from './fault-report-list.module.less'
import { useRoute, useRouter } from 'vue-router'
import { cubeMaintainService } from '@/api/server'
import { Bar } from '../components/bar/bar'
import { FilterDom } from './filter/filter-dom'
import type { ReportType } from '@ghcloud/cube-maintain-service'

/** 故障报告列表 */
export const FaultReportList = defineComponent({
  setup: () => {
    const router = useRouter()
    const route = useRoute()
    const dataSource = ref<ReportType[]>([])
    const loading = ref(false)
    const finished = ref(false)
    const refreshing = ref(false)
    const search = reactive({
      pageNumber: 0,
      total: 1,
      pageSize: 10,
      type: '',
      keyword: ''
    })
    // 获取故障案例列表
    const onLoad = async (): Promise<void> => {
      try {
        loading.value = true
        search.pageNumber++

        const res = await cubeMaintainService.getReport({ ...search })
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
    const showRight = ref(false)
    const submit = (): void => {
      onSearch()
      showRight.value = false
    }
    // 进入详情
    const toDetail = (item: ReportType): void => {
      sessionStorage.setItem('query', JSON.stringify(route.query))
      router.push({ path: '/report-detail', query: { id: item.id, name: item.name } })
    }
    return (): JSX.Element =>
      <div style={{ height: '100vh', background: '#f3f7fa', overflowY: 'scroll' }}>
        <Bar onReset={() => {
          search.type = ''
        }} showRight={showRight.value} onSubmit={submit}><FilterDom v-model:searchForm={search} /></Bar>
        <Search v-model={search.keyword} placeholder='根据名称进行搜索' onSearch={onSearch} />
        <PullRefresh v-model={refreshing.value} onRefresh={onSearch} style={{ height: 'calc(100vh - 130px)', overflow: 'auto' }}>
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
                  <CellGroup inset class={styles['type-cell-group']} key={item.id} onClick={() => {
                    toDetail(item)
                  }}>
                    <Cell class={styles['type-cell']}>
                      <div class={styles['type-cell-item']}>
                        <span style='text-align:left'>{item.name || '--'}</span>
                        <span>{item.createTime}</span>
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
          router.push('/add-report')
        }} />
      </div>
  }
})
