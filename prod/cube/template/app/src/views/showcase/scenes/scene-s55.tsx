import { CubeLayout } from '@ghcloud/cube-app-design'
import { Alert, Card } from '@ghcloud/cube-ui'
import { usePageName } from '@ghcloud/cube-utils'
import { defineComponent } from 'vue'

/**
 * Batch-4 S55：`CubeLayout` + 四种 `Alert`（success / info / warning / error），均 `showIcon`；无路由。
 */
export const ShowcaseSceneS55 = defineComponent({
  name: 'ShowcaseSceneS55',
  setup: () => {
    const { pageTitle } = usePageName()
    const titleFallback = 'Showcase · S55 Alert'

    const slots = {
      'layout-content': (): JSX.Element => (
        <Card title='Alert 类型与图标'>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>
            <Alert type='success' showIcon message='成功' description='操作已完成，可继续后续流程。' />
            <Alert type='info' showIcon message='提示' description='此为一般说明信息，供阅读参考。' />
            <Alert type='warning' showIcon message='注意' description='请确认配置后再提交，避免误操作。' />
            <Alert type='error' showIcon message='错误' description='请求失败或校验未通过，请检查后重试。' />
          </div>
        </Card>
      ),
    }

    return (): JSX.Element => (
      <CubeLayout title={pageTitle || titleFallback} v-slots={slots} showFooter={false} />
    )
  },
})
