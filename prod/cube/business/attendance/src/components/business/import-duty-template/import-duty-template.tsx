import { staffDutyImport } from '@/api/scheduling-manage'
import { logger } from '@/logger'
import { Button, Form, FormItem, Modal, type FormExpose, DatePicker, Upload, message } from '@ghcloud/cube-ui'
import dayjs from 'dayjs'
import { defineComponent, reactive, ref, type VNode } from 'vue'

/** 导入值班 */
export const ImportDutyTemplate = defineComponent({
  emits: ['success'],
  setup: (props, { emit }) => {
    const modalVisible = ref(false)
    const loading = ref(false)
    const formInstance = ref<FormExpose>()
    const formState = reactive<{
      month: string;
      fileList: File[];
    }>({
      month: '',
      fileList: []
    })
    const checkFile = async (): Promise<void> => {
      if (!formState.fileList.length) {
        return Promise.reject(new Error('请上传模板'))
      }
      return Promise.resolve()
    }
    const formRules = {
      month: [{ required: true, message: '请选择月份', trigger: 'blur' }],
      fileList: [{ required: true, validator: checkFile, trigger: 'blur' }]
    }
    const openModal = (): void => {
      formState.month = ''
      modalVisible.value = true
    }

    /** 确定按钮回回调 */
    const ok = async (): Promise<void> => {
      formInstance.value?.clearValidate()
      await formInstance.value?.validate()

      const formData = new FormData()
      formData.append('file', formState.fileList[0])
      formData.append('month', formState.month)
      try {
        loading.value = true
        const formData = new FormData()
        formData.append('file', formState.fileList[0])
        formData.append('yearMonth', dayjs(formState.month).format('YYYY-MM'))
        await staffDutyImport(formData)
        modalVisible.value = false
        message.success('导入成功')
        emit('success', formState.month)
      } catch (error) {
        logger.error(error)
      } finally {
        loading.value = false
      }
    }
    const cancel = (): void => {
      modalVisible.value = false
    }

    const beforeUpload = (file: File): boolean => {
      formState.fileList = [file]
      return false
    }
    return (): VNode=> (
      <>
        <Button type='primary' style='margin-left:10px' onClick={openModal} loading={loading.value}>导入值班表</Button>
        <Modal visible={modalVisible.value} title='导入' width='500px' destroyOnClose onOk={ok} onCancel={cancel} loading={loading.value}>
          <Form ref={formInstance} model={formState} labelCol={{ style: { width: '100px' } }} rules={formRules}>
            <FormItem label='月份' name='month'>
              <DatePicker v-model:value={formState.month} picker='month' />
            </FormItem>
            <FormItem label='模板' name='fileList'>
              <Upload
                maxCount={1}
                beforeUpload={beforeUpload}
                remove={() => {
                  formState.fileList.length = 0
                }}
              >
                <Button type='primary' shape='round' class='cube-ui-file-upload-btn'>上传附件</Button>
              </Upload>
            </FormItem>
          </Form>
        </Modal>
      </>
    )
  }
})
