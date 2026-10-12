import qs from 'qs'

interface LoginResponse {
  access_token: string;
  tenants: string[];
}

export interface TenantItem {
  code: string;
  name?: string;
  mainEnterprise?: boolean;
  [key: string]: unknown;
}

interface RequestResult<T> {
  code?: number;
  message?: string;
  data?: T;
  error_description?: string;
}

const TERMINAL = 'bimops-manage-app'
const HTTP_OK = 200
const SINGLE_TENANT_COUNT = 1

const normalizeToken = (token: string): string => token.startsWith('Bearer ') ? token : `Bearer ${token}`

const buildHeaders = (token?: string): Record<string, string> => {
  const headers: Record<string, string> = {
    terminal: TERMINAL,
    'Content-Type': 'application/x-www-form-urlencoded'
  }
  if (token) {
    headers.Authorization = normalizeToken(token)
  }
  const tenant = sessionStorage.getItem('GH-NowEnterprise')
  if (tenant) {
    headers.tenant = (JSON.parse(tenant) as { code: string; }).code ?? ''
  }
  return headers
}

const request = async <T>(url: string, init?: RequestInit): Promise<T> => {
  const response = await fetch(url, init)
  if (!response.ok) {
    throw new Error('请求失败')
  }
  const body = await response.json() as RequestResult<T> | T
  if (typeof body === 'object' && body !== null && 'code' in body) {
    const payload = body as RequestResult<T>
    if (payload.code !== HTTP_OK) {
      throw new Error(payload.message ?? payload.error_description ?? '请求失败')
    }
    return payload.data as T
  }
  return body as T
}

const loginByPassword = async (userName: string, password: string): Promise<LoginResponse> => {
  const payload = qs.stringify({
    grant_type: 'pwd',
    scope: 'select',
    code: '1995',
    username: userName,
    password
  })
  return request<LoginResponse>('/gw-bff/auth/token', {
    method: 'POST',
    body: payload,
    headers: buildHeaders()
  })
}

const getTenantList = async (token: string): Promise<TenantItem[]> =>
  request<TenantItem[]>('/api/mdata/tenant/mine', {
    method: 'GET',
    headers: buildHeaders(token)
  })

export interface LoginResult {
  token: string;
  tenant: string;
  terminal: string;
}

export interface LoginContext {
  token: string;
  terminal: string;
  tenantList: TenantItem[];
}

export type TenantResolveResult =
  | { type: 'empty'; }
  | { type: 'selected'; tenant: TenantItem; }
  | { type: 'manual'; tenantList: TenantItem[]; }

export const loginAndGetTenantList = async (userName: string, password: string): Promise<LoginContext> => {
  const loginResult = await loginByPassword(userName, password)
  const tenantList = await getTenantList(loginResult.access_token)
  return {
    token: loginResult.access_token,
    tenantList,
    terminal: TERMINAL
  }
}

export const resolveTenant = (tenantList: TenantItem[]): TenantResolveResult => {
  if (tenantList.length === 0) {
    return { type: 'empty' }
  }
  if (tenantList.length === SINGLE_TENANT_COUNT) {
    return { type: 'selected', tenant: tenantList[0] }
  }
  const mainTenant = tenantList.find((tenant) => tenant.mainEnterprise === true)
  if (mainTenant) {
    return { type: 'selected', tenant: mainTenant }
  }
  return { type: 'manual', tenantList }
}

export const executeLogin = async (userName: string, password: string): Promise<LoginResult> => {
  const loginContext = await loginAndGetTenantList(userName, password)
  const tenantResult = resolveTenant(loginContext.tenantList)
  if (tenantResult.type === 'empty') {
    throw new Error('您尚未加入企业，请联系管理员添加')
  }
  if (tenantResult.type === 'manual') {
    throw new Error('请选择登录企业')
  }
  return {
    token: loginContext.token,
    tenant: tenantResult.tenant.code,
    terminal: loginContext.terminal
  }
}
