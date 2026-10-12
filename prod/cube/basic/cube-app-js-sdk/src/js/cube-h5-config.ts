import { cubeAppServiceInstance } from './cube-app.service'

let authHeaders: {
  Authorization: string;
  tenant: string;
  terminal: string;
} | undefined

export function getAuthHeaders (): Record<string, string> {
  if (authHeaders === undefined) {
    throw new Error('系统初始化错误')
  }
  return authHeaders
}

export function getApiBaseUrL (): string {
  return __ENV__.baseApiUrL
}

/** 判断当前的环境 外链 Iframe App内嵌 */
export function getEnvironment (): 'iframe' | 'cubeApp' | 'browser' | 'wxMini' | 'cubeDesktopClient' {
  const userAgent = navigator.userAgent.toLowerCase()
  if (userAgent.includes('@ghcloud/desktop-client')){
    return 'cubeDesktopClient'
  }
  if (window.top !== window.self) {
    return 'iframe'
  }
  if (window.cubeAppBridge || userAgent.includes('cube-app')) {
    return 'cubeApp'
  } else if (window.__wxjs_environment && userAgent.includes('miniprogram')) {
    return 'wxMini'
  } else {
    return 'browser'
  }
}

/** 等待 cubeAppBridge 就绪 某些端无法在渲染之前就注入通道，所以H5需要主动等等 */
export async function waitCubeAppReady (): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.cubeAppBridge) {
      resolve()
    } else if (getEnvironment() === 'cubeApp' && window.cubeAppBridge === undefined) {
      setTimeout(async () => {
        await waitCubeAppReady()
        resolve()
      }, 100)
    } else {
      reject(new Error('不在cube-app环境下'))
    }
  })
}

/** 获取APP内部的鉴权信息 */
export async function initAuthHeadersByCubeAppBridge (): Promise<void> {
  authHeaders = await cubeAppServiceInstance.getRequestHeader()
}

/** @deprecated 设置自定义header  目前只有流引擎H5 在使用 */
export function setCustomHeaders (header: {
  Authorization: string;
  tenant: string;
  terminal: string;
}): void {
  authHeaders = header
}
