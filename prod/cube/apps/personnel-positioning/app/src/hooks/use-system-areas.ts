import { computed, onScopeDispose, shallowRef, type ComputedRef } from "vue";

import { positioningApi } from "@/api/positioning";
import { buildSystemAreaTree, type SystemAreaNode } from "@/utils/system-areas";

/** 加载定位专用区域树；不使用 mdata 的通用区域。 */
export function useSystemAreas(): {
  tree: ComputedRef<SystemAreaNode[]>;
  byId: ComputedRef<Map<string, SystemAreaNode>>;
  loading: ComputedRef<boolean>;
  error: ComputedRef<string>;
  load: () => Promise<boolean>;
} {
  const data = shallowRef(buildSystemAreaTree([]));
  const loading = shallowRef(false);
  const error = shallowRef("");
  let disposed = false;

  onScopeDispose(() => {
    disposed = true;
  });

  async function load(): Promise<boolean> {
    if (loading.value || disposed) {
      return false;
    }
    loading.value = true;
    error.value = "";
    try {
      const areas = await positioningApi.areaTree();
      if (disposed) {
        return false;
      }
      if (!Array.isArray(areas)) {
        throw new TypeError("区域列表响应格式异常");
      }
      data.value = buildSystemAreaTree(areas);
      return true;
    } catch {
      if (!disposed) {
        error.value = "区域加载失败，请重试";
      }
      return false;
    } finally {
      if (!disposed) {
        loading.value = false;
      }
    }
  }

  return {
    tree: computed(() => data.value.tree),
    byId: computed(() => data.value.byId),
    loading: computed(() => loading.value),
    error: computed(() => error.value),
    load,
  };
}
