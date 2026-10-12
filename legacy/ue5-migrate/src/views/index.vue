<template>
  <div class="view">
    <div id="player" ref="modelContainer" v-if="runtime !== 'ue-mode'"></div>
    <div class="top-container show">
      <TopHeader
        ref="topHeader"
        @displayLabel="displayLabel"
        @tourStatus="setTourStatus"
        @init-camera-view="changeCameraView"
        @view-alarm-list="viewAlarmList"
        @roamingEvent="startRoaming"
      ></TopHeader>
    </div>

    <div class="device-panel" :class="showDevicePanel ? 'show' : 'hide'">
      <component
        :activeData="deviceActiveData"
        @openDevicePanelEmit="openDevicePanel"
        :PanelName="{ rightPanelName: globalState.panel.rightPanelName, leftPanelName: globalState.panel.leftPanelName }"
        :is="devicePanel"
        :show="showDevicePanel"
        :code="curentDeviceCode"
        :id="currentDeviceId"
        :alarmDetailData="curAlarmDetail"
        :deviceInfo="curentDevice"
        @close="closeModal"
        @showBusinessPanel="switchBusinessPanel"
        @openDevicePanel="openDevicePanel"
      >
      </component>
    </div>
    <BasePanelRender
      :panelName="globalState.panel.leftPanelName"
      :universal-panel-vo="globalState.panel.universalPanelVo.left"
      :equipment-id="currentDeviceId"
      :show-panel="globalState.panel.visible"
      position="left"
    />
    <BasePanelRender
      :panelName="globalState.panel.rightPanelName"
      :universal-panel-vo="globalState.panel.universalPanelVo.right"
      :equipment-id="currentDeviceId"
      :show-panel="globalState.panel.visible"
      position="right"
    />
    <div
      v-show="piniaStoreMenu.scenarioTypes && piniaStoreMenu.scenarioTypes.length == 2 && roamShow"
      class="switchButton"
      :class="[globalState.panel.rightPanelName && globalState.panel.visible ? 'showButton' : 'hideButton']"
    >
      <input type="radio" id="male" value="BUILD" v-model="globalState.panel.switchScene" />
      <label for="male">建筑</label>
      <input type="radio" id="female" value="PIPE_NETWORK" v-model="globalState.panel.switchScene" />
      <label for="female">管网</label>
    </div>
    <div
      v-if="showHeatmapCheckbox && roamShow"
      class="heatmap-checkbox"
      :style="{ right: `${tagLeft}px` }"
      :class="[globalState.panel.rightPanelName && globalState.panel.visible ? 'showButton' : 'hideButton']"
    >
      <input type="checkbox" id="heatmap" v-model="isHeatmapEnabled" />
      <label for="heatmap">热力图</label>
    </div>

    <!--楼栋标签-->
    <div
      class="build-tag"
      v-if="
        globalState.panel.switchScene === 'BUILD' &&
        controlBuildingShow &&
        globalState.business.area.length &&
        !piniaStoreMarket.alarmDeviceRisk.length &&
        roamShow &&
        globalState.business.currentAreaLeave === 1
      "
      :class="[
        globalState.panel.leftPanelName && globalState.panel.visible ? 'show' : 'hide',
        globalState.menuVisible ? '' : 'hide-all-panel',
      ]"
      :style="{ left: `${globalState.panel.leftPanelName && globalState.panel.visible ? tagLeft + 'px' : ''}` }"
    >
      <BuildTag :area-list="globalState.business.area" @change-build="handelClickBuild" :cur-build="curBuild" />
    </div>
    <!--楼层标签-->
    <div
      class="floor"
      v-if="
        controlFloorShow &&
        !piniaStoreMarket.alarmDeviceRisk.length &&
        roamShow &&
        (globalState.business.currentAreaLeave === 3 || globalState.business.currentAreaLeave === 2) &&
        functionalAreaList.length === 0
      "
      :class="[
        globalState.panel.leftPanelName && globalState.panel.visible ? 'show' : 'hide',
        globalState.menuVisible ? '' : 'hide-all-panel',
      ]"
      :style="{ left: `${globalState.panel.leftPanelName && globalState.panel.visible ? tagLeft + 'px' : ''}` }"
    >
      <Floor ref="floorRef" :floors="floorList" @floor-back="floorBack" @changeFloor="changeFloor"></Floor>
    </div>
    <!--区域标签-->
    <div
      class="floor"
      v-if="
        controlFloorShow &&
        (globalState.business.currentAreaLeave === 3 || globalState.business.currentAreaLeave === 4) &&
        functionalAreaList.length > 0
      "
      :class="[
        globalState.panel.leftPanelName && globalState.panel.visible ? 'show' : 'hide',
        globalState.menuVisible ? '' : 'hide-all-panel',
      ]"
      :style="{ left: `${globalState.panel.leftPanelName && globalState.panel.visible ? tagLeft + 'px' : ''}` }"
    >
      <FunctionalArea
        :curBuild="functionalCurBuild"
        :floors="functionalAreaList"
        @floor-back="areaBack"
        @changeFloor="changeArea"
      ></FunctionalArea>
    </div>
    <div class="roaming-tag" v-if="!roamShow">
      <roamingPoint ref="roamingRef" @closeRoam="closeRoam" :point="roamingPointData"></roamingPoint>
    </div>
    <!--业务菜单-->
    <div
      class="nav"
      v-show="roamShow && globalState.business.currentAreaLeave > 0"
      :class="{ show: globalState.menuVisible, hide: !globalState.menuVisible }"
    >
      <BusinessNav ref="businessNavRef" @switchNav="switchNav" @perspective="navPerspective" @hideActors="navHideActors" />
    </div>
    <!--设备标签图例-->
    <div
      class="device-icon-legend"
      :class="{ show: globalState.menuVisible, hide: !globalState.menuVisible }"
      v-if="piniaStoreMarket.deviceIconPioList.length > 0"
    >
      <DeviceIconLegend />
    </div>
  </div>
  <div v-if="isOneLevel" class="msg-bg red"><span></span></div>
  <img v-if="applicationImgUrl" :src="applicationImgUrl" class="application-img" />
</template>
<script setup lang="ts">
import { message } from "ant-design-vue";
import { onMounted, onBeforeUnmount, ref, nextTick, watch, computed } from "vue";

import { UeClient } from "@ghcloud/cube-visual-sdk";

