import { CubeLayout, useCubeModal } from '@ghcloud/cube-app-design'
import {
  AntModal,
  Button,
  Card,
  Drawer,
  Form,
  FormItem,
  Input,
  message,
  notification,
  type FormExpose,
} from '@ghcloud/cube-ui'
import { usePageName } from '@ghcloud/cube-utils'
import { defineComponent, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'

export const ShowcaseModal = defineComponent({
  name: 'ShowcaseModal',
  setup: () => {
    const { pageTitle } = usePageName()
    const router = useRouter()
    const { t } = useI18n()
    const drawerOpen = ref(false)
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
        const p = formRef.value?.validate()
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
        formRef.value?.resetFields()
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
      'layout-header': (): JSX.Element => (
        <Button onClick={() => router.push({ name: 'demo-home' })}>返回首页</Button>
      ),
      'layout-content': (): JSX.Element => (
        <Card title={t('showcase.modal.cardTitle')}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>
            <Button type='primary' onClick={() => modalApi.open()}>
              打开 useCubeModal
            </Button>
            <Button onClick={() => AntModal.confirm({ title: 'AntModal.confirm', content: '这是确认框示例' })}>
              AntModal.confirm
            </Button>
            <Button onClick={() => (drawerOpen.value = true)}>打开 Drawer</Button>
            <Button
              onClick={() =>
                notification.info({
                  message: '通知标题',
                  description: 'notification.info 示例内容',
                })
              }
            >
              notification.info
            </Button>
            <Button onClick={() => message.loading('加载中…', 1)}>message.loading</Button>
          </div>
          <CubeModal v-slots={modalSlots} />
          <Drawer
            title='抽屉标题'
            open={drawerOpen.value}
            onUpdate:open={(v: boolean) => {
              drawerOpen.value = v
            }}
            width={400}
          >
            <p>Drawer 内可以放详情或次级表单。</p>
            <Button type='primary' onClick={() => (drawerOpen.value = false)}>
              关闭
            </Button>
          </Drawer>
        </Card>
      ),
    }

    return (): JSX.Element => <CubeLayout title={pageTitle || 'Showcase · 弹层'} v-slots={slots} showFooter={false} />
  },
})
