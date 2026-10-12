import request from "@/service/request"
import { inspectVehicleTotal, propertyVehicleBar } from './alarm'
import moment from 'moment'
const baseURL = '/api/safety-management'

/**
 * @说明 综合分析统计
 * @returns
 */
export function compreStatistical<T extends Record<string, any>>(params: T) {
    return request<any>({
        url: `${baseURL}/synthesis/statisticalCard`,
        method: "GET",
        params
    });
}
export function emergencyFile<T extends Record<string, any>>(params: T) {
    return request<any>({
        url: `${baseURL}/emergencyFile/statistics`,
        method: "GET",
        params
    });
}

export function emergencyFileDetail<T extends Record<string, any>>(params: T) {
    return request<any>({
        url: `${baseURL}/emergencyFile/detail`,
        method: "GET",
        params
    });
}

// 电气安全卡片 or  安防
export function electricSafetyCard<T extends Record<string, any>>(params: T) {
    return request<any>({
        url: `${baseURL}/safety-alarm-statistics/status`,
        method: "GET",
        params
    });
}
/**消防安全卡片 */
export function fireSafetyCard<T extends Record<string, any>>(params: T) {
    return request<any>({
        url: `${baseURL}/fireSafety/statisticalMarketCard`,
        method: "GET",
        params
    });
}
/**用气安全 */
export function useAirCard<T extends Record<string, any>>(params: T) {
    return request<any>({
        url: `${baseURL}/useAir/statisticalCard`,
        method: "GET",
        params
    });
}
// 电动车卡片
export function electricCarCard() {
    return new Promise(async (resolve, reject) => {
        const yearPeriod = [moment().startOf("year").format('YYYY-MM-DD 00:00:00'), moment().endOf("year").format('YYYY-MM-DD 23:59:59')];
        Promise.all([
            propertyVehicleBar(),
            inspectVehicleTotal({
                period: yearPeriod.join(','),
                type: "THIS_YEAR",
            })
        ]).then((res) => {
            const totalNum = res[0].total
            const abnormalNum  = res[1]
            resolve({
                totalNum: totalNum || 0,
                abnormalNum: abnormalNum || 0
            })
          }).catch((error) => {
            resolve({
                totalNum: 0,
                abnormalNum: 0
            })
          })
      })
}
// 小散卡片
export function looseWorkCarCard() {
    const yearPeriod = [moment().startOf("year").format('YYYY-MM-DD 00:00:00'), moment().endOf("year").format('YYYY-MM-DD 23:59:59')];
    return new Promise(async (resolve, reject) => {
        looseWorkStatistics({
                period: yearPeriod.join(','),
                type: "THIS_YEAR"
            }).then((res) => {
            const totalNum = res.totalNum
            const abnormalNum = res.abnormalNum
            const underwayNum = totalNum - abnormalNum
            resolve({
                totalNum: totalNum || 0,
                underwayNum: underwayNum || 0,
                abnormalNum: abnormalNum || 0,
            })
          }).catch((error) => {
            resolve({
                totalNum: 0,
                underwayNum: 0,
                abnormalNum: 0
            })
          })
      })
}
/**安全管理 */
export function safety<T extends Record<string, any>>(params: T) {
    return request<any>({
        url: `${baseURL}/safety/safetyCard`,
        method: "GET",
        params
    });
}
/**
 * @说明 综合分析市场面板
 * @returns
 */
export function compreMarketCard<T extends Record<string, any>>(params: T) {
    return request<any>({
        url: `${baseURL}/synthesis/statisticalMarketCard`,
        method: "GET",
        params
    });
}
/**
 * @说明 隐患处理概览
 * @returns
 */
export function hiddenDangerOverview<T extends Record<string, any>>(params: T) {
    return request<any>({
        url: `${baseURL}/safety/hiddenDangerOverview`,
        method: "GET",
        params
    });
}
/**
 * @说明 风险指数排行 ？？接口待定
 * @returns
 */
