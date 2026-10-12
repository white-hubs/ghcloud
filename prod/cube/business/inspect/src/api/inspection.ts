import { request } from '@/service/index'
import type {
  InspectionResultList, DepartmentQeruy, InspectionDepartmentTable,
  PersonnelQeruy, InspectionPersonnel, ObjectQeruy, InspectionTarget, TaskDetail, HiddenDangerType, PatrolSchemeType,
  InspectionTasksType, InspectionsNumber,
  DepTaskExecutionAnalysis, TaskTimeAnalysis, AnalysisOfAuditResults, InspectionObjTaskAnalysis, InspectionObjAnalysis,
  InspectionObjAbnormalAnalysis,
  ObjInspectionNumTop, NotHaveTaskAnalysisTbale, PagesResult, PointListTable, AddSiteType, GetTargetCategory
} from './model/inspection'
const baseURL = '/maintain'

/** 系统配置 通用分类分页查询 */
export const inspectTypeList = async (): Promise<Service.RequestResult> => {
  return request.get(baseURL + '/inspect-type/list')
}
// 巡检结果统计
export const resultStatistics = async (
  params: {
    pageSize: number;
    pageNumber: number;
    period: string | null;
    typeId: string;
    taskName: string;
  }): Promise<Service.RequestResult<{
  pages: number;
  records: InspectionResultList[];
  total: number; }>> => {
  return request.get(baseURL + '/statistic-analysis/resultStatistics', { params })
}
// 部门巡检统计
export const departmentStatistics = async (
  params: DepartmentQeruy): Promise<Service.RequestResult<InspectionDepartmentTable>> => {
  return request.get(baseURL + '/statistic-analysis/departmentStatistics', { params })
}
// 人员巡检统计
export const staffStatistics = async (
  params: PersonnelQeruy): Promise<Service.RequestResult<{
  pages: number;
  records: InspectionPersonnel[];
  total: number; }>> => {
  return request.get(baseURL + '/statistic-analysis/staffStatistics', { params })
}
// 巡检对象统计
export const objStatistics = async (
  params: ObjectQeruy): Promise<Service.RequestResult<{
  pages: number;
  records: InspectionTarget[];
  total: number; }>> => {
  return request.get(baseURL + '/statistic-analysis/objStatistics', { params })
}
// 人员统计-巡检任务明细
export const taskDetail = async (
  params: {
    period: string | null | undefined;
    depId?: string | null | undefined;
    staffId?: string | null | undefined;
    state?: string;
  }): Promise<Service.RequestResult<{
  pages: number;
  records: TaskDetail[];
  total: number; }>> => {
  return request.get(baseURL + '/statistic-analysis/taskDetail', { params })
}
// 人员统计-巡检次数明细
export const inspectionDetail = async (
  params: {
    period: string | null | undefined;
    depId?: string | null | undefined;
    staffId?: string | null | undefined;
    state?: string;
  }): Promise<Service.RequestResult<{
  pages: number;
  records: TaskDetail[];
  total: number; }>> => {
  return request.get(baseURL + '/statistic-analysis/inspectionDetail', { params })
}
// 人员统计-隐患明细
export const hiddenDangerDetail = async (
  params: {
    period: string | null | undefined;
    objId?: string | null | undefined;
    state?: string;
    taskId?: string | null | undefined;
  }): Promise<Service.RequestResult<{
  pages: number;
  records: HiddenDangerType[];
  total: number; }>> => {
  return request.get(baseURL + '/statistic-analysis/hiddenDangerDetail', { params })
}
// 报修次数明细
export const objStatisticsRepairsDetail = async (
  params: {
    period: string | null | undefined;
    objId?: string | null | undefined;
  }): Promise<Service.RequestResult<{
  pages: number;
  records: HiddenDangerType[];
  total: number; }>> => {
  return request.get(baseURL + '/statistic-analysis/objStatisticsRepairsDetail', { params })
}
// 稽查不匹配项下钻
export const checkDetail = async (
  params: {
    taskId: string | null | undefined;
  }): Promise<Service.RequestResult<{
  pages: number;
  records: HiddenDangerType[];
  total: number; }>> => {
  return request.get(baseURL + '/statistic-analysis/checkDetail', { params })
}
// 巡检任务分析
export const inspectionTaskAnalysis = async (
  params: {
    period: string ;
  }): Promise<Service.RequestResult<InspectionTasksType>> => {
  return request.get(baseURL + '/inspection-analysis/inspectionTaskAnalysis', { params })
}
// 巡检计划分析
export const inspectionPlanAnalysis = async (
  params: {
    period: string ;
  }): Promise<Service.RequestResult<PatrolSchemeType>> => {
  return request.get(baseURL + '/inspection-analysis/inspectionPlanAnalysis', { params })
}
// 巡检次数分析
export const inspectionFrequencyAnalysis = async (
  params: {
    period: string ;
  }): Promise<Service.RequestResult<InspectionsNumber>> => {
  return request.get(baseURL + '/inspection-analysis/inspectionFrequencyAnalysis', { params })
}
// 任务执行分析
export const taskExecutionAnalysis = async (
  params: {
    period: string ;
  }): Promise<Service.RequestResult<any>> => {
  return request.get(baseURL + '/inspection-analysis/taskExecutionAnalysis', { params })
}
// 部门巡检任务分析
export const depTaskExecutionAnalysis = async (
  params: {
    period: string ;
  }): Promise<Service.RequestResult<DepTaskExecutionAnalysis>> => {
  return request.get(baseURL + '/inspection-analysis/depTaskExecutionAnalysis', { params })
}
// 任务耗时分析
export const taskTimeAnalysis = async (
  params: {
    period: string ;
  }): Promise<Service.RequestResult<TaskTimeAnalysis>> => {
  return request.get(baseURL + '/inspection-analysis/taskTimeAnalysis', { params })
}
// 稽查结果分析
export const analysisOfAuditResults = async (
  params: {
    period: string ;
  }): Promise<Service.RequestResult<AnalysisOfAuditResults>> => {
  return request.get(baseURL + '/inspection-analysis/analysisOfAuditResults', { params })
}
// 对象巡检任务分析
export const inspectionObjTaskAnalysis = async (
  params: {
    period: string ;
  }): Promise<Service.RequestResult<InspectionObjTaskAnalysis>> => {
  return request.get(baseURL + '/inspection-analysis/inspectionObjTaskAnalysis', { params })
}
// 巡检对象次数分析
export const inspectionObjAnalysis = async (
  params: {
    period: string ;
  }): Promise<Service.RequestResult<InspectionObjAnalysis>> => {
  return request.get(baseURL + '/inspection-analysis/inspectionObjAnalysis', { params })
}
// 巡检对象异常项分析
export const inspectionObjAbnormalAnalysis = async (
  params: {
    period: string ;
  }): Promise<Service.RequestResult<InspectionObjAbnormalAnalysis>> => {
  return request.get(baseURL + '/inspection-analysis/inspectionObjAbnormalAnalysis', { params })
}
// 对象巡检次数top10
export const objInspectionNumTop = async (
  params: {
    period: string ;
    objType: string ;
  }): Promise<Service.RequestResult<ObjInspectionNumTop[]>> => {
  return request.get(baseURL + '/inspection-analysis/objInspectionNumTop', { params })
}
// 对象异常项数排名top10
export const objAbnormalNumTop = async (
  params: {
    period: string ;
    objType: string ;
  }): Promise<Service.RequestResult<ObjInspectionNumTop[]>> => {
  return request.get(baseURL + '/inspection-analysis/objAbnormalNumTop', { params })
}
// 对象巡检任务数top10
export const objInspectionTaskTop = async (
  params: {
    period: string ;
    objType: string ;
  }): Promise<Service.RequestResult<ObjInspectionNumTop[]>> => {
  return request.get(baseURL + '/inspection-analysis/objInspectionTaskTop', { params })
}
// 对象巡检任务last10
export const objInspectionTaskLast = async (
  params: {
    period: string ;
    objType: string ;
  }): Promise<Service.RequestResult<ObjInspectionNumTop[]>> => {
  return request.get(baseURL + '/inspection-analysis/objInspectionTaskLast', { params })
}
// 此期间没有巡检任务的对象
export const notHaveTaskAnalysisObj = async (
  params: {
    period: string ;
    pageNumber: number;
  }): Promise<Service.RequestResult<NotHaveTaskAnalysisTbale>> => {
  return request.get(baseURL + '/inspection-analysis/notHaveTaskAnalysisObj', { params })
}
/**
 *
 * 现场点
*/
// 现场点列表
export const pointList = async (
  params: {
    pointName: string ;
    pageNumber: number;
    pageSize: number;
  }): Promise<Service.RequestResult<PointListTable>> => {
  return request.get(baseURL + '/inspect/pointList', { params })
}

