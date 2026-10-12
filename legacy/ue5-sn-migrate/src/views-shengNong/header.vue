<template>
  <div class="header">
    <div class="header-left"><span>深农集团科技强安监管平台</span></div>
    <div class="header-middle">
      <!-- 业务菜单 -->
      <div class="nav">
        <BusinessNav ref="businessNavRef" @switchNav="switchNav" />
      </div>
    </div>
    <div class="header-right">
      <!-- <ChatAssistant /> -->
      <fullscreen />
      <div class="business-name" @click="tiggleBusinessNav">{{ showBusinessNav ? '隐藏面板' : '显示面板' }}</div>
      <a-dropdown class="model-weater-option userInfo" style="margin-right: 50px">
        <a class="ant-dropdown-link" @click.prevent>
          <div class="btnw flex-center">
            <span>访问端</span>
          </div>
        </a>
        <template #overlay>
          <a-menu>
            <a-menu-item>
              <a @click="toSN">深农安全园区1.0</a>
            </a-menu-item>
            <a-menu-item>
              <a @click="hrefToCubeBusiness">业务系统</a>
            </a-menu-item>
          </a-menu>
        </template>
      </a-dropdown>
      <a-dropdown class="model-weater-option userInfo" style="margin-right: 50px">
        <a class="ant-dropdown-link" @click.prevent>
          <div class="btnw flex-center">
            <img v-if="state.logo" :src="state.logo" alt="" />
            <img v-else :src="getAssetsImage('user.png')" alt="" />
            <span>{{ state.userName }}</span>
          </div>
        </a>
        <template #overlay>
          <a-menu>
            <a-menu-item>
              <a @click.prevent="loginOut">退出登录</a>
            </a-menu-item>
          </a-menu>
        </template>
      </a-dropdown>
    </div>
  </div>
  <div class="container">
    <span class="line-top"></span>
  </div>
</template>
<script lang="ts" setup>
import { onMounted, reactive, ref } from "vue";
import { getNowDateTime } from "../utils/common";
import BusinessNav from "./components/business-nav/business-nav.vue";
import { getUserIP, weatherCode, modelWeather } from "./header";
import { getAssetsImage, getSnImage } from "../utils/getImage";
import axios from "axios";
import { getAlarmMsgUnConfirmedCount } from "../api/alarm";
import { getTenantInfo, getImage } from "../api/ouaa";
import { SceneDataType } from "@/api/models/mdata";
import { getToken } from "@/utils/auth";
import { useRouter } from "vue-router";
import { hrefToCubeBusiness } from "@/api/auth-store";
import fullscreen from "./fullscreen.vue";
// import ChatAssistant from "@/components/basic/header/chat-assistant/chat-assistant.vue";

const router = useRouter();
type Emit = {
  (e: "setWeather", value: string): void;
  (e: "setTime", value: string): void;
  (e: "setTimeType", value: boolean): void;
  (e: "initCameraView", value: string): void;
  (e: "viewAlarmList"): void;
  (e: "handelAlarmView"): void;
  (e: "tiggleBusinessNav", value: boolean): void;
  (e: "switchNav", value: SceneDataType, data: number): void;
};

const showBusinessNav = ref(true);
/** 切换业务菜单显示隐藏 */
const tiggleBusinessNav = () => {
  showBusinessNav.value = !showBusinessNav.value
  emit('tiggleBusinessNav',showBusinessNav.value)
}
const businessNavRef = ref();
const weather: any = ref(null);
const count = ref<number>(0);
const emit = defineEmits<Emit>();
const modelWeatcherOptions = modelWeather;
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
    label: "白天",
    value: "day",
    img: "time1.png",
  },
  {
    label: "夜晚",
    value: "night",
    img: "time3.png",
  },
];
const switchNav = (item: SceneDataType, lv: number) => {
  emit("switchNav", item, lv);
};

const state = reactive({
  date: "",
  time: "",
  selectedModelTimeType: modelTimeTypeOptions[0],
  selectedModelWeather: modelWeatcherOptions[0],
  selectedModelTime: modelTimeOptions[0],
  systemName: (window as any).config.systemName,
  userName: "",
  logo: ''
});