import { DevicePanel } from "../components";
import { DeviceIconLegend } from "../pages/widget/device-icon-legend/device-icon-legend";
import BuildTag from "./build-tag.vue";
import BusinessNav from "./components/business-nav/business-nav.vue";
import roamingPoint from "./components/roaming-point/roaming-point.vue";
import Floor from "./floor.vue";
import FunctionalArea from "./functional-area.vue";
import {
  addLabelText,
  batchAddDeviceIcon,
  CurBuild,
  EnumParkView,
  getDeviceInfoByName,
  hiddenPipeline,
  removeAllPoi,
  showEmergencyAccess,
  switchingBuildingPerspectives,
  switchingFloorPerspectives,
  ueMouseHoverEvent,
} from "./index";
import { getDeviceInfoByCode } from "@/api/equipment";
import { getAreaList, getAreaScenePanelConfig } from "@/api/mdata";
import { SceneDataType } from "@/api/models/mdata";
import { commandMap } from "@/components/basic/header/chat-assistant/ai-command";
import TopHeader from "@/components/basic/header/header.vue";
import { BasePanelRender } from "@/components/businessPanel/base-panel-render/base-panel-render";
import { usePeopleFlow } from "@/components/businessPanel/people-flow/hooks/use-people-flow";
import { useFloorTagPosition } from "@/hooks/use-floor-tag-position";
import { useHeatmapControl } from "@/hooks/use-heatmap-control";
import { eventInstance } from "@/pages/event/event";
import { EventCore } from "@/pages/event/event-core";
import { modelSDK } from "@/pages/model-sdk/sdk";
import { useStateStore } from "@/pages/state/use-state-store";
import { openAlarmDetailModal } from "@/pages/widget/modal/alarm-detail-modal/alarm-detail-modal";
import { storeArea } from "@/piniaStore/area";
import { storeMenu } from "@/piniaStore/menu";
import { storeMarket } from "@/piniaStore/other";
import { roamingDevices } from "@/piniaStore/roamingDevices";
import bus from "@/utils/bus";
import { getAreaCamera, debounce, getPerspective, getApplicationPerspective } from "@/utils/common";
import { DeviceStatusCode, getDeviceTypeIcon } from "@/utils/enumeratie";
import { useIotSocket } from "@/utils/iotSocket";

useIotSocket();
const { tagLeft } = useFloorTagPosition();
const { showHeatmapCheckbox, isHeatmapEnabled } = useHeatmapControl();
const { preloadAllAreaHeatmap } = usePeopleFlow();
const { globalState, runtime, getAreaById } = useStateStore();
const applicationImgUrl = ref("");
const isOneLevel = ref(false);
const piniaStoreArea = storeArea();
const piniaStoreMenu = storeMenu();
const piniaStoreMarket = storeMarket();
const deviceActiveData = ref("基本信息");
const piniaRoamingDevices = roamingDevices();
const roamShow = ref<boolean>(true);
const showDevicePanel = ref<boolean>(false);
const modelContainer = ref(null);
const ueClient = UeClient.getInstance();
const isPerimeter = ref(false);
const roamingPointData = ref();
const devicePanel = ref();
const roamingRef = ref();
const curentDevice = ref();
const currentDeviceId = ref<string>("");
const curentDeviceCode = ref<string>("");
const curBuild = ref<CurBuild>(); // 当前楼栋的信息（模型）
const functionalCurBuild = ref<CurBuild>(); // 当前区域的信息（模型）
const businessNavRef = ref();
const floorRef = ref();
const topHeader = ref();
const floorList = ref<any[]>([]);
const functionalAreaList = ref<any[]>([]);
const curAlarmDetail = ref<any>(null);
const shellCode = ref<any>(null);
// 控制楼栋显隐
const controlBuildingShow = computed(() => {
  return (window as any).config.buildingLabelFlag;
});

const currentMenuName = computed(() => {
  if (!globalState.business.currentMenu) {
    return "";
  }
  const findMenu = (id: string, sourceData = globalState.business.menu) => {
    for (const item of sourceData) {
      if (item.id === id) {
        return item;
      }
      if (item.children && item.children.length > 0) {
        const result = findMenu(id, item.children);
        if (result) {
          return result;
        }
      }
    }
    return null;
  };
  return findMenu(globalState.business.currentMenu)?.name ?? "";
});

// 控制楼层显隐
const controlFloorShow = computed(() => {
  return (window as any).config.floorLabelFlag;
});
/** 点击楼栋标签或者模型上的楼栋标签 */
const handelClickBuild = async (e: CurBuild, noBack = true): Promise<void> => {
  // 获取视角 聚焦楼栋
  let camera = getAreaCamera(e.props.modalNames, e.props.name);
  if (camera) {
    ueClient.send("changeCameraView", { ...JSON.parse(camera), pawnToCamera: false, speed: 200 });
  } else {
    ueClient.send("focusActor", { id: e.props.actorId });
  }
  removeAllPoi();
  closeModal();
  functionalAreaList.value = [];

  // 是否隐藏其他楼层
  const perspective = getPerspective(e.props.modalNames, e.props.name);
  if (perspective?.shellCode) {
    shellCode.value = perspective.shellCode;
    ueClient.send("showShell", {
      id: shellCode.value,
      flash: false,
      seconds: 0,
    });
  }
  if (perspective && perspective.hideActors && perspective.hideActors.length) {
    hideBuilding(perspective.hideActors);
  }

  // 楼栋外壳闪烁
  // ueClient.send("showShell", { id: e.props.actorId, seconds: 2 });

  const list = globalState.business.area;
  let currentBuild = list.find((item) => item.id === e.props.areaId);
  // 获取楼栋下级区域（业务楼层）
  if (currentBuild) {
    piniaStoreArea.currentBuild = {
      name: e.props.name,
      areaId: e.props.areaId,
      actorId: e.actorId,
      modalNames: e.props.modalNames,
    };
    piniaStoreArea.currentFloor = null;
    curBuild.value = e;
    floorList.value = (currentBuild.children ?? []).map((v) => {
      return {
        ...v,
        selected: true as boolean,
        modalNames: currentBuild.name + "-" + v.name,
        parentAliasName: currentBuild.aliasName,
      };
    });
    addAreaBuildTextIcon(floorList.value);
  } else if (globalState.business.currentAreaLeave !== 4) {
    let currentFloor = floorList.value.find((item) => item.id === e.props.areaId);
    if (!currentFloor) {
      // 区域树命中了非顶层节点，仍保留相机切换结果
      curBuild.value = e;
      return;
    }
    piniaStoreArea.currentBuild = {
      name: currentFloor.name,
      areaId: currentFloor.id,
      actorId: null,
      modalNames: currentFloor.modalNames,
    };
    selectFloorFn(e);
  }
  // 将当前区域级别设置为2级
  if (globalState.business.currentAreaLeave === 1) {
    globalState.business.currentAreaLeave = 2;
  } else if (globalState.business.currentAreaLeave === 3 && noBack) {
    const data = {
      selectedFloor: e.props,
    };
    functionalCurBuild.value = e;
    changeArea(data);
  } else {
    globalState.business.currentAreaLeave = 2;
  }
  globalState.business.currentAreaId = e.props.areaId;
  piniaStoreArea.currentContainerId = e.props.actorId;
  // 按层级切换业务面板
  switchBusinessPanel();
};
const selectFloorFn = (e) => {
  if (e.props.visualizationAreaType === "BUILDING" || e.props.visualizationAreaType === "OTHER") {
    let currentBuild = floorList.value.find((item) => item.id === e.props.areaId);
    globalState.business.currentAreaLeave = 3;
    globalState.business.currentAreaId = e.props.areaId;
    piniaStoreArea.currentContainerId = e.props.actorId;
    if (currentBuild.children.length) {
      functionalAreaList.value = currentBuild.children.map((floor) => {
        return {
          ...floor,
          modalNames: currentBuild.name + "-" + floor.name,
        };
      });
    } else {
      floorRef.value.changeFloor(currentBuild);
    }
  }
};
/**
 * 给楼栋或者区域打标签
 * @param areaListData 数据
 * @param iconType 0 楼栋标签 1 区域标签
 */
