import { CubeLayout } from '@ghcloud/cube-app-design'
import { Card, Skeleton } from '@ghcloud/cube-ui'
import { usePageName } from '@ghcloud/cube-utils'
import { defineComponent } from 'vue'

const contentStack: Record<string, string> = {
  display: 'flex',
  flexDirection: 'column',
  gap: '20px',
  width: '100%',
}

const blockLabel: Record<string, string> = {
  marginBottom: '8px',
  color: 'var(--cube-text-secondary, rgba(0, 0, 0, 0.45))',
  fontSize: '12px',
}

/**
 * Batch-4 S53：`CubeLayout` + `Skeleton` 三种形态（paragraph / avatar / active）；无路由。
 */
export const ShowcaseSceneS53 = defineComponent({
  name: 'ShowcaseSceneS53',
  setup: () => {
    const { pageTitle } = usePageName()

    const slots = {
      'layout-content': (): JSX.Element => (
        <div style={contentStack}>
          <Card title='S53 · Skeleton 形态'>
            <div style={contentStack}>
              <div>
                <div style={blockLabel}>paragraph（仅段落与标题占位）</div>
                <Skeleton paragraph={{ rows: 4 }} title />
              </div>
              <div>
                <div style={blockLabel}>avatar（头像 + 多行段落）</div>
                <Skeleton avatar paragraph={{ rows: 3 }} title />
              </div>
              <div>
                <div style={blockLabel}>active（动画占位：头像 + 段落）</div>
                <Skeleton active avatar paragraph={{ rows: 2 }} title />
              </div>
            </div>
          </Card>
        </div>
      ),
    }

    return (): JSX.Element => (
      <CubeLayout title={pageTitle || 'Showcase · S53 Skeleton'} v-slots={slots} showFooter={false} />
    )
  },
})
