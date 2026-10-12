import { defineComponent, onMounted, type VNode } from 'vue'
import { useRoute } from 'vue-router'
import { authStore } from '@/api/auth-store'
import { CubeAuthService } from '@ghcloud/cube-auth-service'
import { CubeDictionaryService, type GetDictionaryByItem } from '@ghcloud/cube-dictionary-service'
import type { CubeTerminalEnum } from '../../../../../protocol/src/cube-terminal.protocol'
import { showNotify } from 'vant'
import './platform-auth.less'

export const PlatformAuth = defineComponent({
  setup: () => {
    const route = useRoute()
    // 认证平台类型（例如： 微信-公众号，企业微信，钉钉...等等）
    const authType = route.query.authType as string
    // 短token
    const cubeSecret = route.query.cubeSecret as string
    // 租户标识
    const tenant = route.query.tenant as string
    // 用户token
    let accessToken: string
    // 字典服务

    let cubeDictionaryService: CubeDictionaryService

    // 微信公众号配置信息
    let wxOfficialAccountConfig: {
      name: string;
      appid: string;
      secret: string;
    } = {
      name: '',
      appid: '',
      secret: '',
    }

    const cubeAuthService = new CubeAuthService(authStore.terminal as CubeTerminalEnum, tenant)

    onMounted(async () => {
      await getUserToken()
      switch (authType) {
        case 'WX_OFFICIAL_ACCOUNT':
          wxOfficialAccountAuth()
          break
      }
    })

    const getUserToken = async (): Promise<void> => {
      try {
        const tokenInfo = await cubeAuthService.getTokenBySecret(cubeSecret)
        accessToken = tokenInfo.accessToken
      } catch (error) {
        showNotify({ type: 'danger', message: '请重新获取二维码，认证信息获取失败' })
      }
    }

    // 获取配置信息
    const getDictionaryConfig = async (payload: { itemCode: string; code: string; }): Promise< null | GetDictionaryByItem> => {
      if (!accessToken) {
        return null
      }
      cubeDictionaryService = new CubeDictionaryService({
        tenant,
        terminal: authStore.terminal,
        token: accessToken,
      })
      try {
        const response = await cubeDictionaryService.getDictionaryByItem(payload)
        if (response.length === 0) return null
        return response[0]
      } catch (error) {
        showNotify({ type: 'danger', message: '平台配置信息获取失败' })
        return null
      }
    }

    // 微信公众号认证
    const wxOfficialAccountAuth = async (): Promise<void> => {
      const dicInfo = await getDictionaryConfig({ itemCode: 'THIRD_SERVICE', code: 'WX_OFFICIAL_ACCOUNT' })
      if (dicInfo) {
        const variable = JSON.parse(dicInfo.variable)
        const configId = dicInfo.id
        wxOfficialAccountConfig = variable as typeof wxOfficialAccountConfig
        const appid = wxOfficialAccountConfig.appid
        const secret = wxOfficialAccountConfig.secret
        // 微信回调地址
        const redirectUri = encodeURIComponent(`${window.origin}/apps/qrcode-transfer/platform-wxofficial-callback`)
        const scope = 'snsapi_base'

        // 保存数据，回调页面使用
        const authTemporaryData = {
          appid,
          secret,
          tenant,
          terminal: authStore.terminal,
          token: accessToken,
          configId,
        }
        sessionStorage.setItem('authTemporaryData', JSON.stringify(authTemporaryData))

        // 静默认证
        const authUrl = `https://open.weixin.qq.com/connect/oauth2/authorize?appid=${appid}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}&state=STATE#wechat_redirect`
        window.location.href = authUrl
      }
    }

    return (): VNode => (
      <div class='platform-auth'>
        <div class='loading'>
          <div class='spinner' />
          <p>绑定业务用户信息...</p>
        </div>
      </div>
    )
  }
})
