<!-- eslint-disable vue/no-parsing-error -->
<template>
  <a-config-provider :locale="locale">
    <svg
      id="svgfilters"
      aria-hidden="true"
      style="position: absolute; width: 0; height: 0; overflow: hidden"
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      xmlns:xlink="http://www.w3.org/1999/xlink"
    >
      <defs>
        <filter
          id="x-rays"
          x="-10%"
          y="-10%"
          width="120%"
          height="120%"
          filterUnits="objectBoundingBox"
          primitiveUnits="userSpaceOnUse"
          color-interpolation-filters="sRGB"
        >
          <feColorMatrix
            type="matrix"
            values=".33 .33 .33 0 0
					.33 .33 .33 0 0
					.33 .33 .33 0 0
					0 0 0 1 0"
            in="SourceGraphic"
            result="colormatrix"
          />
          <feComponentTransfer in="colormatrix" result="componentTransfer">
            <feFuncR type="table" tableValues="0.98 0.3 0.25" />
            <feFuncG type="table" tableValues="1 0.44 0.24" />
            <feFuncB type="table" tableValues="0.91 0.62 0.39" />
            <feFuncA type="table" tableValues="0 1" />
          </feComponentTransfer>
          <feBlend mode="normal" in="componentTransfer" in2="SourceGraphic" result="blend" />
        </filter>
      </defs>
    </svg>
    <router-view />
  </a-config-provider>
</template>
<script>
import { Modal } from "ant-design-vue";
import zh_CN from "ant-design-vue/es/locale/zh_CN";

import { getToken, storeToken } from "@/services/AccountService";
import "moment/dist/locale/zh-cn";
// import "moment/locale/zh-cn";
import * as echarts from "echarts";
import qs from "qs";
import { defineComponent, getCurrentInstance, onMounted, provide, reactive, ref, toRefs, watch } from "vue";
import { useRoute } from "vue-router";
import { useStore } from "vuex";

import { CubeAlarmModal } from "@ghcloud/cube-alarm-modal/src/register";
import { CubeMdataService } from "@ghcloud/cube-mdata-service";

import { TRTCPlugin } from "../webrtc-plugin/trtc-plugin";