const addAreaBuildTextIcon = async (areaListData, iconType = 0) => {
  removeAllPoi();
  // 1、根据名称获取栋楼信息 2、给楼栋打标签
  if (areaListData.length) {
    const buildList = areaListData;
    let ueBuild = [];
    for (let i = 0; i < buildList.length; i++) {
      if (buildList[i].aliasName && (buildList[i].visualizationAreaType === "BUILDING" || buildList[i].visualizationAreaType === "OTHER")) {
        ueBuild.push(
          new Promise((resolve) => {
            ueClient.send("getActorByName", { name: buildList[i].aliasName }, (data) => {
              const perspective = getPerspective(buildList[i].modalNames ?? buildList[i].name);
              data.buildTagLocation = null;
              data.areaId = buildList[i].id;
              data.icon = iconType;
              data.aliasName = buildList[i].aliasName;
              data.name = buildList[i].name;
              data.modalNames = buildList[i].modalNames;
              data.visualizationAreaType = buildList[i].visualizationAreaType;
              if (perspective && perspective.buildTagLocation) {
                data.buildTagLocation = perspective.buildTagLocation;
              }
              resolve(data);
            });
          }),
        );
      }
    }
    Promise.all(ueBuild).then((res) => {
      addBuildTextIcon(res);
    });
  }
};
/** 重置 ue5 分辨率 */
const resetVideoSize = (): void => {
  if (runtime !== "ue-mode") {
    ueClient.send("changeResolution", {
      width: document.body.clientWidth,
      height: document.body.clientHeight,
    });
  }
};
const debounceResetVideoSize = debounce(resetVideoSize, 1500);

/** 添加楼栋文字标签 */
const addBuildTextIcon = (data) => {
  const textPoiData = data
    .map((item) => {
      if (item.actorId || item.id || item.buildTagLocation) {
        return {
          text: item.name,
          targetActorId: item.buildTagLocation ? "" : item.actorId || item.id || "",
          scale: 1.5,
          icon: item.icon ?? 0,
          location: item.buildTagLocation,
          props: {
            iconType: "area",
            name: item.name,
            areaId: item.areaId,
            actorId: item.actorId || item.id,
            modalNames: item.modalNames || item.aliasName,
            buildTagLocation: item.buildTagLocation,
            visualizationAreaType: item.visualizationAreaType,
          },
        };
      }
    })
    .filter((e) => e);
  textPoiData.length && ueClient.send("addIconTextPoiBatch", { pois: textPoiData });
};

/** 获取区域列表 */
const requestAreaList = async () => {
  const res = await getAreaList();
  if (res.length) {
    globalState.business.area = res;
    globalState.business.currentAreaId = null;
  }
};

const setTourStatus = (value) => {
  if (value) {
    globalState.panel.universalPanelVo.left = null;
    globalState.panel.leftPanelName = "GuidePanel";
    globalState.panel.rightPanelName = "";
    globalState.business.currentAreaLeave = -1;
  } else {
    globalState.business.currentAreaLeave = 1;
    if (globalState.business.currentMenu === businessNavRef.value.getBusinessNavs()[0].id) {
      topHeader.value.selectFirstCameraView();
      businessPanel();
    } else {
      businessNavRef.value.changeNeoNav();
      topHeader.value.selectFirstCameraView();
    }
  }
};
// 显示模型标签
const displayLabel = () => {
  if (globalState.business.currentAreaLeave === 1) {
    addAreaBuildTextIcon(globalState.business.area);
  } else if (globalState.business.currentAreaLeave === 2) {
    addAreaBuildTextIcon(floorList.value);
  } else if (globalState.business.currentAreaLeave === 3) {
    addAreaBuildTextIcon(functionalAreaList.value, 1);
  }
  addLabelText();
};

// 隐藏建筑
const hideBuilding = (hideActors) => {
  hideActors.forEach((item) => {
    const modelName = Array.isArray(item) ? item[0] : item;
    ueClient.send("getActorByName", { name: modelName }, (res) => {
      ueClient.send("hideActor", { id: res.actorId || res.id });
    });
  });
  hiddenPipeline();
};

/** 楼层组件点击返回 */
const floorBack = (): void => {
  if (!curBuild.value) {
    topHeader.value.selectFirstCameraView();
  }
  // ueClient.send('resetModel', {
  //   tour: true,
  //   flash: true,
  //   select: true,
  //   poi: false,
  //   effect: true
  // });
  ueClient.send("stopSequenceAll");

  //返回楼栋
  if (globalState.business.currentAreaLeave === 3) {
    // 楼栋回显
    handleBackBuild(curBuild.value);

    // 平湖特殊需求
    showEmergencyAccess(false);
    handelClickBuild(curBuild.value, false);
    return;
  }
  //返回园区
  if (globalState.business.currentAreaLeave === 2) {
    topHeader.value.selectFirstCameraView();
  }
};
// 楼层点击返回后需回显楼栋
const handleBackBuild = (data) => {
  if (data.props.visualizationAreaType === "BUILDING") {
    const area = getAreaById(data.props.areaId);
    modelSDK.showBuilding(area.aliasName);
  }
};

