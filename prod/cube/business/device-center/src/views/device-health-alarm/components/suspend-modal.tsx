import { debounce } from '@/utils/tool'
import { GLOBAL_SCENE_CODE } from '@ghcloud/cube-file-service'
import { Form, FormItem, Modal, type FormExpose, Textarea, DatePicker } from '@ghcloud/cube-ui'
import { FileUpload } from '@ghcloud/generic-component'
import { defineComponent, reactive, ref } from 'vue'

/** 挂起报警弹窗 */
export const SuspendModal = defineComponent({
  emits: ['success'],
  setup: (props, { expose, emit }) => {
    const modalVisible = ref(false)
    const loading = ref(false)
    const formInstance = ref<FormExpose>()
    const formState = reactive({
      remark: undefined,
      estimatedProcessTime: undefined,
      fileVOS: undefined,
    })
    const formRules = {
      estimatedProcessTime: [{ required: true, message: '请选择预计处理时间', trigger: 'blur' }],
      remark: [{ required: true, message: '请输入挂起原因', trigger: 'blur' }],
      fileVOS: [{ required: true, message: '请上传图片', trigger: 'blur' }],
    }
    const openModal = (): void => {
      formState.remark = undefined
      formState.estimatedProcessTime = undefined
      formState.fileVOS = undefined
      modalVisible.value = true
      if (formInstance.value) {
        formInstance.value.resetFields()
      }
    }

    /** 确定按钮回回调 */
    const ok = debounce(async () => {
      formInstance.value?.clearValidate()
      await formInstance.value?.validate()
      emit('success', formState)
    }, 500)
    const cancel = (): void => {
      modalVisible.value = false
      formInstance.value?.resetFields()
    }

    expose({
      openModal
    })

    return (): JSX.Element=>
      <Modal visible={modalVisible.value} title='挂起' width='600px' destroyOnClose onOk={ok} onCancel={cancel} loading={loading.value}>
        <Form ref={formInstance} model={formState} labelCol={{ style: { width: '120px' } }} rules={formRules}>
          <FormItem label='预计处理时间' name='estimatedProcessTime'>
            <DatePicker placeholder='请选择预计处理时间' v-model:value={formState.estimatedProcessTime} />
          </FormItem>
          <FormItem label='挂起原因' name='remark'>
            <Textarea placeholder='请输入挂起原因' v-model:value={formState.remark} />
          </FormItem>
          <FormItem label='图片'>
            <FileUpload sceneCode={GLOBAL_SCENE_CODE.deviceCenter} v-model:value={formState.fileVOS} customText='请上传图片|单个附件最大支持100MB' type='picture-card' maxNum={1} />
          </FormItem>
        </Form>
      </Modal>
  }
})
