import { showToast } from "vant";
import { computed, nextTick, onMounted, ref, watch } from "vue";

import { cloneRoutePoint } from "./components/map-marker-styles";
import type { EvacuationMapExpose } from "./components/unified-evacuation-map";
import { listAreaPlaneMapsByAreaId } from "@/api/area-plane-map";
import { pageEvacuationRoutes } from "@/api/evacuation-route";
import { cubeDeviceSuperviseService, cubeMdataService } from "@/api/server";
import { type AlarmRecordItem, mapAlarmRecordToEmergencyEvent, parseAlarmRecordsPageResult } from "@/utils/alarm-record-mapper";
import { mapAreaPlaneMapToFloorPlan } from "@/utils/area-plane-map-mapper";
import { findAreaTreeItem, mapAreaTreesToTreeItems, resolveAreaIdInTree, resolveInitialAreaId } from "@/utils/area-tree";
import { createDevMockAlarmRecord, DEV_MOCK_USER_POINT, isDevMockAlarmId } from "@/utils/dev-mock-alarm";
import { mapEvacuationRouteVO } from "@/utils/evacuation-route-mapper";
import { getFloorPlanImagePath, toImageSrc } from "@/utils/file-url";
import { isCubeAppContext, readCurrentPosition } from "@/utils/geolocation";
import { enrichFloorPlanAspect } from "@/utils/plan-image-aspect";
import type { AreaTreeItem, EmergencyEvent, EvacuationRoute, FloorPlanImage, PlanTransform, RoutePoint } from "@/utils/types";
import { DEFAULT_MAP_CENTER } from "@/utils/types";