/** 深农安全园区1.0 */
const toSN = () => {
  // const openUrl =
  //   "https://sn-hq.guheyun.cn:8000/#/home?kaihe_token=eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiMTMzNDM4NDExNDg0MDcyNzU1NCIsInVzZXJfbmFtZSI6InpiYWRtaW4iLCJzY29wZSI6WyJhcGkiXSwiZXhwIjoxNzAwMjAxMDE0LCJhdXRob3JpdGllcyI6WyJ4eXpfd3JpdGUiLCJST0xFX3VzZXJzVGVzdCIsInh5el9yZWFkIiwic3lzdGVtOmRpY3Q6cmVtb3ZlIiwiUk9MRV9BQ1RJVklUSV9VU0VSIl0sImp0aSI6ImhONlJqQjVWLVpUQU1fbG5rSkZ2VUhJQjVfYyIsImNsaWVudF9pZCI6ImlvcHMtc2VydmljZS1jbGllbnQifQ.W6cc3aS11mwFIJycI2w7iZ7tJsVU0MI3YVbhCgvR_pW7vWS0X2zv-CJLpm2IqY07xc8WypdSv2ecgd0Nr_IYK8MNv2e28pWoKNhqq6RF-13fDvj5oz3O2NtzHoN6yk74XQjI5lkcbn2KTFRFNJVo8Y8R5oyQGHf76W_7OQIKIAXVg42TDEehtYbn2Ny4fn6bRo6iZCb5Qf0QgN7DhMCq7a5y0VUCVRjLARLhutgqT94VhV9SJkXMwZcQIruUetTBLjOI5dryst1NgnLbp1V9DcOfVMPgDmCVsyqj2GfDSu9O7yGeiqhyRobpOXhDyFxyITg0YFop8-p59NF2Jsjrrg&token_type=bearer&refresh_token=eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiMTMzNDM4NDExNDg0MDcyNzU1NCIsInVzZXJfbmFtZSI6InpiYWRtaW4iLCJzY29wZSI6WyJhcGkiXSwiYXRpIjoiaE42UmpCNVYtWlRBTV9sbmtKRnZVSElCNV9jIiwiZXhwIjoxNzMwNzAwMjE0LCJhdXRob3JpdGllcyI6WyJ4eXpfd3JpdGUiLCJST0xFX3VzZXJzVGVzdCIsInh5el9yZWFkIiwic3lzdGVtOmRpY3Q6cmVtb3ZlIiwiUk9MRV9BQ1RJVklUSV9VU0VSIl0sImp0aSI6Ijg1b1RjR3VqdDVPQnRHWmFuWVJ4WDRaWmwzWSIsImNsaWVudF9pZCI6ImlvcHMtc2VydmljZS1jbGllbnQifQ.ZTc0BRo5PMhN-ZPd_He5vo6R5OCHh0U72VXOQ1msLh-FQGSnhATSgSVWCQPtWofV2YwOUCZ4adu8sslGS_pp1ZopdTdOBxw44PxDUoxbaEkYByFjbBeUxL8-ewaoekb2MHvUmk6GUZkk6LTh-gbI_0UQuvIo5eD7fGzvVyy5SkllTM9-cqFK5Sqa7f40BuHal624msaDOGZJk98N4cMHe2Gn8W5IEjGPPRHQDyTsZJE13IWHj63_1lHkAQvR6wx93CEhjmctfoT93SBPWIP5BxzId1bLapYwqZZa5KdnELqePIE7EROhLzG3w6kd31vVhQLzAauHp4qtVheDgzPcrw&expires_in=604799&scope=api&user_id=1334384114840727554&jti=hN6RjB5V-ZTAM_lnkJFvUHIB5_c&expire_time=1700201013398&code=hq";
    
    const access_token = JSON.parse(window.sessionStorage.getItem("GH-Token")).access_token;
    const env = import.meta.env
    const openUrl = env.VITE_SN_V1_URL + `?kaihe_token=${access_token}`
    window.open(openUrl, "_blank");
};
const loginOut = () => {
  sessionStorage.removeItem("GH-Token");
  sessionStorage.removeItem("GH-NowEnterprise");
  // router.replace({path: window.location.pathname + '/login'})
  window.location.href = window.location.origin + window.location.pathname;
};

const viewAlarmList = () => {
  emit("viewAlarmList");
};
onMounted(async () => {
  businessNavRef.value.getMenuList();
  getAlarmCount();
  nowTime();
  getLogo();
  const token = await getToken();
  state.userName = token.name;
  setInterval(() => {
    nowTime();
  }, 1000);
  setInterval(() => {
    handelTimeClick(getNowDateTime("HH:mm:ss"));
  }, 30 * 60 * 1000);
});

const handelAlarmClick = () => {
  emit("handelAlarmView");
};
const nowTime = () => {
  let nowDateTime = getNowDateTime();
  state.date = nowDateTime.split(" ")[0];
  state.time = nowDateTime.split(" ")[1];
};
const handelTimeClick = (item): void => {
  state.selectedModelTime = item;
  emit("setTime", item.value);
};

/**获取报警数量 */
const getAlarmCount = async () => {
  const res = await getAlarmMsgUnConfirmedCount();
  count.value = res;
};

const getLogo = async () => {
  try {
    const nowEnterprise = JSON.parse(window.sessionStorage.getItem("GH-NowEnterprise"))
    const tenantInfo = await getTenantInfo(nowEnterprise.code)
    if(tenantInfo?.logoId){
      const res = await getImage(tenantInfo.logoId)
      state.logo = res?.path
    }
  } catch (error) {
  }

};

