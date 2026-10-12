import { FlowListTable } from '@/components/flow-table/flow-table'
import { appFunctionCodes } from '@/permission'
import { defineComponent, type VNode } from 'vue'
import { usePageName } from '@ghcloud/cube-utils'
/** 请假审批 */
export const ApproveLeave = defineComponent({
  setup: () => {
    const { pageTitle } = usePageName()
    const permission = appFunctionCodes.attendanceLeaveApproval

    return (): VNode => <FlowListTable title={pageTitle ?? '请假审批'} flowCode='LEAVE' permission={permission} />
  }
})
