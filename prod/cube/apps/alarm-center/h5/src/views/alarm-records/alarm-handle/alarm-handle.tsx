import { computed, defineComponent, onMounted, reactive, ref } from 'vue'
import { Field, Popup, Picker, Button, showNotify, Form, type FormInstance } from 'vant'
import styles from './index.module.less'
import { UploadImage, type UploadConfig } from '../../../components/upload-image'
import { cubeAlarmCenterService, cubeDictionaryService } from '../../../api/server'
import type { FileVOState } from '@ghcloud/cube-alarm-center-service/src/types/alarm-center'
import { CubeNavBar } from '@ghcloud/cube-app-generic-component'
import 'vant/es/notify/style'
import { useGlobalRouter } from '../../../hook/use-global-router'
const dictCodeSuffix = '_ALARM_HANDLER_SUBMIT_CONFIG'
const code = 'uploadPicConfig'

export const AlarmHandle = defineComponent({
  setup: () => {
    const { router, route } = useGlobalRouter()
    const formRef = ref<FormInstance>()
    const state = reactive<{
      showPicker: boolean;
      showReasonPicker: boolean;
      loading: boolean;
      alarmReasonText: string;
      requirePic: boolean;
      formState: {
        alarmHandlerResult: string;
        alarmHandlerResultRemark: string;
        alarmReason: {
          id: string;
        };
        fileVOS: FileVOState[];
      };
      uploadConfig: UploadConfig;
      fileIds: string;
      alarmHandlerResultText: string;
      alarmReasonOptions: { text: string;value: string; }[];
    }>({
      showPicker: false,
      showReasonPicker: false,
      fileIds: '',
      uploadConfig: {
        uploadMethod: [],
        watermark: [],
      },
      loading: false,
      alarmHandlerResultText: '',
      alarmReasonOptions: [],
      alarmReasonText: '',
      requirePic: false,
      formState: {
        alarmHandlerResult: '',
        alarmHandlerResultRemark: '',
        alarmReason: {
          id: ''
        },
        fileVOS: []
      },
    })
    const columns = [
      { text: '实报', value: 'ALARM_ACTUAL' },
      { text: '误报', value: 'ALARM_IMPRACTICAL' },
    ]
    const filedUploadSlots = {
      input: (): JSX.Element=> {
        return <UploadImage uploadConfig={state.uploadConfig} v-model:fileList={state.formState.fileVOS} />
      }
    }
    const getAlarmReasonOptions = async (): Promise<void> => {
      const result = await cubeAlarmCenterService.getAlarmReasons()
      state.alarmReasonOptions = result.map(item => {
        return {
          text: item.reason,
          value: item.id
        }
      })
    }
    onMounted(() => {
      state.alarmHandlerResultText = columns[0].text
      state.formState.alarmHandlerResult = columns[0].value
      document.title = '报警处理'
      getAlarmReasonOptions()
      getAlarmHandleConfig()
    })
    const handleSubmit = async (): Promise<void> => {
      state.fileIds = state.formState.fileVOS.map(item => item.id).join(',')
      await formRef.value?.validate()
      try {
        state.loading = true
        await cubeAlarmCenterService.handleAlarm(route.query.id as string, state.formState)
        showNotify({ type: 'success', message: '提交成功' })
        router.back()
      } catch (error) {
        const { errorMessage } = (error as { toJSON: () => { errorMessage: string; }; }).toJSON()
        showNotify({ type: 'danger', message: errorMessage || '请求失败' })
      } finally {
        state.loading = false
      }
    }
    // 获取图片是否必填配置
    const getAlarmHandleConfig = async (): Promise<void> => {
      try {
        const appDictCode = route.query.appCode + dictCodeSuffix;
        const config = await cubeDictionaryService.getDictionaryByItem({
          itemCode: appDictCode,
          code
        })
        if (config.length === 0) return
        const variable = JSON.parse(config[0].variable)
        state.requirePic = !!variable.requirePic
        state.uploadConfig = variable
      } catch (error) {
        const { errorMessage } = (error as { toJSON: () => { errorMessage: string; }; }).toJSON()
        showNotify({ type: 'danger', message: errorMessage || '请求失败' })
      }
    }
    const picRules = computed(() => {
      return state.requirePic ? [{ required: state.requirePic, message: '请上传图片' }] : []
    })
    return (): JSX.Element => (
      <div class={styles.container}>
        <CubeNavBar showBack title='报警处理' />
        <div class={styles.form}>
          <Form ref={formRef} required='auto'>
            <Field
              v-model={state.alarmHandlerResultText}
              label='处理结果' isLink
              rules={[{ required: true, message: '请选择处理结果' }]}
              readonly
              onClick={() => {
                state.showPicker = true
              }}
            />
            <Field
              v-model={state.alarmReasonText}
              label='报警原因' isLink
              placeholder='点击选择报警原因'
              rules={[{ required: true, message: '请选择报警原因' }]}
              readonly
              onClick={() => {
                state.showReasonPicker = true
              }}
            />
            <Field
              v-model={state.formState.alarmHandlerResultRemark}
              rows='4'
              label='描述信息'
              autosize
              label-align='top'
              placeholder='请输入描述信息'
              type='textarea'
              maxlength='50'
            />
            <Field
              v-model={state.fileIds}
              label='上传附件'
              label-align='top'
              name='fileVOS'
              rules={picRules.value}
              v-slots={filedUploadSlots}
              readonly
            />
          </Form>
        </div>
        <div class={styles.footer}>
          <Button round block type='primary' loading={state.loading} onClick={handleSubmit}>提交</Button>
        </div>
        <Popup v-model:show={state.showPicker} round position='bottom'>
          <Picker
            title='处理结果' columns={columns} onConfirm={({ selectedOptions }: { selectedOptions: { text: string;value: string; }[]; }) => {
              state.alarmHandlerResultText = selectedOptions[0].text
              state.formState.alarmHandlerResult = selectedOptions[0].value
              state.showPicker = false
            }} onCancel={() => {
              state.showPicker = false
            }}
          />
        </Popup>
        <Popup v-model:show={state.showReasonPicker} round position='bottom'>
          <Picker
            title='报警原因' columns={state.alarmReasonOptions} onConfirm={({ selectedOptions }: { selectedOptions: { text: string;value: string; }[]; }) => {
              state.alarmReasonText = selectedOptions[0].text
              state.formState.alarmReason.id = selectedOptions[0].value
              state.showReasonPicker = false
            }} onCancel={() => {
              state.showReasonPicker = false
            }}
          />
        </Popup>
      </div>
    )
  }
})
