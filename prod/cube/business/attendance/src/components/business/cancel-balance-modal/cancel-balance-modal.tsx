import { leaveBalanceCancel } from '@/api/staff-leave'
import { logger } from '@/logger'
import { Form, FormItem, Modal, type FormExpose, Textarea, message } from '@ghcloud/cube-ui'
import dayjs from 'dayjs'
import { defineComponent, reactive, ref, type VNode } from 'vue'

/** 作废假期余额弹窗 */
export const CancelBalanceModal = defineComponent({
  emits: ['success'],
  setup: (props, { emit, expose }) => {
    const modalVisible = ref(false)
    const loading = ref(false)
    const formInstance = ref<FormExpose>()
    const formState = reactive({
      id: '',
      updateName: '',
      effectiveRemark: '',
      effectiveTime: ''
    })
    const type = ref<'cancel' | 'confirm'>('cancel')

    const formRules = {
      effectiveRemark: [{ required: true, message: '请输入作废理由', trigger: 'blur' }],
    }

    const openModal = (res: { id: string;updateName: string;effectiveTime: number;effectiveRemark: string; }, modalType: 'cancel' | 'confirm'): void => {
      type.value = modalType
      formState.id = res.id
      formState.updateName = res.updateName ?? '--'
      formState.effectiveRemark = res.effectiveRemark ?? '--'
      formState.effectiveTime = res.effectiveTime ? dayjs(res.effectiveTime).format('YYYY-MM-DD HH:mm:ss') : '--'
      modalVisible.value = true
    }

    /** 确定按钮回回调 */
    const ok = async (): Promise<void> => {
      if (type.value !== 'cancel') {
        modalVisible.value = false
        return
      }
      formInstance.value?.clearValidate()
      await formInstance.value?.validate()
      try {
        loading.value = true
        await leaveBalanceCancel({ ...formState })
        modalVisible.value = false
        message.success('修改成功')
        emit('success')
      } catch (error) {
        logger.error(error)
      } finally {
        loading.value = false
      }
    }
    const cancel = (): void => {
      modalVisible.value = false
    }

    expose({
      openModal
    })

    return (): VNode =>
      <Modal
        visible={modalVisible.value}
        title={type.value === 'cancel' ? '作废确认' : '作废详情'}
        width='500px'
        destroyOnClose
        onOk={ok}
        onCancel={cancel}
        loading={loading.value}
        okButtonProps={{ style: { display: type.value === 'cancel' ? 'inline-flex' : 'none' } }}
        cancelText={type.value === 'cancel' ? '取消' : '关闭'}
      >
        <Form ref={formInstance} model={formState} labelCol={{ style: { width: '120px' } }} rules={formRules}>
          {
            type.value === 'cancel' &&
              <FormItem label='作废理由' name='effectiveRemark'>
                <Textarea v-model:value={formState.effectiveRemark} maxlength={200} allowClear={false} />
                作废后不可逆，请仔细确认后操作
              </FormItem>
          }
          {
            type.value === 'confirm' &&
              <>
                <FormItem label='作废人'>
                  <span style='margin-left:10px'>{formState.updateName}</span>
                </FormItem>
                <FormItem label='作废时间'>
                  <span style='margin-left:10px'>{formState.effectiveTime}</span>
                </FormItem>
                <FormItem label='作废理由'>
                  <Textarea v-model:value={formState.effectiveRemark} bordered={false} readonly showCount={false} />
                </FormItem>
              </>
          }
        </Form>
      </Modal>
  }
})
