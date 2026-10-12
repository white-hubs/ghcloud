import { type CubeAuth, CubeGateway } from '@ghcloud/cube-gateway'
import { BASE_API } from '@ghcloud/cube-protocol'
import type { PageResult } from './types'
import type { AreaInfoVO, BimProjectStatisticsVO, BimUserStatisticsVO, DataType, DataTypeVO, DisinfectionUserInfoVO, GroupInfoVO, KeyPlaceExecuteRecordVO, KeyPlacePageVO, ProjectMaterialInfoVO, ProjectPageVO, ProjectStatisticsBaseVO, ProjectStatisticsCycleVO, ProjectStatus, TaskCompletionRecordVO, TaskInfoVO, TaskPageVO, TaskStatus, ProjectProductStatisticsVO, ProjectProductTrendsVO } from './data-viz-dto'

const baseURL = `${BASE_API}/disinfection`

/** 中大合顺消杀项目大屏接口服务 */
export class CubeZDDataVizService {
  private readonly gateway: CubeGateway
  public constructor (auth: CubeAuth) {
    this.gateway = new CubeGateway(auth)
  }

  /** 消杀项目统计 */
  public async getDisinfectionProjectStatistics (): Promise<BimProjectStatisticsVO> {
    const url = `${baseURL}/bim/statistics/disinfection/project/status`
    const res = await this.gateway.get<BimProjectStatisticsVO>({ url })
    return res
  }

  /** 项目分布情况 */
  public async getProjectDistribution (): Promise<{ keyName: string; number: number; }[]> {
    const url = `${baseURL}/bim/statistics/disinfection/project/distribution`
    const res = await this.gateway.get<{ keyName: string; number: number; }[]>({ url })
    return res
  }

  /** 项目周期情况 */
  public async getProjectCycle (): Promise<ProjectStatisticsCycleVO> {
    const url = `${baseURL}/bim/statistics/disinfection/project/cycle`
    const res = await this.gateway.get<ProjectStatisticsCycleVO>({ url })
    return res
  }

  /** 重点场所数量分布 */
  public async getKeyPlaceDistribution (payload?: {
    projectId?: string;
  }): Promise<ProjectStatisticsBaseVO[]> {
    const url = `${baseURL}/bim/statistics/disinfection/project/focus/distribution`
    const res = await this.gateway.get<ProjectStatisticsBaseVO[]>({ url, payload })
    return res
  }

  /** 人员情况分布 */
  public async getPersonnelDistribution (payload?: {
    projectId?: string;
    keyword?: string;
  }): Promise<BimUserStatisticsVO> {
    const url = `${baseURL}/bim/statistics/disinfection/personnel/distribution`
    const res = await this.gateway.get<BimUserStatisticsVO>({ url, payload })
    return res
  }

  /** 人员情况分页列表 */
  public async getPersonnelPageList (payload: {
    keyword?: string;
    organizationId?: string;
    projectId?: string;
    positionId?: string;
    disinfectionGroupId?: string;
    userIds?: string[];
  }): Promise<DisinfectionUserInfoVO[]> {
    const url = `${baseURL}/bim/statistics/disinfection/personnel/distribution/list`
    const res = await this.gateway.get<DisinfectionUserInfoVO[]>({ url, payload })
    return res
  }

  /** 重点场所地址分布 */
  public async getFocusDistribution (): Promise<ProjectStatisticsBaseVO[]> {
    const url = `${baseURL}/bim/statistics/disinfection/focus/distribution`
    const res = await this.gateway.get<ProjectStatisticsBaseVO[]>({ url })
    return res
  }

  /** 人员部门分布 */
  public async getPersonnelDepartment (): Promise<ProjectStatisticsBaseVO[]> {
    const url = `${baseURL}/bim/statistics/disinfection/personnel/department`
    const res = await this.gateway.get<ProjectStatisticsBaseVO[]>({ url })
    return res
  }

  /** 人员岗位分布 */
  public async getPersonnelPost (): Promise<ProjectStatisticsBaseVO[]> {
    const url = `${baseURL}/bim/statistics/disinfection/personnel/post`
    const res = await this.gateway.get<ProjectStatisticsBaseVO[]>({ url })
    return res
  }

  /** 人员任务完成统计 */
  public async getPersonnelTaskComplete (payload: {
    period?: string;
  }): Promise<ProjectStatisticsBaseVO[]> {
    const url = `${baseURL}/bim/statistics/disinfection/personnel/task/complete`
    const res = await this.gateway.get<ProjectStatisticsBaseVO[]>({ url, payload })
    return res
  }

  /** 分类列表 */
  public async getDataTypeListAll (payload: {
    dataType: DataType;
  }): Promise<DataTypeVO[]> {
    const url = `${baseURL}/disinfection/data-types/list-all`
    const res = await this.gateway.get<DataTypeVO[]>({ url, payload })
    return res
  }

  /** 重点场所列表 */
  public async getKeyPlacesListAll (payload?: {
    keyword?: string;
    dataTypeId?: string;
    projectId?: string;
    area?: string;
  }): Promise<KeyPlacePageVO[]> {
    const url = `${baseURL}/disinfection/key-places/list-all`
    const res = await this.gateway.get<KeyPlacePageVO[]>({ url, payload })
    return res
  }

  /** 项目列表 */
  public async getProjectsListAll (payload?: {
    keyword?: string;
    status?: ProjectStatus;
    area?: string;
    /**
     * 项目周期
     * ONE_MONTH :1个月
     * ONE_TO_THREE_MONTH :1-3个月
     * THREE_TO_SIX_MONTH :3-6个月
     * SIX_MONTH :6个月以上
     */
    typeEnum?: string;
  }): Promise<ProjectPageVO[]> {
    const url = `${baseURL}/disinfection/projects/list-all`
    const res = await this.gateway.get<ProjectPageVO[]>({ url, payload })
    return res
  }