export default defineComponent({
  setup() {
    const { proxy } = getCurrentInstance();
    const store = useStore();
    const route = useRoute();
    let ws;
    const locale = ref(zh_CN);

    // 设置全局 moment 语言为中文，确保日期组件显示中文
    // moment.locale('zh-cn');

    const cubeAlarmModal = new CubeAlarmModal({ showDetailButton: false });
    const state = reactive({
      tenant: "",
    });

    provide("echarts", echarts);

    let path = ref("/");
    const color = ref("");

    const getMsgNum = async () => {
      const data = await proxy.$api.unReadNum("CHANNEL_SITE", "get");
      store.commit("unReadMsgNum/SET_UNREAD_NUM", data === true ? "" : data);
      const data2 = await proxy.$api.getAlarmMsgUnConfirmedCount();
      store.commit("unReadMsgNum/SET_UNREAD_ALARMNUM", data2 === true ? "" : data2);
    };

    const setEnterprise = () => {
      const params = window.location.search?.split("?")[1];
      if (params && params.includes("access_token")) {
        const token = qs.parse(params);
        token.nowEnterprise = token.nowEnterprise.replaceAll("%22", '"');
        store.commit("enterprise/SET_NOW_ENTERPRISE", JSON.parse(token.nowEnterprise));
        sessionStorage.setItem("GH-NowEnterprise", token.nowEnterprise);
        for (const key in token) {
          if (token[key] === "false") {
            token[key] = false;
          } else if (token[key] === "true") {
            token[key] = true;
          }
        }
        storeToken(token);
      }
    };

    const getVideoSession = () => {
      try {
        const token = JSON.parse(sessionStorage.getItem("GH-Token")).access_token;
        const tenant = JSON.parse(sessionStorage.getItem("GH-NowEnterprise")).code;
        const authInfo = {
          token,
          tenant,
          terminal: "command-dispatch-app",
        };
        const cubeMdataService = new CubeMdataService(authInfo);
        cubeMdataService.getVideoPtzSession().then((res) => {
          const session = res?.session;
          if (session) {
            window.videoSession = session;
            sessionStorage.setItem("videoSession", session);
          }
        });
      } catch {}
    };
    onMounted(() => {
      setEnterprise();
      if (sessionStorage.getItem("videoSession")) {
        window.videoSession = sessionStorage.getItem("videoSession");
      } else {
        getVideoSession();
      }
      if (sessionStorage.getItem("GH-Token")) {
        store.commit("commandDispatch/SET_STREAM_BASE_DATA");
        initWebSoketMsg();
        cubeAlarmModal.onClose(() => {
          proxy.$emitter.emit("closeAlarmModal");
        });
      }
    });

    watch(
      () => route.path,
      (n) => {
        if (n === "/login") {
          if (ws) {
            ws.close();
          }
        } else {
        }
      },
    );

    // 消息2
    const messageMsg = (message) => {
      // 消息接收
      if (["welcome", "health"].includes(message.msgType)) {
        getMsgNum();
      }
      // 不分消息公共处理方法
      const timeoutHandleFun = (message) => {
        const timeoutMsg = {
          msgContent: message.eventDataDTO.data.msgContent,
          msgType: message.eventDataDTO.data.msgType,
          businessPrincipal: JSON.parse(message.eventDataDTO.data.businessPrincipal),
        };
        proxy.$emitter.emit("timeoutEvent", timeoutMsg);
      };

      // 通知消息执行方法
      const NOTICE_MESSAGE_MSGTYPEForHandle = {
        // 报警
        ALARM_NOTICE: (message) => {
          if (message.eventDataDTO.data.businessPrincipal) {
            path.value = route.path;
            color.value = route.path == "/commandDispatch" ? "#fff" : "#000";
            let bjMessage = JSON.parse(message.eventDataDTO.data.businessPrincipal);
            cubeAlarmModal.handelAlarmMessage(bjMessage);
            proxy.$emitter.emit("alarmMessagePush", bjMessage);
          }
        },
        // 报警长时间无人接收提示
        ALARM_TIMEOUT_UN_CONFIRMED_NOTICE: (message) => {
          timeoutHandleFun(message);
        },
        // 即将超时
        ALARM_IMMEDIATELY_TIMEOUT_NOTICE: (message) => {
          timeoutHandleFun(message);
        },
        // 已超时未处理
        ALARM_TIMEOUT_UN_HANDLER_NOTICE: (message) => {
          timeoutHandleFun(message);
        },
        // 巡更异常任务
        PATROL_TASK_ABNORMAL_MESSAGE: (message) => {
          timeoutHandleFun(message);
        },
      };
      if (message.msgType === "NOTICE_MESSAGE") {
        if (NOTICE_MESSAGE_MSGTYPEForHandle[message.eventDataDTO.data.msgType]) {
          NOTICE_MESSAGE_MSGTYPEForHandle[message.eventDataDTO.data.msgType](message);
        }
      } else if (message.msgType === "DEVICE_ATTRIBUTE_CHANGE") {
        store.commit("dataSubscription/SET_REALTIME_DATA", message.eventDataDTO.data);
      }
    };
    let wsMsg = null;
    // 消息2.0 对接
    const initWebSoketMsg = async () => {
      const token = await getToken();
      const userInfo = await proxy.$api.getCurrentUser();
      const tenant = store.getters.nowEnterprise?.code;
      store.commit("userInfo/SET_USER_INFO", userInfo);
      wsMsg && wsMsg.dispose();
      wsMsg = new TRTCPlugin({
        userId: userInfo.id,
        accessToken: token.access_token,
        tenant: tenant,
        terminal: "command-dispatch-app",
        subscribeType: "broadcast",
      });
      wsMsg.on("alarmMessage", (data) => {
        messageMsg(data);
      });
      wsMsg.on("remoteRepeatLogin", (data) => {
        //弹窗提示
        Modal.warning({
          title: "登录下线提醒",
          content: "当前账号已在其他设备登录，请重新登录",
          okText: "确定",
          centered: true,
          onOk() {
            sessionStorage.clear();
            window.location.href = window.location.origin + "/login";
          },
        });
      });
      store.commit("commandDispatch/SET_WEBRTC_INSTANCE", wsMsg);
    };

    return {
      color,
      path,
      ...toRefs(state),
      locale,
    };
  },
});
</script>
<style lang="less">
@import url("./styles/index.less");

