import { ref, watch, type ComputedRef, type Ref } from "vue";

import { positioningApi, type ApiPositioningArea } from "@/api/positioning";
import { OUTDOOR_SCENE_ID } from "@/constants/realtime";
import { parseFloorCoordinateAxis, type FloorCoordinateAxis } from "@/utils/floor-coordinate";
import type { SystemAreaNode } from "@/utils/system-areas";

type AreaDetail = Pick<ApiPositioningArea, "id" | "floorId" | "floorPlanFile" | "coordinateAxis">;

export function useAreaBackground(
  sceneId: Readonly<Ref<string>>,
  areasById: ComputedRef<Map<string, SystemAreaNode>>,
  loadDetail: (id: string) => Promise<AreaDetail> = positioningApi.getArea,
) {
  const url = ref("");
  const axis = ref<FloorCoordinateAxis | null>(null);
  const floorId = ref("");
  const loadedId = ref("");
  const loading = ref(false);
  const error = ref("");

  watch(
    [sceneId, areasById],
    async ([id, byId], _, onCleanup) => {
      let active = true;
      onCleanup(() => {
        active = false;
      });
      url.value = "";
      axis.value = null;
      floorId.value = "";
      loadedId.value = "";
      error.value = "";
      loading.value = false;
      if (id === OUTDOOR_SCENE_ID || !byId.has(id)) {
        return;
      }
      loading.value = true;
      try {
        const detail = await loadDetail(id);
        if (active && sceneId.value === id) {
          const path = detail.floorPlanFile?.path;
          url.value = typeof path === "string" ? path.trim() : "";
          axis.value = url.value ? parseFloorCoordinateAxis(detail.coordinateAxis) : null;
          floorId.value = String(detail.floorId ?? "").trim();
          loadedId.value = id;
        }
      } catch {
        if (active) {
          error.value = "楼层平面图加载失败，请重试";
        }
      } finally {
        if (active) {
          loading.value = false;
        }
      }
    },
    { immediate: true },
  );

  return { url, axis, floorId, loadedId, loading, error };
}
