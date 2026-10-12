<template>
  <div style="width: 100%;height: 100%;">
    <div class="view">
      <div id='player'></div>
      <div>
        <div class="top-container" :class="'show'">
          <TopHeader ref="topHeader" @set-weather="setWeather" @set-time="setTime" @view-alarm-list="viewAlarmList"
            @tiggleBusinessNav="(val: boolean) => showBusinessNav = val" @init-camera-view="changeCameraView"
            @set-time-type="setTimeType" :camera-options="cameraOptions" @changWebGlRoam="startRoaming"
            @roamingEvent="startRoamingInspect"></TopHeader>
        </div>
        <div class="device-panel" :class="showDevicePanel ? 'show' : 'hide'">
          <component :is="devicePanel" :id="currentDeviceId" :alarmDetailData="curAlarmDetail"
            :deviceInfo="currentDevice" @close="closeModal" @showBusinessPanel="switchBusinessPanel"
            @openDevicePanel="openDevicePanel">
          </component>
        </div>
        <BasePanelRender :panelName="leftPanelName" :universal-panel-vo="universalPanelVo.left"
          :equipment-id="currentDeviceId" :show-panel="showPanel&&!roamShow" :show-business-nav="showBusinessNav"
          position="left" />
        <BasePanelRender :panelName="rightPanelName" :universal-panel-vo="universalPanelVo.right"
          :equipment-id="currentDeviceId" :show-panel="showPanel&&!roamShow" :show-business-nav="showBusinessNav"
          position="right" />
        <!--楼栋标签-->
        <div class="build-tag"
          v-if="controlBuildingShow && areaList.length && piniaStoreArea.currentAreaLeave === 1 && !roamShow"
          :class="[leftPanelName && showPanel ? 'show' : 'hide',showBusinessNav ? '' : 'hide-all-panel']">
          <BuildTag :area-list="areaList" @change-build="handelClickBuild" :cur-build="curBuild" />
          <VideoPlayerCom />
        </div>
        <!--楼层标签-->
        <div class="floor"
          v-if="controlFloorShow && floorList.length > 0 && piniaStoreArea.currentAreaLeave !== 1 && !roamShow && functionalAreaList.length === 0"
          :class="[
          leftPanelName && showPanel ? 'show' : 'hide',
          showBusinessNav ? '' : 'hide-all-panel',
        ]">
          <Floor :selected-floor="selectedFloor" :floors="floorList" @floor-back="floorBack" @changeFloor="changeFloor">
          </Floor>
        </div>
        <!--区域标签-->
        <div class="floor" v-if="
            controlFloorShow && (piniaStoreArea.currentAreaLeave === 3||
            piniaStoreArea.currentAreaLeave === 4) && functionalAreaList.length > 0" :class="[
            leftPanelName && showPanel ? 'show' : 'hide',
            showBusinessNav ? '' : 'hide-all-panel',
          ]">
          <FunctionalArea :curBuild="functionalCurBuild" :floors="functionalAreaList" @floor-back="areaBack"
            @changeFloor="changeArea"></FunctionalArea>
        </div>
        <div class="roaming-tag" v-if="roamShow">
          <roamingPoint @stopRoamInspect="stopRoamInspect" @pause-roam-inspect="pauseRoamInspect"
            @change-roam-inspect="startRoamingInspect" :point="roamingPointData" :point-item="roamingPointSelect">
          </roamingPoint>
        </div>
        <!--业务菜单-->
        <div class="nav" v-show="!roamShow" :class="{ show: showBusinessNav, hide: !showBusinessNav }">
          <BusinessNav ref="businessNavRef" @initNav="initNav" @switchNav="switchNav" />
        </div>
        <AlarmModal :visible="alarmModalData.visible" :alarmArr="alarmModalData.realAlarmArr"
          @close-alarm-modal="closeAlarmModal" />
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { onMounted, ref, nextTick, reactive, computed } from "vue";
import bus from "@/utils/bus";
import TopHeader from "./components/header/header.vue";
import Floor from "./floor.vue";
import BuildTag from "./build-tag.vue";
import FunctionalArea from '../views/functional-area.vue'
import BusinessNav from "./components/business-nav/business-nav.vue";
import roamingPoint from "./components/roaming-point/roaming-point.vue";
import { BusinessPanel, DevicePanel, AlarmPanel } from "../components";
import { storeArea } from "@/piniaStore/area";
import {colorEnum} from './index'
import { storeMenu } from "@/piniaStore/menu";
import { getAreaDetails, getAreaList, getAreaScenePanelConfig } from "@/api/mdata";
import { AreaType, SceneDataType } from "@/api/models/mdata";
import { getEventVideo } from "@/api/linkage";
import { getDeviceListBuyScene } from "@/api/device";
import AlarmModal from "./alarm-modal.vue";
import moment from "moment";
import { getDeviceIcon } from "@/utils/getImage";
import { GhyThree } from '@ghcloud/cube-visual-sdk'
import { useIotSocket } from "@/utils/iotSocket";
import { DeviceIcon } from '@/utils/enumeratie'
import { message } from 'ant-design-vue'
import { BasePanelRender } from '@/components/businessPanel/base-panel-render/base-panel-render'
const globalAreaId = '1111111'
useIotSocket()
/** 当前楼栋信息 这个信息传给 UE5 再回传的 */
interface CurBuild {
  backgroundFlie: string;
  id: string;
  actorId: string;
  aliasName: string;
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
const currentBuildName = ref("");
let threeInstance:GhyThree|null=null
const universalPanelVo = reactive({
  left:{},
  right:{}
})
const piniaStoreArea = storeArea();
const piniaStoreMenu = storeMenu();
const roamShow = ref<boolean>(false);
const showPanel = ref<boolean>(true);
const showDevicePanel = ref<boolean>(false);
const functionalCurBuild = ref<CurBuild>(); // 当前区域的信息（模型）
const leftPanel = ref();
const rightPanel = ref();
const storagePanel = reactive({
  leftPanel: "",
  rightPanel: "",
});
const leftPanelName = ref();
const rightPanelName = ref();
const time = ref("day");
const devicePanel = ref();
const currentDevice = ref();
const functionalAreaList = ref<any[]>([]);
let currentModelPath=''
const firstModal={
  path:'',
  viewAngle:null
}
const currentDeviceId = ref<string>("");
const curBuild = ref<CurBuild>(); // 当前楼栋的信息（模型）
const businessNavRef = ref();
const floorRef = ref();
const topHeader = ref();
const areaList = ref<AreaType[]>([]);
const floorList = ref<any[]>([]);
const deviceList=ref([])
const selectedFloor=ref(null)
const roamingPointData = ref(); 
const roamingPointSelect = ref(); 
const  openRoaming= ref(false)
// 点击标签聚焦大门
const handleClickLabel=(item:Record<string,string>)=>{
  threeInstance.focusOnObjectByName(item.code)
  openDevicePanel(item.id)
}
const changeCameraView=(value)=>{
  threeInstance.moveCamera(JSON.parse(value))
}
const setTimeType=(type)=>{
}
const startRoaming=async (item:any)=>{
  if(item.value){
    if(piniaStoreArea.currentAreaLeave !== 1){
      await backToLevelOne()
    }
    threeInstance.startRotate()
    roamShow.value=true
  }else{
    threeInstance.endRotateInitCamera()
    roamShow.value=false
  }
}
const alarmModalData = reactive({
  visible: false,
  realAlarmArr: [],
});
const curAlarmDetail = ref<any>(null);
const showBusinessNav = ref(true);
const cameraOptions= ref([])
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
  threeInstance.updateLight(value)
};
onMounted(async () => {
  // 获取业务应用列表 （底部的菜单）
  await requestAreaList();
  await businessNavRef.value.getMenuList();
  initThreeModel()
});
// 初始化模型
const initThreeModel=async ()=>{
  const option = {
    elementId:'player',
    enabledMouseControl:true,
    enabledControlRange:true
  }
  threeInstance = new GhyThree(option)
  const imagePath = getBackgroundImage()
  if(imagePath){
    threeInstance.setModelBackground(imagePath,async ()=>{
      const defaultVisualAngle= getDefaultVisualAngle()
      cameraOptions.value=getParkAngle()
      const modelPath =getModelPath() 
      currentModelPath=modelPath
      await threeInstance.initModel(modelPath,defaultVisualAngle)
      firstModal.path=modelPath
      firstModal.viewAngle=defaultVisualAngle
      await getDeviceList() 
      await initBuildingLabels()
    })
  }else {
    const defaultVisualAngle= getDefaultVisualAngle()
    cameraOptions.value=getParkAngle()
    const modelPath =getModelPath() 
    currentModelPath=modelPath
    await threeInstance.initModel(modelPath,defaultVisualAngle)
    firstModal.path=modelPath
    firstModal.viewAngle=defaultVisualAngle
    await getDeviceList() 
    await initBuildingLabels()
  }
}
// 初始化建筑标签
const initBuildingLabels=async ()=>{
  const areaLabelList=window.config.webglConfig.areaLabelList
  if(!areaLabelList) return;
  // 园区
  if(piniaStoreArea.currentAreaLeave===1){
    const parkLabel=areaLabelList.filter(item=>item.areaName==='园区')
    const areaListIds=areaList.value.map(item=>item.id)
    const buildLabel=areaLabelList.filter(item=>areaListIds.includes(item.areaId))
    const areaLabels=[...parkLabel,...buildLabel]
    const object={
      name:(areaDetail)=>{
        return areaDetail.name
      },
      details:(areaDetail)=>{
        return areaDetail.areaExtend? areaDetail.areaExtend.introduce : ''
      },
    }
    for (const item of areaList.value) {
      addLabel({
        ...item,
        labelConfig:{
          labelColor:4,
          title:item.name,
          color:'rgb(24, 144, 255)',
        }
      },'addTextLabel')
    }
    return;
    const labels=areaLabels.map(async (item)=>{
      if(item.labelConfig.infoType!=='default'){
        return item
      }else{
        const areaDetail=await getAreaDetails(item.areaId)
        return {
         ...item,
          labelConfig:{
           ...item.labelConfig,
            title:item.labelConfig.title? object[item.labelConfig.title](areaDetail):'',
            detail:item.labelConfig.detail? object[item.labelConfig.detail](areaDetail):'',
            image:areaDetail.areaExtend? areaDetail.areaExtend.pictureFiles[0]? areaDetail.areaExtend.pictureFiles[0].path : '' : ''
          }
        }
      }
    })
    const result=await Promise.all(labels)
    for (const item of result) {
      try {
        item.labelConfig.type==='cardLabel'?   addLabel(item,'addCardLabel') : addLabel(item,'addTextLabel')
      } catch (error) {
      }
    }
  }
}
// 新增标签
const addLabel=(item,labelType)=>{
  const labelConfig = item.labelConfig;
  const color = colorEnum[labelConfig.labelColor];
  const title = labelConfig.title; // 使用模板字符串，如果需要插入变量
  const image = labelConfig.image;
  const detail = labelConfig.detail;
  const location = labelConfig.location ? JSON.parse(labelConfig.location) : null;

  const baseOptions = {
    backgroundColor: color,
    title: title,
    interactive: item.interactiveType
  };
  const cardOptions={
   ...baseOptions,
    image: image,
    detail: detail,
  }

  const cameraConfig = getVisualAngleByBuildingId(item.areaId);

  if (location) {
    labelType==='addCardLabel'?  threeInstance[labelType]({
      ...cardOptions,
      location: location
    }):threeInstance[labelType]({
      ...baseOptions,
      location: location
    });
  } else {
    labelType==='addCardLabel'?  threeInstance[labelType]({
      ...cardOptions,
    }, {
      name: item.aliasName,
      cameraConfig: cameraConfig,
      callback: () => {
        if(piniaStoreArea.currentAreaLeave=== 1){
          const build=areaList.value.find(item=>item.id===item.id)
          handelClickBuild(build)
        }
        
      }

    }):threeInstance[labelType]({
      ...baseOptions,
    },{
      name: item.aliasName,
      cameraConfig: cameraConfig,
      callback: () => {
        if(piniaStoreArea.currentAreaLeave=== 1){
          const build=areaList.value.find(item=>item.id===item.id)
          handelClickBuild(build)
        }
      }
    });
  }

}
const getBackgroundImage = (id?:string) => {
  if(!id){
    const image=window.config.webglConfig.scene.background.images.find(item=>item.area.map(areaItem=>areaItem.id).includes(globalAreaId))
    return image ? image.url : ''
  }
  const image=window.config.webglConfig.scene.background.images.find(item=>item.area.map(areaItem=>areaItem.id).includes(id))
  return image? image.url : ''
}

