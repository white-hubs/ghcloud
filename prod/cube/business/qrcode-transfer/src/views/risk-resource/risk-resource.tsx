import { Divider, Search, List, Empty, PullRefresh } from 'vant'
import { defineComponent, reactive, ref, type VNode } from 'vue'
import { useRoute } from 'vue-router'
import './risk-resource.less'
import { getRiskSourcePage } from '@/api/safety-management'

interface RiskSourceType {
  propertySubTypeName: string;
  username: string;
  propertyName: string;
  id: string | number | symbol;
  name: string;
  serialNumber: string;
  typeName: string;
  status: string;
  receiveUserName: string;
  receiveDepName: string;
  maintenanceDepName: string;
}

/** 二维码中转页-风险源 */
export const RiskSource = defineComponent({
  setup: () => {
    document.title = '风险源'
    const route = useRoute()
    const searchKey = ref('')
    const riskSourceList = ref<RiskSourceType[]>()
    const loading = ref(false)
    const finished = ref(false)
    const refreshing = ref(false)

    const search = reactive({
      pageNumber: 0,
      total: 1,
      pageSize: 10
    })
    const getData = async (params: Record<string, string | number | boolean> | undefined): Promise<{ records: RiskSourceType[]; total: number; }> => {
      if (route.query?.source && route.query?.source === 'SafetyManageCard') {
        const res = await getRiskSourcePage(params)
        return {
          records: res.records as RiskSourceType[],
          total: res.total
        }
      } else {
        const res = JSON.parse(route.query.riskSourceList as string)
        return {
          records: res as RiskSourceType[],
          total: res.length
        }
      }
    }

    const handleSearch = (): void => {
      if (route.query?.source && route.query?.source === 'SafetyManageCard') {
        riskSourceList.value = []
        search.pageNumber = 0
        finished.value = false
        onLoad()
      } else {
        const allRiskSource = JSON.parse(route.query.riskSourceList as string) as RiskSourceType[]
        if (!searchKey.value) {
          riskSourceList.value = allRiskSource
        } else {
          riskSourceList.value = allRiskSource.filter(x => x.name.includes(searchKey.value))
        }
      }
    }

    const onLoad = async (): Promise<void> => {
      try {
        loading.value = true
        search.pageNumber++
        const params = {
          marketTenant: route.query?.marketTenant as string,
          typeCode: route.query?.typeCode as string,
          status: route.query?.status as string,
          expired: route.query?.expired === 'true',
          keyword: searchKey.value,
          ...search
        }
        const res = await getData(params)
        if (res.total <= search.pageSize) {
          finished.value = true
        }
        if (res.records.length <= search.pageSize) {
          finished.value = true
        }
        if (!riskSourceList.value) {
          riskSourceList.value = []
        }
        if (search.pageNumber === 1) {
          riskSourceList.value = []
        }
        riskSourceList.value = [...riskSourceList.value, ...res.records]
      } catch (error) {
        finished.value = true
      } finally {
        loading.value = false
        refreshing.value = false
      }
    }

    const onRefresh = (): void => {
      search.pageNumber = 0
      finished.value = false
      onLoad()
    }
    // 跳转详情
    const handleDetails = (id: string | number | symbol): void => {
      window.location.href = `/apps/risk-management/h5/#/risk-detail?id=${id as string}`
    }
    return (): VNode=>
      <div style={{ height: '100vh', background: '#f3f7fa', overflow: 'hidden' }}>
        <Search shape='round' v-model={searchKey.value} placeholder='根据风险源名称进行搜索' onSearch={handleSearch} onClear={handleSearch} />
        <div style={{ height: 'calc(100vh - 54px)', overflowY: 'scroll' }}>
          <PullRefresh v-model={refreshing.value} onRefresh={onRefresh}>
            <List
              v-model:loading={loading.value}
              finished={finished.value}
              finished-text='没有更多了'
              onLoad={onLoad}
            >
              {
                (riskSourceList.value && riskSourceList.value?.length > 0) &&
                riskSourceList.value?.map((item: RiskSourceType) =>
                  <div class='card-list' key={item.id}>
                    <div class='status-level'>
                      <div class='title'>{item.name ?? item.propertyName}</div>
                      <div class={['status', item.status === 'EXPIRE' ? 'EXPIRE' : 'UNEXPIRE']}>{item.status === 'EXPIRE' ? '已过期' : '未过期'}</div>
                    </div>
                    <Divider />
                    <div class='content' onClick={() => {
                      handleDetails(item.id)
                    }}>
                      <div class='card-item'><span>风险源编码:</span><span>{item.serialNumber}</span></div>
                      <div class='card-item'><span>风险源分类:</span><span>{item.typeName ?? item.propertySubTypeName}</span></div>
                      <div class='card-item'><span>使用人:</span><span>{item.receiveUserName ?? item.username}</span></div>
                      <div class='card-item'><span>使用部门:</span><span>{item.receiveDepName}</span></div>
                      <div class='card-item'><span>维护部门:</span><span>{item.maintenanceDepName}</span></div>
                    </div>
                  </div>)
              }
              {(riskSourceList.value?.length === 0 && !finished.value) && <Empty description='暂无数据' />}
            </List>
          </PullRefresh>
        </div>
      </div>
  }
})
