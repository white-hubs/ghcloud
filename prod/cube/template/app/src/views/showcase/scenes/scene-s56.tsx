import { CubeLayout } from '@ghcloud/cube-app-design'
import { Button, Card, Tooltip } from '@ghcloud/cube-ui'
import { usePageName } from '@ghcloud/cube-utils'
import { defineComponent } from 'vue'

/**
 * Batch-4 S56：`CubeLayout` + `Tooltip` 包裹 `Button` / `span`，演示不同 `title` 与 `placement`；无路由。
 */
export const ShowcaseSceneS56 = defineComponent({
  name: 'ShowcaseSceneS56',
  setup: () => {
    const { pageTitle } = usePageName()
    const titleFallback = 'Showcase · S56 Tooltip'

    const rowStyle = { display: 'flex', flexWrap: 'wrap' as const, gap: '12px', alignItems: 'center' as const, width: '100%' }

    const slots = {
      'layout-content': (): JSX.Element => (
        <Card title='Tooltip：多文案与方位'>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
            <div style={rowStyle}>
              <Tooltip title='主操作说明（顶部）' placement='top'>
                <Button type='primary'>placement top</Button>
              </Tooltip>
              <Tooltip title='次要提示在下方展开' placement='bottom'>
                <Button>placement bottom</Button>
              </Tooltip>
              <Tooltip title='左侧气泡：适合窄内容区' placement='left'>
                <Button>placement left</Button>
              </Tooltip>
              <Tooltip title='右侧对齐常用在表格操作列' placement='right'>
                <Button>placement right</Button>
              </Tooltip>
            </div>
            <div style={rowStyle}>
              <Tooltip title='左上角：靠近触发器一侧' placement='topLeft'>
                <span style={{ cursor: 'default', textDecoration: 'underline dotted' }}>纯文本 span · topLeft</span>
              </Tooltip>
              <Tooltip title='右下角：与对角线相对' placement='bottomRight'>
                <span style={{ cursor: 'help', color: 'var(--cube-color-text-secondary, #666)' }}>帮助样式 span · bottomRight</span>
              </Tooltip>
            </div>
          </div>
        </Card>
      ),
    }

    return (): JSX.Element => (
      <CubeLayout title={pageTitle || titleFallback} v-slots={slots} showFooter={false} />
    )
  },
})
