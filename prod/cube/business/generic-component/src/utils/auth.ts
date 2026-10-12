const nowEnterpriseKey = 'GH-NowEnterprise'

interface Enterprise {
  code: string;
}

interface Authorization {
  accessToken: string;
}

export function getNowEnterprise (): Enterprise {
  return JSON.parse(sessionStorage.getItem(nowEnterpriseKey) ?? '') as Enterprise
}
// ---- 设置token ----
const tokenKey = 'GH-Token'

export function getToken (): Authorization {
  const res = JSON.parse(sessionStorage.getItem(tokenKey) ?? '') as { access_token: string; }
  const authorization: Authorization = {
    accessToken: res.access_token
  }
  return authorization
}
