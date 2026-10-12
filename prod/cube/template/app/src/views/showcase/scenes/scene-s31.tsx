import { CubeLayout, useCubeForm } from '@ghcloud/cube-app-design'
import { Card, message } from '@ghcloud/cube-ui'
import { usePageName } from '@ghcloud/cube-utils'
import { defineComponent } from 'vue'

/**
 * Batch-3 S31：`CubeLayout` + `useCubeForm` schema 演示 `Input` / `Textarea` 的 `disabled` 与 `readonly`；`usePageName`；无路由。
 */
export const ShowcaseSceneS31 = defineComponent({
  name: 'ShowcaseSceneS31',
  setup: () => {
    const { pageTitle } = usePageName()

    const [CubeForm] = useCubeForm({
      layout: 'vertical',
      isCollapsed: false,
      showCollapseButton: false,
      schema: [
        {
          component: 'Input',
          fieldName: 'lineDisabled',
          label: '单行 · disabled',
          defaultValue: '禁用态占位文案',
          componentProps: { disabled: true, allowClear: false, showCount: false, placeholder: '不可输入' },
        },
        {
          component: 'Input',
          fieldName: 'lineReadonly',
          label: '单行 · readonly',
          defaultValue: '只读态，可选中复制',
          componentProps: { readonly: true, allowClear: false, showCount: false, placeholder: '只读' },
        },
        {
          component: 'Textarea',
          fieldName: 'multiDisabled',
          label: '多行 · disabled',
          defaultValue: '禁用态多行内容',
          componentProps: { disabled: true, rows: 3, showCount: false, placeholder: '不可编辑' },
        },
        {
          component: 'Textarea',
          fieldName: 'multiReadonly',
          label: '多行 · readonly',
          defaultValue: '只读多行内容',
          componentProps: { readonly: true, rows: 3, showCount: true, placeholder: '只读' },
        },
      ],
      handleSubmit: (values: Record<string, unknown>): void => {
        message.success(JSON.stringify(values))
      },
    })

    const slots = {
      'layout-content': (): JSX.Element => (
        <Card title='S31 · useCubeForm（Input / Textarea 的 disabled 与 readonly）'>
          <CubeForm />
        </Card>
      ),
    }

    return (): JSX.Element => (
      <CubeLayout title={pageTitle || 'Showcase · S31'} v-slots={slots} showFooter={false} />
    )
  },
})
