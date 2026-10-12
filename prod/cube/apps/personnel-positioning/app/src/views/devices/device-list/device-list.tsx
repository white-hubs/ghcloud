import { defineComponent, onMounted, shallowRef, watch } from "vue";
import { useRoute, useRouter } from "vue-router";

import { CubeLayout } from "@ghcloud/cube-app-design";
import { Button, TabPane, Tabs } from "@ghcloud/cube-ui";

import { DEVICE_KINDS } from "@/constants/positioning";
import type { AssociableDeviceKind, PositioningDevice } from "@/models/positioning";
import { usePositioningStore } from "@/stores/positioning";
import { useDeviceAssociationModal } from "@/views/devices/device-association-modal/device-association-modal";
import { useDeviceDetailModal } from "@/views/devices/device-detail-modal/device-detail-modal";
import { useDeviceEnabledModal } from "@/views/devices/device-enabled-modal/device-enabled-modal";
import { StationPage } from "@/views/devices/station-page/station-page";
import { TerminalPage } from "@/views/devices/terminal-page/terminal-page";

import "./device-list.less";

const isVisibleKind = (value: unknown): value is AssociableDeviceKind => value === "terminal" || value === "station";

export const DeviceList = defineComponent({
  name: "DeviceList",
  setup() {
    const store = usePositioningStore();
    const route = useRoute();
    const router = useRouter();
    const activeKind = shallowRef<AssociableDeviceKind>(isVisibleKind(route.query.tab) ? route.query.tab : "terminal");
    const refreshVersion = shallowRef(0);

    function refreshPages(): void {
      refreshVersion.value += 1;
    }

    const detail = useDeviceDetailModal();
    const enabled = useDeviceEnabledModal(refreshPages);
    const association = useDeviceAssociationModal(refreshPages);

    function changeTab(key: string | number): void {
      if (!isVisibleKind(key)) return;
      activeKind.value = key;
      void router.replace({ query: { tab: key } });
      void store.refreshDevices(key);
    }

    function openDetail(device: PositioningDevice): void {
      detail.openDetail(device);
    }

    watch(
      () => route.query.tab,
      (tab) => {
        activeKind.value = isVisibleKind(tab) ? tab : "terminal";
        if (tab && !isVisibleKind(tab)) {
          void router.replace({ query: { tab: "terminal" } });
        }
      },
      { immediate: true },
    );
    onMounted(() => void store.refreshDevices(activeKind.value));

    const { DeviceDetailModal } = detail;
    const { DeviceEnabledModal } = enabled;
    const { DeviceAssociationModal } = association;

    return () => (
      <>
        <CubeLayout
          title="定位设备管理"
          showFooter={false}
          showTableXScroll
          v-slots={{
            "layout-header": () => (
              <Button type="primary" onClick={() => void association.open(activeKind.value)}>
                {activeKind.value === "terminal" ? "同步终端" : "同步基站"}
              </Button>
            ),
            "layout-content": () => (
              <div class="pp-device-list">
                <Tabs activeKey={activeKind.value} destroyInactiveTabPane={false} onTabChange={changeTab}>
                  <TabPane key="terminal" tab={DEVICE_KINDS.terminal}>
                    <TerminalPage
                      refreshVersion={refreshVersion.value}
                      onOpenDetail={openDetail}
                      onToggleEnabled={enabled.confirmEnabled}
                    />
                  </TabPane>
                  <TabPane key="station" tab={DEVICE_KINDS.station}>
                    <StationPage refreshVersion={refreshVersion.value} onOpenDetail={openDetail} onToggleEnabled={enabled.confirmEnabled} />
                  </TabPane>
                </Tabs>
              </div>
            ),
          }}
        />
        <DeviceDetailModal />
        <DeviceEnabledModal />
        <DeviceAssociationModal />
      </>
    );
  },
});
