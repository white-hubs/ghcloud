import { defineComponent } from 'vue'
import { cubeDailyInspectionService } from '@/api/server'
import { useRoute, useRouter } from 'vue-router'
import { InspectionTaskList } from '@ghcloud/cube-h5-design'
import type { InspectionSearchType } from '../type'
import { CubeNavBar } from '@ghcloud/cube-app-generic-component'
// 我的巡检/巡检任务
export const MyInspection = defineComponent({
  setup: () => {
    const route = useRoute()
    const router = useRouter()
    const businessType = route.query.businessType as string ?? 'SMALL_ENGINEERING'
    return (): JSX.Element =>
      <div style={{ background: '#f3f7fa', minHeight: '100vh' }}>
        <CubeNavBar title='我的巡检' rightText='巡检记录' onClickRight={() => {
          router.push('inspection-record')
        }} />
        <InspectionTaskList
          options={{
            searchParams: {
              pageNumber: 0,
              total: 1,
              pageSize: 10,
              keyword: '',
              status: (route.query.status as string) ?? '',
              period: ''
            },
            // 列表数据
            getListApi: async (val: unknown) => {
              const query = val as InspectionSearchType
              return cubeDailyInspectionService.MyInspectionPage({ ...query, businessType })
            },
            // 接收
            resolveApi: async (val: unknown) => {
              const query = val as { id: string; }
              return cubeDailyInspectionService.AcceptTask({ id: query.id, businessType })
            },
            // 协同人
            addPartnerApi: async (val: unknown) => {
              const query = val as { id: string; userId: string; }
              return cubeDailyInspectionService.AddPartner({ id: query.id, userId: query.userId, businessType })
            },
            // 移交
            transferApi: async (val: unknown) => {
              const query = val as { id: string; userId: string; }
              return cubeDailyInspectionService.TransferTask({ id: query.id, userId: query.userId, businessType })
            },
          }}
        />
      </div>
  }
})
