import { Form, FormItem, Input, InputNumber } from '@ghcloud/cube-ui'
import { defineComponent, onMounted, ref } from 'vue'
import { FileUpload } from '@ghcloud/generic-component'
import { GLOBAL_SCENE_CODE } from '@ghcloud/cube-file-service'
import type { CompanyVO } from '@ghcloud/cube-operating-room-service'
import { cubeFileService } from '@/api/service'
import { storeDetection } from '@/store/detection'
import type { FileVOState } from '@ghcloud/cube-protocol'

type PartialCompanyVO = {
  [P in keyof CompanyVO]?: CompanyVO[P] | undefined;
};

interface Props {
  labelWidth: string;
}
export const BaseInfo = defineComponent({
  props: {
    labelWidth: {
      type: String,
      default: '80px'
    },
  },
  setup (props: Props, { expose }) {
    const detectionStore = storeDetection()
    const formRef = ref()
    const formState = ref<PartialCompanyVO>({
      calibrationExpireDay: undefined,
      detectionCompany: undefined,
      detectionPhone: undefined,
      detectionAddress: undefined,
      detectionStatement: '检测声明',
      detectionStampFileId: null,
      fileVO: undefined,
      fileVOS: [],
    })
    onMounted(async () => {
      formState.value = detectionStore.company || {}
      if (formState.value.detectionStampFileId) {
        const res = await cubeFileService.getFileInfo(formState.value.detectionStampFileId)
        formState.value.fileVO = res as FileVOState
        formState.value.fileVOS = [res as FileVOState]
      }
    })
    const modalRules = {
      calibrationExpireDay: [{ required: true, message: '请输入校准期', trigger: 'blur' }],
      detectionCompany: [{ required: true, message: '请输入检测公司', trigger: 'blur' }],
      detectionPhone: [{ required: true, message: '请输入检测电话', trigger: 'blur' }],
      detectionAddress: [{ required: true, message: '请输入检测地址', trigger: 'blur' }],
      detectionStampFileId: [{ required: true, message: '请上传印章', trigger: 'blur' }],
    }
    const fileUploadRef = ref<{ triggerUpload: () => void;clearAll: () => void; }>()

    const validate = async (): Promise<CompanyVO> => {
      await formRef.value.validate()
      return formState.value as CompanyVO
    }
    const reset = (): void => {
      formRef.value?.resetFields()
      resetForm()
    }
    const resetForm = (): void => {
      formState.value = {
        tenantName: undefined,
        calibrationExpireDay: undefined,
        detectionCompany: undefined,
        detectionPhone: undefined,
        detectionAddress: undefined,
        detectionStatement: '检测声明',
        fileVO: undefined,
        fileVOS: [],
      }
      fileUploadRef.value?.clearAll()
    }
    const handleUpload = async (file: Blob): Promise<void> => {
      try {
        const res = await cubeFileService.uploadFile({
          file: file,
          businessKey: 'mdata',
          sceneCode: GLOBAL_SCENE_CODE.medicalCleanliness ?? ''
        })
        formState.value.detectionStampFileId = res?.id
        formState.value.fileVO = res as FileVOState
        formState.value.fileVOS = [res as FileVOState]
      } catch {
        fileUploadRef.value?.clearAll()
      }
    }
    expose({
      validate,
      formState,
      reset
    })
    return (): JSX.Element =>
      <div style={{ width: '500px' }}>
        <Form model={formState.value} ref={formRef} rules={modalRules} label-col={{ style: { width: props.labelWidth } }}>
          <FormItem label='校准期' name='calibrationExpireDay'>
            <InputNumber placeholder='请输入校准期' v-model:value={formState.value.calibrationExpireDay} min={1} max={99999} addon-after='天' />
          </FormItem>
          <FormItem label='检测公司' name='detectionCompany'>
            <Input placeholder='请输入检测公司' v-model:value={formState.value.detectionCompany} maxlength={30} />
          </FormItem>
          <FormItem label='检测电话' name='detectionPhone'>
            <Input placeholder='请输入检测电话' v-model:value={formState.value.detectionPhone} />
          </FormItem>
          <FormItem label='检测地址' name='detectionAddress'>
            <Input placeholder='请输入检测地址' v-model:value={formState.value.detectionAddress} maxlength={50} />
          </FormItem>
          {/* <FormItem label='检测声明' name='detectionStatement'>
            <Textarea placeholder='请输入检测声明' v-model:value={formState.value.detectionStatement} maxlength={200} />
          </FormItem> */}
          <FormItem label='印章' name='detectionStampFileId'>
            <FileUpload
              ref={fileUploadRef}
              showtext
              sceneCode={GLOBAL_SCENE_CODE.medicalCleanliness}
              multiple
              maxCount={1}
              customupload
              onFile={async (file) => {
                if (file.size) {
                  await handleUpload(file)
                }
              }}
              type='picture'
              dragger
              v-model:value={formState.value.fileVOS}
              customText='支持jpg,jpeg,png格式,单个附件最大支持100MB'
              typelist={['.jpg', '.jpeg', '.png']}
            />
          </FormItem>
        </Form>
      </div>
  }
})
