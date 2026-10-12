const nowEnterPriseKey = 'GH-NowEnterprise'

export function getNowEnterprise (): { code: string; } {
  return JSON.parse(sessionStorage.getItem(nowEnterPriseKey) ?? '') as { code: string; }
}
// ---- 设置token ----
const tokenKey = 'GH-Token'

export function getToken (): { access_token: string; name: string; } {
  return JSON.parse(sessionStorage.getItem(tokenKey) ?? '') as { access_token: string; name: string; }
}
const applicationKey = 'GH-currentApplication'
export function getCurrentApplication (): { code: string; name: string;id: string;icon: string; } {
  return JSON.parse(sessionStorage.getItem(applicationKey) ?? '') as { code: string; name: string;id: string;icon: string; }
}
