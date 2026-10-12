import { defineComponent } from 'vue'
import { InspectionExecute as Dom } from '@ghcloud/cube-h5-design'
import { useRoute } from 'vue-router'
import { cubeDailyInspectionService } from '@/api/server'
import type { StandardItemType } from '@ghcloud/cube-daily-inspection-service'
import { CubeNavBar } from '@ghcloud/cube-app-generic-component'
interface SearchParams {
  isTemporary: boolean;
  targetId: string;
  targetCategory: string;
  taskId: string;
}
/** 日常巡检-巡检任务详情 */
export const InspectionExecute = defineComponent({
  setup: () => {
    const route = useRoute()
    const isTemporary = route.query?.isTemporary === 'true'
    const targetId = (route.query?.targetId as string) ?? ''
    const targetCategory = (route.query?.targetCategory as string) ?? ''
    const taskId = (route.query?.taskId as string) ?? ''
    const businessType = route.query.businessType as string ?? 'SMALL_ENGINEERING'
    return (): JSX.Element =>
      <div>
        <CubeNavBar title='执行巡检' />
        <Dom
          options={{
            // 查询参数
            searchParams: {
              isTemporary,
              targetId,
              targetCategory,
              taskId,
            },
            // 获取对象信息
            getDetailApi: async (val: Record<string, unknown> | undefined) => {
              const data = val as unknown as SearchParams
              return isTemporary
                ? cubeDailyInspectionService.InspectTemporaryExecuteDetail(data.targetId, data.targetCategory, businessType)
                : cubeDailyInspectionService.InspectExecuteDetail({ id: data.taskId, objId: data.targetId, businessType })
            },
            // 提交临时巡检结果
            tempSubmitApi: async (val: unknown) => {
              const data = val as { commandList: { targetCategory: string; targetId: string; areaId: string; areaName: string; targetName: string; recordId: string; commandModels: StandardItemType[]; }[]; }
              return cubeDailyInspectionService.taskTempSubmitList({ ...data, businessType })
            },
            // 提交巡检结果
            submitApi: async (val: unknown) => {
              const data = val as { commandList: { targetCategory: string; targetId: string; areaId: string; areaName: string; targetName: string; recordId: string; commandModels: StandardItemType[]; }[]; }
              return cubeDailyInspectionService.taskSubmitList({ ...data, businessType })
            }
          }}
          businessType={businessType}
        />
      </div>
  }
})
