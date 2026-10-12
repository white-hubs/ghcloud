<template>
  <div class="header">
    <div class="left-container flex-start">
      <div class="now-time" @click="getNowWeather">
        <div class="date">{{ state.date }}</div>
        <div class="time">{{ state.time }}</div>
      </div>
      <!--切换时间-->
      <div class="model-time-option" >
        <a-dropdown :getPopupContainer="(triggerNode) => triggerNode.parentNode">
          <template #overlay>
            <div class="list">
              <div class="list-item flex-center" v-for="(item, index) in timeOptions" :key="index"
                @click="handelTimeClick(item)">
                <img :src="getAssetsImage(item.img)" alt="" />
                <span>{{ item.label }}</span>
              </div>
            </div>
          </template>
          <div class="btn flex-center">
            <img :src="getAssetsImage(state.selectedModelTime.img)" alt="" />
            <span>{{ state.selectedModelTime.label }}</span>
          </div>
        </a-dropdown>
      </div>
      <template v-if="modelType!=='2D'">
        <!--切换天气-->
        <div class="model-weater-option" v-if="modelType!=='WEBGL'" >
          <a-dropdown :getPopupContainer="(triggerNode) => triggerNode.parentNode">
            <template #overlay>
              <div class="list">
                <div class="list-item flex-center" v-for="(item, index) in modelWeatherOptions" :key="index"
                  @click="handelWeatcherClick(item)">
                  <img :src="getAssetsImage(item.img)" alt="" />
                  <span>{{ item.label }}</span>
                </div>
              </div>
            </template>
            <div class="btn flex-center">
              <img :src="getAssetsImage(state.selectedModelWeather.img)" alt="" />
              <span>{{ state.selectedModelWeather.label }}</span>
            </div>
          </a-dropdown>
        </div>
        <div class="model-weater-option" v-else>
          <a-dropdown :getPopupContainer="(triggerNode) => triggerNode.parentNode">
            <template #overlay>
              <div class="list">
                <div class="list-item flex-center" v-for="(item, index) in webGLWeather" :key="index"
                  @click="handelWeatcherClick(item)">
                  <img :src="getAssetsImage(item.img)" alt="" />
                  <span>{{ item.label }}</span>
                </div>
              </div>
            </template>
            <div class="btn flex-center">
              <img :src="getAssetsImage(state.selectedModelWeather.img)" alt="" />
              <span>{{ state.selectedModelWeather.label }}</span>
            </div>
          </a-dropdown>
        </div>
        <!--切换视角-->
        <div class="model-camera-option" v-if="modelType!=='WEBGL'" >
          <a-dropdown :getPopupContainer="(triggerNode) => triggerNode.parentNode">
            <template #overlay>
              <div class="list">
                <div class="list-item flex-center" v-for="(item, index) in cameraViews" :key="index"
                  @click="changeSelect(item)">
                  <span>{{ item.label }}</span>
                </div>
              </div>
            </template>
            <div class="btn flex-center">
              <img :src="getAssetsImage('camera.png')" alt="" />
              <span>{{ viewSelect?.label }}</span>
            </div>
          </a-dropdown>
        </div>
        <div class="model-camera-option" v-else>
          <a-dropdown :getPopupContainer="(triggerNode) => triggerNode.parentNode">
            <template #overlay>
              <div class="list">
                <div class="list-item flex-center" v-for="(item, index) in props.cameraOptions" :key="index"
                  @click="changeSelect(item)">
                  <span>{{ item.label }}</span>
                </div>
              </div>
            </template>
            <div class="btn flex-center">
              <img :src="getAssetsImage('camera.png')" alt="" />
              <span>{{ viewSelect?.label }}</span>
            </div>
          </a-dropdown>
        </div>
        <!--漫游-->
        <div class="model-roaming-option" v-if="roamingRoute.length>0" >
          <a-dropdown :getPopupContainer="(triggerNode) => triggerNode.parentNode">
            <template #overlay>
              <div class="list">
                <div class="list-item flex-center" v-for="(item, index) in roamingRoute" :key="index"
                  @click="changeRoaming(item)">
                  <span>{{ item.name }}</span>
                </div>
              </div>
            </template>
            <div class="btn flex-center">
              <span>{{ roamingSelect }}</span>
            </div>
          </a-dropdown>
        </div>
      </template>
    </div>

    <div class="center-container">
      <div class="center-container-box">
        <img width="18" v-if="marketOverview?.logo && marketOverview?.logo.path" :src="marketOverview?.logo.path"
          alt="">
        <span>{{ state.systemName }}</span>
      </div>
    </div>
    
    <div class="right-container flex-end">
      <div class="business-name" @click="changWebGlRoam">
        {{ romaSelect.value?'关闭':'开启' }}环游
      </div>
      <fullscreen ref="fullscreenFef"/>
      <div class="business-name" @click="tiggleBusinessNav">
        {{ showBusinessNav ? '隐藏菜单' :'显示菜单' }}
      </div>
      <div class="alarm" @click="viewAlarmList">
        <a-badge :count="count" title="Custom hover text">
          <img :src="getAssetsImage('alarm.png')" />
        </a-badge>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { onMounted, reactive, ref ,computed,watch, onBeforeUnmount} from "vue";
