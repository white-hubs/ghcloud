import { computed, defineComponent, shallowRef } from "vue";

import { useCubeModal } from "@ghcloud/cube-app-design";
import { Button, Descriptions, DescriptionsItem, Empty, Tag } from "@ghcloud/cube-ui";

import { DEVICE_KINDS, DEVICE_TYPES, ENABLE_STATES, ONLINE_STATES } from "@/constants/positioning";
import type { PositioningDevice } from "@/models/positioning";
import { usePositioningStore } from "@/stores/positioning";
import { formatDateTime } from "@/utils/positioning";

import "./device-detail-modal.less";

export function useDeviceDetailModal() {
  const store = usePositioningStore();
  const detailId = shallowRef("");
  const selectedDevice = computed(() => store.state.devices.find((device) => device.id === detailId.value));
  const [CubeModal, modal] = useCubeModal({ title: "设备详情", width: "720px", wrapperClass: "pp-device-detail-modal" });
  function renderDeviceDetail() {
    const device = selectedDevice.value;
    if (!device) return <Empty description="设备不存在或暂不可用" />;
    return (
      <Descriptions bordered column={2} size="small">
        <DescriptionsItem label="设备编号">{device.deviceNumber || device.id}</DescriptionsItem>
        <DescriptionsItem label="设备名称">{device.name || "—"}</DescriptionsItem>
        <DescriptionsItem label="设备类型">{DEVICE_TYPES[device.type].label}</DescriptionsItem>
        <DescriptionsItem label="设备产品">{device.productCategoryName || "—"}</DescriptionsItem>
        <DescriptionsItem label="设备品类">{device.vendor || "—"}</DescriptionsItem>
        <DescriptionsItem label="在线状态">
          <Tag color={ONLINE_STATES[device.online].color}>{ONLINE_STATES[device.online].label}</Tag>
        </DescriptionsItem>
        <DescriptionsItem label="启停状态">
          <Tag color={device.enabled ? "blue" : "default"}>{device.enabled ? ENABLE_STATES.enabled : ENABLE_STATES.disabled}</Tag>
        </DescriptionsItem>
        {device.kind === "terminal" && (
          <DescriptionsItem label="剩余电量" span={2}>
            {device.battery === null ? "—" : `${device.battery}%`}
          </DescriptionsItem>
        )}
        <DescriptionsItem label="最近属性时间" span={2}>
          {formatDateTime(device.lastSeenAt)}
        </DescriptionsItem>
        <DescriptionsItem label="最近同步时间" span={2}>
          {formatDateTime(device.lastSyncTime)}
        </DescriptionsItem>
      </Descriptions>
    );
  }

  const DeviceDetailModal = defineComponent({
    name: "DeviceDetailModal",
    setup: () => () => (
      <CubeModal v-slots={{ default: renderDeviceDetail, footer: () => <Button onClick={() => modal.close()}>关闭</Button> }} />
    ),
  });
  return {
    DeviceDetailModal,
    openDetail: (device: PositioningDevice): void => {
      detailId.value = device.id;
      modal.setState({ title: `${DEVICE_KINDS[device.kind]}详情` });
      modal.open();
    },
  };
}
