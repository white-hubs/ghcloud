

import { defineComponent, reactive, ref, watch, type PropType } from 'vue'
import { Modal, Form, FormItem, Textarea, InputNumber, type FormInstance } from '@ghcloud/cube-ui'
import type { ScheduleType } from '@/api/supervise'
import type { FeedbackDetailVo, OSSFile } from '@ghcloud/cube-small-engineering-service'
import { FileUpload } from '@ghcloud/cube-app-design'
import { GLOBAL_SCENE_CODE } from '@ghcloud/cube-file-service'
export default defineComponent({
  name: 'FeedbackModel',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    detail: {
      type: Object as PropType<FeedbackDetailVo>,
      default: {}
    },
    feedbackInfo: {
      type: Object as PropType<{
        scheduleId: string;
        schedule: number;
      }>,
      default: {}
    },
    edit: {
      type: Boolean,
      default: true
    },
    loading: {
      type: Boolean,
      default: false
    }
  },
  emits: ['cancel', 'update:visible', 'ok'],
  setup: (props, { emit }) => {
    const feedbackFrom = reactive<ScheduleType>({
      scheduleId: '',
      schedule: 0,
      description: '',
      fileIds: [],
      hasProblem: true,
      problemDes: '',
      problemFileIds: []
    })
    const files = ref<OSSFile[]>([])
    const formRef = ref<FormInstance>()
    const cancel = (): void => {
      formRef.value?.resetFields()
      files.value = []
      emit('update:visible', false)
      emit('cancel')
    }
    const ok = async (): Promise<void> => {
      feedbackFrom.scheduleId = props.feedbackInfo.scheduleId
      feedbackFrom.fileIds = files.value.map(item => item.id)
      if (!props.edit) {
        emit('update:visible', false)
        files.value = []
        feedbackFrom.hasProblem = true
        feedbackFrom.description = ''
        return
      }
      await formRef.value?.validate()
      emit('ok', feedbackFrom)
    }
    const min = ref(0)
    watch(() => props.visible, (n) => {
      if (n) {
        files.value = []
        if (props.detail.id) {
          Object.assign(feedbackFrom, {
            ...props.detail,
          })
          files.value = props.detail.problemFileList
        }

        if (props.feedbackInfo.scheduleId) {
          min.value = props.feedbackInfo.schedule
          feedbackFrom.schedule = props.feedbackInfo.schedule
        }
      }
    })
    const labelCol = { style: { width: '120px' } }
    const rules = {
      schedule: [
        { required: true, message: '请输入当前按工程进度', trigger: 'change' },

      ],
      problemDes: [{ required: true, message: '请输入问题描述', trigger: 'change' }],
      fileIds: [{ type: 'array', required: true, message: '请上传文件', trigger: 'change' }]

    }
    const numbechange = (value: number): void => {
      const number = min.value
      if (value < number) {
        feedbackFrom.schedule = number
      } else {
        feedbackFrom.schedule = value
      }
    }
    return (): JSX.Element =>
      <>
        <Modal visible={props.visible} title='反馈' confirmLoading={props.loading} width='50%' onCancel={cancel} onOk={ok}>
          <Form model={feedbackFrom} rules={rules} ref={formRef} label-col={labelCol}>
            <FormItem label='当前按工程进度' name='schedule'>
              <InputNumber readonly={!props.edit} min={min.value} max={100} v-model:value={feedbackFrom.schedule} onChange={numbechange} />
            </FormItem>
            <FormItem label='反馈描述:'>
              <Textarea readonly={!props.edit} maxlength={500} v-model:value={feedbackFrom.description} />
            </FormItem>
            <FormItem label='文件上传:' name='fileIds'>
              <FileUpload readonly={!props.edit} sceneCode={GLOBAL_SCENE_CODE.smallEngineering} multiple v-model:value={files.value} maxCount={5} type='picture-card' customText='支持上传图片（.png/.jpeg/.jpg）、文档（.pdf,doc,docx）表格(xlsx‌，xls),最大为300MB' typeList={['.pdf', '.png', '.jpg', '.jpeg', '.xlsx', '.xls', '.doc', '.docx']} />
            </FormItem>
          </Form>
        </Modal>
      </>
  }
})
