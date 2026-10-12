import { defineComponent, onBeforeMount, onMounted, reactive, ref, watch } from 'vue'
import { Tabs, Tab, PullRefresh, List, Empty, showNotify } from 'vant'
import { SearchBar } from './components/search-bar/search-bar'
import { cubePropertyService } from '@/api/server'
import './list.less'
import { RiskItem } from './components/risk-item/risk-item'
import { useRoute, useRouter } from 'vue-router'
import type { RiskSourceLedgerVO } from '@ghcloud/cube-risk-management-service'
const addIcon = '/resource/v1/risk-management/images/add-icon.png'
import { CubeNavBar } from '@ghcloud/cube-app-generic-component'

export const RiskList = defineComponent({
  name: 'AlarmRecords',
  setup () {
    document.title = '风险源列表'
    const tabActive = ref(0)
    const route = useRoute()
    const router = useRouter()
    const tabOptions = ref([
      {
        label: '全部',
        value: '',
      },
      {
        label: '未过期',
        value: 'NORMAL',
      },
      {
        label: '已过期',
        value: 'EXPIRE',
      }
    ])
    const searchRef = ref<{ getFormState: () => Record<string, string>; }>()
    const dataSource = ref<RiskSourceLedgerVO[]>([])
    const loading = ref(false)
    const finished = ref(false)
    const refreshing = ref(false)
    const search = reactive({
      pageNumber: 0,
      total: 1,
      pageSize: 20,
      typeCode: ''
    })

    const getDataSource = async (): Promise<{ total: number; records: RiskSourceLedgerVO[]; }> => {
      try {
        const params = {
          pageNumber: search.pageNumber,
          pageSize: search.pageSize,
          status: tabOptions.value[tabActive.value].value,
          keyword: searchRef.value?.getFormState().keyword || '',
          receiveUserType: searchRef.value?.getFormState().receiveUserType || '',
          purchasingDate: searchRef.value?.getFormState().purchasingDate || '',
          usageDate: searchRef.value?.getFormState().usageDate || '',
          maintenanceDepId: searchRef.value?.getFormState().maintenanceDepId ?? '', // 维护部门
          receiveDepId: searchRef.value?.getFormState().receiveDepId ?? '', // 使用部门
          typeCode: search.typeCode
        }
        const { total, records } = await cubePropertyService.riskSourceLedgerPage(params) as { total: number; records: RiskSourceLedgerVO[]; }
        return { total, records }
      } catch (error) {
        const { errorMessage } = (error as { toJSON: () => { errorMessage: string; }; }).toJSON()
        showNotify({ type: 'danger', message: errorMessage || '请求失败' })
        return { total: 0, records: [] }
      }
    }

    const onLoad = async (): Promise<void> => {
      try {
        loading.value = true
        search.pageNumber++
        const res = await getDataSource()
        if (res.total <= search.pageSize) {
          finished.value = true
        }
        if (res.records.length < search.pageSize) {
          finished.value = true
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

    const onRefresh = async (): Promise<void> => {
      search.pageNumber = 0
      finished.value = false
      await onLoad()
    }
    const handleChangeRecord = ({ index, record }: { index: number; record: RiskSourceLedgerVO; }): void => {
      dataSource.value[index] = record
    }
    const getData = async (): Promise<void> => {
      dataSource.value.length = 0
      onRefresh()
    }
    onMounted(() => {
      getData()
    })
    onBeforeMount(() => {
      const status = route.query.status as string
      const typeCode = route.query.typeCode as string
      if (status) {
        const tabIndex = tabOptions.value.findIndex(item => item.value === status)
        tabActive.value = tabIndex !== -1 ? tabIndex : 0
      }
      if (typeCode) {
        search.typeCode = typeCode
      }
    })
    const handleConfirmFilter = (): void => {
      search.typeCode = searchRef.value?.getFormState().typeCode || ''
      getDataSource()
      getData()
    }
    watch(() => tabActive.value, () => {
      getData()
    })
    const handleAlarmInfo = (): void => {
      sessionStorage.setItem('searchParams', JSON.stringify({ ...searchRef.value?.getFormState(), alarmStatus: tabOptions.value[tabActive.value].value }))
    }
    const addRisk = (): void => {
      router.push({
        name: 'risk-add',
      })
    }
    return (): JSX.Element =>
      <>
        <CubeNavBar title='风险源列表' showBack />
        <SearchBar ref={searchRef} onConfirm={handleConfirmFilter} />
        <Tabs v-model:active={tabActive.value} sticky>
          {
            tabOptions.value.map(item =>
              <Tab
                value={item.value}
                key={item.value}
                v-slots={{
                  title: () =>
                    <>
                      {item.label}
                    </>
                }}
              />
            )
          }
        </Tabs>
        <PullRefresh v-model={refreshing.value} onRefresh={onRefresh} class='alarm-list-pull-refresh'>
          <List
            v-model:loading={loading.value}
            finished={finished.value}
            finished-text={dataSource.value.length === 0 ? '' : '暂无更多数据'}
            onLoad={onLoad}
          >
            {
              (dataSource.value && dataSource.value.length > 0) &&
                dataSource.value.map((item: RiskSourceLedgerVO, index: number) =>
                  <RiskItem onHandleInfo={handleAlarmInfo} key={index} record={item} onChangeRecord={handleChangeRecord} />
                )
            }
            {(dataSource.value.length === 0 && search.pageNumber === 1 && !loading.value) && <Empty description='暂无数据' />}
          </List>
        </PullRefresh>
        <div class='add-icon' onClick={addRisk}>
          <img src={addIcon} alt='' />
        </div>
      </>
  }
})
