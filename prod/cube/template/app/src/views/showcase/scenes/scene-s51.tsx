import { CubeLayout } from '@ghcloud/cube-app-design'
import { Card, CardMeta } from '@ghcloud/cube-ui'
import { usePageName } from '@ghcloud/cube-utils'
import { defineComponent } from 'vue'

const COVER_HEIGHT_PX = 140
const CARD_MAX_WIDTH_PX = 360
const FLEX_GAP_PX = 16

const coverBlue = {
  height: `${COVER_HEIGHT_PX}px`,
  width: '100%',
  background: 'linear-gradient(135deg, #1677ff 0%, #722ed1 100%)',
}

const coverGreen = {
  height: `${COVER_HEIGHT_PX}px`,
  width: '100%',
  background: 'linear-gradient(135deg, #389e0d 0%, #0958d9 100%)',
}

/**
 * Batch-4 S51：`CubeLayout` + `Card` 封面（`cover`）与 `CardMeta` 标题/描述，演示图文卡片；无路由。
 */
export const ShowcaseSceneS51 = defineComponent({
  name: 'ShowcaseSceneS51',
  setup: () => {
    const { pageTitle } = usePageName()
    const titleFallback = 'Showcase · S51 Card 图文'

    const slots = {
      'layout-content': (): JSX.Element => (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: `${FLEX_GAP_PX}px`, width: '100%' }}>
          <Card
            style={{ maxWidth: `${CARD_MAX_WIDTH_PX}px`, flex: '1 1 280px' }}
            cover={<div style={coverBlue} />}
          >
            <CardMeta title='项目概览' description='封面区 + CardMeta 适合仪表盘摘要、应用卡片与内容列表项。' />
          </Card>
          <Card
            style={{ maxWidth: `${CARD_MAX_WIDTH_PX}px`, flex: '1 1 280px' }}
            cover={<div style={coverGreen} />}
          >
            <CardMeta title='文档与模板' description='同一模式可替换为 Image、图表缩略图等作为 cover 内容。' />
          </Card>
        </div>
      ),
    }

    return (): JSX.Element => (
      <CubeLayout title={pageTitle || titleFallback} v-slots={slots} showFooter={false} />
    )
  },
})
