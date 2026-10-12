import type { ALARM_ACTIONS, ALARM_STATES, ALARM_TYPES, LOCATION_FILTERS } from "../constants/realtime";
import type { PositioningDevice, PositioningPerson, PositionPoint } from "./positioning";
import type { PositioningDeviceType } from "@/api/positioning";

export type LocationFilter = keyof typeof LOCATION_FILTERS;
export type AlarmType = keyof typeof ALARM_TYPES;
export type AlarmState = keyof typeof ALARM_STATES;
export type AlarmAction = keyof typeof ALARM_ACTIONS;
export interface MapCoordinate {
  x: number;
  y: number;
}
export interface MonitorRegion {
  id: string;
  sceneId: string;
  name: string;
  boundary: MapCoordinate[];
  label: MapCoordinate;
}
export interface LocatedPerson {
  person: PositioningPerson;
  terminal: PositioningDevice;
  point: PositionPoint;
  sceneId: string;
  coordinate: MapCoordinate | null;
}
export interface LocatedDevice {
  id: string;
  label: string;
  online: boolean | undefined;
  deviceType: PositioningDeviceType;
  personName?: string;
  personId?: string;
  coordinate: MapCoordinate | null;
}
export interface AlarmOperation {
  id: string;
  action: AlarmAction;
  at: string;
  operator: string;
  opinion: string;
  assignee: string;
  attachments?: AlarmAttachment[];
}
export interface AlarmAttachment {
  id: string;
  name: string;
  url: string;
}
export interface PositionAlarm {
  id: string;
  type: AlarmType;
  level: 1 | 2 | 3;
  state: AlarmState;
  sceneId: string;
  sceneName: string;
  regionId: string | null;
  regionName: string;
  personId: string | null;
  personName: string;
  terminalId: string;
  currentCount: number | null;
  ruleName: string;
  occurredAt: string | null;
  receivedAt: string;
  recoveredAt: string | null;
  closedAt: string | null;
  coordinate: MapCoordinate | null;
  coordinateText: string;
  positionAt: string | null;
  trigger: string;
  actualValue: string;
  assignee: string;
  operations: AlarmOperation[];
}
export interface RealtimeState {
  regions: MonitorRegion[];
  alarms: PositionAlarm[];
}
