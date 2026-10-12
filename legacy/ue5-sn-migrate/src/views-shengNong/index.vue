<template>
  <div class="view msg-bg" @click="hideModelPanel">

    <GlobeMap ref="globeMapRef" v-if="!hideMap">
      <template #shenzhen-modal>
        <div id="mapModalPanel">
          <SZModalData @removeSZLabel="removeSZLabel"></SZModalData>
        </div>
      </template>
    </GlobeMap>
    <iframe allowfullscreen="true" id="configuration" frameborder="0" scrolling="no" v-if="alarmInfo" v-show="alarmInit" allow="autoplay"
      :src="alarmInfo"></iframe>
    <div class="top-container" :class="'show'" v-if="mapRenderCompleted || showPanel">
      <TopHeader ref="topHeader" @view-alarm-list="viewAlarmList" @switchNav="switchNav"
        @handelAlarmView="handelAlarmView" @tiggleBusinessNav="(val: boolean) => showBusinessNav = val"></TopHeader>
    </div>
    <div class="top-panel" v-if="mapRenderCompleted || showPanel" :class="[showPanel && rightPanel ? 'show' : 'hide']">
      <component :is="alarmPanel" :title="menu"></component>
    </div>
    <div class="device-panel" :class="showDevicePanel ? 'show' : 'hide'">
      <component :is="devicePanel" :id="curentDeviceId" :alarmDetailData="curAlarmDetail" :deviceInfo="curentDevice"
        @close="closeModal" @showBusinessPanel="switchBusinessPanel" @openDevicePanel="openDevicePanel">
      </component>
    </div>
    <div class="left-panel-sn" :class="[showPanel && leftPanel && showBusinessNav ? 'show' : 'hide']">
      <component :is="leftPanel" :equipmentId="curentDeviceId"></component>
    </div>
    <div class="right-panel-sn" :class="[
        showPanel && rightPanel && showBusinessNav ? 'show' : 'hide',
        menu === '综合分析' ? 'compose' : '',
      ]">
      <component :is="rightPanel" :equipmentId="curentDeviceId"></component>
    </div>
    <div class="bottom-panel" :class="[showPanel && midPanel && showBusinessNav ? 'show' : 'hide']">
      <div class="wrap">
        <component :is="midPanel" :equipmentId="curentDeviceId"></component>
      </div>
    </div>
    <AlarmModal :visible="alarmModalData.visible" :alarmArr="alarmModalData.realAlarmArr" :tokenInfo="tokenInfo"
      :snUrl="snUrl" @close-alarm-modal="closeAlarmModal" />
  </div>
  <div v-if="isOneLevel" v-show="alarmInit" class="msg-bg red"><span></span></div>
</template>
<script setup lang="ts">
import {
  onMounted,
  onUnmounted,
  ref,
  nextTick,
  reactive,
  computed,
  provide,
  watch,
} from "vue";
import qs from "qs";
import bus from "@/utils/bus";
import TopHeader from "./header.vue";
import axios from "axios";
import { DevicePanel, AlarmPanel, Comprehensive, MapPanel } from "../components";
import { SceneDataType } from "@/api/models/mdata";
import { getMarketPage } from "@/api/shennong/compre";
import { getMarketConfig } from "@/api/shennong/alarm";
import { getEventVideo, getEventVideoSn } from "@/api/linkage";
import { getTokenOuaa } from "@/api/ouaa";
import AlarmModal from "./alarm-modal1.vue";
import { storeMarket } from "@/piniaStore/other";
import { setPanel } from "./index";
import { getAssetsImage, getSnImage } from "@/utils/getImage";
import ModalData from "./components/modaldata/modal.vue";
import moment from "moment";
import { useWebSocket } from "@/utils/websocket";
import { debounce } from "@/utils/common";
import ChinaMap from "./china-map/china-map.vue";
import GlobeMap from "./globe-map/globe-all/index.vue";
import { storeMenu } from "@/piniaStore/menu";
import { storeArea } from "@/piniaStore/area";
import SZModalData from './components/sz-modal-data/index.vue'
import useEscClose from '@/components/hooks/useEscClose';
import { storeTimeSync } from "@/piniaStore/timeSync";

