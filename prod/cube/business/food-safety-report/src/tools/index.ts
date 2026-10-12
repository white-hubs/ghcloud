const nowEnterPriseKey = 'GH-NowEnterprise'
const tokenKey = 'GH-Token'
const applicationKey = 'GH-currentApplication'
export function getNowEnterprise (): { code: string; } {
  return JSON.parse(sessionStorage.getItem(nowEnterPriseKey) ?? '') as { code: string; }
}

export function getToken (): { access_token: string; name: string; } {
  return JSON.parse(sessionStorage.getItem(tokenKey) ?? '') as { access_token: string; name: string; }
}
export function getCurrentApplication (): { code: string; name: string;id: string;icon: string; } {
  return JSON.parse(sessionStorage.getItem(applicationKey) ?? '') as { code: string; name: string;id: string;icon: string; }
}
