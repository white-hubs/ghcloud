import { debounce } from '@/utils/tool'
import { GLOBAL_SCENE_CODE } from '@ghcloud/cube-file-service'
import { Form, FormItem, Modal, type FormExpose, RadioGroup, Textarea } from '@ghcloud/cube-ui'
import { FileUpload } from '@ghcloud/generic-component'
import { defineComponent, reactive, ref } from 'vue'

/** 批量处理报警弹窗 */
export const BatchHandleAlarmModal = defineComponent({
  emits: ['success'],
  setup: (props, { expose, emit }) => {
    const modalVisible = ref(false)
    const loading = ref(false)
    const formInstance = ref<FormExpose>()
    const formState = reactive({
      alarmHandlerResultRemark: undefined,
      alarmHandlerResult: undefined,
      picUrl: undefined,
      videoUrl: undefined
    })
    const formRules = {
      alarmHandlerResult: [{ required: true, message: '请选择报警确认', trigger: 'blur' }],
      picUrl: [{ required: true, message: '请上传图片', trigger: 'blur' }],
      videoUrl: [{ required: true, message: '请上传视频', trigger: 'blur' }],
      alarmHandlerResultRemark: [{ required: true, message: '请输入描述信息', trigger: 'blur' }],
    }
    const openModal = (): void => {
      formState.alarmHandlerResultRemark = undefined
      formState.alarmHandlerResult = undefined
      formState.picUrl = undefined
      formState.videoUrl = undefined
      recordSelectOptions.value = []
      modalVisible.value = true
      if (formInstance.value) {
        formInstance.value.resetFields()
      }
    }
    const recordSelectOptions = ref<{ label: string; value: string; }[]>([])

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

    return (): JSX.Element =>
      <Modal visible={modalVisible.value} title='处理报警' width='600px' destroyOnClose onOk={ok} onCancel={cancel} loading={loading.value}>
        <Form ref={formInstance} model={formState} labelCol={{ style: { width: '100px' } }} rules={formRules}>
          <FormItem label='报警确认' name='alarmHandlerResult'>
            <RadioGroup
              v-model:value={formState.alarmHandlerResult}
              options={[
                { label: '误报', value: 'ALARM_IMPRACTICAL' },
                { label: '实报', value: 'ALARM_ACTUAL' }
              ]}
            />
          </FormItem>
          <FormItem label='图片' name='picUrl'>
            <FileUpload sceneCode={GLOBAL_SCENE_CODE.deviceCenter} v-model:value={formState.picUrl} customText='请上传图片|单个附件最大支持100MB' type='picture-card' maxNum={1} />
          </FormItem>
          <FormItem label='视频' name='videoUrl'>
            <FileUpload sceneCode={GLOBAL_SCENE_CODE.deviceCenter} v-model:value={formState.videoUrl} customText='请上传视频|单个附件最大支持100MB' type='picture-card' maxNum={1} />
          </FormItem>
          <FormItem label='描述信息' name='alarmHandlerResultRemark'>
            <Textarea placeholder='对报警现场情况进行描述' v-model:value={formState.alarmHandlerResultRemark} />
          </FormItem>
        </Form>
      </Modal>
  }
})
