import { defineComponent } from 'vue'
import { CubeLayout, FlowTable } from '@ghcloud/cube-app-design'
import { usePageName } from '@ghcloud/cube-utils'

/** 会议室审批记录 */
export const MeetRoomApprove = defineComponent({
  setup: () => {
    const { pageTitle } = usePageName()

    const slots = {
      'layout-content': (): JSX.Element => {
        return (
          <div>
            <FlowTable title={pageTitle} flowCode={'MEETING_ROOM_RESERVATION'} />
          </div>
        )
      },
    }
    return (): JSX.Element => (
      <CubeLayout title={pageTitle} v-slots={slots} />
    )
  }
})
