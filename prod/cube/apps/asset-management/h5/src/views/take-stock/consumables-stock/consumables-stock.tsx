import { defineComponent, onMounted, reactive, ref } from 'vue'
import { CellGroup, Cell, Tabs, Tab, List, Image, PullRefresh, Empty, showNotify } from 'vant'
import { useRoute, useRouter } from 'vue-router'
import dayjs from 'dayjs'
import { useMetaTitle } from '@/hooks/use-meta-title-hook'
import styles from './consumables-stock.module.less'
import { CubeNavBar } from '@ghcloud/cube-app-generic-component'
import type { CheckAsset } from '@ghcloud/cube-asset-management-service'
import { cubeAssetManagementService } from '@/api/server'
/** 耗材盘点详情页面 */

export const ConsumablesStock = defineComponent({
  setup: () => {
    const route = useRoute()
    const loading = ref(false)
    const finished = ref(false)
    const refreshing = ref(false)
    const detail = ref<CheckAsset>()
    const dataSource = ref<CheckAsset[]>()
    const activeTab = ref('')
    const router = useRouter()
    onMounted(async () => {
      useMetaTitle()
      getTaskDetail()
    })
    const tabList = ref([
      { title: '待盘', value: 'INCOMPLETE', num: 0 },
      { title: '已盘', value: 'COMPLETED', num: 0 },
      { title: '盘赢', value: 'WIN', num: 0 },
      { title: '盘亏', value: 'LOSS', num: 0 },
    ])
    // 详细信息
    const getTaskDetail = async (): Promise<void> => {
      try {
        const { records } = await cubeAssetManagementService.getConsumableCheckPage({ id: route.query.id as string ?? '', pageNumber: 1, pageSize: 1 })
        detail.value = records[0]
        tabList.value.forEach(x => {
          switch (x.value) {
            case 'INCOMPLETE':
              x.num = detail.value?.stat.checkWaitNumber ?? 0
              break
            case 'COMPLETED':
              x.num = detail.value?.stat.checkedNum ?? 0
              break
            case 'WIN':
              x.num = detail.value?.stat.addNum ?? 0
              break
            case 'LOSS':
              x.num = detail.value?.stat.reduceNum ?? 0
              break
          }
        })
      } catch (err) {
        showNotify({ type: 'danger', message: (err as { errorMessage: string; }).errorMessage })
      }
    }
    const search = reactive({
      status: 'INCOMPLETE',
      checkId: route.query.id as string ?? '',
      pageNumber: 0,
      total: 1,
      pageSize: 20
    })
    // 获取盘点任务列表
    const onLoad = async (): Promise<void> => {
      try {
        loading.value = true
        search.pageNumber++
        const res = await cubeAssetManagementService.getConsumableCheckDetailPage({ ...search })
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
      dataSource.value = []
      search.pageNumber = 0
      finished.value = false
      onLoad()
    }
    return (): JSX.Element =>
      <div style={{ background: '#f3f7fa', height: '100vh', position: 'relative' }}>
        <CubeNavBar showBack title='耗材盘点' />
        <CellGroup class={styles['cell-group']}>
          <Cell>
            <div class={styles['cell-title']}>
              <span class={styles.status} style={{ background: `${detail.value?.status === 'UNDONE' ? 'var(--van-orange)' : 'var(--van-primary-color)'}` }}>{detail.value?.status === 'UNDONE' ? '未完成' : '已完成'}</span>
              <span>{detail.value?.name}</span>
            </div>
          </Cell>
          <Cell class={styles.cell}>
            <div class={styles['cell-item']}>
              <label>盘点负责人：</label>
              <span>{detail.value?.checker || '--'}</span>
            </div>
            <div class={styles['cell-item']}>
              <label>盘点仓库：</label>
              <span>{detail.value?.storeName || '--'}</span>
            </div>
            <div class={styles['cell-item']}>
              <label>本次盘点日期：</label>
              <span>{detail.value?.startTime ? dayjs(detail.value?.startTime).format('YYYY-MM-DD') : '--'} - {detail.value?.endTime ? dayjs(detail.value?.endTime).format('YYYY-MM-DD') : '--'}
              </span>
            </div>
            <div class={styles['cell-item']}>
              <label>实际完成时间：</label>
              <span>{detail.value?.realityEndTime ? dayjs(detail.value?.realityEndTime).format('YYYY-MM-DD hh:mm:ss') : '--'}</span>
            </div>
          </Cell>
        </CellGroup>
        <Tabs
          class={styles['detail-tabs']}
          v-model:active={activeTab.value}
          title-active-color='var(--van-primary-color)'
          line-width='24px'
          onChange={() => {
            search.status = activeTab.value; onSearch()
          }}
        >
          {
            tabList.value.map(x =>
              <Tab title={`${x.title}(${x.num})`} name={x.value} key={x.value}>
                <PullRefresh v-model={refreshing.value} onRefresh={onSearch} style={{ height: '61vh', overflow: 'auto' }}>
                  <List
                    v-model:loading={loading.value}
                    finished={finished.value}
                    finished-text={dataSource.value?.length === 0 ? '' : '暂无更多数据'}
                    onLoad={onLoad}
                    class={styles.list}
                  >
                    {
                      dataSource.value?.map((item) =>
                        <CellGroup class={styles['cell-group']} key={item.name}>
                          <Cell
                            class={styles.cell}
                            onClick={() => {
                              if (x.value === 'INCOMPLETE') {
                                router.push({ path: '/take-stock/consumables-taking', query: { checkId: route.query.id as string ?? '', id: item.id } })
                              }
                            }}
                          >
                            <div class={styles.header}>
                              <div>
                                <label>应盘数量：</label>
                                <span style='color:var(--van-primary-color)'>{item?.checkTotalNumber}</span>
                              </div>
                              <div><label>实盘数量：</label>
                                <span style='color:#323233'>{item?.checkCompleteNumber}</span>
                              </div>
                            </div>
                            <div class={styles.content}>
                              <Image
                                class={styles.img}
                                src={item?.file?.[0]?.path}
                                width='70' height='70' alt=''
                              />
                              <div>
                                <div style='font-weight:500;color:#323233'>{item.name}</div>
                                <div> 耗材编码：{item.code}</div>
                              </div>
                            </div>
                            <div class={styles.footer}>
                              <span>单价：{item.avgPrice}</span>
                              <span>单位：{item.unit}</span>
                              <span>品牌：{item.brand || '--'}</span>
                              <span>总金额：¥{item.amount}</span>
                              <span>库存区间：{item.stockMin ?? 0}-{item.stockMin ?? 0}</span>
                            </div>

                          </Cell>
                        </CellGroup>)
                    }
                    {(dataSource.value?.length === 0 && search.pageNumber === 1) && <Empty description='暂无数据' />}
                  </List>
                </PullRefresh>
              </Tab>)
          }
        </Tabs>
      </div>
  }
})
