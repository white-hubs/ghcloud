
import { CallManager } from '@ghcloud/cube-rtc'
import { createCallInterfaceForWebApp } from '@ghcloud/desktop-client-ui/src/components/calling-interface-for-web/create-calling-interface'
import type { UserInfo } from '@ghcloud/cube-ouaa-service'

export function createCallInterface (userInfo: UserInfo): void{
  const callManager = CallManager.getInstance()
  const { changeCallState } = createCallInterfaceForWebApp({
    avatar: userInfo.fileVO?.path ?? '',
    name: userInfo.name ?? '',
    callState: callManager.getCallState(),
    onHangup: ()=>{
      callManager.hangUp()
    },
    changeLocalAudio (open: boolean) {
      if (open){
        callManager.openMicrophone()
      } else {
        callManager.closeMicrophone()
      }
    },
    changeLocalCamera (domId, visible) {
      if (visible){
        callManager.openLocalCamera({ view: domId })
      } else {
        callManager.closeLocalCamera({} as unknown as void)
      }
    },
    changeRemoteCamera (params: { userId: string; visible: boolean; domId: string; }){
      try {
        if (params.visible){
          callManager.startRemoteVideo({
            userId: params.userId,
            view: params.domId,
          })
        } else {
          callManager.stopRemoteVideo({ userId: params.userId, streamType: 'main' })
        }
      } catch {

      }
    }
  })
  callManager.onCallStateChange((callState)=>{
    changeCallState(callState)
  })
}