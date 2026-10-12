import { type CubeAuth, CubeGateway, type LegacyServiceError } from "@ghcloud/cube-gateway";
import { BASE_API } from "@ghcloud/cube-protocol";

import type {
  EmergencyEventFeedbackVO,
  EmergencyEventOperationLogVO,
  EmergencyEventTaskPageVO,
  EmergencyEventTypes,
  EmergencyEventVO,
  EmergencyFilePageVO,
} from "./type";

const baseURL = `${BASE_API}/emergency`;

/** 预案服务 */
export class CubeEmergencyService {
  private readonly gateway: CubeGateway;

  public constructor(auth: CubeAuth) {
    this.gateway = new CubeGateway(auth);
  }

  /** 事件分类列表 */
  public async getEventTypes(payload?: { keyword?: string }): Promise<EmergencyEventTypes[]> {
    const url = `${baseURL}/emergency-event-types`;
    const resp = await this.gateway.get<LegacyServiceError<EmergencyEventTypes[]>>({ url, payload });
    return resp.data || resp;
  }

  /** 预案文件分页 */
  public async getEmergencyFilesPage(payload?: {
    /**
     * 事件类型编号
     */
    emergencyEventTypeCode?: string;
    /**
     * 关键字
     */
    keyword?: string;
    pageNumber: number;
    pageSize: number;
  }): Promise<{ total: number; records: EmergencyFilePageVO[]; pages: number }> {
    const url = `${baseURL}/emergency-files`;
    const resp = await this.gateway.get<LegacyServiceError<{ total: number; records: EmergencyFilePageVO[]; pages: number }>>({
      url,
      payload,
    });
    return resp.data || resp;
  }

  /** 预案文件详情 */
  public async getEmergencyFileDetail(id: string): Promise<EmergencyFilePageVO> {
    const url = `${baseURL}/emergency-file/${id}`;
    const resp = await this.gateway.get<LegacyServiceError<EmergencyFilePageVO>>({ url });
    return resp.data || resp;
  }

  /** 事件执行任务分页。 */
  public async getEmergencyEventTasksPage(payload: {
    pageNumber: number;
    pageSize: number;
    keyword?: string;
    status?: EmergencyEventTaskPageVO["status"];
    executorId?: number;
  }): Promise<{ total: number; records: EmergencyEventTaskPageVO[]; pages: number }> {
    const url = `${baseURL}/emergency-event-task/page`;
    const resp = await this.gateway.get<LegacyServiceError<{ total: number; records: EmergencyEventTaskPageVO[]; pages: number }>>({
      url,
      payload,
    });
    return resp.data || resp;
  }

  /** 当前登录用户的事件执行任务分页。 */
  public async getMyEmergencyEventTasksPage(payload: {
    pageNumber: number;
    pageSize: number;
    keyword?: string;
    status?: EmergencyEventTaskPageVO["status"];
  }): Promise<{ total: number; records: EmergencyEventTaskPageVO[]; pages: number }> {
    const url = `${baseURL}/emergency-event-task/my-page`;
    const resp = await this.gateway.get<LegacyServiceError<{ total: number; records: EmergencyEventTaskPageVO[]; pages: number }>>({
      url,
      payload,
    });
    return resp.data || resp;
  }

  public async getEmergencyEventTaskDetail(id: string | number): Promise<EmergencyEventTaskPageVO> {
    const resp = await this.gateway.get<LegacyServiceError<EmergencyEventTaskPageVO>>({ url: `${baseURL}/emergency-event-task/${id}` });
    return resp.data || resp;
  }

  public async getEmergencyEventDetail(id: string | number): Promise<EmergencyEventVO> {
    const resp = await this.gateway.get<LegacyServiceError<EmergencyEventVO>>({ url: `${baseURL}/emergency-event/${id}` });
    return resp.data || resp;
  }

  public async getEmergencyEventTasks(eventId: string | number): Promise<EmergencyEventTaskPageVO[]> {
    const resp = await this.gateway.get<LegacyServiceError<EmergencyEventTaskPageVO[]>>({
      url: `${baseURL}/emergency-event/${eventId}/tasks`,
    });
    return resp.data || resp;
  }

  public async getEmergencyEventOperationLogs(eventId: string | number): Promise<EmergencyEventOperationLogVO[]> {
    const resp = await this.gateway.get<LegacyServiceError<EmergencyEventOperationLogVO[]>>({
      url: `${baseURL}/emergency-event/${eventId}/operation-logs`,
    });
    return resp.data || resp;
  }

  public async getEmergencyEventTaskFeedbacks(taskId: string | number): Promise<EmergencyEventFeedbackVO[]> {
    const resp = await this.gateway.get<LegacyServiceError<EmergencyEventFeedbackVO[]>>({
      url: `${baseURL}/emergency-event-task/${taskId}/feedbacks`,
    });
    return resp.data || resp;
  }

  public async completeEmergencyEventTask(id: string | number): Promise<void> {
    await this.gateway.custom<unknown>({ method: "POST", url: `${baseURL}/emergency-event-task/${id}/complete` });
  }

  public async createEmergencyEventTaskFeedback(
    id: string | number,
    payload: {
      feedbackType: "TEXT" | "IMAGE";
      content?: string;
      fileId?: string;
    },
  ): Promise<number> {
    const resp = await this.gateway.custom<LegacyServiceError<number>>({
      method: "POST",
      url: `${baseURL}/emergency-event-task/${id}/feedback`,
      payload,
    });
    return resp.data || resp;
  }
}
