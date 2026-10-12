const NowEnterpriseKey = "GH-NowEnterprise";

export function setNowEnterprise(data) {
  sessionStorage.setItem(NowEnterpriseKey,data)
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
    sessionStorage.setItem(TokenKey,JSON.stringify(data))
}
/**
 * ---- 获取用户信息 ----
 */
export function getToken() {
  return JSON.parse((sessionStorage as any).getItem(TokenKey));
}
