import * as React from 'preact'
import { getQueryParameters } from './url-utils'
import { H5sRealTimePlayer, PlayerType } from './h5s-player/h5s'
import { logger } from './logger'
import { playerStore } from './api/player.store'
import { HKRealTimePlayer } from './hk-player/hk-player'
import { useEffect, useState } from 'preact/hooks'
import { Toast } from 'react-vant'
import { authStore, initAuthStore } from './api/auth-store'
import { getAuthInfo } from '@ghcloud/cube-auth-utils'
import { CubeSecurityManagementService } from '@ghcloud/cube-security-management-service'
import { CubeDeviceCenterService } from '@ghcloud/cube-iot-center-service'
import { CubeMdataService } from '@ghcloud/cube-mdata-service'
function analysisPlayerType (playerTypeParam: string | undefined): PlayerType {
  if (playerTypeParam) {
    if ([PlayerType.webrtc, PlayerType.ws].includes(playerTypeParam as PlayerType)) {
      return playerTypeParam as PlayerType
    }
    logger.warn('传入的 [playerType] 不合法，应传入 ws 或 webtrc')
  }
  return platform.os.family === 'iOS' ? PlayerType.webrtc : PlayerType.ws
}

async function handleAuthStore (): Promise<void> {
  const env = (import.meta as unknown as { env: { MODE: string; }; }).env.MODE
  let authInfo = {
    token: '',
    tenant: '',
    terminal: 'bimops-manage-web'
  }
  // 方便开发时自定义token
  if (env === 'development') {
    authInfo.token = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0ZW5hbnRzIjpbIjU4MTk3MjYwIiwiNTgxOTcyNjAiXSwicGFzc3dvcmRfZXhwaXJlZCI6ZmFsc2UsInVzZXJfbmFtZSI6IjE3MzExMzY5NzgyIiwiYWRtaW4iOmZhbHNlLCJwYXNzd29yZF9mb3JjZWQiOmZhbHNlLCJhdXRob3JpdGllcyI6WyIxNjUxODQ2NzkxNjkzNDE0NDAxIiwiMTcxMTYyODUwNzU1NTExNTAwOSIsIlJPTEVfQUNUSVZJVElfVVNFUiJdLCJjbGllbnRfaWQiOiJjbGllbnRfMiIsInBhc3N3b3JkX2V4cGlyYXRpb25fcmVtaW5kZWQiOmZhbHNlLCJhZG1pbmlzdHJhdGVkX3RlbmFudHMiOlsiNTgxOTcyNjAiXSwic2NvcGUiOlsic2VsZWN0Il0sIm5hbWUiOiLotoXnuqfnrqHnkIblkZgiLCJwYXNzd29yZF9leHBpcmF0aW9uX2RhdGUiOjE3NTIwNTgwMTYwMDAsImlkIjoxNDc4NjM2ODg2OTg0NTIzNzc3LCJleHAiOjE4MjU0NDk4MjcsImp0aSI6IjUyNjc1YWIwLWI1OTktNDA2Ny04MWY3LTE0YmNjZTJmMjc0YyJ9.eTV1gxMyr9tViK8tyZWr5rh5jKMRl3Yx6pZVT9y2-bxlz5IOX-m7JP3sx5GHXV_oBt3KQmgGKQQByoTybFWb9rV6aLlkVpcRhB4vUhxdVP3HBTxyko1znfz0o3NGAhaX2QXPXSmDAXfzkn7fgsdj0MZhBG5BB-iNl0LIW1d797BuAO5c2WOu137kF4pPFLq6S1AM2QiPl79jJhsWu4xg-izKrOPflCIji68r9i5okr8y6NeOxfDMNvTuBm2Wcjh8JmVpZVWYep13fx7jLN8PMw2Lh1eh2-bKtDKkf0xYlLqNjo_UBK1c51f1bDvEdkdH2CzF5S_p7E6qVeTAyDS4hg'
    authInfo.tenant = '58197260'
  } else {
    authInfo = await getAuthInfo()
  }
  initAuthStore(authInfo)
}

/** 海康视频播放获取 */
async function getHKPlayURL (deviceId: string): Promise<string> {
  const cubeSecurityManagementService = new CubeSecurityManagementService(authStore)
  const playURL = await cubeSecurityManagementService.getVideoGatewayPlayUrl(deviceId, window.location.protocol === 'http' ? 'WS' : 'WSS')
  return playURL
}