/** 点击楼层 */
const changeFloor = (data): void => {
  // 视角设置
  let camera = getAreaCamera(data.selectedFloor.modalNames || data.selectedFloor.aliasName, data.selectedFloor.name);
  if (camera) {
    ueClient.send("changeCameraView", { ...JSON.parse(camera), pawnToCamera: false });
  } else {
    ueClient.send("getActorByName", { name: data.selectedFloor.aliasName }, function (actor) {
      // 区域聚焦
      ueClient.send("focusActor", { id: actor.id });
      ueClient.send("showShell", { id: actor.id, seconds: 2 });
    });
  }

  ueClient.send("HideShell", { id: shellCode.value });
  removeAllPoi();
  functionalAreaList.value = data.selectedFloor.children.map((floor) => {
    return {
      ...floor,
      modalNames: data.selectedFloor.modalNames + "-" + floor.name,
    };
  });
  addAreaBuildTextIcon(functionalAreaList.value, 1);
  piniaStoreArea.currentBuild = {
    name: data.selectedFloor.name,
    areaId: data.selectedFloor.id,
    actorId: null,
    modalNames: data.selectedFloor.modalNames,
  };
  // 关闭设备面板
  closeModal();
  // 将当前区域级别设置为3级区域
  globalState.business.currentAreaLeave = 3;
  globalState.business.currentAreaId = data.selectedFloor.id;
  piniaStoreArea.currentContainerId = data.selectedFloor.actorId;
  piniaStoreArea.currentModalNames = data.selectedFloor.modalNames;
  switchBusinessPanel();
  ueClient.send("showBuildingFloor", {
    buildingName: data.selectedFloor.parentAliasName,
    floorName: data.selectedFloor.aliasName,
  });
  hiddenPipeline();

  // 删除楼层标签
  ueClient.send("removeActorPoi", { targetActorId: curBuild.value.actorId });
  piniaStoreArea.currentFloor = {
    name: data.selectedFloor.modalNames || data.selectedFloor.aliasName,
    areaId: data.selectedFloor.id,
    actorId: data.selectedFloor.actorId,
    modalNames: data.selectedFloor.aliasName,
    curFloorName: data.selectedFloor.modalNames,
  };
  showEmergencyAccess(false, 0);
};
/** 楼层组件点击返回 */
const areaBack = (): void => {
  if (globalState.business.currentAreaLeave === 4) {
    globalState.business.currentAreaId = piniaStoreArea.currentBuild.areaId;
    globalState.business.currentAreaLeave = 3;
    // 视角设置
    let camera = getAreaCamera(piniaStoreArea.currentFloor.name);
    if (camera) {
      ueClient.send("changeCameraView", { ...JSON.parse(camera), pawnToCamera: false });
    }
    addAreaBuildTextIcon(functionalAreaList.value, 1);
    switchBusinessPanel();
  } else if (globalState.business.currentAreaLeave === 3) {
    functionalAreaList.value = [];
    floorBack();
  }
};
/** 点击区域 */
const changeArea = (e): void => {
  removeAllPoi();
  // 视角设置
  let camera = getAreaCamera(e.selectedFloor.modalNames);
  if (camera) {
    ueClient.send("changeCameraView", { ...JSON.parse(camera), pawnToCamera: false });
  }
  closeModal();
  // 将当前区域级别设置为4级
  globalState.business.currentAreaLeave = 4;
  globalState.business.currentAreaId = e.selectedFloor.id;
  piniaStoreArea.currentModalNames = e.selectedFloor.modalNames;
  switchBusinessPanel();
};
// 根据区域及业务菜单获取面板
const businessPanel = async (lv?: number) => {
  if (!globalState.business.currentAreaLeave) {
    globalState.business.currentAreaLeave = 1;
  }
  if (!globalState.business.currentMenu) {
    return;
  }
  const res = await getAreaScenePanelConfig({
    areaLeave: globalState.business.currentAreaLeave,
    sceneType: globalState.business.currentMenu,
  });
  globalState.panel.leftPanelName = "";
  globalState.panel.rightPanelName = "";
  globalState.panel.universalPanelVo.left = null;
  globalState.panel.universalPanelVo.right = null;
  setTimeout(() => {
    globalState.panel.visible = true;
    res.forEach((element) => {
      if (element.panelPosition === "LEFT_PANEL") {
        globalState.panel.leftPanelName = element.panelConfig;
        globalState.panel.universalPanelVo.left = element.universalPanelVo;
      }
      if (element.panelPosition === "RIGHT_PANEL") {
        globalState.panel.rightPanelName = element.panelConfig;
        globalState.panel.universalPanelVo.right = element.universalPanelVo;
      }
    });

    // 如果一级菜单没有配置面板，则默认显示第一个二级菜单的面板
    if (!globalState.panel.leftPanelName && !globalState.panel.rightPanelName && lv === 1) {
      businessNavRef.value.defaultSubFirstPanel();
    }
  }, 200);
};
// 切换面板
const switchBusinessPanel = (lv?: number): void => {
  globalState.panel.visible = false;
  businessPanel(lv);
};
// 报警弹窗开关
const showAlarmListPanel = ref(false);
const viewAlarmList = () => {
  globalState.panel.rightPanelName = null;
  globalState.panel.leftPanelName = null;
  globalState.panel.visible = false;
  if (showAlarmListPanel.value) {
    switchBusinessPanel();
    globalState.panel.visible = true;
    showAlarmListPanel.value = false;
    return;
  }

  setTimeout(() => {
    globalState.panel.visible = true;
    globalState.panel.rightPanelName = "AlarmListPanel";
    businessNavRef.value.clearActived(); //清除活动的业务菜单
    showAlarmListPanel.value = true;
  }, 200);
};
const menuModelEvent = (item) => {
  try {
    if (item.name === "周界防范") {
      ueClient.send("showActor", { id: "BoundaryBox" });
    } else {
      ueClient.send("hideActor", { id: "BoundaryBox" });
    }
  } catch {}
};

