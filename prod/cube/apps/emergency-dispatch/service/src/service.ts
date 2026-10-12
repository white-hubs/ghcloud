import { type CubeAuth, CubeGateway, type LegacyServiceError } from "@ghcloud/cube-gateway";
import { BASE_API } from "@ghcloud/cube-protocol";

import { buildSecurityUserDeviceAuthPageQuery, flattenSecurityUserDeviceAuthRecords } from "./security-monitor";
import type {
  AreaPlaneMapPayload,
  AreaPlaneMapVO,
  EvacuationRouteCreatePayload,
  EvacuationRouteDevicesPayload,
  EvacuationRoutePageQuery,
  EvacuationRouteUpdatePayload,
  EvacuationRouteVO,
  MonitorCameraDevice,
  PageResult,
  SecurityUserDeviceAuthPageQuery,
  SecurityUserDeviceAuthRecord,
} from "./types";

const VMONITOR_BASE = `${BASE_API}/vmonitor`;
const EMERGENCY_BASE = `${BASE_API}/emergency`;

function unwrap<T>(resp: LegacyServiceError<T> | T): T {
  if (resp !== null && typeof resp === "object" && "data" in resp && (resp as LegacyServiceError<T>).data !== undefined) {
    return (resp as LegacyServiceError<T>).data as T;
  }
  return resp as T;
}

export class CubeEmergencyDispatchService {
  private readonly gateway: CubeGateway;

  public constructor(auth: CubeAuth) {
    this.gateway = new CubeGateway(auth);
  }

  /** 用户监控设备授权分页（legacy: getSecurityUserDeviceAuthPage） */
  public async getSecurityUserDeviceAuthPage(
    query: Partial<SecurityUserDeviceAuthPageQuery> & Pick<SecurityUserDeviceAuthPageQuery, "applicationCode">,
  ): Promise<PageResult<SecurityUserDeviceAuthRecord>> {
    const payload = buildSecurityUserDeviceAuthPageQuery(query);
    const url = `${VMONITOR_BASE}/security/user/device/auth/getPage`;
    return this.gateway.get<PageResult<SecurityUserDeviceAuthRecord>>({ url, payload });
  }

  /** 拉取当前应用下可绑定的监控设备列表 */
  public async listMonitorCameraDevices(input: {
    applicationCode: string;
    keyword?: string;
    organizationId?: string;
    pageNumber?: number;
    pageSize?: number;
  }): Promise<MonitorCameraDevice[]> {
    const page = await this.getSecurityUserDeviceAuthPage({
      applicationCode: input.applicationCode,
      pageNumber: input.pageNumber ?? 1,
      pageSize: input.pageSize ?? 500,
      keyword: input.keyword,
      organizationId: input.organizationId,
    });
    return flattenSecurityUserDeviceAuthRecords(page.records ?? []);
  }

  /** 按区域查询平面图列表 */
  public async listAreaPlaneMapsByAreaId(areaId: string | number): Promise<AreaPlaneMapVO[]> {
    const url = `${EMERGENCY_BASE}/area-plane-maps/area/${String(areaId)}`;
    const resp = await this.gateway.get<LegacyServiceError<AreaPlaneMapVO[]>>({ url });
    const data = unwrap(resp);
    return Array.isArray(data) ? data : [];
  }

  /** 新增区域平面图 */
  public async createAreaPlaneMap(payload: AreaPlaneMapPayload): Promise<AreaPlaneMapVO | void> {
    const url = `${EMERGENCY_BASE}/area-plane-maps`;
    const resp = await this.gateway.create<LegacyServiceError<AreaPlaneMapVO>>({ url, payload });
    return unwrap(resp);
  }

  /** 编辑区域平面图 */
  public async updateAreaPlaneMap(id: string, payload: AreaPlaneMapPayload): Promise<AreaPlaneMapVO | void> {
    const url = `${EMERGENCY_BASE}/area-plane-maps/${id}`;
    const resp = await this.gateway.update<LegacyServiceError<AreaPlaneMapVO>>({ url, payload });
    return unwrap(resp);
  }

  /** 删除区域平面图 */
  public async deleteAreaPlaneMap(id: string): Promise<void> {
    const url = `${EMERGENCY_BASE}/area-plane-maps/${id}`;
    await this.gateway.delete({ url, payload: {} });
  }

  /** 疏散路线分页查询 */
  public async pageEvacuationRoutes(query: EvacuationRoutePageQuery): Promise<PageResult<EvacuationRouteVO>> {
    const url = `${EMERGENCY_BASE}/evacuation-routes/page`;
    const payload: Record<string, unknown> = {
      pageNumber: query.pageNumber ?? 1,
      pageSize: query.pageSize ?? 10,
    };
    if (query.areaId != null && query.areaId !== "") {
      payload.areaId = String(query.areaId);
    }
    const resp = await this.gateway.get<LegacyServiceError<PageResult<EvacuationRouteVO>>>({ url, payload });
    const data = unwrap(resp);
    return {
      total: data?.total ?? 0,
      pages: data?.pages ?? 0,
      records: Array.isArray(data?.records) ? data.records : [],
    };
  }

  /** 新增疏散路线 */
  public async createEvacuationRoute(payload: EvacuationRouteCreatePayload): Promise<EvacuationRouteVO | void> {
    const url = `${EMERGENCY_BASE}/evacuation-routes`;
    const resp = await this.gateway.create<LegacyServiceError<EvacuationRouteVO>>({ url, payload });
    return unwrap(resp);
  }

  /** 编辑疏散路线 */
  public async updateEvacuationRoute(id: string, payload: EvacuationRouteUpdatePayload): Promise<EvacuationRouteVO | void> {
    const url = `${EMERGENCY_BASE}/evacuation-routes/${id}`;
    const resp = await this.gateway.update<LegacyServiceError<EvacuationRouteVO>>({ url, payload });
    return unwrap(resp);
  }

  /** 删除疏散路线 */
  public async deleteEvacuationRoute(id: string): Promise<void> {
    const url = `${EMERGENCY_BASE}/evacuation-routes/${id}`;
    await this.gateway.delete({ url, payload: {} });
  }

  /** 更新疏散路线绑定设备 */
  public async updateEvacuationRouteDevices(id: string, payload: EvacuationRouteDevicesPayload): Promise<void> {
    const url = `${EMERGENCY_BASE}/evacuation-routes/${id}/devices`;
    await this.gateway.update({ url, payload });
  }
}
