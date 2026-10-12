import request from "../service/request";
const baseURL = "/api/alarm/";
import {
  AlarmLevelType,
  AlarmRate,
  RecordStatusType,
  AlarmStatusData,
  AlarmTrend,
  AlarmAreaTop,
  AlarmTakeNotesData,
  LuzhouEquipmentAlarmType,
  StatisticsDeviceType,
  AbnormalStatisticsType,
} from "./models/alarm";

/** 报警情况统计 */
export function statisticsSituation<T extends Record<string, any>>(params: T) {
  return request<any>({
    url: `${baseURL}alarm-bim-statistics/situation-ratio`,
    method: "post",
    data: params,
  });
}
/**
 * @说明 报警级别统计
 * @returns
 */
export function statisticsLevel<T extends Record<string, any>>(params: T) {
  return request<any>({
    url: `${baseURL}alarm-bim-statistics/level`,
    method: "GET",
    params,
  });
}
// 报警事件类型统计
export function alarmEventTypeStatisticsc<T extends Record<string, any>>(params: T) {
  return request({
    url: `${baseURL}alarm-bim-statistics/event-type/group-total/search`,
    method: "POST",
    data: params,
  });
}
export const getAlarmDetail = (id) => {
  return request({
    url: baseURL + `alarm-record/${id}`,
    method: "get",
  });
};
export function AlarmBimStatistics<T extends Record<string, any>>(params: T) {
  return request<{ alarmBimStatisticsLevel: any[]; alarmColumnarLevel: any[]; xtitle: any[] }>({
    url: `${baseURL}alarm-bim-statistics/histogram/level`,
    method: "GET",
    params,
  });
}
/**
 * @说明 报警异常统计
 * @returns
 */
export function abnormalStatistics<T extends Record<string, any>>(params: T) {
  return request<AbnormalStatisticsType>({
    url: `${baseURL}equipment-anomaly-statistics`,
    method: "GET",
    params,
  });
}
/**
 * @说明 报警趋势折线图统计
 * @returns
 */
export async function statisticsTrend<T extends Record<string, any>>(params: T) {
  return await request<AlarmTrend[]>({
    url: `${baseURL}alarm-bim-statistics/trend`,
    method: "GET",
    params,
  });
}

/**
 * @说明 报警趋势折线图统计
 * @returns
 */
export async function statistics<T extends Record<string, any>>(data: T) {
  return await request<{
    /**
     * 实报总数
     */
    actualNum: number;
    /**
     * 实报占比
     */
    actualRatio: number;
    /**
     * 误报总数
     */
    impracticalNum: number;
    /**
     * 误报环比
     */
    impracticalRatio: number;
    /**
     * 报警总数环比
     */
    ratio: number;
    /**
     * 报警总数
     */
    totalNum: number;
  }>({
    url: `${baseURL}alarm-bim-result/statistics`,
    method: "post",
    data,
  });
}

/**
 * @说明 报警状态统计(包含报警总数，报警状态分组统计)
 * @returns
 */
export function statisticsStatus<T extends Record<string, any>>(params: T) {
  return request<AlarmStatusData>({
    url: `${baseURL}alarm-bim-statistics/status`,
    method: "GET",
    params,
  });
}
/**
 * @说明 报警区域top5统计
 * @returns
 */
export function statisticsAreaTop<T extends Record<string, any>>(params: T) {
  return request<AlarmAreaTop[]>({
    url: `${baseURL}alarm-bim-statistics/area/top-five`,
    method: "GET",
    params,
  });
}
/**
 * @说明 报警记录列表
 * @returns
 */
export function alarmStatisticsList<T extends Record<string, any>>(params: T) {
  return request<AlarmTakeNotesData>({
    url: `${baseURL}alarm-bim-statistics/records`,
    method: "GET",
    params,
  });
}
export function alarmrecords<T extends Record<string, any>>(params: T) {
  return request<AlarmTakeNotesData>({
    url: `${baseURL}alarm-records`,
    method: "GET",
    params,
  });
}
export function satalarmlevels() {
  return request<any>({
    url: `${baseURL}/sat-alarm-levels`,
    method: "GET",
  });
}
export function satalarmtypes() {
  return request<any>({
    url: `${baseURL}/sat-alarm-types`,
    method: "GET",
  });
}
/**
 * @说明 报警处理排名top5统计
 * @returns
 */
export function alarmHandleTop<T extends Record<string, any>>(params: T) {
  return request<AlarmAreaTop[]>({
    url: `${baseURL}alarm-bim-statistics/user-handler/top-five`,
    method: "GET",
    params,
  });
}
/**
 * @说明 报警处理占比,报警真实性统计
 * @returns
 */
export function alarmStatistics<T extends Record<string, any>>(params: T) {
  return request<AlarmAreaTop[]>({
    url: `${baseURL}alarm-bim-statistics`,
    method: "GET",
    params,
  });
}
/**
 * @说明 报警事件top5统计(含与上期环比
 * @returns
 */
