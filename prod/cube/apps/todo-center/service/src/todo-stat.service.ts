import { type CubeAuth, CubeGateway, type LegacyServiceError } from "@ghcloud/cube-gateway";
import { BASE_API } from "@ghcloud/cube-protocol";

const baseURL = `${BASE_API}/todo`;

export interface TodoTaskTag {
  businessType: string;
  businessTypeName: string;
  total: number;
}

export interface DoneTaskTag {
  businessType: string;
  businessTypeName: string;
  total: string;
}
export interface TodoTaskTrend {
  total: number;
  period: string;
}

export interface TodoTaskType {
  code: string;
  name: string;
}

export interface TaskRecord {
  applicationCode: string;
  applicationName: string;
  businessKey: string;
  businessPrincipal: string;
  businessStatus: string;
  businessStatusName: string;
  businessType: string;
  businessTypeName: string;
  handlerTime: null | number;
  id: string;
  nextBusinessStatus: string;
  nextBusinessStatusName: string;
  status: string;
  taskDelState: boolean;
  taskName: string;
  taskTime: number;
  url: string;
}

export class CubeTodoTaskStatService {
  private readonly gateway: CubeGateway;

  public constructor(auth: CubeAuth) {
    this.gateway = new CubeGateway(auth);
  }

  public async getTodoTaskCount(): Promise<number> {
    const url = `${baseURL}/todo-task-statistics`;
    const resp = await this.gateway.get<LegacyServiceError<number>>({ url });
    return (resp?.data || resp) as number;
  }

  public async getTodoTaskTags(): Promise<TodoTaskTag[]> {
    const url = `${baseURL}/todo-task-tag-statistics`;
    const resp = await this.gateway.get<LegacyServiceError<TodoTaskTag[]>>({ url });
    return resp.data || resp;
  }

  /** 已办任务总数 */
  public async getDoneTaskCount(payload?: { timeType?: string }): Promise<number> {
    const url = `${baseURL}/done-task-statistics`;
    const resp = await this.gateway.get<LegacyServiceError<number>>({ url, payload });
    return (resp?.data || resp) as number;
  }

  /** 已办任务标签统计 */
  public async getDoneTaskTags(payload?: { timeType?: string }): Promise<DoneTaskTag[]> {
    const url = `${baseURL}/done-task-tag-statistics`;
    const resp = await this.gateway.get<LegacyServiceError<DoneTaskTag[]>>({ url, payload });
    return resp.data || resp;
  }

  public async getTodoTaskTagsTrend(): Promise<TodoTaskTrend[]> {
    const url = `${baseURL}/todo-task-statistics/last-thirty-days-trend`;
    const resp = await this.gateway.get<LegacyServiceError<TodoTaskTrend[]>>({ url });
    return resp.data || resp;
  }

  /** 待办任务类型 */
  public async getTodoTaskType(): Promise<TodoTaskType[]> {
    const url = `${baseURL}/todo-task-tags`;
    const resp = await this.gateway.get<LegacyServiceError<TodoTaskType[]>>({ url });
    return resp.data || resp;
  }

  /** 已办任务类型 */
  public async getDoneTaskType(): Promise<TodoTaskType[]> {
    const url = `${baseURL}/todo-done-task-tags`;
    const resp = await this.gateway.get<LegacyServiceError<TodoTaskType[]>>({ url });
    return resp.data || resp;
  }

  /** 待办任务分页 */
  public async getTodoTaskPage(payload: {
    pageNumber: number;
    pageSize: number;
    todoTagCode: string | undefined;
    period?: string | undefined;
    keyword: string | undefined;
  }): Promise<{ total: number; records: TaskRecord[]; pages: number }> {
    const url = `${baseURL}/todo-tasks`;
    const resp = await this.gateway.get<LegacyServiceError<{ total: number; records: TaskRecord[]; pages: number }>>({ url, payload });
    return resp.data || resp;
  }

  /** 已办任务分页 */
  public async getDoneTaskPage(payload: {
    pageNumber: number;
    pageSize: number;
    todoTagCode?: string | undefined;
    period?: string | undefined;
    keyword?: string | undefined;
  }): Promise<{ total: number; records: TaskRecord[]; pages: number }> {
    const url = `${baseURL}/todo-tasks-done`;
    const resp = await this.gateway.get<LegacyServiceError<{ total: number; records: TaskRecord[]; pages: number }>>({ url, payload });
    return resp.data || resp;
  }

  public async postProcessTaskComplete(payload: { taskId: string }): Promise<unknown> {
    const url = "/api/flow/process/task/complete";
    const resp = await this.gateway.create<LegacyServiceError<unknown>>({ url, payload });
    return resp.data || resp;
  }
}
