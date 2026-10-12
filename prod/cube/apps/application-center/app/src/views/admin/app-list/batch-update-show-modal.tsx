import { Form, FormItem, message, Switch, type FormExpose } from '@ghcloud/cube-ui'
import { useCubeModal } from '@ghcloud/cube-app-design'
import { defineComponent, reactive, ref } from 'vue'
import { cubeApplicationCenterService } from '@/api/service'

interface Props {
  title: string;
}

export const BatchUpdateShowModal = defineComponent({
  props: ['title'],
  emits: ['enter', 'cancel'],
  setup (props: Props, { emit, expose }) {
    const isUpdatePublic = ref<boolean>(false)
    const formRenderRef = ref<FormExpose>()
    const formState = reactive<{
      applicationIds: string[];
      enabled: boolean;
    }>({
      applicationIds: [],
      enabled: true,
    })
    const modalRules = {
      enabled: [
        { required: true, message: '应用是否展示', trigger: 'blur' },
      ],
    }
    const [CubeModal, modalApi] = useCubeModal({
      title: `${props.title ?? '批量修改应用是否展示'}`,
      onConfirm: async () => {
        try {
          modalApi.setState({ confirmLoading: true })
          await formRenderRef.value?.validate()
          const payload = isUpdatePublic.value ? {
            applicationIds: formState.applicationIds,
            publicAccess: formState.enabled,
          } : {
            applicationIds: formState.applicationIds,
            enabled: formState.enabled,
          }
          await cubeApplicationCenterService.batchUpdateApplication(payload)
          message.success('操作成功')
          emit('enter')
          modalApi.close()
        } catch {
          message.error('操作失败')
        } finally {
          modalApi.setState({ confirmLoading: false })
        }
      },
      onCancel: () => {
        formRenderRef.value?.resetFields()
        modalApi.close()
        emit('cancel')
      }
    })
    const openModal = (ids: string[], isPublic: boolean): void => {
      isUpdatePublic.value = isPublic
      modalApi.setState({
        title: `${props.title ?? '批量修改应用是否展示'}${isUpdatePublic.value ? '（公开展示）' : ''}`,
      })
      modalApi.open()
      formState.applicationIds = ids
    }
    expose({
      openModal
    })
    const modalSlots = {
      default: (): JSX.Element => {
        return (
          <div style={{ "max-height": '500px', 'overflow-y': 'auto' }}>
            <Form model={formState} ref={formRenderRef} rules={modalRules} label-col={{ style: { width: '100px' } }}>
              <FormItem label={isUpdatePublic.value ? '是否公开展示' : '是否展示'} name='enabled'>
                <Switch
                  v-model:checked={formState.enabled}
                  checkedChildren="是"
                  unCheckedChildren="否"
                />
              </FormItem>
            </Form>
          </div>
        )
      }
    }
    return (): JSX.Element => <CubeModal v-slots={modalSlots} />
  }
})