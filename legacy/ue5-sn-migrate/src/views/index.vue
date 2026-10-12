<template>
  <div class="view">
    <div id="player" ref="modelContainer" v-if="!csMode"></div>
    <div class="top-container show">
      <TopHeader ref="topHeader" @tourStatus="setTourStatus" @set-weather="setWeather" @set-time="setTime"
        @init-camera-view="changeCameraView" @view-alarm-list="viewAlarmList" @set-time-type="setTimeType"
        @roamingEvent="startRoaming" @tiggleBusinessNav="(val: boolean) => showBusinessNav = val"></TopHeader>
    </div>

    <div class="device-panel" :class="showDevicePanel ? 'show' : 'hide'">
      <component @openDevicePanelEmit="openDevicePanel" :PanelName="{rightPanelName,leftPanelName}" :is="devicePanel"
        :show="showDevicePanel" :code="curentDeviceCode" :id="currentDeviceId" :alarmDetailData="curAlarmDetail"
        :deviceInfo="curentDevice" @close="closeModal" @showBusinessPanel="switchBusinessPanel"
        @openDevicePanel="openDevicePanel">
      </component>
    </div>
    <BasePanelRender :panelName="leftPanelName" :universal-panel-vo="universalPanelVo.left"
      :equipment-id="currentDeviceId" :show-panel="showPanel" :show-business-nav="showBusinessNav" position="left" />
    <BasePanelRender :panelName="rightPanelName" :universal-panel-vo="universalPanelVo.right"
      :equipment-id="currentDeviceId" :show-panel="showPanel" :show-business-nav="showBusinessNav" position="right" />
    <div v-show="piniaStoreMenu.scenarioTypes&&piniaStoreMenu.scenarioTypes.length==2&&roamShow" class="switchButton"
      :class="[rightPanel && showPanel ? 'showButton' : 'hideButton']">
      <input type="radio" id="male" value="BUILD" v-model="switchScene">
      <label for="male">建筑</label>
      <input type="radio" id="female" value="PIPE_NETWORK" v-model="switchScene">
      <label for="female">管网</label>
    </div>

    <!--楼栋标签-->
    <div class="build-tag" v-if="
        switchScene==='BUILD'&&
        controlBuildingShow &&
        areaList.length &&
        !piniaStoreMarket.alarmDeviceRisk.length &&
        roamShow &&
        piniaStoreArea.currentAreaLeave === 1
      " :class="[
        leftPanelName && showPanel ? 'show' : 'hide',
        showBusinessNav ? '' : 'hide-all-panel',
      ]">
      <BuildTag :area-list="areaList" @change-build="handelClickBuild" :cur-build="curBuild" />
    </div>
    <!--楼层标签-->
    <div class="floor" v-if="
        controlFloorShow && !piniaStoreMarket.alarmDeviceRisk.length  && roamShow && (piniaStoreArea.currentAreaLeave === 3||piniaStoreArea.currentAreaLeave === 2) && functionalAreaList.length === 0
      " :class="[
        leftPanelName && showPanel ? 'show' : 'hide',
        showBusinessNav ? '' : 'hide-all-panel',
      ]">
      <Floor ref="floorRef" :floors="floorList" @floor-back="floorBack" @changeFloor="changeFloor"></Floor>
    </div>
    <!--区域标签-->
    <div class="floor" v-if="
        controlFloorShow &&   (piniaStoreArea.currentAreaLeave === 3||
         piniaStoreArea.currentAreaLeave === 4) && functionalAreaList.length > 0" :class="[
        leftPanelName && showPanel ? 'show' : 'hide',
        showBusinessNav ? '' : 'hide-all-panel',
      ]">
      <FunctionalArea :curBuild="functionalCurBuild" :floors="functionalAreaList" @floor-back="areaBack"
        @changeFloor="changeArea"></FunctionalArea>
    </div>
    <!-- 报警设备&风险源分类 -->
    <div class="floor" v-if="piniaStoreMarket.alarmDeviceRisk.length>0" :class="[
        leftPanelName && showPanel ? 'show' : 'hide',
        showBusinessNav ? '' : 'hide-all-panel',
      ]">
      <AlarmEquipmentRisk @floor-back="initialization"></AlarmEquipmentRisk>
    </div>
    <div class="roaming-tag" v-if="!roamShow">
      <roamingPoint @closeRoam="closeRoam" :point="roamingPointData"></roamingPoint>
    </div>
    <!--业务菜单-->
    <div class="nav" v-show="roamShow && piniaStoreArea.currentAreaLeave>0"
      :class="{ show: showBusinessNav, hide: !showBusinessNav }">
      <BusinessNav ref="businessNavRef" @switchNav="switchNav" />
    </div>
  </div>
  <div v-if="isOneLevel" class="msg-bg red"><span></span></div>
</template>
<script setup lang="ts">
import { onMounted, ref, nextTick, watch, reactive, computed } from "vue";
import {UeClient} from "@ghcloud/cube-visual-sdk";
import bus from "@/utils/bus";
import TopHeader from "@/components/basic/header/header.vue";
import Floor from "./floor.vue";
import FunctionalArea from "./functional-area.vue";
import AlarmEquipmentRisk from "./alarm-equipment-risk.vue";
import BuildTag from "./build-tag.vue";
import BusinessNav from "./components/business-nav/business-nav.vue";
import roamingPoint from "./components/roaming-point/roaming-point.vue";
import { BusinessPanel, DevicePanel, AlarmPanel } from "../components";
import { storeArea } from "@/piniaStore/area";
import { storeMarket } from "@/piniaStore/other";
import { roamingDevices } from "@/piniaStore/roamingDevices";
import { storeMenu } from "@/piniaStore/menu";
import { getAreaList, getAreaScenePanelConfig } from "@/api/mdata";
import { AreaType, SceneDataType } from "@/api/models/mdata";
import { addLabelText, batchAddDeviceIcon, batchAddGearIconPio ,EnumParkView, hiddenPipeline, hidePipeGallery, setElevatorView, showEmergencyAccess} from "./index";
import { getNowDateTime, getAreaCamera, debounce, getPerspective } from "@/utils/common";
import { weatherCode } from "@/components/basic/header/header";
import { getDeviceInfoByCode } from "@/api/equipment";
import { useWebSocket } from "@/utils/websocket";
import { DeviceAlarmType, DeviceStatusCode, DeviceTypeIcon } from '@/utils/enumeratie'
import { useIotSocket } from "@/utils/iotSocket";
import { message } from "ant-design-vue";
import { BasePanelRender } from '@/components/businessPanel/base-panel-render/base-panel-render'
import { setSpecialCamera } from "@/views/index";