  /** 项目基本信息 */
  public async getProjectsInfo (projectId: string | number): Promise<ProjectPageVO> {
    const url = `${baseURL}/disinfection/projects/${projectId}`
    const res = await this.gateway.get<ProjectPageVO>({ url })
    return res
  }

  /** 项目资料列表 */
  public async getMaterialsListAll (payload?: {
    keyword?: string;
    projectId?: string | number;
  }): Promise<ProjectMaterialInfoVO[]> {
    const url = `${baseURL}/disinfection/materials/list-all`
    const res = await this.gateway.get<ProjectMaterialInfoVO[]>({ url, payload })
    return res
  }

  /** 项目区域列表 */
  public async getAreasListAll (projectId?: string | number): Promise<AreaInfoVO[]> {
    const url = `${baseURL}/disinfection/projects/${projectId}/areas/list-all`
    const res = await this.gateway.get<AreaInfoVO[]>({ url })
    return res
  }

  /** 任务列表 */
  public async getTaskPageList (payload?: {
    deadLinePeriod?: string;
    keyword?: string;
    projectId?: string;
    status?: ProjectStatus;
    pageNumber: number;
    pageSize: number;
  }): Promise<PageResult<TaskPageVO>> {
    const url = `${baseURL}/disinfection/task/page`
    const res = await this.gateway.get<PageResult<TaskPageVO>>({ url, payload })
    return res
  }

  /** 项目任务列表 */
  public async getProjectTaskList (payload?: {
    projectId?: string;
    keyword?: string;
    taskTypeId?: string;
    status?: TaskStatus;
    period?: string;
  }): Promise<TaskPageVO[]> {
    const url = `${baseURL}/disinfection/tasks/list-all`
    const res = await this.gateway.get<TaskPageVO[]>({ url, payload })
    return res
  }

  /** 任务详情 */
  public async getTaskInfo (taskId?: string): Promise<TaskInfoVO> {
    const url = `${baseURL}/disinfection/tasks/${taskId}`
    const res = await this.gateway.get<TaskInfoVO>({ url })
    return res
  }

  /** 任务完成情况 */
  public async getTaskCompletionRecords (taskId?: string): Promise<TaskCompletionRecordVO[]> {
    const url = `${baseURL}/disinfection/tasks/${taskId}/completion-records`
    const res = await this.gateway.get<TaskCompletionRecordVO[]>({ url })
    return res
  }

  /** 项目分组人员列表 */
  public async getProjectGroupsList (projectId: string, payload?: {
    groupId?: string;
    keyword?: string;
    deptId?: string;
    postId?: string;
    projectId?: string;
  }): Promise<GroupInfoVO[]> {
    const url = `${baseURL}/disinfection/projects/${projectId}/groups/list-all`
    const res = await this.gateway.get<GroupInfoVO[]>({ url, payload })
    return res
  }

  /** 重点场所的执行记录 */
  public async getKeyPlaceExecuteRecord (payload?: {
    pageNumber: number;
    pageSize: number;
    keyPlaceId: string;
    period?: string;
    userName?: string;
  }): Promise<KeyPlaceExecuteRecordVO[]> {
    const url = `${baseURL}/bim/disinfection/execute-record/page`
    const res = await this.gateway.get<KeyPlaceExecuteRecordVO[]>({ url, payload })
    return res
  }

  /** 获取重点场所已完成执行记录条数 */
  public async getKeyPlaceCount (payload?: {
    keyPlaceId: string;
  }): Promise<number> {
    const url = `${baseURL}/bim/disinfection/execute-record/key-place-count`
    const res = await this.gateway.get<number>({ url, payload })
    return res
  }

  /** 获取产品总数 */
  public async getProjectProductCount (): Promise<number> {
    const url = `${baseURL}/bim/products/counts`
    const res = await this.gateway.get<number>({ url })
    return res
  }
  /** 获取产品类型总数 */
  public async getProjectProductTypeCount (): Promise<ProjectProductStatisticsVO[]> {
    const url = `${baseURL}/bim/products/type-counts`
    const res = await this.gateway.get<ProjectProductStatisticsVO[]>({ url })
    return res
  }

  /** 获取产品用户总数 */
  public async getProjectProductUserCount (): Promise<ProjectProductStatisticsVO[]> {
    const url = `${baseURL}/bim/products/user-counts`
    const res = await this.gateway.get<ProjectProductStatisticsVO[]>({ url })
    return res
  }

  /** 获取产品新增趋势 **/
  public async getProjectProductTrends (payload?: {
    period?: string;
    productTypeCode?: string;
  }): Promise<ProjectProductTrendsVO[]> {
    const url = `${baseURL}/bim/products/month-product-counts`
    const res = await this.gateway.get<ProjectProductTrendsVO[]>({ url, payload })
    return res
  }

  /** 获取用户新增趋势 **/
  public async getProjectProductUserTrends (payload?: {
    period?: string;
  }): Promise<ProjectProductTrendsVO[]> {
    const url = `${baseURL}/bim/products/month-user-counts`
    const res = await this.gateway.get<ProjectProductTrendsVO[]>({ url, payload })
    return res
  }

  /** 获取产品增增长排名 */
  public async getProjectProductRank (
    payload?: {
      period?: string;
    }
  ): Promise<ProjectProductStatisticsVO[]> {
    const url = `${baseURL}/bim/products/product-new-counts`
    const res = await this.gateway.get<ProjectProductStatisticsVO[]>({ url, payload })
    return res
  }
}
