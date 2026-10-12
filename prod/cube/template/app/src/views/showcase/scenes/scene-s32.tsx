import { CubeLayout, useCubeForm } from '@ghcloud/cube-app-design'
import { Button, Card, message } from '@ghcloud/cube-ui'
import { usePageName } from '@ghcloud/cube-utils'
import { defineComponent } from 'vue'

const JSON_INDENT = 2

/**
 * Batch-3 S32：`useCubeForm` 隐藏内置按钮，外置主按钮显式 `validate` 通过后 `handleSubmit`；提交成功 `message.success`（无路由）。
 */
export const ShowcaseSceneS32 = defineComponent({
  name: 'ShowcaseSceneS32',
  setup: () => {
    const { pageTitle } = usePageName()

    const schema = [
      {
        component: 'Input',
        fieldName: 'name',
        label: '名称',
        componentProps: { placeholder: '必填', allowClear: true, maxLength: 64 },
        rules: { required: true, message: '请输入名称' },
      },
      {
        component: 'Textarea',
        fieldName: 'note',
        label: '备注',
        componentProps: { rows: 3, maxLength: 200, placeholder: '选填', showCount: true },
      },
    ]

    const [CubeForm, formApi] = useCubeForm({
      layout: 'vertical',
      schema,
      showButton: false,
      handleSubmit: (values) => {
        message.success(JSON.stringify({ name: values.name, note: values.note }, undefined, JSON_INDENT))
      },
    })

    const handleValidateSubmit = (): void => {
      const formInstance = formApi.formRef.value
      const p = formInstance ? formInstance.validate() : undefined
      if (!p) {
        formApi.handleSubmit()
        return
      }
      p.then(() => {
        formApi.handleSubmit()
      }).catch(() => {
        message.error('请先修正表单错误')
      })
    }

    const slots = {
      'layout-content': (): JSX.Element => (
        <Card title='S32 · useCubeForm（外置提交 / validate + handleSubmit）'>
          <CubeForm />
          <div class='mt-20' style={{ display: 'flex', gap: '12px' }}>
            <Button type='primary' onClick={handleValidateSubmit}>
              提交
            </Button>
            <Button onClick={() => formApi.handleReset()}>重置</Button>
          </div>
        </Card>
      ),
    }

    return (): JSX.Element => <CubeLayout title={pageTitle || 'Showcase · S32'} v-slots={slots} showFooter={false} />
  },
})
