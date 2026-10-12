import { CubeLayout, useCubeForm } from '@ghcloud/cube-app-design'
import { Button, Card, Space, message, type RuleObject } from '@ghcloud/cube-ui'
import { usePageName } from '@ghcloud/cube-utils'
import { defineComponent } from 'vue'

const CONTACT_MIN_LEN = 5
const CONTACT_MAX_LEN = 64
/** 简单邮箱 或 大陆 11 位手机号 */
const EMAIL_OR_PHONE_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$|^1[3-9]\d{9}$/

const contactRules: RuleObject[] = [
  { required: true, whitespace: true, message: '请输入联系方式' },
  {
    min: CONTACT_MIN_LEN,
    max: CONTACT_MAX_LEN,
    message: `长度需在 ${CONTACT_MIN_LEN}～${CONTACT_MAX_LEN} 之间`,
  },
  { pattern: EMAIL_OR_PHONE_PATTERN, message: '请输入有效邮箱或 11 位手机号' },
]

/**
 * Batch-2 S28：`useCubeForm` 组合校验（必填、长度、邮箱或手机号 pattern），提交前显式 `validate`。
 */
export const ShowcaseSceneS28 = defineComponent({
  name: 'ShowcaseSceneS28',
  setup: () => {
    const { pageTitle } = usePageName()

    const [CubeForm, formApi] = useCubeForm({
      layout: 'vertical',
      schema: [
        {
          component: 'Input',
          fieldName: 'contact',
          label: '邮箱或手机',
          componentProps: {
            placeholder: '例如 name@example.com 或 13800138000',
            allowClear: true,
            maxLength: CONTACT_MAX_LEN,
          },
          rules: contactRules,
        },
      ],
      showButton: false,
      handleSubmit: (values) => {
        message.success(`校验通过：${String(values.contact ?? '')}`)
      },
    })

    const handleValidateSubmit = (): void => {
      const formInst = formApi.formRef.value
      if (!formInst?.validate) {
        message.error('表单实例未就绪，请稍后重试')
        return
      }
      void formInst
        .validate()
        .then(() => {
          formApi.handleSubmit()
        })
        .catch(() => {
          message.error('请先修正表单错误')
        })
    }

    const slots = {
      'layout-content': (): JSX.Element => (
        <Card title='S28 · useCubeForm 校验（必填 / 长度 / pattern）'>
          <CubeForm />
          <Space class='mt-20'>
            <Button type='primary' onClick={handleValidateSubmit}>
              提交（校验通过后提交）
            </Button>
            <Button onClick={() => formApi.handleReset()}>重置</Button>
          </Space>
        </Card>
      ),
    }

    return (): JSX.Element => <CubeLayout title={pageTitle || 'Showcase S28'} v-slots={slots} showFooter={false} />
  },
})
