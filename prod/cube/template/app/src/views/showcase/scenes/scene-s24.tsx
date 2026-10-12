import { CubeLayout, useCubeForm } from '@ghcloud/cube-app-design'
import { Button, Card, message } from '@ghcloud/cube-ui'
import { usePageName } from '@ghcloud/cube-utils'
import { defineComponent } from 'vue'

const JSON_INDENT = 2

/**
 * Batch-2 S24：`useCubeForm` schema 演示 Select、RadioGroup（内含 Radio）、Checkbox、Switch；提交后以 JSON 文案 `message` 回显。
 */
export const ShowcaseSceneS24 = defineComponent({
  name: 'ShowcaseSceneS24',
  setup: () => {
    const { pageTitle } = usePageName()

    const schema = [
      {
        component: 'Select',
        fieldName: 'city',
        label: '城市',
        defaultValue: 'hz',
        componentProps: {
          options: [
            { label: '杭州', value: 'hz' },
            { label: '上海', value: 'sh' },
            { label: '深圳', value: 'sz' },
          ],
          allowClear: true,
          placeholder: '请选择',
        },
      },
      {
        component: 'RadioGroup',
        fieldName: 'priority',
        label: '优先级',
        defaultValue: 'normal',
        componentProps: {
          options: [
            { label: '低', value: 'low' },
            { label: '普通', value: 'normal' },
            { label: '高', value: 'high' },
          ],
        },
      },
      {
        component: 'Checkbox',
        fieldName: 'agree',
        label: '已阅读说明',
        defaultValue: false,
      },
      {
        component: 'Switch',
        fieldName: 'notify',
        label: '开启通知',
        defaultValue: true,
      },
    ]

    const [CubeForm, formApi] = useCubeForm({
      layout: 'vertical',
      schema,
      showButton: false,
      handleSubmit: (values) => {
        const payload = {
          city: values.city,
          priority: values.priority,
          agree: values.agree,
          notify: values.notify,
        }
        message.success(JSON.stringify(payload, undefined, JSON_INDENT))
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
        <Card title='S24 · useCubeForm（Select / RadioGroup / Checkbox / Switch）'>
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

    return (): JSX.Element => <CubeLayout title={pageTitle || 'Showcase · S24'} v-slots={slots} showFooter={false} />
  },
})
