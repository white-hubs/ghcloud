import { CubeLayout } from '@ghcloud/cube-app-design'
import { Card, TypographyText } from '@ghcloud/cube-ui'
import { usePageName } from '@ghcloud/cube-utils'
import { defineComponent } from 'vue'

const contentStack: Record<string, string> = {
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
  width: '100%',
}

/**
 * Batch-3 S37：`CubeLayout` + `TypographyText`（`@ghcloud/cube-ui` 仅再导出该 Typography 子组件），演示强调标题、正文与次要摘要；无路由。
 */
export const ShowcaseSceneS37 = defineComponent({
  name: 'ShowcaseSceneS37',
  setup: () => {
    const { pageTitle } = usePageName()

    const slots = {
      'layout-content': (): JSX.Element => (
        <Card title='S37 · 文字层级'>
          <div style={contentStack}>
            <TypographyText strong style={{ display: 'block' }}>
              场景说明
            </TypographyText>
            <TypographyText style={{ display: 'block' }}>
              本场景在 CubeLayout 内容区使用 TypographyText 展示层级化说明：上一行相当于标题语义（strong），本段为正文，适合多行阅读。
            </TypographyText>
            <TypographyText type='secondary' style={{ display: 'block' }}>
              摘要：纯静态排版，无路由与远程请求；若需与 ant-design-vue 一致的 Title / Paragraph，可在 cube-ui 中补充再导出。
            </TypographyText>
          </div>
        </Card>
      ),
    }

    return (): JSX.Element => (
      <CubeLayout title={pageTitle || 'Showcase · S37 Typography'} v-slots={slots} showFooter={false} />
    )
  },
})
