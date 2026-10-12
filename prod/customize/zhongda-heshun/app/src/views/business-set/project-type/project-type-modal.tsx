import { Form, FormItem, Input, message, type FormExpose } from '@ghcloud/cube-ui'
import { useCubeModal } from '@ghcloud/cube-app-design'
import { defineComponent, reactive, ref } from 'vue'
import { cubeZhongdaHeshunService } from '@/api/service'
import type { DataTypeVO } from '@ghcloud/cube-zhongda-heshun-service'

interface Props {
  title: string;
}

export const ProjectTypeModal = defineComponent({
  props: ['title'],
  emits: ['enter', 'cancel'],
  setup (props: Props, { emit, expose }) {
    const formRenderRef = ref<FormExpose>()
    const isReadonly = ref<boolean>(false)
    const formState = reactive<{
      id: string;
      dataName: string;
      remark: string;
    }>({
      id: '',
      dataName: '',
      remark: '',
    })
    const modalRules = {
      dataName: [
        { required: true, message: '请输入项目类型名称', trigger: 'blur' },
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
              dataName: formState.dataName,
              remark: formState.remark,
              dataType: 'PROJECT'
            }
            await cubeZhongdaHeshunService.editTypeAllList(params)
          } else {
            const params = {
              dataName: formState.dataName,
              remark: formState.remark,
              dataType: 'PROJECT'
            }
            await cubeZhongdaHeshunService.addTypeAllList(params)
          }
          formRenderRef.value?.resetFields()
          message.success('操作成功')
          emit('enter')
          modalApi.close()
        } catch {
        } finally {
          modalApi.setState({ confirmLoading: false })
        }
      },
      onClosed: () => {
        formRenderRef.value?.resetFields()
      }
    })
    const openModal = (record?: DataTypeVO, readonly?: boolean): void => {
      modalApi.open()
      isReadonly.value = readonly ?? false
      if (record) {
        modalApi.setState({ title: `${isReadonly.value ? '' : '编辑'}${props.title}` })
        formState.id = record.id
        formState.dataName = record.dataName
        formState.remark = record.remark
      } else {
        formState.id = ''
        formState.dataName = ''
        formState.remark = ''
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
              <FormItem label='分类名称' name='dataName'>
                <Input readonly={isReadonly.value} v-model:value={formState.dataName} placeholder='请输入分类名称' />
              </FormItem>
              <FormItem label='备注说明' name='remark'>
                <Input readonly={isReadonly.value} v-model:value={formState.remark} placeholder='请输入备注说明' />
              </FormItem>
            </Form>
          </div>
        )
      }
    }
    return (): JSX.Element => <CubeModal v-slots={modalSlots} />

  }
})