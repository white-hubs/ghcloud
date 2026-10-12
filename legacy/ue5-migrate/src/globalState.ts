import { CubeMfRootGlobalState } from '@ghcloud/cube-mf-root'
import { CubeTerminalEnum } from '@ghcloud/cube-protocol'
import { unMountCallInterfaceForApp } from '@ghcloud/desktop-client-ui/src/components/calling-interface-for-web/create-calling-interface'
import { createCallNotifyForWebApp, unMountCallNotifyForApp } from '@ghcloud/desktop-client-ui/src/components/calling-notify-for-web/create-call-notify'
import { message } from 'ant-design-vue'
import { openAlarmDetailModal } from './pages/widget/modal/alarm-detail-modal/alarm-detail-modal'
import { CallManager } from '@ghcloud/cube-rtc'
import { CallState } from '@ghcloud/cube-rtc/src/call/call-state'
import { UserInfo } from '@ghcloud/cube-ouaa-service'
import { createCallInterface } from './pages/utils/communication'


const loadEventInstance = async () => {
  const { eventInstance } = await import('./pages/event/event')
  return eventInstance
}

export const initGlobalState = async (): Promise<void> => {
  const cubeMfRootGlobalState = CubeMfRootGlobalState.getInstance({
    terminal: CubeTerminalEnum.VISUALIZATION,
    messageSocketSubscribeType: 'broadcast',
  })
  cubeMfRootGlobalState.onError(errorMsg => {
    message.error(errorMsg)
  })
  cubeMfRootGlobalState.onLogout(() => {
    sessionStorage.clear()
    window.location.href = '/login'
  })
  cubeMfRootGlobalState.onReload(() => {
    window.location.href = '/'
  })
  cubeMfRootGlobalState.onRtcCallReceived((callUser: UserInfo)=>{
    const callState = CallState.getInstance()
    const callManager = CallManager.getInstance()
    createCallNotifyForWebApp({
      avatar: callUser.fileVO?.path ?? '',
      name: callUser.name,
      type: callState.mediaType,
      onHangup() {
        callManager.reject()
      },
      onPickup() {
        createCallInterface(callUser)
        callManager.accept()
      }
    })
  })
  cubeMfRootGlobalState.onRtcCallEnd(()=>{
    unMountCallNotifyForApp()
    unMountCallInterfaceForApp()
  })
  cubeMfRootGlobalState.onAlarmModalReady((cubeAlarmModal)=>{
    cubeAlarmModal.onClickDetail((data:any) => {
      cubeAlarmModal.close()
      openAlarmDetailModal({
        title: data.alarmEventName,
        alarmData: data
      })
    })
    cubeAlarmModal.onDeviceLocate((data:any) => {
      data.locateToDevice = true
      loadEventInstance().then((eventInstance)=>{
        eventInstance.emitEvent('openDeviceFloor',data)
      })
    })
  })
  cubeMfRootGlobalState.onAlarmNotice(()=>{
    loadEventInstance().then((eventInstance)=>{
      eventInstance.emitEvent('refreshAlarmBadge')
    })
  })

  await cubeMfRootGlobalState.initGlobalState()
}