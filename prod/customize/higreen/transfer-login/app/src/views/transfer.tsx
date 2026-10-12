import { defineComponent, onMounted, ref } from 'vue'
import { message } from '@ghcloud/cube-ui'
import { useRoute } from 'vue-router'
import { transferLoginService } from '@/api/service'
import { CubeAuthService } from '@ghcloud/cube-auth-service'
import type { CubeTerminalEnum } from '@ghcloud/cube-protocol'

export const TransferLoginPage = defineComponent({
  setup () {
    const route = useRoute()
    const authentication = ref<string | null>(null)
    const userName = ref<string | null>(null)

    onMounted(() => {
      authentication.value = route.query.authentication as string
      userName.value = route.query.userName as string
      getAuthInfo()
    })

    const getAuthInfo = async (): Promise<void> => {
      if (authentication.value && userName.value) {
        try {
          const result = await transferLoginService.transferLogin({
            authentication: authentication.value,
            user_name: userName.value
          })
          const authService = new CubeAuthService('bimops-manage-web' as CubeTerminalEnum, result.tenants[0], result.access_token)
          const token = await authService.getSecretByToken()
          window.location.href = `/index?cube-secret=${token}`
        } catch (error) {
          message.error((error as { errorMessage: string; })?.errorMessage ?? '获取验证信息失败')
        }
      } else {
        message.error('参数异常')
      }
    }

    return () => (
      <div>
        Loading...
      </div>
    )
  }
})
