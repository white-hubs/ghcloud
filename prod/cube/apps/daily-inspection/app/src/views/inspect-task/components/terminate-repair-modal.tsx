import { defineComponent, reactive, ref } from 'vue'
import { Form, FormItem, Textarea, message, type FormExpose, Upload } from '@ghcloud/cube-ui'
import { useCubeModal } from '@ghcloud/cube-app-design'
import { cubeDailyInspectionService } from '@/api/server'
import type { FileVO } from '@ghcloud/cube-daily-inspection-service'

interface Props {
  title?: string;
}

export const TerminateRepairModal = defineComponent({
  props: {
    title: {
      type: String,
      default: '终止修复'
    }
  },
  emits: ['enter', 'cancel'],
  setup (props: Props, { emit, expose }) {
    const formRenderRef = ref<FormExpose>()
    const formState = reactive<{
      id: string | undefined;
      content: string | undefined;
      fileList: FileVO[];
    }>({
      id: undefined,
      content: undefined,
      fileList: []
    })
    
    const modalRules = {
      content: [{ required: true, message: '请输入终止修复原因', trigger: 'blur' }]
    }
    
    const [CubeModal, modalApi] = useCubeModal({
      title: `${props.title}`,
      onConfirm: async () => {
        try {
          modalApi.setState({ confirmLoading: true })
          await formRenderRef.value?.validate()
          await cubeDailyInspectionService.cancelRepairInspectTask({
            taskIdList: formState.id ? [formState.id] : [],
            content: formState.content || '',
            fileIdList: formState.fileList?.map(e => e.id || '')
          })
          
          message.success('操作成功')
          modalApi.close()
          emit('enter')
        } catch (error) {
          message.error((error as { errorMessage: string; })?.errorMessage ?? '操作失败')
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
    
    const openModal = (record?: { id: string; }): void => {
      modalApi.open()
      formState.id = undefined
      formState.content = undefined
      formState.fileList = []
      
      if (record?.id) {
        formState.id = record.id
      }
    }
    
    expose({
      openModal
    })
    
    const handleUploadChange = (info: { fileList: FileVO[] }): void => {
      formState.fileList = info.fileList.map(file => ({
        id: file.id || '',
        name: file.name || '',
        path: file.path || ''
      }))
    }
    
    const modalSlots = {
      default: (): JSX.Element => {
        return (
          <Form model={formState} ref={formRenderRef} rules={modalRules} label-col={{ style: { width: '80px' } }}>
            <FormItem label='终止原因' name='content'>
              <Textarea v-model:value={formState.content} placeholder='请输入终止修复原因' maxlength={200} />
            </FormItem>
            <FormItem label='附件' name='fileList'>
              <Upload
                v-model:fileList={formState.fileList}
                listType="picture-card"
                accept="image/*"
                onChange={handleUploadChange}
              >
                <div>
                  <div style="margin-top: 8px">+</div>
                </div>
              </Upload>
            </FormItem>
          </Form>
        )
      }
    }
    
    return (): JSX.Element => <CubeModal v-slots={modalSlots} />
  }
})