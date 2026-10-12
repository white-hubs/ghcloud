import request from "@/utils/request";
let baseURL = "/api/ouaa";

export const tenantUsersPost = data =>
  request({
    url: baseURL + "/authenticated/user-under-tenant/page",
    method: "post",
    data: {
      ...data,
      enabled: true
    },
  });
export const tenantUsers = params =>
  request({
    url: baseURL + "/authenticated/user-under-tenant/page",
    method: "get",
    params: {
      ...params,
      enabled: true
    },
  });
export const getOrganizations = params =>
  request({
    url: baseURL + "/authenticated/organizations",
    method: "get",
    params: { ...params, enabled: true },
  });