useWebSocket(`${location.protocol === `https:` ? `wss` : `ws`}://${location.host}/api/message/websocket/msg`,'broadcast');
useIotSocket();
/** 当前楼栋信息 这个信息传给 UE5 再回传的 */
interface CurBuild {
  actorId: string;
  props: {
    iconType: "area";
    name: string;
    areaId: string;
    actorId: string;
    modalNames: string;
    buildTagLocation: unknown;
    visualizationAreaType:string;
  };
}

const csMode = false;
const modeArea = ref([])
const isOneLevel = ref(false);
const piniaStoreArea = storeArea();
const piniaStoreMenu = storeMenu();
const piniaStoreMarket = storeMarket();
const piniaRoamingDevices = roamingDevices();
const showPanel = ref<boolean>(true);
const roamShow = ref<boolean>(true);
const showDevicePanel = ref<boolean>(false);
const modelContainer = ref(null);
const ueClient = UeClient.getInstance();
const leftPanel = ref();
const rightPanel = ref();
const leftPanelName = ref();
const isPerimeter = ref(false)
const rightPanelName = ref();
const roamingPointData = ref(); 
const storagePanel = reactive({
  leftPanel: "",
  rightPanel: "",
});
const devicePanel = ref();
const curentDevice = ref();
const currentDeviceId = ref<string>("");
const curentDeviceCode = ref<string>("");
const curBuild = ref<CurBuild>(); // 当前楼栋的信息（模型）
const functionalCurBuild = ref<CurBuild>(); // 当前区域的信息（模型）
const universalPanelVo = reactive({
  left:{},
  right:{}
})
const businessNavRef = ref();
const floorRef = ref();
const topHeader = ref();
const areaList = ref<AreaType[]>([]);
const floorList = ref<any[]>([]);
const functionalAreaList = ref<any[]>([]);
const curAlarmDetail = ref<any>(null);
const shellCode = ref<any>(null);
const showBusinessNav = ref(true);
// 控制楼栋显隐
const controlBuildingShow = computed(() => {
  return (window as any).config.buildingLabelFlag;
});
//切换场景
const switchScene=ref('BUILD')

