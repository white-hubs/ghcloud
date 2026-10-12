const NowEnterpriseKey = 'GH-NowEnterprise'

export function getNowEnterprise (): any {
  return JSON.parse((sessionStorage as any).getItem(NowEnterpriseKey))
}
// ---- 设置token ----
const TokenKey = 'GH-Token'

export function getToken (): { access_token: string; } {
  return JSON.parse((sessionStorage as any).getItem(TokenKey))
}