// 切换业务菜单
const switchNav = async (item: SceneDataType, lv: number): Promise<void> => {
  console.trace("切换业务菜单");
  if (item) {
    globalState.business.currentMenu = item.id;
    piniaStoreMenu.sort = item.level === 1 ? item.sort : item.level + item.sort;
    piniaStoreMenu.scenarioTypes = item.scenarioTypes;
    menuModelEvent(item);
    changeCameraView();
    switchBusinessPanel(lv);
  }
  piniaStoreMarket.alarmDeviceRisk = [];
};
const navPerspective = (camera) => {
  const cameraObj = typeof camera === "string" && camera ? JSON.parse(camera) : camera;
  if (cameraObj) {
    modelSDK.changeCameraView({ ...cameraObj });
  } else {
    // 如果没有设置视角，则使用默认视角
    eventInstance.emitEvent("setFirstPerspective", 0);
  }
};
const currentHiddenActors = ref<string[]>([]);
const navHideActors = (config) => {
  const hideActors = (config ? JSON.parse(config) : [])?.map((item) => {
    return Array.isArray(item) ? item.at(-1) : item;
  });
  // 找出需要显示的楼栋（在currentHiddenActors中但不在hideActors中的）
  const actorsToShow = currentHiddenActors.value.filter((actor) => !hideActors.includes(actor));
  actorsToShow.forEach((item) => {
    ueClient.send("getActorByName", { name: item }, (res) => {
      if (res && (res.actorId || res.id)) {
        ueClient.send("showActor", { id: res.actorId || res.id });
      }
    });
  });

  // 隐藏当前配置的楼栋
  if (hideActors.length) {
    hideActors.forEach((item) => {
      ueClient.send("getActorByName", { name: item }, (res) => {
        if (res && (res.actorId || res.id)) {
          ueClient.send("hideActor", { id: res.actorId || res.id });
        }
      });
    });
  }
  currentHiddenActors.value = hideActors;
};
/** 打开设备面板（弹窗)*/
const openDevicePanel = (deviceId: string, deviceType?: string): void => {
  showDevicePanel.value = false;
  devicePanel.value = "";
  nextTick(() => {
    if (deviceId) {
      currentDeviceId.value = deviceId;
      showDevicePanel.value = true;
      devicePanel.value = DevicePanel[deviceType ? deviceType : "EquipmentAbbreviationsPanel"];
    }
  });
};
// 设置视角
const changeCameraView = (value?: string): void => {
  console.trace("设置视角");
  try {
    const cameraView = value ? JSON.parse(value) : JSON.parse(getApplicationPerspective(currentMenuName.value)?.camera || "null");
    if (!value) {
      applicationImgUrl.value = getApplicationPerspective(currentMenuName.value)?.path || null;
    }
    cameraView && ueClient.send("changeCameraView", { ...cameraView, pawnToCamera: false });
    addAreaBuildTextIcon(globalState.business.area);
    addLabelText();
    if (JSON.stringify(isPerimeter.value) == "{}" || !isPerimeter.value) {
      // 模型重置 周界防范模型不重置因为重置显示边界出来
      ueClient.send("resetModel", {
        tour: true,
        flash: true,
        select: true,
        poi: true,
        effect: true,
      });
    }
    ueClient.send("stopAutoRevolve");
    floorList.value = [];
    curBuild.value = null;
    piniaStoreArea.currentBuild = null;
    piniaStoreArea.currentFloor = null;
    piniaStoreMarket.alarmDeviceRisk = [];
    //将区域级别设置为1，重新请求面板
    globalState.business.currentAreaLeave = 1;
    globalState.business.currentAreaId = null;
  } catch (error) {}
  closeModal();
  // 平湖特殊需求
  showEmergencyAccess(false);
  // 管廊特殊需求
  // hidePipeGallery()
  switchBusinessPanel();
};
EventCore.registerEvent("changeModelGlobalCameraView", (data) => {
  changeCameraView(data.value);
});
EventCore.registerEvent("switchBusinessPanel", (data) => {
  const visible = data?.visible;
  if (visible) switchBusinessPanel();
});
EventCore.registerEvent("deviceDetailPanelBack", () => {
  floorAndAreaBack();
});
// 开始漫游
const startRoaming = (value) => {
  if (value) {
    globalState.panel.leftPanelName = null;
    globalState.panel.rightPanelName = "RoamingDevices";
    roamShow.value = false;
    roamingPointData.value = value;
  } else {
    roamingRef.value.closeRoam();
  }
};
// 结束漫游
const closeRoam = () => {
  roamShow.value = true;
  roamingPointData.value = null;
  topHeader.value.resetRoaming();
  topHeader.value.selectFirstCameraView();
};
/**
 * 关闭设备面板
 * @param backViewpoint 是否返回上一级视角
 */
const closeModal = (backViewpoint = false, item?: any): void => {
  devicePanel.value = "";
  deviceActiveData.value = "基本信息";
  showDevicePanel.value = false;
  if (item) {
    ueClient.send("getActorById", { id: item.baseArchivesInfo.code }, async function (res) {
      if (res.id) {
        const deviceListPio = {
          targetActorId: item.baseArchivesInfo.code,
          icon: getDeviceTypeIcon(item.productInfo?.name, item.productCategory?.name),
          color: DeviceStatusCode[item.baseArchivesInfo.status.onlineState ? "NORMAL" : "OFFLINE"],
          scale: window.config.otherConfig.iconScale ? window.config.otherConfig.iconScale : 1,
          props: {
            iconType: "device",
            actorId: item.baseArchivesInfo.code,
            id: item.baseArchivesInfo.id,
            code: item.baseArchivesInfo.code,
            genreId: item.genreId,
          },
        };
        ueClient.send("addIconPoi", deviceListPio);
      }
    });
  }
  // 视角设置 上一级视角可能是楼层 、 楼栋 、园区
  if (backViewpoint) {
    ueClient.backViewPoint();
  }
};
/** 视频弹窗 */
bus.on("switchCamera", (item): void => {
  curentDevice.value = item;
  showDevicePanel.value = true;
  devicePanel.value = DevicePanel["MonitorPanel"];
});
/** 设置特殊需求面板 */
bus.on("setPanel", (item: { id: string; rightPanelName: string; leftPanelName: string }): void => {
  globalState.panel.rightPanelName = item.rightPanelName;
  globalState.panel.leftPanelName = item.leftPanelName;
  if (item.id) {
    piniaStoreMarket.patrolRouterId = item.id;
  }
});
/** 退出视频巡逻面板 */
bus.on("exitPatrol", (): void => {
  businessPanel();
});
/** 打开设备弹窗并且定位 */
bus.on("openDevicePopup", (record: any): void => {
  openDevicePanel(record.alarmTargetKey, record.modalType ? record.modalType : "EquipmentDetailPanel");
  if (!record.viewLocation) {
    eventInstance.emitEvent("locateToDevice", record);
  }
});
/** 关闭面板（弹窗） */
bus.on("closeDevicePanel", (): void => {
  showDevicePanel.value = false;
  devicePanel.value = "";
});
/** 设备定位 */
bus.on("equipmentPosition", (record: any): void => {
  eventInstance.emitEvent("locateToDevice", record);
  openAlarmDetailModal({
    title: record.alarmEventName,
    alarmData: record,
  });
});
//展示管线,隐藏楼栋
const showPipeline = () => {
  setTimeout(() => {
    removeAllPoi();
  }, 1000);
  try {
    let buildList = ["门诊大楼", "住院大楼", "行政大楼", "成都六院-净水管道系统", "成都六院-净化空调", "成都六院-空调水系统主管道"];
    buildList.forEach((item) => {
      ueClient.send("getActorByName", { name: item }, function (data) {
        if (data.id) {
          ueClient.send("changePerspectivity", { id: data.id, translucent: true });
        }
      });
    });
    //反透视管线
    if (["空气源", "冷热源", "锅炉系统"].includes(currentMenuName.value)) {
      ueClient.send("getActorsByProps", { props: { 子系统: "空气源" } }, function (result) {
        result.actors.forEach((item) => {
          item.id && ueClient.send("changePerspectivity", { id: item.id, translucent: false });
        });
      });
    }
    //反透视净化系统
    if (currentMenuName.value === "净化系统") {
      ueClient.send("getActorsByProps", { props: { 子系统: "净化系统" } }, function (result) {
        result.actors.forEach((item) => {
          item.id && ueClient.send("changePerspectivity", { id: item.id, translucent: false });
        });
      });
    }
    //反透视净水系统
    if (currentMenuName.value === "净水系统") {
      ueClient.send("getActorsByProps", { props: { 子系统: "净水系统" } }, function (result) {
        result.actors.forEach((item) => {
          item.id && ueClient.send("changePerspectivity", { id: item.id, translucent: false });
        });
      });
    }
    // 管网视角设置
    let camera = getAreaCamera(EnumParkView[currentMenuName.value]);
    if (camera) {
      ueClient.send("changeCameraView", camera);
    }
  } catch {}
};
//隐藏管线,展示楼栋
const showTextIcon = () => {
  try {
    let buildList = ["门诊大楼", "住院大楼", "行政大楼"];
    let pipeList = ["成都六院-净水管道系统", "成都六院-净化空调", "成都六院-空调水系统主管道"];
    //显示标签,显示楼栋
    buildList.forEach((item) => {
      ueClient.send("getActorByName", { name: item }, function (data) {
        if (data.actorId) {
          ueClient.send("changePerspectivity", { id: data.actorId, translucent: false });
        }
      });
    });
    //隐藏管线
    pipeList.forEach((item) => {
      ueClient.send("getActorByName", { name: item }, function (data) {
        if (data.actorId) {
          ueClient.send("changePerspectivity", { id: data.actorId, translucent: true });
          ueClient.send("removeActorPoi", { targetActorId: data.actorId });
        }
      });
    });
  } catch {}
};

