import { defineComponent, ref, reactive } from 'vue'
import { Form, FormItem, Input, Textarea, message, type FormExpose } from '@ghcloud/cube-ui'
import { useCubeModal } from '@ghcloud/cube-app-design'
import { cubeBusinessTagService } from '@/api/server'
import type { BusinessTagModel } from '@ghcloud/cube-business-tag-service'

interface Props {
  title: string;
}

export const TagEditModal = defineComponent({
  props: ['title'],
  emits: ['enter', 'cancel'],
  setup (props: Props, { emit, expose }) {
    const formRenderRef = ref<FormExpose>()
    const formState = reactive<{
      id: string | null;
      name: string | null;
      description: string | null;
      parentId: string | null;
    }>({
      id: null,
      parentId: null,
      name: null,
      description: null,
    })
    const modalRules = {
      name: [{ required: true, message: '请输入标签名称', trigger: 'blur' }],
    }
    const [CubeModal, modalApi] = useCubeModal({
      title: `${props.title}`,
      onConfirm: async () => {
        try {
          modalApi.setState({ confirmLoading: true })
          await formRenderRef.value?.validate()
          if (formState.id) {
            const params = {
              id: formState.id ?? '',
              name: formState.name ?? '',
              description: formState.description ?? '',
              parentId: formState.parentId ?? undefined,
            }
            await cubeBusinessTagService.updateTag(params)
          } else {
            const params = {
              name: formState.name ?? '',
              description: formState.description ?? '',
              parentId: formState.parentId ?? undefined,
            }
            await cubeBusinessTagService.addTag(params)
          }
          message.success('操作成功')
          modalApi.close()
          emit('enter')
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
    const isEdit = ref(false)
    const openModal = (record?: BusinessTagModel, addSub?: boolean): void => {
      modalApi.open()
      isEdit.value = false
      for (const key in formState) {
        (formState as Record<string, unknown>)[key] = undefined
      }
      if (addSub) {
        modalApi.setState({ title: `【${record?.name}】新增下级` })
        formState.parentId = record?.id ?? null
      } else {
        if (record) {
          isEdit.value = true
          modalApi.setState({ title: `编辑${props.title}` })
          formState.id = record.id
          formState.name = record.name
          formState.description = record.description
          formState.parentId = record.parentId
        } else {
          modalApi.setState({ title: `新增${props.title}` })
        }
      }
    }
    expose({
      openModal
    })
    const modalSlots = {
      default: (): JSX.Element => {
        return (
          <div style={{ "max-height": '300px', 'overflow-y': 'auto' }}>
            <Form model={formState} ref={formRenderRef} rules={modalRules} label-col={{ style: { width: '100px' } }}>
              <FormItem label='标签名称' name='name'>
                <Input v-model:value={formState.name} placeholder='请输入名称' />
              </FormItem>
              <FormItem label='标签描述' name='description'>
                <Textarea v-model:value={formState.description} placeholder='请输入标签描述' maxlength={30} />
              </FormItem>
            </Form>
          </div>
        )
      }
    }
    return (): JSX.Element => <CubeModal v-slots={modalSlots} />

  }
})