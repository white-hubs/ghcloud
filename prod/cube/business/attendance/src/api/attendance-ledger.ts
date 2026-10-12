import { type BaseAPIResult, service, Get } from '@ghcloud/ghcloud-business-request'
import type { ClockInClassesStatus, ClockInStatus } from '@/types/classes'
import type { PageResult } from './common-type'
import { mainStore } from '@/store'
const store = mainStore()
/** 打卡台账 导出 */
export const DayLedgerExport = async (params: unknown): Promise<BaseAPIResult> => {
  return service.get('/attendance/daily/ledger/getLedgerDetailsExcel', {
    headers: {
      permission: store.permissionId
    },
    params
  })
}
export const SummaryLedgerExport = async (params: unknown): Promise<BaseAPIResult> => {
  return service.get('/attendance/att/summary/export', {
    params
  })
}
export const DayLedgerPage = async (params: unknown): Promise<BaseAPIResult<PageResult>> => {
  return Get('/attendance/daily/ledger/getLedgerDetails', {
    headers: {

      permission: store.permissionId
    },
    params
  })
}
export const SummaryLedgerPage = async (params: unknown): Promise<BaseAPIResult<PageResult>> => {
  return Get('/attendance/att/summary/page', {
    headers: {
      permission: store.permissionId
    },
    params
  })
}
/** 状态分页 */
export const SequentialPage = async (params: unknown): Promise<BaseAPIResult<PageResult>> => {
  return Get('/attendance/att/sequential/page', {
    params
  })
}
// 状态详情
export const SequentialDetail = async (params: unknown): Promise<BaseAPIResult> => {
  return Get('/attendance/att/sequential/detail', {
    params
  })
}
export const SequentialLedgerExport = async (params: unknown): Promise<BaseAPIResult> => {
  return service.get('/attendance/att/sequential/export', {
    params
  })
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
