import { CubeLayout } from '@ghcloud/cube-app-design'
import { Button, Card, PopConfirm, message } from '@ghcloud/cube-ui'
import { usePageName } from '@ghcloud/cube-utils'
import { defineComponent } from 'vue'

/**
 * Batch-3 S42：`CubeLayout` + 独立 `PopConfirm` 包裹 `Button`（非表格内）；`onConfirm` 调用 `message`；无路由。
 */
export const ShowcaseSceneS42 = defineComponent({
  name: 'ShowcaseSceneS42',
  setup: () => {
    const { pageTitle } = usePageName()

    const slots = {
      'layout-content': (): JSX.Element => (
        <Card title='PopConfirm（独立按钮）'>
          <PopConfirm
            title='确认执行该操作？'
            onConfirm={() => {
              message.success('已确认')
            }}
          >
            <Button type='primary' danger>
              带确认的按钮
            </Button>
          </PopConfirm>
        </Card>
      ),
    }

    return (): JSX.Element => (
      <CubeLayout title={pageTitle || 'Showcase · S42'} v-slots={slots} showFooter={false} />
    )
  },
})
