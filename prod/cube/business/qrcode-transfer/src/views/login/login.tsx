import { Form, Field, CellGroup, Button, showNotify } from 'vant'
import { defineComponent, reactive, ref, type VNode } from 'vue'
import styles from './login.module.less'
import { getTenant, login } from '@/api/login'
import { PasswordEncoder } from '@ghcloud/cube-utils'
import qs from 'qs'
import { useRouter } from 'vue-router'
import { authStore, initAuthStore } from '@/api/auth-store'
import { initAuthStore as genericAuthStore } from '@ghcloud/cube-app-generic-component'

export const Login = defineComponent({
  setup: () => {
    const router = useRouter()
    const formState = reactive({
      userName: '',
      password: ''
    })
    const loading = ref(false)
    // const userStore = storeUser()
    const handleLogin = (): void => {
      try {
        loading.value = true

        const params = qs.stringify({
          grant_type: 'pwd_encrypt',
          username: formState.userName,
          password: PasswordEncoder.encode(formState.password),
        })
        login(params).then(async (res) => {
          const token = { access_token: 'Bearer ' + res.access_token, tenants: res.tenants }
          getTenantList()
          const authInfo = {
            token: token.access_token,
            tenant: token?.tenants[0],
            terminal: authStore.terminal
          }
          sessionStorage.setItem('GH-Token', JSON.stringify(res))
          sessionStorage.setItem('GH-NowEnterprise', JSON.stringify({ code: authInfo.tenant }))
          initAuthStore(authInfo)
          genericAuthStore(authInfo)
        }).catch(() => {
          loading.value = false
        })
      } catch (error) {
      }
    }
    const getTenantList = async (): Promise<void> => {
      const data = await getTenant()
      if (Array.isArray(data)) {
        if (data.length === 0) {
          showNotify({ type: 'danger', message: '该用户未加入企业' })
          sessionStorage.removeItem('token')
        } else {
          sessionStorage.setItem('GH-NowEnterprise', JSON.stringify({ code: data[0].code }))
          router.push({ name: 'transfer', query: { code: sessionStorage.getItem('qrCode') } })
        }
      } else {
        showNotify({ type: 'danger', message: '该用户未加入企业' })
      }
      loading.value = false
    }
    return (): VNode =>
      <>
        <div class={`flex-center ${styles.wrapper}`}>
          <div class={styles.img} />
          <div class={styles.login_content}>
            <Form onSubmit={async () => {
              handleLogin()
            }}>
              <CellGroup inset>
                <Field
                  v-model={formState.userName}
                  name='userName' label='用户名'
                  placeholder='用户名'
                  left-icon='user-o'
                  rules={[{ required: true, message: '请填写用户名' }]}
                />
                <Field
                  v-model={formState.password}
                  name='password'
                  label='密码'
                  placeholder='密码'
                  left-icon='closed-eye'
                  autocomplete='off'
                  type='password'
                  rules={[{ required: true, message: '请填写密码' }]}
                />
              </CellGroup>
              <div style='margin:30px 5px;'>
                <Button type='primary' block loading={loading.value} native-type='submit'>登录</Button>
              </div>
            </Form>
          </div>

        </div>
      </>
  }
})