export function riskAnalyse<T extends Record<string, any>>(params: T) {
    return request<any>({
        // url: `${baseURL}/`,
        // method: "GET",
        // params
    });
}
/**
 * @说明 资产建档分析
 * @returns
 */
export function assetfilingAnalyse<T extends Record<string, any>>(params: T) {
    return request<any>({
        url: `${baseURL}/property/filingAnalyse`,
        method: "GET",
        params
    });
}
/**
 * @说明 易燃设备建档分析
 * @returns
 */
export function flammableDevice<T extends Record<string, any>>(params: T) {
    return request<any>({
        url: `${baseURL}/property/flammableDevice`,
        method: "GET",
        params
    });
}
/**
 * @说明 易燃设备列表
 * @returns
 */
export function flammableDeviceList<T extends Record<string, any>>(params: T) {
    return request<any>({
        url: `${baseURL}/property/flammableDeviceList`,
        method: "GET",
        params
    });
}
/**
 * @说明 消防设备到期统计
 * @returns
 */
export function fireDeviceExpire<T extends Record<string, any>>(params: T) {
    return request<any>({
        url: `${baseURL}/property/deviceExpire`,
        method: "GET",
        params
    });
}
/**
 * @说明 消防设备统计
 * @returns
 */
export function fireDeviceData<T extends Record<string, any>>(params: T) {
    return request<any>({
        url: `${baseURL}/device/deviceFiling`,
        method: "GET",
        params
    });
}
/**
 * @说明 消防设备品类分组数量统计
 * @returns
 */
export function fireDeviceCategoryStat<T extends Record<string, any>>(params: T) {
    return request<any>({
        url: `${baseURL}/device/fire/category/stat`,
        method: "GET",
        params
    });
}
/**
 * @说明 获取市场
 * @returns
 */
export function getMarketList<T extends Record<string, any>>(params?: T) {
    return request<any>({
        url: `/api/dataintegrate/market-config/list`,
        method: "GET",
        params
    });
}
/**
 * @说明 获取市场授权管理
 * @returns
 */
export function getMarketPage<T extends Record<string, any>>(params?: T) {
    return request<any>({
        url: `/api/dataintegrate/market-config/page`,
        method: "GET",
        params
    });
}
/**
 * @说明 安全工作情况统计
 * @returns
 */
export function safetyWork<T extends Record<string, any>>(params: T) {
    return request<any>({
        url: `${baseURL}/safety/safetyWork`,
        method: "GET",
        params
    });
}
/**
 * @说明 隐患统计
 * @returns
 */
export function safetyHiddenDanger<T extends Record<string, any>>(params: T) {
    return request<any>({
        url: `${baseURL}/safety/hiddenDanger`,
        method: "GET",
        params
    });
}
/**
 * @说明 小散工程记录
 * @returns
 */
export function safetyProjectRecord<T extends Record<string, any>>(params: T) {
    return request<any>({
        url: `${baseURL}/looseWorks/projectRecord`,
        method: "GET",
        params
    });
}
/**
 * @说明 安全巡检统计
 * @returns
 */
export function safetyInspection<T extends Record<string, any>>(params: T) {
    return request<any>({
        url: `${baseURL}/safety/inspection`,
        method: "GET",
        params
    });
}
/**
 * @说明 巡检任务排名
 * @returns
 */
export function safetyMarketInspection<T extends Record<string, any>>(params: T) {
    return request<any>({
        url: `${baseURL}/safety/marketInspection`,
        method: "GET",
        params
    });
}
/**
 * @说明 临时巡检排名
 * @returns
 */
export function safetyMarketInspectionTemp<T extends Record<string, any>>(params: T) {
    return request<any>({
        url: `${baseURL}/safety/statistics/record/temp-ranking`,
        method: "GET",
        params
    });
}
// 巡检排名
export function safetyMarketInspectionRank<T extends Record<string, any>>(params: T) {
    return request<any>({
        url: `${baseURL}/safety/statistics/record/ranking`,
        method: "GET",
        params
    });
}
/**
 * @说明 安全巡更统计
 * @returns
 */
