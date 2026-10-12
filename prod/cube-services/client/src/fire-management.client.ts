import {
  makeCreateRequest,
  makeCustomRequest,
  makeDELETERequest,
  makeGETRequest,
  makeListRequest,
  makeUpdateRequest,
} from "@ghcloud/cube-gateway";
import type { Pagination } from "@ghcloud/cube-service-interface/base";
import type {
  FireManagementGateway,
  FireHostCandidateRecord,
  FireHostRecord,
  FirePointRecord,
  SaveFireManageDeviceParams,
} from "@ghcloud/cube-service-interface/fire-management";

const SECURITY_MANAGEMENT_API = "/api/securitymanagement";
const FIRE_MANAGEMENT_P2_API = `${SECURITY_MANAGEMENT_API}/fireManage/p2`;

function unwrapData<T>(body: unknown): T {
  let current = body;
  for (let i = 0; i < 4; i += 1) {
    if (current != null && typeof current === "object" && !Array.isArray(current) && "data" in current) {
      current = (current as { data: unknown }).data;
      continue;
    }
    break;
  }
  return current as T;
}

async function readJsonOrNull(resp: { text: () => Promise<string> }): Promise<unknown> {
  const text = await resp.text();
  if (!text) {
    return null;
  }
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
}

const withExplodedEventCodes = (url: string, eventCodes?: string[]): string => {
  if (!eventCodes?.length) return url;
  const query = eventCodes.map((eventCode) => `eventCodes=${encodeURIComponent(eventCode)}`).join("&");
  return `${url}?${query}`;
};

// Fire Device
export const listFireDevices: FireManagementGateway["listFireDevices"] = async (params) => {
  const resp = await makeListRequest({
    url: "/api/fire-device/list",
    payload: { ...params },
  }).send();
  return resp.json();
};

export const getFireDeviceDetail: FireManagementGateway["getFireDeviceDetail"] = async (id) => {
  const resp = await makeGETRequest({
    url: `/api/fire-device/detail/${id}`,
  }).send();
  return resp.json();
};

export const createFireDevice: FireManagementGateway["createFireDevice"] = async (params) => {
  const resp = await makeCreateRequest({
    url: "/api/fire-device",
    payload: { ...params },
  }).send();
  return resp.json();
};

export const updateFireDevice: FireManagementGateway["updateFireDevice"] = async (params) => {
  const resp = await makeUpdateRequest({
    url: "/api/fire-device",
    payload: { ...params },
  }).send();
  return resp.json();
};

export const deleteFireDevice: FireManagementGateway["deleteFireDevice"] = async (id) => {
  await makeDELETERequest({
    url: `/api/fire-device/${id}`,
  }).send();
};

// Fire Host
export const listFireHosts: FireManagementGateway["listFireHosts"] = async (params) => {
  const resp = await makeGETRequest({
    url: "/api/securitymanagement/getFireManageDevicePage",
    payload: {
      pageNumber: params.pageNumber,
      pageSize: params.pageSize,
      deviceName: params.deviceName ?? params.keyword,
      productModel: params.productModel,
      brandName: params.brandName,
    },
  }).send();
  return unwrapData<Pagination<FireHostRecord>>(await resp.json());
};

export const listFireHostCandidates: FireManagementGateway["listFireHostCandidates"] = async (params) => {
  const resp = await makeGETRequest({
    url: `${FIRE_MANAGEMENT_P2_API}/hosts/candidates/page`,
    payload: {
      pageNumber: params.pageNumber,
      pageSize: params.pageSize,
      keyword: params.keyword,
      areaId: params.areaId,
      ids: params.ids,
      tagCodes: params.tagCodes,
      productId: params.productId,
      deviceProdCategoryCode: params.deviceProdCategoryCode,
      filterDeviceIds: params.filterDeviceIds,
    },
  }).send();
  return unwrapData<Pagination<FireHostCandidateRecord>>(await resp.json());
};

