import { List, Empty, PullRefresh, Cell, CellGroup, Search, Tabs, Tab, Icon, Image, Tag } from 'vant'
import { defineComponent, onMounted, reactive, ref, type VNode } from 'vue'
import styles from './device-list.module.less'
import { useRoute, useRouter } from 'vue-router'
import { Bar } from '../../components/bar/bar'
import { cubeWxService } from '@ghcloud/cube-app-js-sdk'
import { cubeSecurityService } from '../../api/server'
import type { SecurityDeviceRecord } from '@ghcloud/cube-security-management-service'
import { message } from 'ant-design-vue/es'
import { FilterDom } from './filter-dom'
import { useMetaTitle } from '../../hooks/use-meta-title-hook'
import { CubeNavBar } from '@ghcloud/cube-app-generic-component'

/** 设备列表页 */
export const DeviceList = defineComponent({
  setup: () => {
    useMetaTitle()
    const router = useRouter()
    const route = useRoute()
    const applicationCode = route.query.applicationCode as string
    const deviceStatus = route.query.deviceStatus as string
    const activeTab = ref('')
    const dataSource = ref<SecurityDeviceRecord[]>([])
    const loading = ref(false)
    const finished = ref(false)
    const refreshing = ref(false)
    const search = reactive<{
      tagCodes?: string[];
      deviceProdCategoryCodeConcat?: string;
      deviceStatus?: boolean | string;
      applicationCode: string;
      pageSize: number;
      pageNumber: number;
      appAreaId?: string;
      areaName?: string;
      keyword?: string;
      total: number;
    }>({
      applicationCode,
      deviceStatus,
      pageNumber: 0,
      total: 1,
      pageSize: 20
    })
    const tabsList = ref([
      { title: '全部', value: 'ALL' },
      { title: '我的收藏', value: 'COLLECT' }
    ])
    // 获取设备列表
    const onLoad = async (): Promise<void> => {
      try {
        loading.value = true
        search.pageNumber++
        const res = activeTab.value === 'ALL'
          ? await cubeSecurityService.getDeviceMonitoringPage({ ...search })
          : await cubeSecurityService.getCollectionDeviceMonitoringPage({ ...search })
        search.total = res.total
        if (res.total <= search.pageSize || res.records.length < search.pageSize) {
          finished.value = true
        }
        if (!dataSource.value || search.pageNumber === 1) {
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
    // 进入设备监控
    const toDetail = (item: SecurityDeviceRecord): void => {
      if (['FIRECONTROL', 'ELECTRICMANAGE', 'GAS_MANAGEMENT', 'ROTATINGMANAGE'].includes(applicationCode)) {
        router.push({ path: '/monitor-detail', query: { id: item.deviceId, applicationCode, thirdPartyId: item.thirdPartyId } })
      } else {
        router.push({ path: '/device-monitor', query: { id: item.deviceId, applicationCode, isSelf: 1 } })
      }
    }
    const showRight = ref(true)
    const submit = (): void => {
      onSearch()
      showRight.value = false
    }
    // 收藏======================
    const handleCollect = async (id: string, isCollect: boolean): Promise<void> => {
      const msg = isCollect ? '取消收藏成功' : '收藏成功'
      await cubeSecurityService.addDeviceCollection({ deviceId: id, applicationCode })
      message.success(msg)
      onSearch()
    }
    const isWxMini = ref(false)
    onMounted(async () => {
      isWxMini.value = await cubeWxService.getWxEnv()
    })
    const barDom = (): VNode =>
      <Bar
        onReset={() => {
          search.tagCodes = []; search.appAreaId = ''; search.areaName = ''; search.deviceStatus = ''; search.deviceProdCategoryCodeConcat = '' 
        }}
        showRight={showRight.value}
        onSubmit={submit}
      >
        <FilterDom v-model:searchForm={search} />
      </Bar>
    return (): JSX.Element =>
      <div>
        {
          ['FIRECONTROL', 'ROTATINGMANAGE', 'ELECTRICMANAGE', 'GAS_MANAGEMENT'].includes(applicationCode)
            ? barDom()
            : <CubeNavBar showBack title={route.query.title} />
        }
        <Search v-model={search.keyword} placeholder='根据设备名称进行搜索' onSearch={onSearch} />
        <Tabs v-model:active={activeTab.value} style={{ border: 'none' }} onChange={onSearch}>
          {
            tabsList.value.map(item =>
              <Tab key={item.value} name={item.value} title={item.title}>
                <div style={{ height: '82vh', background: '#f3f7fa' }}>
                  <PullRefresh v-model={refreshing.value} onRefresh={onSearch} style={{ height: '78vh', overflow: 'auto' }}>
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
                              <Cell class={styles.cell} onClick={() => {
                                toDetail(item) 
                              }}>
                                <div class={styles['cell-item']}>
                                  <Image width='50' height='50' src={item.picture?.path || ''} />
                                  <div>
                                    <div class={styles['cell-title']}>
                                      <Tag text-color='#ffffff' color={item.deviceStatus ? '#58bd6b' : '#858585'}>{item.communicationStatus}</Tag>
                                      <span>{item?.deviceName || '--'}</span>
                                    </div>
                                    <div class={styles['cell-content']}>
                                      <label>所在区域：</label>
                                      <span>{item.areaName || '--'}</span>
                                    </div>
                                  </div>
                                  <Icon size='16' name='star' color={item.collection ? 'var(--van-primary-color)' : '#858585'} onClick={(e: MouseEvent) => {
                                    e.stopPropagation(); handleCollect(item.deviceId, item.collection) 
                                  }} />
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
              </Tab>)
          }
        </Tabs>
      </div>
  }
})
