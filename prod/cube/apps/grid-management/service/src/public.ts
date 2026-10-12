import { type CubeAuth, CubeGateway, type LegacyServiceError } from "@ghcloud/cube-gateway";
import { BASE_API } from "@ghcloud/cube-protocol";
import { CubeVisualizationService } from "@ghcloud/cube-visualization-service";

import type {
  AreaObjectCount,
  BulletinAnnouncement,
  BulletinGridManager,
  FaultApplyDTO,
  FaultApplyHomePageStatisticsDTO,
  GridDTO,
  GridList,
  GridHandoverListParams,
  GridTaskDTO,
  GridTaskStatDTO,
  GridStatisticsChildrenDTO,
  GridStatisticsTotalDTO,
  handoverRecordDTO,
  ModelConfig,
  MyGridDTO,
  PageResult,
  GridHandoverDetailDTO,
} from "./types";

const baseURL = `${BASE_API}/mdata`;
const workCenterBaseURL = `${BASE_API}/workCenter`;
const maintainBaseURL = `${BASE_API}/maintain`;
const ouaaBaseURL = `${BASE_API}/ouaa`;
const contentBaseURL = `${BASE_API}/management`;
/** 网格管理接口 */
export class CubeGridManagementService {
  private readonly gateway: CubeGateway;
  private cubeVisualizationService: CubeVisualizationService;