export const listFireHostRecentEvents: FireManagementGateway["listFireHostRecentEvents"] = async (hostId) => {
  const resp = await makeGETRequest({
    url: `${FIRE_MANAGEMENT_P2_API}/hosts/${hostId}/recent-events`,
  }).send();
  const data = unwrapData<unknown>(await resp.json());
  return Array.isArray(data) ? data : [];
};

export const getFireHostDetail: FireManagementGateway["getFireHostDetail"] = async (id) => {
  const resp = await makeGETRequest({
    url: `/api/fire-host/detail/${id}`,
  }).send();
  return resp.json();
};

export const createFireHost: FireManagementGateway["createFireHost"] = async (params) => {
  const resp = await makeCreateRequest({
    url: "/api/fire-host",
    payload: { ...params },
  }).send();
  return resp.json();
};

export const updateFireHost: FireManagementGateway["updateFireHost"] = async (params) => {
  const resp = await makeUpdateRequest({
    url: "/api/fire-host",
    payload: { ...params },
  }).send();
  return resp.json();
};

export const deleteFireHost: FireManagementGateway["deleteFireHost"] = async (id) => {
  await makeDELETERequest({
    url: `/api/securitymanagement/deleteFireManageDevice/${id}`,
  }).send();
};

// Fire Point
export const listFirePoints: FireManagementGateway["listFirePoints"] = async (params) => {
  const resp = await makeGETRequest({
    url: `${SECURITY_MANAGEMENT_API}/getFirePointDevicePage`,
    payload: {
      fireManageDeviceId: params.hostId,
      pageNumber: params.pageNumber,
      pageSize: params.pageSize,
      pointName: params.pointName ?? params.keyword,
      productModel: params.productModel ?? params.type,
      brandName: params.brandName,
      location: params.location,
      circuit: params.circuit,
      address: params.address,
      pointCode: params.pointCode,
      code: params.deviceCode ?? params.code,
      busType: params.busType,
    },
  }).send();
  return unwrapData<Pagination<FirePointRecord>>(await resp.json());
};

export const getFirePointDetail: FireManagementGateway["getFirePointDetail"] = async (id) => {
  const resp = await makeGETRequest({
    url: `/api/fire-point/detail/${id}`,
  }).send();
  return resp.json();
};

export const createFirePoint: FireManagementGateway["createFirePoint"] = async (params) => {
  const resp = await makeCreateRequest({
    url: `${SECURITY_MANAGEMENT_API}/addFirePointDevice`,
    payload: { ...params },
  }).send();
  return readJsonOrNull(resp) as Promise<FirePointRecord>;
};

export const updateFirePoint: FireManagementGateway["updateFirePoint"] = async (params) => {
  const resp = await makeCreateRequest({
    url: `${SECURITY_MANAGEMENT_API}/updateFirePointDevice`,
    payload: { ...params },
  }).send();
  return readJsonOrNull(resp) as Promise<FirePointRecord>;
};

export const deleteFirePoint: FireManagementGateway["deleteFirePoint"] = async (id) => {
  await makeDELETERequest({
    url: `${SECURITY_MANAGEMENT_API}/deleteFirePointDevice/${id}`,
  }).send();
};

export const listFirePointEvents: FireManagementGateway["listFirePointEvents"] = async (params) => {
  const { eventCodes, ...payload } = params;
  const resp = await makeGETRequest({
    url: withExplodedEventCodes(`${SECURITY_MANAGEMENT_API}/getFirePointDeviceEventPage`, eventCodes),
    payload: { ...payload },
  }).send();
  return unwrapData(await resp.json());
};

export const getFirePointEventOptions: FireManagementGateway["getFirePointEventOptions"] = async () => {
  const resp = await makeGETRequest({
    url: `${SECURITY_MANAGEMENT_API}/getFirePointDeviceEventOptions`,
  }).send();
  return unwrapData(await resp.json());
};

export const listFirePointLocalEvents: FireManagementGateway["listFirePointLocalEvents"] = async (params) => {
  const { eventCodes, ...payload } = params;
  const resp = await makeGETRequest({
    url: withExplodedEventCodes(`${SECURITY_MANAGEMENT_API}/getFirePointDeviceLocalEventPage`, eventCodes),
    payload: { ...payload },
  }).send();
  return unwrapData(await resp.json());
};

