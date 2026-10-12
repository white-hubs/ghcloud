import { CubeLayout } from '@ghcloud/cube-app-design'
import { Button, Card, PopOver, Space, message } from '@ghcloud/cube-ui'
import { usePageName } from '@ghcloud/cube-utils'
import { defineComponent } from 'vue'

/**
 * Batch-4 S57：`CubeLayout` + `PopOver`（Ant Design Vue Popover 封装），`trigger` 为点击；
 * 内容插槽为说明文案与示例按钮；`usePageName`；无路由。
 */
export const ShowcaseSceneS57 = defineComponent({
  name: 'ShowcaseSceneS57',
  setup: () => {
    const { pageTitle } = usePageName()

    const slots = {
      'layout-content': (): JSX.Element => (
        <Card title='Popover（点击触发）'>
          <p style={{ marginBottom: 12 }}>以下 PopOver 仅在点击触发按钮时展开，内容区为自定义插槽（文案与操作按钮）。</p>
          <PopOver
            trigger={['click']}
            title='弹层标题'
            v-slots={{
              content: (): JSX.Element => (
                <Space direction='vertical' size='small' style={{ maxWidth: 280 }}>
                  <span>这是内容插槽中的说明文字，下方为示例操作。</span>
                  <Space>
                    <Button
                      type='primary'
                      size='small'
                      onClick={() => {
                        message.success('已执行主操作')
                      }}
                    >
                      主操作
                    </Button>
                    <Button
                      size='small'
                      onClick={() => {
                        message.info('已点击次要按钮')
                      }}
                    >
                      次要
                    </Button>
                  </Space>
                </Space>
              ),
            }}
          >
            <Button type='primary'>点击打开 Popover</Button>
          </PopOver>
        </Card>
      ),
    }

    return (): JSX.Element => (
      <CubeLayout title={pageTitle || 'Showcase · S57 Popover'} v-slots={slots} showFooter={false} />
    )
  },
})
