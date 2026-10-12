import request from "../service/request";
const baseURL = '/api/securitymanagement/'
import { EquipmentInfo, EquipmentDetails } from './models/equipment'
/**
 * @说明 设备数统计
 * @returns
 */
export async function equipmentTotal<T extends Record<string, any>>(params: T) {
    return await request<EquipmentInfo>({
        url: `/api/device-center/device/statistics`,
        method: "GET",
        params
    });
}
/**
 * @说明 设备信息
 * @returns
 */
export async function getDeviceInfo<T extends string>(id: T) {
    return await request<EquipmentDetails>({
        url: `${baseURL}getDeviceInfo/${id}`,
        method: "GET",
    });
}

/** 通过设备编码查询详情 */
export function getDeviceInfoByCode<T extends string>(code: T) {
    return request<any>({
        url: `/api/device-center/device/by-code/${code.replace("#", "%23")}`,
        method: "GET",
    })
}

/**
 * @说明 订阅管理
 * @returns
 */
export async function deviceNewSubscribe<T extends Record<string, any>>(params: T) {
    return await request<any>({
        url: `${baseURL}device/instance/running/attr/newSubscribe`,
        method: "POST",
        data: params
    });
}
/**
 * @说明 设备健康分析
 * @returns
 */
export async function healthProblemsLatest<T extends string>(params: T) {
    return await request<any>({
        url: `${baseURL}device/instance/analysis/health/problems/latest/${params}`,
        method: "GET",
    });
}
/**
 * @说明 获取单设备实时属性
 * @returns
 */
export async function runningAttr<T extends string>(id: T) {
    return await request<any>({
        url: `${baseURL}device/instance/${id}/running/attr`,
        method: "GET",
    });
}