const getModelPath=(id?:string)=>{
  try {
    // 只配置了一个模型就只取第一个
    if(window.config.webglConfig.modelServer.length===1){
      return window.config.webglConfig.modelServer[0].url
    }
    if(!id){
      const modelServer = window.config.webglConfig.modelServer.find(item=>item.area.includes(globalAreaId))
      return modelServer? modelServer.url:''
    }
    const currentModel=window.config.webglConfig.modelServer.find((item)=>item.area.includes(id))
    if(!currentModel){
      throw new Error('模型不存在')
    }
    return currentModel.url
  } catch (error) {
    message.warn('未配置模型或模型配置未找到')
  }
}
// 改变楼栋切换模型
const changeModel = async (build,callback)=>{
  const modelPath = getModelPath(build.id)
  const getImageUrl = getBackgroundImage(build.id)
  if(!modelPath) return;
  threeInstance.clearAllLabel()
  const visualAngle = getVisualAngleByBuildingId(build.id)
  if(currentModelPath===modelPath){
    visualAngle&& threeInstance.moveCamera(visualAngle)
    callback&&callback()
    return;
  };
  if(getImageUrl){
   threeInstance.setModelBackground(getImageUrl,async ()=>{
    cameraOptions.value=getParkAngle()
    await threeInstance.changeModel(modelPath,visualAngle)
    currentModelPath=modelPath
    callback&&callback()
   })
  }else{
    threeInstance.clearAllLabel()
    cameraOptions.value=getParkAngle()
    await threeInstance.changeModel(modelPath,visualAngle)
    currentModelPath=modelPath
    callback&&callback()
  }
}
// 获取默认视角
const getDefaultVisualAngle=()=>{
  try {
    const defaultVisualConfig = window.config.webglConfig.modelPerspective.find(item=>item.isDefault==='default'||item.label==='默认')
    if(defaultVisualConfig){
      return JSON.parse(defaultVisualConfig.value)
    }
    return null
  } catch (error) {
    return null
  }
}
// 获取配置的楼栋默认视角
const getVisualAngleByBuildingId=(id:string)=>{
  try {
    const visualAngle=window.config.webglConfig.perspective.find(item=>item.areaId===id)
  if(visualAngle){
    return JSON.parse(visualAngle.value || visualAngle.camera)
  }
  return null
  } catch (error) {
   return null
  }
}
const getVisualAngleByCurrentArea=(id:string)=>{
  const visualAngle=window.config.webglConfig.perspective.filter(item=>item.areaId===id)
  return visualAngle
}
const getParkAngle=()=>{
  return window.config.webglConfig.modelPerspective||[]
}
// 
/** 获取区域列表 */
const requestAreaList = async () => {
  const res = await getAreaList();
  if (res.length) {
    piniaStoreArea.currentAreaId = null;
    areaList.value = res;
  }
};