export const batchFillFirePointEmptyFields: FireManagementGateway["batchFillFirePointEmptyFields"] = async (file) => {
  const formData = new FormData();
  formData.append("file", file);
  const resp = await makeCreateRequest({
    url: `${SECURITY_MANAGEMENT_API}/batchFillEmptyFields`,
    payload: formData as unknown as Record<string, unknown>,
  }).send();
  return unwrapData(await readJsonOrNull(resp));
};

export const configFirePointDevices: FireManagementGateway["configFirePointDevices"] = async (params) => {
  await makeCreateRequest({
    url: `${SECURITY_MANAGEMENT_API}/configFirePointDevice`,
    payload: params as unknown as Record<string, unknown>,
  }).send();
};

export const downloadFirePointImportTemplate: FireManagementGateway["downloadFirePointImportTemplate"] = async () => {
  const resp = await makeGETRequest({
    url: `${SECURITY_MANAGEMENT_API}/downloadTemplate`,
  }).send();
  return resp.blob();
};

// Fire Host Button
export const listFireHostMethods: FireManagementGateway["listFireHostMethods"] = async (hostId, params = {}) => {
  const resp = await makeGETRequest({
    url: `${FIRE_MANAGEMENT_P2_API}/hosts/${hostId}/methods`,
    payload: { ...params },
  }).send();
  const data = unwrapData<unknown>(await resp.json());
  return Array.isArray(data) ? data : [];
};

export const listFireHostButtons: FireManagementGateway["listFireHostButtons"] = async (hostId) => {
  const resp = await makeGETRequest({
    url: `${FIRE_MANAGEMENT_P2_API}/hosts/${hostId}/buttons`,
  }).send();
  const data = unwrapData<unknown>(await resp.json());
  return Array.isArray(data) ? data : [];
};

export const saveFireHostButtons: FireManagementGateway["saveFireHostButtons"] = async (hostId, params) => {
  await makeCreateRequest({
    url: `${FIRE_MANAGEMENT_P2_API}/hosts/${hostId}/buttons/save`,
    payload: { ...params },
  }).send();
};

export const updateFireHostButtons: FireManagementGateway["updateFireHostButtons"] = async (hostId, params) => {
  await makeCreateRequest({
    url: `${FIRE_MANAGEMENT_P2_API}/hosts/${hostId}/buttons/update`,
    payload: { ...params },
  }).send();
};

export const removeFireHostButton: FireManagementGateway["removeFireHostButton"] = async (hostId, buttonId) => {
  await makeDELETERequest({
    url: `${FIRE_MANAGEMENT_P2_API}/hosts/${hostId}/buttons/${buttonId}`,
  }).send();
};

// Fire Host Monitor Device
export const listFireHostMonitorDevices: FireManagementGateway["listFireHostMonitorDevices"] = async (hostId, params) => {
  const resp = await makeGETRequest({
    url: `${FIRE_MANAGEMENT_P2_API}/hosts/${hostId}/monitor-devices/page`,
    payload: { ...params },
  }).send();
  return unwrapData(await resp.json());
};

export const listFireHostMonitorDeviceCandidates: FireManagementGateway["listFireHostMonitorDeviceCandidates"] = async (hostId, params) => {
  const resp = await makeGETRequest({
    url: `${FIRE_MANAGEMENT_P2_API}/hosts/${hostId}/monitor-devices/candidates/page`,
    payload: { ...params },
  }).send();
  return unwrapData(await resp.json());
};

export const saveFireHostMonitorDevices: FireManagementGateway["saveFireHostMonitorDevices"] = async (hostId, params) => {
  await makeCreateRequest({
    url: `${FIRE_MANAGEMENT_P2_API}/hosts/${hostId}/monitor-devices/save`,
    payload: { ...params },
  }).send();
};

export const removeFireHostMonitorDevice: FireManagementGateway["removeFireHostMonitorDevice"] = async (hostId, monitorDeviceId) => {
  await makeDELETERequest({
    url: `${FIRE_MANAGEMENT_P2_API}/hosts/${hostId}/monitor-devices/${monitorDeviceId}`,
  }).send();
};

