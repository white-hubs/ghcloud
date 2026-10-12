import { ref } from "vue";

import { useApplicationInfo } from "@ghcloud/cube-utils";

export interface RouteDevicePickerItem {
  id: string;
  name: string;
}

export function useRouteDeviceBind() {
  const { getCurrentApplicationStore } = useApplicationInfo();
  const tagCode = `builtin.app::${getCurrentApplicationStore().code}`;
  const deviceModalTableRef = ref<{ openModal: () => void }>();
  const deviceList = ref<RouteDevicePickerItem[]>([]);
  const bindRouteIndex = ref(-1);

  function openRouteDevicePicker(routeIndex: number, boundDevices: RouteDevicePickerItem[]): void {
    bindRouteIndex.value = routeIndex;
    deviceList.value = boundDevices.map((d) => ({ id: d.id, name: d.name }));
    deviceModalTableRef.value?.openModal();
  }

  function resetBindRouteIndex(): void {
    bindRouteIndex.value = -1;
  }

  return {
    tagCode,
    deviceModalTableRef,
    deviceList,
    bindRouteIndex,
    openRouteDevicePicker,
    resetBindRouteIndex,
  };
}
