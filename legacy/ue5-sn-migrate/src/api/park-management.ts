import request from "../service/request";
const baseURL = '/api/park-management/'
import { PaymentType, ChargingOverviewType, GetParkingOverview, TrafficFowTrend } from '@/api/models/park-management'
/**
 * 车位总览
 */
export function getParkingOverview<T extends Record<string, any>>(params?: T) {
    return request<GetParkingOverview>({
        url: baseURL + `parking/getParkingOverview`,
        method: "GET",
    })
}
/**
 * 车流趋势
 */
export function parkingGetTrafficTrend<T extends Record<string, any>>(params: T) {
    return request<TrafficFowTrend>({
        url: baseURL + `parking/getTrafficTrend`,
        method: "GET",
        params
    })
}
/**
 * 滞留车流分布
 */
export function TrafficFlowDistribution<T extends Record<string, any>>(params?: T) {
    return request<TrafficFowTrend>({
        url: baseURL + `parking/getRetentionTrafficTrend`,
        method: "GET",
        params
    })
}
/**
 * 收费总览
 */
export function getMoneyOverview<T extends Record<string, any>>(params?: T) {
    return request<ChargingOverviewType>({
        url: baseURL + `parking/getMoneyOverview`,
        method: "GET",
        params
    })
}
/**
 * 支付方式比例
 */
export function parkingGetPayType<T extends Record<string, any>>(params?: T) {
    return request<PaymentType[]>({
        url: baseURL + `parking/getPayType`,
        method: "GET",
        params
    })
}
/**
 * 收费趋势
 */
export function parkingGetPayTrend<T extends Record<string, any>>(params?: T) {
    return request<TrafficFowTrend>({
        url: baseURL + `parking/getPayTrend`,
        method: "GET",
        params
    })
}
/**
 * 停车时长分布
 */
export function getParkingDuration<T extends Record<string, any>>(params?: T) {
    return request<TrafficFowTrend>({
        url: baseURL + `parking/getParkingDuration`,
        method: "GET",
        params
    })
}
/**
 * 收费区间分布
 */
export function getPayIntervalTrend<T extends Record<string, any>>(params?: T) {
    return request<TrafficFowTrend>({
        url: baseURL + `parking/getPayIntervalTrend`,
        method: "GET",
        params
    })
}
/**
 * 停车进出统计
 */
export function parkInOut<T extends Record<string, any>>(params?: T) {
    return request<any>({
        url:  baseURL +'park-in-out',
        method: "GET",
        params
    })
}
/**
 * 获取车场信息列表
 */
export function parkingInfos<T extends Record<string, any>>(params?: T) {
    return request<any>({
        url:  baseURL +'parking-infos',
        method: "GET",
        params
    })
}
/**
 * 出入记录分页列表
 */
export function parkingAccessRecords<T extends Record<string, any>>(params?: T) {
    return request<any>({
        url:  baseURL +'parking-access-records',
        method: "GET",
        params
    })
}
/**
 * 今日车辆出入数量统计
 */
export function parkingAccessTotal<T extends Record<string, any>>(params?: T) {
    return request<any>({
        url:  baseURL +'parking-access-record/access-total',
        method: "GET",
        params
    })
}