/**
 * 监听区域变化获取设备列表在模型中添加图标
 */
watch(
  () => globalState.business.currentAreaId,
  () => {
    setTimeout(() => {
      if (globalState.business.currentMenu) {
        batchAddDeviceIcon();
      }
    }, 1000);
  },
);
watch(
  () => globalState.business.currentMenu,
  () => {
    setTimeout(() => {
      if (globalState.business.currentAreaLeave && globalState.business.currentMenu) {
        batchAddDeviceIcon();
      }
    }, 1000);
    if (piniaStoreMenu.scenarioTypes.length === 1 && piniaStoreMenu.scenarioTypes[0] === "PIPE_NETWORK") {
      globalState.panel.switchScene = "PIPE_NETWORK";
    } else {
      globalState.panel.switchScene = "BUILD";
    }
    //透视管网
    nextTick(() => {
      if (globalState.panel.switchScene === "PIPE_NETWORK") showPipeline();
      if (globalState.panel.switchScene === "BUILD") showTextIcon();
    });
  },
);
watch(
  () => globalState.panel.switchScene,
  (val) => {
    if (val === "BUILD") {
      topHeader.value.selectFirstCameraView();
      showTextIcon();
    }
    if (val === "PIPE_NETWORK") {
      showPipeline();
    }
  },
);
// 定位设备位置并且打开弹窗
const getPerspectiveLocation = async (value, type?: string) => {
  if (type === "light") {
    value.value = "xzALG 05:G1";
    type = "实时数据";
  }
  const deviceId = await getDeviceInfoByName(value.value as string);
  const data = {
    ...deviceId,
    areaName: deviceId?.area?.pathName,
    onlineState: deviceId.status?.onlineState,
    alarmTargetCode: deviceId.code,
  };
  eventInstance.emitEvent("openDeviceFloor", data);
  if (type === "实时数据") {
    const data = {
      id: deviceId.code,
      on: true,
      strength: 1,
      color: 0,
    };
    if (value.state === "1") {
      data.on = true;
    } else {
      data.on = false;
    }
    ueClient.send("switchLight", [data]);
    message.success("下发指令成功");
  } else {
    openDevicePanel(deviceId.id, "EquipmentDetailPanel");
    deviceActiveData.value = type;
  }
};
// 切换楼栋视角方法（动态区域树模糊匹配；失败返回 false 供 AI 回执）
const changeBuildingPerspectives = async (value): Promise<boolean> => {
  try {
    const res = await switchingBuildingPerspectives(value, globalState.business.area);
    await handelClickBuild(res);
    return true;
  } catch (error) {
    console.warn("[changeBuildingPerspectives]", value, error);
    return false;
  }
};
// 切换楼层视角方法（兼容 buildingName / floor 口语）
const changeFloorPerspectives = async (params): Promise<boolean> => {
  try {
    const building =
      (typeof params?.building === "string" && params.building.trim()) ||
      (typeof params?.buildingName === "string" && params.buildingName.trim()) ||
      (typeof params?.building_name === "string" && params.building_name.trim()) ||
      (typeof params?.area === "string" && params.area.trim()) ||
      (typeof params?.value === "string" && params.value.trim()) ||
      "";
    const floor =
      (typeof params?.floor === "string" || typeof params?.floor === "number" ? String(params.floor).trim() : "") ||
      (typeof params?.floorName === "string" && params.floorName.trim()) ||
      (typeof params?.level === "string" || typeof params?.level === "number" ? String(params.level).trim() : "") ||
      "";
    if (!building || !floor) {
      console.warn("[changeFloorPerspectives] missing building/floor", params);
      return false;
    }
    const build = await switchingBuildingPerspectives(building, globalState.business.area);
    await handelClickBuild(build);
    //同时执行两个模型动作添加延迟，不然模型切换会失败
    await new Promise((r) => setTimeout(r, 500));
    const floorResult = await switchingFloorPerspectives(floor, floorList.value);
    changeFloor(floorResult);
    return true;
  } catch (error) {
    console.warn("[changeFloorPerspectives]", params, error);
    return false;
  }
};
// esc按键返回事件
const handleEsc = (event) => {
  if (event.key !== "Escape") return;

  if (document.querySelector(".device-panel.show")) {
    showDevicePanel.value = false;
    return;
  }
  floorAndAreaBack();
};
const floorAndAreaBack = (): void => {
  const currentAreaLeave = globalState.business.currentAreaLeave;
  const isEmptyArea = functionalAreaList.value?.length === 0;
  if (currentAreaLeave === 1) {
    location.reload();
  } else if ((currentAreaLeave === 2 || currentAreaLeave === 3) && isEmptyArea) {
    floorBack();
  } else if (currentAreaLeave === 3 || currentAreaLeave === 4) {
    areaBack();
  }
};

