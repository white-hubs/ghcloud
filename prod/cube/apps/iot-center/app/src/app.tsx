import { useEffect, useState } from 'react'
import { routes } from './router/route'
import { RouterView } from './router/router'
import { ConfigProvider } from 'antd'
import 'dayjs/locale/zh-cn'
import zhCN from 'antd/locale/zh_CN'
import { MFRootEventNameEnum, subscriber } from '@ghcloud/cube-mf-root'
import './styles/global.less'
import { AuthService } from '@ghcloud/cube-service'

export const App: React.FC = () => {
  const skinColor = localStorage.getItem('skinColor') ? ((JSON.parse(localStorage.getItem('skinColor') as unknown as string)) as { primaryColor: string; }).primaryColor : 'rgb(0, 186, 139)'
  const [colorPrimary, setColorPrimary] = useState(skinColor)
  subscriber.subscribe(MFRootEventNameEnum.MF_ROOT_CHANGE_SKIN, (info) => {
    setColorPrimary(info.data as string)
  })
  useEffect(() => {
    enum Token {
      ACCESSTOKEN = 'access_token'
    }
    const token: Record<Token, string> = JSON.parse((sessionStorage.getItem('GH-Token') as unknown as string))
    const currentApplication: {
      code: string;
    } = JSON.parse((sessionStorage.getItem('GH-NowEnterprise') as unknown as string))
    AuthService.cacheAuth({
      authorization: token.access_token,
      tenant: currentApplication.code,
      userID: ''
    })
  }, [])
  return (
    <>
      <ConfigProvider theme={{ token: { colorPrimary } }} prefixCls={__PROJECT_NAME__} locale={zhCN}>
        <RouterView routes={routes} />
      </ConfigProvider>
    </>
  )
}