const initParkModel=async ()=>{
  piniaStoreArea.currentAreaLeave = 1;
  piniaStoreArea.currentAreaId = null;
  piniaStoreArea.currentFloor = null;
    selectedFloor.value=null
    const modelUrl = getModelPath() 
    threeInstance.resetFloor()
    const visualAngle = getDefaultVisualAngle()
    cameraOptions.value=getParkAngle()
    if(modelUrl){
      await threeInstance.changeModel(modelUrl,visualAngle)
      currentModelPath=modelUrl
    }else{
      await threeInstance.changeModel('https://bimops-dev-manage.guhecloud.com:30000/resource/webGL/shell.glb',visualAngle)
    }
    await getDeviceList()
    await initBuildingLabels()
    curBuild.value=null
}
const backToLevelOne = async ()=>{
  deviceList.value=[]
  threeInstance.resetFloor()
  piniaStoreArea.currentAreaLeave = 1;
  selectedFloor.value=null
  const modelUrl = getModelPath() 
  const visualAngle = getDefaultVisualAngle()
  cameraOptions.value=getParkAngle()
  if(modelUrl){
    await threeInstance.changeModel(modelUrl,visualAngle)
    currentModelPath=modelUrl
  }
  await initBuildingLabels()
  curBuild.value=null
  switchBusinessPanel();  
}

