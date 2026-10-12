import moment from "moment";
import { computed, defineComponent, nextTick, onMounted, reactive, ref } from "vue";

import { CubeMfRootGlobalState } from "@ghcloud/cube-mf-root";

import { getBgImg } from "./bg-img";
import BuildTag from "./build-tag";
import BusinessNav from "./components/business-nav/business-nav";
import TopHeader from "./components/header/header";
import Floor from "./floor";
import { BasePanelRender } from "@/features/cards/base-panel-render/base-panel-render";
import { BusinessPanel, DevicePanel, AlarmPanel } from "@/features/panel-registry/legacy-panel-registry";
import { getEventVideo } from "@/infrastructure/api/linkage";
import { getAreaList, getAreaScenePanelConfig } from "@/infrastructure/api/mdata";
import type { AreaType, SceneDataType } from "@/infrastructure/api/models/mdata";
import bus from "@/infrastructure/utils/bus";
import { getAssetsImage } from "@/infrastructure/utils/getImage";
import { useIotSocket } from "@/infrastructure/utils/iotSocket";
import { storeArea } from "@/visualization-core/stores/area";
import { useStateStore } from "@/visualization-core/stores/use-state-store";
interface CurBuild {
  backgroundFlie: string;
  id: string;
  actorId: string;
  name: string;
  aliasName: string;
  sequence: string;
  props: {
    iconType: "area";
    name: string;
    areaId: string;
    actorId: string;
    modalNames: string;
    buildTagLocation: unknown;
  };
}
import AlarmModal from "./alarm-modal";
import { getAlarmDetail } from "@/infrastructure/api/alarm";

import "@/styles/index.less";

import styles from "./scada-2d.module.less";

