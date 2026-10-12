import request from "../service/request";

const baseURL = '/api/youxianqu-park'

//企业投诉趋势
export async function complaintStatTrend<T extends Record<string, any>>(params: T) {
    return await request({
        url: `${baseURL}/complaint/stat/trend`,
        method: "GET",
        params
    });
}
//项目管理分页
export async function projectManagementPage<T extends Record<string, any>>(params: T) {
    return await request({
        url: `${baseURL}/projectManagement/page`,
        method: "GET",
        params
    });
}
//招商计划分页
export async function investmentPlanPage<T extends Record<string, any>>(params: T) {
    return await request({
        url: `${baseURL}/investmentPlan/page`,
        method: "GET",
        params
    });
}
//园区租赁趋势
export async function estateContractStatTrend<T extends Record<string, any>>(params: T) {
    return await request({
        url: `${baseURL}/estateContract/stat/trend`,
        method: "GET",
        params
    });
}
//空间利用率统计
export async function rentRecordStatUtilizationRate<T extends Record<string, any>>() {
    return await request({
        url: `${baseURL}/rentRecord/stat/utilizationRate`,
        method: "GET",
    });
}
//租售记录情况统计
export async function rentRecordStatRentedSold<T extends Record<string, any>>() {
    return await request({
        url: `${baseURL}/rentRecord/stat/rentedSold`,
        method: "GET",
    });
}
