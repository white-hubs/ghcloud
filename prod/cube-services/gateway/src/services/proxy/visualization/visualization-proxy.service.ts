import { CONFIG_SERVICE_TOKEN, ConfigService, Inject, Injectable } from "@dangao/bun-server";

import type {
  CreateVisualProjectParams,
  UpdateVisualProjectParams,
  VisualModelConfigurationPayload,
  VisualModelConfigurationResult,
  VisualProject,
} from "@ghcloud/cube-service-interface/visualization";

import { ProxyClient } from "@/clients/proxy-client";
import { buildUrl } from "@/services/request-utils";

interface LegacyResponse<T> {
  code?: number;
  data?: T;
  message?: string;
}

/**
 * 可视化服务代理：对接 visualization 后端，并解包 legacy { code, data } 响应。
 */
@Injectable()
export class VisualizationProxyService {
  private readonly baseUrl: string;

  public constructor(
    private readonly proxyClient: ProxyClient,
    @Inject(CONFIG_SERVICE_TOKEN) private readonly configService: ConfigService,
  ) {
    this.baseUrl = (this.configService.get<string>("app.visualizationUrl") ?? "").replace(/\/$/, "");
  }

  public async listVisualProjects(): Promise<VisualProject[]> {
    const response = await this.proxyClient.request<LegacyResponse<VisualProject[]> | VisualProject[]>(
      `${this.baseUrl}/project/queryProjectAll`,
      { method: "GET", passthroughError: true },
    );
    const data = this.unwrap(response.data);
    return Array.isArray(data) ? data : [];
  }

  public async createVisualProject(params: CreateVisualProjectParams): Promise<unknown> {
    const response = await this.proxyClient.request<LegacyResponse<unknown> | unknown>(`${this.baseUrl}/project/insert`, {
      method: "POST",
      body: params,
      passthroughError: true,
    });
    return this.unwrap(response.data);
  }

  public async updateVisualProject(params: UpdateVisualProjectParams): Promise<unknown> {
    const response = await this.proxyClient.request<LegacyResponse<unknown> | unknown>(`${this.baseUrl}/project/update`, {
      method: "PUT",
      body: params,
      passthroughError: true,
    });
    return this.unwrap(response.data);
  }

  public async deleteVisualProject(id: string): Promise<void> {
    await this.proxyClient.request(`${this.baseUrl}/project/${id}`, {
      method: "DELETE",
      passthroughError: true,
    });
  }

  public async copyVisualProject(id: string): Promise<void> {
    await this.proxyClient.request(`${this.baseUrl}/project/copy/${id}`, {
      method: "POST",
      body: {},
      passthroughError: true,
    });
  }

  public async getVisualModelConfiguration(projectId: string): Promise<VisualModelConfigurationResult> {
    const response = await this.proxyClient.request<
      LegacyResponse<VisualModelConfigurationResult | string | null> | VisualModelConfigurationResult | string | null
    >(buildUrl(`${this.baseUrl}/model-configuration`, { projectId }), {
      method: "GET",
      passthroughError: true,
    });
    const data = this.unwrap(response.data);
    if (typeof data === "string") {
      return { modelConfiguration: data };
    }
    if (data && typeof data === "object" && typeof data.modelConfiguration === "string") {
      return { modelConfiguration: data.modelConfiguration };
    }
    return { modelConfiguration: "" };
  }

  public async saveVisualModelConfiguration(params: VisualModelConfigurationPayload): Promise<unknown> {
    const response = await this.proxyClient.request<LegacyResponse<unknown> | unknown>(`${this.baseUrl}/add-model-configuration`, {
      method: "POST",
      body: params,
      passthroughError: true,
    });
    return this.unwrap(response.data);
  }

  private unwrap<T>(payload: LegacyResponse<T> | T): T {
    if (payload && typeof payload === "object" && "data" in payload && (payload as LegacyResponse<T>).data !== undefined) {
      return (payload as LegacyResponse<T>).data as T;
    }
    return payload as T;
  }
}