export const Scada2DView = defineComponent({
  name: "Scada2DView",
  setup() {
    useIotSocket();
    const { globalState } = useStateStore();

    const currentMenuName = ref("");
    const currentBuilName = reactive({ name: "", aliasName: "" });
    const universalPanelVo = reactive<{ left: Record<string, unknown>; right: Record<string, unknown> }>({
      left: {},
      right: {},
    });
    const bgImage = ref<string>();
    const bgPath = ref("");
    const piniaStoreArea = storeArea();
    const showPanel = ref(true);
    const showDevicePanel = ref(false);
    const leftPanel = ref<unknown>();
    const rightPanel = ref<unknown>();
    const leftPanelName = ref<string>();
    const rightPanelName = ref<string>();
    const time = ref("day");
    const devicePanel = ref<unknown>();
    const currentDevice = ref<unknown>();
    const currentDeviceId = ref("");
    const curBuild = ref<CurBuild>();
    const businessNavRef = ref<InstanceType<typeof BusinessNav>>();
    const topHeader = ref<InstanceType<typeof TopHeader>>();
    const areaList = ref<AreaType[]>([]);
    const floorList = ref<AreaType[]>([]);
    const alarmModalData = reactive<{ visible: boolean; realAlarmArr: unknown[] }>({
      visible: false,
      realAlarmArr: [],
    });
    const curAlarmDetail = ref<unknown>(null);
    const showBusinessNav = ref(true);
    const showAlarmListPanel = ref(false);

    const controlBuildingShow = computed(() => window.config?.buildingLabelFlag);
    const controlFloorShow = computed(() => window.config?.floorLabelFlag);

    const setBgImage = (): void => {
      if (!window.config?.bgImgData) {
        return;
      }
      if (globalState.business.currentAreaLeave === 1) {
        bgImage.value = time.value === "day" ? window.config.bgImgData.parkDay : window.config.bgImgData.parkNight;
      } else {
        bgImage.value = time.value === "day" ? window.config.bgImgData.buildingDay : window.config.bgImgData.buildingNight;
      }
    };

    const setTime = (value: string): void => {
      time.value = value;
      setBgImage();
    };

    const openDevicePanel = (deviceId: string): void => {
      showDevicePanel.value = false;
      devicePanel.value = undefined;
      nextTick(() => {
        if (deviceId) {
          currentDeviceId.value = deviceId;
          showDevicePanel.value = true;
          devicePanel.value = DevicePanel.EquipmentDetailPanel;
        }
      });
    };

    const showAlarmDetailPanel = (item: unknown): void => {
      curAlarmDetail.value = item;
      showDevicePanel.value = true;
      devicePanel.value = AlarmPanel.AlarmDetailPanel;
    };

    const closeModal = (): void => {
      devicePanel.value = undefined;
      showDevicePanel.value = false;
    };

    const businessPanel = async (): Promise<void> => {
      const res = await getAreaScenePanelConfig({
        areaLeave: globalState.business.currentAreaLeave,
        sceneType: globalState.business.currentMenu,
      });
      leftPanelName.value = "";
      rightPanelName.value = "";
      setTimeout(() => {
        showPanel.value = true;
        res.forEach((element) => {
          if (element.panelPosition === "LEFT_PANEL") {
            leftPanelName.value = element.panelConfig;
            leftPanel.value = BusinessPanel[element.panelConfig];
            universalPanelVo.left = element.universalPanelVo ?? {};
          }
          if (element.panelPosition === "RIGHT_PANEL") {
            rightPanelName.value = element.panelConfig;
            rightPanel.value = BusinessPanel[element.panelConfig];
            universalPanelVo.right = element.universalPanelVo ?? {};
          }
        });
      }, 200);
    };

    const switchBusinessPanel = (): void => {
      leftPanel.value = undefined;
      rightPanel.value = undefined;
      showPanel.value = false;
      void businessPanel();
    };

    const requestAreaList = async (): Promise<void> => {
      const res = await getAreaList();
      if (res.length > 0) {
        globalState.business.currentAreaId = null;
        areaList.value = res;
      }
    };

    const floorBack = (): void => {
      if (globalState.business.currentAreaLeave === 3) {
        globalState.business.currentAreaLeave = 2;
        setBgImage();
      }
      if (globalState.business.currentAreaLeave === 2) {
        globalState.business.currentAreaId = null;
        globalState.business.currentAreaLeave = 1;
        setBgImage();
      }
      switchBusinessPanel();
    };

    const changeFloor = (data: AreaType): void => {
      try {
        closeModal();
        globalState.business.currentAreaLeave = 3;
        globalState.business.currentAreaId = data.id;
        switchBusinessPanel();
        bgImage.value = getAssetsImage("overView60.png");
        bgPath.value = "";
        if (window.config?.configuration2D?.[currentBuilName.aliasName]) {
          bgPath.value = window.config.configuration2D[currentBuilName.aliasName][currentMenuName.value][data.name];
        } else if (window.config?.configuration2D?.[currentBuilName.name]) {
          bgPath.value = window.config.configuration2D[currentBuilName.name][currentMenuName.value][data.name];
        } else if (window.config?.configuration2D?.[currentMenuName.value]) {
          bgPath.value = window.config.configuration2D[currentMenuName.value][data.name];
        }
      } catch {
        // ignore invalid configuration path
      }
    };

    const handelClickBuild = (e: CurBuild): void => {
      currentBuilName.aliasName = e.aliasName;
      currentBuilName.name = e.name;
      globalState.business.currentAreaLeave = 2;
      globalState.business.currentAreaId = e.id;
      closeModal();
      switchBusinessPanel();
      globalState.business.currentAreaLeave = 2;
      setBgImage();
      piniaStoreArea.currentFloor = null;
      const currentBuild = areaList.value.find((item) => item.id === e.id);
      floorList.value = currentBuild?.children ?? [];
    };

    const viewAlarmList = (): void => {
      leftPanel.value = undefined;
      rightPanel.value = undefined;
      rightPanelName.value = undefined;
      leftPanelName.value = undefined;
      showPanel.value = false;
      if (showAlarmListPanel.value) {
        switchBusinessPanel();
        showPanel.value = true;
        showAlarmListPanel.value = false;
        return;
      }
      setTimeout(() => {
        showPanel.value = true;
        rightPanel.value = AlarmPanel.AlarmListPanel;
        rightPanelName.value = "AlarmListPanel";
        businessNavRef.value?.clearActived();
        showAlarmListPanel.value = true;
      }, 200);
    };

    const switchNav = (item: SceneDataType, lv: number): void => {
      showDevicePanel.value = false;
      if (!item) {
        return;
      }
      globalState.business.currentMenu = item.id;
      currentMenuName.value = item.name;
      globalState.business.currentAreaId = null;
      if (lv === 1) {
        setTimeout(() => {
          globalState.business.currentAreaLeave = 1;
          setBgImage();
          switchBusinessPanel();
        }, 0);
      } else {
        switchBusinessPanel();
      }
    };

    const closeAlarmModal = (): void => {
      alarmModalData.visible = false;
      alarmModalData.realAlarmArr = [];
    };

    window.addEventListener("message", (data: MessageEvent<{ deviced?: string }>) => {
      if (data.data.deviced) {
        openDevicePanel(data.data.deviced);
      }
    });

    bus.on("switchCamera", (item: unknown) => {
      currentDevice.value = item;
      showDevicePanel.value = true;
      devicePanel.value = DevicePanel.MonitorPanel;
    });
    bus.on("openDevicePopup", (record: { alarmTargetKey: string }) => {
      openDevicePanel(record.alarmTargetKey);
    });
    bus.on("closeDevicePanel", () => {
      showDevicePanel.value = false;
      devicePanel.value = undefined;
    });
    bus.on("equipmentPosition", (record: unknown) => {
      showAlarmDetailPanel(record);
    });
    bus.on("openAlarmModal", (item: unknown) => {
      showAlarmListPanel.value = false;
      rightPanel.value = undefined;
      showAlarmDetailPanel(item);
    });
    bus.on("getEventVideoList", async (data: Record<string, unknown>) => {
      const res = await getEventVideo(data.businessKey as string);
      const result = await getAlarmDetail(data.businessKey as string);
      data.alarmSnapshot = result.alarmSnapshot ?? "";
      data.alarmTime = moment(data.alarmTime as string).format("YYYY-MM-DD HH:mm:ss");
      alarmModalData.realAlarmArr.push({ ...data, videoArr: res });
      alarmModalData.visible = true;
      setTimeout(() => {
        topHeader.value?.getAlarmCount();
      }, 0);
    });

    onMounted(async () => {
      if (!window.config?.bgImgData) {
        const tenantId = CubeMfRootGlobalState.getInstance().mfRootState.authInfo.tenant;
        const name = window.config?.tenantConfig?.find((entry) => entry.tenant === tenantId)?.name;
        window.config.bgImgData = getBgImg(name);
      }
      await requestAreaList();
      businessNavRef.value?.getMenuList();
    });

    const DevicePanelComponent = computed(() => devicePanel.value as (typeof DevicePanel)[keyof typeof DevicePanel] | undefined);

    return (): JSX.Element => {
      const Panel = DevicePanelComponent.value;

      return (
        <div class={styles.view}>
          <div
            id="player"
            class={styles.player}
            style={{
              backgroundImage: bgImage.value ? `url(${bgImage.value})` : undefined,
              backgroundSize: bgImage.value ? "100%" : "-webkit-radial-gradient(circle, #7b9dbe, #112440)",
            }}
          />

          {globalState.business.currentAreaLeave === 3 && <iframe id="configuration" class={styles.configuration} src={bgPath.value} />}

          <div class={[styles["top-container"], styles.show]}>
            <TopHeader
              ref={topHeader}
              onViewAlarmList={viewAlarmList}
              onSetTime={setTime}
              onTiggleBusinessNav={(val: boolean) => {
                showBusinessNav.value = val;
              }}
            />
          </div>

          <div class={[styles["device-panel"], showDevicePanel.value ? styles.show : styles.hide]}>
            {Panel && (
              <Panel
                id={currentDeviceId.value}
                alarmDetailData={curAlarmDetail.value}
                deviceInfo={currentDevice.value}
                onClose={closeModal}
                onShowBusinessPanel={switchBusinessPanel}
                onOpenDevicePanel={openDevicePanel}
              />
            )}
          </div>

          <BasePanelRender
            panelName={leftPanelName.value}
            universalPanelVo={universalPanelVo.left}
            equipmentId={currentDeviceId.value}
            showPanel={showPanel.value}
            showBusinessNav={showBusinessNav.value}
            position="left"
          />
          <BasePanelRender
            panelName={rightPanelName.value}
            universalPanelVo={universalPanelVo.right}
            equipmentId={currentDeviceId.value}
            showPanel={showPanel.value}
            showBusinessNav={showBusinessNav.value}
            position="right"
          />

          {controlBuildingShow.value && areaList.value.length > 0 && globalState.business.currentAreaLeave === 1 && (
            <div
              class={[
                styles["build-tag"],
                leftPanelName.value && showPanel.value ? styles.show : styles.hide,
                showBusinessNav.value ? "" : styles["hide-all-panel"],
              ]}
            >
              <BuildTag areaList={areaList.value} curBuild={curBuild.value} onChangeBuild={handelClickBuild} />
            </div>
          )}

          {controlFloorShow.value && floorList.value.length > 0 && globalState.business.currentAreaLeave !== 1 && (
            <div
              class={[
                styles.floor,
                leftPanelName.value && showPanel.value ? styles.show : styles.hide,
                showBusinessNav.value ? "" : styles["hide-all-panel"],
              ]}
            >
              <Floor floors={floorList.value} onFloorBack={floorBack} onChangeFloor={changeFloor} />
            </div>
          )}

          <div class={[styles.nav, { [styles.show]: showBusinessNav.value, [styles.hide]: !showBusinessNav.value }]}>
            <BusinessNav ref={businessNavRef} onSwitchNav={switchNav} />
          </div>

          <AlarmModal visible={alarmModalData.visible} alarmArr={alarmModalData.realAlarmArr} onCloseAlarmModal={closeAlarmModal} />
        </div>
      );
    };
  },
});

export default Scada2DView;
