import type {
  DEVICE_KINDS,
  DEVICE_TYPES,
  GATEWAY_STATES,
  ONLINE_STATES,
  PERSON_SOURCES,
  REPLACEMENT_REASONS,
  UNBIND_REASONS,
} from "../constants/positioning";
import type { PositionSceneEvent } from "./trajectory";

export type PersonSource = keyof typeof PERSON_SOURCES;
export type DeviceKind = keyof typeof DEVICE_KINDS;
export type AssociableDeviceKind = Exclude<DeviceKind, "gateway">;
export type DeviceType = keyof typeof DEVICE_TYPES;
export type OnlineState = keyof typeof ONLINE_STATES;
export type GatewayState = keyof typeof GATEWAY_STATES;
export type ReplacementReason = keyof typeof REPLACEMENT_REASONS;
export type UnbindReason = keyof typeof UNBIND_REASONS;
export type BindingEndReason = ReplacementReason | UnbindReason | string;

export interface SourcePerson {
  sourceId: string;
  source: PersonSource;
  name: string;
  mobile?: string;
  position?: string;
  organization: string;
  post: string;
}

export interface PositioningPerson extends SourcePerson {
  id: string;
  personNumber?: string;
  jobNumber?: string;
  organizationId?: string;
  postName?: string;
  bound?: boolean;
  positioningDeviceId?: string;
  deviceNumber?: string;
  deviceName?: string;
  lastSyncTime?: string;
  syncedAt?: string;
}

export interface PositioningDevice {
  /** 定位设备业务主键，绑定接口使用此值。 */
  id: string;
  sourceDeviceId?: string;
  name?: string;
  kind: DeviceKind;
  type: DeviceType;
  model: string;
  vendor: string;
  productId?: string;
  productCategoryName?: string;
  online: OnlineState;
  battery: number | null;
  enabled: boolean;
  lastSyncTime?: string;
  syncedAt?: string;
  lastSeenAt: string | null;
  space: string;
  coordinate: string;
  gatewayState: GatewayState | null;
  linkedStationIds: string[];
  deviceNumber?: string;
}

export interface BindingRecord {
  id: string;
  personId: string;
  terminalId: string;
  terminalNumber?: string;
  terminalName?: string;
  startedAt: string;
  endedAt: string | null;
  action: "bind" | "replace";
  actionReason: BindingEndReason | null;
  endAction: "replace" | "unbind" | null;
  endReason: BindingEndReason | null;
  operator: string;
}

export interface PositionPoint {
  personId?: string;
  terminalId: string;
  terminalNumber?: string;
  at: string;
  scene: string;
  sceneId?: string;
  coordinateType?: "OUTDOOR" | "INDOOR";
  online?: OnlineState;
  battery?: number | null;
  lastKnown?: boolean;
  longitude?: number;
  latitude?: number;
  x: number;
  y: number;
  z?: number;
  buildingId?: string;
  buildingName?: string;
  floorId?: string;
  floorName?: string;
}

export interface PositioningState {
  persons: PositioningPerson[];
  devices: PositioningDevice[];
  bindings: BindingRecord[];
  positions: PositionPoint[];
  realtimeLocations?: PositionPoint[];
  syncRecords?: DeviceSyncRecord[];
  sceneEvents?: PositionSceneEvent[];
}

export interface GatewayDraft {
  id: string;
  type: DeviceType;
  model: string;
  space: string;
}

export interface DeviceSyncRecord {
  id: string;
  deviceId: string;
  kind: DeviceKind;
  at: string;
  status: string;
  message: string;
}

export interface SyncResult {
  total: number;
  added: number;
  updated: number;
  failed: number;
  at: string;
  records: DeviceSyncRecord[];
}
