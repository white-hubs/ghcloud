import { cubeFileService, cubeVisitorManagementService } from '@/api/service'
import { debounce } from 'lodash'
import { Form, FormItem, Input, Modal, Radio, RadioGroup, Spin, Textarea, message, type FormExpose } from '@ghcloud/cube-ui'
import { defineComponent, ref, reactive } from 'vue'
import { FileUpload } from '@ghcloud/generic-component'
import type { BlackDetail, FileState } from '@ghcloud/cube-visitor-management-service'
import { GLOBAL_SCENE_CODE } from '@ghcloud/cube-file-service'

interface Props {
  labelWidth: string;
}

export const AddBlackModel = defineComponent({
  props: {
    labelWidth: {
      type: String,
      default: '80px'
    },
  },
  emits: ['enter'],
  setup (props: Props, { emit, expose }) {
    const submitLoading = ref(false)
    const modalVisible = ref<boolean>(false)
    const formRenderRef = ref<FormExpose>()
    const formState = reactive<BlackDetail>({
      id: undefined,
      sex: undefined,
      phone: '',
      name: '',
      reason: '',
      pictures: [],
      picturePath: ''
    })
    const checkPhone = async (): Promise<void> => {
      if (!formState.phone) {
        return Promise.reject(new Error('请输入手机号'))
      }
      const reg = /^1[3-9]\d{9}$/
      if (!reg.test(formState.phone)) {
        return Promise.reject(new Error('请输入正确的手机号'))
      }
      return Promise.resolve()
    }
    const modalRules = {
      name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
      phone: [{ required: true, validator: checkPhone, trigger: 'blur' }],
      sex: [{ required: true, message: '请选择性别', trigger: 'blur' }],
      pictures: [{ required: true, message: '请上传人员照片', trigger: 'blur' }],
    }
    const handleOk = debounce(async () => {
      formRenderRef.value?.validate().then(async () => {
        try {
          submitLoading.value = true
          const params = {
            ...formState,
            pictures: formState.pictures.length > 0 ? formState.pictures.map(i => i.id).join(',') : undefined,
          }
          await cubeVisitorManagementService.addBlacklist(params)
          message.success('操作成功')
          modalVisible.value = false
          submitLoading.value = false
          emit('enter')
        } catch (error) {
          message.error((error as { errorMessage: string; })?.errorMessage ?? '操作失败')
          submitLoading.value = false
          emit('enter')
        }
      })
    }, 500)
    const infoLoading = ref(false)
    const getInfo = async (id: number): Promise<void> => {
      try {
        infoLoading.value = true
        const res = await cubeVisitorManagementService.getBlackDetail({ id })
        if (res?.pictures && typeof res?.pictures === 'string') {
          const ids = res?.pictures.split(',') ?? []
          if (ids.length > 0) {
            const pictureList = await getFileData(ids)
            Object.assign(formState, {
              ...res,
              pictures: pictureList,
              picturePath: pictureList.map(p => p.path).join(',')
            })
            infoLoading.value = false
          } else {
            Object.assign(formState, { ...res, pictures: [], picturePath: '' })
            infoLoading.value = false
          }
        }
      } catch (error) {
        message.error((error as { errorMessage: string; })?.errorMessage ?? '操作失败')
        infoLoading.value = false
      } finally {
        infoLoading.value = false
      }
    }
    const getFileData = async (ids: string[]): Promise<FileState[]> => {
      const pictureList: FileState[] = []
      for (let i = 0; i < ids.length; i++) {
        const fileInfo: FileState = await cubeFileService.getFileInfo(ids[i] ?? '')
        fileInfo && pictureList.push(fileInfo)
      }
      return pictureList
    }
    const cancel = (): void => {
      modalVisible.value = false
      emit('enter')
      resetFields()
    }

    const openModal = (id: number): void => {
      modalVisible.value = true
      resetFields()
      if (id) {
        formState.id = id
        getInfo(id)
      }
    }
    const resetFields = (): void => {
      formRenderRef.value?.resetFields()
      Object.assign(formState, {
        id: undefined,
        sex: undefined,
        phone: '',
        name: '',
        reason: '',
        pictures: [],
        picturePath: ''
      })
    }
    expose({
      openModal
    })
    return (): JSX.Element =>
      <>
        <Modal
          visible={modalVisible.value}
          title={formState.id ? '编辑黑名单' : '新增黑名单'}
          onOk={handleOk}
          onCancel={cancel}
          confirmLoading={submitLoading.value}
        >
          <Spin spinning={infoLoading.value}>
            <Form model={formState} ref={formRenderRef} rules={modalRules} label-col={{ style: { width: props.labelWidth } }}>
              <FormItem label='姓名' name='name'>
                <Input
                  maxlength={20}
                  style={{ width: '380px' }}
                  v-model:value={formState.name} placeholder='请输入姓名'
                  allowClear
                />
              </FormItem>
              <FormItem label='手机号' name='phone'>
                <Input
                  maxlength={20}
                  style={{ width: '380px' }}
                  v-model:value={formState.phone} placeholder='请输入手机号'
                  allowClear
                />
              </FormItem>
              <FormItem label='性别' name='sex'>
                <RadioGroup v-model:value={formState.sex}>
                  <Radio value='男'>男</Radio>
                  <Radio value='女'>女</Radio>
                </RadioGroup>
              </FormItem>
              <FormItem label='加入原因' name='reason'>
                <Textarea
                  style={{ width: '380px' }}
                  v-model:value={formState.reason} placeholder='请输入加入原因'
                  allowClear
                />
              </FormItem>
              <FormItem label='人员照片' name='pictures'>
                <FileUpload sceneCode={GLOBAL_SCENE_CODE.visitorManagement} v-model:value={formState.pictures} customText='请上传图片|单个附件最大支持100MB' type='picture-card' multiple size={100} />
              </FormItem>
            </Form>
          </Spin>
        </Modal>
      </>
  }
})
