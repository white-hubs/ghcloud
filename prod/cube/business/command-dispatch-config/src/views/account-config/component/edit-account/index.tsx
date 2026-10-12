import { AntModal, Form, FormItem, InputNumber, Input, Switch, message, InputPassword } from '@ghcloud/cube-ui'
import { defineComponent, reactive, ref, watch, type PropType } from 'vue'
import { updateDevice } from '@/apis/intercom-group-config'
interface FormState {
  id: string;
  name: string;
  code: string;
  password: string;
  type: string;
  isRecord: boolean;
  isVideo: boolean;
  deviceLevel: number;
}
export const EditAccount = defineComponent({
  props: {
    initFormState: {
      type: Object as PropType<FormState>,
      default: () => {
        return {
          id: '',
          name: '',
          code: '',
          password: '',
          type: '',
          isRecord: false,
          isVideo: false,
          deviceLevel: 0
        }
      }
    },
    visible: {
      type: Boolean,
      default: false
    },
  },
  emits: ['update:visible', 'getList', 'update:initFormState'],
  setup: (props, { emit }) => {
    const formRef = ref<{ validate: () => Promise<void>; }>()
    const state = reactive<{
      loading: boolean;
      formState: FormState;
    }>({
      loading: false,
      formState: {
        id: '',
        name: '',
        code: '',
        password: '',
        type: '',
        isRecord: false,
        isVideo: false,
        deviceLevel: 0
      }
    })
    const handleOk = async (): Promise<void> => {
      await formRef.value?.validate()
      try {
        state.loading = true
        state.formState.password = window.btoa(state.formState.password)
        await updateDevice(state.formState)
        message.success('编辑成功')
        handleCancel()
        emit('getList')
      } catch {
      } finally {
        state.loading = false
      }
    }
    watch(() => props.initFormState, () => {
      state.formState = props.initFormState
    })
    const handleCancel = (): void => {
      emit('update:visible', false)
      emit('update:initFormState', {
        id: '',
        name: '',
        code: '',
        password: '',
        type: '',
        isRecord: false,
        isVideo: false,
        deviceLevel: 0
      })
    }
    const rules = {
      code: [{ required: true, message: '请输入通讯号码' }],
      name: [{ required: true, message: '请输入账号名称' }],
      deviceLevel: [{ required: true, message: '请输入账号等级' }],
      isRecord: [{ required: true, message: '请选择是否录音' }],
      isVideo: [{ required: true, message: '请选择是否录音' }],
      password: [{ required: true, message: '请输入密码' }],
    }
    return (): JSX.Element=> (
      <>
        <AntModal
          v-model:visible={props.visible}
          title='账号编辑'
          width={800}
          maskClosable={false}
          confirmLoading={state.loading}
          onOk={handleOk}
          onCancel={handleCancel}
        >
          <Form ref={formRef} labelCol={{ span: 4 }} model={state.formState} rules={rules}>
            <FormItem label='账号名称:' name='name'>
              <Input placeholder='请输入账号名称' v-model:value={state.formState.name} />
            </FormItem>
            <FormItem label='通讯号码:' name='code'>
              <Input placeholder='请输入通讯号码' disabled v-model:value={state.formState.code} />
            </FormItem>
            <FormItem label='账号等级:' name='deviceLevel'>
              <InputNumber min={0} placeholder='输入账号等级' max={100} precision={0} style={{ width: '200px' }} v-model:value={state.formState.deviceLevel} />
            </FormItem>
            <FormItem label='密码:' name='password'>
              <InputPassword placeholder='请输入密码密码' v-model:value={state.formState.password} />
            </FormItem>
            <FormItem label='是否录音:' name='isRecord'>
              <Switch v-model:checked={state.formState.isRecord} checkedChildren='是' unCheckedChildren='否' />
            </FormItem>
            <FormItem label='是否录像:' name='isVideo'>
              <Switch v-model:checked={state.formState.isVideo} checkedChildren='是' unCheckedChildren='否' />
            </FormItem>
          </Form>
        </AntModal>
      </>
    )
  }
})
