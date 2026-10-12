import { FlowListTable } from '@/components/flow-table/flow-table'
import { appFunctionCodes } from '@/permission'
import { defineComponent, type VNode } from 'vue'
import { usePageName } from '@ghcloud/cube-utils'
/** 销假审批 */
export const ApproveDisposeLeave = defineComponent({
  setup: () => {
    const { pageTitle } = usePageName()
    const permission = appFunctionCodes.attendanceDisposeLeaveApproval

    return (): VNode=> <FlowListTable title={pageTitle ?? '销假审批'} flowCode='CANCEL_LEAVE' permission={permission} />
  }
})
