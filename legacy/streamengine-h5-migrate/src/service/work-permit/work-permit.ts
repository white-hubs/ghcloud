import { getApiBaseUrL, getAuthHeaders } from "@ghcloud/cube-app-js-sdk";

import { HTTPClientImpl } from "../../infrastructure/http-client";

export interface WorkPermitTypeName {
  id: string | number;
  typeName: string;
}

export interface WorkPermitAssociatedItem {
  id?: string | number;
  itemName?: string;
  typeName?: string;
  workPermitLevel?: string;
  custom?: boolean;
  aiRecognitionEnabled?: boolean;
  confirmResult?: "NORMAL" | "ABNORMAL";
  description?: string;
  attachments?: any[];
  confirmSource?: "MANUAL" | "AI";
  aiRecognitionStatus?: "SUCCESS" | "UNRECOGNIZED" | "FAILED";
  aiRecognitionMessage?: string;
}

export interface WorkPermitAssociatedItemPage {
  total?: number;
  totalCount?: number;
  records?: WorkPermitAssociatedItem[];
  list?: WorkPermitAssociatedItem[];
  data?: WorkPermitAssociatedItem[];
}

function parseArrayResult<T>(result: unknown): T[] {
  if (typeof result === "string") {
    return JSON.parse(result) as T[];
  }
  if (Array.isArray(result)) {
    return result;
  }
  if (!result || typeof result !== "object") {
    return [];
  }
  const payload = result as Record<string, unknown>;
  if (Array.isArray(payload.data)) {
    return payload.data as T[];
  }
  if (Array.isArray(payload.records)) {
    return payload.records as T[];
  }
  if (Array.isArray(payload.list)) {
    return payload.list as T[];
  }
  const nested = payload.data;
  if (nested && typeof nested === "object") {
    const nestedPayload = nested as Record<string, unknown>;
    if (Array.isArray(nestedPayload.records)) {
      return nestedPayload.records as T[];
    }
    if (Array.isArray(nestedPayload.list)) {
      return nestedPayload.list as T[];
    }
    if (Array.isArray(nestedPayload.data)) {
      return nestedPayload.data as T[];
    }
  }
  return [];
}

class WorkPermitService {
  private readonly client = new HTTPClientImpl({
    baseURL: getApiBaseUrL() ?? "/api",
    headers: getAuthHeaders(),
  });

  private readonly bffClient = new HTTPClientImpl({
    baseURL: "",
    headers: getAuthHeaders(),
  });

  public async getTypeNames(params: { typeName?: string } = {}): Promise<WorkPermitTypeName[]> {
    return await this.client.get<WorkPermitTypeName[]>("/work-permit/work-permit-types/names", { query: params });
  }

  public async getLevels(params: { typeName?: string } = {}): Promise<string[]> {
    const result = await this.client.get<string[] | string>("/work-permit/work-permit-types/levels", { query: params });
    return parseArrayResult(result);
  }

  public async getRiskCheckItemIds(params: { typeName?: string | null; workPermitLevel?: string | null }): Promise<Array<string | number>> {
    const result = await this.client.get<Array<string | number> | string>("/work-permit/work-permit-types/risk-check-items/ids", {
      query: params,
    });
    return parseArrayResult(result);
  }

  public async getAcceptanceItemIds(params: {
    typeName?: string | null;
    workPermitLevel?: string | null;
  }): Promise<Array<string | number>> {
    const result = await this.client.get<Array<string | number> | string>("/work-permit/work-permit-types/acceptance-items/ids", {
      query: params,
    });
    return parseArrayResult(result);
  }

  public async getRiskCheckItems(params: {
    pageNumber: number;
    pageSize: number;
    typeName?: string | null;
    workPermitLevel?: string | null;
  }): Promise<WorkPermitAssociatedItemPage> {
    return await this.client.get<WorkPermitAssociatedItemPage>("/work-permit/work-permit-types/risk-check-items/page", { query: params });
  }

  public async getAcceptanceItems(params: {
    pageNumber: number;
    pageSize: number;
    typeName?: string | null;
    workPermitLevel?: string | null;
  }): Promise<WorkPermitAssociatedItemPage> {
    return await this.client.get<WorkPermitAssociatedItemPage>("/work-permit/work-permit-types/acceptance-items/page", { query: params });
  }

  public async recognizeItemByAi(payload: { itemContent: string; fileIds: string[] }): Promise<any> {
    return await this.bffClient.post<any>("/gw-bff/work-permit/associated-items/ai-recognition", payload);
  }
}

export const workPermitService = new WorkPermitService();
