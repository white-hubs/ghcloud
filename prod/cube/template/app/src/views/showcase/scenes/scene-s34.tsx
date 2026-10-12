import { CubeLayout } from '@ghcloud/cube-app-design'
import { Card, Tag } from '@ghcloud/cube-ui'
import { usePageName } from '@ghcloud/cube-utils'
import { defineComponent } from 'vue'

const tagRow: Record<string, string> = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: '12px',
  alignItems: 'center',
}

/**
 * Batch-3 S34：`CubeLayout` + `Card`，一行展示 `Tag` 的预设色（success / processing / error / default / warning）；无路由。
 */
export const ShowcaseSceneS34 = defineComponent({
  name: 'ShowcaseSceneS34',
  setup: () => {
    const { pageTitle } = usePageName()
    const slots = {
      'layout-content': (): JSX.Element => (
        <Card title='Tag 预设色'>
          <div style={tagRow}>
            <Tag color='success'>成功</Tag>
            <Tag color='processing'>进行中</Tag>
            <Tag color='error'>失败</Tag>
            <Tag color='default'>默认</Tag>
            <Tag color='warning'>警告</Tag>
          </div>
        </Card>
      ),
    }
    return (): JSX.Element => (
      <CubeLayout title={pageTitle || 'Showcase · S34'} v-slots={slots} showFooter={false} />
    )
  },
})
