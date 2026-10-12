import { Button, Col, Form, FormItem, Input, InputPassword, Modal, Row } from '@ghcloud/cube-ui'
import { defineComponent, onMounted, reactive, ref } from 'vue'
import './login.less'
import { reloadService, service } from '@/api/service'
import type { GetTokenRequest } from '@ghcloud/cube-auth-service'
import { message } from 'ant-design-vue/es'
import { storeToken } from '@/hook/use-account'
import { initAuthStore } from '@/api/auth-store'
import { router } from '@/router'
import type { Tenant } from '@ghcloud/cube-mdata-service'
import { useUser } from '@/hook/use-user'
import { setPageWidth } from '@/hook/use-fit'
import { storeCache } from '@/store/cache'
import { mqttDisposed } from '@/hook/use-props'

/** 登录页 */
export const Login = defineComponent({
  setup: () => {
    setPageWidth(document.body.clientWidth)
    const { getUserInfo } = useUser()
    const cacheStore = storeCache()
    const formRef = ref()
    const formState = reactive({
      username: '',
      password: '',
      verify: '',
      loginKey: ''
    })
    const loginCode = ref('')
    const loading = ref(false)
    const showModal = ref(false)
    const tenantList = ref<Tenant[]>([])
    const rules = {
      username: [
        {
          required: true,
          message: '请输入账号',
          trigger: 'change',
        },
      ],
      password: [
        {
          required: true,
          message: '请填写密码',
          trigger: 'change',
        },
      ],
      verify: [
        {
          required: true,
          message: '请输入验证码',
          trigger: 'change',
        },
      ],
    }

    const clickTenant = (tenant: Tenant): void => {
      sessionStorage.setItem('GH-NowEnterprise', JSON.stringify(tenant))
      getUserInfo(tenant.id)
      router.push({ path: '/entry' })
    }

    const getTenantList = async (): Promise<void> => {
      const data = await service.cubeMdataService.getTenantMine()
      tenantList.value = data
      if (data && data instanceof Array) {
        if (data.length === 0) {
          message.warn('该用户未加入医院')
          sessionStorage.removeItem('GH-Token')
        } else if (data.length === 1) {
          clickTenant(data[0])
        } else {
          // 多个医院
          showModal.value = true
        }
      } else {
        message.warn('该用户未加入医院')
      }
    }

    const handleGetLoginCode = async (): Promise<void> => {
      service.cubeAuthService.getCode().then(res => {
        loginCode.value = res.code
        formState.loginKey = res.key
      })
    }

    const handleLogin = async (): Promise<void> => {
      try {
        loading.value = true
        const params: GetTokenRequest = {
          key: formState.loginKey,
          code: formState.verify,
          username: formState.username,
          password: formState.password,
        }
        const token = await service.cubeAuthService.getToken(params)
        if (token.tenantIDs.length === 0) {
          message.error('当前用户未加入任何医院')
        }
        storeToken(token)
        initAuthStore({
          token: token.accessToken,
          tenant: token.tenantIDs[0]
        })
        reloadService()
        await getTenantList()
      } catch (error) {
        handleGetLoginCode()
        const { errorDescription } = (error as { toJSON: () => { errorDescription: string; }; }).toJSON()
        message.error(errorDescription || '登陆失败，请检查登陆信息.')
      } finally {
        loading.value = false
      }
    }

    onMounted(() => {
      handleGetLoginCode()
      cacheStore.clearTimer()
      mqttDisposed()
    })
    return (): JSX.Element =>
      <>
        <div class='loginCtr'>
          <div class='proPanel'>
            <div data-v-4ca33632='' class='proPanel-icon'>
              <img data-v-4ca33632='' src='/apps/operating-room/data-viz/images/logo-icon.png' />
            </div>
            <div class='proPanel-form'>
              <div class='form-title'>登录</div>
              <Form ref={formRef} rules={rules} model={formState} layout='horizontal' labelAlign='right'>
                <Row gatter='1'>
                  <Col span='24'>
                    <FormItem label='' name='username' wrapper-col={{ span: 24, offset: 0 }}>
                      <Input v-model:value={formState.username} type='text' placeholder='账号' allowClear={false} showCount={false} />
                    </FormItem>
                  </Col>
                  <Col span='24'>
                    <FormItem label='' name='password' wrapper-col={{ span: 24, offset: 0 }}>
                      <InputPassword v-model:value={formState.password} type='password' placeholder='密码' allowClear={false} showCount={false} />
                    </FormItem>
                  </Col>
                  <Col span='24'>
                    <FormItem label='' name='verify' wrapper-col={{ span: 24, offset: 0 }}>
                      <div class='identify'>
                        <Input v-model:value={formState.verify} type='text' placeholder='验证码' allowClear={false} showCount={false} />
                        {loginCode.value && <img src={loginCode.value} onClick={handleGetLoginCode} style='cursor:pointer' />}
                      </div>
                    </FormItem>
                  </Col>
                  <Col span='24'>
                    <FormItem label='' wrapper-col={{ span: 24, offset: 0 }}>
                      <Button loading={loading.value} type='primary' class='login-btn' onClick={handleLogin}>登录</Button>
                    </FormItem>
                  </Col>
                </Row>
              </Form>
            </div>
          </div>
        </div>
        <Modal title='选择医院' v-model:visible={showModal.value} width='800px' footer={null}>
          <div class='dialogContent'>
            {
              tenantList.value.map(item => {
                return <div key={item.id} onClick={() => {
                  clickTenant(item)
                }}>{item.name}</div>
              })
            }
          </div>
        </Modal>
      </>
  }
})
