import request from "../service/request";
const baseURL = '/api/securitymanagement'
import {GroupControl, TrafficFlowTunnels, UsageStatByArea, UsageStatByType} from './models/securitymanagement'
import {ParkingSeries} from './models/park-management'
/**
 * 群控组实时数据
 */
export function getGroupControl<T extends Record<string, any>>(params?: T) {
    return request<GroupControl>({
        url: baseURL + `/visualizationGroup/getGroupControl`,
        method: "GET",
        params
    })
}
/**
 * 时控实时数据
 */
export function getActualTimeControl<T extends Record<string, any>>(params?: T) {
    return request<ParkingSeries[]>({
        url: baseURL + `/visualizationGroup/getActualTimeControl`,
        method: "GET",
        params
    })
}
/**
 * 净水用量情况
 */
export function usageStatByType<T extends Record<string, any>>(params?: T) {
    return request<UsageStatByType[]>({
        url: baseURL + `/treated-water-usage-hour/usageStatByType`,
        method: "GET",
        params
    })
}
/**
 * 各类型的趋势统计
 */
export function usageStatByTypeAndTime<T extends Record<string, any>>(params?: T) {
    return request<any>({
        url: baseURL + `/treated-water-usage-hour/usageStatByTypeAndTime`,
        method: "GET",
        params
    })
}
/**
 * 按区域统计用水量
 */
export function usageStatByArea<T extends Record<string, any>>(params?: T) {
    return request<UsageStatByArea[]>({
        url: baseURL + `/treated-water-usage-hour/usageStatByArea`,
        method: "GET",
        params
    })
}
/**
 * 获取能耗趋势
 */
export function getElectricityTrend<T extends Record<string, any>>(params?: T) {
    return request<Record<string,any>>({
        url: baseURL + `/data-electricity`,
        method: "GET",
        params
    })
}
/**
 * /用水趋势
 */
export function getWaterTrend<T extends Record<string, any>>(params?: T) {
    return request<Record<string,any>>({
        url: baseURL + `/data-water`,
        method: "GET",
        params
    })
}
/**
 * 获取实时温度趋势 
 */
export function getTemperatureTrend<T extends Record<string, any>>(params?: T) {
    return request<Record<string,any>>({
        url: baseURL + `/data-temperature`,
        method: "GET",
        params
    })
}
/**
 * 获取数据概览 
 */
export function getDataOverView<T extends Record<string, any>>(params?: T) {
    return request<Record<string,any>>({
        url: baseURL + `/data-overview`,
        method: "GET",
        params
    })
}
/**
 * 获取超温统计
 */
export function getBoilerOverTemperStatistics<T extends Record<string, any>>(params?: T) {
    return request<Record<string,any>>({
        url: baseURL + `/boiler-device-statistics`,
        method: "GET",
        params
    })
}
/**
 * 运行分析
 */
export function operationsAnalysisData<T extends Record<string, any>>(params?: T) {
    return request<any>({
        url: baseURL + `/operations-analysis`,
        method: "GET",
        params
    })
}
/**
 * 物流设备状态
 */
export function statusNum<T extends Record<string, any>>(params?: T) {
    return request<any>({
        url: baseURL + `/logistics-area-status-num`,
        method: "GET",
        params
    })
}
/**
 * 设备离线情况
 */
export function deviceStatusNum<T extends Record<string, any>>(params?: T) {
    return request<any>({
        url: baseURL + `/application-device-status-num`,
        method: "GET",
        params
    })
}
/**
 * 信息发布内容分页
 */
export function playRecord<T extends Record<string, any>>(params?: T) {
    return request<any>({
        url: baseURL + `/play-record`,
        method: "GET",
        params
    })
}
/**
 * 示教情况总览
 */
export function teachOverview<T extends Record<string, any>>(params?: T) {
    return request<any>({
        url: baseURL + `/overview`,
        method: "GET",
        params
    })
}
/**
 * 示教直播场次
 */
export function broadcastSessions<T extends Record<string, any>>(params?: T) {
    return request<any>({
        url: baseURL + `/teaching-live-broadcast-sessions`,
        method: "GET",
        params
    })
}
/**
 *最受欢迎视频
 */
export function popularVideos<T extends Record<string, any>>(params?: T) {
    return request<any>({
        url: baseURL + `/most-popular-videos`,
        method: "GET",
        params
    })
}
/**
 *紧急电话列表
 */
