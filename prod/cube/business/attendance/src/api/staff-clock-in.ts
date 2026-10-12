import { Post, type BaseAPIResult, Get, Delete, Put, service } from '@ghcloud/ghcloud-business-request'
import type { PageResult } from './common-type'
import type { ClockInClassesStatus, ClockInStatus } from '@/types/classes'
// import type { PageResult } from './common-type'

/** 获取设备列表 */
export const getHolidayApi = async (year: number, month: number): Promise<BaseAPIResult<{ almanac: { month: string; }[]; }[]>> => {
  const params = {
    year, month
  }
  return Get('/attendance/att/scheduling/rule/legal/holidays', { params })
}

/** 获取设备列表 */
export const getDeviceList = async (params: unknown): Promise<BaseAPIResult> => {
  return Get('/device/device/instance/list-page', { params })
}

/** 获取设备台账列表 */
export const getEquipmentAccountList = async (params: unknown): Promise<BaseAPIResult> => {
  return Get('/device-supervise/device-account/page', { params })
}

/** 获取设备类型 */
export const getDeviceGenre = async (): Promise<BaseAPIResult> => {
  return Get('/device/device/genre/search')
}

/** 打卡规则 新增 */
export const clockInRulesInsert = async (params: ClockInRules): Promise<BaseAPIResult> => {
  return Post('/attendance/att/clock/rule/add', params)
}

/** 打卡规则 列表 */
export const clockInRulesPage = async (params: unknown): Promise<BaseAPIResult<PageResult>> => {
  return Get('/attendance/att/clock/rule/page', { params })
}

/** 打卡规则 详情 */
export const clockInRulesDetail = async (params: { id: string; }): Promise<BaseAPIResult<ClockInRules & { id: string; }>> => {
  return Get('/attendance/att/clock/rule/detail?id=' + params.id)
}

/** 修改打卡规则 */
export const clockInRulesUpdate = async (params: ClockInRules & { id: string; }): Promise<BaseAPIResult> => {
  return Post('/attendance/att/clock/rule/edit', params)
}

/** 删除打卡规则 */
export const clockInRulesDel = async (params: {
  id: string;
}): Promise<BaseAPIResult> => {
  return Delete('/attendance/att/clock/rule/remove?id=' + params.id)
}

/** 打卡台账 新增 */
export const clockInLedgerPage = async (params: unknown): Promise<BaseAPIResult<PageResult>> => {
  return Get('/attendance/att/clockIn/ledgerPage', { params })
}

/** 打卡台账 导出 */
export const clockInLedgerExport = async (params: unknown): Promise<BaseAPIResult> => {
  return service.get('/attendance/ledger/getClockInLedgerExcel', { params })
}

/** 打卡记录 列表 */
export const clockInRecordPage = async (params: unknown): Promise<BaseAPIResult<PageResult>> => {
  return Get('/attendance/getClockInLog', { params })
}

/** 打卡记录 导出 */
export const clockInRecordExport = async (params: unknown): Promise<BaseAPIResult> => {
  return service.get('/attendance/clockIn/getClockInLogExcel', { params })
}

/** 获取打卡记录 按照日期 */
export const clockInLogByDate = async (params: unknown): Promise<BaseAPIResult<PageResult>> => {
  return Get('/attendance/getClockInLogByDate', { params })
}

/** PC 新增打卡记录 */
export const clockInRecordInsert = async (params: unknown): Promise<BaseAPIResult> => {
  return Post('/attendance/add/clockIn', params)
}

/** 修改打卡记录 */
export const clockInRecordStatusUpdate = async (id: string): Promise<BaseAPIResult> => {
  return Put(`/attendance/update/clockIn/${id}`, {})
}
export interface ClockInRules {
  /**
   * 打卡设备集合
   */
  deviceList?: DeviceParam[];
  /**
   * 是否需要人脸识别
   */
  faceRecognition: boolean;
  /**
   * 打卡地点集合
   */
  locationList?: LocationParam[];
  /**
   * 规则名称
   */
  name: string;
  /**
   * 是否允许外勤
   */
  outClock: boolean;
  /**
   * 打卡方式，DEVICE,GPS
   */
  ways: string;
}

export interface DeviceParam {
  id: string;
  code: string;
  /**
   * 设备型号
   */
  modelName: string;
  /**
   * 设备名称
   */
  name: string;
  /**
   * 设备类型
   */
  genreName: string;
}

export interface LocationParam {
  /**
   * 地点
   */
  address: string;
  /**
   * 维度
   */
  latitude: string;
  /**
   * 经度
   */
  longitude: string;
  /**
   * 范围（米
   */
  ranges: number;
}

/**
 * 考勤信息
 *
 * AttClockInLedgerDetailsResult
 */
export interface AttClockInLedgerDetailsResult {

  id?: number;
  /**
   * 台账id
   */
  iedgerId?: number;

  /**
   * 几号
   */
  today: number;
  /**
   * 周几
   */
  week: string;
  state: ClockInStatus | '';

  details: {
    /**
   * 下班异常信息
   */
    endWorkState?: string;
    /**
         * 下班时间
         */
    endWorkTime?: string;
    /**
       * 上班异常信息
       */
    startWorkState?: string;
    /**
       * 上班时间
       */
    startWorkTime?: string;
    /**
       * 打卡状态
       */
    state: ClockInClassesStatus;
    stateDetails: { name: ClockInStatus; value: string; }[];
    endWorkOmit: boolean | '';
    startWorkOmit: boolean | '';
    startWorkOut: boolean | '';
    endWorkOut: boolean | '';
  }[];
}
