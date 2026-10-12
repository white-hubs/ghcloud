import { FlowListTable } from '@/components/flow-table/flow-table'
import { appFunctionCodes } from '@/permission'
import { defineComponent, type VNode } from 'vue'
import { usePageName } from '@ghcloud/cube-utils'
/** 离岗审批 */
export const ApproveOffDuty = defineComponent({
  setup: () => {
    const { pageTitle } = usePageName()
    const permission = appFunctionCodes.attendanceOffDutyApproval

    return (): VNode => <FlowListTable title={pageTitle ?? '离岗审批'} flowCode='LEAVE_THE_POST' permission={permission} />
  }
})
