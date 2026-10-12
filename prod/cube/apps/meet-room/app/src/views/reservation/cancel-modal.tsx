import { Form, FormItem, Modal, Textarea, message, type FormExpose } from '@ghcloud/cube-ui'
import { defineComponent, ref, reactive, computed, watch } from 'vue'
import type { AppointmentVo } from '@ghcloud/cube-meet-room-service'
import { cubeMeetRoomService } from '@/api/service'
import { useFieldRequired } from '@/hook/use-field-required'

interface Props {
  labelWidth: string;
  title: string;
}
export const CancelModal = defineComponent({
  props: {
    labelWidth: {
      type: String,
      default: '80px'
    },
    title: {
      type: String,
      default: '取消会议'
    },
  },
  emits: ['enter', 'cancel'],
  setup (props: Props, { emit, expose }) {
    const submitLoading = ref(false)
    const modalVisible = ref(false)
    const formRenderRef = ref<FormExpose>()
    const formState = reactive<{
      bookId: string | undefined;
      cancelReason: string | undefined;
    }>({
      bookId: undefined,
      cancelReason: undefined,
    })
    
    const { checkFieldRequired, checkFieldHidden, loadFieldConfig, isFieldConfigLoaded } = useFieldRequired()
    loadFieldConfig()
    
    const isCancelReasonVisible = computed(() => !checkFieldHidden('cancelReason'))
    
    const createModalRules = () => ({
      cancelReason: [{ required: checkFieldRequired('cancelReason'), message: '请输入取消理由', trigger: 'blur' }],
    })
    
    const modalRules = reactive(createModalRules())
    
    watch(isFieldConfigLoaded, (loaded) => {
      if (loaded) {
        Object.assign(modalRules, createModalRules())
      }
    })
    
    const handleOk = async (): Promise<void> => {
      await formRenderRef.value?.validate()
      try {
        submitLoading.value = true
        const params: { cancelReason?: string; isCancel: boolean; } = {
          isCancel: true,
        }
        
        if (isCancelReasonVisible.value) {
          params.cancelReason = formState.cancelReason || ''
        }
        
        await cubeMeetRoomService.cancelBookRoom(formState.bookId || '', params)
        message.success('操作成功')
        modalVisible.value = false
        emit('enter')
      } catch {
      } finally {
        submitLoading.value = false
      }
    }
    const cancel = (): void => {
      modalVisible.value = false
      emit('enter')
      formRenderRef.value?.resetFields()
    }
    const openModal = async (record?: AppointmentVo): Promise<void> => {
      formRenderRef.value?.resetFields()
      formState.bookId = record?.bookId ?? ''
      modalVisible.value = true
    }
    expose({
      openModal
    })
    return (): JSX.Element =>
      <>
        <Modal
          visible={modalVisible.value}
          title='取消会议'
          onOk={handleOk}
          onCancel={cancel}
          confirmLoading={submitLoading.value}
          width='600px'
        >
          <div style={{ fontSize: '15px', marginBottom: '20px', textAlign: 'center' }}>确定取消当前会议室的预约吗？</div>
          <Form model={formState} ref={formRenderRef} rules={modalRules} label-col={{ style: { width: props.labelWidth } }}>
            {isCancelReasonVisible.value && (
              <FormItem label='取消理由' name='cancelReason'>
                <Textarea v-model:value={formState.cancelReason} placeholder='请输入取消理由' maxlength={200} rows={2} allowClear showCount />
              </FormItem>
            )}
          </Form>
        </Modal>
      </>
  }
})
