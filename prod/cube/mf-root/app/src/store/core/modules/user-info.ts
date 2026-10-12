import { CubeOuaaService, type CubeAuth } from '@ghcloud/cube-ouaa-service'
import { useMfRootStore } from '../core'

/** 获取用户信息 */
export async function initUserInfo (): Promise<void>{
  const store = useMfRootStore()
  const cubeOuaaService = new CubeOuaaService(store.authInfo as CubeAuth)
  const res = await cubeOuaaService.getUserInfo()
  if (res){
    store.userInfo = res
    sessionStorage.setItem('GH-UserInfo', JSON.stringify(res))
  }
}