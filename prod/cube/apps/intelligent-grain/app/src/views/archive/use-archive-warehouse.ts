import { computed, ref } from "vue";
import { useRoute, useRouter } from "vue-router";

import type { GrainWarehouseOption } from "@ghcloud/cube-service-interface/intelligent-grain";
import { useAuthRequest } from "@ghcloud/cube-services-client/auth-request";
import { listIntelligentGrainWarehouseOptions } from "@ghcloud/cube-services-client/intelligent-grain.client";

export function useArchiveWarehouse() {
  const route = useRoute();
  const router = useRouter();
  const warehouseLoading = ref(false);
  const warehouseOptions = ref<GrainWarehouseOption[]>([]);
  const selectedWarehouseId = ref<string>();

  const selectedWarehouse = computed(() => warehouseOptions.value.find((item) => item.warehouseId === selectedWarehouseId.value));

  const loadWarehouses = async (): Promise<string | undefined> => {
    warehouseLoading.value = true;
    try {
      const options = await useAuthRequest(() => listIntelligentGrainWarehouseOptions());
      warehouseOptions.value = options;
      const queryWarehouseId = typeof route.query.warehouseId === "string" ? route.query.warehouseId : undefined;
      const nextWarehouseId = queryWarehouseId ?? selectedWarehouseId.value ?? options[0]?.warehouseId;
      selectedWarehouseId.value = nextWarehouseId;
      if (nextWarehouseId && route.query.warehouseId !== nextWarehouseId) {
        void router.replace({ query: { ...route.query, warehouseId: nextWarehouseId } });
      }
      return nextWarehouseId;
    } finally {
      warehouseLoading.value = false;
    }
  };

  const changeWarehouse = async (warehouseId: string): Promise<void> => {
    selectedWarehouseId.value = warehouseId;
    await router.replace({ query: { ...route.query, warehouseId } });
  };

  return {
    warehouseLoading,
    warehouseOptions,
    selectedWarehouse,
    selectedWarehouseId,
    loadWarehouses,
    changeWarehouse,
  };
}
