
import { cubeDeviceCenterInternalService } from '@/api/service'
import { debounce } from '@/utils/tool'
import type { CustomerTagVO } from '@ghcloud/cube-iot-center-service'
import { Form, FormItem, Input, Modal, Textarea, message } from '@ghcloud/cube-ui'
import { defineComponent, ref, reactive } from 'vue'

interface Props {
  labelWidth: string;
}

export const TagModel = defineComponent({
  props: {
    labelWidth: {
      type: String,
      default: '80px'
    },
  },
  emits: ['enter'],
  setup (props: Props, { emit, expose }) {
    const submitLoading = ref(false)
    const modalVisible = ref<boolean>(false)
    const formRenderRef = ref()
    const formState = reactive<{
      id: string | null;
      tagName: string;
      description: string;
    }>({
      id: null,
      tagName: '',
      description: '',
    })
    const modalRules = {
      tagName: [{ required: true, message: '请输入标签名称', trigger: 'blur' }],
    }
    const handleOk = debounce(() => {

      formRenderRef.value?.validate().then(async () => {
        submitLoading.value = true
        const params = { ...formState }
        params.id = isEdit.value ? formState.id : null
        try {
          await cubeDeviceCenterInternalService.addCustomerTag(params)
          message.success('操作成功')
          modalVisible.value = false
        } catch {
        } finally {
          submitLoading.value = false
        }
        emit('enter')
      }).catch(() => {
      })
    }, 500)
    const cancel = (): void => {
      modalVisible.value = false
      formRenderRef.value.clearValidate()
      formRenderRef.value.resetFields()
      emit('enter')
    }
    const isEdit = ref(false)
    const openModal = (record: CustomerTagVO): void => {
      isEdit.value = !!record
      formRenderRef.value?.resetFields()
      modalVisible.value = true
      formState.description = record?.description || ''
      formState.id = record?.id || null
      formState.tagName = record?.tagName || ''
    }

    expose({
      openModal
    })
    return (): JSX.Element =>
      <>
        <Modal
          visible={modalVisible.value}
          title={`${isEdit.value ? '编辑' : '新增'}标签`}
          onOk={handleOk}
          onCancel={cancel}
          confirmLoading={submitLoading.value}
        >
          <Form model={formState} ref={formRenderRef} rules={modalRules} label-col={{ style: { width: props.labelWidth } }}>
            <FormItem label='标签名称' name='tagName'>
              <Input
                maxlength={20}
                style={{ width: '380px' }}
                v-model:value={formState.tagName} placeholder='请输入标签名称'
                allowClear
              />
            </FormItem>
            <FormItem label='标签描述' name='description'>
              <Textarea
                style={{ width: '380px' }}
                v-model:value={formState.description} placeholder='请输入标签描述'
                allowClear
                maxlength={200}
              />
            </FormItem>
          </Form>
        </Modal>
      </>
  }
})
