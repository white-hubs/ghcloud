import { makeCreateRequest, makeGETRequest, makeListRequest, makeUpdateRequest } from "@ghcloud/cube-gateway";
import { useAuthRequest } from "@ghcloud/cube-services-client/auth-request";

const PERSONNEL_API = "/api/personnel";
const POSITIONING_API = `${PERSONNEL_API}/positioning`;

export type PositioningDeviceType = "TERMINAL" | "BASE_STATION";

export interface ApiPage<T> {
  total: number;
  pages: number;
  records: T[];
}

export interface ApiPerson {
  id: string;
  source: string;
  sourceEmployeeId: string;
  name: string;
  jobNumber?: string;
  mobile?: string;
  organizationId?: string;
  organizationName?: string;
  postName?: string;
  bound?: boolean;
  positioningDeviceId?: string;
  deviceNumber?: string;
  deviceName?: string;
}

export interface ApiStaff {
  id: string;
  name: string;
  mobile?: string;
  jobNumber?: string;
  organizationId?: string;
  organizationName?: string;
  appointmentName?: string;
  postNames?: string;
  type?: string;
  typeName?: string;
  state?: string;
  stateName?: string;
  status?: string;
  statusName?: string;
}

export interface ApiDevice {
  id: string;
  iotDeviceId: string;
  deviceType: PositioningDeviceType;
  deviceNumber?: string;
  deviceName?: string;
  productId?: string;
  productCategoryCode?: string;
  productCategoryName?: string;
  enabled: boolean;
  online?: boolean;
  battery?: number;
  propertyTime?: number;
  lastSyncTime?: string;
}

export interface ApiDeviceSelection {
  iotDeviceId: string;
  deviceNumber?: string;
  deviceName?: string;
  productId?: string;
  productCategoryCode?: string;
  productCategoryName?: string;
}

export interface ApiBinding {
  id: string;
  positioningPersonId: string;
  positioningDeviceId: string;
  deviceNumber?: string;
  deviceName?: string;
  startTime: string | number;
  endTime?: string | number;
  bindReason?: string;
  unbindReason?: string;
  current?: boolean;
  bindOperator?: string;
  bindTime?: string;
  unbindOperator?: string;
  unbindTime?: string;
}

export interface ApiLocation {
  positioningAreaId?: string;
  positioningPersonId?: string;
  personName?: string;
  positioningDeviceId: string;
  deviceType?: PositioningDeviceType;
  iotDeviceId?: string;
  deviceNumber?: string;
  deviceName?: string;
  online?: boolean;
  battery?: number;
  lastKnown?: boolean;
  locationTime?: string | number;
  receivedTime?: string;
  coordinateType?: "OUTDOOR" | "INDOOR";
  longitude?: number;
  latitude?: number;
  coordinateX?: number;
  coordinateY?: number;
  coordinateZ?: number;
  buildingId?: string;
  buildingName?: string;
  floorId?: string;
  floorName?: string;
}

export interface ApiTrackPoint {
  positioningAreaId?: string;
  positioningDeviceId: string;
  deviceNumber?: string;
  locationTime: string | number;
  coordinateType?: "OUTDOOR" | "INDOOR";
  longitude?: number;
  latitude?: number;
  coordinateX?: number;
  coordinateY?: number;
  coordinateZ?: number;
  buildingId?: string;
  buildingName?: string;
  floorId?: string;
  floorName?: string;
}

export interface ApiTrack {
  positioningPersonId: string;
  personName?: string;
  jobNumber?: string;
  points: ApiTrackPoint[];
}

export interface ApiSyncResult {
  total: number;
  inserted: number;
  updated: number;
}

export interface ApiPositioningArea {
  id: string;
  parentId?: string;
  source: string;
  sourceId: string;
  floorId?: string;
  nodeType: "SCENE" | "BUILDING" | "FLOOR";
  name: string;
  level: number;
  sort: number;
  floorPlanFileId?: string;
  floorPlanFile?: { id: string; path?: string; name?: string };
  coordinateAxis?: string;
  lastSyncTime?: string;
  children?: ApiPositioningArea[];
}

