import { type CubeAuth, CubeGateway, type LegacyServiceError } from "@ghcloud/cube-gateway";
import { BASE_API } from "@ghcloud/cube-protocol";

import type {
  InspectAbnormalOverviewVO,
  InspectGeneratedTaskTargetVO,
  InspectTaskDepartmentCompletionStatVO,
  InspectTaskDetailParams,
  InspectTaskDepartmentMemberCompletionStatParams,
  InspectTaskDepartmentMemberCompletionStatVO,
  InspectTaskLatestAbnormalTargetListParams,
  InspectTaskPageParams,
  InspectTaskPeriodParams,
  InspectTaskStatusStatParams,
  InspectTaskStatusStatVO,
  InspectTaskTargetGeneratedListParams,
  InspectTaskTargetListParams,
  InspectTaskTypeDistributionVO,
  PageResult,
  RobotDogPointPageParams,
  RobotDogPointResult,
  StopInspectTaskParams,
  TaskDetailResult,
  TaskTargetRelationPO,
  TransferTaskParams,
  WaypointPageParams,
  WaypointResult,
} from "./types";

const baseURL = `${BASE_API}/maintain`;

export class CubeInspectionCommandScreenService {
  private readonly gateway: CubeGateway;

  public constructor(auth: CubeAuth) {
    this.gateway = new CubeGateway(auth);
  }

  public async getInspectTaskStatusStat(payload: InspectTaskStatusStatParams): Promise<InspectTaskStatusStatVO> {
    const url = `${baseURL}/inspect/task/status/stat`;
    const resp = await this.gateway.get<LegacyServiceError<InspectTaskStatusStatVO> | InspectTaskStatusStatVO>({ url, payload });
    return "data" in resp && resp.data ? resp.data : (resp as InspectTaskStatusStatVO);
  }

  public async getInspectTaskPage(payload: InspectTaskPageParams): Promise<PageResult<TaskDetailResult>> {
    const url = `${baseURL}/inspect-task/pageV2`;
    const resp = await this.gateway.get<LegacyServiceError<PageResult<TaskDetailResult>> | PageResult<TaskDetailResult>>({ url, payload });
    return "data" in resp && resp.data ? resp.data : (resp as PageResult<TaskDetailResult>);
  }

  public async getInspectTaskDetail(payload: InspectTaskDetailParams): Promise<TaskDetailResult> {
    const url = `${baseURL}/inspect-task/detailV2`;
    const resp = await this.gateway.get<LegacyServiceError<TaskDetailResult> | TaskDetailResult>({ url, payload });
    return "data" in resp && resp.data ? resp.data : (resp as TaskDetailResult);
  }

  public async getInspectTaskTargetList(payload: InspectTaskTargetListParams): Promise<TaskTargetRelationPO[]> {
    const url = `${baseURL}/inspect/task/target/list`;
    const resp = await this.gateway.get<LegacyServiceError<TaskTargetRelationPO[]> | TaskTargetRelationPO[]>({ url, payload });
    return "data" in resp && resp.data ? resp.data : (resp as TaskTargetRelationPO[]);
  }

  public async getWaypointPage(payload: WaypointPageParams): Promise<PageResult<WaypointResult>> {
    const { inspectTaskId, ...query } = payload;
    const url = `${baseURL}/inspect/drone/inspection/tasks/${inspectTaskId}/waypoints/page`;
    const resp = await this.gateway.get<LegacyServiceError<PageResult<WaypointResult>> | PageResult<WaypointResult>>({
      url,
      payload: query,
    });
    return "data" in resp && resp.data ? resp.data : (resp as PageResult<WaypointResult>);
  }

  public async getRobotDogPointPage(payload: RobotDogPointPageParams): Promise<PageResult<RobotDogPointResult>> {
    const { inspectTaskId, ...query } = payload;
    const url = `${baseURL}/inspect/robot-dog/inspection/tasks/${inspectTaskId}/points/page`;
    const resp = await this.gateway.get<LegacyServiceError<PageResult<RobotDogPointResult>> | PageResult<RobotDogPointResult>>({
      url,
      payload: query,
    });
    return "data" in resp && resp.data ? resp.data : (resp as PageResult<RobotDogPointResult>);
  }

