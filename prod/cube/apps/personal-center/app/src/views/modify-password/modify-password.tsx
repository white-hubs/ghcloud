import {
  defineComponent,
  reactive,
  ref,
  watch,
  type VNode
} from 'vue'
import { Button, Form, FormItem, message } from '@ghcloud/cube-ui'
import { GLayout } from '@/components/common/layout'
import InputPassword from '@ghcloud/cube-ui/src/components/input-password/input-password'
import { cubeOuaaService } from '@/api/service'
import Crypto from '@ghcloud/cube-utils/src/crypto'
import '../style/index.less'
interface FormState {
  data: {
    id: string;
    password: string;
    newPassword: string;
    secondNewPassword: string;
  };
  loading: boolean; isEdit: boolean; userId: string;
}
export const ModifyPassword = defineComponent({
  setup: () => {
    const formState = reactive<FormState>({
      data: {
        id: '',
        password: '',
        newPassword: '',
        secondNewPassword: ''
      },
      loading: false,
      isEdit: false,
      userId: '',
    })

    const passwordForm = ref()
    const rules = {
      password: [
        {
          required: true,
          message: '请输入旧密码',
        },
      ],
      newPassword: [
        {
          required: true,
          message: '请输入新密码',
        },
        {
          pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_])(?!.*\s).{8,}$/g,
          trigger: 'blur',
          message: '密码必须包含字母大写、小写、数字、特殊字符且至少8位',
        },
      ],
      secondNewPassword: [
        {
          required: true,
          message: '请确认新密码',
        },
        {
          async validator (rule: unknown, value: string): Promise<void> {
            if (formState.data.newPassword) {
              if (
                value !== formState.data.newPassword &&
                formState.data.secondNewPassword
              ) {
                return Promise.reject('确认密码与新密码不相同')
              } else {
                return Promise.resolve()
              }
            }
          },
        },
      ],
    }
    const save = async (): Promise<void> => {
      formState.data.id = JSON.parse(sessionStorage.getItem('GH-UserInfo') ?? '')?.id
      passwordForm.value.validate().then(async () => {
        // 密码加密
        formState.data.password = Crypto.encrypt(formState.data.password)
        formState.data.newPassword = Crypto.encrypt(formState.data.newPassword)
        formState.data.secondNewPassword = Crypto.encrypt(formState.data.secondNewPassword)
        try {
          await cubeOuaaService.modifyPassword(formState.data)
          message.success('操作成功')
          setTimeout(() => {
            sessionStorage.removeItem('GH-Token')
            sessionStorage.removeItem('allowAdd')
            sessionStorage.removeItem('firstMenu')
            sessionStorage.removeItem('GH-UserInfo')
            sessionStorage.removeItem('GH-NowEnterprise')
            window.location.href = window.location.origin
            window.location.reload()
          }, 2000)
        } catch (e) {
          formState.data.password = ''
          formState.data.newPassword = ''
          formState.data.secondNewPassword = ''
          message.error((e as { errorMessage: string; })?.errorMessage ?? '操作失败')
        }
      })
    }
    watch(
      () => formState.data.newPassword,
      (newVal, oldVal) => {
        if (oldVal !== newVal) {
          formState.data.secondNewPassword = ''
          passwordForm.value.clearValidate('secondNewPassword')
        }
      }
    )
    const FormDom = (): VNode =>
      <Form ref={passwordForm} model={formState.data} rules={rules}>
        <FormItem label='旧密码' name='password' style='width: 380px'>
          <InputPassword showCount={false} v-model:value={formState.data.password} placeholder='请输入旧密码' />
        </FormItem>
        <FormItem label='新密码' name='newPassword' style='width: 380px'>
          <InputPassword showCount={false} v-model:value={formState.data.newPassword} allowClear placeholder='请输入新密码' maxlength={16} />
        </FormItem>
        <FormItem label='确认新密码' name='secondNewPassword' style='width: 380px'>
          <InputPassword showCount={false} v-model:value={formState.data.secondNewPassword} allowClear placeholder='再次输入新密码' maxlength={16} />
        </FormItem>
      </Form>
    // 布局插槽==========================================================================================================
    const gLayoutSlots = {
      'content-table': (): JSX.Element => {
        return (
          <div class='detail-form'>
            {FormDom()}
          </div>
        )
      },
      'footer-page': (): JSX.Element => {
        return <Button type='primary' onClick={save}>保存</Button>
      }
    }
    return (): JSX.Element =>
      <>
        <GLayout title='修改密码' v-slots={gLayoutSlots} />
      </>
  }
})
