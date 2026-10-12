import request from "@/service/request"
const baseURL = '/api/safety-management/'
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
        url: `${baseURL}safety-alarm-statistics//trend-analysis`,
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
        url: `${baseURL}safety-alarm-statistics//situation`,
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