/** 点击楼层 */
const changeFloor =async (data)=> {
  // 关闭设备面板
  closeModal()
  functionalAreaList.value = data.children
  piniaStoreArea.currentAreaId = data.id
  piniaStoreArea.currentFloor = data
  const itemIndex = floorList.value.findIndex((item)=>item.id===data.id)
  changeModel(data,async ()=>{
    threeInstance.clearAllLabel()
    const floorNameList = floorList.value.slice(itemIndex+1).map(item=>item.aliasName)
    await threeInstance.animationShowFloor(currentBuildName.value,floorNameList)
    cameraOptions.value= getVisualAngleByCurrentArea(data.id)
    piniaStoreArea.currentAreaLeave = 3;
    selectedFloor.value = data
    await getDeviceList()
  })  
};

/** 点击区域 */
const changeArea = (e): void => {

  const visualAngle = getVisualAngleByBuildingId(e.selectedFloor.id)
  threeInstance.moveCamera(visualAngle)
  // TODO 视角设置
  closeModal();
  // 将当前区域级别设置为4级
  piniaStoreArea.currentAreaLeave = 4;
  piniaStoreArea.currentAreaId = e.selectedFloor.id;
  switchBusinessPanel();
}

/** 楼层组件点击返回 */
const floorBack =async () => {
  deviceList.value=[]
  threeInstance.resetFloor()
  //返回楼栋
  if (piniaStoreArea.currentAreaLeave === 3) {
    handelClickBuild(curBuild.value)
    return
  }
  //返回园区
  if (piniaStoreArea.currentAreaLeave === 2) {
    piniaStoreArea.currentAreaLeave = 1;
    curBuild.value=null
    await initParkModel()
    return
  }
  switchBusinessPanel();
};
/** 四级区域点击返回 */
const areaBack = (): void => {
  if (piniaStoreArea.currentAreaLeave === 4) {
    const parentId = functionalAreaList.value.find(e=>e.id===piniaStoreArea.currentAreaId)?.parentId
    const findFloor = floorList.value.find(e=>e.id===parentId)
    functionalAreaList.value.length = 0
    findFloor && changeFloor(findFloor)
  }else if (piniaStoreArea.currentAreaLeave === 3) {
    functionalAreaList.value = []
    floorBack()
  }
}

