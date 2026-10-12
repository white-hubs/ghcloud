// ---- 设置NowEnterprise ----
const NowEnterpriseKey = 'GH-NowEnterprise'
// ---- 设置UserInfo ----
export const setNowEnterprise = (data: any): void => {
  sessionStorage.setItem(NowEnterpriseKey, data)
}

const UserInfoKey = 'GH-UserInfo'
export const getNowEnterprise = (): { code: string; } | null => {
  let nowEnterprise: { code: string; } | null = null
  try {
    const item = sessionStorage.getItem(NowEnterpriseKey)
    if (item) {
      nowEnterprise = JSON.parse(item)
    }
    return nowEnterprise
  } catch (error) {
    return null
  }
}
// ---- 设置token ----
const TokenKey = 'GH-Token'
export const setToken = (data: any): void => {
  sessionStorage.setItem(TokenKey, JSON.stringify(data))
}
export const getToken = (): { access_token: string;tenants: string[]; } | null => {
  let token: { access_token: string; tenants: string[]; } | null = null
  try {
    const item = sessionStorage.getItem(TokenKey)
    if (item) {
      token = JSON.parse(item)
    }
    return token
  } catch (error) {
    return null
  }
}

export const removeToken = (): void => {
  sessionStorage.removeItem(TokenKey)
}
export const removeUserInfo = (): void => {
  sessionStorage.removeItem(UserInfoKey)
}
export const removeNowEnterprise = (): void => {
  sessionStorage.removeItem(NowEnterpriseKey)
}
