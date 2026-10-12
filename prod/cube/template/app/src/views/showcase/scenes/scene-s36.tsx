import { CubeLayout } from '@ghcloud/cube-app-design'
import { Card, Progress } from '@ghcloud/cube-ui'
import { usePageName } from '@ghcloud/cube-utils'
import { defineComponent } from 'vue'

const contentStack: Record<string, string> = {
  display: 'flex',
  flexDirection: 'column',
  gap: '20px',
  width: '100%',
}

/**
 * Batch-3 S36：`CubeLayout` + 多条 `Progress`，演示不同 `percent` 与 `status`（success / active / exception）。
 */
export const ShowcaseSceneS36 = defineComponent({
  name: 'ShowcaseSceneS36',
  setup: () => {
    const { pageTitle } = usePageName()

    const slots = {
      'layout-content': (): JSX.Element => (
        <Card title='S36 · 进度条状态'>
          <div style={contentStack}>
            <div>
              <div style={{ marginBottom: 8 }}>success · 100%</div>
              <Progress percent={100} status='success' />
            </div>
            <div>
              <div style={{ marginBottom: 8 }}>success · 72%</div>
              <Progress percent={72} status='success' />
            </div>
            <div>
              <div style={{ marginBottom: 8 }}>active · 45%</div>
              <Progress percent={45} status='active' />
            </div>
            <div>
              <div style={{ marginBottom: 8 }}>active · 18%</div>
              <Progress percent={18} status='active' />
            </div>
            <div>
              <div style={{ marginBottom: 8 }}>exception · 88%</div>
              <Progress percent={88} status='exception' />
            </div>
            <div>
              <div style={{ marginBottom: 8 }}>exception · 33%</div>
              <Progress percent={33} status='exception' />
            </div>
          </div>
        </Card>
      ),
    }

    return (): JSX.Element => (
      <CubeLayout title={pageTitle || 'Showcase · S36 Progress'} v-slots={slots} showFooter={false} />
    )
  },
})
