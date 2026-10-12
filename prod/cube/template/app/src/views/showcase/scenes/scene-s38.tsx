import { CubeLayout, useCubeModal } from '@ghcloud/cube-app-design'
import { Button, Card, Form, FormItem, Input, message, type FormExpose } from '@ghcloud/cube-ui'
import { usePageName } from '@ghcloud/cube-utils'
import { defineComponent, reactive, ref } from 'vue'

/** S38：`useCubeModal` + 表单（确认校验保存、取消重置），无路由。 */
export const ShowcaseSceneS38 = defineComponent({
  name: 'ShowcaseSceneS38',
  setup: () => {
    const { pageTitle } = usePageName()
    const formRef = ref<FormExpose>()
    const miniForm = reactive({ note: '' })
    const modalRules = {
      note: [{ required: true, message: '必填' }],
    }

    const [CubeModal, modalApi] = useCubeModal({
      title: 'useCubeModal 示例',
      width: '520px',
      onConfirm: () => {
        modalApi.setState({ confirmLoading: true })
        const form = formRef.value
        const p = form ? form.validate() : undefined
        if (!p) {
          modalApi.setState({ confirmLoading: false })
          return
        }
        p.then(() => {
          message.success(`已保存：${miniForm.note}`)
          modalApi.close()
        })
          .catch(() => {
            message.error('请填写备注')
          })
          .finally(() => {
            modalApi.setState({ confirmLoading: false })
          })
      },
      onCancel: () => {
        const form = formRef.value
        if (form) {
          form.resetFields()
        }
        modalApi.close()
      },
    })

    const modalSlots = {
      default: (): JSX.Element => (
        <Form model={miniForm} ref={formRef} layout='vertical' rules={modalRules}>
          <FormItem label='备注' name='note'>
            <Input v-model:value={miniForm.note} placeholder='输入任意内容' />
          </FormItem>
        </Form>
      ),
    }

    const slots = {
      'layout-content': (): JSX.Element => (
        <Card title='弹层与表单'>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>
            <Button type='primary' onClick={() => modalApi.open()}>
              打开 useCubeModal
            </Button>
          </div>
          <CubeModal v-slots={modalSlots} />
        </Card>
      ),
    }

    return (): JSX.Element => (
      <CubeLayout title={pageTitle || 'Showcase S38'} v-slots={slots} showFooter={false} />
    )
  },
})