import { getNowDateTime } from "@/utils/common";
import { getAssetsImage } from "@/utils/getImage";
import axios from "axios";
import { getUserIP, modelWeather, weatherName,webGLWeather } from "./header";
import { recordStatus } from "@/api/alarm";
import {UeClient} from "@ghcloud/cube-visual-sdk";
import fullscreen from "./fullscreen.vue";
import { getTenantDetails } from '@/api/ouaa'
import { PropType } from 'vue'
import { storeMarket } from '@/piniaStore/other'
import {  batchAddDeviceIcon} from "@/views/index";
import bus from "@/utils/bus";
import { CubeMfRootGlobalState } from "@ghcloud/cube-mf-root";

const ueClient = UeClient.getInstance();
type Emit = {
  (e: "setWeather", value: string): void;
  (e: "setTime", value: string): void;
  (e: "setTimeType", value: boolean): void;
  (e: "initCameraView", value: string): void;
  (e: "roamingEvent", value: {perspective:string;pointName:string} | boolean): void;
  (e: "viewAlarmList"): void;
  (e: "displayLabel"): void;
  (e: "tiggleBusinessNav", value: boolean): void;
  (e: "changWebGlRoam", value: {value: boolean,label:string}): void;
  (e: "tourStatus", value: boolean): void;
};
interface Option {
  label: string;
  value: string;
}
interface LinesOptions {
  enabled: boolean;
  id: string;
  intranetAddress: string;
  ipAddress: string;
  name: string;
  occupied: boolean;
  tenant: number;
}
/** 模型类型 */
const modelType = computed(()=>{
  const entry = window.config.entry
  if(['views','views-old-area'].includes(entry)){
    return 'UE5'
  }else if(['views-2d','views-2d-old-area'].includes(entry)){
    return '2D'
  }else if(['views-three','views-3d'].includes(entry)){
    return 'WEBGL'
  }else{
    return 'UE5'
  }
})
const fullscreenFef = ref()
const piniaStoreMarket = storeMarket();
const inUE5 = navigator.userAgent.includes('UnrealEngine')
const cameraViews: Option[] = (window as any).config.modelPerspective;
const resolvingPower = [
  {
    label:'全屏',
    value:{
      width:'1920',
      height:'1080',
      mode:'f'
    }
  },
  {
    label:'窗口',
    value:{
      width:'1280',
      height:'720',
      mode:'w'
    }
  }
]
const showBusinessNav = ref(true)
const weather: any = ref(null);
const count = ref<number>(0);
/** 驾驶模式 */
const driverMode = ref(false);
const inCubeApp = navigator.userAgent.toLocaleLowerCase().includes('cube-app')
/** 模型画质 */
const pictureQuality=ref('medium')
const pictureQualityOptions=[
  { value: 'high', label: '高' },
  { value: 'medium', label: '中' },
  { value: 'low', label: '低' }
]
const emit = defineEmits<Emit>();
const props=defineProps({
  cameraOptions:{
    type:Array as PropType<Option[]>,
    default:()=>[]
  }
})
const modelRoamOptions = [
  { label: '开', value: true },
  { label: '关', value: false },
]
const romaSelect = ref(modelRoamOptions[1]);
const LabelSelect = ref('开');
const modelWeatherOptions = modelWeather;
const modelTimeTypeOptions = [
  {
    label: "自动时间",
    value: true,
  },
  {
    label: "手动时间",
    value: false,
  },
];
const modelTimeOptions = [
  {
    label: "自动",
    value: "auto",
    img: "time1.png",
  },
  {
    label: "上午",
    value: "9:00:00",
    time:'day',
    img: "time1.png",
  },
  {
    label: "下午",
    value: "15:00:00",
    time:'dusk',
    img: "time2.png",
  },
  {
    label: "晚上",
    value: "22:00:00",
    time:'night',
    img: "time3.png",
  },
];
const webGlModelTimeOptions = [
  {
    label: "白天",
    value: "day",
    img: "time1.png",
  },
  {
    label: "黄昏",
    value: "dusk",
    img: "time3.png",
  },
  {
    label: "夜晚",
    value: "night",
    img: "time3.png",
  },
];
const guideData = computed(()=>{
  return window.config.guideData
})