/** H5S播放信息获取 */
async function getH5sInfo (deviceId: string): Promise<{
  token: string;
  host: string;
  session: string;
  protocol: string;
}> {
  const h5sInfo = {
    token: '',
    host: '',
    session: '',
    protocol: ''
  }

  const cubeDeviceCenterService = new CubeDeviceCenterService(authStore)
  const cubeMdataService = new CubeMdataService(authStore)

  await Promise.all([
    cubeDeviceCenterService.getDeviceInstanceDetail({ deviceId }).then(res => {
      h5sInfo.token = res.baseArchivesInfo.thirdPartyId
    }),
    cubeMdataService.getCurrentStreamMediaConfig().then(res => {
      const protocol = window.location.protocol
      let address = ''
      if (protocol === 'http') {
        address = res.intranetAddress
      } else {
        address = res.ipAddress
      }
      h5sInfo.protocol = address ? address.split('//')[0] : `${protocol}:`
      h5sInfo.host = address ? address.split('//')[1] : ''
    }),
    cubeMdataService.getVideoPtzSession().then(res => {
      h5sInfo.session = res.session
    })
  ])
  return h5sInfo
}

export const App = (): React.JSX.Element => {
  const [initStatus, setInitStatus] = useState(false)
  const [hkPlayUrl, setHkPlayUrl] = useState('')
  const [h5sToken, setH5sToken] = useState('')
  const [h5sHost, setH5sHost] = useState('')
  const [h5sSession, setH5sSession] = useState('')
  const [h5sProtocol, seth5sProtocol] = useState('')
  // 由于历史设计原因，host 传入的实际是 origin，如：http://localhost:8888，遂需对其进行拆解
  const { playerType: playerTypeParam, deviceId, host: h5sHostParam, token: h5sTokeParam, session: h5sSessionParam } = getQueryParameters()
  const playerType = analysisPlayerType(playerTypeParam)

  const initPlayer = async (): Promise<void> => {
    Toast({
      type: 'loading',
      message: '正在初始化播放器',
      duration: 0,
    })
    // TODO(zhangzheng) 获取主应用下的config.js 目前没有信息源可以区分用哪种播放器
    await fetch(window.location.origin + '/config.js', { method: 'GET' })
      .then(async response => response.text())
      .then(code => {
      // 创建一个新的script元素
        const script = document.createElement('script')
        // 设置script的内容为获取到的代码
        script.textContent = code
        // 将script元素添加到body中
        document.body.appendChild(script)
        if (window.config?.feature && window.config.feature?.videoAccessMode === 'HK') {
          playerStore.playerAccessMethod = 'HK'
        } else {
          playerStore.playerAccessMethod = 'H5S'
        }
      })
      .catch(error => {
        logger.error('Error fetching script:', error)
      })

    if (h5sHostParam && h5sSessionParam && h5sTokeParam && playerStore.playerAccessMethod === 'H5S') {
      const [protocol, host] = h5sHostParam.split('//')
      setH5sHost(host)
      seth5sProtocol(protocol)
      setH5sSession(h5sSessionParam)
      setH5sToken(h5sTokeParam)
    } else {
      if (deviceId) {
        await handleAuthStore()
        // 获取播放信息
        if (playerStore.playerAccessMethod === 'HK') {
          const playUrl = await getHKPlayURL(deviceId)
          setHkPlayUrl(playUrl)
        }
        if (playerStore.playerAccessMethod === 'H5S') {
          const h5sInfo = await getH5sInfo(deviceId)
          setH5sHost(h5sInfo.host)
          setH5sSession(h5sInfo.session)
          setH5sToken(h5sInfo.token)
          seth5sProtocol(h5sInfo.protocol)
        }
      }
    }
    Toast.clear()
    setInitStatus(true)
  }
  useEffect(() => {
    initPlayer()
  }, [])

  return (
    <div style={{ height: '100vh', width: '100vw', overflow: 'hidden' }}>
      {
        initStatus && (
          playerStore.playerAccessMethod === 'H5S'
            ? <H5sRealTimePlayer token={h5sToken} host={h5sHost} session={h5sSession} playerType={playerType} protocol={h5sProtocol} />
            : <HKRealTimePlayer playURL={hkPlayUrl} />
        )
      }
    </div>
  )
}
