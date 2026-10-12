import request from "@/utils/request";
let baseURL = "/api/ouaa";

export const getOrganizations = params =>
  request({
    url: baseURL + "/authenticated/organizations",
    method: "get",
    params: {...params,enabled:true},
  });