// 获取设备列表
const getDeviceList=async ()=>{
  const params={
    sceneType:piniaStoreMenu.currentMenu,
    areaId:piniaStoreArea.currentAreaId,
    pageSize:1000,
  }
  const result = await getDeviceListBuyScene(params)
  if(!piniaStoreArea.currentAreaId){
    deviceList.value=result.records.filter(item=>{
      return item.area===null
    }).map(item=>{
      return {
        ...item,
        deviceIcon:DeviceIcon[item.prodCategory.name]
      }
    })
  }else{
    deviceList.value=result.records.filter(item=>{
      return item.area.id===piniaStoreArea.currentAreaId
    }).map(item=>{
      return {
        ...item,
        deviceIcon:DeviceIcon[item.prodCategory.name]
      }
    })
  }
  nextTick(()=>{
    deviceList.value.forEach(item=>{
      try {
        const dom=createDeviceIconElement(item)
        threeInstance.addLabelByObjectName(dom,item.code)
      } catch (error) {
      }
    })
  })
}
const createDeviceIconElement=(item)=>{
  const container=document.createElement('div')
  container.id=`label-${item.id}`
  container.style.cursor='pointer'
  container.style['pointer-events']='auto'
  container.onclick=()=>{
    handleClickLabel(item)
   }
  const dom=document.createElement('div')
  dom.className='label'
  const img=document.createElement('img')
  img.src=getDeviceIcon(item.deviceIcon)
  img.alt=''
  dom.appendChild(img)
  container.appendChild(dom)
  return container      
}
const setWeather = (value): void => {
  const weatherFunMap=new Map([
    ['Rain',threeInstance.startRain],
    ['Snow',threeInstance.startSnow],
    ['Foggy',threeInstance.startFog],
    ['Cloudy',threeInstance.setDuskLight],
    ['Sunny',threeInstance.setSunny],
  ])
  if(weatherFunMap.has(value)){
    weatherFunMap.get(value).bind(threeInstance)()
    return;
  }
};