useWebSocket();
// useWebSocket(`wss://bimops-prod-manage.guhecloud.com:30000/api/message2/websocket/msg`);

/** 当前楼栋信息 这个信息传给 UE5 再回传的 */

const timerId = ref(null);
const piniaStoreMenu = storeMenu();
const alarmInfo = ref();
const alarmInit = ref(false);
const piniaStoreMarket = storeMarket();
const piniaStoreArea = storeArea();
const showPanel = ref<boolean>(false);
const showDevicePanel = ref<boolean>(false);
const leftPanel = ref();
const rightPanel = ref();
const alarmPanel = ref();
const midPanel = ref();
const tokenInfo = ref();
const snUrl = ref("");
const isOneLevel = ref(false);
const storagePanel = reactive({
  leftPanel: "",
  rightPanel: "",
});
const navItem = ref();
const devicePanel = ref();
const curentDevice = ref();
const curentDeviceId = ref<string>("");
const topHeader = ref();
const showBusinessNav = ref(true);

const alarmModalData = reactive({
  visible: false,
  realAlarmArr: [],
});

const curAlarmDetail = ref<any>(null);
window.addEventListener('message', async function (event) {
  if (event.data.type === 'cube-alarm-modal-ready') {
    document.getElementById("configuration")?.contentWindow.postMessage({ type: 'cube-alarm-message', data: JSON.stringify(marketAlarmDetails.value) }, '*')
  }else if (event.data.type === "cube-alarm-modal-completed") {
    alarmInit.value = true
  }
  else if (event.data.type === "cube-alarm-modal-close") {
    alarmInfo.value = "";
    isOneLevel.value = false;
    alarmInit.value = false;
  }
})
const hideMap = import.meta.env.VITE_HIDE_MAP
onMounted(async () => {
  if(hideMap){
    mapRenderCompleted.value = true
    showPanel.value = true
  }
  sessionStorage.removeItem("market-baseUrl");
  sessionStorage.removeItem("market-tenant");
  alarmPanel.value = Comprehensive["AlarmNumPanel"];
  globalEventListener();
});

// 10s之后无操作清除currentMarket
let isHanlderView = false;
let globalEventTimer = null;
const globalEventListener = () => {
  globalEventTimer = setInterval(() => {
    isHanlderView = false;
    document.addEventListener("mousedown", (event) => {
      isHanlderView = true;
      clearInterval(globalEventTimer);
      // hideModelPanel(event)
      globalEventListener();
    });
    document.addEventListener("click", (event) => {
      isHanlderView = true;
      clearInterval(globalEventTimer);
      // hideModelPanel(event)
      globalEventListener();
    });
    if (!isHanlderView) {
      piniaStoreMarket.currentMarket = "";
      piniaStoreMarket.currentMarketTenant = "";
      piniaStoreMarket.currentMarketName = "";
    }
  }, 10000);
};
// 根据区域及业务菜单获取面板
const businessPanel = async () => {
  const res = setPanel(navItem.value.name);
  const isHomePage = menu.value === "" || menu.value === "综合分析";
  if (isHomePage && mapRenderCompleted.value) {
    showPanel.value = true;
    leftPanel.value = Comprehensive[res.left];
    rightPanel.value = Comprehensive[res.right];
    midPanel.value = Comprehensive[res.mid];
    alarmPanel.value = Comprehensive['ComprehensiveTop'];
  } else {
    setTimeout(() => {
      showPanel.value = true;
      leftPanel.value = Comprehensive[res.left];
      rightPanel.value = Comprehensive[res.right];
      midPanel.value = Comprehensive[res.mid];
    }, 200);
  }
};
// 切换面板
const switchBusinessPanel = (): void => {
  leftPanel.value = "";
  rightPanel.value = "";
  midPanel.value = "";
  showPanel.value = false;
  alarmPanel.value = Comprehensive["AlarmNumPanel"];
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
    rightPanel.value = AlarmPanel["AlarmListPanelSn"];
    showAlarmListPanel.value = true;
  }, 200);
};
// 切换业务菜单
const menu = ref("");
const globeMapRef = ref(null);
const removeSZLabel =()=>{
  globeMapRef.value && globeMapRef.value.hideSZLabelView();
}
const piniaStoreTimeSync = storeTimeSync();
const switchNav = (item: SceneDataType, lv: number): void => {
  piniaStoreMenu.currentMenu = item.name;
  if (item) {
    menu.value = item.name;
    showDevicePanel.value = false;
    navItem.value = item;

    switchBusinessPanel();
  }
  piniaStoreMarket.currentMarket = "";
  piniaStoreMarket.currentMarketTenant = "";
  piniaStoreMarket.currentMarketName = "";
  piniaStoreTimeSync.setCurrentMenuPage(item.type);
};

