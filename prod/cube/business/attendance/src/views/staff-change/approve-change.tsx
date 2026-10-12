import { FlowListTable } from '@/components/flow-table/flow-table'
import { appFunctionCodes } from '@/permission'
import { defineComponent, type VNode } from 'vue'
import { usePageName } from '@ghcloud/cube-utils'
/** 换班审批 */
export const ApproveChange = defineComponent({
  setup: () => {
    const { pageTitle } = usePageName()
    const permission = appFunctionCodes.attendanceChangeApproval

    return (): VNode=> <FlowListTable title={pageTitle ?? '换班审批'} flowCode='CHANGE_CLASSES' permission={permission} />
  }
})
