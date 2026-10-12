import { CubeLayout } from '@ghcloud/cube-app-design'
import { Card, TimeLine, TimeLineItem } from '@ghcloud/cube-ui'
import { usePageName } from '@ghcloud/cube-utils'
import { defineComponent } from 'vue'

/**
 * Batch-4 S60：`CubeLayout` + `@ghcloud/cube-ui` 的 `TimeLine` / `TimeLineItem`（非 `Timeline`）静态条目；无路由。
 */
export const ShowcaseSceneS60 = defineComponent({
  name: 'ShowcaseSceneS60',
  setup: () => {
    const { pageTitle } = usePageName()
    const titleFallback = 'Showcase · S60 TimeLine'

    const slots = {
      'layout-content': (): JSX.Element => (
        <Card title='TimeLine 静态演示'>
          <TimeLine>
            <TimeLineItem>需求评审完成</TimeLineItem>
            <TimeLineItem color='blue'>开发进行中</TimeLineItem>
            <TimeLineItem color='gray'>联调与验收待办</TimeLineItem>
          </TimeLine>
        </Card>
      ),
    }

    return (): JSX.Element => (
      <CubeLayout title={pageTitle || titleFallback} v-slots={slots} showFooter={false} />
    )
  },
})
