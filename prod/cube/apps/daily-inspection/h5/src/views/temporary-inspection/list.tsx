import { Divider, Empty, List, PullRefresh, Search, Tab, Tabs, Tag } from 'vant'
import { defineComponent, onMounted, reactive, ref, type VNode } from 'vue'
import styles from './list.module.less'
import { useMetaTitle } from '../hooks/use-meta-title-hook'
import { useRoute, useRouter } from 'vue-router'
import { cubeAssetManagementService, cubeDeviceCenterService, cubeMaintainService, cubeMdataService, cubeOuaaService, cubePropertyService, cubeSmallEngineeringService } from '@/api/server'
import { Bar } from '../../components/bar/bar'
import type { DeviceInstancePage } from '@ghcloud/cube-iot-center-service'
import type { StallPage } from '@ghcloud/cube-mdata-service'
import type { AssetType } from '@ghcloud/cube-asset-management-service'
import type { RootObject } from '@ghcloud/cube-maintain-service'
import type { RiskSourceLedgerVO } from '@ghcloud/cube-risk-management-service'
import type { ProjectScheduleListRecord } from '@ghcloud/cube-small-engineering-service'

type ListItemType =
  | DeviceInstancePage
  | StallPage
  | AssetType
  | RootObject
  | RiskSourceLedgerVO
  | ProjectScheduleListRecord;

