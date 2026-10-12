import { makeGETRequest, makeListRequest } from "@ghcloud/cube-gateway";
import { BASE_API } from "@ghcloud/cube-protocol";
import type { OuaaGateway } from "@ghcloud/cube-service-interface/ouaa";

export interface TenantUser {
  id?: string | number;
  name?: string;
  username?: string;
  mobile?: string;
  enabled?: boolean;
}

export interface ListTenantUsersParams {
  keyword?: string;
  enabled?: boolean;
  organizationIds?: string[];
  roleIds?: string[];
  userIds?: string[];
}

interface GatewayData<T> {
  data?: T;
}

const unwrapData = <T>(body: T | GatewayData<T>): T => {
  if (body && typeof body === "object" && "data" in body) {
    return (body as GatewayData<T>).data as T;
  }
  return body as T;
};

export const getUsersByIds: OuaaGateway["getUsersByIds"] = async (ids) => {
  const resp = await makeListRequest({
    url: "/gw-bff/ouaa/users/get-by-ids",
    payload: { ids },
  }).send();
  return resp.json();
};

export const getOrganizations: OuaaGateway["getOrganizations"] = async (params) => {
  const resp = await makeListRequest({
    url: "/gw-bff/ouaa/organizations",
    payload: { ...params },
  }).send();
  return resp.json();
};

export const getOrganizationTree: OuaaGateway["getOrganizationTree"] = async (params) => {
  const resp = await makeListRequest({
    url: "/gw-bff/ouaa/organizations/tree",
    payload: { ...params },
  }).send();
  return resp.json();
};

export const getRoles: OuaaGateway["getRoles"] = async () => {
  const resp = await makeListRequest({
    url: "/gw-bff/ouaa/roles",
  }).send();
  return resp.json();
};

export const listUsers: OuaaGateway["listUsers"] = async (params) => {
  const resp = await makeListRequest({
    url: "/gw-bff/ouaa/users",
    payload: { ...params },
  }).send();
  return resp.json();
};

export const listTenantUsers = async (params: ListTenantUsersParams = {}): Promise<TenantUser[]> => {
  const resp = await makeGETRequest({
    url: `${BASE_API}/ouaa/tenant/user/list`,
    payload: { ...params },
  }).send();
  return unwrapData(await resp.json<TenantUser[] | GatewayData<TenantUser[]>>()) ?? [];
};
