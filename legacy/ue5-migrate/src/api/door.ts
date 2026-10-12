import request from "../service/request";
const baseURL = '/api/door'
import { DevicesStatus, TypeProportion, DoorEventRecordList } from '@/api/models/door'
import { TrafficFowTrend } from '@/api/models/park-management'
/**
 * 设备实时状态
 */
export function getParkingOverview<T extends Record<string, any>>(params?: T) {
    return request<DevicesStatus[]>({
        url:  `/api/device-center/device/visualization/getDeviceStatus`,
        method: "GET",
        params
    })
}
/**
 * 异常事件top5
 */
export function getDoorAnomalousTop<T extends Record<string, any>>(params?: T) {
    return request<DevicesStatus[]>({
        url: baseURL + `/visualization/getDoorAnomalousTop`,
        method: "GET",
        params
    })
}
/**
 * 人流通行趋势
 */
export function getEventRecord<T extends Record<string, any>>(params?: T) {
    return request<TrafficFowTrend>({
        url: baseURL + `/visualization/getEventRecord`,
        method: "GET",
        params
    })
}
/**
 * 通行类型占比
 */
export function getDoorThroughType<T extends Record<string, any>>(params?: T) {
    return request<TypeProportion>({
        url: baseURL + `/visualization/getDoorThroughType`,
        method: "GET",
        params
    })
}
/**
 * 门禁事件记录分页
 */
export function getDoorEventRecord<T extends Record<string, any>>(params?: T) {
    return request<DoorEventRecordList>({
        url: baseURL + `/getDoorEventRecord`,
        method: "GET",
        params
    })
}
/**
 * 门禁事件通行数
 */
export function passedNumByDay<T extends Record<string, any>>(params?: T) {
    return request<number>({
        url: baseURL + `/passedNumByDay`,
        method: "GET",
        params
    })
}
/**
 * 通行汇总
 */
export function getDoorAccessSummary<T extends Record<string, any>>(params?: T) {
    return request<TypeProportion>({
        url: baseURL + `/visualization/getDoorAccessSummary`,
        method: "GET",
        params
    })
}
/**
 * 人员通行趋势
 */
export function recordTrend<T extends Record<string, any>>(params?: T) {
    return request<TypeProportion>({
        url: baseURL + `/visualization/record-trend`,
        method: "GET",
        params
    })
}
/**
 * 门禁事件记录分页
 */
export function visualizationEvent<T extends Record<string, any>>(params?: T) {
    return request<any>({
        url: baseURL + `/visualization-event`,
        method: "GET",
        params
    })
}
/**
 * 人员出入情况统计
 */
export function inOutTrend<T extends Record<string, any>>(params?: T) {
    return request<any>({
        url: baseURL + `/in-out-trend`,
        method: "GET",
        params
    })
}
/**
 * 进出统计
 */
export function doorInOut<T extends Record<string, any>>(params?: T) {
    return request<any>({
        url: baseURL + `/door-in-out`,
        method: "GET",
        params
    })
}
/**
 * 访客趋势统计
 */
export function trendStat<T extends Record<string, any>>(params?: T) {
    return request<any>({
        url: baseURL + `/door/visiting/trend/stat`,
        method: "GET",
        params
    })
}
/**
 * 门禁卡使用状态统计
 */
export function useStatusStat<T extends Record<string, any>>(params?: T) {
    return request<any>({
        url: baseURL + `/door/card/useStatus/stat`,
        method: "GET",
        params
    })
}
/**
 * 门禁事件统计
 */
export function eventNameStat<T extends Record<string, any>>(params?: T) {
    return request<any>({
        url: baseURL + `/door/event/name/stat`,
        method: "GET",
        params
    })
}
/**
 * 访问事件统计（梯控、可视对讲）
 */
export function accessNameStat<T extends Record<string, any>>(params?: T) {
    return request<any>({
        url: baseURL + `/door/access/name/stat`,
        method: "GET",
        params
    })
}
/**
 * 今日巡更统计
 */
export function patrolTodayStatistics<T extends Record<string, any>>(params?: T) {
    return request<any>({
        url: baseURL + `/patrol/today/statistics`,
        method: "GET",
        params
    })
}
/**
 * 今日巡更时段分布
 */
export function patrolTodayTimeFrame<T extends Record<string, any>>(params?: T) {
    return request<any>({
        url: baseURL + `/patrol/today/timeFrame`,
        method: "GET",
        params
    })
}
/**
 * 巡更人员点位排行Top10
 */
export function personLocationTop<T extends Record<string, any>>(params?: T) {
    return request<any>({
        url: baseURL + `/patrol/person/locationTop`,
        method: "GET",
        params
    })
}
/**
 * 巡更点位排行Top10
 */
export function patrolLocationTop<T extends Record<string, any>>(params?: T) {
    return request<any>({
        url: baseURL + `/patrol/location/top`,
        method: "GET",
        params
    })
}
/**
 * 巡更点位趋势图
 */
export function patrolLocationTrend<T extends Record<string, any>>(params?: T) {
    return request<any>({
        url: baseURL + `/patrol/location/trend`,
        method: "GET",
        params
    })
}
/**
 * 今日巡更人员最新位置
 */
export function patrolPersonLocationNew<T extends Record<string, any>>(params?: T) {
    return request<any>({
        url: baseURL + `/patrol/person/locationNew`,
        method: "GET",
        params
    })
}