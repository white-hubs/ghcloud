import { type BaseAPIResult, Delete, Get, Post, Put } from '@ghcloud/ghcloud-business-request'
export interface ShowRecordState {
  id: string;
  thirdProgramId: string;
  programName: string;
  categoryName: string;
}
export interface DownloadShowVo {
  thirdProgramId: string;
  materialVos: { materialId: string;materialName: string;address: string; }[] | null;
}
export interface TerminalProgram {
  id: string;
  clientId: string;
  clientName: string;
  itemName: string;
  startTime: string;
  stopTime: string;
  totalTime: number;
  totalCircle: number;
  areaId: string;
  areaName: string;
}
export interface PageResult<T> {
  total: number;
  pages: number;
  records: T[];
}

export interface SecurityDevice {
  id: string;
  deviceName: string;
  deviceId: string;
  code: string;
  applicationCode: string;
  areaId: string;
  areaName: string;
  deviceStatus: boolean;
  communicationStatus: string;
  brandCode: string;
  brandName: string;
  thirdPartyId: string;
  lntAndLat: string;
  deviceProdCategoryCode: string;
  deviceProdCategoryCodeConcat: string;
  deviceProdCategoryName: string;
  deviceProdId: string;
  deviceProdName: string;
}
export interface DeviceInfo {
  id: string;
  planName: string;
  planStartTime: number;
  planEndTime: number;
  openTime: string;
  closeTime: string;
  isEnable: number;
  executionCycle: string[];
  openJobTaskId?: unknown;
  closeJobTaskId?: unknown;
  deviceTotal?: unknown;
  securityDevices: SecurityDevice[];
}
interface OriginalValue {
  name: string;
  value: string;
}

interface ExpectedValue {
  name: string;
  value: string;
}
export enum ExecuteEnum {
  ARRIVAL = ' 命令送达',
  ISSUING = '下发中',
  SUCCESS = '成功',
  FAIL = '失败',
  EXPIRED = '超时'
}
export interface DeviceLogVo {
  id: number;
  createTime: string;
  code: string;
  name: string;
  attributeName: string;
  originalValue: OriginalValue | null;
  expectedValue: ExpectedValue | null;
  executeResult: keyof typeof ExecuteEnum | null;
  createBy: string;
}
/** 获取列表 */
export const getPlaybackRecord = async (params: unknown): Promise<BaseAPIResult<PageResult<unknown>>> => {
  return Get('/securitymanagement/play-record', { params })
}
/**
 * 获取下发指令记录
 */
export const getSendShowList = async (params: unknown): Promise<BaseAPIResult<PageResult<unknown>>> => {
  return Get('/securitymanagement/command/dispatch/record/getCommandDispatchRecordPage', { params })
}
/**
 * 获取下发指令记录
 */
export const getSendShowById = async (params: unknown): Promise<BaseAPIResult<unknown>> => {
  return Get('/securitymanagement/command/dispatch/record/getCommandDispatchRecordInfo', { params })
}
/**
 * 发送节目到指定终端
 */
export const sendShowToTerminal = async (params: unknown): Promise<BaseAPIResult<unknown>> => {
  return Post('/securitymanagement/program/sendProgramToTerminal', params)
}
/**
 * 获取节目库列表
 * @param params
 * @returns
 */
export const getShowStoreRecord = async (params: unknown): Promise<BaseAPIResult<PageResult<ShowRecordState>>> => {
  return Get('/securitymanagement/program/getProgramPage', { params })
}
/**
 * 获取节目库详情
 * @param params
 * @returns
 */
export const getDownloadShowInfo = async (params: unknown): Promise<BaseAPIResult<DownloadShowVo[]>> => {
  return Post('/securitymanagement/program/getMaterialsByProgramIds', params)
}
/**
 * 获取终端节目列表
 */
export const getTerminalProgramList = async (params: unknown): Promise<BaseAPIResult<PageResult<TerminalProgram>>> => {
  return Get('/securitymanagement/getProgramSchedulePage', { params })
}
/**
 * 获取关联设备列表
 */
export const getAppContactDeviceList = async (params: unknown): Promise<BaseAPIResult<PageResult<SecurityDevice>>> => {
  return Get('/securitymanagement/getSecurityDevicePage/INFORMATION_PUBLISH', { params })
}
/**
 * 获取开关列表
 */
export const getDefiniteTimeSwitchList = async (params: unknown): Promise<BaseAPIResult<PageResult<unknown>>> => {
  return Get('/securitymanagement/information/plan/getInformationPlanPage', { params })
}
/**
 * 获取开关弹窗设备列表
 */
export const getSwitchDeviceList = async (params: unknown): Promise<BaseAPIResult<PageResult<SecurityDevice>>> => {
  return Get('/securitymanagement/information/plan/getUnusedDevicePage', { params })
}
/**
 * 保存定时开关设置
 */
export const saveDefiniteTimeSwitch = async (params: unknown): Promise<BaseAPIResult<unknown>> => {
  return Put('/securitymanagement/information/plan/saveInformationPlan', params)
}
/**
 * 获取定时开关详情
 */
export const getDefiniteTimeSwitchDetail = async (params: unknown): Promise<BaseAPIResult<DeviceInfo>> => {
  return Get('/securitymanagement/information/plan/getInformationPlanInfo', { params })
}
/**
 * 删除定时开关设置
 */
export const deleteDefiniteTimeSwitch = async (id: string): Promise<BaseAPIResult<unknown>> => {
  return Delete(`/securitymanagement/information/plan/deleteInformationPlan?id=${id}`)
}
/**
 * 删除开关配置的设备
 */
export const deleteSwitchDevice = async (params: { deviceId: string; }): Promise<BaseAPIResult<unknown>> => {
  return Delete('/securitymanagement/information/plan/deleteInfoScreenScheduleAssoc', { params })
}
/**
 * 获取设备日志
 */
export const getDeviceLog = async (params: unknown): Promise<BaseAPIResult<PageResult<DeviceLogVo>>> => {
  return Get('/device-center/device/instance/attribute/change/log/page', { params })
}
