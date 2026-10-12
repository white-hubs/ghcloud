import request from "@/service/request"
import { inspectVehicleTotal, propertyVehicleBar } from './alarm'
import moment from 'moment'
const baseURL = '/api/safety-management'

// 安全教育任务数量统计
export function safetyEducationTaskCount<T extends Record<string, any>>(params: T) {
    return request<any>({
        url: `${baseURL}/safety-education-statistics/task-count`,
        method: "GET",
        params
    });
}
// 市场培训任务统计列表
export function safetyEducationCultivate<T extends Record<string, any>>(params: T) {
    return request<any>({
        url: `${baseURL}/safety-education-statistics/market/cultivate`,
        method: "GET",
        params
    });
}
// 市场考试任务统计列表
export function safetyEducationExam<T extends Record<string, any>>(params: T) {
    return request<any>({
        url: `${baseURL}/safety-education-statistics/market/exam`,
        method: "GET",
        params
    });
}
/**
 * 获取市场异常记录排名
 */
export function getSafetyMarketAbnormalList<T extends Record<string, any>>(params: T) {
    return request<any>({
        url: `${baseURL}/safety/statistics/record/error-ranking`,
        method: "GET",
        params
    });
}
/**
 * 获取市场电动车数据接口
 */
export function getSafetyMarketElectronicCarData<T extends Record<string, any>>(params: T) {
    return request<any>({
        url: `${baseURL}/safety/statistics/record/error-page`,
        method: "GET",
        params
    });
}