/** 打开设备面板（弹窗)*/
const openDevicePanel = (deviceId: string): void => {
  showDevicePanel.value = false;
  devicePanel.value = "";
  nextTick(() => {
    if (deviceId) {
      curentDeviceId.value = deviceId;
      showDevicePanel.value = true;
      devicePanel.value = DevicePanel["EquipmentDetailPanel"];
    }
  });
};
/** 打开报警详情面板（弹窗） */
const showAlarmDetailPanel = (item) => {
  curAlarmDetail.value = item;
  showDevicePanel.value = true;
  devicePanel.value = AlarmPanel["AlarmDetailPanelSn"];
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
  curentDevice.value = item;
  showDevicePanel.value = true;
  devicePanel.value = DevicePanel["MonitorPanel"];
});
const mouse = ref({
  x: 0,
  y: 0,
});
const modaldata = reactive({
  title: "综合分析",
  list: [],
});
const showModal = ref(false);
const lableIsSZ = ref(false);
const labelUserData = ref();
const showMapLabelPanel = () => {
  if (!lableIsSZ.value) {
    globeMapRef.value && globeMapRef.value.showLabelView(labelUserData.value);
  } else {
    globeMapRef.value && globeMapRef.value.showSZLabelView(labelUserData.value);
  }
};
const showModalPanel = (userData: any, isSZ = false): {marketTenant:string;status:string;} => {
  const hoverMarket = getHoverMarket(userData.name, isSZ);
  Object.assign(modaldata, {
    title: menu.value,
    panel: userData.name,
    total: 30,
    list: [],
    marketTenant: hoverMarket?.marketTenant || "",
    status: hoverMarket?.isOpen || hoverMarket?.status || "",
  });
  showModal.value = true;
  labelUserData.value = userData;
  lableIsSZ.value = isSZ;
  isSZ && showMapLabelPanel()
  return hoverMarket || "";
};
const hideModelPanel = (event: any) => {
  if (
    !["globe-map-canvas"].includes(event.target.className) &&
    !["globe-map-canvas"].includes(event.srcElement?.parentNode.className)
  ) {
    handleState.value = "";
    showModal.value = false;
    globeMapRef.value && globeMapRef.value.hideLabelView();
    globeMapRef.value && globeMapRef.value.hideSZLabelView();
  }
};
const getHoverMarket = (name: string = "", isSZ = false) => {
  const mapData = isSZ
    ? [...piniaStoreArea?.marketDataSZ]
    : [...piniaStoreArea?.marketDataCN, ...piniaStoreArea?.marketDataSZ];
  const currentMarket = mapData.filter((m) => m.name === name)[0];
  return currentMarket?.data;
};