// 控制楼层显隐
const controlFloorShow = computed(() => {
  return (window as any).config.floorLabelFlag;
});
/** 点击楼栋标签或者模型上的楼栋标签 */
const handelClickBuild = async (e: CurBuild,noBack = true): Promise<void> => {
  // 移除所有标签
  ueClient.send("removePoiByType", { type: "all" });
  closeModal();
  functionalAreaList.value = [];
  // 将当前区域级别设置为2级
  let camera = getAreaCamera(e.props.modalNames,e.props.name);
  if (camera) {
    ueClient.send("changeCameraView", {...JSON.parse(camera),pawnToCamera:false,speed: 200});
  } else {
    // 区域聚焦
    ueClient.send("focusActor", { id: e.props.actorId });
  }
  // 是否隐藏其他楼层
  const perspective = getPerspective(e.props.modalNames,e.props.name);
  if (perspective?.shellCode) {
    shellCode.value = perspective.shellCode;
    ueClient.send('showShell', {
      id: shellCode.value,
      flash:false,
      seconds:0
    })
  }
  if (perspective && perspective.hideActors && perspective.hideActors.length) {
    perspective.hideActors.forEach((item) => {
      ueClient.send("getActorByName", { name: item }, (res) => {
        ueClient.send("hideActor", { id: res.actorId || res.id });
      });
    });
    hiddenPipeline()
  }
  ueClient.send("showShell", { id: e.props.actorId, seconds: 2 });
  const list = areaList.value;
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
   await new Promise<void>((resolve, reject) => {
      ueClient.send("getBimtree", { id: e.props.actorId }, function (children) { 
        floorList.value = currentBuild.children;
        if(Object.keys(children).length){
          children.forEach((item) => {
            floorList.value = floorList.value.map((v) => {
              if (v.aliasName === item.name) {
                return {
                  ...v,
                  actorId: item.id as string,
                  selected: true as boolean,
                  modalNames: currentBuild.name + "-" + v.name,
                };
              } else
                return {
                  ...v,
                  selected: true as boolean,
                  modalNames: currentBuild.name + "-" + v.name,
                };
            });
          });
        }else{
          floorList.value = floorList.value.map((v) => {
            return {
              ...v,
              selected: true as boolean,
              modalNames: currentBuild.name + "-" + v.name,
             };
          });
        }
        resolve()
        addAreaBuildTextIcon(floorList.value)
      });
    })
  }else if(piniaStoreArea.currentAreaLeave !== 4){
  let currentFloor = floorList.value.find((item) => item.id === e.props.areaId);
    piniaStoreArea.currentBuild = {
      name: currentFloor.name,
      areaId: currentFloor.id,
      actorId: null,
      modalNames: currentFloor.modalNames,
    };
    selectFloorFn(e)
  }
  // 将当前区域级别设置为2级
  if (piniaStoreArea.currentAreaLeave === 1) {
    piniaStoreArea.currentAreaLeave = 2;
  }else if (piniaStoreArea.currentAreaLeave === 3 && noBack) {
    const data = {
      hidFloors:[],
      showFloors:[],
      selectedFloor:e.props
    }
    functionalCurBuild.value = e;
    changeArea(data)
  }else{
    piniaStoreArea.currentAreaLeave = 2;
  }
  piniaStoreArea.currentAreaId = e.props.areaId;
  piniaStoreArea.currentContainerId = e.props.actorId;
  switchBusinessPanel();
};
const selectFloorFn = (e)=>{
  if (e.props.visualizationAreaType === "BUILDING" || e.props.visualizationAreaType === "OTHER") {
    let currentBuild = floorList.value.find((item) => item.id === e.props.areaId);
    piniaStoreArea.currentAreaLeave = 3;
    piniaStoreArea.currentAreaId = e.props.areaId;
    piniaStoreArea.currentContainerId = e.props.actorId;
    if(currentBuild.children.length){
      functionalAreaList.value = currentBuild.children.map(floor=>{
        return {
          ...floor,
          modalNames: currentBuild.name + "-" + floor.name,
        }
      })
    }else{
      floorRef.value.changeFloor(currentBuild)
    }
  }
}
// 统一打上区域文字标签
const addAreaBuildTextIcon =async (areaListData) => {
      // 移除所有标签
      ueClient.send("removePoiByType", { type: "all" });
      // 1、根据名称获取栋楼信息 2、给楼栋打标签
      if (areaListData.length) {
        const buildList = areaListData;
        let ueBuild = [];
        for (let i = 0; i < buildList.length; i++) {
          if(buildList[i].aliasName && (buildList[i].visualizationAreaType === 'BUILDING' || buildList[i].visualizationAreaType === 'OTHER')){
            ueBuild.push(
              new Promise((resolve, reject) => {
                ueClient.send(
                  "getActorByName",
                  { name: buildList[i].aliasName },
                  (data) => {
                  const perspective = getPerspective(buildList[i].modalNames??buildList[i].name);
                    data.buildTagLocation = null;
                    data.areaId = buildList[i].id
                    data.aliasName = buildList[i].aliasName
                    data.name = buildList[i].name
                    data.modalNames = buildList[i].modalNames
                    data.visualizationAreaType = buildList[i].visualizationAreaType
                    if (perspective && perspective.buildTagLocation) {
                      data.buildTagLocation = perspective.buildTagLocation;
                    }
                    resolve(data);
                  }
                );
              })
            );
          }
        }
        Promise.all(ueBuild).then((res) => {
          res.forEach((item, index) => {
            if (item.actorId|| item.id || item.buildTagLocation){
              addBuildTextIcon(
                item.name,
                item.actorId || item.id,
                item.areaId,
                item.modalNames||item.aliasName,
                item.buildTagLocation,
                item.visualizationAreaType
              );
            }
          });
        });
      }
}
/** 重置 ue5 分辨率 */
const resetVideoSize = (): void => {
  if (!navigator.userAgent.includes("UnrealEngine")) {
    ueClient.send("changeResolution", {
      width: document.body.clientWidth,
      height: document.body.clientHeight,
    });
  }
};
/** 添加楼栋文字标签 */
const addBuildTextIcon = (
  text: string,
  actorId: string,
  areaId: string,
  modalNames: string,
  buildTagLocation: unknown,
  visualizationAreaType:string,
) => {
    ueClient.send("addIconTextPoi", {
      text: text,
      targetActorId: buildTagLocation?'':actorId || '',
      scale: 1.5,
      location: buildTagLocation,
      props: {
        iconType: "area",
        name: text,
        areaId: areaId,
        actorId: actorId,
        modalNames: modalNames,
        buildTagLocation: buildTagLocation,
        visualizationAreaType:visualizationAreaType
      },
    });
};


