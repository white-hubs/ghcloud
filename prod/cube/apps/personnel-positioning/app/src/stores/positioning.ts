import { defineStore } from "pinia";
import { reactive } from "vue";

import {
  positioningApi,
  type ApiBinding,
  type ApiDevice,
  type ApiDeviceSelection,
  type ApiLocation,
  type ApiPage,
  type ApiPerson,
  type ApiStaff,
  type ApiTrackPoint,
} from "@/api/positioning";
import { OUTDOOR_SCENE_ID, OUTDOOR_SCENE_NAME } from "@/constants/realtime";
import type { BindingRecord, PositionPoint, PositioningDevice, PositioningPerson, PositioningState } from "@/models/positioning";
import { normalizeDateTime } from "@/utils/positioning";

const emptyState = (): PositioningState => ({
  persons: [],
  devices: [],
  bindings: [],
  positions: [],
  realtimeLocations: [],
});

const sourceKey = (source: string): "organization" | "contractor" | "visitor" => {
  if (source === "CONTRACTOR") return "contractor";
  if (source === "VISITOR") return "visitor";
  return "organization";
};

const onlineState = (online: boolean | undefined): "online" | "offline" => (online === true ? "online" : "offline");

const normalizePerson = (item: ApiPerson): PositioningPerson => {
  const jobNumber = item.jobNumber?.trim() ?? "";
  const organization = item.organizationName?.trim() || "—";
  const postName = item.postName?.trim() || "—";
  return {
    id: String(item.id),
    personNumber: jobNumber || String(item.id),
    sourceId: String(item.sourceEmployeeId),
    source: sourceKey(item.source),
    name: item.name || "—",
    mobile: item.mobile?.trim() || "—",
    jobNumber,
    organization,
    post: postName,
    postName,
    organizationId: item.organizationId,
    bound: Boolean(item.bound),
    positioningDeviceId: item.positioningDeviceId === undefined ? undefined : String(item.positioningDeviceId),
    deviceNumber: item.deviceNumber,
    deviceName: item.deviceName,
  };
};

const normalizeDevice = (item: ApiDevice): PositioningDevice => {
  const kind = item.deviceType === "BASE_STATION" ? "station" : "terminal";
  const deviceNumber = item.deviceNumber || item.iotDeviceId || String(item.id);
  return {
    id: String(item.id),
    sourceDeviceId: item.iotDeviceId,
    name: item.deviceName || deviceNumber,
    kind,
    type: kind,
    model: item.productCategoryName || "—",
    vendor: item.productCategoryName || "—",
    productId: item.productId,
    productCategoryName: item.productCategoryName,
    deviceNumber,
    online: onlineState(item.online),
    battery: item.battery ?? null,
    enabled: item.enabled,
    lastSyncTime: item.lastSyncTime,
    lastSeenAt: item.propertyTime ? new Date(item.propertyTime).toISOString() : null,
    space: "",
    coordinate: "",
    gatewayState: null,
    linkedStationIds: [],
  };
};

const normalizeBinding = (item: ApiBinding): BindingRecord => ({
  id: String(item.id),
  personId: String(item.positioningPersonId),
  terminalId: String(item.positioningDeviceId),
  terminalNumber: item.deviceNumber || "",
  terminalName: item.deviceName || "",
  startedAt: normalizeDateTime(item.startTime),
  endedAt: item.endTime ? normalizeDateTime(item.endTime) : null,
  action: item.endTime && item.unbindReason ? "bind" : "bind",
  actionReason: item.bindReason || null,
  endAction: item.endTime ? (item.unbindReason ? "unbind" : "replace") : null,
  endReason: item.endTime ? item.unbindReason || null : null,
  operator: item.bindOperator || item.unbindOperator || "—",
});

const sceneFor = (item: {
  coordinateType?: "OUTDOOR" | "INDOOR";
  positioningAreaId?: string;
  buildingId?: string;
  buildingName?: string;
  floorId?: string;
  floorName?: string;
}) => {
  if (item.coordinateType === "OUTDOOR") return { sceneId: OUTDOOR_SCENE_ID, scene: OUTDOOR_SCENE_NAME };
  const sceneId = item.positioningAreaId || item.floorId || item.buildingId || "indoor";
  const scene = [item.buildingName, item.floorName].filter(Boolean).join(" · ") || "室内位置";
  return { sceneId, scene };
};

const normalizePoint = (item: ApiLocation | ApiTrackPoint, personId?: string): PositionPoint => {
  const scene = sceneFor(item);
  const coordinateType = item.coordinateType ?? (item.coordinateX !== undefined || item.coordinateY !== undefined ? "INDOOR" : undefined);
  return {
    personId,
    terminalId: String(item.positioningDeviceId),
    terminalNumber: item.deviceNumber,
    at: normalizeDateTime(item.locationTime),
    sceneId: scene.sceneId,
    scene: scene.scene,
    coordinateType,
    online: "online" in item ? onlineState(item.online) : undefined,
    battery: "battery" in item ? (item.battery ?? null) : undefined,
    lastKnown: "lastKnown" in item ? item.lastKnown : undefined,
    longitude: item.longitude,
    latitude: item.latitude,
    x: item.coordinateX ?? Number.NaN,
    y: item.coordinateY ?? Number.NaN,
    z: item.coordinateZ,
    buildingId: item.buildingId,
    buildingName: item.buildingName,
    floorId: item.floorId,
    floorName: item.floorName,
  };
};

