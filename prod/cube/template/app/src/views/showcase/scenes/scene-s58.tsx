import { CubeLayout } from '@ghcloud/cube-app-design'
import { Card, DropDown, Menu, MenuItem } from '@ghcloud/cube-ui'
import { usePageName } from '@ghcloud/cube-utils'
import { defineComponent } from 'vue'

/**
 * Batch-4 S58：`CubeLayout` + `@ghcloud/cube-ui` 的 `DropDown`（主入口导出名为 **DropDown**，非 `Dropdown`）与 `Menu` / `MenuItem` 浮层；无路由。
 */
export const ShowcaseSceneS58 = defineComponent({
  name: 'ShowcaseSceneS58',
  setup: () => {
    const { pageTitle } = usePageName()
    const titleFallback = 'Showcase · S58 DropDown + Menu'

    const slots = {
      'layout-content': (): JSX.Element => (
        <Card title='下拉与菜单浮层'>
          <p style={{ margin: '0 0 12px', color: 'rgba(0, 0, 0, 0.65)', fontSize: '14px', lineHeight: 1.6 }}>
            点击触发器展开浮层；已传入 <code>trigger</code> 为仅点击。浮层为垂直 <code>Menu</code>。
            <code>@ghcloud/cube-ui</code> 主入口导出组件名为 <code>DropDown</code>（大写 D），不是 <code>Dropdown</code>。
          </p>
          <DropDown trigger={['click']}>
            {{
              default: (): JSX.Element => <span style={{ color: '#1677ff', cursor: 'pointer' }}>点击展开菜单</span>,
              overlay: (): JSX.Element => (
                <Menu mode='vertical'>
                  <MenuItem eventkey='s58-a'>选项 A</MenuItem>
                  <MenuItem eventkey='s58-b'>选项 B</MenuItem>
                  <MenuItem eventkey='s58-c' disabled>
                    禁用项
                  </MenuItem>
                </Menu>
              ),
            }}
          </DropDown>
        </Card>
      ),
    }

    return (): JSX.Element => (
      <CubeLayout title={pageTitle || titleFallback} v-slots={slots} showFooter={false} />
    )
  },
})
