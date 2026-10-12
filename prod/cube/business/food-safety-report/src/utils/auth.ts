const nowEnterPriseKey = 'GH-NowEnterprise'

export function getNowEnterprise (): { code: string; } {
  return JSON.parse(sessionStorage.getItem(nowEnterPriseKey) ?? '') as { code: string; }
}

const tokenKey = 'GH-Token'

export function getToken (): { access_token: string; name: string; } {
  return JSON.parse(sessionStorage.getItem(tokenKey) ?? '') as { access_token: string; name: string; }
}
const applicationKey = 'GH-currentApplication'
export function getCurrentApplication (): { code: string; name: string;id: string;icon: string; } {
  return JSON.parse(sessionStorage.getItem(applicationKey) ?? '') as { code: string; name: string;id: string;icon: string; }
}

export const setToken = (token: string): void => {
  sessionStorage.setItem('iot-token', token)
}
export const removeToken = (): void => {
  sessionStorage.removeItem('iot-token')
}

export const setTenant = (token: string): void => {
  sessionStorage.setItem('iot-tenant', token)
}
export const getTenant = (): string | null => {
  return sessionStorage.getItem('iot-tenant')
}
export const removeTenant = (): void => {
  sessionStorage.removeItem('iot-tenant')
}
