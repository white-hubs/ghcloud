import { CubeLayout } from '@ghcloud/cube-app-design'
import { Button, Card, Drawer } from '@ghcloud/cube-ui'
import { usePageName } from '@ghcloud/cube-utils'
import { defineComponent, ref } from 'vue'

const DRAWER_WIDTH = 400

/**
 * Batch-3 S41：`CubeLayout` + `Drawer` 受控 `open` / `onUpdate:open`（同 `showcase-modal.tsx`），按钮切换抽屉；无路由。
 */
export const ShowcaseSceneS41 = defineComponent({
  name: 'ShowcaseSceneS41',
  setup: () => {
    const { pageTitle } = usePageName()
    const drawerOpen = ref(false)

    const slots = {
      'layout-content': (): JSX.Element => (
        <Card title='Drawer（受控 open）'>
          <Button type='primary' onClick={() => { drawerOpen.value = !drawerOpen.value }}>
            {drawerOpen.value ? '关闭抽屉' : '打开抽屉'}
          </Button>
          <Drawer
            title='S41 抽屉'
            open={drawerOpen.value}
            onUpdate:open={(v: boolean): void => {
              drawerOpen.value = v
            }}
            width={DRAWER_WIDTH}
          >
            <p>简短正文：受控抽屉示例。</p>
            <Button type='primary' onClick={() => { drawerOpen.value = false }}>
              关闭
            </Button>
          </Drawer>
        </Card>
      ),
    }

    return (): JSX.Element => (
      <CubeLayout title={pageTitle || 'Showcase · S41'} v-slots={slots} showFooter={false} />
    )
  },
})
