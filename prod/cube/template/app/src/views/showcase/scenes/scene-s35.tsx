import { CubeLayout } from '@ghcloud/cube-app-design'
import { Avatar, Badge, Button, Card, Space } from '@ghcloud/cube-ui'
import { usePageName } from '@ghcloud/cube-utils'
import { defineComponent } from 'vue'

const ROW_GAP = 16
const INLINE_GAP = 12

const flexRow: Record<string, string> = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: `${INLINE_GAP}px`,
  alignItems: 'center',
}

const sectionStack: Record<string, string> = {
  display: 'flex',
  flexDirection: 'column',
  gap: `${ROW_GAP}px`,
  width: '100%',
}

const BADGE_COUNT_SMALL = 3
const BADGE_COUNT_DEFAULT = 8
const BADGE_COUNT_OVERFLOW = 120

/** S35：`CubeLayout` 内演示 `Badge` 包裹 `Button` / `Avatar`（文案子节点），`count` 与 `dot`。 */
export const ShowcaseSceneS35 = defineComponent({
  name: 'ShowcaseSceneS35',
  setup: () => {
    const { pageTitle } = usePageName()
    const titleFallback = 'Showcase · S35 Badge'

    const slots = {
      'layout-content': (): JSX.Element => (
        <div style={sectionStack}>
          <Card title='Badge · Button'>
            <div style={flexRow}>
              <Badge count={BADGE_COUNT_SMALL}>
                <Button type='primary'>主按钮</Button>
              </Badge>
              <Badge count={BADGE_COUNT_DEFAULT}>
                <Button>默认按钮</Button>
              </Badge>
              <Badge count={BADGE_COUNT_OVERFLOW} overflowCount={99}>
                <Button type='dashed'>溢出计数</Button>
              </Badge>
              <Badge dot>
                <Button type='link'>仅红点</Button>
              </Badge>
              <Badge dot offset={[-4, 4]}>
                <Button>偏移 dot</Button>
              </Badge>
            </div>
          </Card>
          <Card title='Badge · Avatar（文字）'>
            <div style={flexRow}>
              <Badge count={BADGE_COUNT_SMALL}>
                <Avatar size='large'>张</Avatar>
              </Badge>
              <Badge dot>
                <Avatar style={{ backgroundColor: '#7265e6' }}>A</Avatar>
              </Badge>
              <Badge count={0} showZero>
                <Avatar>U</Avatar>
              </Badge>
              <Badge count={BADGE_COUNT_DEFAULT}>
                <Avatar shape='square'>用户</Avatar>
              </Badge>
            </div>
          </Card>
          <Card title='组合（Space）'>
            <Space size='large' wrap>
              <Badge count={5} size='small'>
                <Button size='small'>小尺寸</Button>
              </Badge>
              <Badge dot>
                <Avatar size='small'>通</Avatar>
              </Badge>
            </Space>
          </Card>
        </div>
      ),
    }

    return (): JSX.Element => (
      <CubeLayout title={pageTitle || titleFallback} v-slots={slots} />
    )
  },
})
