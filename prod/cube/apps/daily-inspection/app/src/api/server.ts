import { FlowClient } from "@cube-ai/flow-sdk-client";

import { apiProxy as cubeAppDesignApiProxy } from "@ghcloud/cube-app-design";
import { CubeDailyInspectionService } from "@ghcloud/cube-daily-inspection-service";
import { CubeDictionaryService } from "@ghcloud/cube-dictionary-service";
import { CubeFileService } from "@ghcloud/cube-file-service";
import { CubeGateway, GatewayProxy, type LegacyServiceError, type ServiceError } from "@ghcloud/cube-gateway";
import { CubeMdataService } from "@ghcloud/cube-mdata-service";
import { CubeMessageCenterService } from "@ghcloud/cube-message-center-service";
import { BASE_API } from "@ghcloud/cube-protocol";
import { CubeSmallEngineeringService } from "@ghcloud/cube-small-engineering-service";
import { message } from "@ghcloud/cube-ui";

import { authStore } from "./auth-store";
import type { InspectAiFlowRunPayload, InspectDictionaryResponse } from "@/types/inspect";

const AI_CENTER_GATEWAY_BASE = (
  (import.meta as unknown as { env?: { VITE_AI_CENTER_API_BASE?: string } }).env?.VITE_AI_CENTER_API_BASE?.trim() || `${BASE_API}/ai-center`
).replace(/\/$/, "");

type SdkTransportGateway = Omit<CubeGateway, "custom"> & {
  custom: <T>(options: {
    method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
    url: string;
    payload?: Record<string, unknown> | FormData | string;
    headers?: Record<string, string>;
  }) => Promise<T>;
};

function normalizeHeaders(headers?: HeadersInit): Record<string, string> | undefined {
  if (!headers) return undefined;
  if (headers instanceof Headers) return Object.fromEntries(headers.entries());
  if (Array.isArray(headers)) return Object.fromEntries(headers);
  return headers;
}