  public async getInspectAbnormalOverview(payload: InspectTaskPeriodParams): Promise<InspectAbnormalOverviewVO> {
    const url = `${baseURL}/inspect/abnormal/overview`;
    const resp = await this.gateway.get<LegacyServiceError<InspectAbnormalOverviewVO> | InspectAbnormalOverviewVO>({ url, payload });
    return "data" in resp && resp.data ? resp.data : (resp as InspectAbnormalOverviewVO);
  }

  public async getInspectTaskTypeDistribution(payload: InspectTaskPeriodParams): Promise<InspectTaskTypeDistributionVO[]> {
    const url = `${baseURL}/inspect/task/type/distribution`;
    const resp = await this.gateway.get<LegacyServiceError<InspectTaskTypeDistributionVO[]> | InspectTaskTypeDistributionVO[]>({
      url,
      payload,
    });
    return "data" in resp && resp.data ? resp.data : (resp as InspectTaskTypeDistributionVO[]);
  }

  public async getInspectTaskDepartmentCompletionStat(payload: InspectTaskPeriodParams): Promise<InspectTaskDepartmentCompletionStatVO[]> {
    const url = `${baseURL}/inspect/task/department/completion/stat`;
    const resp = await this.gateway.get<
      LegacyServiceError<InspectTaskDepartmentCompletionStatVO[]> | InspectTaskDepartmentCompletionStatVO[]
    >({ url, payload });
    return "data" in resp && resp.data ? resp.data : (resp as InspectTaskDepartmentCompletionStatVO[]);
  }

  public async getInspectTaskDepartmentMemberCompletionStat(
    payload: InspectTaskDepartmentMemberCompletionStatParams,
  ): Promise<InspectTaskDepartmentMemberCompletionStatVO[]> {
    const url = `${baseURL}/inspect/task/department/completion/member/stat`;
    const resp = await this.gateway.get<
      LegacyServiceError<InspectTaskDepartmentMemberCompletionStatVO[]> | InspectTaskDepartmentMemberCompletionStatVO[]
    >({ url, payload });
    return "data" in resp && resp.data ? resp.data : (resp as InspectTaskDepartmentMemberCompletionStatVO[]);
  }

  public async getInspectTaskTargetGeneratedList(payload: InspectTaskTargetGeneratedListParams): Promise<InspectGeneratedTaskTargetVO[]> {
    const url = `${baseURL}/inspect/task/target/generated/list`;
    const resp = await this.gateway.get<LegacyServiceError<InspectGeneratedTaskTargetVO[]> | InspectGeneratedTaskTargetVO[]>({
      url,
      payload,
    });
    return "data" in resp && resp.data ? resp.data : (resp as InspectGeneratedTaskTargetVO[]);
  }

  public async getInspectTaskLatestAbnormalTargetList(
    payload: InspectTaskLatestAbnormalTargetListParams,
  ): Promise<InspectGeneratedTaskTargetVO[]> {
    const url = `${baseURL}/inspect/task/target/latest-abnormal/list`;
    const resp = await this.gateway.get<LegacyServiceError<InspectGeneratedTaskTargetVO[]> | InspectGeneratedTaskTargetVO[]>({
      url,
      payload,
    });
    return "data" in resp && resp.data ? resp.data : (resp as InspectGeneratedTaskTargetVO[]);
  }

  public async transferInspectTask(payload: TransferTaskParams): Promise<void> {
    const url = `${baseURL}/inspect-task/${payload.id}/turnOver/${payload.userId}`;
    await this.gateway.update({ url, payload });
  }

  public async stopInspectTask(payload: StopInspectTaskParams): Promise<void> {
    const url = `${baseURL}/inspect-task/${payload.id}/stop`;
    await this.gateway.update({ url, payload });
  }
}
