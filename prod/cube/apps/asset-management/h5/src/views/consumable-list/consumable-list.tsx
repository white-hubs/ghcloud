import { List, Empty, PullRefresh, Cell, CellGroup, Search, Popup, Image, Icon } from 'vant'
import { defineComponent, reactive, ref } from 'vue'
import styles from './consumable-list.module.less'
import { CubeNavBar } from '@ghcloud/cube-app-generic-component'
import { cubeAssetManagementService } from '@/api/server'
import { FilterDom } from './filter/filter-dom'
import type { SuppliesType } from '@ghcloud/cube-asset-management-service'
import { useRoute } from 'vue-router'

/** 耗材列表页 */
export const ConsumableList = defineComponent({
  setup: () => {
    const dataSource = ref<SuppliesType[]>([])
    const loading = ref(false)
    const finished = ref(false)
    const refreshing = ref(false)
    const route = useRoute()
    const { type } = route.query as { type: string; }
    const search = reactive({
      type: type,
      keyword: '',
      pageNumber: 0,
      total: 1,
      pageSize: 20
    })
    const supplies = reactive({
      totalMoney: 0,
      totalNum: 0
    })
    const getTotalMoney = async (): Promise<void> => {
      const { totalMoney, totalNum } = await cubeAssetManagementService.getTotalMoney({ ...search })
      supplies.totalMoney = totalMoney
      supplies.totalNum = totalNum
    }
    getTotalMoney()
    // 获取耗材分页列表
    const onLoad = async (): Promise<void> => {
      try {
        loading.value = true
        search.pageNumber++
        const res = await cubeAssetManagementService.getConsumablePermissionPage({ ...search })
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
      getTotalMoney()
    }
    const showFilter = ref(false)
    return (): JSX.Element =>
      <div>
        <CubeNavBar showBack title={route.query.title ?? '即时库存'} />
        <div class={styles.search}>
          <Search class={styles.keyword} v-model={search.keyword} placeholder='根据耗材名称进行搜索' onSearch={onSearch} />
          <div class={styles.filter} onClick={() => {
            showFilter.value = true
          }}>筛选<Icon style='margin-left:2px' name='list-switch' size='18' /></div>
        </div>
        <div class={styles.statistics}>
          <p>
            <span>耗材金额：</span>
            <span>¥{supplies.totalMoney}</span>
          </p>
          <p>
            <span>耗材数量：</span>
            <span>{supplies.totalNum}</span>
          </p>
        </div>
        <div style={{ height: '83.5vh', background: '#f3f7fa' }}>
          <PullRefresh v-model={refreshing.value} onRefresh={onSearch} style={{ height: '83.5vh', overflow: 'auto' }}>
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
                    <CellGroup inset class={styles['cell-group']} key={item.id}>
                      <Cell class={styles.cell}>
                        <div class={styles['cell-top']}>
                          <Image
                            class={styles.img}
                            fit='fill'
                            src={item.file[0]?.path}
                            width='60' height='60' alt=''
                          />
                          <div class={styles.content}>
                            <div style='color:#666666'>{item.name}</div>
                            <div>耗材编码：{item.code || '--'}</div>
                          </div>
                        </div>
                        <div class={styles['cell-bottom']}>
                          <span>单价：{item.avgPrice}</span>
                          <span>单位：{item.unit}</span>
                          <span>品牌：{item.brand || '--'}</span>
                          <span>剩余数量：{item.stock}</span>
                          <span>总金额：¥{item.amount}</span>
                          <span>库存区间：{(item.stockMin ?? '0') + '-' + (item.stockMax ?? '0')}</span>
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
        <Popup v-model:show={showFilter.value} position='right' style={{ width: '90%', height: '100%' }}>
          <FilterDom v-model:searchForm={search} onSubmit={() => {
            onSearch(); showFilter.value = false
          }} />
        </Popup>
      </div>
  }
})