// Fire Host Remote Control
export const listFireHostOverviews: FireManagementGateway["listFireHostOverviews"] = async (params) => {
  const resp = await makeGETRequest({
    url: `${FIRE_MANAGEMENT_P2_API}/hosts/overview/page`,
    payload: { ...params },
  }).send();
  return unwrapData(await resp.json());
};

export const listFireHostAlarmRecords: FireManagementGateway["listFireHostAlarmRecords"] = async (params) => {
  const resp = await makeGETRequest({
    url: `${FIRE_MANAGEMENT_P2_API}/alarms/alarm-records`,
    payload: { ...params },
  }).send();
  return unwrapData(await resp.json());
};

export const sendFireHostControlCommand: FireManagementGateway["sendFireHostControlCommand"] = async (hostId, params) => {
  const resp = await makeCreateRequest({
    url: `${FIRE_MANAGEMENT_P2_API}/hosts/${hostId}/commands`,
    payload: { ...params },
  }).send();
  return unwrapData(await resp.json());
};

export const getFireHostControlCommandStatus: FireManagementGateway["getFireHostControlCommandStatus"] = async (hostId, commandHandle) => {
  const resp = await makeGETRequest({
    url: `${FIRE_MANAGEMENT_P2_API}/hosts/${hostId}/commands/${encodeURIComponent(commandHandle)}/status`,
  }).send();
  return unwrapData(await resp.json());
};

export const listFireControlPoints: FireManagementGateway["listFireControlPoints"] = async (hostId, params) => {
  const resp = await makeGETRequest({
    url: `${FIRE_MANAGEMENT_P2_API}/hosts/${hostId}/control-points/page`,
    payload: { ...params },
  }).send();
  return unwrapData(await resp.json());
};

export const sendFirePointControlCommand: FireManagementGateway["sendFirePointControlCommand"] = async (hostId, pointId, params) => {
  const resp = await makeCreateRequest({
    url: `${FIRE_MANAGEMENT_P2_API}/hosts/${hostId}/control-points/${pointId}/commands`,
    payload: { ...params },
  }).send();
  return unwrapData(await resp.json());
};

export const getFirePointControlCommandStatus: FireManagementGateway["getFirePointControlCommandStatus"] = async (
  hostId,
  pointId,
  commandHandle,
) => {
  const resp = await makeGETRequest({
    url: `${FIRE_MANAGEMENT_P2_API}/hosts/${hostId}/control-points/${pointId}/commands/${encodeURIComponent(commandHandle)}/status`,
  }).send();
  return unwrapData(await resp.json());
};

export const listFirePointControlPropertyOptions: FireManagementGateway["listFirePointControlPropertyOptions"] = async (
  hostId,
  pointId,
) => {
  const resp = await makeGETRequest({
    url: `${FIRE_MANAGEMENT_P2_API}/hosts/${hostId}/control-points/${pointId}/property-options`,
  }).send();
  return unwrapData(await resp.json());
};

export const saveFirePointControlConfig: FireManagementGateway["saveFirePointControlConfig"] = async (hostId, pointId, params) => {
  await makeCreateRequest({
    url: `${FIRE_MANAGEMENT_P2_API}/hosts/${hostId}/control-points/${pointId}/control-config`,
    payload: { ...params },
  }).send();
};

export const getFireHostIndicatorLightConfig: FireManagementGateway["getFireHostIndicatorLightConfig"] = async (hostId) => {
  const resp = await makeGETRequest({
    url: `${FIRE_MANAGEMENT_P2_API}/hosts/${hostId}/indicator-lights`,
  }).send();
  return unwrapData(await resp.json());
};

export const saveFireHostIndicatorLightConfig: FireManagementGateway["saveFireHostIndicatorLightConfig"] = async (hostId, params) => {
  await makeCreateRequest({
    url: `${FIRE_MANAGEMENT_P2_API}/hosts/${hostId}/indicator-lights/save`,
    payload: { ...params },
  }).send();
};

