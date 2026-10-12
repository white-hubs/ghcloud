const baseURL = "/api/device";
const baseURL2 = "/api/device-center";
import { EquipmentInfoType } from "./models/equipment";
/**
 * @说明 获取单设备的关联的监控设备
 * @returns
 */
import request from "../service/request";

export async function associatedVideos(id: string) {
  return await request<any>({
    url: `${baseURL2}/device/associated/videos?deviceId=${id}`,
    method: "GET",
  });
}
/**
 * @说明 设备列表查询(根据业务id+区域id)
 */
export function getDeviceListBuyScene<T extends Record<string, any>>(params: T) {
  return request<any>({
    url: `${baseURL2}/device-bim-scene/devices`,
    method: "GET",
    params,
  });
}
/**
 * @说明 设备查询(根据区域id)
 */
export function getDeviceBuyArea(data: { tagCodes: string[]; areaLevel: number }) {
  return request<EquipmentInfoType[]>({
    url: `${baseURL2}/device/start-with-area/num/by-area-level`,
    method: "post",
    data,
  });
}
/**
 * @说明 设备查询数量
 */
export function getDeviceNumber<T extends Record<string, any>>(params: T) {
  return request<any>({
    url: `${baseURL2}/device/tagCode/status/count`,
    method: "get",
    params,
  });
}

/**
 * 设备属性写值
 */
export function attributeWriteValue<T extends Record<string, any>>(data: T) {
  return request<any>({
    url: `${baseURL}/device/instance/running/attr/control`,
    method: "POST",
    data,
  });
}
export function subscribeDeviceAttribute<T extends Record<string, any>>(data: T) {
  return request<any>({
    url: `${baseURL}/device/instance/running/attr/newSubscribe`,
    method: "POST",
    data,
  });
}
/**
 * 设备态势
 */
export function getDeviceSituation<T extends Record<string, any>>(params?: T) {
  return request<any>({
    url: `${baseURL2}/device/application-statistics/overview`,
    method: "GET",
    params,
  });
}

/**
 * 设备报警统计
 */
export function deviceAlarmNum<T extends Record<string, any>>(params?: T) {
  return request<any>({
    url: `${baseURL}/type-device-alarm-num`,
    method: "GET",
    params,
  });
}
/**
 * 分类设备趋势
 */
export function deviceAlarmTrend<T extends Record<string, any>>(params?: T) {
  return request<any>({
    url: `${baseURL}/type-device-alarm-trend`,
    method: "GET",
    params,
  });
}
/**
 * 设备报警区域
 */
export function deviceAlarmArea<T extends Record<string, any>>(params?: T) {
  return request<any>({
    url: `${baseURL}/type-device-alarm-area`,
    method: "GET",
    params,
  });
}
/**
 * 获取场景下过期设备分页列表
 */
export function expiredPage<T extends Record<string, any>>(params?: T) {
  return request<any>({
    url: `${baseURL2}/device-bim/device/expired/page`,
    method: "GET",
    params,
  });
}
/**
 * 获取场景下过期设备环比统计
 */
export function expiredChain<T extends Record<string, any>>(params?: T) {
  return request<any>({
    url: `${baseURL2}/device-bim/device/expired/chain`,
    method: "GET",
    params,
  });
}
/**
 * 监控态势
 */
export function getMonitorSituation<T extends Record<string, any>>(params?: T) {
  return request<any>({
    url: `${baseURL2}/device/monitoring-situation`,
    method: "GET",
    params,
  });
}
/**
 * 今日气体用量
 */
export function todayGasUsage<T extends Record<string, any>>(params?: T) {
  return request<any>({
    url: `/api/securitymanagement/today-gas-usage`,
    method: "GET",
    params,
  });
}

/**
 * 今日气体用量top5
 */
export function todayGasUsageTop<T extends Record<string, any>>(params?: T) {
  return request<any>({
    url: `/api/securitymanagement/today-gas-usage-top`,
    method: "GET",
    params,
  });
}

/**
 * 气体使用趋势
 */
export function gasUsageTrend<T extends Record<string, any>>(params?: T) {
  return request<any>({
    url: `/api/securitymanagement/gas-usage-trend`,
    method: "GET",
    params,
  });
}

/**
 * 周界区域
 */
export function offlineNum<T extends Record<string, any>>(params?: T) {
  return request<any>({
    url: `/api/securitymanagement/area-offline-num`,
    method: "GET",
    params,
  });
}
/**
 * 水处理实时数据
 */
export function waterTreatment<T extends Record<string, any>>(params?: T) {
  return request<any>({
    url: `/api/securitymanagement/data-water-treatment`,
    method: "GET",
    params,
  });
}

/**
 * 群控组开关次数统计
 */
export function groupControlStat<T extends Record<string, any>>(params?: T) {
  return request<any>({
    url: `/api/securitymanagement/group-control/stat`,
    method: "GET",
    params,
  });
}

export function classification<T extends Record<string, any>>(params?: T) {
  return request<any>({
    url: `/api/securitymanagement/classification-offline`,
    method: "GET",
    params,
  });
}
export function getDeviceListByBusiness<T extends Record<string, any>>(params: T) {
  return request<any>({
    url: `/api/securitymanagement/getDeviceMonitoringPage/${params.applicationCode}`,
    method: "GET",
    params,
  });
}

// 设备属性控制-设配属性控制
export function controlWithPermission<T extends Record<string, any>>(data?: T) {
  return request<any>({
    url: `${baseURL2}/device/instance/running/attr/control-with-permission`,
    method: "POST",
    data,
  });
}
// 根据标签加一组属性编号获取设备以及属性值信息
export function byTagProperties<T extends Record<string, any>>(data?: T) {
  return request<any>({
    url: `${baseURL2}/device/devRelVal/by-tag/properties`,
    method: "POST",
    data,
  });
}
// 设备下发日志
export function attributeLogPage<T extends Record<string, any>>(params?: T) {
  return request<any>({
    url: `${baseURL2}/device/instance/attribute/change/log/page`,
    method: "GET",
    params,
  });
}
// 设备列表查询
export function deviceInstancePage<T extends Record<string, any>>(params?: T) {
  return request<any>({
    url: `${baseURL2}/device/instance/page`,
    method: "POST",
    data: params,
  });
}
