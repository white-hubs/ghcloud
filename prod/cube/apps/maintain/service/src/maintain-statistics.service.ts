import { type CubeAuth, CubeGateway, type LegacyServiceError } from '@ghcloud/cube-gateway'
import { BASE_API } from '@ghcloud/cube-protocol'
import { FaultHandleStatusStatisticsVo, FaultObjectTop5Vo, InspectTaskTop5Vo, InspectTaskTrendVo, MaintenanceStatisticsVo, TicketStatisticsVo } from './type'

const baseURL = `${BASE_API}/maintain`

export class CubeMaintainStatisticsService {
  private readonly gateway: CubeGateway

  public constructor (auth: CubeAuth) {
    this.gateway = new CubeGateway(auth)
  }

  // 运维工单统计
  public async getTicketStatistics (payload: {
    type?: string;
    period?: string;
  }): Promise<TicketStatisticsVo> {
    const url = `${baseURL}/om/posture/ticket-statistics`
    const resp = await this.gateway.get<TicketStatisticsVo>({ url, payload })
    return resp
  }

  // 故障对象排行榜top5
  public async getFaultObjectTop5 (payload: {
    type?: string;
    period?: string;
  }): Promise<FaultObjectTop5Vo[]> {
    const url = `${baseURL}/om/posture/fault-object-top5`
    const resp = await this.gateway.get<FaultObjectTop5Vo[]>({ url, payload })
    return resp
  }

  // 故障处理状态统计
  public async getFaultHandleStatusStatistics (payload: {
    type?: string;
    period?: string;
  }): Promise<FaultHandleStatusStatisticsVo[]> {
    const url = `${baseURL}/om/posture/fault-handle-status-statistics`
    const resp = await this.gateway.get<FaultHandleStatusStatisticsVo[]>({ url, payload })
    return resp
  }

  // 维保统计
  public async getMaintenanceStatistics (payload: {
    type?: string;
    period?: string;
  }): Promise<MaintenanceStatisticsVo[]> {
    const url = `${baseURL}/om/posture/maintenance-statistics`
    const resp = await this.gateway.get<MaintenanceStatisticsVo[]>({ url, payload })
    return resp
  }

  // 人员巡检任务top5
  public async getPatrolTaskTop5 (payload: {
    type?: string;
    period?: string;
  }): Promise<InspectTaskTop5Vo[]> {
    const url = `${baseURL}/om/posture/patrol-task-top5`
    const resp = await this.gateway.get<InspectTaskTop5Vo[]>({ url, payload })
    return resp
  }

  // 巡检异常趋势
  public async getPatrolTaskTrend (payload: {
    type?: string;
    period?: string;
  }): Promise<InspectTaskTrendVo[]> {
    const url = `${baseURL}/om/posture/patrol-task-trend`
    const resp = await this.gateway.get<InspectTaskTrendVo[]>({ url, payload })
    return resp
  }

}
