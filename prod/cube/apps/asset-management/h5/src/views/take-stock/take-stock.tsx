import { List, Empty, PullRefresh, Cell, CellGroup, Search, Tabs, Tab, Button, showNotify } from 'vant'
import { defineComponent, reactive, ref, type VNode } from 'vue'
import styles from './take-stock.module.less'
import { CubeNavBar } from '@ghcloud/cube-app-generic-component'
import dayjs from 'dayjs'
import { cubeAssetManagementService } from '@/api/server'
import type { CheckAsset } from '@ghcloud/cube-asset-management-service'
import { useRoute, useRouter } from 'vue-router'

/** 盘点任务列表页 */
export const TakeStockList = defineComponent({
  setup: () => {
    const dataSource = ref<CheckAsset[]>([])
    const loading = ref(false)
    const finished = ref(false)
    const refreshing = ref(false)
    const activeTab = ref('UNDONE')
    const route = useRoute()
    const router = useRouter()
    const search = reactive({
      status: 'UNDONE',
      keyword: '',
      pageNumber: 0,
      total: 1,
      pageSize: 20
    })
    const stockNum = [
      { label: '待盘点', code: 'checkWaitNumber', color: '#ff976a' },
      { label: '已盘点', code: 'checkCompleteNumber', color: '#1989fa' },
      { label: '盘赢', code: 'checkWinNumber', color: '#07c160' },
      { label: '盘亏', code: 'checkLossNumber', color: '#ee0a24' },
      { label: '异常', code: 'abnormalNumber', color: '#b35cbd' },
    ]
    const statNum = [
      { label: '待盘点', code: 'checkWaitNumber', color: '#ff976a' },
      { label: '已盘点', code: 'checkedNum', color: '#1989fa' },
      { label: '盘赢', code: 'addNum', color: '#07c160' },
      { label: '盘亏', code: 'reduceNum', color: '#ee0a24' }
    ]
    // 获取盘点任务列表
    const onLoad = async (): Promise<void> => {
      try {
        loading.value = true
        search.pageNumber++
        const res = route.query.type === 'asset' ? await cubeAssetManagementService.getTaskByUserIdPage({ ...search }) : await cubeAssetManagementService.getConsumableCheckPage({ ...search })
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
        finished.value = true
      }
    }
    const onSearch = (): void => {
      search.pageNumber = 0
      finished.value = false
      onLoad()
    }
    // 提交结果
    const submit = async (id: string): Promise<void> => {
      try {
        const data = route.query.type === 'asset' ? await cubeAssetManagementService.planSubmit({ taskId: id }) : await cubeAssetManagementService.consumableSubmit(id)
        data ? showNotify({ type: 'success', message: '提交成功' }) : showNotify({ type: 'warning', message: '盘点任务未完成' })
        onSearch()
      } catch (err) {
        showNotify({ type: 'danger', message: (err as { errorMessage: string; }).errorMessage })
      }
    }
    const ListDom = (): VNode =>
      <PullRefresh v-model={refreshing.value} onRefresh={onSearch} style={{ height: '82vh', overflow: 'auto' }}>
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
                  <Cell>
                    <div class={styles['cell-title']}>
                      <div class={styles['name-status']}>
                        <span class={styles.status} style={{ background: `${item.status === 'FINISH' ? '#6AB539' : '#FF4158'}` }}>{item.status === 'FINISH' ? '已完成' : '未完成'}</span>
                        <span class={styles.name}>{item.taskName ?? item.name}</span>
                      </div>
                    </div>
                  </Cell>
                  <Cell class={styles.cell}>
                    <div class={styles['cell-item']}>
                      <label>盘点负责人：</label>
                      <span>{item?.dutyUserName || item?.checker || '--'}</span>
                    </div>
                    <div class={styles['cell-item']}>
                      <label>{route.query.type === 'asset' ? '盘点资产数：' : '盘点仓库：'}</label>
                      <span>{route.query.type === 'asset' ? (item.checkTotalNumber || '--') : (item.storeName || '--')}</span>
                    </div>
                    <div class={styles['cell-item']}>
                      <label>{route.query.type === 'asset' ? '预计完成时间：' : '本次盘点日期：'}</label>
                      <span>{route.query.type === 'asset'
                        ? (item.estimateEndTime ? dayjs(item.estimateEndTime).format('YYYY-MM-DD HH:mm:ss') : '--')
                        : (`${item.startTime ? dayjs(item.startTime).format('YYYY-MM-DD') : '--'}-${item.endTime ? dayjs(item.endTime).format('YYYY-MM-DD') : '--'}`)}
                      </span>
                    </div>
                    <div class={styles['cell-item']}>
                      <label>实际完成时间：</label>
                      <span>{item.realityEndTime ? dayjs(item.realityEndTime).format('YYYY-MM-DD') : '--'}</span>
                    </div>
                    <div class={styles['status-num']}>
                      {
                        route.query.type === 'asset'
                          ? stockNum.map((x: { label: string;code: string;color: string; }) =>
                            <div class={styles.item} key={x.code}>
                              <span>{x.label}</span>
                              <span style={{ color: x.color }}>{item[x.code] ?? '--'}</span>
                            </div>)
                          : statNum.map((x: { label: string;code: string;color: string; }) =>
                            <div class={styles.item} key={x.code}>
                              <span>{x.label}</span>
                              <span style={{ color: x.color }}>{(item as { stat: Record<string, unknown>; })?.stat[x.code] ?? '--'}</span>
                            </div>)
                      }
                    </div>
                  </Cell>
                  <Cell>
                    <div v-show={search.status === 'UNDONE'}>
                      <Button size='small' plain type='primary' style='margin-right:10px' onClick={() => {
                        submit(item.id)
                      }}>提交结果</Button>
                      <Button
                        size='small'
                        type='primary'
                        onClick={() => {
                          if (route.query.type === 'asset') {
                            router.push({ path: '/take-stock/stock-detail', query: { id: item.id } })
                          } else {
                            router.push({ path: '/take-stock/consumables-stock', query: { id: item.id } })
                          }
                        }}
                      >开始盘点
                      </Button>
                    </div>
                  </Cell>
                </CellGroup>
              )
            })
          }
          {(dataSource.value.length === 0 && search.pageNumber === 1) && <Empty description='暂无数据' />}
        </List>
      </PullRefresh>
    return (): JSX.Element =>
      <div>
        <CubeNavBar showBack title={route.query.type === 'asset' ? '资产盘点' : '耗材盘点'} />
        <Search class={styles.keyword} v-model={search.keyword} placeholder='根据盘点任务名称进行搜索' onSearch={onSearch} />
        <div style={{ height: '88vh', background: '#f3f7fa' }}>
          <Tabs
            class={styles['detail-tabs']}
            v-model:active={activeTab.value}
            title-active-color='var(--van-primary-color)'
            line-width='24px'
            onChange={(val: string) => {
              search.status = val; onSearch()
            }}
          >
            <Tab title='未完成' name='UNDONE'>
              {ListDom()}
            </Tab>
            <Tab title='已完成' name='FINISH'>
              {ListDom()}
            </Tab>
          </Tabs>
        </div>
      </div>
  }
})
