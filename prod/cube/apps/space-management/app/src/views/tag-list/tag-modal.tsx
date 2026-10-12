import { defineComponent, reactive, ref } from 'vue'
import { Form, FormItem, Input, Textarea, message, type FormExpose } from '@ghcloud/cube-ui'
import { FileUpload, useCubeModal } from '@ghcloud/cube-app-design'
import type { OSSFile } from '@ghcloud/generic-component'
import { cubeMdataService } from '@/api/service'
import { GLOBAL_SCENE_CODE } from '@ghcloud/cube-file-service'
import type { AreaTag } from '@ghcloud/cube-mdata-service/src/type'

interface Props {
  title: string;
}
export const TagModal = defineComponent({
  props: ['title'],
  emits: ['enter', 'cancel'],
  setup (props: Props, { emit, expose }) {
    const formRenderRef = ref<FormExpose>()
    const formState = reactive<{
      id: string | undefined;
      name: string | undefined;
      files: OSSFile[] | undefined;
      describe: string | undefined;
    }>({
      id: undefined,
      name: undefined,
      files: undefined,
      describe: undefined,
    })
    const modalRules = {
      name: [{ required: true, message: '请输入标签名称', trigger: 'blur' }],
      files: [{ required: true, message: '请上传标签图标', trigger: 'blur' }],
    }
    const [CubeModal, modalApi] = useCubeModal({
      title: `${props.title}`,
      onConfirm: async () => {
        try {
          await formRenderRef.value?.validate()
          modalApi.setState({ confirmLoading: true })
          const ids = formState.files?.map((item) => item.id) ?? []
          const params = {
            name: formState.name || '',
            icoFileId: ids[0] || '',
            describe: formState.describe || '',
          }
          if (formState.id) {
            await cubeMdataService.updateAreaTag({ id: formState.id, ...params })
          } else {
            await cubeMdataService.addAreaTag(params)
          }
          message.success('操作成功')
          modalApi.close()
          emit('enter')
        } catch (error) {
          const errorFields = (error as { errorFields: unknown; })?.errorFields
          !errorFields && message.error((error as { errorMessage: string; })?.errorMessage ?? '操作失败')
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
    const openModal = (record?: AreaTag): void => {
      modalApi.open()
      for (const key in formState) {
        (formState as Record<string, unknown>)[key] = undefined
      }
      if (record) {
        modalApi.setState({ title: `编辑${props.title}` })
        Object.assign(formState, record)
        if (record.fileVO) formState.files = Array.isArray(record.fileVO) ? record.fileVO as unknown as OSSFile[] : [record.fileVO as unknown as OSSFile]
      } else {
        modalApi.setState({ title: `新增${props.title}` })
      }
    }
    expose({
      openModal
    })
    const modalSlots = {
      default: (): JSX.Element => {
        return (
          <Form model={formState} ref={formRenderRef} rules={modalRules} label-col={{ style: { width: '80px' } }}>
            <FormItem label='标签名称' name='name'>
              <Input v-model:value={formState.name} placeholder='请输入标签名称' />
            </FormItem>
            <FormItem label='标签图标' name='files'>
              <FileUpload sceneCode={GLOBAL_SCENE_CODE.spaceTag} v-model:value={formState.files} showText={true} maxCount={1} type='picture-card' size={100} customText='请上传图片|单个附件最大支持100MB' typeList={['.png', '.jpg', '.jpeg']} />
            </FormItem>
            <FormItem label='标签描述' name='describe'>
              <Textarea v-model:value={formState.describe} placeholder='请输入标签描述' maxlength={200} />
            </FormItem>
          </Form>
        )
      }
    }
    return (): JSX.Element => <CubeModal v-slots={modalSlots} />
  }
})
