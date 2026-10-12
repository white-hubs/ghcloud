import { computed, defineComponent, ref, shallowRef } from "vue";

import { DeviceSelectTable, useCubeModal, type DeviceSelectRecord } from "@ghcloud/cube-app-design";
import { Button, Space, message } from "@ghcloud/cube-ui";

import type { ApiDeviceSelection } from "@/api/positioning";
import { DEVICE_KINDS } from "@/constants/positioning";
import type { AssociableDeviceKind } from "@/models/positioning";
import { usePositioningStore } from "@/stores/positioning";

import "./device-association-modal.less";

const stringValue = (value: string | number | undefined): string | undefined =>
  value === undefined || value === null ? undefined : String(value);

const toSelection = (record: DeviceSelectRecord): ApiDeviceSelection => ({
  iotDeviceId: String(record.id),
  deviceNumber: record.code,
  deviceName: record.name,
  productId: stringValue(record.productInfo?.id),
  productCategoryCode: record.productInfo?.productCategory?.code,
  productCategoryName: record.productInfo?.productCategory?.name,
});

export function useDeviceAssociationModal(onChanged: () => void) {
  const store = usePositioningStore();
  const kind = shallowRef<AssociableDeviceKind>("terminal");
  const selected = ref<DeviceSelectRecord[]>([]);
  const saving = shallowRef(false);
  const unSelectedData = computed<DeviceSelectRecord[]>(() =>
    store.state.devices.flatMap((device) => (device.sourceDeviceId ? [{ id: device.sourceDeviceId }] : [])),
  );
  const [CubeModal, modal] = useCubeModal({
    title: "同步定位设备",
    width: "min(1440px, calc(100vw - 48px))",
    wrapperClass: "pp-device-association-modal",
    destroyOnClose: true,
    onClosed: () => {
      selected.value = [];
    },
  });

  async function submit(): Promise<void> {
    if (saving.value) return;
    if (!selected.value.length) {
      message.warning("请至少选择一台设备");
      return;
    }
    saving.value = true;
    try {
      const result = await store.syncDevices(kind.value, selected.value.map(toSelection));
      message.success(
        "已同步 " + result.total + " 台" + DEVICE_KINDS[kind.value] + "，新增 " + result.inserted + " 台，更新 " + result.updated + " 台",
      );
      onChanged();
      modal.close();
    } catch (error) {
      message.error(error instanceof Error ? error.message : "同步设备失败，请重试");
    } finally {
      saving.value = false;
    }
  }

  const DeviceAssociationModal = defineComponent({
    name: "DeviceAssociationModal",
    setup: () => () => (
      <CubeModal
        v-slots={{
          default: () => (
            <>
              <p class="pp-device-association-modal__hint">请选择需要同步的{DEVICE_KINDS[kind.value]}，已同步设备不可重复选择。</p>
              <div class="pp-device-association-modal__table">
                <DeviceSelectTable
                  key={kind.value}
                  title={DEVICE_KINDS[kind.value]}
                  multiple
                  value={selected.value}
                  unSelectedData={unSelectedData.value}
                  scrollY={300}
                  pageSize={10}
                  syncToUrl={false}
                  onUpdate:value={(records: DeviceSelectRecord[]) => {
                    selected.value = records;
                  }}
                />
              </div>
            </>
          ),
          footer: () => (
            <Space>
              <Button disabled={saving.value} onClick={() => modal.close()}>
                取消
              </Button>
              <Button type="primary" loading={saving.value} disabled={selected.value.length === 0} onClick={() => void submit()}>
                确认同步
              </Button>
            </Space>
          ),
        }}
      />
    ),
  });
  return {
    DeviceAssociationModal,
    open: async (value: AssociableDeviceKind): Promise<void> => {
      kind.value = value;
      selected.value = [];
      try {
        await store.refreshDevices();
        modal.setState({ title: value === "terminal" ? "同步终端" : "同步基站" });
        modal.open();
      } catch (error) {
        message.error(error instanceof Error ? error.message : "加载已同步设备失败");
      }
    },
  };
}
