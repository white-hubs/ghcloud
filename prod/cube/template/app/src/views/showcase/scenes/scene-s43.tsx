import { CubeLayout } from '@ghcloud/cube-app-design'
import { Button, Card, message } from '@ghcloud/cube-ui'
import { usePageName } from '@ghcloud/cube-utils'
import { defineComponent } from 'vue'

/**
 * Batch-3 S43：`CubeLayout` + 三个按钮分别触发 `message.success`、`message.error`、`message.loading`；
 * loading 使用 `duration: 0` 后由返回的关闭函数在定时结束后收起（亦可用正数 duration 自动关闭）。
 */
export const ShowcaseSceneS43 = defineComponent({
  name: 'ShowcaseSceneS43',
  setup: () => {
    const { pageTitle } = usePageName()
    const titleFallback = 'Showcase · S43 Message'

    const slots = {
      'layout-content': (): JSX.Element => (
        <Card title='全局提示 message'>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', width: '100%' }}>
            <Button type='primary' onClick={() => message.success('操作成功')}>message.success</Button>
            <Button danger onClick={() => message.error('操作失败')}>message.error</Button>
            <Button
              onClick={() => {
                const close = message.loading('加载中…', 0)
                globalThis.setTimeout(() => {
                  close()
                }, 2000)
              }}
            >
              message.loading（手动关闭）
            </Button>
          </div>
        </Card>
      ),
    }

    return (): JSX.Element => (
      <CubeLayout title={pageTitle || titleFallback} v-slots={slots} showFooter={false} />
    )
  },
})