/** 获取区域列表 */
const requestAreaList = async () => {
  const res = await getAreaList();
  if (res.length) {
    areaList.value = res
    piniaStoreArea.currentAreaId = null
  }
};
const setWeather = (value): void => {
  ueClient.send("setWeather", { weather: value });
};
const setTourStatus = (value)=>{
  if (value) {
    leftPanelName.value = 'GuidePanel'
    rightPanelName.value = ''
    piniaStoreArea.currentAreaLeave = -1
  }else{
    piniaStoreArea.currentAreaLeave = 1
    if (piniaStoreMenu.currentMenu === businessNavRef.value.getBusinessNavs()[0].id) {
      topHeader.value.selectFirstCameraView();
      businessPanel()
    }else{
      businessNavRef.value.changeNeoNav()
      topHeader.value.selectFirstCameraView();
    }
  }
}
const setTime = (value): void => {
  if (value === "auto") {
    ueClient.send("setSimulateRealWorld", {
      simulate: true,
    });
  } else {
    ueClient.send("setSimulateRealWorld", {
      simulate: false,
    });
    const params: string[] = value.split(":");
    ueClient.send("setTimeOfDay", {
      hours: params[0],
      minutes: params[1],
      seconds: params[2],
    });
  }
};
const setTimeType = (value: boolean): void => {
  ueClient.send("setSimulateRealWorld", {
    simulate: value,
  });
};
/** 楼层组件点击返回 */
const floorBack = (): void => {
  if (!curBuild.value) {
    topHeader.value.selectFirstCameraView();
  }
  //楼栋回显
const perspective = getPerspective(curBuild.value.props.modalNames);
  if (perspective && perspective.hideActors && perspective.hideActors.length) {
    perspective.hideActors.forEach((item) => {
      ueClient.send("getActorByName", { name: item }, (res) => {
        ueClient.send("showActor", { id: res.actorId });
      });
    });
  }
  ueClient.send('resetModel', {
    tour: true,
    flash: true,
    select: true,
    poi: false,
    effect: true
});
  //返回楼栋
  if (piniaStoreArea.currentAreaLeave === 3) {
      // 平湖特殊需求
    showEmergencyAccess(false)
    handelClickBuild(curBuild.value,false);
    return;
  }
  //返回园区
  if (piniaStoreArea.currentAreaLeave === 2) {
    topHeader.value.selectFirstCameraView();
  }
};
/** 点击楼层 */
const changeFloor = (data): void => {
  ueClient.send('HideShell', {
    id: shellCode.value
});  
  ueClient.send("removePoiByType", { type: "all" });
  functionalAreaList.value = data.selectedFloor.children.map(floor=>{
    return {
      ...floor,
      modalNames: data.selectedFloor.modalNames+ "-" + floor.name,
    }
  })
  addAreaBuildTextIcon(functionalAreaList.value)
  piniaStoreArea.currentBuild = {
      name: data.selectedFloor.name,
      areaId: data.selectedFloor.id,
      actorId: null,
      modalNames: data.selectedFloor.modalNames,
    };
  // 关闭设备面板
  closeModal();
  // 将当前区域级别设置为3级区域
  piniaStoreArea.currentAreaLeave = 3;
  piniaStoreArea.currentAreaId = data.selectedFloor.id;
  piniaStoreArea.currentContainerId = data.selectedFloor.actorId;
  piniaStoreArea.currentModalNames = data.selectedFloor.modalNames;
  switchBusinessPanel();
  data.showFloors.forEach((item) => {
    ueClient.send("showActor", { id: item.actorId });
  });
  data.hidFloors.forEach((item) => {
    ueClient.send("hideActor", { id: item.actorId });
  });
  hiddenPipeline()
  // 视角设置
  let camera = getAreaCamera(data.selectedFloor.modalNames||data.selectedFloor.aliasName,data.selectedFloor.name);
  if (camera) {
    ueClient.send("changeCameraView", {...JSON.parse(camera),pawnToCamera:false});
  }else{
    ueClient.send('getActorByName', {name: data.selectedFloor.aliasName}, function(actor) {
      // 区域聚焦
      ueClient.send("focusActor", { id: actor.id });  
      ueClient.send("showShell", { id: actor.id, seconds: 2 });
    })
  }

  // 删除楼层标签
  ueClient.send("removeActorPoi", { targetActorId: curBuild.value.actorId });
  piniaStoreArea.currentFloor = {
    name: data.selectedFloor.modalNames||data.selectedFloor.aliasName,
    areaId: data.selectedFloor.id,
    actorId: data.selectedFloor.actorId,
    modalNames: data.selectedFloor.aliasName,
    curFloorName: data.selectedFloor.modalNames,
  };
  showEmergencyAccess(false,0)
};
/** 楼层组件点击返回 */
const areaBack = (): void => {
  if (piniaStoreArea.currentAreaLeave === 4) {
    piniaStoreArea.currentAreaId = piniaStoreArea.currentBuild.areaId;
    piniaStoreArea.currentAreaLeave = 3;
      // 视角设置
    let camera = getAreaCamera(piniaStoreArea.currentFloor.name);
    if (camera) {
      ueClient.send("changeCameraView", {...JSON.parse(camera),pawnToCamera:false});
    }
    addAreaBuildTextIcon(functionalAreaList.value)
    switchBusinessPanel()
  }else if (piniaStoreArea.currentAreaLeave === 3) {
    functionalAreaList.value = []
    floorBack()
  }
}
/** 点击区域 */
const changeArea = (e): void => {
  // 移除所有标签
  ueClient.send("removePoiByType", { type: "all" });
  // 视角设置
  let camera = getAreaCamera(e.selectedFloor.modalNames);
  if (camera) {
    ueClient.send("changeCameraView", {...JSON.parse(camera),pawnToCamera:false});
  }
  closeModal();
  // 将当前区域级别设置为4级
  piniaStoreArea.currentAreaLeave = 4;
  piniaStoreArea.currentAreaId = e.selectedFloor.id;
  piniaStoreArea.currentModalNames = e.selectedFloor.modalNames;
  switchBusinessPanel();
}
// 根据区域及业务菜单获取面板
const businessPanel = async () => {
  piniaStoreArea.currentAreaLeave?piniaStoreArea.currentAreaLeave:piniaStoreArea.currentAreaLeave=1
  if (!piniaStoreMenu.currentMenu) {
    return
  }
  const res = await getAreaScenePanelConfig({
    areaLeave: piniaStoreArea.currentAreaLeave,
    sceneType: piniaStoreMenu.currentMenu,
  });
  leftPanelName.value = ''
  rightPanelName.value = ''
  setTimeout(() => {
    showPanel.value = true;
    res.forEach((element) => {
      if (element.panelPosition === "LEFT_PANEL") {
        leftPanelName.value = element.panelConfig
        leftPanel.value = BusinessPanel[element.panelConfig];
        universalPanelVo.left = element.universalPanelVo
      }
      if (element.panelPosition === "RIGHT_PANEL") { 
        rightPanelName.value = element.panelConfig
        rightPanel.value = BusinessPanel[element.panelConfig];
        universalPanelVo.right = element.universalPanelVo
      }
    });
  }, 200);
};
// 切换面板
const switchBusinessPanel = (): void => {
  leftPanel.value = "";
  rightPanel.value = "";
  showPanel.value = false;
  businessPanel();
};
// 报警弹窗开关
const showAlarmListPanel = ref(false);
const viewAlarmList = () => {
  if (leftPanel.value) {
    storagePanel.leftPanel = leftPanel.value;
    storagePanel.rightPanel = rightPanel.value;
  }
  leftPanel.value = null;
  rightPanel.value = null;
  rightPanelName.value = null
  leftPanelName.value = null
  showPanel.value = false;
  if (showAlarmListPanel.value) {
    leftPanel.value = storagePanel.leftPanel;
    rightPanel.value = storagePanel.rightPanel;
    showPanel.value = true;
    showAlarmListPanel.value = false;
    return;
  }

  setTimeout(() => {
    showPanel.value = true;
    rightPanel.value = AlarmPanel["AlarmListPanel"];
    rightPanelName.value = "AlarmListPanel"
    businessNavRef.value.clearActived(); //清除活动的业务菜单
    showAlarmListPanel.value = true;
  }, 200);
};
const menuModelEvent = (item) => {
   try{
     if (item.name === '周界防范') {
      ueClient.send('showActor', {id: 'BoundaryBox'});
     }else{
      ueClient.send('hideActor', {id: 'BoundaryBox'});
     }
   }catch{}
}
// 视角初始化
const initialization = ()=>{
  topHeader.value.selectFirstCameraView();
}
// 切换业务菜单
const switchNav = async (item: SceneDataType, lv: number): Promise<void> => {
  if (item) {
    piniaStoreMenu.currentMenu = item.id;
    if (item.level === 1) {
      piniaStoreMenu.sort = item.sort;
    }else{
      piniaStoreMenu.sort = item.level+item.sort;
    }
    piniaStoreMenu.currentMenuName = item.name;
    piniaStoreMenu.scenarioTypes=item.scenarioTypes
    menuModelEvent(item)
    try {
      if (((item.name!=='空气源'&&item.name!=='冷热源'&&item.name!=='净化系统'&&item.name!=='锅炉系统'&&item.name!=='净水系统')||(switchScene.value==='BUILD')))  {
        setTimeout(() => {
          topHeader.value.selectFirstCameraView();
        }, 0);
      }else{
        switchBusinessPanel();
      }
    } catch (error) {}
  }
  piniaStoreMarket.alarmDeviceRisk = []
  if(item.name === '电梯管理'){
    // setElevatorView()
  }
};
/** 设备定位 */
const equipmentPosition = (item) => {
  ueClient.send(
    "getActorById",
    { id: item.alarmTargetCode },
    async function (res) {
      if (res.id) {
        setSpecialCamera(item.prodCategory,res.id)
        ueClient.send("startFlash", { id: res.id, level: 1 });
        ueClient.send("showShell", { id: res.id});
      }else {
        message.error("模型中未找到对应设备");
      }
    }
  );
};
/** 打开设备面板（弹窗)*/
const openDevicePanel = (deviceId: string, deviceType?: string): void => {
  showDevicePanel.value = false;
  devicePanel.value = "";
  nextTick(() => {
    if (deviceId) {
      currentDeviceId.value = deviceId;
      showDevicePanel.value = true;
      // devicePanel.value = DevicePanel[deviceType ? deviceType : "EquipmentDetailPanel"];
      devicePanel.value = DevicePanel[deviceType ? deviceType : "EquipmentAbbreviationsPanel"];
    }
  });
};
/** 打开报警详情面板（弹窗） */
const showAlarmDetailPanel = (item) => {
  curAlarmDetail.value = item;
  showDevicePanel.value = true;
  devicePanel.value = AlarmPanel["AlarmDetailPanel"];
};
// 设置视角
const changeCameraView = (value: string): void => {
  try {
      ueClient.send("changeCameraView", {...JSON.parse(value),pawnToCamera: false });
      addAreaBuildTextIcon(areaList.value)
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
    ueClient.send('stopAutoRevolve');
    floorList.value = [];
    curBuild.value = null;
    piniaStoreArea.currentBuild = null;
    piniaStoreArea.currentFloor = null;
    piniaStoreMarket.alarmDeviceRisk = []
    //将区域级别设置为1，重新请求面板
    piniaStoreArea.currentAreaLeave = 1;
    piniaStoreArea.currentAreaId = null;
  } catch (error) {
  }
  // 平湖特殊需求
  showEmergencyAccess(false)
  // 管廊特殊需求
  // hidePipeGallery()
  switchBusinessPanel();
};
// 开始漫游
const startRoaming = (value)=>{
  leftPanel.value = null
  leftPanelName.value = null
  rightPanel.value = BusinessPanel['RoamingDevices']
  rightPanelName.value = "RoamingDevices"
  roamShow.value = false
  roamingPointData.value = value
}
// 结束漫游
const closeRoam = ()=>{
  leftPanel.value = null
  roamShow.value = true
  roamingPointData.value = null
  leftPanel.value = BusinessPanel[leftPanelName.value];
  rightPanel.value = BusinessPanel[rightPanelName.value];
  topHeader.value.resetRoaming();
  topHeader.value.selectFirstCameraView();
}
/**
 * 关闭设备面板
 * @param backViewpoint 是否返回上一级视角
 */
