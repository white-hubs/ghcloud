import { defineComponent, reactive, ref } from 'vue'
import { Modal, Form, FormItem, DatePicker, Textarea, message } from '@ghcloud/cube-ui'
import { GUpload } from '@/components/common/upload'
import { handlePending } from '@/api/alarm'
export const PendingModal = defineComponent({
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
      state.formState.estimatedProcessTime = ''
      state.formState.remark = ''
      state.formState.fileVOS = []
      uploadRef.value?.clearAll()
      emit('update:visible', false)
    }
    const formRef = ref<{ validate: () => Promise<void>; }>()
    const state = reactive({
      formState: {
        estimatedProcessTime: '',
        remark: '',
        fileVOS: [],
      },
      loading: false
    })
    const rules = {
      estimatedProcessTime: [{ required: true, message: '请选择处理时间' }],
    }
    const handleOk = async (): Promise<void> => {
      state.loading = true
      try {
        await formRef.value?.validate()
        await handlePending({ id: props.selectRow, ...state.formState })
        state.formState.estimatedProcessTime = ''
        state.formState.remark = ''
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
      <Modal v-model:visible={props.visible} onCancel={handleCancel} onOk={handleOk} title='挂起' width='600px' confirmLoading={state.loading}>
        <Form
          ref={formRef}
          labelCol={{ span: 5 }}
          rules={rules}
          model={state.formState}
          wrapperCol={{ span: 18 }}
        >
          <FormItem label='预计处理时间:' name='estimatedProcessTime'>
            <DatePicker v-model:value={state.formState.estimatedProcessTime} showTime valueFormat='YYYY-MM-DD HH:mm' format='YYYY-MM-DD HH:mm' />
          </FormItem>
          <FormItem label='挂起原因:' name='remark'>
            <Textarea v-model:value={state.formState.remark} placeholder='请输入挂起原因' />
          </FormItem>
          <FormItem label='图片:'>
            <GUpload v-model:value={state.formState.fileVOS} ref={uploadRef} max={3} />
          </FormItem>
        </Form>
      </Modal>
    )
  }
})