interface ApiResponse<T> {
  total: number;
  pages?: number; // 可选字段
  records: T[];
}
/** 临时巡检列表 */
export const TemporaryInspectionList = defineComponent({
  setup: () => {
    useMetaTitle()
    const route = useRoute()
    const search = reactive({
      pageNumber: 0,
      total: 1,
      pageSize: 10,
      keyword: '',
      status: (route.query.status as string) ?? '',
      period: '',
      areaId: '', // 新增字段
      typeId: '', // 新增字段
      sourceId: '', // 新增字段
      receiveDepId: '', // 新增字段
      purchaseStartDate: '', // 可选
      purchaseEndDate: '', // 可选
      usageDate: '', // 可选
      typeCode: undefined,
    })
    const activeTab = ref('')
    const dataSource = ref<ListItemType[]>([])
    const loading = ref(false)
    const finished = ref(false)
    const refreshing = ref(false)
    const router = useRouter()
    const userId = ref('')

    // 设备
    const getDeviceList = async (): Promise<ApiResponse<DeviceInstancePage>> => {
      return cubeDeviceCenterService.getDeviceInstancePageAll(search)
    }
    // 档位
    const getStallList = async (): Promise<ApiResponse<StallPage>> => {
      return cubeMdataService.stallPage(search)
    }
    // 资产
    const getAssetList = async (): Promise<ApiResponse<AssetType>> => {
      return cubeAssetManagementService.getPropertyDetailedPage(search)
    }
    // 现场点
    const getPointList = async (): Promise<ApiResponse<RootObject>> => {
      return cubeMaintainService.inspectPointList(search)
    }
    // 风险源
    const getRiskList = async (): Promise<ApiResponse<RiskSourceLedgerVO>> => {
      return cubePropertyService.riskSourceLedgerPage(search)
    }
    // 小散工程
    const getProjectList = async (): Promise<ApiResponse<ProjectScheduleListRecord>> => {
      return cubeSmallEngineeringService.projectScheduleList(search)
    }
    type ApiResponseUnion =
  | ApiResponse<DeviceInstancePage>
  | ApiResponse<StallPage>
  | ApiResponse<AssetType>
  | ApiResponse<RootObject>
  | ApiResponse<RiskSourceLedgerVO>
  | ApiResponse<ProjectScheduleListRecord>

    const tabListMap = new Map<string, () => Promise<ApiResponseUnion>>([
      ['DEVICE', getDeviceList],
      ['STALL', getStallList],
      ['PROPERTY', getAssetList],
      ['SITE_POINT', getPointList],
      ['RISK_SOURCE', getRiskList],
      ['SMALL_ENGINEERING', getProjectList]
    ])
    const tabs = ref([
      { title: '档位', status: 'STALL' },
      { title: '资产', status: 'PROPERTY' },
      { title: '设备', status: 'DEVICE' },
      { title: '现场点', status: 'SITE_POINT' },
      { title: '小散工程', status: 'SMALL_ENGINEERING' },
      // { title: '风险源', status: 'RISK_SOURCE' },
    ])

    // 获取数据
    const onLoad = async (): Promise<void> => {
      try {
        loading.value = true
        search.pageNumber++
        const res = await tabListMap.get(activeTab.value)?.()
        if (res) {
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
        }
      } catch {
        finished.value = true
      } finally {
        loading.value = false
        refreshing.value = false
      }
    }

    const getUser = async (): Promise<void> => {
      try {
        const { id } = await cubeOuaaService.getUserMine()
        userId.value = id
      } catch {
      }
    }
    const lastActiveTab = ref('') // 添加记录上一次选中的tab
    const onClickTab = (): void => {
      lastActiveTab.value = activeTab.value
      search.period = ''
      onRefresh()
    }

    // 跳转详情
    const toDetail = (id: string | number | undefined): void => {
      sessionStorage.setItem('lastActiveTab', activeTab.value)
      router.push({ path: '/inspection-execute', query: { isTemporary: 'true', targetId: id, targetCategory: activeTab.value } })
    }

    onMounted(() => {
      const savedTab = sessionStorage.getItem('lastActiveTab')
      if (savedTab) {
        activeTab.value = savedTab
        sessionStorage.removeItem('lastActiveTab')
      }
      onLoad()
      getUser()
    })
    // 下拉刷新
    const onRefresh = (): void => {
      search.pageNumber = 0
      finished.value = false
      onLoad()
    }
    // 查询
    const onSearch = (): void => {
      search.pageNumber = 0
      onLoad()
    }
    return (): VNode=>
      <div class={styles.wrapper}>
        <Bar />
        <Search v-model={search.keyword} placeholder='搜索巡检对象' show-action onSearch={onSearch} onClear={onSearch} onCancel={onSearch} />
        <Tabs v-model:active={activeTab.value} class={styles.tabs} shrink sticky onClickTab={onClickTab}>
          {tabs.value.map(item =>
            <Tab title={item.title} name={item.status} key={item.title}>
              <PullRefresh v-model={refreshing.value} onRefresh={onRefresh} style={{ height: '77vh', marginTop: '5px', overflow: 'auto' }}>
                <List
                  v-model:loading={loading.value}
                  finished={finished.value}
                  finished-text={dataSource.value.length === 0 ? '' : '暂无更多数据'}
                  onLoad={onLoad}
                >
                  {
                    (dataSource.value && dataSource.value.length > 0) &&
                    dataSource.value.map((item: ListItemType, index: number) =>
                      <div class={styles['cell-group']} key={index} onClick={() => toDetail(item.id)}>
                        <div class={styles.title}>
                          <span class={styles['title-name']}>
                            {
                              activeTab.value === 'STALL' && <>
                                {(item as StallPage).code}
                              </>
                            }
                            {
                              activeTab.value === 'PROPERTY' && <>
                                {(item as AssetType).serialNumber}
                              </>
                            }
                            {
                              activeTab.value === 'DEVICE' && <>
                                {(item as DeviceInstancePage).code ?? '--'}
                                {
                                  (item as DeviceInstancePage)?.status?.onlineState ?
                                    <Tag size='medium' class={[styles.tag, styles.warning]}>在线</Tag>
                                    :
                                    <Tag size='medium' class={[styles.tag, styles.gray]}>离线</Tag>
                                }
                              </>
                            }
                            {
                              activeTab.value === 'SITE_POINT' && <>
                                { (item as RootObject).codeNum }
                              </>
                            }
                            {
                              activeTab.value === 'RISK_SOURCE' && <>
                                {(item as RiskSourceLedgerVO).serialNumber}
                                {
                                  (item as RiskSourceLedgerVO).status === 'EXPIRE' ?
                                    <Tag size='medium' class={[styles.tag, styles.warning]}>已过期</Tag>
                                    :
                                    <Tag size='medium' class={[styles.tag]}>未过期</Tag>
                                }
                              </>
                            }
                            {
                              activeTab.value === 'SMALL_ENGINEERING' && <>
                                {(item as ProjectScheduleListRecord).projectNum}
                                <Tag class={styles.tag} size='medium' >{ (item as ProjectScheduleListRecord).status }</Tag>
                              </>
                            }
                          </span>
                        </div>
                        <Divider style={{ margin: '10px' }} />
                        <div class={styles.content}>
                          {
                            activeTab.value === 'STALL' && <>
                              <div><span class={styles.label}>档位名称：</span><span>{(item as StallPage).name}</span></div>
                              <div><span class={styles.label}>档位类型：</span><span>{(item as StallPage).typeName}</span></div>
                              <div><span class={styles.label}>档位区域：</span><span>{(item as StallPage).areaNames}</span></div>
                            </>
                          }
                          {
                            activeTab.value === 'PROPERTY' && <>
                              <div><span class={styles.label}>资产名称：</span><span>{(item as AssetType).name}</span></div>
                              <div><span class={styles.label}>资产类型：</span><span>{(item as AssetType).typeName}</span></div>
                              <div><span class={styles.label}>资产区域：</span><span>{(item as AssetType).areaName}</span></div>
                            </>
                          }
                          {
                            activeTab.value === 'DEVICE' && <>
                              <div><span class={styles.label}>设备名称：</span><span>{(item as DeviceInstancePage).name}</span></div>
                              <div><span class={styles.label}>品类：</span><span>{(item as DeviceInstancePage)?.productInfo?.productCategory?.name}</span></div>
                              <div><span class={styles.label}>所属区域：</span><span>{(item as DeviceInstancePage)?.area?.pathName}</span></div>
                            </>
                          }
                          {
                            activeTab.value === 'SITE_POINT' && <>
                              <div><span class={styles.label}>现场点名称：</span><span>{(item as RootObject).name}</span></div>
                              <div><span class={styles.label}>现场点类型：</span><span>{(item as RootObject).typeName}</span></div>
                              <div><span class={styles.label}>现场点区域：</span><span>{(item as RootObject).areaName}</span></div>
                            </>
                          }
                          {
                            activeTab.value === 'RISK_SOURCE' && <>
                              <div><span class={styles.label}>风险源名称：</span><span>{(item as RiskSourceLedgerVO).name}</span></div>
                              <div><span class={styles.label}>风险源分类：</span><span>{(item as RiskSourceLedgerVO).typeName}</span></div>
                            </>
                          }
                          {
                            activeTab.value === 'SMALL_ENGINEERING' && <>
                              <div><span class={styles.label}>工程名称：</span><span>{(item as ProjectScheduleListRecord).projectName}</span></div>
                              <div><span class={styles.label}>乙方：</span><span>{(item as ProjectScheduleListRecord).partyB}</span></div>
                              <div><span class={styles.label}>监管部门：</span><span>{(item as ProjectScheduleListRecord).depName}</span></div>
                              <div><span class={styles.label}>工程类型：</span><span>{(item as ProjectScheduleListRecord).projectTypeName}</span></div>
                            </>
                          }
                        </div>
                      </div>)
                  }
                  {(dataSource.value.length === 0 && search.pageNumber === 1) && <Empty description='暂无数据' />}
                </List>
              </PullRefresh>
            </Tab>)}
        </Tabs>
      </div>
  }
})
