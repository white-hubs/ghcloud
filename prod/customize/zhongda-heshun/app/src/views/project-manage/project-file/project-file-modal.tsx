import { Form, FormItem, message, type FormExpose } from '@ghcloud/cube-ui'
import { FileUpload, useCubeModal } from '@ghcloud/cube-app-design'
import { defineComponent, reactive, ref } from 'vue'
import { cubeZhongdaHeshunService } from '@/api/service'
import { ProjectFileTypeSelect } from '@/components/project-file-type-select/project-file-type-select'
import { GLOBAL_SCENE_CODE } from '@ghcloud/cube-file-service'
import type { OSSFile } from '@ghcloud/cube-app-design/src/business-components/file-upload/file-upload'
import { ProjectSelect } from '@/components/project-select/project-select'

interface Props {
  title: string;
}

export const ProjectFileModal = defineComponent({
  props: ['title'],
  emits: ['enter', 'cancel'],
  setup (props: Props, { emit, expose }) {
    const formRenderRef = ref<FormExpose>()
    const formState = reactive<{
      projectId: string | null;
      fileTypeId: string | null;
      files: OSSFile[];
    }>({
      projectId: null,
      fileTypeId: null,
      files: [],
    })
    const modalRules = {
      projectId: [
        { required: true, message: '请选择项目', trigger: 'blur' },
      ],
      fileTypeId: [
        { required: true, message: '请选择文件类型', trigger: 'blur' },
      ],
      files: [
        { required: true, message: '请上传文件', trigger: 'blur' },
      ],
    }
    const [CubeModal, modalApi] = useCubeModal({
      title: `${props.title}`,
      onConfirm: async () => {
        try {
          modalApi.setState({ confirmLoading: true })
          await formRenderRef.value?.validate()
          const params = {
            projectId: formState.projectId,
            fileTypeId: formState.fileTypeId,
            fileId: formState.files.map((item) => item.id).join(','),
            fileName: formState.files.map((item) => item.name).join(','),
          }
          await cubeZhongdaHeshunService.addProjectFile(params)
          message.success('操作成功')
          emit('enter')
          modalApi.close()
        } catch {
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
    const openModal = (): void => {
      formState.fileTypeId = null
      formState.projectId = null
      formState.files = []
      modalApi.open()
      modalApi.setState({ title: '上传项目资料' })
    }
    expose({
      openModal
    })
    const modalSlots = {
      default: (): JSX.Element => {
        return (
          <div style={{ "max-height": '500px', 'overflow-y': 'auto' }}>
            <Form model={formState} ref={formRenderRef} rules={modalRules} label-col={{ style: { width: '100px' } }}>
              <FormItem label='所属项目' name='projectId'>
                <ProjectSelect v-model:value={formState.projectId} />
              </FormItem>
              <FormItem label='文件类型' name='fileTypeId'>
                <ProjectFileTypeSelect v-model:value={formState.fileTypeId} />
              </FormItem>
              <FormItem label='文件' name='files'>
                <FileUpload
                  sceneCode={GLOBAL_SCENE_CODE.disinfectionproject}
                  v-model:value={formState.files}
                  showText={true}
                  maxCount={1}
                  type='picture-card'
                  size={100}
                  customText='支持jpg,png,svg,doc,docx,xls,xlsx,pptx,pdf格式,单个附件最大支持100MB'
                  typeList={['.jpg', '.png', '.svg', '.doc', '.docx', '.xls', '.xlsx', '.pptx', '.pdf']}
                />
              </FormItem>
            </Form>
          </div>
        )
      }
    }
    return (): JSX.Element => <CubeModal v-slots={modalSlots} />

  }
})