onMounted(async () => {
  window.addEventListener("keydown", handleEsc);
  commandMap.set("toggleOpenDeviceDetails", (value) => getPerspectiveLocation(value, "基本信息")); // 查看设备详情
  commandMap.set("toggleOpenDeviceMonitor", (value) => getPerspectiveLocation(value, "监控画面")); // 查看设备监控
  commandMap.set("modifyDeviceStatus", (value) => getPerspectiveLocation(value, "实时数据")); // 查看设备物联状态
  // 兼容 value / buildingName / building / area（模型常写 buildingName）
  commandMap.set("changePerspectiveBuilding", (params) => {
    const hint =
      (typeof params?.value === "string" && params.value.trim()) ||
      (typeof params?.buildingName === "string" && params.buildingName.trim()) ||
      (typeof params?.building_name === "string" && params.building_name.trim()) ||
      (typeof params?.building === "string" && params.building.trim()) ||
      (typeof params?.area === "string" && params.area.trim()) ||
      (typeof params?.areaName === "string" && params.areaName.trim()) ||
      (typeof params?.name === "string" && params.name.trim()) ||
      "";
    if (!hint) {
      console.warn("[cube-ai-command] changePerspectiveBuilding missing name", params);
      return false;
    }
    return changeBuildingPerspectives(hint);
  });
  commandMap.set("changePerspectiveFloor", (value) => changeFloorPerspectives(value)); // 切换楼层视角
  commandMap.set("modifyDeviceStatusForLight", (value) => getPerspectiveLocation(value, "light")); // 语音话开灯关灯

  // 获取业务应用列表 （底部的菜单）
  businessNavRef.value.getMenuList();
  // 区域查询
  requestAreaList();
  nextTick(async () => {
    topHeader.value.loadUE5Model(modelContainer.value);
  });

  /** 模型连接成功 */
  ueClient.onConnected(async function () {
    // 关闭触控界面
    ueClient.send("changeTouchInterface", { active: false });
    // 关闭编辑模式
    ueClient.send("disableEditing");
    //重置分辨率
    resetVideoSize();
    window.addEventListener("resize", debounceResetVideoSize);
    // 隐藏边界
    ueClient.send("hideActor", { id: "BoundaryBox" });
    // 临时处理每次模型链接成功将时间设置为自动
    ueClient.send("setSimulateRealWorld", { simulate: true });
    //隐藏管线
    globalState.panel.switchScene === "BUILD" && showTextIcon();
    //展示建筑
    globalState.panel.switchScene === "PIPE_NETWORK" && showPipeline();
    // 查询是否有周界
    ueClient.send("getActorById", { id: "BoundaryBox" }, function (data) {
      isPerimeter.value = data;
    });
  });
  /** 模型断开 */
  ueClient.onDisconnected(() => {});

  // 模型图标点击事件
  ueClient.onActorPoiClick(async function (e) {
    if (!(window as any).config.ue5InteractiveFlag) {
      return;
    }
    await ueClient.saveNowViewPoint();
    if (e.props.iconType == "area") {
      handelClickBuild(e);
    } else if (e.props.iconType == "device" || e.props.iconType == "singleAlarm") {
      ueClient.send("showShell", { id: e.props.actorId });
      if (e.props.onlineState) {
        const deviceProps = {
          targetActorId: e.props.code,
          icon: getDeviceTypeIcon(
            e.props.deviceData?.product?.name,
            e.props.deviceData?.typeName,
            e.props.deviceData?.genreName,
            e.props.prodCategory,
          ),
          color: DeviceStatusCode[JSON.parse(e.props.onlineState) ? "NORMAL" : "OFFLINE"],
          scale: window.config.otherConfig.iconScale ? window.config.otherConfig.iconScale : 1,
          props: {
            iconType: "device",
            actorId: e.props.code,
            id: e.props.id,
            code: e.props.code,
            genreId: e.props.genreId,
            prodCategory: e.props.prodCategory,
            onlineState: e.props.onlineState,
            deviceData: e.props.deviceData,
          },
        };
        ueClient.send("addIconPoi", { ...deviceProps, flash: true });
        setTimeout(() => {
          ueClient.send("addIconPoi", { ...deviceProps });
        }, 5000);
      }
      globalState.panel.rightPanelName = "";
      globalState.panel.leftPanelName = "deviceDetailsPanel";
      globalState.panel.universalPanelVo.left = null;
      globalState.panel.universalPanelVo.right = null;
      piniaStoreMarket.panelCurrentDeviceId = e.props.id;
    } else if (e.props.iconType == "stall") {
      ueClient.send("focusActor", { id: e.props.actorId });
      ueClient.send("showShell", { id: e.props.actorId });
      openDevicePanel(e.props.id, "StallDetailPanel");
    } else if (e.props.iconType == "property") {
      ueClient.send("focusActor", { id: e.props.actorId });
      ueClient.send("showShell", { id: e.props.actorId });
      openDevicePanel(e.props.id, "PropertyDetailPanel");
    } else if (e.props.iconType == "risk_source") {
      ueClient.send("focusActor", { id: e.props.actorId });
      ueClient.send("showShell", { id: e.props.actorId });
      openDevicePanel(e.props.id, "RiskDetailPanel");
    } else if (e.props.iconType == "alarm") {
      showDevicePanel.value = true;
      devicePanel.value = DevicePanel["AlarmPanel"];
    } else if (e.props.iconType === "gear") {
      showDevicePanel.value = true;
      devicePanel.value = DevicePanel["GearDetailPanel"];
    } else if (e.props.iconType === "tallyMachine") {
      showDevicePanel.value = true;
      currentDeviceId.value = e.props.deviceId;
      devicePanel.value = DevicePanel["TallyingModal"];
    }
  });
  // 模型点击事件
  ueClient.onActorClick(async function (actor) {
    if (actor.userData && (actor.userData["Element_标记"] || actor.userData["Element*标记"])) {
      if (actor.userData.Element_Type === "档位") {
        showDevicePanel.value = true;
        curentDeviceCode.value = actor.code;
        devicePanel.value = DevicePanel["gearDetailsModel"];
        return;
      }
      const res = await getDeviceInfoByCode(actor.id);
      if (!res) {
        // antMessage.error('设备未找到或已删除')
        return;
      }
      if (actor.userData.Element_Type === "理货机" || actor.userData["Element*Type"] === "理货机") {
        openDevicePanel(res.baseArchivesInfo.id, "TallyingModal");
      } else {
        openDevicePanel(res.baseArchivesInfo.id);
      }
    }
  });
  // 模型漫游设备数据
  ueClient.onActorInSight(async function (e) {
    if (!roamShow.value) {
      const res = await getDeviceInfoByCode(e.id);
      if (res) {
        const device = {
          name: res.baseArchivesInfo.name,
          deviceStatus: res.baseArchivesInfo.status.onlineState ? "NORMAL" : "OFFLINE",
          id: res.baseArchivesInfo.id,
        };
        piniaRoamingDevices.roamingDevicesArr.push(device);
        ueClient.send("startFlash", { id: e.id, level: 4 });
      }
    }
  });
  // 视角移动完成回调
  ueClient.onCamera(async function (e) {
    if (!roamShow.value && piniaRoamingDevices.isRoaming) {
      if (piniaRoamingDevices.cameraViewSuccess === roamingPointData.value.length - 1) {
        piniaRoamingDevices.cameraViewSuccess = 0;
      } else {
        piniaRoamingDevices.cameraViewSuccess++;
      }
    }
  });
  // 鼠标悬浮事件
  ueClient.onActorHovered(async function (actor) {
    if (piniaStoreMarket.showLabel === "开") {
      return;
    }
    if (actor.id && actor.type === "element") {
      ueMouseHoverEvent(actor);
    } else if (actor.id && actor.type === "building") {
      const data = globalState.business.area.filter((item) => item.aliasName === actor.name);
      addAreaBuildTextIcon(data);
    } else {
      removeAllPoi();
    }
  });
  preloadAllAreaHeatmap();
});

onBeforeUnmount(() => {
  window.removeEventListener("keydown", handleEsc);
  location.reload();
});
</script>
<style lang="less">
@import url("../style/index.less");

.ant-modal-content {
  background: rgba(4, 17, 32, 0.8) !important;
}

:root {
  box-sizing: border-box;
}

.view,
#player {
  width: 100%;
  height: 100%;
}

.view {
  position: absolute;
  top: 0;
  left: 0;
}

