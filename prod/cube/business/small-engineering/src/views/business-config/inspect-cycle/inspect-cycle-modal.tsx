import { defineComponent, reactive, ref } from 'vue'
import { Form, FormItem, Input, Textarea, message, type FormExpose } from '@ghcloud/cube-ui'
import { useCubeModal } from '@ghcloud/cube-app-design'
import { cubeDailyInspectionService } from '@/api/server'
import { InspectBusinessType } from '@ghcloud/cube-daily-inspection-service'

interface Props {
  title: string;
}
export const InspectCycleModal = defineComponent({
  props: ['title'],
  emits: ['enter', 'cancel'],
  setup (props: Props, { emit, expose }) {
    const formRenderRef = ref<FormExpose>()
    const formState = reactive<{
      id: string | undefined;
      name: string | undefined;
      cron: string | undefined;
      description: string | undefined;
    }>({
      id: undefined,
      name: undefined,
      cron: undefined,
      description: undefined,
    })
    const modalRules = {
      name: [{ required: true, message: '请输入周期名称', trigger: 'blur' }],
      cron: [{ required: true, message: '请输入表达式', trigger: 'blur' }],
    }
    const [CubeModal, modalApi] = useCubeModal({
      title: `${props.title}`,
      onConfirm: async () => {
        try {
          modalApi.setState({ confirmLoading: true })
          await formRenderRef.value?.validate()
          const params = {
            name: formState.name || '',
            cron: formState.cron || '',
            description: formState.description || '',
            businessType: InspectBusinessType.SMALL_ENGINEERING
          }
          if (formState.id) {
            await cubeDailyInspectionService.updateInspectCron(formState.id, params)
          } else {
            await cubeDailyInspectionService.addInspectCron(params)
          }
          message.success('操作成功')
          modalApi.close()
          emit('enter')
        } catch (error) {
          message.error((error as { errorMessage: string; })?.errorMessage ?? '操作失败')
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
    const openModal = (record?: unknown): void => {
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
            <FormItem label='周期名称' name='name'>
              <Input v-model:value={formState.name} placeholder='请输入周期名称' />
            </FormItem>
            <FormItem label='表达式' name='cron'>
              <Textarea v-model:value={formState.cron} placeholder='请输入表达式' maxlength={200} />
            </FormItem>
            <FormItem label='描述' name='description'>
              <Textarea v-model:value={formState.description} placeholder='请输入描述' maxlength={200} />
            </FormItem>
          </Form>
        )
      }
    }
    return (): JSX.Element => <CubeModal v-slots={modalSlots} />
  }
})