export function statisticsEventTop<T extends Record<string, any>>(params: T) {
  return request<AlarmAreaTop[]>({
    url: `${baseURL}alarm-bim-statistics/event/top-five`,
    method: "GET",
    params,
  });
}
/**
 * @说明 报警设备top5统计
 * @returns
 */
export async function statisticsDeviceTop<T extends Record<string, any>>(params: T) {
  return await request<AlarmAreaTop[]>({
    url: `${baseURL}alarm-bim-statistics/device/top-five`,
    method: "GET",
    params,
  });
}
/**
 * @说明 设备报警率
 * @returns
 */
export function equipmentAlarmRate<T extends Record<string, any>>(params: T) {
  return request<AlarmRate>({
    url: `/api/securitymanagement/equipment-alarm-rate`,
    method: "GET",
    params,
  });
}
/**
 * @说明 报警记录状态统计(报警数,未处理数,超时报警数)
 * @returns
 */
export function recordStatus<T extends Record<string, any>>(params?: T) {
  return request<RecordStatusType>({
    url: `${baseURL}alarm-bim-statistics/record-status`,
    method: "GET",
    params,
  });
}
/**
 * 获取当前用户未处理的报警消息列表
 */

export function getAlarmMsgUnConfirmed<T extends Record<string, any>>(params?: T) {
  return request<any>({
    url: `${baseURL}alarm-msg/un-confirmed/records`,
    method: "GET",
    params,
  });
}
/**
 * 获取当前用户未处理的报警消息数量
 */
export function getAlarmMsgUnConfirmedCount<T extends Record<string, any>>(params?: T) {
  return request<number>({
    url: `${baseURL}alarm-msg/un-confirmed/count`,
    method: "GET",
    params,
  });
}

/**
 * @说明 报警记录详情
 * @returns
 */
export function getAlarmRecordId<T extends Record<string, any>>(params: T) {
  return request<any>({
    url: `${baseURL}alarm-record/${params.id ? params.id : params}`,
    method: "GET",
    params,
  });
}
/**
 * @说明 报警状态事件操作列表
 * @returns
 */
export function alarmEventOperates<T extends Record<string, any>>(params: T) {
  return request<any>({
    url: `${baseURL}alarm-record/state-event-operates/${params.id}`,
    method: "GET",
    params,
  });
}
// 获取报警流程日志列表
export function getOperatorLogs<T extends Record<string, any>>(params: T) {
  return request<any>({
    url: `${baseURL}alarm-record/operatorLogs/${params.id ? params.id : params}`,
    method: "GET",
    params,
  });
}
//获取报警统计
export function getstatus<T extends Record<string, any>>(params: T) {
  return request<any>({
    url: `${baseURL}/alarm-bim-statistics/status`,
    method: "GET",
    params,
  });
}
/**
 * 报警类型态势统计
 */
export function getAlarmSituation<T extends Record<string, any>>(params: T) {
  return request<any>({
    url: `${baseURL}/alarm-bim-statistics/type-situation`,
    method: "GET",
    params,
  });
}
/**
 * 泸州三维设备报警
 */
export function luzhouEquipmentAlarm<T extends Record<string, any>>(params: T) {
  return request<LuzhouEquipmentAlarmType>({
    url: `${baseURL}/device-alarm-num`,
    method: "GET",
    params,
  });
}
/**
 * 产品分类报警top5
 */
export function statisticsDeviceType<T extends Record<string, any>>(params: T) {
  return request<StatisticsDeviceType[]>({
    url: `${baseURL}alarm-bim-statistics/device-type`,
    method: "GET",
    params,
  });
}
/**
 * 应用分组报警统计
 */
export function groupStatistics<T extends Record<string, any>>(params: T) {
  return request<any>({
    url: `${baseURL}application-group-statistics`,
    method: "GET",
    params,
  });
}
/**
 * 报警部门处理排名TOP统计
 */
export function departmentHandlerTop<T extends Record<string, any>>(data: T) {
  return request<any>({
    url: `${baseURL}alarm-bim-statistics/department-handler/top`,
    method: "POST",
    data,
  });
}
/**
 * 根据设备标签分组统计报警正确率
 */
export function deviceTagGroupSearch<T extends Record<string, any>>(data: T) {
  return request<any>({
    url: `${baseURL}alarm-bim-device/statistics/device-tag/group/search`,
    method: "POST",
    data,
  });
}
/**
 * 报警事件分类处理情况列表
 */
export function eventTypeHandlerSearch<T extends Record<string, any>>(data: T) {
  return request<any>({
    url: `${baseURL}alarm-bim-statistics/event-type/handler/search`,
    method: "POST",
    data,
  });
}
/**
 * 报警事件分类分组总数统计
 */
export function groupTotalSearch<T extends Record<string, any>>(data: T) {
  return request<any>({
    url: `${baseURL}/alarm-bim-statistics/event-type/group-total/search`,
    method: "POST",
    data,
  });
}
/**
 * 报警列表
 */
export function alarmRecordsCommonPage<T extends Record<string, any>>(params: T) {
  return request<any>({
    url: `${baseURL}/alarm-records/common-page`,
    method: "GET",
    params,
  });
}
