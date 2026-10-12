import { defineComponent, shallowRef } from "vue";

import { useAuthRequest } from "@ghcloud/cube-services-client/auth-request";
import { createFirePoint } from "@ghcloud/cube-services-client/fire-management.client";
import { message } from "@ghcloud/cube-ui";

import {
  FireDeviceSelectModal,
  type FireDeviceSelectModalExpose,
  type FireDeviceSelectionRecord,
} from "@/components/fire-device-select-modal";

export const PointDeviceAssociationModal = defineComponent({
  name: "PointDeviceAssociationModal",
  props: {
    hostId: { type: String, required: true },
  },
  emits: ["saved"],
  setup: (props, { emit, expose }) => {
    const selectedDevices = shallowRef<FireDeviceSelectionRecord[]>([]);
    const deviceSelectModalRef = shallowRef<FireDeviceSelectModalExpose | null>(null);

    const saveAssociation = async (devices: FireDeviceSelectionRecord[]): Promise<boolean> => {
      selectedDevices.value = devices;
      try {
        await Promise.all(
          selectedDevices.value.map((record) =>
            useAuthRequest(() =>
              createFirePoint({
                fireManageDeviceId: props.hostId,
                deviceId: record.id ?? record.deviceId ?? record.code ?? "",
                pointName: record.name,
                ...(record.productInfo?.brandName || record.brand ? { brandName: record.productInfo?.brandName ?? record.brand } : {}),
                code: record.code,
              }),
            ),
          ),
        );
        emit("saved");
        message.success(`已关联 ${selectedDevices.value.length} 个设备`);
        return true;
      } catch (error) {
        message.error((error as Error).message || "关联设备失败");
        return false;
      }
    };

    const openModal = (): void => {
      selectedDevices.value = [];
      deviceSelectModalRef.value?.openModal();
    };

    expose({ openModal });

    return () => (
      <FireDeviceSelectModal
        ref={deviceSelectModalRef}
        title="关联设备"
        selectedDevices={selectedDevices.value}
        pageSize={20}
        requireSelection
        footerTip="关联后回路、地址、编号及坐标默认留空，可在点位列表中编辑或导入补全"
        submit={saveAssociation}
        onSelectionChange={(devices: FireDeviceSelectionRecord[]) => (selectedDevices.value = devices)}
        onClosed={() => (selectedDevices.value = [])}
      />
    );
  },
});