const closeModal = (backViewpoint = false,item?:any): void => {
  devicePanel.value = "";
  showDevicePanel.value = false;
  if(item){
    ueClient.send(
    "getActorById",
    { id: item.baseArchivesInfo.code },
    async function (res) {
      if (res.id) {
        const deviceListPio = {
				targetActorId: item.baseArchivesInfo.code,
				icon: DeviceTypeIcon[item.productCategory.name],
				color: DeviceStatusCode[item.baseArchivesInfo.status.onlineState?'NORMAL':'OFFLINE'],
        scale: window.config.otherConfig.iconScale?window.config.otherConfig.iconScale:1,
				props: {
					iconType: 'device',
					actorId:item.baseArchivesInfo.code,
					id: item.baseArchivesInfo.id,
					code: item.baseArchivesInfo.code,
					genreId: item.genreId,
				}
			}
	    ueClient.send("addIconPoi", deviceListPio )
      }
    }
  );
  
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
bus.on("setPanel", (item:{id:string,rightPanelName:string,leftPanelName:string}): void => {
  rightPanelName.value = item.rightPanelName
  leftPanelName.value = item.leftPanelName
  if (item.id) {
    piniaStoreMarket.patrolRouterId = item.id
    // piniaStoreArea.currentAreaLeave = -1
  }
});
/** 退出视频巡逻面板 */
bus.on("exitPatrol", (): void => {
  // piniaStoreArea.currentAreaLeave = 1
  businessPanel()
});
/** 打开设备弹窗并且定位 */
bus.on("openDevicePopup", (record: any): void => {
  openDevicePanel(record.alarmTargetKey,record.modalType?record.modalType:'EquipmentDetailPanel');
  if (!record.viewLocation) {
    equipmentPosition(record);
  }
});
/** 关闭面板（弹窗） */
bus.on("closeDevicePanel", (): void => {
  showDevicePanel.value = false;
  devicePanel.value = "";
});
/** 设备定位 */
bus.on("equipmentPosition", (record: any): void => {
  equipmentPosition(record);
  showAlarmDetailPanel(record);
});
/** 设备定位 */
bus.on("equipmentPositionEvent", (record: any): void => {
  equipmentPosition(record);
});
/** 查看报警 */
bus.on(
  "openAlarmModal",
  async (item: any): Promise<void> => {
    // 打开报警弹窗的时候关闭左侧面板
    showAlarmListPanel.value = false;
    rightPanel.value = "";
    equipmentPosition(item);
    showAlarmDetailPanel(item);
  }
);
/** webSocket消息提示 NOTICE_MESSAGE -> ALARM_NOTICE 报警弹窗 由后端主动推送的报警消息 */
bus.on(
  "getEventVideoList",
  async (data: any): Promise<void> => {
    // 更新报警数量
    setTimeout(() => {
      topHeader.value.getAlarmCount();
    }, 0);
  }
);
//展示管线,隐藏楼栋
const showPipeline=()=>{
  try{
  ueClient.send('removePoiByType', {
    type: 'all'      // text/icon/all
  });
  let buildList=['门诊大楼','住院大楼','行政大楼','成都六院-净水管道系统','成都六院-净化空调','成都六院-空调水系统主管道']
  buildList.forEach(item=>{
    ueClient.send('getActorByName', {name: item}, function(data) {
      if (data.id) {
        ueClient.send('changePerspectivity', {id: data.id,translucent: true});
        // ueClient.send('removeActorPoi', {targetActorId: data.actorId});
      }
    })
  })
     //反透视管线
    if(piniaStoreMenu.currentMenuName==='空气源'||piniaStoreMenu.currentMenuName==='冷热源'||piniaStoreMenu.currentMenuName==='锅炉系统'){
      ueClient.send('getActorsByProps', {props: {'子系统':'空气源'}}, function(result) {   
         result.actors.forEach(item=>{
          item.id && ueClient.send('changePerspectivity', {id: item.id, translucent: false});
         })
       });
    }
    //反透视净化系统
    if(piniaStoreMenu.currentMenuName==='净化系统'){
      ueClient.send('getActorsByProps', {props: {'子系统':'净化系统'}}, function(result) {   
         result.actors.forEach(item=>{
          item.id && ueClient.send('changePerspectivity', {id: item.id, translucent: false});
         })
       });
    }
    //反透视净水系统
    if(piniaStoreMenu.currentMenuName==='净水系统'){
      ueClient.send('getActorsByProps', {props: {'子系统':'净水系统'}}, function(result) {   
         result.actors.forEach(item=>{
          item.id && ueClient.send('changePerspectivity', {id: item.id, translucent: false});
         })
       });
    }
    // 管网视角设置
    let camera = getAreaCamera(EnumParkView[piniaStoreMenu.currentMenuName]);
    if (camera) {
      ueClient.send("changeCameraView", camera);
    }
  }catch{

  }

}
//隐藏管线,展示楼栋
const showTextIcon=()=>{
  try {
  let buildList=['门诊大楼','住院大楼','行政大楼']
  let pipeList=['成都六院-净水管道系统','成都六院-净化空调','成都六院-空调水系统主管道']
  //显示标签,显示楼栋
  buildList.forEach(item=>{
    ueClient.send('getActorByName', {name: item}, function(data) {
      if(data.actorId){
        ueClient.send('changePerspectivity', {id: data.actorId,translucent: false});
      }
    })
  })
  //隐藏管线
  pipeList.forEach(item=>{
    ueClient.send('getActorByName', {name: item}, function(data) {
      if(data.actorId){
        ueClient.send('changePerspectivity', {id: data.actorId,translucent: true});
        ueClient.send('removeActorPoi', {targetActorId: data.actorId});
      }
    })
  })
  } catch {
    
  }
 
}

/**
 * 监听区域变化获取设备列表在模型中添加图标
 */
watch(
  () => piniaStoreArea.currentAreaId,
  () => {
    setTimeout(() => {
      if (piniaStoreMenu.currentMenu) {  
        batchAddDeviceIcon();
      }
    }, 1000);
  }
);
watch(
  () => piniaStoreMenu.currentMenu,
  () => {
    setTimeout(() => {
      if (piniaStoreArea.currentAreaLeave&&piniaStoreMenu.currentMenu) {
        batchAddDeviceIcon();
      }
    }, 1000);
    if(piniaStoreMenu.scenarioTypes.length===1&&piniaStoreMenu.scenarioTypes[0]==='PIPE_NETWORK'){
      switchScene.value='PIPE_NETWORK'
    }else{switchScene.value='BUILD'}
   //透视管网
    nextTick(()=>{
      if(switchScene.value==='PIPE_NETWORK')showPipeline()
      if(switchScene.value==='BUILD')showTextIcon()
    })
  }
);
watch(()=>switchScene.value,(val)=>{
  if(val==='BUILD'){
    topHeader.value.selectFirstCameraView()
    showTextIcon()
  }
  if(val==='PIPE_NETWORK'){
    showPipeline()
  }
})
// 重写报警设备定位方式
bus.on("setOpenAlarmModal", async (item: any): Promise<void> => {
  // 打开报警弹窗的时候关闭左侧面板
  showAlarmListPanel.value = false
  if(!item.hidePanel)leftPanel.value = ''
  getFloor(item)
  showAlarmDetailPanel(item);
});
// 查询物体所属楼栋楼层
const getFloor = async (item) => {
  ueClient.send('removePoiByProps', {
    props: { iconType: 'singleAlarm' }
  });
  // 移除设备特效
  ueClient.send('removeEffectAll');

  await ueClient.send('getBimLocation', { id: item.alarmTargetCode.trim() }, function (bimLocation) {
  let buildData: any = areaList.value.filter(item => {
      return item.aliasName === bimLocation.buildingName || item.name === bimLocation.buildingName
    })        
  if(buildData.length){
      bimLocation.levelName = item.areaName.split("-")[1]
      ueClient.send("getActorByName", { name: buildData[0].aliasName }, (res) => {
        ueClient.send("getBimtree", { id: res.actorId||res.id }, function (children) { 
          children.forEach(res=>{
            buildData[0].children.forEach(floorData=>{
              if (floorData.aliasName === res.name) {
                floorData.areaId = res.id
              }
            })
          })
          bimLocation.buildingName = buildData[0].name     
          showAndHidefloor(buildData[0].children, bimLocation)
          addSpecialEffects(item)
        })
      })
    }else{
      equipmentPosition(item)
      addSpecialEffects(item)
    }
  });
}
// 设备添加特效
const addSpecialEffects = (item) => {
  ueClient.send('addIconPoi', {
    icon: DeviceTypeIcon[item.alarmTargetTypeName],
    color: 1,
    targetActorId: item.alarmTargetCode,
		scale: window.config.otherConfig.iconScale?window.config.otherConfig.iconScale:1,
    props: {
      iconType: 'singleAlarm',
      actorId:item.alarmTargetCode,
			id: item.alarmTargetKey,
			code: item.alarmTargetCode,
			genreId: item.genreId,
    }
  });
  let effectCode = ''
  for (const key in DeviceAlarmType) {
    if (item.alarmEventName.indexOf(key) !== -1) {
      effectCode = DeviceAlarmType[key]
      if (effectCode === 'SmokeA') {
    ueClient.send('addEffect', {
      code: 'SmokeA',
      scale: { x: 0.5, y: 0.5, z: 0.5 },
      targetActorId: item.alarmTargetCode
    });
    ueClient.send('addEffect', {
      code: 'SmokeB',
      scale: { x: 0.5, y: 0.5, z: 0.5 },
      targetActorId: item.alarmTargetCode
    });
    ueClient.send('addEffect', {
      code: 'SmokeC',
      scale: { x: 0.5, y: 0.5, z: 0.5 },
      targetActorId: item.alarmTargetCode
    });
    ueClient.send('addEffect', {
      code: 'SmokeD',
      scale: { x: 0.5, y: 0.5, z: 0.5 },
      targetActorId: item.alarmTargetCode
    });
    ueClient.send('addEffect', {
      code: 'SmokeF',
      scale: { x: 0.5, y: 0.5, z: 0.5 },
      targetActorId: item.alarmTargetCode
    });
  }else if(effectCode === 'FireBig'){
    ueClient.send('addEffect', {
      code: effectCode,
      scale: { x: 0.5, y: 0.5, z: 0.5 },
      targetActorId: item.alarmTargetCode
    });
  } else {
    ueClient.send('addEffect', {
      code: effectCode,
      scale: { x: 0.5, y: 0.5, z: 0.5 },
      targetActorId: item.alarmTargetCode
    });
  }
    }
  }

}
// 计算当前在几楼，并且隐藏几楼，显示几楼
const showAndHidefloor = (floorData, item) => {
  const index = floorData.findIndex(v => v.areaId === item.floorId);
  const hidFloors = floorData.filter((item, i) => {
    if (i < index) {
      return item
    }
  })
  const showFloors = floorData.filter((item, i) => {
    if (i >= index) {
      return item
    }
  })
  floorData = floorData.map((item, i) => {
    if (i < index) {
      item.selected = false
    }
    else {
      item.selected = true
    }
    return item
  })
  const hideActors = ['成都六院-净水管道系统','成都六院-净化空调','成都六院-空调水系统主管道']
  hideActors.forEach((item) => {
      ueClient.send("getActorByName", { name: item }, (res) => {
        ueClient.send("hideActor", { id: res.actorId || res.id });
      });
    });
  let data = { showFloors: showFloors, hidFloors: hidFloors, selectedFloor: item }
  data.showFloors.forEach((item) => {
    ueClient.send("showActor", { id: item.areaId });
  });
  data.hidFloors.forEach((item) => {
    ueClient.send("hideActor", { id: item.areaId });
  });
  // 视角设置
  const cameraName = data.selectedFloor.levelName?data.selectedFloor.buildingName + '-' + data.selectedFloor.levelName:data.selectedFloor.buildingName
  let perspective = getPerspective(cameraName);
  if (perspective) {
    ueClient.send("changeCameraView", perspective.camera);
    perspective.hideActors.forEach((item) => {
      ueClient.send("getActorByName", { name: item }, (res) => {
        ueClient.send("hideActor", { id: res.actorId || res.id });
      });
    });
  }
}

onMounted(async () => {
  // 获取业务应用列表 （底部的菜单）
  businessNavRef.value.getMenuList();
  nextTick(async () => {
    topHeader.value.loadUE5Model(modelContainer.value);
  });

  /** 模型连接成功 */
  ueClient.onConnected(async function () {
    // 关闭触控界面
    ueClient.send('changeTouchInterface',{active:false})
    // 设置画质
    ueClient.send('changePictureQuality', {level: navigator.userAgent.includes("UnrealEngine")?'high':'low'});
    //重置分辨率
    resetVideoSize();
    const debounceChange = debounce(resetVideoSize, 1500);
    window.addEventListener("resize", debounceChange);
    (window as any).config.modelPerspective[0] && changeCameraView((window as any).config.modelPerspective[0].value)
    // 设置当前时间
    setTime(getNowDateTime("HH:mm:ss"));
    ueClient.send('hideActor', {id: 'BoundaryBox'});
    //设置天气
    if (topHeader.value?.weather) {
      setWeather(weatherCode[topHeader.value.weather.weather_code]);
    }
    // 临时处理每次模型链接成功将时间设置为自动
    ueClient.send("setSimulateRealWorld", { simulate: true });
    await requestAreaList();
    addLabelText()
    //隐藏管线
    if(switchScene.value==='BUILD'){
      showTextIcon()
    }
    //展示建筑
    if(switchScene.value==='PIPE_NETWORK'){
      showPipeline()
    }
    // 查询是否有周界
    ueClient.send('getActorById', {id: 'BoundaryBox'}, function(data) {
        isPerimeter.value = data
    });
  });
  /** 模型断开 */
  ueClient.onDisconnected(() => {
  });

  // 模型图标点击事件
  ueClient.onActorPoiClick(async function (e) {
    if (!(window as any).config.ue5InteractiveFlag) {
      return;
    }
    await ueClient.saveNowViewPoint();
    if (e.props.iconType == "area") {
      handelClickBuild(e);
    } else if (e.props.iconType == "device" || e.props.iconType == "singleAlarm") {
      // if (e.props.deviceData.prodCategory.name.includes('摄像')||e.props.deviceData.prodCategory.name.includes('监控') ) {
      //   leftPanel.value = BusinessPanel['floorEquipment'];
      //   rightPanel.value = "";
      //   piniaStoreMarket.selectDevice = e.props.deviceData
      //   piniaStoreArea.currentAreaId = e.props.deviceData.area.key
      // }else{
      //   ueClient.send("focusActor", { id: e.props.actorId });
      //   ueClient.send("showShell", { id: e.props.actorId });
      //   openDevicePanel(e.props.id);
      // }
      // ueClient.send("focusActor", { id: e.props.actorId });
      
      ueClient.send("showShell", { id: e.props.actorId });
      if (e.props.onlineState) {
        const deviceProps = {
          targetActorId: e.props.code,
          icon: DeviceTypeIcon[e.props.prodCategory],
          color: DeviceStatusCode[JSON.parse(e.props.onlineState) ?'NORMAL':'OFFLINE'],
          scale: window.config.otherConfig.iconScale?window.config.otherConfig.iconScale:1,
          props: {
            iconType: 'device',
            actorId:e.props.code,
            id: e.props.id,
            code: e.props.code,
            genreId: e.props.genreId,
            prodCategory:e.props.prodCategory,
            onlineState:e.props.onlineState,
            deviceData : e.props.deviceData
          }
        }
        ueClient.send('addIconPoi', {...deviceProps,flash: true})
        setTimeout(()=>{
          ueClient.send('addIconPoi', {...deviceProps})
        },5000)
      }
      openDevicePanel(e.props.id);
    }else if(e.props.iconType == "stall"){
      ueClient.send("focusActor", { id: e.props.actorId });
      ueClient.send("showShell", { id: e.props.actorId });
      openDevicePanel(e.props.id,'StallDetailPanel');
    }else if(e.props.iconType == "property"){
      ueClient.send("focusActor", { id: e.props.actorId });
      ueClient.send("showShell", { id: e.props.actorId });
      openDevicePanel(e.props.id,'PropertyDetailPanel');
    }else if(e.props.iconType == "risk_source"){
      ueClient.send("focusActor", { id: e.props.actorId });
      ueClient.send("showShell", { id: e.props.actorId });
      openDevicePanel(e.props.id,'RiskDetailPanel');
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
    // if (!(window as any).config.ue5InteractiveFlag) {
    //   return;
    // }
    if (actor.userData && (actor.userData['Element_标记'] || actor.userData['Element*标记'])) {
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
    
    if (actor.userData.Element_Type === "理货机") {
        openDevicePanel(res.baseArchivesInfo.id, "TallyingModal");
      } else {
        openDevicePanel(res.baseArchivesInfo.id);
      }
    }
  });
  // 模型漫游设备数据
  ueClient.onActorInSight(async function (e) {
    if(!roamShow.value){
      const res = await getDeviceInfoByCode(e.id);
      if (res) {
        const device = {
          name:res.baseArchivesInfo.name,
          deviceStatus:res.baseArchivesInfo.status.onlineState?'NORMAL' :'OFFLINE',
          id:res.baseArchivesInfo.id,
        }
        piniaRoamingDevices.roamingDevicesArr.push(device); 
        ueClient.send('startFlash', {id: e.id, level: 4});
      }
    }
  })
  // 视角移动完成回调
  ueClient.onCamera(async function (e){
    if(!roamShow.value&&piniaRoamingDevices.isRoaming){
        if (piniaRoamingDevices.cameraViewSuccess === roamingPointData.value.length-1) {
          piniaRoamingDevices.cameraViewSuccess = 0
        }else{
          piniaRoamingDevices.cameraViewSuccess++
        }
    }
  })  
  await requestAreaList();
});
</script>
<style lang="less">
@import url("../style/index.less");

.ant-modal-content {
  background-color: rgba(4, 17, 32, 0.92) !important;
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

  input[type="radio"]:checked+label {
    background-color: #2989ff;
    color: #fff;
  }

  &.showButton {
    right: 385px;
  }

  &.hideButton {
    right: 5px;
  }

  &.labelButton {
    right: 385px;
    top: 20px;
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
  transform: translateY(-50%);
  z-index: 96;
  min-width: 60px;
  height: auto;
  transition: all 1s ease;

  &.show {
    left: 420px;
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
  transform: translateY(-50%);
  z-index: 98;
  min-width: 60px;
  height: auto;
  transition: all 1s ease;

  &.show {
    left: 400px;
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
      background: linear-gradient(91deg,
          rgba(244, 32, 32) 0%,
          rgba(244, 32, 32, 0) 100%);
    }

    &::before {
      right: 0;
      z-index: 100;
      background: linear-gradient(270deg,
          rgba(244, 32, 32) 0%,
          rgba(244, 32, 32, 0) 100%);
    }

    &>span {
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
        background: linear-gradient(to top,
            rgba(244, 32, 32, 0.3098) 0%,
            rgba(244, 32, 32, 0) 100%);
      }

      &::before {
        top: 0;
        background: linear-gradient(to bottom,
            rgba(244, 32, 32, 0.3098) 0%,
            rgba(244, 32, 32, 0) 100%);
      }
    }
  }
}
</style>