#app {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  height: 100%;
  width: 100%;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;

  > div {
    height: 100%;
    width: 100%;
  }
}

#nav {
  width: 100%;
  height: 60px;
  line-height: 60px;

  a {
    font-weight: bold;
    color: #2c3e50;

    &.router-link-exact-active {
      color: #42b983;
    }
  }
}

.modal-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;

  .modal-num {
    margin-right: 12px;
    // background: ;
  }
}

.alarm-modal {
  width: 100%;
  height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;

  > div {
    width: 50%;
    height: 100%;

    &.alarm-tips {
      display: flex;
      align-items: center;
      justify-content: center;

      .alarm-tips-icon {
        margin-right: 30px;

        > div {
          text-align: center;
        }
      }

      .alarm-tips-device {
        > div {
          text-align: center;

          &:first-child {
            font-size: 16px;
            font-weight: bold;
          }

          &:last-child {
            font-size: 14px;
          }
        }
      }
    }

    &.alarm-video {
      .alarm-video-container {
        width: 100%;
        height: 300px;
      }
    }
  }
}

.imgTwinkling {
  animation: twinkling 1s 7 ease-in-out;
}

@keyframes twinkling {
  0% {
    opacity: 0;
  }

  100% {
    opacity: 1;
  }
}

.mask {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  padding: 0 10px;
  overflow-y: auto;
  width: 500px !important;
  height: 548px !important;
  border-radius: 0px 0px 0px 0px;
  opacity: 1;
  border: 1px solid;
  backdrop-filter: blur(3px);
  z-index: 999;

  .alarmDetail-modal-header {
    display: flex;
    justify-content: space-between;
    box-sizing: border-box;
    align-items: center;
    height: 40px;
    line-height: 40px;
    // padding: 0 16px;
    box-sizing: border-box;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);

    .header-title {
      color: #fff;
    }

    .header-close {
      width: 24px;
      height: 24px;

      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
    }
  }

  .alarm_name {
    margin-top: 10px;
    color: #fff;
    text-align: center;
  }
}

.red {
  background: linear-gradient(180deg, rgba(255, 59, 52, 0.3) 0%, rgba(8, 13, 23, 0) 100%);

  border-image: linear-gradient(
      180deg,
      rgba(255, 59.00000028312206, 52.000000700354576, 1),
      rgba(255, 59.00000028312206, 52.000000700354576, 0)
    )
    1 1;
}

.yellow {
  background: linear-gradient(180deg, rgba(255, 110, 52, 0.3) 9%, rgba(8, 13, 23, 0) 100%);
  border-image: linear-gradient(
      180deg,
      rgba(255, 110.00000104308128, 52.000000700354576, 1),
      rgba(255, 110.00000104308128, 52.000000700354576, 0)
    )
    1 1;
}

.orange {
  border-image: linear-gradient(
      180deg,
      rgba(255, 194.00000363588333, 52.000000700354576, 1),
      rgba(255, 194.00000363588333, 52.000000700354576, 0)
    )
    1 1;
  background: linear-gradient(180deg, rgba(255, 194, 52, 0.3) 0%, rgba(8, 13, 23, 0) 100%);
}

.blue {
  background: linear-gradient(180deg, rgba(24, 144, 255, 0.3) 0%, rgba(8, 13, 23, 0) 100%);
  border-image: linear-gradient(
      180deg,
      rgba(24.000000469386578, 144.00000661611557, 255, 1),
      rgba(255, 59.00000028312206, 52.000000700354576, 0)
    )
    1 1;
}

.modal-footer {
  display: flex;
  align-items: center;
  justify-content: center;

  .modal-num {
    margin-right: 12px;
  }

  .modal-footer-right {
    width: 277px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
}
</style>
<style lang="less">
.mask {
  .ant-tabs-tab {
    color: v-bind(color);
  }

  .ant-btn-background-ghost {
    color: #fff !important;
  }
}
</style>