function createGatewayFetch(gateway: CubeGateway): typeof fetch {
  return (async (input: Parameters<typeof fetch>[0], init?: Parameters<typeof fetch>[1]): Promise<Response> => {
    const method = (init?.method?.toUpperCase() ?? "GET") as "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
    const rawBody = init?.body;
    let payload: Record<string, unknown> | FormData | string | undefined;
    if (rawBody instanceof FormData) {
      payload = rawBody;
    } else if (typeof rawBody === "string") {
      payload = rawBody;
    }
    const headers = normalizeHeaders(init?.headers);
    const data = await (gateway as SdkTransportGateway).custom<unknown>({
      method,
      url: String(input),
      ...(payload !== undefined ? { payload } : {}),
      ...(headers ? { headers } : {}),
    });
    return new Response(JSON.stringify(data ?? null), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  }) as typeof fetch;
}

class CubeDictionaryLiteService {
  private readonly gateway = new CubeGateway(authStore);

  public async getDataDictionaryByItemAndCode(payload: { itemCode: string; code: string }): Promise<InspectDictionaryResponse> {
    const resp = await this.gateway.get<LegacyServiceError<InspectDictionaryResponse>>({
      url: `${BASE_API}/dictionary/getDataDictionaryByItemAndCode`,
      payload,
    });
    return resp?.data || resp;
  }
}

class CubeAiApplicationLiteService {
  private readonly gateway = new CubeGateway(authStore);
  private readonly flowClient = new FlowClient({
    baseUrl: AI_CENTER_GATEWAY_BASE,
    fetchImpl: createGatewayFetch(this.gateway),
  });

  public async runFlow(flowId: string, payload: InspectAiFlowRunPayload): Promise<unknown> {
    return await this.flowClient.runFlow(flowId, payload as never);
  }
}

class CubeMaintainDroneLiteService {
  private readonly gateway = new CubeGateway(authStore);
  private readonly baseUrl = `${BASE_API}/maintain/inspect/drone`;
  private readonly robotDogBaseUrl = `${BASE_API}/maintain/inspect/robot-dog`;

  private unwrap<T>(resp: LegacyServiceError<T> | T): T {
    return ((resp as LegacyServiceError<T>)?.data || resp) as T;
  }

  public async pageDroneRoutes(payload: Record<string, unknown>): Promise<Record<string, unknown>> {
    const resp = await this.gateway.get<LegacyServiceError<Record<string, unknown>>>({
      url: `${this.baseUrl}/routes/selection/page`,
      payload,
    });
    return this.unwrap(resp);
  }

  public async getDroneRoute(id: string | number): Promise<Record<string, unknown>> {
    const resp = await this.gateway.get<LegacyServiceError<Record<string, unknown>>>({
      url: `${this.baseUrl}/routes/${id}`,
    });
    return this.unwrap(resp);
  }

  public async pageRobotDogRoutes(payload: Record<string, unknown>): Promise<Record<string, unknown>> {
    const resp = await this.gateway.get<LegacyServiceError<Record<string, unknown>>>({
      url: `${this.robotDogBaseUrl}/routes/selection/page`,
      payload,
    });
    return this.unwrap(resp);
  }

  public async getRobotDogRoute(id: string | number): Promise<Record<string, unknown>> {
    const resp = await this.gateway.get<LegacyServiceError<Record<string, unknown>>>({
      url: `${this.robotDogBaseUrl}/routes/${id}`,
    });
    return this.unwrap(resp);
  }

  public async pageDroneInspectionTaskWaypoints(
    inspectTaskId: string | number,
    payload: Record<string, unknown>,
  ): Promise<Record<string, unknown>> {
    const resp = await this.gateway.get<LegacyServiceError<Record<string, unknown>>>({
      url: `${this.baseUrl}/inspection/tasks/${inspectTaskId}/waypoints/page`,
      payload,
    });
    return this.unwrap(resp);
  }

  public async pageDroneInspectionTaskWaypointRecords(
    payload: Record<string, unknown>,
  ): Promise<{ records: Record<string, unknown>[]; total: number; pages: number }> {
    const resp = await this.gateway.get<
      | LegacyServiceError<{ records: Record<string, unknown>[]; total: number; pages: number }>
      | {
          records: Record<string, unknown>[];
          total: number;
          pages: number;
        }
    >({
      url: `${this.baseUrl}/inspection/tasks/waypoints/page`,
      payload,
    });
    return this.unwrap(resp);
  }

  public async pageRobotDogInspectionTaskWaypoints(
    inspectTaskId: string | number,
    payload: Record<string, unknown>,
  ): Promise<Record<string, unknown>> {
    const resp = await this.gateway.get<LegacyServiceError<Record<string, unknown>>>({
      url: `${this.robotDogBaseUrl}/inspection/tasks/${inspectTaskId}/points/page`,
      payload,
    });
    return this.unwrap(resp);
  }

  public async pageRobotDogInspectionTaskPointRecords(
    payload: Record<string, unknown>,
  ): Promise<{ records: Record<string, unknown>[]; total: number; pages: number }> {
    const resp = await this.gateway.get<
      | LegacyServiceError<{ records: Record<string, unknown>[]; total: number; pages: number }>
      | {
          records: Record<string, unknown>[];
          total: number;
          pages: number;
        }
    >({
      url: `${this.robotDogBaseUrl}/inspection/tasks/points/page`,
      payload,
    });
    return this.unwrap(resp);
  }
}

class ApiProxy extends GatewayProxy {
  public get cubeFileService(): CubeFileService {
    return new CubeFileService(authStore);
  }

  public get cubeFileServiceServiceProxy(): CubeFileService {
    return this.createProxiedInstance(this.cubeFileService);
  }
  public get cubeDictionaryService(): CubeDictionaryService {
    return new CubeDictionaryService(authStore);
  }

  public get cubeDictionaryServiceProxy(): CubeDictionaryService {
    return this.createProxiedInstance(this.cubeDictionaryService);
  }
  public get cubeMdataService(): CubeMdataService {
    return new CubeMdataService(authStore);
  }

  public get cubeMdataServiceProxy(): CubeMdataService {
    return this.createProxiedInstance(this.cubeMdataService);
  }
  public get cubeDailyInspectionService(): CubeDailyInspectionService {
    return new CubeDailyInspectionService(authStore);
  }

  public get cubeDailyInspectionServiceProxy(): CubeDailyInspectionService {
    return this.createProxiedInstance(this.cubeDailyInspectionService);
  }
  public get cubeMessageCenterService(): CubeMessageCenterService {
    return new CubeMessageCenterService(authStore);
  }

  public get cubeMessageCenterServiceProxy(): CubeMessageCenterService {
    return this.createProxiedInstance(this.cubeMessageCenterService);
  }
  public get cubeSmallEngineeringService(): CubeSmallEngineeringService {
    return new CubeSmallEngineeringService(authStore);
  }
  public get cubeSmallEngineeringServiceProxy(): CubeSmallEngineeringService {
    return this.createProxiedInstance(this.cubeSmallEngineeringService);
  }

  public override errorNotify(error: ServiceError): void {
    message.error(error.errorMessage);
  }
}

const apiProxy = new ApiProxy();
export const cubeDictionaryLiteService = new CubeDictionaryLiteService();
export const cubeAiApplicationLiteService = new CubeAiApplicationLiteService();
export const cubeMaintainDroneService = new CubeMaintainDroneLiteService();
export const cubeMdataService = apiProxy.cubeMdataServiceProxy;
export const cubeFileService = apiProxy.cubeFileServiceServiceProxy;
export const cubeDictionaryService = apiProxy.cubeDictionaryServiceProxy;
export const cubeMessageCenterService = apiProxy.cubeMessageCenterServiceProxy;
export const cubeDailyInspectionService = apiProxy.cubeDailyInspectionServiceProxy;
export const cubeSmallEngineeringService = apiProxy.cubeSmallEngineeringServiceProxy;
export const cubeDeviceCenterService = cubeAppDesignApiProxy.cubeDeviceCenterServiceProxy;
export const cubeAssetManagementService = cubeAppDesignApiProxy.cubeAssetManagementServiceProxy;
export const cubeMaintainService = cubeAppDesignApiProxy.cubeMaintainServiceProxy;
export const cubeRiskTypeService = cubeAppDesignApiProxy.cubeRiskManagementServiceProxy;
export const cubeOuaaService = cubeAppDesignApiProxy.cubeOuaaServiceProxy;
