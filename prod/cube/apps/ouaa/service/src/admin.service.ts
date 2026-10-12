import { CubeRequest, makeCreateRequest, makeDELETERequest, makeListRequest, makeUpdateRequest, Pagination, PaginationQuery } from '@ghcloud/cube-gateway'

interface ListTenantParams {
  code?: number;
  name?: string;
  enabled?: boolean;
}

export interface Tenant {
  id: string;
  code: number;
  name: string;
  createTime: string;
  updateTime: string;
}

export const listTenants = async (params: PaginationQuery<ListTenantParams>): Promise<Pagination<Tenant>> => {
  const resp = await makeListRequest({
    url: '/api/ouaa/tenant/page',
    payload: { ...params },
  }).send()
  return resp.json<Pagination<Tenant>>()
}

interface ListTenantUsersParams {
  tenantId: string;
  keyword?: string;
  admin?: boolean;
  enabled?: boolean;
}

export const listTenantUsers = async (params: PaginationQuery<ListTenantUsersParams>): Promise<Pagination<unknown>> => {
  const resp = await makeListRequest({
    url: `/api/ouaa/tenants/${params.tenantId}/users`,
    payload: {
      pageNumber: params.pageNumber,
      pageSize: params.pageSize,
      keyword: params.keyword,
      admin: params.admin,
      enabled: params.enabled,
    },
  }).send()
  return resp.json<Pagination<unknown>>()
}

export const deleteTenantUser = async (params: { tenant: number | string; userId: string }): Promise<void> => {
  await makeDELETERequest({
    url: `/api/ouaa/tenants/${params.tenant}/users/${params.userId}`,
  }).send()
}

interface UpdateTenantUserParams {
  tenant: number | string;
  userId: string;
  enabled?: boolean;
  admin?: boolean;
}

export const updateTenantUser = async (params: UpdateTenantUserParams): Promise<void> => {
  await makeUpdateRequest({
    url: `/api/ouaa/tenants/${params.tenant}/users/${params.userId}`,
    payload: {
      enabled: params.enabled,
      admin: params.admin,
    },
  }).send()
}

interface ListUserParams {
  keyword?: string;
}

export interface User {
  id: string;
  name: string;
  mobile: string;
}

export const listUsers = async (params: PaginationQuery<ListUserParams>): Promise<Pagination<User>> => {
  const resp = await makeListRequest({
    url: '/api/ouaa/users',
    payload: { ...params },
  }).send()
  return resp.json<Pagination<User>>()
}

interface AddTenantUserParams {
  tenant: number | string;
  userIds: string[];
}

export const addTenantUser = async (params: AddTenantUserParams): Promise<void> => {
  await makeCreateRequest({
    url: `/api/ouaa/tenants/${params.tenant}/users`,
    payload: {
      userIds: params.userIds,
    },
  }).send()
}

export const listUserNotExistTenant = async (params: PaginationQuery<{tenant: number | string; keyword?: string;}>): Promise<Pagination<User>> => {
  const resp = await makeListRequest({
    url: `/api/ouaa/tenants/${params.tenant}/users/list-no-exist`,
    payload: { ...params },
  }).send()
  return resp.json<Pagination<User>>()
}
