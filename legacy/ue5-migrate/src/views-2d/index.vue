<template>
  <div class="view">
    <div id="player"
      :style="{ 'background-image':bgImage?'url('+ bgImage + ')':null,'background-size':bgImage?'100%':'-webkit-radial-gradient(circle, #7b9dbe, #112440)'  }">
    </div>
    <iframe id="configuration" v-if="globalState.business.currentAreaLeave === 3" :src="bgPath"></iframe>
    <div class="top-container" :class="'show'">
      <TopHeader ref="topHeader" @view-alarm-list="viewAlarmList" @set-time="setTime"
        @tiggleBusinessNav="(val: boolean) => showBusinessNav = val"></TopHeader>
    </div>
    <div class="device-panel" :class="showDevicePanel ? 'show' : 'hide'">
      <component :is="devicePanel" :id="currentDeviceId" :alarmDetailData="curAlarmDetail" :deviceInfo="currentDevice"
        @close="closeModal" @showBusinessPanel="switchBusinessPanel" @openDevicePanel="openDevicePanel">
      </component>
    </div>
    <BasePanelRender 
      :panelName="leftPanelName"
      :universal-panel-vo="universalPanelVo.left" 
      :equipment-id="currentDeviceId"
      :show-panel="showPanel"
      :show-business-nav="showBusinessNav"
      position="left"
    />
    <BasePanelRender 
      :panelName="rightPanelName"
      :universal-panel-vo="universalPanelVo.right" 
      :equipment-id="currentDeviceId"
      :show-panel="showPanel"
      :show-business-nav="showBusinessNav"
      position="right"
    />
    <!--楼栋标签-->
    <div class="build-tag" v-if="
        controlBuildingShow && areaList.length && globalState.business.currentAreaLeave === 1
      " :class="[
        leftPanelName && showPanel ? 'show' : 'hide',
        showBusinessNav ? '' : 'hide-all-panel',
      ]">
      <BuildTag :area-list="areaList" @change-build="handelClickBuild" :cur-build="curBuild" />
      <VideoPlayerCom />
    </div>
    <!--楼层标签-->
    <div class="floor" v-if="
        controlFloorShow && floorList.length > 0 && globalState.business.currentAreaLeave !== 1
      " :class="[
        leftPanelName && showPanel ? 'show' : 'hide',
        showBusinessNav ? '' : 'hide-all-panel',
      ]">
      <Floor :floors="floorList" @floor-back="floorBack" @changeFloor="changeFloor"></Floor>
    </div>
    <!--业务菜单-->
    <div class="nav" :class="{ show: showBusinessNav, hide: !showBusinessNav }">
      <BusinessNav ref="businessNavRef" @switchNav="switchNav" />
    </div>
    <AlarmModal :visible="alarmModalData.visible" :alarmArr="alarmModalData.realAlarmArr"
      @close-alarm-modal="closeAlarmModal" />
  </div>
</template>
<script setup lang="ts">
import { onMounted, ref, nextTick, reactive, computed } from "vue";
import bus from "@/utils/bus";
import TopHeader from "./components/header/header.vue";
import Floor from "./floor.vue";
import BuildTag from "./build-tag.vue";
import BusinessNav from "./components/business-nav/business-nav.vue";
import { BusinessPanel, DevicePanel, AlarmPanel } from "../components";
import { storeArea } from "@/piniaStore/area";
import { getAreaList, getAreaScenePanelConfig } from "@/api/mdata";
import { AreaType, SceneDataType } from "@/api/models/mdata";
import { getEventVideo } from "@/api/linkage";
import AlarmModal from "./alarm-modal.vue";
import moment from "moment";
import { getAssetsImage } from "@/utils/getImage";
import { useIotSocket } from "@/utils/iotSocket";
import { getBgImg } from "./index";
import { getAlarmDetail } from '@/api/alarm'
import { BasePanelRender } from '@/components/businessPanel/base-panel-render/base-panel-render'
import { useStateStore } from "@/pages/state/use-state-store";
import { CubeMfRootGlobalState } from "@ghcloud/cube-mf-root";

useIotSocket();
const { globalState } = useStateStore()

