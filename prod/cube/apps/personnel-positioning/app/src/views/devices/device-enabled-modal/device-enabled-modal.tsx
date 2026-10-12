import { defineComponent, shallowRef } from "vue";

import { useCubeModal } from "@ghcloud/cube-app-design";
import { Alert, Button, Space, message } from "@ghcloud/cube-ui";

import { ENABLE_STATES } from "@/constants/positioning";
import type { PositioningDevice } from "@/models/positioning";
import { usePositioningStore } from "@/stores/positioning";

import "./device-enabled-modal.less";

export function useDeviceEnabledModal(onChanged: () => void) {
  const store = usePositioningStore();
  const enabledTarget = shallowRef<{ id: string; enabled: boolean } | null>(null);
  const saving = shallowRef(false);
  const [CubeModal, enabledApi] = useCubeModal({ width: "480px", wrapperClass: "pp-device-enabled-modal" });
  function confirmEnabled(device: PositioningDevice): void {
    enabledTarget.value = { id: device.id, enabled: !device.enabled };
    enabledApi.setState({ title: `确认${device.enabled ? ENABLE_STATES.disabled : ENABLE_STATES.enabled}设备` });
    enabledApi.open();
  }
  async function saveEnabled(): Promise<void> {
    if (!enabledTarget.value || saving.value) return;
    saving.value = true;
    try {
      await store.setDeviceEnabled(enabledTarget.value.id, enabledTarget.value.enabled);
      message.success(`设备已${enabledTarget.value.enabled ? ENABLE_STATES.enabled : ENABLE_STATES.disabled}`);
      enabledApi.close();
      onChanged();
    } catch (error) {
      message.error(error instanceof Error ? error.message : "更新设备状态失败，请重试");
    } finally {
      saving.value = false;
    }
  }
  const DeviceEnabledModal = defineComponent({
    name: "DeviceEnabledModal",
    setup: () => () => {
      const target = enabledTarget.value;
      return (
        <CubeModal
          v-slots={{
            default: () => (
              <div class="pp-device-confirm">
                <p>
                  确认{target?.enabled ? ENABLE_STATES.enabled : ENABLE_STATES.disabled}设备 <strong>{target?.id}</strong>？
                </p>
                <Alert
                  showIcon
                  type="info"
                  message={
                    target?.enabled ? "启用后，设备可继续用于定位业务。" : "停用后，设备将暂停用于定位业务。已有绑定关系及历史记录会保留。"
                  }
                />
              </div>
            ),
            footer: () => (
              <Space>
                <Button disabled={saving.value} onClick={() => enabledApi.close()}>
                  取消
                </Button>
                <Button type="primary" danger={!target?.enabled} loading={saving.value} onClick={saveEnabled}>
                  确认{target?.enabled ? ENABLE_STATES.enabled : ENABLE_STATES.disabled}
                </Button>
              </Space>
            ),
          }}
        />
      );
    },
  });
  return { DeviceEnabledModal, confirmEnabled };
}
