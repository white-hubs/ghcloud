import { FlowListTable } from '@/components/flow-table/flow-table'
import { appFunctionCodes } from '@/permission'
import { defineComponent, type VNode } from 'vue'
import { usePageName } from '@ghcloud/cube-utils'
/** 补卡审批 */
export const ApproveSupplement = defineComponent({
  setup: () => {
    const { pageTitle } = usePageName()
    const permission = appFunctionCodes.attendanceSupplementApproval
    return (): VNode=> <FlowListTable title={pageTitle ?? '补卡审批'} flowCode='REPAIR_CLOCK' permission={permission} />
  }
})
