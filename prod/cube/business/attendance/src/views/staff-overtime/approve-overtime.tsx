import { FlowListTable } from '@/components/flow-table/flow-table'
import { appFunctionCodes } from '@/permission'
import { defineComponent, type VNode } from 'vue'
import { usePageName } from '@ghcloud/cube-utils'
/** 加班审批 */
export const ApproveOvertime = defineComponent({
  setup: () => {
    const { pageTitle } = usePageName()
    const permission = appFunctionCodes.attendanceOvertimeApproval

    return (): VNode=> <FlowListTable title={pageTitle ?? '加班审批'} flowCode='OVERTIME' permission={permission} />
  }
})