const timeOptions =computed(()=>{
  return modelType.value==='WEBGL'?webGlModelTimeOptions:modelTimeOptions
})
const changWebGlRoam=()=>{
  romaSelect.value = modelRoamOptions[romaSelect.value.value?1:0] 
  emit('changWebGlRoam', romaSelect.value)
}
const displayLabel = () =>{
  LabelSelect.value = LabelSelect.value==='开'?'关':'开';
  piniaStoreMarket.showLabel = LabelSelect.value
  if (piniaStoreMarket.showLabel === '开') {
    batchAddDeviceIcon()
    emit('displayLabel')
  }else {
    ueClient.send("removePoiByType", { type: "all" });
  }
}
const modelLineOptions: LinesOptions[] = window.config.connectLines;

const marketOverview = ref({
  logo:{
    path:''
  }
})

const state = reactive({
  date: "",
  time: "",
  selectedModelTimeType: modelTimeTypeOptions[0],
  selectedModelWeather: modelWeatherOptions[0],
  selectedModelTime: modelTimeOptions[0],
  systemName: (window as any).config.systemName,
});

const roamingRoute = computed(()=>{
  if(modelType.value==='WEBGL'){
    return window.config.webglConfig.roamingRoute||[]
  }
  return (window as any).config.roamingRoute || []
})

watch(()=>modelType.value,()=>{
  if(modelType.value==='WEBGL'){
    state.selectedModelWeather=webGLWeather[0]
    state.selectedModelTime=webGlModelTimeOptions[0]
  }
},{immediate:true})
onMounted(() => {
  getAlarmCount();
  nowTime();
  getTenantInfo()
  setInterval(() => {
    nowTime();
  }, 1000);
});

onBeforeUnmount(() => {
  bus.off('cube-ai-command')
});

const reload=()=>{
  window.location.reload()
}
/** 切换业务菜单显示隐藏 */
const tiggleBusinessNav = () => {
  showBusinessNav.value = !showBusinessNav.value
  emit('tiggleBusinessNav',showBusinessNav.value)
}
const nowTime = () => {
  let nowDateTime = getNowDateTime();
  state.date = nowDateTime.split(" ")[0];
  state.time = nowDateTime.split(" ")[1];
};

