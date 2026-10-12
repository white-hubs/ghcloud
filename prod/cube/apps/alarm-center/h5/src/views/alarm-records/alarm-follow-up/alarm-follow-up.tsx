import { defineComponent, onMounted, reactive, ref } from 'vue'
import { Field, Button, showNotify, Form, type FormInstance } from 'vant'
import styles from './index.module.less'
import { UploadImage } from '../../../components/upload-image'
import type { FileVOState } from '@ghcloud/cube-alarm-center-service/src/types/alarm-center'
import { cubeAlarmCenterService } from '@/api/server'
import { CubeNavBar } from '@ghcloud/cube-app-generic-component'
import 'vant/es/notify/style'
import { useGlobalRouter } from '../../../hook/use-global-router'
export const AlarmFollowUp = defineComponent({
  setup: () => {
    const { route, router } = useGlobalRouter()
    const formRef = ref<FormInstance>()
    const state = reactive<{
      showPicker: boolean;
      showReasonPicker: boolean;
      loading: boolean;
      alarmReasonText: string;
      formState: {
        content: string;
        files: FileVOState[];
      };
      alarmHandlerResultText: string;
      alarmReasonOptions: { text: string;value: string; }[];
    }>({
      showPicker: false,
      showReasonPicker: false,
      loading: false,
      alarmHandlerResultText: '',
      alarmReasonOptions: [],
      alarmReasonText: '',
      formState: {
        content: '',
        files: []
      },
    })
    const filedUploadSlots = {
      input: (): JSX.Element=> {
        return <UploadImage v-model:fileList={state.formState.files} />
      }
    }
    onMounted(() => {
      document.title = '报警跟进'
    })
    const handleSubmit = async (): Promise<void> => {
      await formRef.value?.validate()
      try {
        state.loading = true
        await cubeAlarmCenterService.createAlarmFollow({
          id: route.query.id as string,
          ...state.formState,
          files: state.formState.files.map((item) => item.id) as unknown as string[]
        })
        showNotify({ type: 'success', message: '提交成功' })
        router.back()
      } catch (error) {
        const { errorMessage } = (error as { toJSON: () => { errorMessage: string; }; }).toJSON()
        showNotify({ type: 'danger', message: errorMessage || '请求失败' })
      } finally {
        state.loading = false
      }
    }
    return (): JSX.Element=> (
      <div class={styles.container}>
        <CubeNavBar showBack title='报警跟进' />
        <div class={styles.form}>
          <Form ref={formRef}>
            <Field label='跟进信息' readonly required abel-width='200px' />
            <Field
              v-model={state.formState.content}
              rules={[{ required: true, message: '请输入跟进记录信息' }]}
              rows='4'
              autosize
              name='content'
              placeholder='请输入描述信息'
              type='textarea'
              maxlength='150'
            />
            <Field label='上传附件' readonly />
            <Field v-slots={filedUploadSlots} readonly />
          </Form>
        </div>
        <div class={styles.footer}>
          <Button round block loading={state.loading} type='primary' onClick={handleSubmit}>提交</Button>
        </div>
      </div>
    )
  }
})
