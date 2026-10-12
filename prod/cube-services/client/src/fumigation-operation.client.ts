import { makeCreateRequest, makeGETRequest, makeListRequest } from "@ghcloud/cube-gateway";
import { BASE_API } from "@ghcloud/cube-protocol";
import type { FumigationOperationGateway } from "@ghcloud/cube-service-interface/fumigation-operation";

import { useAuthRequest } from "./auth-request";

const BFF = "/gw-bff/security-management/fumigation";
const FUSION_COMMUNICATE_PREFIX = `${BASE_API}/fusion-communicate`;
const COMMAND_DISPATCH_MAP_CONFIG = "COMMAND_DISPATCH_MAP_CONFIG";

interface LegacyEnvelope<T> {
  data?: T;
}

interface DictionaryItem {
  code?: string;
  variable?: string;
}

interface FusionPersonRaw {
  id?: string | number;
  name?: string | null;
  gps?: {
    lng?: number | string | null;
    lat?: number | string | null;
  } | null;
}

export interface FumigationDispatchMapConfig {
  center: { lng: number; lat: number };
  radius: number;
}

export interface FumigationMonitorPersonnelLocation {
  userId: string;
  name: string;
  lng?: number;
  lat?: number;
}

const unwrapLegacyData = <T>(payload: T | LegacyEnvelope<T>): T => {
  if (payload != null && typeof payload === "object" && "data" in payload) {
    return (payload as LegacyEnvelope<T>).data as T;
  }
  return payload as T;
};

const parseLngLat = (value: string | undefined): { lng: number; lat: number } | null => {
  if (value == null || value.trim() === "") {
    return null;
  }
  const [lngRaw = "", latRaw = ""] = value.split(",");
  const lng = Number(lngRaw.trim());
  const lat = Number(latRaw.trim());
  if (!Number.isFinite(lng) || !Number.isFinite(lat)) {
    return null;
  }
  return { lng, lat };
};

export const listFumigationWorks: FumigationOperationGateway["listFumigationWorks"] = async (params) =>
  useAuthRequest(async () => {
    const resp = await makeListRequest({ url: `${BFF}/works`, payload: { ...params } }).send();
    return resp.json();
  });

export const getFumigationWork: FumigationOperationGateway["getFumigationWork"] = async (id) =>
  useAuthRequest(async () => {
    const resp = await makeGETRequest({ url: `${BFF}/works/${id}` }).send();
    return resp.json();
  });

export const createFumigationWork: FumigationOperationGateway["createFumigationWork"] = async (payload) =>
  useAuthRequest(async () => {
    const resp = await makeCreateRequest({ url: `${BFF}/works`, payload: { ...payload } }).send();
    return resp.json();
  });

export const submitFumigationApproval: FumigationOperationGateway["submitFumigationApproval"] = async (id, payload) =>
  useAuthRequest(async () => {
    const resp = await makeCreateRequest({ url: `${BFF}/works/${id}/approvals`, payload: { ...payload } }).send();
    return resp.json();
  });

export const getFumigationPrechecks: FumigationOperationGateway["getFumigationPrechecks"] = async (id) =>
  useAuthRequest(async () => {
    const resp = await makeGETRequest({ url: `${BFF}/works/${id}/prechecks` }).send();
    return resp.json();
  });

export const runFumigationPrecheck: FumigationOperationGateway["runFumigationPrecheck"] = async (id, payload) =>
  useAuthRequest(async () => {
    const resp = await makeCreateRequest({ url: `${BFF}/works/${id}/prechecks`, payload: { ...payload } }).send();
    return resp.json();
  });

export const runFumigationPrechecks: FumigationOperationGateway["runFumigationPrechecks"] = async (id) =>
  useAuthRequest(async () => {
    const resp = await makeCreateRequest({ url: `${BFF}/works/${id}/prechecks/run`, payload: {} }).send();
    return resp.json();
  });

export const completeFumigationWork: FumigationOperationGateway["completeFumigationWork"] = async (id, payload) =>
  useAuthRequest(async () => {
    const resp = await makeCreateRequest({ url: `${BFF}/works/${id}/complete`, payload: { ...payload } }).send();
    return resp.json();
  });