const handelWeatcherClick = (item): void => {
  const data = modelWeatherOptions.find(e=>e.value===item.value)
  state.selectedModelWeather = data;
  emit("setWeather", item.value);
};
const handelTimeClick = (item): void => {
  //@ts-ignore 
  const data = timeOptions.value.find(e=>e.value===item.value||e?.time===item.value)
  state.selectedModelTime = data;
  emit("setTime", data.value);
};
const viewSelect = ref(cameraViews[0]);
const resolvingSelect = ref('全屏');
const roamingSelect = ref("漫游路线");
const tourStatus = ref('进入导览')

const enterTourGuide = ()=>{
  if (tourStatus.value === '进入导览') {
    tourStatus.value = '退出导览'
    emit("tourStatus", true);
  }else{
    tourStatus.value = '进入导览'
    emit("tourStatus", false);
  }
}
const changeSelect = (option: Option) => {
  viewSelect.value = option;
  emit("initCameraView", option.value);
};
const changeResolving = (item) => {
  ueClient.send('changeResolution', {
    width: item.value.width,
    height: item.value.height,
    mode: item.value.mode  
  });
  resolvingSelect.value = item.label
};
const changeRoaming = (item)=>{
  if (item) {
    roamingSelect.value = item.name;
    emit("roamingEvent", item.route);
  }else{
    emit("roamingEvent", false);
  }
}
// 取消漫游
const resetRoaming = ()=>{
  roamingSelect.value = "漫游路线";
}
/** 设置第一个鸟瞰视角 */
const selectFirstCameraView = (): void => {
  changeSelect(cameraViews[0])
}
const changRoam = () => {
  romaSelect.value = modelRoamOptions[romaSelect.value.value?1:0] 
  // 环游开启前切换到默认视角
  if(romaSelect.value.value){
    selectFirstCameraView()
  }
  ueClient.send(romaSelect.value.value?'startAutoRevolve':'stopAutoRevolve');
}
/**
 * 根据ip地址获取天气预报
 */
const getNowWeather = () => {
  /**
   * 通过ip获取天气预报 ip获取失败则用区域
   */
  getUserIP(async (ip) => {
    if (ip) {
      return new Promise((resolve, reject) => {
        axios
          .get(`https://qryweather.market.alicloudapi.com/lundroid/queryweatherfromip?&ip=${ip}`, {
            headers: { Authorization: "APPCODE 80751a3b98794bacb366cd0ccf80db86" },
          })
          .then((res) => {
            weather.value = res.data.data.info.now.weather;
            state.selectedModelWeather = modelWeatherOptions.find((item) => {
              if (item.label.includes(weather.value)) {
                return item;
              }
            });
             emit("setWeather", weatherName[weather.value]);
          })
          .catch((error) => {
            reject(error);
          });
      });
    } 
  });
};
/**获取报警数量 */
const getAlarmCount = async () => {
  const res = await recordStatus();
  count.value = res.alarmUnresolvedHandlerNum;
};
const getTenantInfo = async () => {
  marketOverview.value = await getTenantDetails(CubeMfRootGlobalState.getInstance().mfRootState.authInfo.tenant)
}
const viewAlarmList = () => {
  emit("viewAlarmList");
};

// 切换驾驶模式
const handleChangeDriverMode =()=>{
  driverMode.value = !driverMode.value
  
  if(!driverMode.value){
    selectFirstCameraView()
  }
  tiggleBusinessNav()
  ueClient.send('changeTouchInterface',{active:driverMode.value})
}

/** 模型连接 */
let ue5Dom = null
const loadUE5Model = (dom?: HTMLElement) => {
  if(dom){
    ue5Dom=dom
  }
  const modelLine = inUE5 ? 'ws://localhost:8080' : modelLineOptions[0].ipAddress
  // const modelLine = inUE5 ? 'ws://localhost:8080' : 'wss://cube-ue.guhecloud.com:3000/98/2/'
  dom && ueClient.loadUE5(dom ?? ue5Dom, modelLine)
}
defineExpose({
  weather,
  loadUE5Model,
  selectFirstCameraView,
  getAlarmCount,
  resetRoaming
});