export const usePositioningStore = defineStore("personnel-positioning", () => {
  const state = reactive(emptyState());
  const loading = reactive({ persons: false, devices: false, realtime: false, track: false, staff: false });
  let trackRequestVersion = 0;

  const currentBinding = (personId: string) => state.bindings.find((item) => item.personId === personId && item.endedAt === null);
  const history = (personId: string) =>
    state.bindings.filter((item) => item.personId === personId).toSorted((a, b) => b.startedAt.localeCompare(a.startedAt));
  const positionsFor = (personId: string) =>
    state.positions.filter((item) => !item.personId || item.personId === personId).toSorted((a, b) => Date.parse(a.at) - Date.parse(b.at));

  async function queryPersons(payload: Record<string, unknown>): Promise<ApiPage<PositioningPerson>> {
    const page = await positioningApi.pagePersons(payload);
    return { ...page, records: page.records.map(normalizePerson) };
  }

  async function queryDevices(kind: "terminal" | "station", payload: Record<string, unknown>): Promise<ApiPage<PositioningDevice>> {
    const page = await positioningApi.pageDevices({
      ...payload,
      deviceType: kind === "terminal" ? "TERMINAL" : "BASE_STATION",
    });
    return { ...page, records: page.records.map(normalizeDevice) };
  }

  async function queryStaff(payload: Record<string, unknown>): Promise<ApiPage<ApiStaff>> {
    loading.staff = true;
    try {
      return await positioningApi.pageStaff(payload);
    } finally {
      loading.staff = false;
    }
  }

  async function loadStaffDetail(staffId: string): Promise<ApiStaff | null> {
    return positioningApi.getStaffDetail(staffId);
  }

  async function refreshPersons(): Promise<void> {
    loading.persons = true;
    try {
      const page = await queryPersons({ pageNumber: 1, pageSize: 500 });
      state.persons = page.records;
    } finally {
      loading.persons = false;
    }
  }

  async function loadPerson(personId: string): Promise<PositioningPerson> {
    const person = normalizePerson(await positioningApi.getPerson(personId));
    state.persons = [...state.persons.filter((item) => item.id !== person.id), person];
    return person;
  }

  async function refreshDevices(kind?: "terminal" | "station"): Promise<void> {
    loading.devices = true;
    try {
      const types = kind ? [kind] : (["terminal", "station"] as const);
      const pages = await Promise.all(types.map((item) => queryDevices(item, { pageNumber: 1, pageSize: 500 })));
      const next = pages.flatMap((page) => page.records);
      state.devices = kind ? [...state.devices.filter((item) => item.kind !== kind), ...next] : next;
    } finally {
      loading.devices = false;
    }
  }

  async function refreshBindings(personId: string): Promise<void> {
    const records = await positioningApi.listBindingRecords(personId);
    state.bindings = [...state.bindings.filter((item) => item.personId !== personId), ...records.map(normalizeBinding)];
  }

  async function savePersons(sourceIds: string[]): Promise<string[]> {
    const ids = await positioningApi.savePersons([...new Set(sourceIds)]);
    await refreshPersons();
    return ids;
  }

  async function bind(personId: string, deviceId: string, reason?: string): Promise<void> {
    await positioningApi.bind(personId, deviceId, reason);
    await Promise.all([refreshPersons(), refreshDevices("terminal"), refreshBindings(personId)]);
  }

  async function unbind(personId: string, reason: string): Promise<void> {
    await positioningApi.unbind(personId, reason);
    await Promise.all([refreshPersons(), refreshBindings(personId)]);
  }

  async function setDeviceEnabled(deviceId: string, enabled: boolean): Promise<void> {
    await positioningApi.setDeviceEnabled(deviceId, enabled);
    await refreshDevices();
  }

  async function syncDevices(kind: "terminal" | "station", devices: ApiDeviceSelection[]) {
    const result = await positioningApi.syncDevices(kind === "terminal" ? "TERMINAL" : "BASE_STATION", devices);
    await refreshDevices(kind);
    return result;
  }

  async function refreshRealtime(): Promise<void> {
    loading.realtime = true;
    try {
      const locations = await positioningApi.realtime();
      state.realtimeLocations = locations
        .filter((item) => item.locationTime)
        .map((item) => normalizePoint(item, String(item.positioningPersonId)));
    } finally {
      loading.realtime = false;
    }
  }

  async function refreshTrack(personId: string, startTime: string, endTime: string): Promise<void> {
    const version = ++trackRequestVersion;
    loading.track = true;
    try {
      const result = await positioningApi.track({ positioningPersonId: personId, startTime, endTime });
      if (version === trackRequestVersion) state.positions = result.points.map((item) => normalizePoint(item, personId));
    } finally {
      if (version === trackRequestVersion) loading.track = false;
    }
  }

  return {
    state,
    loading,
    currentBinding,
    history,
    positionsFor,
    queryPersons,
    queryDevices,
    queryStaff,
    loadStaffDetail,
    refreshPersons,
    loadPerson,
    refreshDevices,
    refreshBindings,
    savePersons,
    bind,
    unbind,
    setDeviceEnabled,
    syncDevices,
    refreshRealtime,
    refreshTrack,
  };
});
