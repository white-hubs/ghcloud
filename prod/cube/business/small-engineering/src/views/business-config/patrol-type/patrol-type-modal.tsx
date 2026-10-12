import { defineComponent, reactive, ref } from 'vue'
import { Form, FormItem, Input, message, type FormExpose } from '@ghcloud/cube-ui'
import { useCubeModal } from '@ghcloud/cube-app-design'
import { cubeDailyInspectionService } from '@/api/server'
import { InspectBusinessType } from '@ghcloud/cube-daily-inspection-service'

interface Props {
  title: string;
}
export const PatrolTypeModal = defineComponent({
  props: ['title'],
  emits: ['enter', 'cancel'],
  setup (props: Props, { emit, expose }) {
    const formRenderRef = ref<FormExpose>()
    const formState = reactive<{
      id: string | undefined;
      name: string | undefined;
    }>({
      id: undefined,
      name: undefined,
    })
    const modalRules = {
      name: [{ required: true, message: '请输入类型名称', trigger: 'blur' }],
    }
    const [CubeModal, modalApi] = useCubeModal({
      title: `${props.title}`,
      onConfirm: async () => {
        try {
          modalApi.setState({ confirmLoading: true })
          await formRenderRef.value?.validate()
          const params = {
            name: formState.name || '',
            businessType: InspectBusinessType.SMALL_ENGINEERING
          }
          if (formState.id) {
            await cubeDailyInspectionService.updateInspectType(formState.id, params)
          } else {
            await cubeDailyInspectionService.addInspectType(params)
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
    const openModal = (record?: { id: string; }): void => {
      modalApi.open()
      for (const key in formState) {
        (formState as Record<string, unknown>)[key] = undefined
      }
      if (record?.id) {
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
      default: () => {
        return (
          <Form model={formState} ref={formRenderRef} rules={modalRules} label-col={{ style: { width: '80px' } }}>
            <FormItem label='类型名称' name='name'>
              <Input v-model:value={formState.name} placeholder='请输入类型名称' />
            </FormItem>
          </Form>
        )
      }
    }
    return () => <CubeModal v-slots={modalSlots} />
  }
})
