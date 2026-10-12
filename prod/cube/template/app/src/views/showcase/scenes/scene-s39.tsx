import { CubeLayout } from '@ghcloud/cube-app-design'
import { AntModal, Button, Card } from '@ghcloud/cube-ui'
import { usePageName } from '@ghcloud/cube-utils'
import { defineComponent } from 'vue'

/** S39：`CubeLayout` + 按钮触发 `AntModal.confirm`（与 `showcase-modal` 命名一致）。 */
export const ShowcaseSceneS39 = defineComponent({
  name: 'ShowcaseSceneS39',
  setup: () => {
    const { pageTitle } = usePageName()
    const titleFallback = 'Showcase · 场景 S39'

    const slots = {
      'layout-content': (): JSX.Element => (
        <Card title='确认框'>
          <Button
            type='primary'
            onClick={() =>
              AntModal.confirm({
                title: 'AntModal.confirm',
                content: '这是确认框示例',
              })
            }
          >
            AntModal.confirm
          </Button>
        </Card>
      ),
    }

    return (): JSX.Element => (
      <CubeLayout title={pageTitle || titleFallback} v-slots={slots} />
    )
  },
})
