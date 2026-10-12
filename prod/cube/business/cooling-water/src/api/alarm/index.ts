import { request } from '@/service/index'
const baseUrl = '/alarm'
/**
 * 获取报警登记数据
 * @param params
 * @returns
 */
export const getAlarmLevels = async (params?: Record<string, string | boolean | number>): Promise<Service.RequestResult> => {
  return request.get(baseUrl + '/sat-alarm-levels', { params })
}
/**
 * 报警指派
 * @param data
 * @returns
 */
export const handleDesignate = async (data: Record<string, unknown>): Promise<Service.RequestResult> => {
  return request.put(baseUrl + `/alarm-record/assign/${data.id}`, data)
}
/**
 * 报警挂起
 * @param data
 * @returns
 */
export const handlePending = async (data: Record<string, unknown>): Promise<Service.RequestResult> => {
  return request.put(baseUrl + `/alarm-record/suspend/${data.id}`, data)
}
/**
 * 报警处理
 * @param data
 * @returns
 */
export const alarmHandler = async (data: Record<string, unknown>): Promise<Service.RequestResult> => {
  return request.put(baseUrl + `/alarm-record/handler/${data.id}`, data)
}
/**
 * 获取报警详情
 * @param id
 * @returns
 */
export const getAlarmDetail = async (id: string): Promise<Service.RequestResult> => {
  return request.get(baseUrl + `/alarm-record/${id}`)
}
/**
 * 根据事件获取摄像机动作执行附件列表
 * @param eventId
 * @returns
 */
export const getVideoEventAction = async (eventId: string): Promise<Service.RequestResult> => {
  return request.get(`/linkage/event-video-file-paths/${eventId}`)
}
/**
 * 根据事件获取物联设备执行记录
 * @param params
 * @returns
 */
export const getIotDeviceProRecords = async (params: Record<string, string>): Promise<Service.RequestResult> => {
  return request.get(`/linkage/event-iot-device-pro-records/${params.eventId}`, { params })
}
/**
 * 根据事件获取物联设备列表
 * @param params
 * @returns
 */
export const getIotDeviceListByEvent = async (params: Record<string, string>): Promise<Service.RequestResult> => {
  return request.get(`/linkage/event-iot-device-pros/${params.eventId}`, { params })
}
/**
 * 获取报警流程日志列表
 * @param params
 * @returns
 */
export const getAlarmHandleProcessLog = async (params: Record<string, string>): Promise<Service.RequestResult> => {
  return request.get(`${baseUrl}/alarm-record/operatorLogs/${params.id}`, { params })
}
/**
 * 获取报警规则列表
 * @param params
 * @returns
 */
export const getAlarmRulesList = async (params: Record<string, string | null | number>): Promise<Service.RequestResult> => {
  return request.get('/emergency/emergency-rule/list-page', { params })
}
/**
 * 处理启用禁用报警规则
 * @param data
 * @returns
 */
export const handleEnabledAlarmRules = async (data: Record<string, string | null | number | boolean>): Promise<Service.RequestResult> => {
  return request.put('/emergency/emergency-rule/enabled', data)
}
/**
 * 获取设备类型列表
 * @param params
 * @returns
 */
export const getDeviceTypeList = async (params?: Record<string, string | null | number | boolean>): Promise<Service.RequestResult> => {
  return request.get('/device/device/genre/search', { params })
}
/**
 * 获取设备型号列表
 * @param params
 * @returns
 */
export const getDeviceModelList = async (params?: Record<string, string | null | number | boolean>): Promise<Service.RequestResult> => {
  return request.get('/device/device/model/list', { params })
}
/**
 * 获取设备事件
 * @param params
 * @returns
 */
export const deviceModelEventList = async (params: Record<string, string | null | number | boolean>): Promise<Service.RequestResult> => {
  return request.get(`/device/device/model/${params.modelId}/event/code/list`, { params })
}
/**
 * 获取设备属性
 * @param params
 * @returns
 */
export const getModelAttributeList = async (params: Record<string, string | null | number | boolean>): Promise<Service.RequestResult> => {
  return request.get(`/device/device/model/${params.modelId}/associated-attribute`, { params })
}
/**
 * 设备列表分页
 * @param params
 * @returns
 */
export const getSecurityDevicePage = async (params: Record<string, string | null | number | boolean>): Promise<Service.RequestResult> => {
  return request.get(`/device/getSecurityDevicePage/${params.applicationCode}/`, { params })
}
/**
 * 获取设备详情数据
 * @param id
 * @returns
 */
export const getDeviceInfo = async (id: string): Promise<Service.RequestResult> => {
  return request.get(`/securitymanagement/getDeviceInfo/${id}`)
}
/**
 * 设备联动执行
 * @param id
 * @returns
 */
export const executeControlIotDevice = async (data: { eventIotDeviceId: string; }): Promise<Service.RequestResult> => {
  return request.post('/securitymanagement/event-iot-device-pro/ctrl', data)
}
