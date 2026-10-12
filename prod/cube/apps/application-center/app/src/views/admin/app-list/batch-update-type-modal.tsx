import { Form, FormItem, message, type FormExpose } from '@ghcloud/cube-ui'
import { useCubeModal } from '@ghcloud/cube-app-design'
import { defineComponent, reactive, ref } from 'vue'
import { cubeApplicationCenterService } from '@/api/service'
import { AppTypeSelect } from '@/components/app-type-select/app-type-select'

interface Props {
  title: string;
}

export const BatchUpdateTypeModal = defineComponent({
  props: ['title'],
  emits: ['enter', 'cancel'],
  setup (props: Props, { emit, expose }) {
    const formRenderRef = ref<FormExpose>()
    const formState = reactive<{
      applicationIds: string[];
      applicationGroupId: string;
    }>({
      applicationIds: [],
      applicationGroupId: '',
    })
    const modalRules = {
      applicationGroupId: [
        { required: true, message: '应用分类不能为空', trigger: 'blur' },
      ],
    }
    const [CubeModal, modalApi] = useCubeModal({
      title: `${props.title ?? '批量修改应用分类'}`,
      onConfirm: async () => {
        try {
          modalApi.setState({ confirmLoading: true })
          await formRenderRef.value?.validate()
          await cubeApplicationCenterService.batchUpdateApplication(formState)
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
    const openModal = (ids: string[]): void => {
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
              <FormItem label='应用分类' name='applicationGroupId'>
                <AppTypeSelect v-model:value={formState.applicationGroupId} />
              </FormItem>
            </Form>
          </div>
        )
      }
    }
    return (): JSX.Element => <CubeModal v-slots={modalSlots} />
  }
})