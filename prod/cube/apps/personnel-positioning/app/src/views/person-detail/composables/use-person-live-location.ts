import { computed, onBeforeUnmount, onMounted, ref, watch, type Ref } from "vue";

import { positioningApi, type ApiLocation } from "@/api/positioning";
import { USE_MOCK } from "@/constants/env";
import { IOT_PROPERTIES } from "@/constants/iot-properties";
import { OUTDOOR_SCENE_ID } from "@/constants/realtime";
import { useAreaBackground } from "@/hooks/use-area-background";
import { useSystemAreas } from "@/hooks/use-system-areas";
import { projectFloorCoordinate } from "@/utils/floor-coordinate";
import { normalizeDateTime } from "@/utils/positioning";
import { areaForFloor } from "@/utils/system-areas";
import { DevicePropertySocket, type DevicePropertyUpdate } from "@/utils/terminal-property-socket";

/** 人员详情只订阅当前绑定终端，并按终端上报的 floor_id 自动切换平面图。 */
export function usePersonLiveLocation(personId: Readonly<Ref<string>>) {
  const areas = useSystemAreas();
  const areaId = ref(OUTDOOR_SCENE_ID);
  const background = useAreaBackground(areaId, areas.byId);
  const location = ref<ApiLocation>();
  const loading = ref(false);
  const error = ref("");
  const coordinate = computed(() =>
    location.value?.coordinateType === "OUTDOOR" ||
    location.value?.coordinateX == null ||
    location.value.coordinateY == null ||
    background.loadedId.value !== areaId.value ||
    background.floorId.value !== location.value.floorId
      ? null
      : projectFloorCoordinate({ x: location.value.coordinateX, y: location.value.coordinateY }, background.axis.value),
  );
  let socket: DevicePropertySocket | undefined;
  let refreshTimer: ReturnType<typeof setInterval> | undefined;
  let requestVersion = 0;
  let lastPushAt = 0;
  let disposed = false;

  function selectArea(current: ApiLocation | undefined): void {
    areaId.value =
      current?.coordinateType !== "OUTDOOR" && current?.floorId
        ? (areaForFloor(areas.byId.value, current.floorId, current.positioningAreaId)?.key ?? OUTDOOR_SCENE_ID)
        : OUTDOOR_SCENE_ID;
  }

  function applyUpdates(updates: DevicePropertyUpdate[]): void {
    const current = location.value;
    if (!current?.iotDeviceId) return;
    const next = { ...current };
    let changed = false;
    let locationTime = Date.parse(normalizeDateTime(next.locationTime)) || 0;
    for (const update of updates) {
      if (update.deviceId !== current.iotDeviceId) continue;
      if (update.code === IOT_PROPERTIES.floorId) {
        const floorId = String(update.value ?? "");
        if (floorId && floorId !== next.floorId) {
          next.floorId = floorId;
          delete next.coordinateX;
          delete next.coordinateY;
          delete next.floorName;
          delete next.buildingName;
          delete next.positioningAreaId;
          delete next.coordinateType;
          changed = true;
        }
      } else if (update.code === IOT_PROPERTIES.validFlag && ["0", "false"].includes(String(update.value).toLowerCase())) {
        delete next.coordinateX;
        delete next.coordinateY;
        changed = true;
      } else if (update.code === IOT_PROPERTIES.x || update.code === IOT_PROPERTIES.y || update.code === IOT_PROPERTIES.z) {
        if (update.timestamp && update.timestamp < locationTime) continue;
        const value = Number(update.value);
        if (!Number.isFinite(value)) continue;
        if (update.timestamp && update.timestamp > locationTime && update.code !== IOT_PROPERTIES.z) {
          delete next.coordinateX;
          delete next.coordinateY;
        }
        if (update.code === IOT_PROPERTIES.x) next.coordinateX = value;
        if (update.code === IOT_PROPERTIES.y) next.coordinateY = value;
        if (update.code === IOT_PROPERTIES.z) next.coordinateZ = value;
        if (update.timestamp) locationTime = Math.max(locationTime, update.timestamp);
        changed = true;
      }
    }
    if (!changed) return;
    if (locationTime) next.locationTime = new Date(locationTime).toISOString();
    if (next.coordinateX != null && next.coordinateY != null) next.coordinateType = "INDOOR";
    lastPushAt = Date.now();
    location.value = next;
    selectArea(next);
  }

  async function refresh(): Promise<void> {
    if (USE_MOCK || !personId.value || disposed) return;
    if (areas.error.value) void areas.load();
    const id = personId.value;
    const version = ++requestVersion;
    const requestedAt = Date.now();
    loading.value = true;
    try {
      const result = await positioningApi.realtime(id);
      if (disposed || version !== requestVersion || id !== personId.value) return;
      const fresh = result.find((item) => item.positioningPersonId === id);
      const current = location.value;
      let next = fresh;
      if (fresh && current?.iotDeviceId && fresh.iotDeviceId === current.iotDeviceId && lastPushAt > requestedAt) {
        next = { ...fresh };
        delete next.floorId;
        delete next.coordinateX;
        delete next.coordinateY;
        delete next.coordinateZ;
        delete next.locationTime;
        if (current.floorId !== undefined) next.floorId = current.floorId;
        if (current.coordinateX !== undefined) next.coordinateX = current.coordinateX;
        if (current.coordinateY !== undefined) next.coordinateY = current.coordinateY;
        if (current.coordinateZ !== undefined) next.coordinateZ = current.coordinateZ;
        if (current.locationTime !== undefined) next.locationTime = current.locationTime;
      }
      location.value = next;
      socket?.setTargets(next?.iotDeviceId ? [next.iotDeviceId] : [], next?.iotDeviceId ? [next.iotDeviceId] : []);
      selectArea(next);
      error.value = "";
    } catch {
      if (version === requestVersion && !disposed) error.value = "查询人员实时位置失败，请稍后重试";
    } finally {
      if (version === requestVersion && !disposed) loading.value = false;
    }
  }

  watch(personId, () => {
    requestVersion++;
    location.value = undefined;
    areaId.value = OUTDOOR_SCENE_ID;
    socket?.setTargets([], []);
    void refresh();
  });
  watch(areas.byId, () => selectArea(location.value));
  onMounted(() => {
    if (USE_MOCK) return;
    socket = new DevicePropertySocket(applyUpdates, () => {
      void refresh();
    });
    void Promise.allSettled([areas.load(), refresh()]);
    refreshTimer = setInterval(() => {
      if (document.visibilityState !== "hidden") void refresh();
    }, 60_000);
  });
  onBeforeUnmount(() => {
    disposed = true;
    requestVersion++;
    if (refreshTimer) clearInterval(refreshTimer);
    socket?.stop();
  });

  return { location, loading, error, areas, areaId, background, coordinate, refresh };
}
