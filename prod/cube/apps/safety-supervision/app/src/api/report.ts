import { Get, type BaseAPIResult, Put } from '@ghcloud/ghcloud-business-request'
const baseUrl = '/safety-management'

export const getreportlist = async (params: {
  title?: string;
  pageNumber: number;
  pageSize: number;
  total?: number;
}): Promise<BaseAPIResult> => {
  return Get(baseUrl + '/market-monthly-report/queryByPage', { params })
}

export const escalation = async (id: string): Promise<BaseAPIResult> => {
  return Put(baseUrl + `/public/market-monthly-report/escalation/${id}`, {})
}

// 安全月报分页列表
export const queryByPage = async (params: {
  keyword: string;
  pageNumber: number;
  pageSize: number;
}): Promise<BaseAPIResult> => {
  return Get(baseUrl + '/monthly/report/manage/queryByPage',
    { params })
}

/** 获取月报市场汇总列表 */
export const getAllMarketListByReportId = async (monthlyReportId: string): Promise<BaseAPIResult> => {
  return Get(baseUrl + `/market-monthly-reports/${monthlyReportId}/by-monthly-report`)
}

/** 获取已上报月报市场汇总列表 */
export const getMarketListByReportIdWindUp = async (monthlyReportId: string): Promise<BaseAPIResult> => {
  return Get(baseUrl + `/public/market-monthly-reports/wind-up/${monthlyReportId}/by-monthly-report`)
}

/** 获取未上报月报市场汇总列表 */
export const getMarketListByReportIdNonWindUp = async (monthlyReportId: string): Promise<BaseAPIResult> => {
  return Get(baseUrl + `/public/market-monthly-reports/non-wind-up/${monthlyReportId}/by-monthly-report`)
}

/** 月报外链状态修改 */
export const changeMonthlyReportLinkStatus = async (id: string, enabled: boolean): Promise<BaseAPIResult> => {
  return Put(baseUrl + `/market_month_report_url/${id}/enabled/${enabled}`, {})
}