defineExpose({
  weather,
  getAlarmCount,
});
</script>
<style lang="less" scoped>
.header {
  width: 100%;
  height: 74px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  padding-top: 10px;
  padding-left: 0;
  overflow: hidden;
  // background: linear-gradient(#050F20, RGBA(11, 33, 57, 0.8),#050F20);
  // background-color: transparent;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  // background-color: linear-gradient(to bottom, rgba(0, 0, 0, 0.95), rgba(4, 20, 39, 0.5), rgba(2, 16, 30, 0) );
  background-color: rgba(6, 20, 36, 0.4);
  background-image: url("/resource/v1/ue5-sn-migrate/assets/images/sn/head-bg.png");
  background-repeat: no-repeat;
  background-size: cover;
  :deep(.ant-select-selector) {
    background: rgba(0, 0, 0, 0.3) !important;
    color: #fff;
    border: none;
  }

  :deep(.ant-select-arrow) {
    // background: rgba(0, 0, 0, 0.3)!important;
    color: #fff;
  }

  .header-left {
    font-family: "YouSheBiaoTiHei";
    font-size: 32px;
    font-weight: bold;
    // background-color: linear-gradient(180deg, #FFFFFF 0%, #D9E7FF 100%);
    color: #fff;
    // -webkit-background-clip: text;
    // -webkit-text-fill-color: transparent;
    padding: 8px 60px 4px 60px;
    position: relative;
    overflow: visible;
    span {
      position: relative;
      top: -5px;
      background-image: -webkit-linear-gradient(bottom, #ffffff, #b6caf3);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      letter-spacing: 2px;
      margin-left: 6px;
    }
    &::before {
      content: "";
      display: inline-block;
      position: absolute;
      top: -10px;
      left: 0;
      width: 504px;
      height: 74px;
      padding-left: 60px;
      background-position: center bottom;
      background: url("/resource/v1/ue5-sn-migrate/assets/images/sn/logo-bg.png") no-repeat;
      background-size: 100% 100%;
    }
  }

  .header-right {
    display: flex;
    align-items: center;
    // min-width: 400px;
    .now-time {
      display: flex;
      align-items: center;

      .time {
        font-family: "PangMenZhengDao";
        font-size: 24px;
        font-weight: bold;
        color: #ffffff;
        width: 120px;
      }

      .date {
        font-size: 14px;
        color: #ffffff;
      }
    }

    .btnw {
      padding: 4px 8px;
      border-radius: 6px 6px 6px 6px;
      cursor: pointer;
      color: #ffffff;
      font-size: 14px;

      img {
        width: 24px;
        height: 24px;
        margin-right: 6px;
      }

      &.camera-view {
        margin-left: 20px;
      }
    }
    .userInfo {
      .btnw img {
        width: 28px;
        height: 28px;
      }
    }

    .alarm {
      display: inline-flex;
      cursor: pointer;
      margin: 0 20px;

      img {
        height: 24px;
        width: 24px;
      }
    }

    .to-buissness {
      color: white;
      cursor: pointer;
      margin: 0 20px;
      font-size: 14px;
    }
  }
}

.container {
  width: 100vw;
  position: relative;
  border: 1px solid rgba(6, 48, 88, 0.85);

  .line-top {
    position: absolute;
    width: 100px;
    height: 1px;
    top: -1px;
    left: 0;
    background: linear-gradient(to right, #1991ff, #fff);
    border-radius: 50%;
    animation: left_to_right 8s 0s linear infinite;
  }

  .line-top::before {
    content: "";
    position: absolute;
    width: 100%;
    height: 11px;
    background: linear-gradient(to right, transparent, #1991ff, #1991ff);
    // box-shadow: 0 0 10px 5px #0e96e7;
    left: 0;
    top: -5px;
    filter: blur(4px);
    z-index: 1;
  }

  @keyframes left_to_right {
    0% {
      left: 0;
    }
    100% {
      left: 100%;
    }
  }
}
.sn-logo {
  width: 28px;
  height: 28px;
}

.business-name{
  padding: 0 10px;
  cursor: pointer;
  color: white;
  font-size: 14px;
}

:deep(.ant-dropdown),
.ant-dropdown,
:deep(.ant-dropdown-menu-item),
.ant-dropdown-menu-item {
  border: 1px solid rgba(100, 162, 255, 0.2);
  background: rgba(47, 118, 255, 0.1);
  box-shadow: inset 0px 0px 10px 0px rgba(47, 118, 255, 0.3);
  background-color: transparent;
  // border-color: #2989ff;
  font-size: 14px !important;
  padding: 10px 15px;
  color: #6194f7 !important;
  color: #fff !important;
  background-color: rgb(27 52 101) !important;
}
:deep(.ant-dropdown-menu),
.ant-dropdown-menu {
  background-color: transparent;
  font-size: 14px !important;
}
.model-camera-option{
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
}
</style>
