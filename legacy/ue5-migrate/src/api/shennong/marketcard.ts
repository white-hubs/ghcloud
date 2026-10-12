import request from "@/service/request"
const baseURL = '/api/safety-management'

/**
 * @说明 综合分析
 * @returns
 */
export function synthesismarketmard<T extends Record<string, any>>(params: T) {
    // return {
    //     "riskIndex": 0,
    //     "flammableEquipmentNum": 135,
    //     "powderProjectNum": 2,
    //     "fireFightingEquipmentFilingNum": 10988,
    //     "fireFightingEquipmentExpireNum": 0,
    //     "electricVehicleFilingNum": 1785
    // }
    return request<any>({
        url: `${baseURL}/synthesis/statisticalMarketCard`,
        method: "GET",
        params
    });
}
// 综合分析 --> 报警类型环比率
export function typeAlarm<T extends Record<string, any>>(params: T) {
    return request<any>({
        url: `${baseURL}/safety-alarm-statistics/type/chain-ratio`,
        method: "GET",
        params
    });
}
// 电气 安防 消防 用气 安全 --> 报警事件环比
export function eventTypeAlarm<T extends Record<string, any>>(params: T) {
    return request<any>({
        url: `${baseURL}/safety-alarm-statistics/event-type/chain-ratio`,
        method: "GET",
        params
    });
}
// 电气 安防 消防 用气 安全 --> 今日环比
export function eventTodayAlarm<T extends Record<string, any>>(params: T) {
    return request<any>({
        url: `${baseURL}/safety-alarm-statistics/chain-ratio`,
        method: "GET",
        params
    });
}

/**
 * 
 * 消防安全
 * @returns 
 */
export function fireSafetyMarketCard<T extends Record<string, any>>(params: T) {
    return request<any>({
        url: `${baseURL}/fireSafety/statisticalMarketCard`,
        method: "GET",
        params
    });
}
/**
 * 
 * 用气
 * @returns 
 */
export function useAirMarketCard<T extends Record<string, any>>(params: T) {
    return request<any>({
        url: `${baseURL}/useAir/statisticalMarketCard`,
        method: "GET",
        params
    });
}
/**
 * 
 * 安全管理
 * @returns 
 */
export function usafetyMarketCard<T extends Record<string, any>>(params: T) {
    return request<any>({
        url: `${baseURL}/safety/marketSafetyCard`,
        method: "GET",
        params
    });
}
export function getdeviceList<T extends Record<string, any>>(params: T) {
    return request<any>({
        url: `${baseURL}/property/deviceList`,
        method: "GET",
        params
    });
}
export function getfireFightingDeviceList<T extends Record<string, any>>(params: T) {
    return request<any>({
        url: `${baseURL}/device/fireFightingDeviceList`,
        method: "GET",
        params
    });
}
export function getDeviceTypeList<T extends Record<string, any>>(params: T) {
    return request<any>({
        url: `${baseURL}/device/getDeviceTypeList`,
        method: "GET",
        params
    });
}
export function hiddenDangerCategory<T extends Record<string, any>>(params: T) {
    return request<any>({
        url: `${baseURL}/safety/hiddenDangerCategory`,
        method: "GET",
        params
    });
}
export function hiddenDangerList<T extends Record<string, any>>(params: T) {
    return request<any>({
        url: `${baseURL}/safety/hiddenDangerList`,
        method: "GET",
        params
    });
}
export function diskdetail<T extends Record<string, any>>(params: T) {
    return request<any>({
        url: `${baseURL}/riskIndex/detail`,
        method: "GET",
        params
    });
}

