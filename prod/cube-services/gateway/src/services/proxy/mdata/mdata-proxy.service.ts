import { CONFIG_SERVICE_TOKEN, ConfigService, Inject, Injectable } from "@dangao/bun-server";

import type {
  AreaScenePanelConfig,
  BusinessAreaNode,
  CreateSceneTypeMenuParams,
  GetAreaScenePanelConfigParams,
  ListSceneTypeMenusParams,
  SaveAreaScenePanelConfigParams,
  SceneTypeMenu,
  UpdateSceneTypeMenuParams,
} from "@ghcloud/cube-service-interface/mdata";

import { ProxyClient } from "@/clients/proxy-client";
import { buildUrl } from "@/services/request-utils";

interface LegacyResponse<T> {
  code?: number;
  data?: T;
  message?: string;
}

/**
 * 主数据（mdata）可视化相关代理。复用 metadataUrl（通常指向 .../mdata）。
 */
@Injectable()
export class MdataProxyService {
  private readonly baseUrl: string;

  public constructor(
    private readonly proxyClient: ProxyClient,
    @Inject(CONFIG_SERVICE_TOKEN) private readonly configService: ConfigService,
  ) {
    this.baseUrl = (this.configService.get<string>("app.metadataUrl") ?? "").replace(/\/$/, "");
  }

  public async listSceneTypeMenus(params: ListSceneTypeMenusParams): Promise<SceneTypeMenu[]> {
    const response = await this.proxyClient.request<LegacyResponse<SceneTypeMenu[]> | SceneTypeMenu[]>(
      buildUrl(`${this.baseUrl}/scene-type/page`, { ...params }),
      { method: "GET", passthroughError: true },
    );
    const data = this.unwrap(response.data);
    return Array.isArray(data) ? data : [];
  }

  public async createSceneTypeMenu(params: CreateSceneTypeMenuParams): Promise<unknown> {
    const response = await this.proxyClient.request<LegacyResponse<unknown> | unknown>(`${this.baseUrl}/scene-type`, {
      method: "POST",
      body: params,
      passthroughError: true,
    });
    return this.unwrap(response.data);
  }

  public async updateSceneTypeMenu(params: UpdateSceneTypeMenuParams): Promise<unknown> {
    const response = await this.proxyClient.request<LegacyResponse<unknown> | unknown>(`${this.baseUrl}/scene-type/${params.id}`, {
      method: "PUT",
      body: params,
      passthroughError: true,
    });
    return this.unwrap(response.data);
  }

  public async deleteSceneTypeMenu(id: string): Promise<void> {
    await this.proxyClient.request(`${this.baseUrl}/scene-type/${id}`, {
      method: "DELETE",
      passthroughError: true,
    });
  }

  public async getAreaScenePanelConfig(params: GetAreaScenePanelConfigParams): Promise<AreaScenePanelConfig[]> {
    const response = await this.proxyClient.request<LegacyResponse<AreaScenePanelConfig[]> | AreaScenePanelConfig[]>(
      `${this.baseUrl}/area-scene-config/panel/${encodeURIComponent(params.areaId)}/${encodeURIComponent(params.sceneType)}`,
      { method: "GET", passthroughError: true },
    );
    const data = this.unwrap(response.data);
    return Array.isArray(data) ? data : [];
  }

  public async saveAreaScenePanelConfig(params: SaveAreaScenePanelConfigParams): Promise<unknown> {
    const response = await this.proxyClient.request<LegacyResponse<unknown> | unknown>(
      `${this.baseUrl}/area-scene-config/panel/disposable-save`,
      { method: "POST", body: params, passthroughError: true },
    );
    return this.unwrap(response.data);
  }

  public async listBusinessAreas(): Promise<BusinessAreaNode[]> {
    const response = await this.proxyClient.request<LegacyResponse<BusinessAreaNode[]> | BusinessAreaNode[]>(`${this.baseUrl}/area/list`, {
      method: "GET",
      passthroughError: true,
    });
    const data = this.unwrap(response.data);
    return Array.isArray(data) ? data : [];
  }

  private unwrap<T>(payload: LegacyResponse<T> | T): T {
    if (payload && typeof payload === "object" && "data" in payload && (payload as LegacyResponse<T>).data !== undefined) {
      return (payload as LegacyResponse<T>).data as T;
    }
    return payload as T;
  }
}