declare type HandleState = "MOUSE_OVER" | "MOUSE_OUT" | "CLICK" | "SZCLICK" | "";
const handleState = ref<HandleState>("");
bus.on("chinaMapLabelClick", (userData:{name:string}) => {
  const market = showModalPanel(userData);
  handleState.value = "CLICK";
  piniaStoreMarket.currentMarketTenant = market?.marketTenant || '';
  piniaStoreMarket.currentMarketName = userData?.name || '';
  globalEventTimer && clearInterval(globalEventTimer);
});
bus.on("chinaMapLabelMouseover", (userData) => {
  handleState.value = "MOUSE_OVER";
  // showModalPanel(userData);
});
bus.on("szMapLabelClick", (userData:{name:string}) => {
  const market = showModalPanel(userData, true);
  handleState.value = "SZCLICK";
  piniaStoreMarket.currentMarketTenant = market?.marketTenant;
  piniaStoreMarket.currentMarketName = userData.name;
  globalEventTimer && clearInterval(globalEventTimer);
});
bus.on("szMapLabelMouseover", (userData) => {
  handleState.value = "MOUSE_OVER";
  // showModalPanel(userData, true);
});
const mapRenderCompleted = ref(false);
bus.on("mapRenderCompleted", () => {
  setTimeout(() => {
    mapRenderCompleted.value = true;
  }, 4000);
});
bus.on("mapDrillDown", () => {
  handleState.value = "";
  showModal.value = false;
  globeMapRef.value && globeMapRef.value.hideLabelView();
  // globeMapRef.value && globeMapRef.value.hideSZLabelView()
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
const marketAlarmDetails = ref()
/** webSocket消息提示 NOTICE_MESSAGE -> ALARM_NOTICE 报警弹窗 由后端主动推送的报警消息 */
bus.on(
  "getEventVideoList",
  async (data: any): Promise<void> => {
    if (!data.marketTenant) {
      return;
    }
    marketAlarmDetails.value = data;
    if (data.alarmLevelCode === "one_level") {
      isOneLevel.value = true;
    } else {
      isOneLevel.value = false;
    }
    const res = await getMarketConfig(data.marketTenant);
    marketAlarmDetails.value.applicationName = res.marketName
    alarmInfo.value = `${res.url}/apps/@ghcloud/cube-alarm-modal?client_id=${res.account}&client_secret=${res.password}&businessKey=${data.businessKey}`
    // alarmInfo.value = `http://localhost:8888/apps/@ghcloud/cube-alarm-modal?client_id=${res.account}&client_secret=${res.password}&businessKey=${data.businessKey}`
  }
);
/** 关闭后端主动触发的弹出的报警弹窗 */
const closeAlarmModal = () => {
  alarmModalData.visible = false;
  alarmModalData.realAlarmArr = [];
};
useEscClose(() => {
  if (alarmModalData.visible) {
    closeAlarmModal();
  }
});
// 明火报警
const handelAlarmView = () => {
  alarmModalData.visible = true;
  if (alarmModalData.realAlarmArr.length > 0) return;
  alarmModalData.realAlarmArr = [
    {
      alarmLevelCode: "one_level",
      alarmLevelName: "三级",
      alarmTypeName: "安防监控",
      alarmTargetCode: "EMERGENCY_ALARM",
      alarmTargetName: "海鲜大楼001",
      alarmTargetTypeName: "",
      alarmTime: "2023-09-15 15:08:04",
      area: "",
      areaName: "海鲜交易区",
      alarmEventName: "电气起火报警",
      alarmStatus: "",
      alarmStatusNameg: "",
      videoArr: [
        {
          id: "",
          eventId: "",
          deviceId: "",
          deviceCode: "",
          deviceName: "海鲜大楼001",
          token: "",
        },
      ],
    },
  ];
};
// onUnmounted(() => {
//   globalEventTimer && clearInterval(globalEventTimer)
//   document.removeEventListener("mousedown")
//   document.removeEventListener("click")
// });
</script>
<style lang="less">
@import url("../style/index.less");

.borderimage {
  position: absolute;
  z-index: 1002;
  width: 400px;
  // border: 50px solid yellowgreen;
  background-image: url(/resource/v1/ue5-sn-migrate/assets/images/sn/bk.png);
  background-repeat: no-repeat;
  background-size: 100% 100%;

  overflow: hidden;
  padding: 15px;
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
  background-image: url("/resource/v1/ue5-sn/bgc.png");
  background-repeat: no-repeat;
  background-position: 50% 50%;
  background-size: 100vw 100vh;
  left: 0;
}

#player,
#configuration {
  position: relative;
  top: 0px;
  left: 0px;
  background-size: cover;
  background-position: center center;
}

#configuration {
  width: 498PX;
  height: 548PX;
  z-index: 10000;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

#modelContainer {
  overflow: hidden;
}
</style>
<style lang="less" scoped>
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
          rgba(244, 32, 32, 0.3098) 0%,
          rgba(244, 32, 32, 0) 100%);
    }

    &::before {
      right: 0;
      z-index: 100;
      background: linear-gradient(270deg,
          rgba(244, 32, 32, 0.3098) 0%,
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

.left-panel-sn {
  position: absolute;
  top: 76px;
  z-index: 99;
  width: 460px;
  height: calc(100vh - 84px);
  overflow: hidden;
  transition: all 1s ease;
  box-sizing: border-box;
  padding: 0px 0 0 12px;

  &::after {
    position: absolute;
    top: 0;
    left: 0;
    width: 380px;
    height: 100%;
    content: "";
    background: rgba(11, 21, 33, 0.05);
    z-index: -1;
  }

  &.show {
    background: linear-gradient(to right,
        rgba(2, 16, 30, 0.94),
        rgba(2, 16, 30, 0.5),
        rgba(4, 20, 39, 0));
    left: 0;
    opacity: 1;
  }

  &.hide {
    left: -500px;
    opacity: 0;
  }
}

.right-panel-sn {
  position: absolute;
  top: 76px;
  z-index: 99;
  width: 460px;
  height: calc(100vh - 84px);
  overflow: hidden;
  transition: all 1s ease;
  box-sizing: border-box;
  padding: 0px 12px 0 0;

  &::after {
    position: absolute;
    top: 0;
    right: 0;
    width: 380px;
    height: 100%;
    content: "";
    background: rgba(11, 21, 33, 0.05);
    z-index: -1;
  }

  &.show {
    background: linear-gradient(to left,
        rgba(2, 16, 30, 0.94),
        rgba(2, 16, 30, 0.5),
        rgba(4, 20, 39, 0));
    right: 0;
    opacity: 1;
  }

  &.hide {
    right: -500px;
    opacity: 0;
  }

  &.compose {
    // width: 660px;
  }
}

.bottom-panel {

  // height:600px;
  .wrap {
    display: inline-block;
    width: 100%;
    position: relative;

    &::before {
      display: inline-block;
      content: "";
      width: 100vw;
      height: 400px;
      position: absolute;
      top: 0;
      left: 50%;
      transform: translate(-50%);
      background: linear-gradient(to bottom,
          rgba(2, 16, 30, 0),
          rgba(4, 20, 39, 0.75),
          rgba(0, 0, 0, 0.95));
    }
  }

  width: 1000px;
  height: 274px;
  position: absolute;
  z-index: 98;
  background-color: transparent;
  left: 50%;
  transform: translate(-50%);
  // margin-bottom: 10px;

  &.show {
    bottom: 0;
    opacity: 1;
  }

  &.hide {
    bottom: -264px;
    opacity: 0;
  }
}

.top-panel {
  width: 1000px;
  position: absolute;
  top: 120px;
  z-index: 99;
  // background-color: rgba(2, 16, 30, 0.1);
  left: 480px;

  :deep(.gh-count-to) {
    font-weight: bold !important;
  }

  // transform: translate(-50%);
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

.loadPage {
  background: #ffffff;
  background-image: url("/resource/v1/ue5-sn/bgc.png");
  width: 100%;
  height: 100%;
  position: relative;
  top: 0px;
  left: 0px;
  z-index: 99;

  .progressBar {
    position: absolute;
    width: 100%;
    bottom: 50px;
    padding: 0 30px;

    .loadText {
      text-align: center;
      color: #fff;
      font-size: 20px;
      font-weight: bold;
      font-family: "sourceMedium";
    }

    :deep(.ant-progress-text) {
      color: #ffffff;
    }
  }
}
</style>
