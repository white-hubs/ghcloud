import { Button, Form, FormItem, Input, InputPassword } from '@ghcloud/cube-ui'
import { defineComponent, reactive, ref } from 'vue'
import '@/styles/login.less'
import { useRouter } from 'vue-router'
import { login } from '@/api/login'
import { setTenant, setToken } from '@/tools'
import Crypto from '@/utils/crypot'
import { storeUser } from '@/pinia-store/user'

export const Login = defineComponent({
  setup: () => {
    const logoImg = '/resource/v1/iot-configure/images/logo.png'
    const router = useRouter()
    const formState = reactive({
      userName: '',
      password: ''
    })
    const rules = {
      userName: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
      password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
    }
    const formref = ref()
    const loading = ref(false)
    const userStore = storeUser()
    const handleLogin = async (): Promise<void> => {
      try {
        loading.value = true
        await formref.value.validate()
        const params = {
          userName: formState.userName,
          password: Crypto.encrypt(formState.password),
        }
        const res = await login(params)
        if (res.data) {
          userStore.userInfo = res.data
          setTenant(res.data.tenant)
          setToken(res.data.token)
          router.push('/access')
        }
      } catch {
      } finally {
        loading.value = false
      }
    }
    return (): JSX.Element =>
      <>
        <div class='flex-center wrapper'>
          <div class='login'>
            <img src={logoImg} />
            物联接入OS
          </div>
          <div class='login_content'>
            <div class='img' />
            <div class='login_right'>
              <h3>欢迎登录</h3>
              <Form rules={rules} ref={formref} model={formState}>
                <FormItem name='userName'>
                  <Input placeholder='请输入用户名' v-model:value={formState.userName} showCount={false} />
                </FormItem>
                <FormItem name='password'>
                  <InputPassword placeholder='请输入密码' v-model:value={formState.password} showCount={false} onPressEnter={async () => handleLogin()} />
                </FormItem>
                <FormItem>
                  <Button type='primary' loading={loading.value} onClick={() => {
                    handleLogin()
                  }}>登录</Button>
                </FormItem>
              </Form>

            </div>

          </div>

        </div>
      </>
  }
})