export const listFireUtilityMonitorCards: FireManagementGateway["listFireUtilityMonitorCards"] = async (hostId, monitorType) => {
  const resp = await makeGETRequest({ url: `${FIRE_MANAGEMENT_P2_API}/hosts/${hostId}/utility-monitor/${monitorType}/cards` }).send();
  const data = unwrapData<unknown>(await resp.json());
  return Array.isArray(data) ? data : [];
};

export const saveFireUtilityDevices: FireManagementGateway["saveFireUtilityDevices"] = async (hostId, monitorType, params) => {
  await makeCreateRequest({
    url: `${FIRE_MANAGEMENT_P2_API}/hosts/${hostId}/utility-monitor/${monitorType}/devices`,
    payload: { ...params },
  }).send();
};

export const updateFireUtilityRange: FireManagementGateway["updateFireUtilityRange"] = async (hostId, monitorType, relationId, params) => {
  type CustomRequestConfig = Parameters<typeof makeCustomRequest>[0];
  await makeCustomRequest({
    method: "PATCH" as CustomRequestConfig["method"],
    url: `${FIRE_MANAGEMENT_P2_API}/hosts/${hostId}/utility-monitor/${monitorType}/devices/${relationId}/range`,
    payload: { ...params },
  }).send();
};

export const removeFireUtilityDevice: FireManagementGateway["removeFireUtilityDevice"] = async (hostId, monitorType, relationId) => {
  await makeDELETERequest({ url: `${FIRE_MANAGEMENT_P2_API}/hosts/${hostId}/utility-monitor/${monitorType}/devices/${relationId}` }).send();
};

export const listFireUtilityDeviceProperties: FireManagementGateway["listFireUtilityDeviceProperties"] = async (
  hostId,
  monitorType,
  relationId,
) => {
  const resp = await makeGETRequest({
    url: `${FIRE_MANAGEMENT_P2_API}/hosts/${hostId}/utility-monitor/${monitorType}/devices/${relationId}/properties`,
  }).send();
  const data = unwrapData<unknown>(await resp.json());
  return Array.isArray(data) ? data : [];
};

export const getFireUtilityPanel: FireManagementGateway["getFireUtilityPanel"] = async (hostId, monitorType) => {
  const resp = await makeGETRequest({ url: `${FIRE_MANAGEMENT_P2_API}/hosts/${hostId}/utility-monitor/${monitorType}/panel` }).send();
  return unwrapData(await resp.json());
};

export const saveFireUtilityPanel: FireManagementGateway["saveFireUtilityPanel"] = async (hostId, monitorType, params) => {
  await makeUpdateRequest({
    url: `${FIRE_MANAGEMENT_P2_API}/hosts/${hostId}/utility-monitor/${monitorType}/panel`,
    payload: { ...params },
  }).send();
};

export const resetFireUtilityPanel: FireManagementGateway["resetFireUtilityPanel"] = async (hostId, monitorType) => {
  await makeCreateRequest({ url: `${FIRE_MANAGEMENT_P2_API}/hosts/${hostId}/utility-monitor/${monitorType}/panel/reset` }).send();
};

// Operation Logs
export const listOperationLogs: FireManagementGateway["listOperationLogs"] = async (params) => {
  const resp = await makeGETRequest({
    url: `${FIRE_MANAGEMENT_P2_API}/operation-logs/page`,
    payload: { ...params },
  }).send();
  return unwrapData(await resp.json());
};

export const listEvents: FireManagementGateway["listEvents"] = async (params) => {
  return listFirePointEvents(params);
};

export const listFirePointEventStatistics: FireManagementGateway["listFirePointEventStatistics"] = async (params) => {
  const resp = await makeGETRequest({
    url: `${SECURITY_MANAGEMENT_API}/getFirePointEventStatisticsPage`,
    payload: { ...params },
  }).send();
  return unwrapData(await resp.json());
};

export const addOperationLog: FireManagementGateway["addOperationLog"] = async (operator, type, content, result) => {
  const resp = await makeCreateRequest({
    url: "/api/fire-operation-log",
    payload: { operator, type, content, result },
  }).send();
  return resp.json();
};

