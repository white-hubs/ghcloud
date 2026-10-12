import { defineComponent, reactive, ref, watch, type PropType } from 'vue'
import { Modal, Form, FormItem, Textarea, RadioGroup, message } from '@ghcloud/cube-ui'
import { FileUpload } from '@ghcloud/cube-app-design'
import type { AcceptType } from '@/api/supervise'
import type { FeedbackDetailVo } from '@ghcloud/cube-small-engineering-service'
import { GLOBAL_SCENE_CODE } from '@ghcloud/cube-file-service'
import { cubeSmallEngineeringService } from '@/api/server'
export interface OSSFile {
  businessKey: string | null;
  id: string;
  name: string;
  path: string;
  refCount: number;
  size: number;
  suffix: string;
  type: string;
}
export default defineComponent({
  name: 'FeedbackModel',
  props: {
    edit: {
      type: Boolean,
      default: true
    },
    visible: {
      type: Boolean,
      default: false
    },
    detail: {
      type: Object as PropType<FeedbackDetailVo>,
      default: {}
    },
    checkInfo: {
      type: Object as PropType<{
        scheduleId: string;
        schedule: number;
      }>,
      default: {}
    }
  },
  emits: ['cancel', 'update:visible', 'ok'],
  setup: (props, { emit }) => {
    const feedbackFrom = reactive<AcceptType>({
      scheduleId: '',
      acceptanceResult: 'QUALIFIED',
      description: '',
      fileIds: [],

    })
    const files = ref<OSSFile[]>([])
    const isAbnormal = ref('false')

    watch(() => props.visible, (n) => {
      if (n) {
        Object.assign(feedbackFrom, {
          scheduleId: '',
          acceptanceResult: 'QUALIFIED',
          description: '',
          fileIds: []
        })
        files.value = []
        if (props.detail.acceptanceResult) {
          feedbackFrom.acceptanceResult = props.detail.acceptanceResult
          files.value = props.detail.problemFileList
          feedbackFrom.description = props.detail.description
        }
      }
    })
    const formRef = ref<any>()
    const cancel = (): void => {
      formRef.value.resetFields()
      files.value = []
      emit('update:visible', false)
      emit('cancel')
    }
    const ok = async (): Promise<void> => {
      await getProjectIsAbnormal()
      feedbackFrom.scheduleId = props.checkInfo.scheduleId
      feedbackFrom.fileIds = files.value.map((item) => item.id)
      formRef.value.validateFields()
      if (!props.edit) {
        emit('update:visible', false)
        files.value = []
        feedbackFrom.acceptanceResult = 'QUALIFIED'
        feedbackFrom.description = ''
        return
      }
      emit('ok', feedbackFrom)
    }

    const getProjectIsAbnormal = async (): Promise<void> => {
      try {
        isAbnormal.value = await cubeSmallEngineeringService.projectIsAbnormal(props.checkInfo.scheduleId)
       
        if (isAbnormal.value == 'true'){
          message.warning('该工程在巡查中存在过异常，请注意异常是否已处理完成')
        }
      } catch {}
    }

    const labelCol = { style: { width: '100px' } }
    const rules = {
      acceptanceResult: [
        { required: true, message: '请选择验收结果', trigger: 'change' },

      ],

    }

    return (): JSX.Element =>
      <>
        <Modal visible={props.visible} width='50%' title='验收' onCancel={cancel} onOk={ok}>
          <Form model={feedbackFrom} rules={rules} ref={formRef} label-col={labelCol}>
            <FormItem label='验收结果:' name='acceptanceResult'>
              <RadioGroup
                readonly={!props.edit}
                v-model:value={feedbackFrom.acceptanceResult} options={[
                  { label: '验收合格', value: 'QUALIFIED' },
                  { label: '验收不合格', value: 'DISQUALIFICATION' },
                ]}
              />
            </FormItem>
            <FormItem label='验收说明:'>
              <Textarea maxlength={500} readonly={!props.edit} v-model:value={feedbackFrom.description} />
            </FormItem>
            <FormItem label='文件上传:'>
              <FileUpload sceneCode={GLOBAL_SCENE_CODE.smallEngineering} readonly={!props.edit} multiple v-model:value={files.value} maxCount={5} type='picture-card' customText='支持上传图片（.png/.jpeg/.jpg）、文档（.pdf,doc,docx）表格(xlsx‌，xls),最大为300MB' typeList={['.pdf', '.png', '.jpg', '.jpeg', '.xlsx', '.xls', '.doc', '.docx']} />
            </FormItem>

          </Form>
        </Modal>
      </>
  }
})
