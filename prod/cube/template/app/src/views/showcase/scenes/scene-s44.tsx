import { CubeLayout } from '@ghcloud/cube-app-design'
import { Button, Card, Space, notification } from '@ghcloud/cube-ui'
import { usePageName } from '@ghcloud/cube-utils'
import { defineComponent } from 'vue'

const CONTENT_GAP = 12

const sectionStyle: Record<string, string> = {
  display: 'flex',
  flexDirection: 'column',
  gap: `${CONTENT_GAP}px`,
  width: '100%',
}

/**
 * Batch-3 S44：`CubeLayout` + 按钮触发 `notification.info` / `success` / `warning` / `error`（`@ghcloud/cube-ui`）；无路由。
 */
export const ShowcaseSceneS44 = defineComponent({
  name: 'ShowcaseSceneS44',
  setup: () => {
    const { pageTitle } = usePageName()
    const titleFallback = 'Showcase · S44 Notification'

    const slots = {
      'layout-content': (): JSX.Element => (
        <Card title='通知（notification）'>
          <div style={sectionStyle}>
            <Space wrap size='middle'>
              <Button
                onClick={() =>
                  notification.info({
                    message: '信息通知',
                    description: 'notification.info 示例：一般提示与说明文案。',
                  })
                }
              >
                notification.info
              </Button>
              <Button
                type='primary'
                onClick={() =>
                  notification.success({
                    message: '成功通知',
                    description: 'notification.success 示例：操作已完成。',
                  })
                }
              >
                notification.success
              </Button>
              <Button
                onClick={() =>
                  notification.warning({
                    message: '警告通知',
                    description: 'notification.warning 示例：请关注潜在风险。',
                  })
                }
              >
                notification.warning
              </Button>
              <Button
                danger
                onClick={() =>
                  notification.error({
                    message: '错误通知',
                    description: 'notification.error 示例：请求失败或校验未通过。',
                  })
                }
              >
                notification.error
              </Button>
            </Space>
          </div>
        </Card>
      ),
    }

    return (): JSX.Element => (
      <CubeLayout title={pageTitle || titleFallback} v-slots={slots} showFooter={false} />
    )
  },
})
