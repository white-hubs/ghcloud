import { CubeDictionaryService } from '@ghcloud/cube-dictionary-service'
import { CallManager } from '@ghcloud/cube-rtc'
import { CubeOuaaService } from '@ghcloud/cube-ouaa-service'
import { CallState } from '@ghcloud/cube-rtc/src/call/call-state'
import { useMfRootStore } from '../core'
import type { CubeAuth } from '@ghcloud/cube-protocol'
import { privateEventMap } from '../event'

let initStatus = false

/** 音视频通讯初始化 */
export async function initCommunication (): Promise<void>{
  if (initStatus){
    return
  }
  const store = useMfRootStore()

  const callManager = CallManager.getInstance()
  const callState = CallState.getInstance()
  // 检查通讯配置是否存在
  const cubeDictionaryService = new CubeDictionaryService(store.authInfo as CubeAuth)
  const res = await cubeDictionaryService.getDictionaryByItem({ itemCode: 'THIRD_SERVICE', code: 'THIRD_SERVICE::correspond_service' })
  if (!res || res.length === 0){
    return
  }
  if (store.userInfo){
    await callManager.logout()
    callManager.login();
    callManager.setSelfUser({
      id: store.userInfo.id,
      name: store.userInfo.name,
      avatar: store.userInfo.fileVO?.path ?? '',
    });
    callManager.setOptions({ userRoomEventSource: 'rtc' });
    callManager.onCallReceived(async ()=>{
      if (callState.caller.id){
        const callUser = await new CubeOuaaService(store.authInfo as CubeAuth).getPersonInfo(callState.caller.id)
        privateEventMap.get('rtcCallReceived')?.(callUser)
      }
    })
    callManager.onCallEnd(()=>{
      privateEventMap.get('rtcCallEnd')?.()
    })
  }
  initStatus = true
}