import request from "@/service/request"
const baseURL = '/api/safety-management/'
const baseURL2 = '/api/safety-management'

export function alarmModelratio<T extends Record<string, any>>(params: T) {
    return request<any>({
        url: `${baseURL}/safety-alarm-statistics/model/actual-ratio`,
        method: "GET",
        params
    });
}
/**
 * @说明 报警事件占比统计
 * @returns
 */
export function alarmEventRatio<T extends Record<string, any>>(params: T) {
    return request<any>({
        url: `${baseURL}safety-alarm-statistics/event-type/ratio`,
        method: "GET",
        params
    });
}
export function alarmmEventRatio<T extends Record<string, any>>(params: T) {
    return request<any>({
        url: `${baseURL}/safety-alarm-statistics/model-event/ratio`,
        method: "GET",
        params
    });
}
/**
 * @说明 报警响应情况统计
 * @returns
 */
export async function alarmConfirmSituation<T extends Record<string, any>>(params: T) {
    return await request<any>({
        url: `${baseURL}safety-alarm-statistics/confirm-situation`,
        method: "GET",
        params
    });
}
/**
 * @说明 报警处理情况分析
 * @returns
 */
export function alarmHandlerAnalysis<T extends Record<string, any>>(params: T) {
    return request<any>({
        url: `${baseURL}safety-alarm-statistics/handler-situation-analysis`,
        method: "GET",
        params
    });
}
/**
 * @说明 报警记录
 * @returns
 */
export function alarmRecordPage<T extends Record<string, any>>(params: T) {
    return request<any>({
        url: `${baseURL}alarm-record/page`,
        method: "GET",
        params
    });
}
/**
 * @说明 报警趋势分析
 * @returns
 */
export function alarmTrendAnalysis<T extends Record<string, any>>(params: T) {
    return request<any>({
        url: `${baseURL}safety-alarm-statistics/trend-analysis`,
        method: "GET",
        params
    });
}
/**
 * @说明 报警情况统计
 * @returns
 */
export function alarmStatistics<T extends Record<string, any>>(params: T) {
    return request<any>({
        url: `${baseURL}safety-alarm-statistics/situation`,
        method: "GET",
        params
    });
}
/**
 * @说明 报警排名
 * @returns
 */
export function alarmStatisticsRank<T extends Record<string, any>>(params: T) {
    return request<any>({
        url: `${baseURL}safety-alarm-statistics/ranks`,
        method: "GET",
        params
    });
}
/**
 * @说明 报警事件正确率
 * @returns
 */
export function alarmActualRatio<T extends Record<string, any>>(params: T) {
    return request<any>({
        url: `${baseURL}safety-alarm-statistics//event/actual-ratio`,
        method: "GET",
        params
    });
}

/**
 * @说明 报警分类
 * @returns
 */
export function alarmTypes<T extends Record<string, any>>(params?: T) {
    return request<any>({
        url: `${baseURL}alarm-types`,
        method: "GET",
        params
    });
}
export function riskIndex<T extends Record<string, any>>(params?: T) {
    return request<any>({
        url: `${baseURL}/riskIndex/list`,
        method: "GET",
        params
    });
}

/**
 * @说明 市场配置
 * @returns
 */
export function getMarketConfig<T extends Record<string, any>>(params: T) {
    return request<any>({
        url: `/api/dataintegrate/market-config/${params.id ? params.id : params}`,
        method: "GET",
        params
    });
}
// 巡检车辆违规统计
export function vehicleViolation<T extends Record<string, any>>(params?: T) {
    return request<any>({
        url: `${baseURL2}/safety/statistics/inspect/vehicle-violation`,
        method: "GET",
        params
    });
}
// 电瓶车饼图
export function propertyVehiclePie<T extends Record<string, any>>(params?: T) {
    return request<any>({
        url: `${baseURL2}/safety/statistics/property/vehicle-pie`,
        method: "GET",
        params
    });
}
// 电瓶车数量柱状图
export function propertyVehicleBar<T extends Record<string, any>>(params?: T) {
    return request<any>({
        url: `${baseURL2}/safety/statistics/property/vehicle-bar`,
        method: "GET",
        params
    });
}
// 巡检车辆违规统计
export function inspectVehicleViolation<T extends Record<string, any>>(params?: T) {
    return request<any>({
        url: `${baseURL2}/safety/statistics/inspect/vehicle-violation`,
        method: "GET",
        params
    });
}
// 违规数量总数
export function inspectVehicleTotal<T extends Record<string, any>>(params?: T) {
    return request<any>({
        url: `${baseURL2}/safety/statistics/inspect/violation-total`,
        method: "GET",
        params
    });
}
// 小散工程数量柱状图
export function looseWorksStatisticsCount<T extends Record<string, any>>(params?: T) {
    return request<any>({
        url: `${baseURL2}/loose/works/statistics/count-bar`,
        method: "GET",
        params
    });
}
// 小散工程数量柱状图
export function looseWorksStatisticsStatusPie<T extends Record<string, any>>(data?: T) {
    return request<any>({
        url: `${baseURL2}/loose/works/statistics/status-pie`,
        method: "POST",
        data
    });
}
/**
 * 用气报警高发时段统计
 */
export function alarmHighFrequencyPeriodStat<T extends Record<string, any>>(params: T) {
    return request<any>({
        url: `${baseURL}/safety-alarm-statistics/high-incidence-time/trend-analysis`,
        method: "GET",
        params
    });
}
/**
 * 报警处理情况分析统计
 */
export function alarmHandleAnalysisStat<T extends Record<string, any>>(params: T) {
    return request<any>({
        url: `${baseURL}/safety-alarm-statistics/handler-situation`,
        method: "GET",
        params
    });
}
/**
 * 报警情况统计
 */
export function alarmSituationStat<T extends Record<string, any>>(params: T) {
    return request<any>({
        url: `${baseURL}/safety-alarm-statistics/situation`,
        method: "GET",
        params
    });
}
/**
 * 电动车总数分页列表
 */
export function getElectricVehicleList<T extends Record<string, any>>(params?: T) {
    return request<any>({
        url: `${baseURL2}/safety/property/electric-vehicle/device/page`,
        method: "GET",
        params
    });
}
/**
 *  获取电动车违规情况统计
 */
export function getElectricVehicleViolationStat<T extends Record<string, any>>(params?: T) {
    return request<any>({
        url: `${baseURL2}/safety/electric-vehicle/violation/stat`,
        method: "GET",
        params
    });
}