export function safetyPatrol<T extends Record<string, any>>(params: T) {
    return request<any>({
        url: `${baseURL}/safety/patrol`,
        method: "GET",
        params
    });
}
/**
 * 安全巡更排名
 */
export function getSafetyPatrolRank<T extends Record<string, any>>(params: T) {
    return request<any>({
        url: `${baseURL}/safety/statistics/patrol-ranking`,
        method: "GET",
        params
    });
}
/**
 * @说明 资产建档统计
 * @returns
 */
export function propertyFilingStatistics<T extends Record<string, any>>(params: T) {
    return request<any>({
        url: `${baseURL}/property/propertyFilingStatistics`,
        method: "GET",
        params
    });
}
/**
 * @说明 资产建档统计轮播
 * @returns
 */
export function propertyFilingList<T extends Record<string, any>>(params: T) {
    return request<any>({
        url: `${baseURL}/property/propertyFilingList`,
        method: "GET",
        params
    });
}
/**
 * @说明 安全教育
 * @returns
 */
export function safetyEducation<T extends Record<string, any>>(params: T) {
    return request<any>({
        url: `${baseURL}/safety-education-statistics/themes`,
        method: "GET",
        params
    });
}
/**
 * @说明 小散工程详情列表
 * @returns
 */
export function looseWorksList<T extends Record<string, any>>(params: T) {
    return request<any>({
        url: `${baseURL}/looseWorks/list`,
        method: "GET",
        headers:{
            "backend-ip":'192.168.2.7',
          },
        params
    });
}
/**
 * @说明 安全巡检列表详情
 * @returns
 */
export function inspectionList<T extends Record<string, any>>(params: T) {
    return request<any>({
        url: `${baseURL}/safety/inspectionList`,
        method: "GET",
        params
    });
}
/**
 * @说明 安全临时巡检列表详情
 * @returns
 */
export function inspectionTempList<T extends Record<string, any>>(params: T) {
    return request<any>({
        url: `${baseURL}/safety/statistics/record/temp-page`,
        method: "GET",
        params
    });
}
// 巡检记录分页列表
export function inspectionNewTempList<T extends Record<string, any>>(params: T) {
    return request<any>({
        url: `${baseURL}/safety/statistics/record/page`,
        method: "GET",
        params
    });
}
/**
 * @说明 电子巡更列表详情
 * @returns
 */
export function patrolList<T extends Record<string, any>>(params: T) {
    return request<any>({
        url: `${baseURL}/safety/patrolList`,
        method: "GET",
        params
    });
}
/**
 * @说明 查询巡检类型列表
 * @returns
 */
export function inspectionTypes<T extends Record<string, any>>() {
    return request<any>({
        url: `${baseURL}/safety/inspectionTypes`,
        method: "GET",
    });
}
export function emergencyFilelist<T extends Record<string, any>>(params: T) {
    return request<any>({
        url: `${baseURL}/emergencyFile/detail`,
        method: "GET",
        params
    });
}
export function looseWorkStatistics<T extends Record<string, any>>(params: T) {
    return request<any>({
        url: `${baseURL}/looseWorks/statistics/status-chain`,
        method: "GET",
        params
    });
}
export function looseWorkList<T extends Record<string, any>>(params: T) {
    return request<any>({
        url: `${baseURL}/looseWorks/list`,
        method: "GET",
        params
    });
}
export function looseWorkStatisticsStatus<T extends Record<string, any>>(params: T) {
    return request<any>({
        url: `${baseURL}/looseWorks/statistics/status`,
        method: "GET",
        params
    });
}
/**
 * 培训任务分页列表
 */
export function safetyCultivatePage<T extends Record<string, any>>(params?: T) {
    return request({
        url: baseURL + "/safety-education-statistics/cultivate/page",
        method: "GET",
        params,
    })
  }
/**
 * 考试任务分页列表
 */
export function educationStatisticsExamPage<T extends Record<string, any>>(params?: T) {
    return request({
        url: baseURL + "/safety-education-statistics/exam/page",
        method: "GET",
        params,
    })
  }
