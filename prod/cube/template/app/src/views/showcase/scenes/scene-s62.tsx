import { CubeLayout } from '@ghcloud/cube-app-design'
import { Card, Col, Row } from '@ghcloud/cube-ui'
import { usePageName } from '@ghcloud/cube-utils'
import { defineComponent } from 'vue'

const stack: Record<string, string> = {
  display: 'flex',
  flexDirection: 'column',
  gap: '24px',
  width: '100%',
}

const hint: Record<string, string> = {
  color: 'rgba(0, 0, 0, 0.45)',
  fontSize: '13px',
  lineHeight: '1.5',
}

function coloredBox(backgroundColor: string, minHeight: string): Record<string, string> {
  return {
    minHeight,
    borderRadius: '6px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
    fontWeight: '600',
    backgroundColor,
  }
}

/**
 * Batch-4 S62：`CubeLayout` + `Row` / `Col` 栅格与 `gutter`（水平与二维），彩色块演示列宽与沟槽；无路由。
 */
export const ShowcaseSceneS62 = defineComponent({
  name: 'ShowcaseSceneS62',
  setup: () => {
    const { pageTitle } = usePageName()
    const titleFallback = 'Showcase · S62 Row / Col'

    const slots = {
      'layout-content': (): JSX.Element => (
        <Card title='栅格 Row · Col · gutter'>
          <div style={stack}>
            <p style={hint}>水平 gutter=24：三列均分（span 8），列间留出沟槽。</p>
            <Row gutter={24}>
              <Col span={8}>
                <div style={coloredBox('#1890ff', '72px')}>A</div>
              </Col>
              <Col span={8}>
                <div style={coloredBox('#52c41a', '72px')}>B</div>
              </Col>
              <Col span={8}>
                <div style={coloredBox('#faad14', '72px')}>C</div>
              </Col>
            </Row>
            <p style={hint}>二维 gutter=[16, 16]：多行时行间也有垂直间距；上行 12+12，下行四个 span 6。</p>
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <div style={coloredBox('#722ed1', '72px')}>1 · span 12</div>
              </Col>
              <Col span={12}>
                <div style={coloredBox('#eb2f96', '72px')}>2 · span 12</div>
              </Col>
              <Col span={6}>
                <div style={coloredBox('#13c2c2', '56px')}>3</div>
              </Col>
              <Col span={6}>
                <div style={coloredBox('#2f54eb', '56px')}>4</div>
              </Col>
              <Col span={6}>
                <div style={coloredBox('#fa8c16', '56px')}>5</div>
              </Col>
              <Col span={6}>
                <div style={coloredBox('#a0d911', '56px')}>6</div>
              </Col>
            </Row>
          </div>
        </Card>
      ),
    }

    return (): JSX.Element => (
      <CubeLayout title={pageTitle || titleFallback} v-slots={slots} showFooter={false} />
    )
  },
})
