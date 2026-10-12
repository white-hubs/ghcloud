import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { DeviceVO } from '@ghcloud/cube-zhongda-heshun-service';

interface ProductInfo {
  id: string;
  name: string;
}

export const useTaskStore = defineStore('task', () => {
  // State
  const selectedProduct = ref<ProductInfo | null>(null);
  const selectedDevices = ref<DeviceVO[]>([]);

  // Actions
  const setProduct = (product: ProductInfo) => {
    selectedProduct.value = product;
    // When product changes, clear selected devices as they might not belong to new product
    selectedDevices.value = []; 
  };

  const setDevices = (devices: DeviceVO[]) => {
    selectedDevices.value = devices;
  };

  const clearTaskState = () => {
    selectedProduct.value = null;
    selectedDevices.value = [];
  };

  return {
    selectedProduct,
    selectedDevices,
    setProduct,
    setDevices,
    clearTaskState,
  };
});
