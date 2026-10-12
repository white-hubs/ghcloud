import request from "@/utils/request";
let baseURL = "/api/ouaa";

export const tenantUsersPost = data =>
  request({
    url: baseURL + "/authenticated/user-under-tenant/page",
    method: "post",
    data,
  });
export const getApplications = (params) =>
request({
    url: baseURL + `/tenant-under-tenant/applications`,
    method: 'get',
    params
})