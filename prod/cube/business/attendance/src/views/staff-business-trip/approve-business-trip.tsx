import { FlowListTable } from '@/components/flow-table/flow-table'
import { appFunctionCodes } from '@/permission'
import { defineComponent, type VNode } from 'vue'
import { usePageName } from '@ghcloud/cube-utils'
/** 出差审批 */
export const ApproveBusinessTrip = defineComponent({
  setup: () => {
    const { pageTitle } = usePageName()
    const permission = appFunctionCodes.attendanceBusinessTripApproval

    return (): VNode=> <FlowListTable title={pageTitle ?? '出差审批'} flowCode='AWAY_BUSINESS' permission={permission} />
  }
})
