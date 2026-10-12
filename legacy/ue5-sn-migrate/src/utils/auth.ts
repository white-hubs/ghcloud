import { authStore } from '@/api/auth-store'
import { CubeAuthService } from '@ghcloud/cube-auth-service';
import { CubeTerminalEnum } from '../../../../prod/cube/protocol/src/main'

const NowEnterpriseKey = "GH-NowEnterprise";
export function setNowEnterprise(value:string) {
  const data = JSON.parse(value.replaceAll('%22','"')) as {code:string}
  authStore.tenant = data.code
  sessionStorage.setItem(NowEnterpriseKey, JSON.stringify(data))
}
/**
 * 获取租户信息
 */
export function getNowEnterprise() {
  return JSON.parse((sessionStorage as any).getItem(NowEnterpriseKey));
}
/**
 * 
 */


const TokenKey = "GH-Token";
export function setToken(data){
  authStore.token = data.access_token
  sessionStorage.setItem(TokenKey,JSON.stringify(data))
}
/**
 * ---- 获取用户信息 ----
 */
export function getToken() {
  return JSON.parse((sessionStorage as any).getItem(TokenKey));
}

/** 通过鉴权码获取授权信息 */
export async function getAuthBySecret(secret:string){
  const cubeAuthService = new CubeAuthService(CubeTerminalEnum.BUSINESS)
  const res = await cubeAuthService.getTokenBySecret(secret)
  const token = {
    access_token:res.accessToken,
    refresh_token:res.refreshToken
  }
  setToken(token)
  const nowEnterprise={
    code:res.tenant
  }
  setNowEnterprise(JSON.stringify(nowEnterprise))
}