export const terminateFumigationWork: FumigationOperationGateway["terminateFumigationWork"] = async (id, payload) =>
  useAuthRequest(async () => {
    const resp = await makeCreateRequest({ url: `${BFF}/works/${id}/terminate`, payload: { ...payload } }).send();
    return resp.json();
  });

export const sendFumigationNotification: FumigationOperationGateway["sendFumigationNotification"] = async (id, payload) =>
  useAuthRequest(async () => {
    await makeCreateRequest({ url: `${BFF}/works/${id}/notifications`, payload: { ...payload } }).send();
  });

export const listFumigationWarehouses: FumigationOperationGateway["listFumigationWarehouses"] = async (params) =>
  useAuthRequest(async () => {
    const resp = await makeGETRequest({ url: `${BFF}/support/warehouses`, payload: { ...params } }).send();
    return resp.json();
  });

export const listFumigationGrainVarieties: FumigationOperationGateway["listFumigationGrainVarieties"] = async (warehouseId) =>
  useAuthRequest(async () => {
    const resp = await makeGETRequest({ url: `${BFF}/support/warehouses/${warehouseId}/grain-varieties` }).send();
    return resp.json();
  });

export const listFumigationPesticideTypes: FumigationOperationGateway["listFumigationPesticideTypes"] = async () =>
  useAuthRequest(async () => {
    const resp = await makeGETRequest({ url: `${BFF}/support/pesticide-types` }).send();
    return resp.json();
  });

export const listFumigationApplicationMethods: FumigationOperationGateway["listFumigationApplicationMethods"] = async () =>
  useAuthRequest(async () => {
    const resp = await makeGETRequest({ url: `${BFF}/support/application-methods` }).send();
    return resp.json();
  });

export const listFumigationDevices: FumigationOperationGateway["listFumigationDevices"] = async (params) =>
  useAuthRequest(async () => {
    const resp = await makeGETRequest({ url: `${BFF}/devices`, payload: { ...params } }).send();
    return resp.json();
  });

export const getFumigationDeviceMonitor: FumigationOperationGateway["getFumigationDeviceMonitor"] = async (deviceId) =>
  useAuthRequest(async () => {
    const resp = await makeGETRequest({ url: `${BFF}/devices/${deviceId}/monitor` }).send();
    return resp.json();
  });

export const getFumigationDeviceProperties: FumigationOperationGateway["getFumigationDeviceProperties"] = async (deviceId, propertyCodes) =>
  useAuthRequest(async () => {
    const resp = await makeGETRequest({
      url: `${BFF}/devices/${deviceId}/properties`,
      payload: propertyCodes?.length ? { propertyCodes: propertyCodes.join(",") } : {},
    }).send();
    return resp.json();
  });

export const listFumigationLinkedDevices: FumigationOperationGateway["listFumigationLinkedDevices"] = async (deviceId) =>
  useAuthRequest(async () => {
    const resp = await makeGETRequest({ url: `${BFF}/devices/${deviceId}/linked` }).send();
    return resp.json();
  });

export const listFumigationAssociatedVideos: FumigationOperationGateway["listFumigationAssociatedVideos"] = async (deviceId) =>
  useAuthRequest(async () => {
    const resp = await makeGETRequest({ url: `${BFF}/devices/${deviceId}/associated-videos` }).send();
    return resp.json();
  });

export const listFumigationWorkers: FumigationOperationGateway["listFumigationWorkers"] = async () =>
  useAuthRequest(async () => {
    const resp = await makeGETRequest({ url: `${BFF}/workers` }).send();
    return resp.json();
  });

export const listFumigationArchives: FumigationOperationGateway["listFumigationArchives"] = async (params) =>
  useAuthRequest(async () => {
    const resp = await makeListRequest({ url: `${BFF}/archives`, payload: { ...params } }).send();
    return resp.json();
  });

export const generateFumigationArchive: FumigationOperationGateway["generateFumigationArchive"] = async (workId) =>
  useAuthRequest(async () => {
    const resp = await makeCreateRequest({ url: `${BFF}/archives/generate`, payload: { workId } }).send();
    return resp.json();
  });

