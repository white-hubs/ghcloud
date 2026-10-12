import { cubeAppService } from '@ghcloud/cube-app-js-sdk'
import { RefreshNativeBusiness } from '@ghcloud/cube-app-js-sdk/src/js/cube-app.service'
import { getEnvironment } from '@ghcloud/cube-app-js-sdk/src/js/cube-h5-config'
import bus from './bus'
import { FormProcessOperate } from '@/domain/form-flow'
import { cubeWxServiceInstance } from '@ghcloud/cube-app-js-sdk/src/wx/cube-wx-service'
import { showNotify } from 'vant'
export const closePage=(flowTaskId?:string,isChildrenComponent?:boolean):void=>{
  if(flowTaskId)sessionStorage.setItem('flowTaskId',flowTaskId)
  cubeAppService.refreshNativeData(RefreshNativeBusiness.FLOW_PROCESS)
  if(isChildrenComponent){
    bus.emit('closePage',flowTaskId)
  }else{
    if(getEnvironment()==='cubeApp'){
      cubeAppService.closePage(flowTaskId)
    }
  }
}
export const endTask=():void=>{
  const list=JSON.parse(sessionStorage.getItem('taskQueen') as string)
  if(list&&list.length>0){
    bus.emit('endTask',list.slice(1,list.length))
  }
}
export const handleWxProcess=(operate?: { code: FormProcessOperate; name: string; alias: string;}):void=>{
  if (operate?.code === 'PASS') {
    showNotify({ type: 'success', message: '提交成功' })
  }
  setTimeout(() => {
    cubeWxServiceInstance.backHome()
  }, 800);
}