import { StorageEmun, getSessionStorage } from './storage'
interface Enterprise {
  code: string;
}

interface Authorization {
  accessToken: string;
}

export function getNowEnterprise (): Enterprise {
  if (getSessionStorage(StorageEmun.GH_NOWENTERPRISE)) {
    return JSON.parse(getSessionStorage(StorageEmun.GH_NOWENTERPRISE) as string) as Enterprise
  }
  return { code: '1212' }
}
// 获取token
export function getToken (): Authorization {
  const res = getSessionStorage(StorageEmun.GH_TOKEN) as string
  const authorization: Authorization = {
    accessToken: res
  }
  return authorization
}
