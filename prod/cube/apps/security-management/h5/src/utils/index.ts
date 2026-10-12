const SECURITY_MANAGEMENT_IMAGES = '/resource/v1/security-management/images'
export const getAssetsFile = (url: string): string => `${SECURITY_MANAGEMENT_IMAGES}/${url}`
// 获取id
export const getUniqueId = (): string => {
  return 'id-' + new Date().getTime().toString(36) + '-' + Math.random().toString(36).substr(2, 9)
}
// 获取路径参数
export const getUrlParams = (): Record<string, string> => {
  const locationHref = window.location.href
  const str = locationHref.split('?')[1]
  if (!str) return {}
  const params = str.split('&')
  const handleParams: Record<string, string> = {}
  for (let i = 0; i < params.length; i++) {
    const g = params[i].split('=')
    handleParams[g[0]] = g[1]
  }
  return handleParams
}
