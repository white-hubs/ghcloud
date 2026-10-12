import { FlowListTable } from '@/components/flow-table/flow-table'
import { defineComponent } from 'vue'
import { usePageName } from '@ghcloud/cube-utils'
import { BusinessType } from './type'

/** 访客邀请 */
export const visitorInvite = defineComponent({
  setup: () => {
    const { pageTitle } = usePageName()
    return (): JSX.Element => <FlowListTable title={pageTitle ?? '访客邀请'} flowCode={BusinessType.VISITOR_INVITE} />
  }
})