  public constructor(auth: CubeAuth) {
    this.gateway = new CubeGateway(auth);
    this.cubeVisualizationService = new CubeVisualizationService(auth);
  }
  /**
   * 获取网格列表
   * @param payload
   * @returns
   */
  public async getGridList(payload: {
    pageSize: number;
    pageNumber: number;
    keyword?: string | undefined;
    gridAreaIds?: string[];
  }): Promise<PageResult<GridDTO>> {
    const url = `${baseURL}/grid/area/config/query`;
    const resp = await this.gateway.custom<PageResult<GridDTO>>({ url, payload, method: "POST" });
    return resp;
  }
  /**
   * 设置区域网格配置
   */
  public async setGridAreaConfig(payload: {
    gridAreaId: string;
    gridDepartmentId: string;
    gridManagerIds: string[];
    gridMembers: {
      relationType: string;
      relationIds: string[];
    }[];
    engineeringManager?: string | undefined;
    safetyManager?: string | undefined;
    cleaningManager?: string | undefined;
    meteringManager?: string | undefined;
    meteringStaff?: string | undefined;
  }): Promise<void> {
    const url = `${baseURL}/grid/area/config`;
    await this.gateway.create<void>({ url, payload });
  }
  /**
   * 更新网格区域网格员
   */
  public async updateGridAreaMembers(
    payload: {
      gridAreaId: string;
      memberIds: string[];
    }[],
  ): Promise<void> {
    const url = `${baseURL}/grid/area/config/members`;
    await this.gateway.custom<void>({ url, payload, method: "POST" });
  }
  /**
   * 批量清空网格区域网格员
   */
  public async clearGridAreaMembers(payload: string[]): Promise<void> {
    const url = `${baseURL}/grid/area/config/members`;
    await this.gateway.custom<void>({ url, query: {}, payload, method: "DELETE" });
  }
  /**
   * 根据区域id获取区域网格配置
   */
  public async getGridAreaConfig(gridAreaId: string): Promise<{
    gridAreaId: string;
    gridDepartmentId: string;
    gridManagerIds: string[];
    gridMembers: {
      relationType: string;
      relationIds: string[];
    }[];
    engineeringManager?: string;
    safetyManager?: string;
    cleaningManager?: string;
    meteringManager?: string;
    meteringStaff?: string;
  }> {
    const url = `${baseURL}/grid/area/config/${gridAreaId}`;
    const resp = await this.gateway.get<{
      gridAreaId: string;
      gridDepartmentId: string;
      gridManagerIds: string[];
      gridMembers: {
        relationType: string;
        relationIds: string[];
      }[];
      engineeringManager?: string;
      safetyManager?: string;
      cleaningManager?: string;
      meteringManager?: string;
      meteringStaff?: string;
    }>({ url });
    return resp;
  }
  /**
   * 获取网格统计
   */
  public async getGridStat(): Promise<{ gridCount: number; onDutyGridLeaderCount: number }> {
    const url = `${baseURL}/grid/statistics`;
    const resp = await this.gateway.get<{ gridCount: number; onDutyGridLeaderCount: number }>({ url });
    return resp;
  }
  /**
   * 获取网格总览顶部统计
   */
  public async getGridStatisticsTotal(payload?: { gridAreaId?: string }): Promise<GridStatisticsTotalDTO> {
    const url = `${baseURL}/grid/statistics/total`;
    const resp = await this.gateway.get<GridStatisticsTotalDTO>({ url, payload });
    return resp;
  }
  /**
   * 查询指定网格及下级网格统计
   */
  public async getGridStatisticsChildren(payload: { gridAreaId: string; dailyType: string }): Promise<GridStatisticsChildrenDTO[]> {
    const url = `${baseURL}/grid/statistics/children`;
    const resp = await this.gateway.get<GridStatisticsChildrenDTO[]>({
      url,
      payload,
    });
    return resp;
  }
  /**
   * 获取我的网格
   */
  public async getMyGrid(): Promise<MyGridDTO> {
    const url = `${baseURL}/grid/my`;
    const resp = await this.gateway.get<MyGridDTO>({ url });
    return resp;
  }
  /**
   * 获取我的网格任务统计
   */
  public async getMyGridTaskStat(payload: {
    pageNumber: number;
    pageSize: number;
    gridAreaId?: string;
    userId?: string;
    keyword?: string;
    businessTypes?: string;
    status?: string;
    taskStatus?: string;
    period?: string;
    userIds?: string[];
    dailyType?: string;
  }): Promise<GridTaskStatDTO> {
    const url = `${baseURL}/grid/area/task/num`;
    const resp = await this.gateway.get<GridTaskStatDTO>({ url, payload });
    return resp;
  }
  /**
   * 获取我的网格待办统计
   */
  public async getMyGridTodoTaskStat(payload?: { dailyType: string; userId?: string }): Promise<GridTaskStatDTO> {
    const url = `${baseURL}/grid/area/todo/num`;
    const resp = await this.gateway.get<GridTaskStatDTO>({ url, payload });
    return resp;
  }
  /**
   * 我的网格任务列表
   */
  public async getMyGridTaskList(payload: {
    pageSize: number;
    pageNumber: number;
    keyword?: string;
    gridAreaId?: string;
    taskStatus?: string;
    dailyType?: string;
    userId?: string;
  }): Promise<PageResult<GridTaskDTO>> {
    const url = `${baseURL}/grid/area/task/page`;
    const resp = await this.gateway.list<GridTaskDTO>({ url, payload });
    return resp;
  }
  /**
   * 工单列表
   */
  public async getFaultApplyAll(payload: {
    pageSize: number;
    pageNumber: number;
    keyword?: string;
    areaIds: string[];
    status?: string;
    businessType: string;
    submitTime: string;
    faultTypeId?: string;
    progress?: string;
    processInstanceIds?: string;
  }): Promise<PageResult<FaultApplyDTO>> {
    const url = `${maintainBaseURL}/fault/apply/all`;
    const resp = await this.gateway.get<
      LegacyServiceError<{ page?: number | string; pages?: number | string; records: FaultApplyDTO[]; total: number }>
    >({
      url,
      payload,
    });
    const data = resp.data || resp;
    const pages = Number(data.pages || data.page || Math.ceil((data.total || 0) / payload.pageSize) || 0);
    return {
      pages,
      records: data.records || [],
      total: data.total || 0,
    };
  }
  /**
   * 故障报修首页工单统计
   */
  public async getFaultApplyHomePageStatistics(payload: {
    areaIds: string[];
    period?: string;
    type?: "TODAY" | "THIS_WEEK" | "THIS_MONTH" | "THIS_YEAR";
    admin?: boolean;
    businessType?: string;
  }): Promise<FaultApplyHomePageStatisticsDTO> {
    const url = `${maintainBaseURL}/fault/apply/home-page/statistics`;
    const resp = await this.gateway.get<LegacyServiceError<FaultApplyHomePageStatisticsDTO>>({
      url,
      payload,
    });
    return resp.data || resp;
  }
  /** 网格任务业务来源 */
  public async getGridTaskSource(): Promise<
    {
      code: string;
      name: string;
    }[]
  > {
    const url = `${baseURL}/grid/area/business/select`;
    const resp = await this.gateway.get<
      {
        code: string;
        name: string;
      }[]
    >({ url });
    return resp;
  }
  /**
   * 网格任务列表
   */
  public async getGridTaskList(payload: { pageSize: number; pageNumber: number }): Promise<PageResult<GridTaskDTO>> {
    const url = `${workCenterBaseURL}/work/center/task/query`;
    const resp = await this.gateway.list<GridTaskDTO>({ url, payload });
    return resp;
  }
  /**
   * 获取网格区域对象数统计
   */
  public async getGridAreaObjectCountStat(payload: { gridAreaIds?: string[] }): Promise<AreaObjectCount[]> {
    const url = `${baseURL}/grid/area/object/count`;
    const resp = await this.gateway.custom<AreaObjectCount[]>({ url, payload, method: "POST" });
    return resp;
  }
  /**
   * 网格交接班记录列表
   */
  public async getGridHandoverList(payload: GridHandoverListParams): Promise<PageResult<handoverRecordDTO>> {
    const url = `${baseURL}/grid/handover/list`;
    const resp = await this.gateway.list<handoverRecordDTO>({ url, payload });
    return resp;
  }
  /**
   * 我的网格交班列表
   */
  public async getMyGridShiftList(payload: {
    pageSize: number;
    pageNumber: number;
    takeOverUser: string;
  }): Promise<PageResult<handoverRecordDTO>> {
    const url = `${baseURL}/grid/handover/list`;
    const resp = await this.gateway.list<handoverRecordDTO>({
      url,
      payload: {
        ...payload,
        status: "WAIT_HANDOVER",
        permission: true,
      },
    });
    return resp;
  }
  /**
   * 撤销网格交班
   */
  public async cancelGridHandover(payload: { id: string }): Promise<void> {
    const url = `${baseURL}/grid/handover/cancel/${payload.id}`;
    await this.gateway.delete({ url });
  }
  /**
   * 接收交班
   */
  public async receiveShift(payload: { id: string; takeSignFileId?: string }): Promise<void> {
    const url = `${baseURL}/grid/handover/takeover`;
    await this.gateway.create<void>({ url, payload });
  }

