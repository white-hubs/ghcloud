import { defineComponent, reactive, ref } from 'vue'
import { Form, FormItem, Input, message, type FormExpose } from '@ghcloud/cube-ui'
import { useCubeModal } from '@ghcloud/cube-app-design'
import { cubeParkingLotService } from "@/api/service";

export const CarTypeModal = defineComponent({
  props: {
    title: {
      type: String,
      default: '类型'
    }
  },
  emits: ['enter', 'cancel'],
  setup (props, { emit, expose }) {
    const formRenderRef = ref<FormExpose>()
    const formState = reactive<{
      id: string | number | undefined;
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
            name: formState.name ?? '',
          }
          if (formState.id) {
            await cubeParkingLotService.saveVehicleType({ ...params, id: formState.id as string })
          } else {
            await cubeParkingLotService.saveVehicleType(params)
          }
          message.success('操作成功')
          emit('enter')
          modalApi.close()
        } catch (error) {
          const errorFields = (error as { errorFields: unknown; })?.errorFields
          const showError = !errorFields && !(error instanceof Error && error.message.includes('校验失败'))
          showError && message.error((error as { errorMessage: string; })?.errorMessage ?? '操作失败')
        } finally {
          modalApi.setState({ confirmLoading: false })
        }
      },
      onCancel: () => {
        formRenderRef.value?.resetFields()
        emit('cancel')
        modalApi.close()
      }
    })
    const openModal = (record?: any): void => {
      modalApi.open()
      for (const key in formState) {
        (formState as Record<string, unknown>)[key] = undefined
      }
      if (record) {
        modalApi.setState({ title: `编辑${props.title}` })
        formState.id = record?.id
        formState.name = record?.name
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
          <Form model={formState} ref={formRenderRef} rules={modalRules} labelCol={{ style: { width: '100px !important' } }}>
            <FormItem label='类型名称' name='name'>
              <Input v-model:value={formState.name} placeholder='请输入类型名称' maxlength={20} />
            </FormItem>
          </Form>
        )
      }
    }
    
    return () => <CubeModal v-slots={modalSlots} />
  }
})