export function useEvacuationGuide(alarmId: () => string | undefined) {
  const loading = ref(true);
  const areaLoading = ref(false);
  const locating = ref(false);
  const event = ref<EmergencyEvent | null>(null);
  const routes = ref<EvacuationRoute[]>([]);
  const floorPlan = ref<FloorPlanImage | null>(null);
  const planImageUrl = ref("");
  const planImageFile = ref<{ id: string; path: string; endpointPath: string } | null>(null);
  const planTransform = ref<PlanTransform>({ center: { ...DEFAULT_MAP_CENTER }, scale: 1, rotation: 0 });
  const areaTree = ref<AreaTreeItem[]>([]);
  const selectedAreaId = ref<string | null>(null);
  const fireAreaId = ref<string | null>(null);
  const userPoint = ref<RoutePoint | null>(null);
  const mapRef = ref<EvacuationMapExpose | null>(null);
  let initialLocationRequested = false;

  const selectedAreaName = computed(() => {
    if (!selectedAreaId.value) {
      return event.value?.areaName ?? "选择区域";
    }
    return findAreaTreeItem(areaTree.value, selectedAreaId.value)?.name ?? event.value?.areaName ?? "选择区域";
  });

  const firePoint = computed<RoutePoint | null>(() => event.value?.firePoint ?? null);

  const visibleRoutes = computed(() => routes.value.filter((route) => route.enabled));

  async function loadAlarmRecord(id: string): Promise<AlarmRecordItem | null> {
    if (isDevMockAlarmId(id)) {
      return createDevMockAlarmRecord();
    }
    const cached = history.state?.record as AlarmRecordItem | undefined;
    if (cached && String(cached.id) === id) {
      return cached;
    }
    try {
      const detail = await cubeDeviceSuperviseService.getAlarmRecordDetail(id);
      if (detail && typeof detail === "object" && "id" in detail) {
        return detail as AlarmRecordItem;
      }
    } catch {
      // fallback to list search
    }
    const statuses = ["ALARM_UN_CONFIRMED", "ALARM_PROGRESS_CONFIRMED", "ALARM_HANDLER", "ALARM_SUSPEND"];
    for (const alarmStatus of statuses) {
      const res = await cubeDeviceSuperviseService.getAlarmRecordsPage({
        pageNumber: 1,
        pageSize: 50,
        alarmStatus,
      });
      const { records } = parseAlarmRecordsPageResult(res);
      const found = records.find((r) => String(r.id) === id);
      if (found) {
        return found;
      }
    }
    return null;
  }

  async function loadAreaData(areaId: string): Promise<void> {
    const [maps, routePage] = await Promise.all([
      listAreaPlaneMapsByAreaId(areaId),
      pageEvacuationRoutes({ pageNumber: 1, pageSize: 100, areaId }),
    ]);
    routes.value = (routePage.records ?? []).map(mapEvacuationRouteVO);
    const mapped = maps.map(mapAreaPlaneMapToFloorPlan).find((m) => m != null) ?? null;
    if (mapped) {
      const enriched = await enrichFloorPlanAspect(mapped.floorPlan);
      floorPlan.value = enriched;
      planImageFile.value = {
        id: enriched.id,
        path: enriched.path ?? "",
        endpointPath: enriched.endpointPath ?? "",
      };
      planImageUrl.value = toImageSrc(getFloorPlanImagePath(enriched));
      planTransform.value = mapped.transform;
      if (isCubeAppContext()) {
        console.log("[emergency-dispatch][平面图] 区域数据加载", {
          areaId,
          fileId: planImageFile.value.id,
          aspectRatio: enriched.aspectRatio,
          selectedPath: planImageUrl.value,
        });
      }
    } else {
      floorPlan.value = null;
      planImageFile.value = null;
      planImageUrl.value = "";
      planTransform.value = { center: event.value?.firePoint ?? DEFAULT_MAP_CENTER, scale: 1, rotation: 0 };
    }
    await nextTick();
    mapRef.value?.focusPlanView();
  }

  async function loadAreaTree(): Promise<void> {
    const areas = await cubeMdataService.getAreaTree();
    areaTree.value = mapAreaTreesToTreeItems(Array.isArray(areas) ? areas : []);
  }

  async function load(id: string): Promise<void> {
    loading.value = true;
    initialLocationRequested = false;
    userPoint.value = null;
    try {
      const record = await loadAlarmRecord(id);
      if (!record) {
        showToast("未找到报警记录");
        event.value = null;
        return;
      }
      event.value = mapAlarmRecordToEmergencyEvent(record);
      await loadAreaTree();

      fireAreaId.value = resolveAreaIdInTree(areaTree.value, event.value.areaId) ?? event.value.areaId ?? null;
      selectedAreaId.value = resolveInitialAreaId(event.value, areaTree.value);

      if (selectedAreaId.value) {
        await loadAreaData(selectedAreaId.value);
      } else if (event.value.firePoint) {
        planTransform.value = { center: event.value.firePoint, scale: 1, rotation: 0 };
      }
    } catch {
      showToast("加载疏散指引失败");
      event.value = null;
    } finally {
      loading.value = false;
    }
  }

  function selectArea(areaId: string): void {
    const resolvedId = resolveAreaIdInTree(areaTree.value, areaId) ?? areaId;
    if (selectedAreaId.value === resolvedId && !areaLoading.value) {
      return;
    }
    selectedAreaId.value = resolvedId;
    areaLoading.value = true;
    void loadAreaData(resolvedId).finally(() => {
      areaLoading.value = false;
    });
  }

  function resetToFireArea(): void {
    if (fireAreaId.value) {
      selectArea(fireAreaId.value);
      return;
    }
    const fallbackId = resolveInitialAreaId(event.value!, areaTree.value);
    if (fallbackId) {
      selectArea(fallbackId);
    }
  }

  async function applyUserPointToMap(point: RoutePoint): Promise<void> {
    userPoint.value = cloneRoutePoint(point);
    await nextTick();
    mapRef.value?.applyUserLocation(point);
    mapRef.value?.refreshMarkers();
  }

  async function refreshUserLocation(options?: { silent?: boolean }): Promise<void> {
    if (locating.value) {
      return;
    }
    locating.value = true;
    try {
      const point = await readCurrentPosition();
      await applyUserPointToMap(point);
      if (!options?.silent) {
        showToast(`位置已刷新（${point.lng.toFixed(6)}, ${point.lat.toFixed(6)}）`);
      }
    } catch {
      if (import.meta.env.DEV) {
        await applyUserPointToMap({ ...DEV_MOCK_USER_POINT });
        if (!options?.silent) {
          showToast("已使用开发模拟位置");
        }
        return;
      }
      if (!options?.silent) {
        showToast(isCubeAppContext() ? "获取位置失败，请检查 App 定位权限" : "请在 App 内使用定位功能");
      }
    } finally {
      locating.value = false;
    }
  }

  function handleMapReady(): void {
    if (initialLocationRequested) {
      return;
    }
    initialLocationRequested = true;
    mapRef.value?.focusPlanView();
    void refreshUserLocation({ silent: true });
  }

  function bindMapRef(instance: EvacuationMapExpose | null): void {
    mapRef.value = instance;
    if (instance && userPoint.value) {
      instance.applyUserLocation(userPoint.value);
      instance.refreshMarkers();
    }
    if (instance && planTransform.value.center) {
      instance.focusPlanView();
    }
  }

  onMounted(() => {
    const id = alarmId();
    if (id) {
      void load(id);
    }
  });

  watch(alarmId, (id) => {
    if (id) {
      void load(id);
    }
  });

  return {
    loading,
    areaLoading,
    locating,
    event,
    routes,
    visibleRoutes,
    floorPlan,
    planImageUrl,
    planImageFile,
    planTransform,
    areaTree,
    selectedAreaId,
    fireAreaId,
    selectedAreaName,
    firePoint,
    userPoint,
    bindMapRef,
    handleMapReady,
    selectArea,
    resetToFireArea,
    refreshUserLocation,
  };
}
