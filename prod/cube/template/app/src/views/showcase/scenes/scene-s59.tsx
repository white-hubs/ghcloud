import { CubeLayout } from '@ghcloud/cube-app-design'
import { Card, Slider, TypographyText } from '@ghcloud/cube-ui'
import { usePageName } from '@ghcloud/cube-utils'
import { defineComponent, ref } from 'vue'

/**
 * Batch-4 S59：`CubeLayout` + `Slider` 受控 `ref`，文案同步展示当前数值；无路由。
 */
export const ShowcaseSceneS59 = defineComponent({
  name: 'ShowcaseSceneS59',
  setup: () => {
    const { pageTitle } = usePageName()
    const sliderValue = ref(42)

    const slots = {
      'layout-content': (): JSX.Element => (
        <Card title='S59 · Slider 受控'>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%', maxWidth: 480 }}>
            <TypographyText>
              当前值：<strong>{sliderValue.value}</strong>
            </TypographyText>
            <Slider
              value={sliderValue.value}
              min={0}
              max={100}
              onUpdate:value={(v: number | [number, number]) => {
                sliderValue.value = Array.isArray(v) ? v[0] : v
              }}
            />
          </div>
        </Card>
      ),
    }

    return (): JSX.Element => (
      <CubeLayout title={pageTitle || 'Showcase · S59 Slider'} v-slots={slots} showFooter={false} />
    )
  },
})
