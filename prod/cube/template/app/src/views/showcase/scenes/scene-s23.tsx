import { CubeLayout, useCubeForm } from '@ghcloud/cube-app-design'
import { message } from '@ghcloud/cube-ui'
import { usePageName } from '@ghcloud/cube-utils'
import { defineComponent } from 'vue'

/**
 * Batch-2 S23：`CubeLayout` + `useCubeForm` schema（Input / InputNumber / Textarea），提交后以 `message.success` 展示表单值（无表格、无路由）。
 */
export const ShowcaseSceneS23 = defineComponent({
  name: 'ShowcaseSceneS23',
  setup: () => {
    const { pageTitle } = usePageName()

    const [CubeForm] = useCubeForm({
      layout: 'vertical',
      isCollapsed: false,
      showCollapseButton: false,
      schema: [
        {
          component: 'Input',
          fieldName: 'title',
          label: '标题',
          componentProps: { placeholder: '单行文本', allowClear: true, maxLength: 120 },
        },
        {
          component: 'InputNumber',
          fieldName: 'amount',
          label: '数量',
          defaultValue: 0,
          componentProps: { min: 0, max: 9999, style: { width: '100%' } },
        },
        {
          component: 'Textarea',
          fieldName: 'remark',
          label: '备注',
          componentProps: { rows: 4, maxLength: 500, placeholder: '多行文本', showCount: true },
        },
      ],
      handleSubmit: (values: Record<string, unknown>): void => {
        message.success(JSON.stringify(values))
      },
    })

    const slots = {
      'layout-content': (): JSX.Element => (
        <div>
          <CubeForm />
        </div>
      ),
    }

    return (): JSX.Element => (
      <CubeLayout title={pageTitle || 'Showcase · S23'} v-slots={slots} showFooter={false} />
    )
  },
})
