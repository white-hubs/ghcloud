/** 判断当前的环境 外链 Iframe App内嵌 */
export function getEnvironment (): 'iframe' | 'cubeApp' | 'browser' | 'wxMini' | 'cubeDesktopClient'{
  const userAgent = navigator.userAgent.toLowerCase()
  if (userAgent.includes('@ghcloud/desktop-client')){
    return 'cubeDesktopClient'
  }
  if (window.top !== window.self) {
    return 'iframe'
  }
  // @ts-ignore
  if (window.cubeAppBridge || userAgent.includes('cube-app')) {
    return 'cubeApp'
  // @ts-ignore
  } else if (window.__wxjs_environment && userAgent.includes('miniprogram')) {
    return 'wxMini'
  } else {
    return 'browser'
  }
}