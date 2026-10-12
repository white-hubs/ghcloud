import { Injectable, Inject, CONFIG_SERVICE_TOKEN, ConfigService } from "@dangao/bun-server";

import type { Pagination } from "@ghcloud/cube-service-interface/base";
import type {
  DeviceGroup,
  DeviceGroupDetail,
  DeviceInstance,
  DeviceTagRule,
  AreaEmptyDeviceTotal,
  BindVisualDevicesParams,
  CountAreaEmptyDevicesParams,
  ListDeviceGroupParams,
  ListDeviceInstanceOfRuleConditionParams,
  ListDeviceInstancesParams,
  ListVisualBoundDevicesParams,
  QueryDeviceIdsByAreaOrGroupAndTagParams,
  QueryDeviceInstancesParams,
  UnbindVisualDevicesParams,
} from "@ghcloud/cube-service-interface/device-center";
import type { DeviceInstancePageResult } from "@ghcloud/cube-service-interface/device-center";

import { ProxyClient } from "@/clients/proxy-client";
import { buildUrl } from "@/services/request-utils";

interface LegacyResponse<T> {
  code?: number;
  data?: T;
  message?: string;
}

@Injectable()
export class DeviceCenterProxyService {
  private readonly baseUrl: string;

  constructor(
    private readonly proxyClient: ProxyClient,
    @Inject(CONFIG_SERVICE_TOKEN) private readonly configService: ConfigService,
  ) {
    this.baseUrl = this.configService.get<string>("app.deviceCenterUrl") || "";
  }

  public async listDeviceInstanceOfRuleCondition(params: ListDeviceInstanceOfRuleConditionParams): Promise<Pagination<DeviceInstance>> {
    const url = `${this.baseUrl}/device/instance/rule-condition/page`;
    const response = await this.proxyClient.request<Pagination<DeviceInstance>>(url, {
      method: "POST",
      passthroughError: true,
      body: params,
    });
    return response.data;
  }

  public async getDeviceTagRule(tagCode: string): Promise<DeviceTagRule> {
    const url = `${this.baseUrl}/tag/rule/${tagCode}`;
    const response = await this.proxyClient.request<DeviceTagRule>(url, {
      method: "GET",
      passthroughError: true,
    });
    return response.data;
  }

  public async listDeviceGroup(params: ListDeviceGroupParams): Promise<Pagination<DeviceGroup>> {
    const url = `${this.baseUrl}/tags/device-groups`;
    const fullUrl = buildUrl(url, { ...params, keyword: params.keyword ?? "" });
    const response = await this.proxyClient.request<Pagination<DeviceGroup>>(fullUrl, {
      method: "GET",
      passthroughError: true,
    });
    return response.data;
  }

  public async getDeviceGroup(id: string): Promise<DeviceGroupDetail> {
    const url = `${this.baseUrl}/device-groups/${id}`;
    const response = await this.proxyClient.request<DeviceGroupDetail>(url, {
      method: "GET",
      passthroughError: true,
    });
    return response.data;
  }

  public async listDeviceInstances(params: ListDeviceInstancesParams): Promise<Pagination<DeviceInstance>> {
    const url = `${this.baseUrl}/device/instance/page`;
    const response = await this.proxyClient.request<Pagination<DeviceInstance>>(url, {
      method: "POST",
      passthroughError: true,
      body: params,
    });
    return response.data;
  }

  public async queryDeviceIdsByAreaOrGroupAndTag(params: QueryDeviceIdsByAreaOrGroupAndTagParams): Promise<string[]> {
    const url = `${this.baseUrl}/devices/ids/by-areas-or-groups-and-tag`;
    const response = await this.proxyClient.request<string[]>(url, {
      method: "POST",
      passthroughError: true,
      body: params,
    });
    return response.data;
  }

  public async queryDeviceInstances(params: QueryDeviceInstancesParams): Promise<DeviceInstance[]> {
    const url = `${this.baseUrl}/devices/instance/list`;
    const response = await this.proxyClient.request<DeviceInstance[]>(url, {
      method: "POST",
      passthroughError: true,
      body: params,
    });
    return response.data;
  }

  /** 设备中心：查询设备关联的监控摄像头 */
  public async getAssociatedVideos(deviceId: string): Promise<unknown[]> {
    const url = buildUrl(`${this.baseUrl}/device/associated/videos`, { deviceId });
    const response = await this.proxyClient.request<unknown[] | { data?: unknown[] }>(url, {
      method: "GET",
      passthroughError: true,
    });
    const payload = response.data;
    if (Array.isArray(payload)) {
      return payload;
    }
    if (payload != null && typeof payload === "object" && Array.isArray(payload.data)) {
      return payload.data;
    }
    return [];
  }

  public async listVisualBoundDevices(params: ListVisualBoundDevicesParams): Promise<DeviceInstancePageResult> {
    const response = await this.proxyClient.request<LegacyResponse<DeviceInstancePageResult> | DeviceInstancePageResult>(
      `${this.baseUrl}/device/instance/page`,
      {
        method: "POST",
        passthroughError: true,
        body: params,
      },
    );
    const data = this.unwrap(response.data);
    return {
      records: Array.isArray(data?.records) ? data.records : [],
      total: data?.total ?? 0,
      pages: data?.pages ?? 1,
    };
  }

  public async bindVisualDevices(params: BindVisualDevicesParams): Promise<unknown> {
    const response = await this.proxyClient.request<LegacyResponse<unknown> | unknown>(`${this.baseUrl}/device-scene-config`, {
      method: "POST",
      passthroughError: true,
      body: params,
    });
    return this.unwrap(response.data);
  }

  public async unbindVisualDevices(params: UnbindVisualDevicesParams): Promise<unknown> {
    const response = await this.proxyClient.request<LegacyResponse<unknown> | unknown>(
      `${this.baseUrl}/device-scene-config/${encodeURIComponent(params.sceneType)}/delete/devices`,
      {
        method: "POST",
        passthroughError: true,
        body: { businessIds: params.businessIds },
      },
    );
    return this.unwrap(response.data);
  }

  public async countAreaEmptyDevices(params: CountAreaEmptyDevicesParams): Promise<AreaEmptyDeviceTotal> {
    const response = await this.proxyClient.request<LegacyResponse<AreaEmptyDeviceTotal> | AreaEmptyDeviceTotal>(
      `${this.baseUrl}/device/area-empty/device-total`,
      {
        method: "POST",
        passthroughError: true,
        body: params,
      },
    );
    const data = this.unwrap(response.data);
    return {
      totalNum: data?.totalNum ?? 0,
    };
  }

  private unwrap<T>(payload: LegacyResponse<T> | T): T {
    if (payload && typeof payload === "object" && "data" in payload && (payload as LegacyResponse<T>).data !== undefined) {
      return (payload as LegacyResponse<T>).data as T;
    }
    return payload as T;
  }
}
