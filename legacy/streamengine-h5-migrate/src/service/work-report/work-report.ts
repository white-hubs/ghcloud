import { getApiBaseUrL, getAuthHeaders } from "@ghcloud/cube-app-js-sdk";

import { HTTPClientImpl } from "../../infrastructure/http-client";
import { HTTPClientGETOption } from "../http-client";
export interface WorkOrderType {
  formNo: string;
  processInstanceId: string;
  startUserId: string;
  startUserInfo: {
    startUserId: string;
    startUserName: string;
    organizationId: string;
    organizationName: string;
  };
  formInstanceId: string;
  startUserName: string;
  submitedTime: number;
  lastTaskCompletedTime: number;
  status: string;
  activeNodeName: string;
  activeNodeAssignee: string;
  currentTaskId: string;
  variables: unknown;
  instanceName: string;
  businessType: string;
  createTime: number;
  updateTime: number;
  code: string;
  name: string;
  hiddenObjName: string;
  objName: string;
  hiddenType: string;
  source: string;
  urgencyLevel: string;
  result: string;
}

export interface FaultType {
  id: string;
  name: string;
  status?: number;
}

export class WorkReportService {
  private readonly client = new HTTPClientImpl({
    baseURL: getApiBaseUrL() ?? "/api",
    headers: getAuthHeaders(),
  });

  // 获取汇报类型
  public async getReportTypeList(): Promise<{ id: string; name: string; status: number }[]> {
    const result = await this.client.get<ReportType>("/report/report-type-page?pageSize=1000&pageNumber=1");
    return result.records;
  }

  // 获取故障类型
  public async getFaultTypeList(payload: { applicationCode?: string }): Promise<FaultType[]> {
    const query: Record<string, string> = {};
    if (payload.applicationCode) {
      query.applicationCode = payload.applicationCode;
    }
    return await this.client.get<FaultType[]>("/maintain/fault-type/list", { query });
  }

  // 获取工单
  public async getReportList(
    url: string,
    payload: {
      pageNumber: number;
      pageSize: number;
      type?: string;
      status?: string;
      applicationCode?: string;
      businessType?: string;
      keyword?: string;
      faultTypeId?: string;
      submitTime?: string;
      startTime?: string;
      endTime?: string;
      total?: number;
    },
  ): Promise<OrderType> {
    const { submitTime, startTime, endTime, total, ...restPayload } = payload;
    const query: Record<string, unknown> = { ...restPayload };
    if (submitTime) {
      query.submitTime = submitTime;
    }
    const result = await this.client.get<OrderType>(url, {
      query: query as HTTPClientGETOption["query"],
    });
    return result;
  }
}

export const workReportService = new WorkReportService();

interface ReportType {
  pages: number;
  records: { id: string; name: string; status: number }[];
  total: number;
}
interface OrderType {
  pages: number;
  records: WorkOrderType[];
  total: number;
}
