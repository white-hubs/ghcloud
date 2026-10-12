import { CubeLayout } from '@ghcloud/cube-app-design'
import { AntModal, Button, Card } from '@ghcloud/cube-ui'
import { usePageName } from '@ghcloud/cube-utils'
import { defineComponent, ref } from 'vue'

/**
 * Batch-3 S40：`AntModal` 受控展示，`open` 与 `onUpdate:open`（与 `v-model:open` 等价），正文 + 确定/取消。
 */
export const ShowcaseSceneS40 = defineComponent({
  name: 'ShowcaseSceneS40',
  setup: () => {
    const { pageTitle } = usePageName()
    const modalOpen = ref(false)

    const slots = {
      'layout-content': (): JSX.Element => (
        <Card title='Modal（受控 open）'>
          <Button type='primary' onClick={() => { modalOpen.value = true }}>打开对话框</Button>
          <AntModal
            title='S40 示例'
            open={modalOpen.value}
            onUpdate:open={(v: boolean): void => {
              modalOpen.value = v
            }}
            okText='确定'
            cancelText='取消'
          >
            <p>这是受控对话框的正文占位，用于演示 `open` / `onUpdate:open` 与底部确定、取消。</p>
          </AntModal>
        </Card>
      ),
    }

    return (): JSX.Element => (
      <CubeLayout title={pageTitle || 'Showcase · S40'} v-slots={slots} showFooter={false} />
    )
  },
})