  /**
   * 发起网格交班
   */
  public async addGridHandover(payload: {
    gridAreaIds: string[];
    takeOverUser: string;
    remarks?: string;
    extend?: {
      attInfo1?: string;
      file1?: string[];
      attInfo2?: string;
      file2?: string[];
      attInfo3?: string;
      file3?: string[];
      attInfo4?: string;
      file4?: string[];
    };
  }): Promise<void> {
    const url = `${baseURL}/grid/handover/add`;
    await this.gateway.create<void>({ url, payload });
  }

  /**
   * 网格交接详情
   */
  public async getGridHandoverDetail(payload: { id: string }): Promise<GridHandoverDetailDTO> {
    const url = `${baseURL}/grid/handover/detail`;
    const resp = await this.gateway.get<GridHandoverDetailDTO>({ url, payload });
    return resp;
  }

  /**获取网格模型全局配置 */
  public async getGridModelConfig(): Promise<{ modelItemId: string }> {
    const url = `${baseURL}/grid/model/config`;
    const resp = await this.gateway.get<{ modelItemId: string }>({ url });
    return resp;
  }

  /**设置网格模型全局配置 */
  public async setGridModelConfig(payload: { modelItemId: string }): Promise<void> {
    const url = `${baseURL}/grid/model/config`;
    await this.gateway.create<void>({ url, payload });
  }
  /**获取存在网格长的网格列表 */
  public async getGridLeader(): Promise<GridList[]> {
    const url = `${baseURL}/grid/area/grid-leader`;
    const resp = await this.gateway.get<GridList[]>({ url });
    return resp;
  }

  /** 获取当前网格模型具体可视化配置 */
  public async getGridModelVisualizationConfig(): Promise<ModelConfig | null> {
    const { modelItemId } = await this.getGridModelConfig();
    if (!modelItemId) {
      return null;
    }
    const resp = await this.cubeVisualizationService.getModalConfigByProjectId(modelItemId);
    return JSON.parse(resp || "{}") as ModelConfig;
  }

  /**
   * 获取公示栏网格负责人列表（根据区域 ID）
   */
  public async getBulletinGridManagers(gridAreaId: string, tenant?: string): Promise<BulletinGridManager> {
    const url = `${baseURL}/public/grid/area/config/for/screen`;
    const headers = tenant ? { headers: { tenant, Authorization: "" } } : {};
    const resp = await this.gateway.custom<BulletinGridManager>({
      url,
      payload: { gridAreaId },
      method: "GET",
      ...headers,
    });
    return resp;
  }

  /**
   * 获取公示栏通知公告列表
   */
  public async getBulletinAnnouncements(
    payload: {
      pageNumber: number;
      pageSize: number;
      status?: string;
    },
    tenant?: string,
  ): Promise<PageResult<BulletinAnnouncement>> {
    const url = `${contentBaseURL}/public/information/list`;
    const headers = tenant ? { headers: { tenant, Authorization: "" } } : {};
    const resp = await this.gateway.custom<PageResult<BulletinAnnouncement>>({
      url,
      payload,
      method: "GET",
      ...headers,
    });
    return resp;
  }

  /**
   * 获取公示栏投诉电话
   */
  public async getBulletinComplaintPhone(tenant?: string): Promise<string> {
    const url = `${ouaaBaseURL}/public/tenant-under-tenant/complaint-phone`;
    const headers = tenant ? { headers: { tenant, Authorization: "" } } : {};
    const resp = await this.gateway.custom<string>({
      url,
      method: "GET",
      ...headers,
    });
    return resp;
  }
}