/** 当前楼栋信息 这个信息传给 UE5 再回传的 */
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
const currentMenuName = ref("");
const currentBuilName = reactive({
  name:'',
  aliasName:''
});
const universalPanelVo = reactive({
  left:{},
  right:{}
})
const bgImage = ref();
const bgPath = ref("");
const piniaStoreArea = storeArea();
const showPanel = ref<boolean>(true);
const showDevicePanel = ref<boolean>(false);
const leftPanel = ref();
const rightPanel = ref();
const leftPanelName = ref();
const rightPanelName = ref();
const time = ref("day");
const devicePanel = ref();
const currentDevice = ref();
const currentDeviceId = ref<string>("");
const curBuild = ref<CurBuild>(); // 当前楼栋的信息（模型）
const businessNavRef = ref();
const topHeader = ref();
const areaList = ref<AreaType[]>([]);
const floorList = ref<any[]>([]);
const alarmModalData = reactive({
  visible: false,
  realAlarmArr: [],
});
const curAlarmDetail = ref<any>(null);
const showBusinessNav = ref(true);
// 控制楼栋显隐
const controlBuildingShow = computed(() => {
  return (window as any).config.buildingLabelFlag;
});
// 控制楼层显隐
const controlFloorShow = computed(() => {
  return (window as any).config.floorLabelFlag;
});
// 切换时间
const setTime = (value): void => {
  time.value = value;
  setBgImage();
};
// 切换背景图片
const setBgImage = () => {
  if (globalState.business.currentAreaLeave === 1 && window.config.bgImgData) {
    bgImage.value =
      time.value === "day" ? window.config.bgImgData.parkDay : window.config.bgImgData.parkNight;
  } else if(window.config.bgImgData){
    bgImage.value =
      time.value === "day"
        ? window.config.bgImgData.buildingDay
        : window.config.bgImgData.buildingNight;
  }
};
// 二维组态通信事件
window.addEventListener("message", (data) => {
  if (data.data.deviced) {
    openDevicePanel(data.data.deviced);
  }
});
onMounted(async () => {
  if (!window.config.bgImgData) {
    const tenantId = CubeMfRootGlobalState.getInstance().mfRootState.authInfo.tenant;
    const name =
    window.config.tenantConfig.find((e) => e.tenant === tenantId)?.name;
    window.config.bgImgData = getBgImg(name);
  }
  await requestAreaList();
  // 获取业务应用列表 （底部的菜单）
  businessNavRef.value.getMenuList();
});

/** 获取区域列表 */
const requestAreaList = async () => {
  const res = await getAreaList();
  if (res.length) {
    globalState.business.currentAreaId = null
    areaList.value = res;
  }
};

/** 楼层组件点击返回 */
const floorBack = (): void => {
  //返回楼栋
  if (globalState.business.currentAreaLeave === 3) {
    globalState.business.currentAreaLeave = 2;
    setBgImage();
  }
  //返回园区
  if (globalState.business.currentAreaLeave === 2) {
    globalState.business.currentAreaId = null;
    globalState.business.currentAreaLeave = 1;
    setBgImage();
  }
  switchBusinessPanel();
};

/** 点击楼层 */
const changeFloor = (data): void => {
  try {
    // 关闭设备面板
    closeModal();
    // 将当前区域级别设置为3级区域
    globalState.business.currentAreaLeave = 3;
    globalState.business.currentAreaId = data.id;
    switchBusinessPanel();
    bgImage.value = getAssetsImage("overView60.png");
    bgPath.value = ''
    if (window.config.configuration2D[currentBuilName.aliasName]) {
      bgPath.value =
        window.config.configuration2D[currentBuilName.aliasName][currentMenuName.value][
          data.name
        ];
    }else if(window.config.configuration2D[currentBuilName.name]){
      bgPath.value =
        window.config.configuration2D[currentBuilName.name][currentMenuName.value][
          data.name
        ];
    } else {
      bgPath.value = window.config.configuration2D[currentMenuName.value][data.name];
    }
  } catch (error) {
  }
};

