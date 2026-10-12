import { defineComponent } from 'vue'
import { cubeDailyInspectionService } from '@/api/server'
import { useRoute } from 'vue-router'
import { InspectionTaskDetail } from '@ghcloud/cube-h5-design'
import { CubeNavBar } from '@ghcloud/cube-app-generic-component'
interface ParamsType {
  id: string;
  userId: string;
  businessType: string;
}
/** 日常巡检-巡检任务详情 */
export const InspectionDetail = defineComponent({
  setup: () => {
    const route = useRoute()
    const businessType = route.query.businessType as string ?? 'SMALL_ENGINEERING'
    return (): JSX.Element =>
      <div style={{ background: '#f3f7fa', minHeight: '100vh' }}>
        <CubeNavBar title='巡检任务详情' />
        <InspectionTaskDetail
          options={{
            // 查询参数
            searchParams: {
              id: route.query.id as string,
              userId: route.query.userId as string,
            },
            // 详情数据
            getDetailApi: async (val: unknown) => {
              const query = val as ParamsType
              return cubeDailyInspectionService.TaskDetail({ id: query.id, businessType })
            },
            // 接收
            resolveApi: async (val: unknown) => {
              const query = val as ParamsType
              return cubeDailyInspectionService.AcceptTask({ id: query.id, businessType })
            },
            // 协同人
            addPartnerApi: async (val: unknown) => {
              const query = val as ParamsType
              return cubeDailyInspectionService.AddPartner({ id: query.id, userId: query.userId, businessType })
            },
            // 移交
            transferApi: async (val: unknown) => {
              const query = val as ParamsType
              return cubeDailyInspectionService.TransferTask({ id: query.id, userId: query.userId, businessType })
            },
          }}
          operate={[
            { code: 'record', name: '巡检记录', status: 'finished' },
            { code: 'order', name: '工程整改', status: 'finished', businessType: 'PROJECT_REFORM', businessName: '隐患单' },
            { code: 'inspection', name: '巡检', status: 'executing' },
          ]}
          userId={route.query.userId as string}
          businessType={route.query.businessType as string ?? 'SMALL_ENGINEERING'}
        />
      </div>
  }
})
