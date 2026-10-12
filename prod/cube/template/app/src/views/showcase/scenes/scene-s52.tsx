import { CubeLayout } from '@ghcloud/cube-app-design'
import { Card, Result } from '@ghcloud/cube-ui'
import { usePageName } from '@ghcloud/cube-utils'
import { defineComponent } from 'vue'

/**
 * Batch-4 S52：`CubeLayout` + 两个 `Result`（`success` / `403`）各置于 `Card` 中纵向排列；`Result` 与 `Card` 来自 `@ghcloud/cube-ui`；无路由。
 */
export const ShowcaseSceneS52 = defineComponent({
  name: 'ShowcaseSceneS52',
  setup: () => {
    const { pageTitle } = usePageName()
    const titleFallback = 'Showcase · S52 Result'

    const slots = {
      'layout-content': (): JSX.Element => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
          <Card title='成功'>
            <Result status='success' title='操作成功' subTitle='数据已保存，可继续其他操作。' />
          </Card>
          <Card title='无权限（403）'>
            <Result status='403' title='403' subTitle='抱歉，您没有权限访问此资源。' />
          </Card>
        </div>
      ),
    }

    return (): JSX.Element => (
      <CubeLayout title={pageTitle || titleFallback} v-slots={slots} showFooter={false} />
    )
  },
})