export const getFumigationArchiveDocument: FumigationOperationGateway["getFumigationArchiveDocument"] = async (archiveId) =>
  useAuthRequest(async () => {
    const resp = await makeGETRequest({ url: `${BFF}/archives/${archiveId}/document` }).send();
    return resp.json();
  });

export const getFumigationRealtimeSituation: FumigationOperationGateway["getFumigationRealtimeSituation"] = async (applicationCode) =>
  useAuthRequest(async () => {
    const resp = await makeGETRequest({
      url: `${BFF}/realtime-situation`,
      payload: applicationCode ? { applicationCode } : {},
    }).send();
    return resp.json();
  });

export const getFumigationRealtimeSituationStats: FumigationOperationGateway["getFumigationRealtimeSituationStats"] = async () =>
  useAuthRequest(async () => {
    const resp = await makeGETRequest({ url: `${BFF}/realtime-situation/stats` }).send();
    return resp.json();
  });

export const getFumigationRealtimeSituationWorks: FumigationOperationGateway["getFumigationRealtimeSituationWorks"] = async () =>
  useAuthRequest(async () => {
    const resp = await makeGETRequest({ url: `${BFF}/realtime-situation/works` }).send();
    return resp.json();
  });

export const listFumigationRealtimeSituationWarehouses: FumigationOperationGateway["listFumigationRealtimeSituationWarehouses"] =
  async () =>
    useAuthRequest(async () => {
      const resp = await makeGETRequest({ url: `${BFF}/realtime-situation/warehouses` }).send();
      return resp.json();
    });

export const listFumigationRealtimeSituationDevices: FumigationOperationGateway["listFumigationRealtimeSituationDevices"] = async () =>
  useAuthRequest(async () => {
    const resp = await makeGETRequest({ url: `${BFF}/realtime-situation/devices` }).send();
    return resp.json();
  });

export const listFumigationRealtimeSituationAlarms: FumigationOperationGateway["listFumigationRealtimeSituationAlarms"] = async (
  applicationCode,
) =>
  useAuthRequest(async () => {
    const resp = await makeGETRequest({
      url: `${BFF}/realtime-situation/alarms`,
      payload: applicationCode ? { applicationCode } : {},
    }).send();
    return resp.json();
  });

export const getFumigationDispatchMapConfig = async (): Promise<FumigationDispatchMapConfig | null> =>
  useAuthRequest(async () => {
    const resp = await makeGETRequest({
      url: `${BASE_API}/dictionary/getDataDictionaryByItem`,
      payload: { itemCode: COMMAND_DISPATCH_MAP_CONFIG },
    }).send();
    const items = unwrapLegacyData((await resp.json()) as DictionaryItem[] | LegacyEnvelope<DictionaryItem[]>);
    if (!Array.isArray(items)) {
      return null;
    }
    const lnglatItem = items.find((item) => item.code === "lnglat");
    const radiusItem = items.find((item) => item.code === "radius");
    const center = parseLngLat(lnglatItem?.variable);
    if (center == null) {
      return null;
    }
    const radius = Number(radiusItem?.variable ?? 500);
    return {
      center,
      radius: Number.isFinite(radius) && radius > 0 ? radius : 500,
    };
  });

export const listFumigationMonitorPersonnelLocations = async (userIds: string[]): Promise<FumigationMonitorPersonnelLocation[]> => {
  const ids = userIds.map((item) => item.trim()).filter(Boolean);
  if (ids.length === 0) {
    return [];
  }
  return useAuthRequest(async () => {
    const resp = await makeGETRequest({
      url: `${FUSION_COMMUNICATE_PREFIX}/fusion-communicate/users`,
      payload: { userIds: ids },
    }).send();
    const users = unwrapLegacyData((await resp.json()) as FusionPersonRaw[] | LegacyEnvelope<FusionPersonRaw[]>);
    if (!Array.isArray(users)) {
      return [];
    }
    return users
      .map((user) => {
        const lng = Number(user.gps?.lng);
        const lat = Number(user.gps?.lat);
        return {
          userId: user.id == null ? "" : String(user.id),
          name: user.name?.trim() || String(user.id ?? ""),
          ...(Number.isFinite(lng) && Number.isFinite(lat) ? { lng, lat } : {}),
        };
      })
      .filter((item) => item.userId !== "");
  });
};