// 新增现场点类型
export const addSiteType = async (typeName: string): Promise<Service.RequestResult<PointListTable>> => {
  return request.put(baseURL + `/inspect/addType/${typeName}`)
}
// 现场点类型列表
export const getSiteTypeList = async (): Promise<Service.RequestResult<{ id: string;name: string; }[]>> => {
  return request.get(baseURL + '/inspect/sceneTypeList')
}
// 更新现场点类型
export const updateSiteType = async (
  params: { typeId: string;typeName: string; }
): Promise<Service.RequestResult<{ id: string;name: string; }[]>> => {
  return request.put(baseURL + `/inspect/updateType/${params.typeId}/${params.typeName}`)
}
// 新增现场点
export const addSiteTypeData = async (
  params: AddSiteType
): Promise<Service.RequestResult<{ id: string;name: string; }[]>> => {
  return request.put(baseURL + '/inspect/addPoint', params)
}
// 修改现场点
export const updataSiteTypeData = async (
  params: AddSiteType
): Promise<Service.RequestResult<{ id: string;name: string; }[]>> => {
  return request.put(baseURL + '/inspect/updatePoint', params)
}
// 查询现场点列表
export const getSiteList = async (
  params: {
    pointName: string ;
    pageNumber: number;
    pageSize: number;
  }
): Promise<Service.RequestResult<PointListTable>> => {
  return request.get(baseURL + '/inspect/pointList', { params })
}
// 删除现场点
export const deleteSitePoints = async (
  pointId: string
): Promise<Service.RequestResult<PointListTable>> => {
  return request.delete(baseURL + `/inspect/deletePoint/${pointId}`)
}
// 批量删除现场点
export const batchDeleteSitePoints = async (
  params: {idList:string[] | number[]}
): Promise<Service.RequestResult<PointListTable>> => {
  return request.put(baseURL + `/inspect/point/delete-batch`,params)
}
/** 资产清单 下载二维码 */
export const QRcodeDownload = async (params: {
  entityType: string;
  styleId: string;
  entityInfo: { entityId: string; entityName: string;
  }[]; }): Promise<Service.RequestResult<PagesResult>> => {
  return request.post('/identity/qrcode/generate/batch/download', params, { responseType: 'blob' })
}
// 删除现场点
export const deleteSiteType = async (
  typeId: string
): Promise<Service.RequestResult<PointListTable>> => {
  return request.delete(baseURL + `/inspect/deleteType/${typeId}`)
}
// 巡检对象分析
export const getTargetCategory = async (
  params: {
    period: string ;
  }
): Promise<Service.RequestResult<GetTargetCategory>> => {
  return request.get(baseURL + '/inspection-analysis/getTargetCategory', { params })
}
// 巡检类型
export const inspectTypePage = async (
  params: {
    pageNumber: number;
    pageSize: number;
  }
): Promise<Service.RequestResult<PagesResult>> => {
  return request.get(baseURL + '/inspect-type/page', { params })
}
