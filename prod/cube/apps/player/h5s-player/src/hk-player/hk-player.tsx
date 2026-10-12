import * as React from 'preact'
import { useEffect } from 'preact/hooks'

interface Props {
  playURL: string;
}
export const HKRealTimePlayer = (props: Props): React.JSX.Element => {
  const createScript = (): void => {
    const script = document.createElement('script')
    script.src = '/resource/player-hk-sdk/h5player.min.js'
    script.async = true
    document.body.appendChild(script)
    script.onload = () => {
      initPlayer()
    }
  }

  const initPlayer = async (): Promise<void> => {
    const playerDom = document.getElementById('hk-player') as HTMLVideoElement
    const player = new window.JSPlugin({
      szId: 'hk-player',
      szBasePath: '/resource/player-hk-sdk/',
      iWidth: playerDom.clientWidth,
      iHeight: playerDom.clientHeight,
      iMaxSplit: 1,
      iCurrentSplit: 1,
    })
    const playURL = `${window.location.protocol === 'http' ? 'ws://' : 'wss://'}${props.playURL.split('//')[1]}`
    const mode = 1
    player?.JS_Play(playURL, { playURL, mode }, 0)
    player?.JS_SetWindowControlCallback({
      pluginErrorHandler: async (index: number, iErrorCode: string) => { // 插件错误回调
        // alert(iErrorCode)
        await player?.JS_Stop()
      }
    })
  }

  useEffect(() => {
    if (!window.JSPlugin) {
      createScript()
      return
    }
    initPlayer()
  }, [])
  return <div id='hk-player' style='width: 100vw;height: 35vh;' />
}