/** 点击楼栋标签或者模型上的楼栋标签 */
const handelClickBuild = (e): void => {
  let currentBuild = areaList.value.find((item) => item.id === e.id);
  if(currentBuild.children.length){
    floorList.value = currentBuild.children;
    piniaStoreArea.currentAreaLeave = 2;
  }
  cameraOptions.value= getVisualAngleByCurrentArea(e.id)
  changeModel(e,()=>{})
  currentBuildName.value = e.aliasName;
  closeModal();
  switchBusinessPanel();

  if (piniaStoreArea.currentAreaLeave === 1) {
    piniaStoreArea.currentAreaLeave = 2;
  }else if (piniaStoreArea.currentAreaLeave === 3) {
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

  curBuild.value = e
  piniaStoreArea.currentFloor = null;
  piniaStoreArea.currentAreaId = e.id;
  selectedFloor.value = null
};

// 根据区域及业务菜单获取面板
const businessPanel = async () => {
  const res = await getAreaScenePanelConfig({
    areaLeave: piniaStoreArea.currentAreaLeave,
    sceneType: piniaStoreMenu.currentMenu,
  });
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
// 切换业务菜单
const switchNav = (item: SceneDataType, lv: number): void => {
  showDevicePanel.value = false;
  if (item) {
    piniaStoreMenu.currentMenu = item.id;
    currentMenuName.value = item.name;
    try {
      if (lv === 1) {
        nextTick(async () =>{
          await initParkModel()
          switchBusinessPanel();
        })
      } else {
        switchBusinessPanel();
      }
    } catch (error) {
    }
  }
};
const initNav=(item: SceneDataType, lv: number): void => {
  showDevicePanel.value = false;
  if (item) {
    piniaStoreMenu.currentMenu = item.id;
    currentMenuName.value = item.name;
    try {
      if (lv === 1) {
        setTimeout(async () => {
          piniaStoreArea.currentAreaLeave = 1;
          switchBusinessPanel();
        }, 0);

      } else {
        switchBusinessPanel();
      }
    } catch (error) {
    }
  }
};

/** 打开设备面板（弹窗)*/
const openDevicePanel =async (deviceId: string,alarmData?:any) => {
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
const focusDeviceAddEffect=async (alarmData,deviceId)=>{
     const nameKeywordForType={
      '烟雾':'smoke',
      '火焰':'fire'
     }
     let type='fire'
     Object.keys(nameKeywordForType).forEach(key=>{
      if(alarmData.alarmEventName.includes(key)){
        type=nameKeywordForType[key]
      }
     })
    // 为园区级别设备
    if(!alarmData.area){
      const modelPath=  getModelPath()
      const defaultVisualAngle = getDefaultVisualAngle()
      
      if(currentModelPath===modelPath){
        const device=deviceList.value.find(item=>item.id===deviceId)
        threeInstance.focusOnObjectByName(device.code)
        piniaStoreArea.currentAreaLeave = 1;
        threeInstance.addEffectByObjectName(type as 'fire' | 'smoke',device.code)
      }else{
        currentModelPath=modelPath
        await threeInstance.changeModel(modelPath,defaultVisualAngle)
        piniaStoreArea.currentAreaId = null;
        piniaStoreArea.currentAreaLeave = 1;
        await getDeviceList()
        await initBuildingLabels()
        const device=deviceList.value.find(item=>item.id===deviceId)
        threeInstance.focusOnObjectByName(device.code)
        threeInstance.addEffectByObjectName(type as 'fire' | 'smoke',device.code)
        curBuild.value=null
      }
      return
    }
    const currentAreaId=alarmData.area.split('-').at(-1)
    const findDeviceArea=findNodeById(areaList.value,currentAreaId)
    const modelPath= getModelPath(findDeviceArea.id)
    
    // 如果是当前区域
    if(currentModelPath===modelPath){
      const device=deviceList.value.find(item=>item.id===deviceId)
      threeInstance.focusOnObjectByName(device.code)
      threeInstance.addEffectByObjectName(type as 'fire' | 'smoke',device.code)
      
      return
    }
    piniaStoreArea.currentAreaId=currentAreaId
    const parentId = findDeviceArea.parentId
    if(parentId){
      const findParentArea=findNodeById(areaList.value,parentId)
      currentBuildName.value=findParentArea.aliasName
      curBuild.value=findParentArea
      handelClickBuild(findParentArea)
    }
    await changeFloor(findDeviceArea)
    // 加载模型
    const device=deviceList.value.find(item=>item.id===deviceId)
    threeInstance.focusOnObjectByName(device.code)
    threeInstance.addEffectByObjectName(type as 'fire' | 'smoke',device.code)
}
const findNodeById=(nodes, targetId) =>{
  for (const node of nodes) {
    if (node.id === targetId) {
      return node;
    }
    if (node.children && node.children.length > 0) {
      const foundNode =findNodeById(node.children, targetId);
      if (foundNode) {
        return foundNode;
      }
    }
  }
  return null;
}
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
  if(backViewpoint){
    devicePanel.value = "";
    showDevicePanel.value = false;
    threeInstance.backLastCamera()
  }else{
    showDevicePanel.value = false;
    devicePanel.value = "";
  }
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
    focusDeviceAddEffect(item,item.alarmTargetKey)
    showAlarmDetailPanel(item);
  }
);
/** webSocket消息提示 NOTICE_MESSAGE -> ALARM_NOTICE 报警弹窗 由后端主动推送的报警消息 */
bus.on(
  "getEventVideoList",
  async (data: any): Promise<void> => {
    const res = await getEventVideo(data.businessKey);
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

// 开始漫游
const startRoamingInspect = async (routeList,index=0)=>{
  const route = routeList.map(e=>{
    const area = JSON.parse(e.area)
    return {
      camera:JSON.parse(e.perspective),
      modelPath:getModelPath(area.id)
    }
  })
  if( piniaStoreArea.currentAreaLeave !== 1){
    await backToLevelOne()
  }
  roamShow.value = true
  roamingPointData.value = routeList||[]
  showPanel.value = false
  threeInstance.startRoamInspect(route,index)
}
// 结束漫游
const stopRoamInspect = ()=>{
  roamShow.value = false
  roamingPointData.value = null
  showPanel.value = true
  topHeader.value.resetRoaming();
  topHeader.value.selectFirstCameraView();
  threeInstance.stopRoamInspect()
  threeInstance.moveCamera(JSON.parse((window as any).config.webglConfig?.modelPerspective[0].value))
}

// 暂停漫游
const pauseRoamInspect = ()=>{
  threeInstance.pauseRoamInspect()
}

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
</script>
<style lang="less">
@import url("../style/index.less");

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

.label {
  display: flex;
  padding: 4px 10px;
  color: #ff6600;
  cursor: pointer;
  text-align: center;
  position: relative;

  img {
    width: 40px;
    height: 40px;
  }
}

.label-container {
  pointer-events: auto !important;
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

.label-msg {
  color: rgb(0, 255, 255);
  /* width: 100px;
      height: 30px; */
  font-size: 14px;
  /* padding: 15px; */
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


.label-panel {
  position: absolute;
  width: 200px;
  left: 24px;
  bottom: 24px;
  height: 200px;

  background: rgba(4, 20, 39, 0.8);

  .title {
    display: flex;
    align-items: center;
    color: #fff;
    padding: 10px;
    justify-content: space-between;
  }

  .content {
    color: #fff;
    margin-top: 10px;
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

.roaming-tag {
  position: absolute;
  top: 15%;
  left: 6%;
  z-index: 100;
  min-width: 60px;
  height: auto;
  transition: all 1s ease;
}
</style>