function unwrap<T>(body: unknown): T {
  let current = body;
  for (let index = 0; index < 4; index += 1) {
    if (current && typeof current === "object" && !Array.isArray(current) && "data" in current) {
      current = (current as { data: unknown }).data;
      continue;
    }
    break;
  }
  return current as T;
}

async function json<T>(request: ReturnType<typeof makeGETRequest>): Promise<T> {
  const response = await request.send();
  return unwrap<T>(await response.json());
}

async function create<T>(url: string, payload: Record<string, unknown>): Promise<T> {
  return useAuthRequest(() => json<T>(makeCreateRequest({ url, payload })));
}

async function get<T>(url: string, payload?: Record<string, unknown>): Promise<T> {
  return useAuthRequest(() => json<T>(makeGETRequest(payload ? { url, payload } : { url })));
}

async function list<T>(url: string, payload?: Record<string, unknown>): Promise<T> {
  return useAuthRequest(() => json<T>(makeListRequest(payload ? { url, payload } : { url })));
}

async function update<T>(url: string, payload: Record<string, unknown>): Promise<T> {
  return useAuthRequest(() => json<T>(makeUpdateRequest({ url, payload })));
}

export const positioningApi = {
  areaTree: () => list<ApiPositioningArea[]>(`${POSITIONING_API}/area/tree`),
  pageAreas: (payload: Record<string, unknown>) => list<ApiPage<ApiPositioningArea>>(`${POSITIONING_API}/area/page`, payload),
  getArea: (id: string) => get<ApiPositioningArea>(`${POSITIONING_API}/area/${id}`),
  syncAreas: () => create<ApiSyncResult>(`${POSITIONING_API}/area/sync`, {}),
  pagePersons: (payload: Record<string, unknown>) => list<ApiPage<ApiPerson>>(`${POSITIONING_API}/person/page`, payload),
  getPerson: (id: string) => get<ApiPerson>(`${POSITIONING_API}/person/${id}`),
  pageStaff: (payload: Record<string, unknown>) => list<ApiPage<ApiStaff>>(`${PERSONNEL_API}/staff/page`, payload),
  getStaffDetail: (id: string) => get<ApiStaff | null>(`${PERSONNEL_API}/staff/${id}`),
  savePersons: (sourceEmployeeIds: string[]) => create<string[]>(`${POSITIONING_API}/person/batch`, { sourceEmployeeIds }),
  listBindingRecords: (personId: string) => list<ApiBinding[]>(`${POSITIONING_API}/person/${personId}/binding-record`),
  bind: (personId: string, positioningDeviceId: string, reason?: string) =>
    create<void>(`${POSITIONING_API}/person/${personId}/binding`, {
      positioningDeviceId,
      ...(reason ? { reason } : {}),
    }),
  unbind: (personId: string, reason: string) => create<void>(`${POSITIONING_API}/person/${personId}/unbind`, { reason }),
  pageDevices: (payload: Record<string, unknown>) => list<ApiPage<ApiDevice>>(`${POSITIONING_API}/device/page`, payload),
  syncDevices: (deviceType: PositioningDeviceType, devices: ApiDeviceSelection[]) =>
    create<ApiSyncResult>(`${POSITIONING_API}/device/sync`, { deviceType, devices }),
  setDeviceEnabled: (id: string, enabled: boolean) => update<void>(`${POSITIONING_API}/device/${id}/enabled?enabled=${enabled}`, {}),
  realtime: (positioningPersonId?: string) =>
    list<ApiLocation[]>(`${POSITIONING_API}/realtime`, positioningPersonId ? { positioningPersonId } : undefined),
  deviceTargets: () => list<string[]>(`${POSITIONING_API}/realtime/device-targets`),
  realtimeDevices: (positioningAreaId: string) => list<ApiLocation[]>(`${POSITIONING_API}/realtime/devices`, { positioningAreaId }),
  track: (payload: { positioningPersonId: string; startTime: string; endTime: string }) =>
    get<ApiTrack>(`${POSITIONING_API}/track`, {
      positioningPersonId: payload.positioningPersonId,
      startTime: payload.startTime,
      endTime: payload.endTime,
    }),
};
