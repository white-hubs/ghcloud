import { request } from '@/service/index'
const baseUrl = '/securitymanagement'
/**
 * 报表明细(日)
 * @returns
 */
export const getReportDetailByDay = async (data: unknown): Promise<Service.RequestResult> => {
  return request.post(baseUrl + '/report-detail-day', data)
}
/**
 * 导出报表明细(日)
 * @returns
 */
export const exportReportDetailByDay = async (data: unknown): Promise<unknown> => {
  return request.download(baseUrl + '/report-detail-day/excel', data, {
    responseType: 'blob'
  })
}
/**
 * 报表明细(月)
 * @returns
 */
export const getReportDetailByMonth = async (data: unknown): Promise<Service.RequestResult> => {
  return request.post(baseUrl + '/report-detail-month', data)
}
/**
 * 导出报表明细(月)
 * @returns
 */
export const exportReportDetailByMonth = async (data: unknown): Promise<unknown> => {
  return request.download(baseUrl + '/report-detail-month/excel', data, {
    responseType: 'blob'
  })
}
/**
 * 报表明细(年)
 * @returns
 */
export const getReportDetailByYear = async (data: unknown): Promise<Service.RequestResult> => {
  return request.post(baseUrl + '/report-detail-year', data)
}
/**
 * 导出报表明细(年)
 * @returns
 */
export const exportReportDetailByYear = async (data: unknown): Promise<unknown> => {
  return request.download(baseUrl + '/report-detail-year/excel', data, {
    responseType: 'blob'
  })
}
/**
 * 获取商户明细表格
 */
export const getWholesalerPage = async (params: Record<string, string | null | number | boolean>): Promise<Service.RequestResult> => {
  return request.get(baseUrl + '/wholesaler-detail', { params })
}
/**
 * 导出商户明细
 * @returns
 */
export const exportWholesalerDetail = async (data: Record<string, string | null | number | boolean>): Promise<unknown> => {
  return request.download(baseUrl + '/wholesaler-detail-excel', { ...data }, {
    responseType: 'blob'
  })
}
/**
 * 获取商户明细详情
 */
export const getWholesalerInfo = async (id: string): Promise<Service.RequestResult> => {
  return request.get(`/supplier/gen-supplier/${id}`)
}
/**
 * 获取商户档位信息
 * @param merchantId
 * @returns
 */
export const getMerchantStalls = async (merchantId: string): Promise<Service.RequestResult> => {
  return request.get(`/mdata/stall/${merchantId}/supplier`)
}

/**
 * 冷冻水使用数据、冷冻水使用趋势图、费用趋势
 * @param params
 * @returns
 */
export const getDeviceAllStatistic = async (params: Record<string, unknown>): Promise<Service.RequestResult> => {
  return request.get('/securitymanagement/chilled-water-data', { params })
}
/**
 * 基础数据统计
 * @param params
 * @returns
 */
export const getDeviceBasicStatistic = async (params?: Record<string, string | number>): Promise<Service.RequestResult> => {
  return request.get('/securitymanagement/basic-data-report-analysis', { params })
}
/**
 * 活跃商户数据
 */
export const getActivityMerchant = async (params: Record<string, string | number>): Promise<Service.RequestResult> => {
  return request.get('/securitymanagement/merchant-activity-data', { params })
}
/**
 * 耗电统计
 * @param params
 * @returns
 */
export const getElectricityRate = async (params: Record<string, string | number>): Promise<Service.RequestResult> => {
  return request.get('/securitymanagement/cold-water-electricity', { params: { ...params, timeType: 'Day' } })
}
/**
 *
 */
export const getElectricityList = async (data: unknown): Promise<Service.RequestResult> => {
  return request.post(baseUrl + '/report-detail-electricity', data)
}
export const exportElectricityList = async (data: unknown): Promise<unknown> => {
  return request.download(baseUrl + '/report-detail-electricity/excel', data, {
    responseType: 'blob'
  })
}
/**
 * 新增导入年月报表
 */
export const addYearMonthReport = async (data: FormData): Promise<Service.RequestResult> => {
  return request.post(`${baseUrl}/add-data`, data, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

/**
 * 编辑导入年月报表
 */
export const editYearMonthReport = async (data: FormData): Promise<Service.RequestResult> => {
  return request.post(`${baseUrl}/update-data`, data, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}
/**
 * 下载模板
 * @returns
 */
export const downloadTemplate = async (): Promise<unknown> => {
  return request.download(baseUrl + '/data-download-template', {}, {
    responseType: 'blob'
  })
}
