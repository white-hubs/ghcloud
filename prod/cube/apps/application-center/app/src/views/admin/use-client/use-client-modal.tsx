import { Form, FormItem, Input, message, type FormExpose } from '@ghcloud/cube-ui'
import { useCubeModal } from '@ghcloud/cube-app-design'
import { defineComponent, reactive, ref } from 'vue'
import { cubeApplicationCenterService } from '@/api/service'
import type { TerminalEntity } from '@ghcloud/cube-application-center-service'

interface Props {
  title: string;
}

export const UseClientModal = defineComponent({
  props: ['title'],
  emits: ['enter', 'cancel'],
  setup (props: Props, { emit, expose }) {
    const formRenderRef = ref<FormExpose>()
    const isReadonly = ref<boolean>(false)
    const formState = reactive<{
      id: string | null;
      name: string;
      code: string;
    }>({
      id: null,
      name: '',
      code: '',
    })
    const modalRules = {
      name: [
        { required: true, message: '应用端名称', trigger: 'blur' },
      ],
      code: [
        { required: true, message: '应用端编码', trigger: 'blur' },
      ],
    }
    const [CubeModal, modalApi] = useCubeModal({
      title: `${props.title}`,
      onConfirm: async () => {
        if (isReadonly.value) {
          modalApi.close()
          return
        }
        try {
          modalApi.setState({ confirmLoading: true })
          await formRenderRef.value?.validate()
          if (formState.id) {
            const params = {
              id: formState.id,
              name: formState.name ?? '',
              code: formState.code ?? '',
            }
            await cubeApplicationCenterService.updateTerminal(params)
          } else {
            const params = {
              name: formState.name ?? '',
              code: formState.code ?? '',
            }
            await cubeApplicationCenterService.addTerminal(params)
          }
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
    const openModal = (record?: TerminalEntity, readonly?: boolean): void => {
      modalApi.open()
      isReadonly.value = readonly ?? false
      for (const key in formState) {
        (formState as Record<string, unknown>)[key] = undefined
      }
      if (record) {
        modalApi.setState({ title: `${isReadonly.value ? '' : '编辑'}${props.title}` })
        formState.id = record.id
        formState.name = record.name
        formState.code = record.code
      } else {
        modalApi.setState({ title: `新增${props.title}` })
      }
    }
    expose({
      openModal
    })
    const modalSlots = {
      default: (): JSX.Element => {
        return (
          <div style={{ "max-height": '500px', 'overflow-y': 'auto' }}>
            <Form model={formState} ref={formRenderRef} rules={modalRules} label-col={{ style: { width: '100px' } }}>
              <FormItem label='应用端名称' name='name'>
                <Input readonly={isReadonly.value} v-model:value={formState.name} placeholder='请输入应用端名称' />
              </FormItem>
              <FormItem label='应用端编码' name='code'>
                <Input readonly={isReadonly.value} v-model:value={formState.code} placeholder='请输入应用端编码' />
              </FormItem>
            </Form>
          </div>
        )
      }
    }
    return (): JSX.Element => <CubeModal v-slots={modalSlots} />
  }
})