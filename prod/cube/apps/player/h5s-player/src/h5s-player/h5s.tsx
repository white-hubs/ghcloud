import * as React from 'preact'
import { useEffect, useRef, useState } from 'preact/hooks'
import './h5s.css'
import { H5sService } from './h5s.service'
import { cubeAppService } from '@ghcloud/cube-app-js-sdk'
import { CubeAppPageOrientationEnum } from '@ghcloud/cube-app-js-sdk/src/js/cube-app.service'

export enum PlayerType {
  ws = 'ws',
  webrtc = 'webrtc'
}

interface Props {
  host: string;
  token: string;
  session: string;
  playerType: PlayerType;
  protocol: string;
}

const isIPhone = /iphone/igm.test(navigator.userAgent)

export const H5sRealTimePlayer = (props: Props): React.JSX.Element => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const h5sServiceRef = useRef<H5sService | null>(null)
  const [recording, setRecording] = useState(false)

  useEffect(() => {
    h5sServiceRef.current = new H5sService(props.host, props.token, props.session)
  }, [])

  useEffect(() => {
    if (!videoRef.current) {
      return
    }
    if (!isIPhone) {
      videoRef.current.play()
    }
    videoRef.current.addEventListener('fullscreenchange', fullScreenChangeHandler)
    videoRef.current.addEventListener('webkitendfullscreen', fullScreenChangeHandler)
    videoRef.current.addEventListener('webkitfullscreenchange', fullScreenChangeHandler)

    return () => {
      videoRef.current!.removeEventListener('fullscreenchange', fullScreenChangeHandler)
      videoRef.current!.removeEventListener('webkitendfullscreen', fullScreenChangeHandler)
      videoRef.current!.removeEventListener('webkitfullscreenchange', fullScreenChangeHandler)
    }

    function fullScreenChangeHandler (): void {
      if (document.fullscreenElement ?? document.webkitFullscreenElement ?? document.mozFullScreenElement ?? document.msFullscreenElement) {
        cubeAppService.setPageOrientation(CubeAppPageOrientationEnum.LANDSCAPE)
        return
      }
      cubeAppService.setPageOrientation(CubeAppPageOrientationEnum.PORTRAIT)
      if (isIPhone) {
        cubeAppService.closePage()
      }
    }
  }, [videoRef])

  useEffect(() => {
    const config = {
      videodom: videoRef.current,
      protocol: props.protocol,
      host: props.host,
      rootpath: '/',
      token: props.token,
      streamprofile: 'main',
      session: props.session,
    }
    let player: H5sPlayerRTC | H5sPlayerWS
    if (props.playerType === PlayerType.webrtc) {
      player = new H5sPlayerRTC(config)
    } else {
      player = new H5sPlayerWS(config)
    }

    player.connect()
    return () => { player.disconnect() }
  }, [])
  return (
    <div style={{ height: '35vh', width: '100%', position: 'relative' }}>
      <div style={{ height: '100%', width: '100%', position: 'relative', background: '#000' }}>
        {isIPhone
          ? <video style={{ height: '100%', width: '100%' }} ref={videoRef} playsInline webkit-playsinline controls muted />
          : <video style={{ height: '100%', width: '100%' }} ref={videoRef} autoPlay playsInline webkit-playsinline controls controlsList='nodownload noremoteplayback' muted />}
      </div>
      <div class='live video-controls' style='display: flex'>
        <div class='left'>
          <div class='zoom1'>
            <div id='zoom1Reduce' onClick={async () => h5sServiceRef.current?.zoomin()} />
            <div class='functionName'>变焦</div>
            <div id='zoom1Plus' onClick={async () => h5sServiceRef.current?.zoomout()} />
          </div>
          <div class='zoom2'>
            <div id='zoom2Reduce' onClick={async () => h5sServiceRef.current?.zoomin()} />
            <div class='functionName'>变倍</div>
            <div id='zoom2Plus' onClick={async () => h5sServiceRef.current?.zoomout()} />
          </div>
          <div class='zoom2'>
            {!isIPhone && <div class='full-screen' onClick={fullscreen}>全屏</div>}
          </div>
        </div>
        <div class='right'>
          <div class='shotCtr'>
            <div id='shot' />
            <div class='functionName shot' onClick={async () => h5sServiceRef.current?.snapshot()}>截图</div>
          </div>
          <div class='videotapeCtr'>
            <div id='videotape' />
            <div class='functionName videotape' onClick={async () => handleRecording()}>{!recording ? '开始录像' : '结束录像'}</div>
          </div>
        </div>
      </div>
    </div>
  )

  function fullscreen (): void {
    const video = videoRef.current as HTMLVideoElement & {
      mozRequestFullScreen?: () => void;
      webkitRequestFullScreen?: () => void;
      webkitEnterFullscreen?: () => void;
      msRequestFullscreen?: () => void;
    }
    if (!video) {
      return
    }
    if (video.requestFullscreen) {
      video.requestFullscreen()
      return
    }
    if (video.mozRequestFullScreen) {
      video.mozRequestFullScreen()
      return
    }
    if (video.webkitRequestFullScreen) {
      video.webkitRequestFullScreen()
      return
    }
    if (video.msRequestFullscreen) {
      video.msRequestFullscreen()
      return
    }
    if (video.webkitEnterFullscreen) {
      video.webkitEnterFullscreen()
    }
  }

  async function handleRecording (): Promise<void> {
    setRecording(!recording)
    if (!recording) {
      await h5sServiceRef.current?.manualRecordStart()
      return
    }
    await h5sServiceRef.current?.manualRecordStop()
  }
}