/** 点击楼栋标签或者模型上的楼栋标签 */
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
  const list = areaList.value;
  let currentBuild = list.find((item) => item.id === e.id);
  floorList.value = currentBuild.children;
};
// 根据区域及业务菜单获取面板
const businessPanel = async () => {
  const res = await getAreaScenePanelConfig({
    areaLeave: globalState.business.currentAreaLeave,
    sceneType: globalState.business.currentMenu,
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
  leftPanel.value = null;
  rightPanel.value = null;
  rightPanelName.value = null
  leftPanelName.value = null
  showPanel.value = false;
  if (showAlarmListPanel.value) {
    switchBusinessPanel()
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
// 切换业务菜单
const switchNav = (item: SceneDataType, lv: number): void => {
  showDevicePanel.value = false;
  if (item) {
    globalState.business.currentMenu = item.id;
    currentMenuName.value = item.name;
    globalState.business.currentAreaId = null
    try {
      if (lv === 1) {
        setTimeout(() => {
          globalState.business.currentAreaLeave = 1;
          setBgImage();
          switchBusinessPanel();
        }, 0);
      } else {
        switchBusinessPanel();
      }
    } catch (error) {}
  }
};

/** 打开设备面板（弹窗)*/
const openDevicePanel = (deviceId: string): void => {
  showDevicePanel.value = false;
  devicePanel.value = "";
  nextTick(() => {
    if (deviceId) {
      currentDeviceId.value = deviceId;
      showDevicePanel.value = true;
      devicePanel.value = DevicePanel["EquipmentDetailPanel"];
    }
  });
};
/** 打开报警详情面板（弹窗） */
const showAlarmDetailPanel = (item) => {
  curAlarmDetail.value = item;
  showDevicePanel.value = true;
  devicePanel.value = AlarmPanel["AlarmDetailPanel"];
};
/**
 * 关闭设备面板
 */
const closeModal = (backViewpoint = false): void => {
  devicePanel.value = "";
  showDevicePanel.value = false;
};
/** 视频弹窗 */
bus.on("switchCamera", (item): void => {
  currentDevice.value = item;
  showDevicePanel.value = true;
  devicePanel.value = DevicePanel["MonitorPanel"];
});
/** 打开设备弹窗并且定位 */
bus.on("openDevicePopup", (record: any): void => {
  openDevicePanel(record.alarmTargetKey);
});
/** 关闭面板（弹窗） */
bus.on("closeDevicePanel", (): void => {
  showDevicePanel.value = false;
  devicePanel.value = "";
});
/** 设备定位 */
bus.on("equipmentPosition", (record: any): void => {
  showAlarmDetailPanel(record);
});
/** 查看报警 */
bus.on(
  "openAlarmModal",
  async (item: any): Promise<void> => {
    // 打开报警弹窗的时候关闭左侧面板
    showAlarmListPanel.value = false;
    rightPanel.value = "";

    showAlarmDetailPanel(item);
  }
);
/** webSocket消息提示 NOTICE_MESSAGE -> ALARM_NOTICE 报警弹窗 由后端主动推送的报警消息 */
bus.on(
  "getEventVideoList",
  async (data: any): Promise<void> => {
    const res = await getEventVideo(data.businessKey);
    const result = await getAlarmDetail(data.businessKey)
    data.alarmSnapshot = result.alarmSnapshot ? result.alarmSnapshot : ""
    data.alarmTime = moment(data.alarmTime).format("YYYY-MM-DD HH:mm:ss");
    alarmModalData.realAlarmArr.push({
      ...data,
      videoArr: res,
    });
    alarmModalData.visible = true;
    // 更新报警数量
    setTimeout(() => {
      topHeader.value.getAlarmCount();
    }, 0);
  }
);
/** 关闭后端主动触发的弹出的报警弹窗 */
const closeAlarmModal = () => {
  alarmModalData.visible = false;
  alarmModalData.realAlarmArr = [];
};
</script>
<style lang="less">
@import url("../style/index.less");

.ant-modal-content {
  background: rgba(4, 17, 32, 0.6) !important;
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

#player,
#configuration {
  position: relative;
  top: 0px;
  left: 0px;
  background-size: cover;
  background-position: center center;
  width: 100%;
  height: 100%;
  position: absolute;
  background: -moz-radial-gradient(circle, #7b9dbe, #112440);
  background: -webkit-gradient(radial,
      center center,
      0,
      center center,
      460,
      from(#7b9dbe),
      to(#112440));
  background: -webkit-radial-gradient(circle, #7b9dbe, #112440);
}

#configuration {
  width: 100%;
  height: 100%;
  position: absolute;
  background: -moz-radial-gradient(circle, #7b9dbe, #112440);
  background: -webkit-gradient(radial,
      center center,
      0,
      center center,
      460,
      from(#7b9dbe),
      to(#112440));
  background: -webkit-radial-gradient(circle, #7b9dbe, #112440);
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
  z-index: 200;
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
  z-index: 200;
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
  z-index: 100;
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

.build-tag {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  z-index: 100;
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

.nav {
  position: absolute;
  bottom: 20px;
  left: 0;
  width: 100%;
  z-index: 99;
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
</style>