.application-img {
  width: 100%;
  height: 100%;
  z-index: 10;
  top: 0;
  position: absolute;
}

#player {
  position: relative;
  top: 0px;
  left: 0px;
  cursor: none;
}

#modelContainer {
  overflow: hidden;
}
</style>
<style lang="less" scoped>
.view {
  position: relative;
  overflow: hidden;

  .btn {
    position: absolute;
    left: 500px;
    top: 100px;
    z-index: 100;
    display: none;
  }
}

.top-container {
  width: 100%;
  height: 64px;
  position: absolute;
  left: 0;
  z-index: 100;
  transition: all 1s ease;

  &.show {
    top: 0;
    opacity: 1;
  }

  &.hide {
    top: -64px;
    opacity: 0;
  }
}

.panel-box {
  filter: blur(5px);
}

.switchButton {
  position: absolute;
  top: 100px;
  z-index: 100;
  opacity: 1;
  transition: all 1s ease;
  box-sizing: border-box;
  font-size: 14px;

  input[type="radio"] {
    display: none;
  }

  input[type="checkbox"] {
    display: none;
  }

  label {
    display: block;
    cursor: pointer;
    background: rgba(6, 6, 6, 0.6);
    color: #fff;
    margin: 5px;
    padding: 2px 16px;
    font-size: 13px;
    border-radius: 6px;
  }

  label:hover {
    background: rgba(6, 6, 6, 0.6);
    color: #fff;
  }

  input[type="checkbox"]:checked + label,
  input[type="radio"]:checked + label {
    background-color: #2989ff;
    color: #fff;
  }

  &.heatmap-switch {
    top: 65px;
  }

  &.showButton {
    right: 385px;
  }

  &.hideButton {
    right: 5px;
  }
}

.labelButton {
  position: absolute;
  top: 170px;
  z-index: 100;
  opacity: 1;
  transition: all 1s ease;
  box-sizing: border-box;
  font-size: 14px;

  &.showButton {
    right: 390px;
  }

  &.hideButton {
    right: 10px;
  }
}

.equipment-right-panel {
  background: linear-gradient(90deg, rgba(11, 21, 33, 0.08) 0%, rgba(11, 21, 33, 0) 100%);
  border-radius: 0px 0px 0px 0px;
  opacity: 1;
}

.device-panel {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 103;
  transition: all 1s ease;

  &.show {
    opacity: 1;
  }

  &.hide {
    opacity: 0;
  }
}

.floor {
  position: absolute;
  top: 50%;
  z-index: 96;
  min-width: 60px;
  height: auto;
  transition: all 1s ease;
  transform: translateY(-50%);

  &.show {
    left: calc(var(--scale, 1) * 400px * var(--font-size-scale, 1));
  }

  &.hide-all-panel {
    left: 20px;
  }

  &.hide {
    left: 40px;
  }
}

.merchant {
  position: absolute;
  top: 70%;
  transform: translateY(-50%);
  z-index: 100;
  min-width: 60px;
  height: auto;
  transition: all 1s ease;
  left: 420px;
}

.build-tag {
  position: absolute;
  top: 50%;
  z-index: 98;
  min-width: 60px;
  height: auto;
  transition: all 1s ease;
  transform: translateY(-50%);

  &.show {
    left: calc(var(--scale, 1) * 400px * var(--font-size-scale, 1));
  }

  &.hide-all-panel {
    left: 20px;
  }

  &.hide {
    left: 40px;
  }
}

.roaming-tag {
  position: absolute;
  top: 15%;
  left: 6%;
  z-index: 98;
  min-width: 60px;
  height: auto;
  transition: all 1s ease;
}

.nav {
  position: absolute;
  bottom: 20px;
  left: 0;
  width: 100%;
  z-index: 96;
  display: flex;
  justify-content: center;
  transition: all 1s ease;

  &.show {
    bottom: 20px;
    opacity: 1;
  }

  &.hide {
    bottom: -100px;
    opacity: 0;
  }
}

.top-panel {
  width: 1150px;
  position: absolute;
  top: 80px;
  z-index: 0;
  left: 380px;

  &.show {
    bottom: 20px;
    opacity: 1;
  }

  &.hide {
    bottom: -100px;
    opacity: 0;
  }
}

.msg-bg {
  &::after,
  &::before,
  span {
    content: "";
    display: inline-block;
    position: absolute;
    top: 0;
    width: 197px;
    height: 100%;
    border-radius: 0px 0px 0px 0px;
    opacity: 1;
  }

  &.red {
    &::after {
      left: 0;
      z-index: 100;
      background: linear-gradient(91deg, rgba(244, 32, 32) 0%, rgba(244, 32, 32, 0) 100%);
    }

    &::before {
      right: 0;
      z-index: 100;
      background: linear-gradient(270deg, rgba(244, 32, 32) 0%, rgba(244, 32, 32, 0) 100%);
    }

    & > span {
      display: inline-block;
      width: 100%;
      height: 100%;

      &::after,
      &::before {
        content: "";
        display: inline-block;
        position: absolute;
        left: 0;
        width: 100%;
        height: 140px;
        border-radius: 0px 0px 0px 0px;
        opacity: 1;
      }

      &::after {
        bottom: 0;
        z-index: 100;
        background: linear-gradient(to top, rgba(244, 32, 32, 0.3098) 0%, rgba(244, 32, 32, 0) 100%);
      }

      &::before {
        top: 0;
        background: linear-gradient(to bottom, rgba(244, 32, 32, 0.3098) 0%, rgba(244, 32, 32, 0) 100%);
      }
    }
  }
}

:deep(.ant-picker-time-panel-cell-inner) {
  color: #fff !important;
}

.device-icon-legend {
  position: absolute;
  bottom: 120px;
  right: 380px;
  z-index: 96;
  display: flex;
  justify-content: center;
  transition: all 1s ease;

  &.show {
    bottom: 120px;
    opacity: 1;
  }

  &.hide {
    bottom: -100px;
    opacity: 0;
  }
}

.heatmap-checkbox {
  position: absolute;
  top: 65px;
  z-index: 100;
  opacity: 1;
  transition: all 1s ease;
  display: flex;
  align-items: center;

  &.showButton {
    right: 385px;
  }

  &.hideButton {
    right: 5px;
  }

  input[type="checkbox"] {
    width: 16px;
    height: 16px;
    margin-right: 8px;
    cursor: pointer;
    appearance: none;
    -webkit-appearance: none;
    border: 1px solid #2989ff;
    border-radius: 2px;
    position: relative;
    background-color: rgba(255, 255, 255, 0.1);

    &:checked {
      background-color: #2989ff;

      &::after {
        content: "";
        position: absolute;
        left: 5px;
        top: 1px;
        width: 5px;
        height: 10px;
        border: solid white;
        border-width: 0 2px 2px 0;
        transform: rotate(45deg);
      }
    }
  }

  label {
    color: #fff;
    cursor: pointer;
    font-size: 14px;
    user-select: none;
  }
}
</style>
