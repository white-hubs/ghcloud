import { showNotify } from 'vant'
import { defineComponent, onMounted, reactive, type VNode } from 'vue'
import { useRoute } from 'vue-router'
import { CubeIdentityService, type WechatOfficialQrcode } from '@ghcloud/cube-identity-service'
import { CubeOuaaService, type WXTokenResponse } from '@ghcloud/cube-ouaa-service'
import './platform-wxofficial-callback.less'

export const PlatformWXOfficialCallback = defineComponent({
  setup: () => {
    const route = useRoute()
    // 微信重定向的回调code作为换取access_token的票据
    const code = route.query.code as string ?? null
    let cubeOuaaService: CubeOuaaService

    // 获取存储的JSON字符串
    const jsonString = sessionStorage.getItem('authTemporaryData') ?? ''
    const authTemporaryData = JSON.parse(jsonString)
    const tenant = authTemporaryData?.tenant as string
    const terminal = authTemporaryData?.terminal as string
    const token = authTemporaryData?.token as string
    const configId = authTemporaryData?.configId as string

    const wechatOfficialQrcode = reactive<WechatOfficialQrcode>({
      ticket: null,
      expireSeconds: null,
      url: null,
    })

    onMounted(async () => {
      cubeOuaaService = new CubeOuaaService({ tenant, terminal, token })
      const result = await getWechatToken(code)
      if (result) {
        await bindWechatUser(result)
      }
      getWechatOfficialQrcode()
    })

    // 获取微信认证后用户信息
    const getWechatToken = async (code: string | null): Promise<WXTokenResponse | null> => {
      if (!code) {
        showNotify({ type: 'danger', message: '获取微信用户信息所需参数缺失' })
        return null
      }
      try {
        const response = await cubeOuaaService.getWeChatAccessToken(code)
        return response
      } catch (error) {
        showNotify({ type: 'danger', message: '公众号换取网页授权出现异常' })
        return null
      }
    }

    // 微信用户绑定
    const bindWechatUser = async (wxInfo: WXTokenResponse): Promise<void> => {
      const openId = wxInfo.openId ?? ''
      const unionId = wxInfo.unionid ?? ''
      if (openId.length > 0) {
        try {
          await cubeOuaaService.bindWeChat({ openId, unionId, configId })
          showNotify({ type: 'success', message: '微信用户绑定成功' })
        } catch (error) {
          showNotify({ type: 'danger', message: '微信用户绑定出现异常' })
        }
      } else {
        showNotify({ type: 'danger', message: '微信用户openid异常' })
      }
    }

    // 获取微信公众号二维码
    const getWechatOfficialQrcode = async (): Promise<void> => {
      const cubeIdentityService = new CubeIdentityService({ tenant, terminal, token })
      try {
        const response = await cubeIdentityService.getWechatOfficialQrcode()
        if (response) {
          wechatOfficialQrcode.ticket = response.ticket
          wechatOfficialQrcode.expireSeconds = response.expireSeconds
          wechatOfficialQrcode.url = response.url
        } else {
          showNotify({ type: 'danger', message: '获取微信公众号二维码失败' })
        }
      } catch (error) {
        showNotify({ type: 'danger', message: '获取微信公众号二维码出现异常' })
      }
    }

    return (): VNode=> (
      <div class='center-container'>
        <div class='center-title'>
          平台认证
        </div>
        <div class='center-content'>
          {wechatOfficialQrcode.ticket
            ? (
              <img src={`https://mp.weixin.qq.com/cgi-bin/showqrcode?ticket=${wechatOfficialQrcode.ticket}`} alt='微信公众号二维码' class='qrcode-image' />
            )
            : (
              <div class='loading-text'>正在加载微信公众号二维码...</div>
            )}
        </div>
      </div>
    )
  }
})
