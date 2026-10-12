import { CubeLayout } from '@ghcloud/cube-app-design'
import { Card, Divider } from '@ghcloud/cube-ui'
import { usePageName } from '@ghcloud/cube-utils'
import { defineComponent } from 'vue'

const sectionGap: Record<string, string> = {
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
}

const verticalRow: Record<string, string> = {
  display: 'flex',
  alignItems: 'center',
  minHeight: '48px',
}

/**
 * Batch-4 S54：`CubeLayout` + `Divider`：水平线、竖向分隔、带文案时的 `orientation`（left / center / right）；无路由。
 */
export const ShowcaseSceneS54 = defineComponent({
  name: 'ShowcaseSceneS54',
  setup: () => {
    const { pageTitle } = usePageName()
    const slots = {
      'layout-content': (): JSX.Element => (
        <Card title='Divider'>
          <div style={sectionGap}>
            <div>
              <p style={{ margin: 0 }}>水平分割线（默认）</p>
              <Divider />
              <p style={{ margin: 0 }}>水平线将上下区块分开。</p>
            </div>

            <div>
              <p style={{ margin: 0 }}>竖向分割线（type 为 vertical，父级为横向 flex）</p>
              <div style={verticalRow}>
                <span>左侧内容</span>
                <Divider type='vertical' />
                <span>中间</span>
                <Divider type='vertical' />
                <span>右侧内容</span>
              </div>
            </div>

            <div>
              <p style={{ margin: 0 }}>带文案的水平分割线：`orientation` 控制文案相对两侧线的位置</p>
              <Divider orientation='left'>靠左文案</Divider>
              <Divider orientation='center'>居中文案</Divider>
              <Divider orientation='right'>靠右文案</Divider>
            </div>
          </div>
        </Card>
      ),
    }
    return (): JSX.Element => (
      <CubeLayout title={pageTitle || 'Showcase · S54 Divider'} v-slots={slots} showFooter={false} />
    )
  },
})
