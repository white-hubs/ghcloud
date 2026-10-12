const NowEnterpriseKey = 'GH-NowEnterprise'

export function getNowEnterprise (): any {
  return JSON.parse((sessionStorage as any).getItem(NowEnterpriseKey))
}
// ---- 设置token ----
const TokenKey = 'GH-Token'

export function getToken (): any {
  return JSON.parse((sessionStorage as any).getItem(TokenKey))
}
export function debounce (fn: any, delay = 1000): Function {
  let timer: any = null
  return () => {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => {
      fn()
    }, delay)
  }
}
