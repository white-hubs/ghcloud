import request from "@/utils/request";
let baseURL = "/api/securitymanagement";
// 设备列表分页
export const getSecurityDevicePage = (params) =>
    request({
        url: baseURL + `/getSecurityDevicePage/${params.applicationCode}`,
        method: "get",
        params,
    });