function changePictureQuality(item: { value: string; }){
  ueClient.send('changePictureQuality', {
    level: item.value
  })
  pictureQuality.value = item.value
}

</script>
<style lang="less" scoped>
.header {
  width: 100%;
  height: 64px;
  position: relative;
  background: linear-gradient(180deg, rgba(0, 53, 134, 0.6) 0%, rgba(0, 53, 134, 0) 100%);

  .center-container {
    width: 1294px;
    height: 90px;
    margin: 0 auto;
    background: url("/resource/v1/ue5-migrate/assets/images/title.png");
    text-align: center;
    background-position: 50% 50%;
    background-size: 100%;
    background-repeat: no-repeat;
    font-size: 30px;
    color: #ffffff;
    font-family: YouSheBiaoTiHei;
    padding-top: 4px;

    .center-container-box {
      display: flex;
      align-items: center;
      justify-content: center;

      img {
        margin-right: 10px;
      }
    }
  }

  :deep(.ant-select-selector) {
    background: rgba(0, 0, 0, 0.3) !important;
    color: #fff;
    border: none;
  }

  :deep(.ant-select-arrow) {
    // background: rgba(0, 0, 0, 0.3)!important;
    color: #fff;
  }

  .left-container {
    position: absolute;
    top: 0;
    left: 0;
    height: 64px;
    font-size: 14px;
    color: #ffffff;
    padding-left: 20px;

    .weather {
      img {
        width: 30px;
        height: 30px;
      }
    }

    .line {
      height: 12px;
      width: 1px;
      background: #ffffff;
      margin: 0 14px;
    }

    .now-time {
      .date {
        font-size: 18px;
      }

      .time {
        font-size: 14px;
      }
    }

    .model-time-option,
    .model-camera-option {
      margin: 0 20px;
    }

    .model-roaming-option {
      margin-right: 20px;
    }

    .model-time-type {
      margin-left: 20px;
    }

    .btn {
      background: rgba(0, 0, 0, 0.3);
      padding: 4px 8px;
      border-radius: 6px 6px 6px 6px;
      cursor: pointer;
      user-select: none;

      img {
        width: 24px;
        height: 24px;
        margin-right: 6px;
      }

      &.camera-view {
        margin-left: 20px;
      }
    }

    .list {
      background: rgba(0, 0, 0, 0.3);

      &-item {
        color: #ffffff;
        height: 36px;
        min-width: 68px;
        cursor: pointer;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;

        img {
          width: 24px;
          height: 24px;
          margin-right: 6px;
        }
      }
    }

    .model {
      margin: 0 20px;

      :deep(.ant-radio-button-wrapper) {
        background: transparent;
        color: #ffffff;
        font-size: 14px;
        border: none;
        padding: 0;
      }
    }
  }

  .right-container {
    position: absolute;
    top: 0;
    right: 0;
    height: 64px;
    font-size: 14px;
    color: #ffffff;
    padding-right: 20px;
    display: flex;

    .btn {
      padding: 4px 8px;
      border-radius: 6px 6px 6px 6px;
      cursor: pointer;

      img {
        width: 24px;
        height: 24px;
        margin-right: 6px;
      }

      &.camera-view {
        margin-left: 20px;
      }
    }

    .list {
      background: rgba(0, 0, 0, 0.6);

      &-item {
        color: #ffffff;
        height: 36px;
        min-width: 68px;
        cursor: pointer;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;

        img {
          width: 24px;
          height: 24px;
          margin-right: 6px;
        }
      }
    }

    .model {
      margin: 0 20px;

      :deep(.ant-radio-button-wrapper) {
        background: transparent;
        color: #ffffff;
        font-size: 14px;
        border: none;
        padding: 0;
      }
    }

    .business-name,
    .alarm,
    .user {
      padding: 0 10px;
      cursor: pointer;
      user-select: none;
    }

    .alarm {
      cursor: pointer;

      img {
        height: 24px;
        width: 24px;
      }
    }

    .user img {
      height: 28px;
      width: 28px;
    }
  }
}
</style>
