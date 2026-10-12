import { request } from '@/service/index'
enum URL {
  /** 获取汇报类型分页 */
  getReportTypePage = '/report/report-type-page',
  /** 修改类型状态 */
  changeReportTypeStatus = '/report/report-type/',
  changeArrangeTypeStatus = '/report//work-plan-type/',
  /** 更新类型 */
  updateReportType = '/report/report-type-update',
  /** 新增类型 */
  addReportType = '/report/report-type-add',
  addArrangeType = '/report/work-plan-type',
  /** 修改类型状态 */
  delReportType = '/report/report-type/',
  delArrangeType = '/report/work-plan-type/',
  /** 修改流程配置字段 */
  getReportField = '/report/report-field',
  /** 获取安排类型 */
  getPlanType = '/report/work-plan-type/page'
}
interface pageParams {
  pageNumber: number;
  pageSize: number;
  keyword?: string;
  name?: string;
}
/**
 * 获取类型分页
 */
export const getReportTypePage = async (params: pageParams): Promise<{ data: any; }> => {
  const res = await request.get<{ data: any; }>(URL.getReportTypePage, { params })
  return res
}
export const getPlanType = async (params: pageParams): Promise<{ data: any; }> => {
  const res = await request.get<{ data: any; }>(URL.getPlanType, { params })
  return res
}
export const getArrangeTypeList = async (params?: any): Promise<{ data: any; }> => {
  const res = await request.get<{ data: any; }>('/report/work-plan-type/list', { params })
  return res
}
export const getDept = async (): Promise<Service.RequestResult> => {
  return request.get('/ouaa/authenticated/organizations/list', {})
}

/**
 * 修改类型状态
 */
export const changeReportTypeStatus = async (params: { id: string; status: number; }): Promise<{ data: any; }> => {
  const res = await request.put<{ data: any; }>(
    URL.changeReportTypeStatus + params.id + `?status=${params.status}`,
    params
  )
  return res
}
export const changeArrangeTypeStatus = async (params: { id: string; status: number; }): Promise<{ data: any; }> => {
  const res = await request.put<{ data: any; }>(
    URL.changeArrangeTypeStatus + params.id + `?status=${params.status}`,
    params
  )
  return res
}

/**
 * 修改汇报类型
 */
export const updateReportType = async (params: {
  id: string;
  name: string;
  status: number;
}): Promise<{ data: any; }> => {
  const res = await request.put<{ data: any; }>(URL.updateReportType, params)
  return res
}

/**
 * 新增汇报类型
 */
export const addReportType = async (params: { name: string; status: number; }): Promise<{ data: any; }> => {
  const res = await request.post<{ data: any; }>(URL.addReportType, params)
  return res
}
export const addArrangeType = async (params: { name: string; status: number; }): Promise<{ data: any; }> => {
  const res = await request.post<{ data: any; }>(URL.addArrangeType, params)
  return res
}
export const putArrangeType = async (params: { id: string; }): Promise<{ data: any; }> => {
  const res = await request.put<{ data: any; }>(`/report/work-plan-type/${params.id}`, params)
  return res
}

/**
 * 删除汇报类型
 */
export const delReportType = async (params: { id: string; }): Promise<{ data: any; }> => {
  const res = await request.delete<{ data: any; }>(URL.delReportType + params.id)
  return res
}
export const delArrangeType = async (params: { id: string; }): Promise<{ data: any; }> => {
  const res = await request.delete<{ data: any; }>(URL.delArrangeType + params.id)
  return res
}

/**
 * 流程配置类型字段
 */
export const getReportField = async (params: { type: string; }): Promise<{ data: any; }> => {
  const res = await request.get<{ data: any; }>(URL.getReportField, { params })
  return res
}
/**
 * 工作安排
*/
export const getArrangeList = async (params:unknown): Promise<{ data: any; }> => {
  const res = await request.get<{ data: any; }>('/report/work-plan/page', { params })
  return res
}
export const getArrangeInfo = async (id: string): Promise<{ data: any; }> => {
  const res = await request.get<{ data: any; }>(`/report/work-plan/${id}`, { })
  return res
}
export const addArrange = async (params: { name: string; status: number; }): Promise<{ data: any; }> => {
  const res = await request.post<{ data: any; }>('/report/work-plan', params)
  return res
}
export const deleteArrange = async (id: string): Promise<{ data: any; }> => {
  const res = await request.delete<{ data: any; }>(`/report/work-plan/${id}`)
  return res
}

/**
 * 工作汇报统计
*/
export const getReportStatistics = async (params: {
  departmentId?: string | number | boolean | string[] | null;
  departmentIdList?: string | number | boolean | string[] | null;
  pageNumber: number;
  pageSize: number;
  period?: string;
  reportBy?: string;
  userName?: string;
  status?: string | number | boolean | string[] | null;
}): Promise<{ data: any; }> => {
  const res = await request.get<{ data: unknown; }>('/report/report-statistics-pc', { params })
  return res
}

/**
 * 汇报中心
*/
export const getReportCenterPage = async (params: {
  applicationCode?: string;
  businessType?: string | null;
  completionTime?: string;
  organizationId?: string | number | boolean | string[] | null;
  pageNumber: number;
  pageSize: number;
  processInstanceIds?: string;
  reportTypeId?: string | number | boolean | string[] | null;
  startUserId?: number;
  status?: string | number | boolean | string[] | null;
  submitTime?: string;
  type?: string;
  username?: string;
}): Promise<{ data: any; }> => {
  const res = await request.get<{ data: unknown; }>('/report/report-page', { params })
  return res
}
