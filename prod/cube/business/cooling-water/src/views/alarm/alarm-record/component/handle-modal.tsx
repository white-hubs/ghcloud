import { defineComponent, reactive, ref } from 'vue'
import { Modal, Form, FormItem, Textarea, Select, message } from '@ghcloud/cube-ui'
import { GUpload } from '@/components/common/upload'
import { alarmHandler } from '@/api/alarm'
import { alarmHandlerResultOptions } from '../index.i'
export const HandleModal = defineComponent({
  props: {
    visible: {
      type: Boolean,
      default: () => false
    },
    selectRow: {
      type: String,
      default: () => ''
    }
  },
  emits: ['update:visible', 'getList', 'update:selectRow'],
  setup: (props, { emit }) => {
    const uploadRef = ref<{ clearAll: () => void; }>()
    const handleCancel = (): void => {
      state.formState.alarmHandlerResult = ''
      state.formState.alarmHandlerResultRemark = ''
      state.formState.fileVOS = []
      uploadRef.value?.clearAll()
      emit('update:visible', false)
    }
    const formRef = ref<{ validate: () => Promise<void>; }>()
    const state = reactive({
      formState: {
        alarmHandlerResult: '',
        alarmHandlerResultRemark: '',
        fileVOS: [],
      },
      loading: false
    })
    const rules = {
      alarmHandlerResult: [{ required: true, message: '请选择处理结果' }],
    }
    const handleOk = async (): Promise<void> => {
      state.loading = true
      try {
        await formRef.value?.validate()
        await alarmHandler({ id: props.selectRow, ...state.formState })
        state.formState.alarmHandlerResult = ''
        state.formState.alarmHandlerResultRemark = ''
        state.formState.fileVOS = []
        uploadRef.value?.clearAll()
        emit('update:visible', false)
        emit('update:selectRow', '')
        emit('getList')
        message.success('操作成功')
      } catch {
      } finally {
        state.loading = false
      }
    }
    return (): JSX.Element => (
      <Modal v-model:visible={props.visible} onCancel={handleCancel} onOk={handleOk} title='处理' width='600px' confirmLoading={state.loading}>
        <Form
          ref={formRef}
          labelCol={{ span: 5 }}
          rules={rules}
          model={state.formState}
          wrapperCol={{ span: 18 }}
        >
          <FormItem label='处理结果:' name='alarmHandlerResult'>
            <Select options={alarmHandlerResultOptions} v-model:value={state.formState.alarmHandlerResult} />
          </FormItem>
          <FormItem label='描述信息:'>
            <Textarea v-model:value={state.formState.alarmHandlerResultRemark} placeholder='请输入描述信息' />
          </FormItem>
          <FormItem label='图片:'>
            <GUpload v-model:value={state.formState.fileVOS} ref={uploadRef} max={3} />
          </FormItem>
        </Form>
      </Modal>
    )
  }
})