// Water Sensors
export const listWaterSensors: FireManagementGateway["listWaterSensors"] = async () => {
  const resp = await makeGETRequest({
    url: "/api/fire-water/sensors",
  }).send();
  return resp.json();
};

// Fire Manage Device
export const addFireManageDevice = async (params: SaveFireManageDeviceParams): Promise<any> => {
  const resp = await makeCreateRequest({
    url: "/api/securitymanagement/addFireManageDevice",
    payload: { ...params } as any,
  }).send();
  return readJsonOrNull(resp);
};

export const sendCommand: FireManagementGateway["sendCommand"] = async (params) => {
  await makeCreateRequest({
    url: "/api/securitymanagement/sendCommand",
    payload: { ...params } as any,
  }).send();
};

// Get Fire Management Stats
export const getFireManageStats = async (): Promise<{
  hostCount: number;
  pointCount: number;
  todayAlarmCount: number;
  todayFaultCount: number;
}> => {
  const resp = await makeGETRequest({
    url: "/api/securitymanagement/getFireManageStats",
  }).send();
  const data = await resp.json();
  const unwrapped = unwrapData<any>(data) || {};
  return {
    hostCount: unwrapped.hostCount ?? 0,
    pointCount: unwrapped.pointCount ?? 0,
    todayAlarmCount: unwrapped.todayAlarmCount ?? 0,
    todayFaultCount: unwrapped.todayFaultCount ?? 0,
  };
};

// Get Product Model List
export const getProductModelList = async (type?: string): Promise<string[]> => {
  const resp = await makeGETRequest(
    type
      ? { url: `${SECURITY_MANAGEMENT_API}/getProductModelList`, payload: { type } }
      : { url: `${SECURITY_MANAGEMENT_API}/getProductModelList` },
  ).send();
  const data = await resp.json();
  const unwrapped = unwrapData<any>(data);
  return Array.isArray(unwrapped) ? unwrapped : [];
};

export const getDeviceNameList = async (): Promise<
  { id: number | string; deviceName: string; areaName?: string; productModel?: string }[]
> => {
  const resp = await makeGETRequest({
    url: "/api/securitymanagement/getDeviceNameList",
  }).send();
  const data = await resp.json();
  const unwrapped = unwrapData<any>(data);
  return Array.isArray(unwrapped) ? unwrapped : [];
};

export const getRefMonitorDeviceIds = async (deviceId: string | number): Promise<string[]> => {
  const resp = await makeGETRequest({
    url: "/api/securitymanagement/getRefMonitorDeviceIds",
    payload: { deviceId },
  }).send();
  const data = await resp.json();
  const unwrapped = unwrapData<any>(data);
  return Array.isArray(unwrapped) ? unwrapped : [];
};

export const getDeviceCenterInfo = async (deviceId: string | number): Promise<any> => {
  const resp = await makeGETRequest({
    url: `/api/device-center/device/${deviceId}`,
    payload: { deviceId },
  }).send();
  const data = await resp.json();
  return unwrapData<any>(data);
};

export const getAreaList = async (): Promise<any[]> => {
  const resp = await makeGETRequest({
    url: "/api/mdata/area/list",
  }).send();
  const data = await resp.json();
  const unwrapped = unwrapData<any>(data);
  return Array.isArray(unwrapped) ? unwrapped : [];
};

export const getAreaPlaneMap = async (areaId: string | number): Promise<any[]> => {
  const resp = await makeGETRequest({
    url: `/api/emergency/area-plane-maps/area/${areaId}`,
  }).send();
  const data = await resp.json();
  const unwrapped = unwrapData<any>(data);
  return Array.isArray(unwrapped) ? unwrapped : [];
};

export const setControlPassword = async (params: { id: string | number; password: string }): Promise<void> => {
  await makeCreateRequest({
    url: "/api/securitymanagement/setControlPassword",
    payload: params,
  }).send();
};

/** @deprecated Use batchFillFirePointEmptyFields. */
export const batchFillEmptyFields = batchFillFirePointEmptyFields;

export const listFireManageDevicePage: FireManagementGateway["listFireManageDevicePage"] = listFireHosts;
