import { computed, defineComponent, nextTick, onMounted, onUnmounted, ref, Teleport, watch, type Component } from "vue";

import { Scada2DView } from "./scada-2d/scada-2d-view";
import { dismissUe5BootLoader } from "@/application/bootstrap/boot-loader";
import { BasePanelRender } from "@/features/cards/base-panel-render/base-panel-render";
import { DevicePanel } from "@/features/panel-registry/legacy-panel-registry";
import { AreaNav } from "@/features/widgets/area-nav/area-nav";
import { BusinessNav } from "@/features/widgets/business-nav/business-nav";
import { Layout } from "@/features/widgets/components/layout/layout";
import { HeatmapOverlay } from "@/features/widgets/heatmap-overlay/heatmap-overlay";
import { RoamingPoint } from "@/features/widgets/roaming-point/roaming-point";
import { TitleBar } from "@/features/widgets/title-bar/title-bar";
import bus from "@/infrastructure/utils/bus";
import { useIotSocket } from "@/infrastructure/utils/iotSocket";
import { eventInstance } from "@/visualization-core/event/event";
import { modelSDK } from "@/visualization-core/model-sdk/sdk";
import { storeHead } from "@/visualization-core/stores/use-state-head";
import { useStateStore } from "@/visualization-core/stores/use-state-store";

import "@/styles/index.less";

import styles from "./index.module.less";

const removeStaleLoadingOverlay = (): void => {
  dismissUe5BootLoader();
  document.querySelector("#cube-visual-loading-overlay")?.remove();
  document.querySelectorAll("body > div").forEach((node) => {
    if (node instanceof HTMLElement && node.querySelector("#loading-progress-text-container")) {
      node.remove();
    }
  });
};

