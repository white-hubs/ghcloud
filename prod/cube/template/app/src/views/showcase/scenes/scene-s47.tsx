import { CubeLayout } from '@ghcloud/cube-app-design'
import { Alert, Card } from '@ghcloud/cube-ui'
import * as CubeUi from '@ghcloud/cube-ui'
import { usePageName } from '@ghcloud/cube-utils'
import { defineComponent, type Component } from 'vue'

const PLACEHOLDER_IMAGE_SRC =
  'https://placehold.co/400x240/f1f5f9/334155?text=S47+Image'

const cubeUiNs = CubeUi as Record<string, unknown>
const imageExport = cubeUiNs.Image
const hasImageExport = imageExport !== undefined && imageExport !== null

/**
 * Batch-3 S47：`Image`（@ghcloud/cube-ui）占位 `src` 演示；包未导出 `Image` 时以 `Alert` 提示。
 */
export const ShowcaseSceneS47 = defineComponent({
  name: 'ShowcaseSceneS47',
  setup: () => {
    const { pageTitle } = usePageName()
    const ImageComp = imageExport as Component

    const slots = {
      'layout-content': (): JSX.Element => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>
          {hasImageExport ? (
            <Card title='Image（占位 src）'>
              <ImageComp src={PLACEHOLDER_IMAGE_SRC} alt='S47 占位图' width={400} />
            </Card>
          ) : (
            <Alert type='warning' showIcon message='Image 未导出' />
          )}
        </div>
      ),
    }

    return (): JSX.Element => (
      <CubeLayout title={pageTitle || 'Showcase · S47'} v-slots={slots} showFooter={false} />
    )
  },
})