export function emergencyPhone<T extends Record<string, any>>(params?: T) {
    return request<any>({
        url: baseURL + `/emergency-phone-number-page`,
        method: "GET",
        params
    })
}
/**
 *电话使用趋势
 */
export function telephoneTrends<T extends Record<string, any>>(params?: T) {
    return request<any>({
        url: baseURL + `/telephone-usage-trends`,
        method: "GET",
        params
    })
}
/**
 *隧道今日车流量分析
 */
export function trafficFlowTunnels<T extends Record<string, any>>(params?: T) {
    return request<TrafficFlowTunnels>({
        url: baseURL + `/analysis-today-traffic-flow-tunnels`,
        method: "GET",
        params
    })
}
/**
 *隧道不同车道车流量分析
 */
export function differentTunnels<T extends Record<string, any>>(params?: T) {
    return request<any>({
        url: baseURL + `/analysis-different-lanes-tunnels`,
        method: "GET",
        params
    })
}
/**
 *断面实时平均车速分析
 */
export function speedAnalysis<T extends Record<string, any>>(params?: T) {
    return request<any>({
        url: baseURL + `/real-average-speed-analysis`,
        method: "GET",
        params
    })
}
/**
 *隧道CO浓度趋势分析
 */
export function concentrationTunnels<T extends Record<string, any>>(params?: T) {
    return request<any>({
        url: baseURL + `/trend-analysis-co-concentration-tunnels`,
        method: "GET",
        params
    })
}
/**
 *隧道环境指标实时监测
 */
export function environmentalIndicators<T extends Record<string, any>>(params?: T) {
    return request<any>({
        url: baseURL + `/environmental-indicators`,
        method: "GET",
        params
    })
}
/**
 *实时隧道环境指标趋势分析
 */
export function analysisRealTime(paragraph: string) {
    return request<any>({
        url: baseURL + `/trend-analysis-real-time/${paragraph}`,
        method: "GET",
    })
}
//PM2.5实时统计
export async function environmentalStatUePm<T extends Record<string, any>>() {
    return await request({
        url: `${baseURL}/environmental/stat/ue-pm25`,
        method: "GET",
    });
}
/**
 *空气质量统计(饼图)
 */
 export function environmentalStatPieGraph<T extends Record<string, any>>(params?: T) {
    return request<any>({
        url: baseURL + `/environmental/stat/pie-graph`,
        method: "GET",
        params
    })
}
/**
 *实时环境指标趋势分析
 */
 export function environmentalStatTrend<T extends Record<string, any>>(params?: T) {
    return request<any>({
        url: baseURL + `/environmental/stat/trend`,
        method: "GET",
        params
    })
}
/**
 *PM2.5环比统计（日+周）
 */
 export function dayAndWeekRatio<T extends Record<string, any>>() {
    return request<any>({
        url: baseURL + `/environmental/stat/day-andWeek-ratio`,
        method: "GET",
    })
}
/**
 *五方通话记录
 */
 export function liftFiveCallLogPage<T extends Record<string, any>>(params?: T) {
    return request<any>({
        url: baseURL + `/lift-fiveCallLog-page`,
        method: "GET",
        params
    })
}
/**
 *今日人员清点 展示今天实到、应到人数
 */
 export function taskTodayCount<T extends Record<string, any>>(params?: T) {
    return request<any>({
        url: baseURL + `/person/roll/call/task/today/count`,
        method: "GET",
        params
    })
}
/**
 *今日异常监区排行榜
 */
 export function taskAbnormalRank<T extends Record<string, any>>(params?: T) {
    return request<any>({
        url: baseURL + `/person/roll/call/task/abnormal/rank`,
        method: "GET",
        params
    })
}
/**
 *实到人数趋势图
 */
 export function taskAttendedTrend<T extends Record<string, any>>(params?: T) {
    return request<any>({
        url: baseURL + `/person/roll/call/task/attended/trend`,
        method: "GET",
        params
    })
}
/**
 *获取应用关联设备
 */
 export function getSecurityDevicePage<T extends Record<string, any>>(code,params?: T) {
    return request<any>({
        url: baseURL + `/getSecurityDevicePage/${code}`,
        method: "GET",
        params
    })
}