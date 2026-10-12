import request from "../service/requestSn";
import { EquipmentDetails } from './models/equipment'
import { EventVideo, GetNorthDeviceDetailSn } from './models/linkage'
const baseURL = '/api/linkage/'

export function getIotDeviceListByEventSn<T extends string>(params) {
  return request<EventVideo[]>({
      url: `/api/linkage/event-iot-device-pros/${params.eventId}`,
      method: "GET",
  });
}
export async function getDeviceInfoSsn<T extends string>(id: T) {
  return await request<EquipmentDetails>({
      url: `${baseURL}getDeviceInfo/${id}`,
      method: "GET",
  });
}
// 获取报警流程日志列表
export function getOperatorLogsSn<T extends Record<string, any>>(params: T) {
  return request<any>({
      url: `/api/alarm/alarm-record/operatorLogs/${params.id ? params.id : params}`,
      method: "GET",
      params: Object.prototype.toString.call(params) === '[object Object]' ? params : null
  });
}
/**
 * @说明 报警状态事件操作列表
 * @returns
 */
export function alarmEventOperatesSn<T extends Record<string, any>>(params: T) {
  return request<any>({
      url: `/api/alarm/alarm-record/state-event-operates/${params.id}`,
      method: "GET",
      params: Object.prototype.toString.call(params) === '[object Object]' ? params : null
  });
}
//根据事件获取摄像机动作执行附件列表
export function getVideoFilePathsSn<T extends string>(params,url) {
  return request<EventVideo[]>({
      url: `${url}/api/linkage/event-video-file-paths/${params.id ? params.id : params}`,
      method: "GET",
  });
}
/**
 * 获取登录会话信息
 */
export function loginSessionSn<T extends Record<string, any>>(params?: T,headers?: T) {
  return request<any>({
      url:  `/api/mdata/video-ptz/login-session`,
      method: "GET",
      params,
      headers
  })
}
/**
* 获取流媒体配置
*/
export function getStreamMediaConfigSn<T extends Record<string,any>>(headers?:T){
      return request({
          url:`/api/mdata//stream-media-configs`,
          method:"GET",
          headers
      })
}
/**
 * @说明 报警记录详情
 * @returns
 */
export function getAlarmRecordIdSn<T extends Record<string, any>>(params: T) {
  return request<any>({
      url: `/api/alarm/alarm-record/${params.id ? params.id : params}`,
      method: "GET",
      params: Object.prototype.toString.call(params) === '[object Object]' ? params : null
  });
}

/**
 * @说明 设备信息
 * @returns
 */
export async function getDeviceInfoSn<T extends string>(id: T) {
  return await request<EquipmentDetails>({
      url: `/api/securityManagement/getDeviceInfo/${id}`,
      method: "GET",
  });
}
export function manualControlIotDeviceSn<T extends string>(data) {
  return request<EventVideo[]>({
      url: `/api/linkage/event-iot-device-pro/ctrl`,
      data,
      method: "POST",
  });
}
export function getIotDeviceProRecordsSn<T extends string>(params) {
  return request<EventVideo[]>({
      url: `/api/linkage/event-iot-device-pro-records/${params?.eventId}`,
      method: "GET",
  });
}
  /** 设备-查询设备详情 （北向） */
export function getNorthDeviceDetailSn<T extends string>(params) {
  return request<GetNorthDeviceDetailSn>({
      url: `/api/iot/north/device/detail`,
      method: "GET",
      params
  });
}

export function scheduleDetail<T extends Record<string, any>>(params: T) {
  return request<any>({
      url: `/api/loose-works/project/schedule/detail/${params.id ? params.id : params}`,
      method: "GET",
      params: Object.prototype.toString.call(params) === '[object Object]' ? params : null
  });
}
export function getFeedbackByScheduleId<T extends Record<string, any>>(params: T) {
  return request<any>({
      url: `/api/loose-works/project/schedule/${params.id}/trackDownList`,
      method: "GET",
      params: Object.prototype.toString.call(params) === '[object Object]' ? params : null
  });
}
export function detailRecordPage<T extends Record<string, any>>(params: T) {
  return request<any>({
      url: `/api/maintain/inspect-record/detail-recordPage`,
      method: "GET",
      params
  });
}
export function getTargetRecordDetail<T extends Record<string, any>>(params: T) {
  return request<any>({
      url: `/api/maintain/inspect-record/target-record-detail`,
      method: "GET",
      params
  });
}
export function getHiddenPage<T extends Record<string, any>>(params: T) {
  return request<any>({
      url: `/api/maintain/hidden/apply/all`,
      method: "GET",
      params
  });
}
// 小散工程整改列表
export function getProjectReformPage<T extends Record<string, any>>(params: T) {
  return request<any>({
      url: `/api/loose-works/project/reform/list`,
      method: "GET",
      params
  });
}

export function getErrItemTagRecordPage<T extends Record<string, any>>(data: T) {
  return request<any>({
      url: `/api/maintain/inspect-record/selectErrItemTagRecord`,
      method: "POST",
      data,
  });
}
export function getErrItemTagRecordDetail<T extends Record<string, any>>(params: T) {
  return request<any>({
      url: `/api/maintain/inspect-record/${params.id ? params.id : params}`,
      method: "GET",
      params: Object.prototype.toString.call(params) === '[object Object]' ? params : null
  });
}