import request from "@/utils/request";
let baseURL = "/api/securitymanagement";
import { cubeDeviceCenterService } from "@/api/service";
// 正常状态设备数
export const getDeviceStatusNumber = (params) =>
    request({
        url: baseURL + `/getStatusList/${params.applicationCode}`,
        method: "get",
        params,
    });

//设备关联-列表选项
export const getDevices = params => cubeDeviceCenterService.getDeviceInstancePageAll(params)
// 设备类型下拉
export const getDeviceGenre = (params) =>
    request({
        url: baseURL + `/getDeviceGenre`,
        method: "get",
        params,
    });
// 设备列表分页
export const getSecurityDevicePage = (params) =>
    request({
        url: baseURL + `/getSecurityDevicePage/${params.applicationCode}`,
        method: "get",
        params,
    });
export const getSecurityDevicePage1 = (params) =>
    request({
        url: baseURL + `/getSecurityDevicePage/SECURITY_MONITORING`,
        method: "get",
        params,
    });
// 设备关联导入
export const addSecurityDevice = (data) =>
    request({
        url: baseURL + `/addSecurityDevice`,
        method: "post",
        data,
    });
// 删除设备
export const deleteSecurityDevice = (params) =>
    request({
        url: baseURL + `/deleteSecurityDevice/${params.id || params}`,
        method: "delete",
    });