export const ViewPage = defineComponent({
  setup: () => {
    useIotSocket();
    const stateStore = useStateStore();
    const headStore = storeHead();
    const modelContainer = ref<HTMLElement | HTMLCanvasElement>();
    const modelInitialized = ref(false);
    const modelReady = ref(false);

    const showDevicePanel = ref(false);
    const devicePanel = ref<Component | undefined>();
    const currentDevice = ref<unknown>();

    const DevicePanelComponent = computed(() => devicePanel.value);

    const openMonitorPanel = (item: unknown): void => {
      currentDevice.value = item;
      // 先关再开，避免已显示时再次点击无感知 / 被放大层挡住后状态卡住
      if (showDevicePanel.value && devicePanel.value === DevicePanel.MonitorPanel) {
        showDevicePanel.value = false;
        devicePanel.value = undefined;
        requestAnimationFrame(() => {
          showDevicePanel.value = true;
          devicePanel.value = DevicePanel.MonitorPanel;
        });
        return;
      }
      showDevicePanel.value = true;
      devicePanel.value = DevicePanel.MonitorPanel;
    };

    const onSwitchCamera = (item: unknown): void => {
      // 2D 场景由 Scada2DView 自行处理，避免重复弹窗
      if (stateStore.renderType === "2D") {
        return;
      }
      openMonitorPanel(item);
    };

    const closeDevicePanel = (): void => {
      showDevicePanel.value = false;
      devicePanel.value = undefined;
    };

    const closeRoam = (): void => {
      headStore.roamShow = true;
      headStore.roamingPointData = null;
      stateStore.globalState.panel.rightPanelName = "";
      eventInstance.emitEvent("resetRoamingRoute");
      eventInstance.emitEvent("setFirstPerspective", 0);
    };

    const layoutSlots = {
      "layout-header": (): JSX.Element => <TitleBar />,
      // Do not key BasePanelRender by panelName: rapid menu switches remount mid-patch and throw
      // "Cannot read properties of null (reading 'type')", leaving panels blank until refresh.
      "layout-left-penal": (): JSX.Element => (
        <BasePanelRender
          panelName={stateStore.globalState.panel.leftPanelName}
          universalPanelVo={stateStore.globalState.panel.universalPanelVo.left}
          showPanel={stateStore.globalState.panel.visible}
          equipmentId=""
          position="left"
        />
      ),
      "layout-right-penal": (): JSX.Element => (
        <BasePanelRender
          panelName={stateStore.globalState.panel.rightPanelName}
          universalPanelVo={stateStore.globalState.panel.universalPanelVo.right}
          showPanel={stateStore.globalState.panel.visible}
          equipmentId=""
          position="right"
        />
      ),
      "layout-area-tag": (): JSX.Element => <AreaNav modelReady={modelReady.value} />,
      "layout-menu": (): JSX.Element => <BusinessNav />,
    };

    const initModal = async (): Promise<void> => {
      if (stateStore.renderType === "2D" || modelInitialized.value || !modelContainer.value) {
        return;
      }
      modelInitialized.value = true;
      modelReady.value = false;
      try {
        await modelSDK.initModal(modelContainer.value);
        await modelSDK.waitModalLoad();
        modelReady.value = true;
        eventInstance.emitEvent("createBuildIcon");
      } catch (error) {
        modelInitialized.value = false;
        modelReady.value = false;
        console.error("[ViewPage] initModal failed", error);
        removeStaleLoadingOverlay();
      }
    };

    watch(
      () => [stateStore.renderType, modelContainer.value] as const,
      () => {
        void initModal();
      },
      { flush: "post" },
    );

    onMounted(() => {
      void nextTick(() => {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            removeStaleLoadingOverlay();
          });
        });
      });
      void initModal();
      bus.on("switchCamera", onSwitchCamera);
      bus.on("closeDevicePanel", closeDevicePanel);
    });

    onUnmounted(() => {
      bus.off("switchCamera", onSwitchCamera);
      bus.off("closeDevicePanel", closeDevicePanel);
    });

    const renderModelLayer = (): JSX.Element | null => {
      const type = stateStore.renderType;
      if (type === "WEBGL") {
        return <canvas id="player" class={styles.player} style="width:100%;height:100%" ref={modelContainer} />;
      }
      if (type === "UE5") {
        return <div id="player" class={styles.player} ref={modelContainer} />;
      }
      if (type === "GIS") {
        return (
          <>
            <svg style="display: none;">
              <filter
                id="purple-sepia"
                x="-10%"
                y="-10%"
                width="120%"
                height="120%"
                filterUnits="objectBoundingBox"
                primitiveUnits="userSpaceOnUse"
                color-interpolation-filters="sRGB"
              >
                <feColorMatrix type="matrix" values="1 0 0 0 0 1 0 0 0 0 1 0 0 0 0 0 0 0 1 0" in="SourceGraphic" result="colormatrix" />
                <feComponentTransfer in="colormatrix" result="componentTransfer">
                  <feFuncR type="table" tableValues="0.39 0.22 0.03" />
                  <feFuncG type="table" tableValues="0.48 0.27 0.06" />
                  <feFuncB type="table" tableValues="0.63 0.38 0.13" />
                  <feFuncA type="table" tableValues="0 1" />
                </feComponentTransfer>
                <feBlend mode="normal" in="componentTransfer" in2="SourceGraphic" result="blend" />
              </filter>
            </svg>
            <div id="cubeMapContainer" style="width:100%;height:100%;z-index:0" ref={modelContainer} />
          </>
        );
      }
      return null;
    };

    return (): JSX.Element => {
      if (stateStore.renderType === "2D") {
        return <Scada2DView />;
      }

      const Panel = DevicePanelComponent.value;

      return (
        <Layout v-slots={layoutSlots}>
          {renderModelLayer()}
          <HeatmapOverlay modelReady={modelReady.value} />
          {!headStore.roamShow && headStore.roamingPointData && (
            <div class={styles["roaming-tag"]}>
              <RoamingPoint point={headStore.roamingPointData} onCloseRoam={closeRoam} />
            </div>
          )}
          <Teleport to="body">
            <div class={["device-panel", showDevicePanel.value ? "show" : "hide"]}>
              {Panel ? <Panel deviceInfo={currentDevice.value} onClose={closeDevicePanel} /> : null}
            </div>
          </Teleport>
        </Layout>
      );
    };
  },
});

export default ViewPage;
