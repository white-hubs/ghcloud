import { defineComponent, nextTick, shallowRef } from "vue";

import type { FireHostRecord } from "@ghcloud/cube-service-interface/fire-management";
import { useAuthRequest } from "@ghcloud/cube-services-client/auth-request";
import { addFireManageDevice, listFireHosts } from "@ghcloud/cube-services-client/fire-management.client";
import { message } from "@ghcloud/cube-ui";

import { buildDevicePayload, getDeviceKey } from "../fire-host-config.utils";
import {
  FireDeviceSelectModal,
  type FireDeviceSelectModalExpose,
  type FireDeviceSelectionRecord,
} from "@/components/fire-device-select-modal";

export const HostFormModal = defineComponent({
  name: "HostFormModal",
  emits: ["saved"],
  setup: (_props, { emit, expose }) => {
    const managedDeviceIds = shallowRef<Array<string | number>>([]);
    const pickerInitializing = shallowRef(false);
    const deviceSelectModalRef = shallowRef<FireDeviceSelectModalExpose | null>(null);
    const HOST_PAGE_SIZE = 200;

    const getManagedDeviceId = (record: FireHostRecord): string | number | undefined =>
      record.deviceId ?? record.code ?? record.deviceCode ?? record.id;

    const loadManagedHosts = async (): Promise<FireHostRecord[]> => {
      const firstPage = await useAuthRequest(() => listFireHosts({ pageNumber: 1, pageSize: HOST_PAGE_SIZE }));
      const pages = Math.max(firstPage.pages ?? 1, 1);
      if (pages === 1) {
        return firstPage.records;
      }
      const remainingPages = await Promise.all(
        Array.from({ length: pages - 1 }, (_, index) =>
          useAuthRequest(() => listFireHosts({ pageNumber: index + 2, pageSize: HOST_PAGE_SIZE })),
        ),
      );
      return [firstPage, ...remainingPages].flatMap((page) => page.records);
    };

    const loadManagedDeviceIds = async (): Promise<Array<string | number>> => {
      const records = await loadManagedHosts();
      return records.map(getManagedDeviceId).filter((id): id is string | number => id !== undefined && id !== "");
    };

    const saveHost = async (devices: FireDeviceSelectionRecord[]): Promise<boolean> => {
      if (devices.length === 0) {
        message.warning("请选择需要纳管的物联设备");
        return false;
      }

      const managedIdSet = new Set(managedDeviceIds.value.map(String));
      const devicesToAdd = devices.filter((device) => !managedIdSet.has(String(getDeviceKey(device))));
      if (devicesToAdd.length === 0) {
        message.warning("所选设备均已纳管，请选择尚未纳管的设备");
        return false;
      }

      try {
        const payloads = devicesToAdd.map((device) => buildDevicePayload(device, device.name?.trim() || device.code?.trim() || ""));
        if (payloads.some((payload) => !payload)) {
          message.warning("部分设备信息不完整，请重新选择");
          return false;
        }
        await Promise.all(payloads.map((payload) => useAuthRequest(() => addFireManageDevice(payload!))));
        message.success(`成功新增 ${devicesToAdd.length} 台消防主机`);
        emit("saved");
        return true;
      } catch (error) {
        message.error((error as Error).message || "保存主机失败");
        return false;
      }
    };

    const openModal = (): void => {
      managedDeviceIds.value = [];
      pickerInitializing.value = true;
      const hideLoading = message.loading("加载可纳管设备...", 0);
      void (async () => {
        try {
          managedDeviceIds.value = await loadManagedDeviceIds();
          await nextTick();
          deviceSelectModalRef.value?.openModal([]);
        } catch (error) {
          message.error((error as Error).message || "加载已纳管主机失败");
        } finally {
          hideLoading();
          pickerInitializing.value = false;
        }
      })();
    };

    expose({ openModal });

    return () => (
      <FireDeviceSelectModal
        ref={deviceSelectModalRef}
        title="新增消防主机"
        selectedDevices={[]}
        disabled={pickerInitializing.value}
        pageSize={20}
        requireSelection
        footerTip="将物联设备纳管为消防主机；列表已排除已纳管设备"
        queryParams={{ filterDeviceIds: managedDeviceIds.value }}
        submit={saveHost}
        onClosed={() => {
          managedDeviceIds.value = [];
          pickerInitializing.value = false;
        }}
      />
    );
  },
});
