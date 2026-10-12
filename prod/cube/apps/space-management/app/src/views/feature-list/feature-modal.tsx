import { defineComponent, reactive, ref } from 'vue'
import { Form, FormItem, Input, Textarea, message, type FormExpose } from '@ghcloud/cube-ui'
import { useCubeModal } from '@ghcloud/cube-app-design'
import { cubeMdataService } from '@/api/service'
import type { AreaFeature } from '@ghcloud/cube-mdata-service/src/type'

interface Props {
  title: string;
}
export const FeatureModal = defineComponent({
  props: ['title'],
  emits: ['enter', 'cancel'],
  setup (props: Props, { emit, expose }) {
    const formRenderRef = ref<FormExpose>()
    const formState = reactive<{
      id: string | undefined;
      name: string | undefined;
      describe: string | undefined;
    }>({
      id: undefined,
      name: undefined,
      describe: undefined,
    })
    const modalRules = {
      name: [{ required: true, message: '请输入特征名称', trigger: 'blur' }],
    }
    const [CubeModal, modalApi] = useCubeModal({
      title: `${props.title}`,
      onConfirm: async () => {
        try {
          modalApi.setState({ confirmLoading: true })
          await formRenderRef.value?.validate()
          const params = {
            id: formState.id || undefined,
            name: formState.name || '',
            describe: formState.describe || '',
          }
          if (formState.id) {
            await cubeMdataService.updateAreaFeature(params)
          } else {
            await cubeMdataService.addAreaFeature(params)
          }
          message.success('操作成功')
          modalApi.close()
          emit('enter')
        } catch (error) {
          const errorFields = (error as { errorFields: unknown; })?.errorFields
          !errorFields && message.error((error as { errorMessage: string; })?.errorMessage ?? '操作失败')
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
    const openModal = (record?: AreaFeature): void => {
      modalApi.open()
      for (const key in formState) {
        (formState as Record<string, unknown>)[key] = undefined
      }
      if (record) {
        modalApi.setState({ title: `编辑${props.title}` })
        Object.assign(formState, record)
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
          <Form model={formState} ref={formRenderRef} rules={modalRules} label-col={{ style: { width: '80px' } }}>
            <FormItem label='特征名称' name='name'>
              <Input v-model:value={formState.name} placeholder='请输入特征名称' />
            </FormItem>
            <FormItem label='特征描述' name='describe'>
              <Textarea v-model:value={formState.describe} placeholder='请输入特征描述' maxlength={200} />
            </FormItem>
          </Form>
        )
      }
    }
    return (): JSX.Element => <CubeModal v-slots={modalSlots} />
  }
})
