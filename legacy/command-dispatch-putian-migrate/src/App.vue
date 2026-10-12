<template>
  <a-config-provider :locale="locale">
    <div id="app">
      <router-view />
    </div>

    <!-- <Transition
      enter-active-class="animate__animated animate__jackInTheBox"
      leave-active-class="animate__animated animate__rollOut"
    > -->
    <div v-if="visible" @click="handleClickAlarm" class="alarmDetail-wrap">
      <div class="a" style="
          background: rgba(25, 35, 56, 0.7);
          position: absolute;
          transform: translate(-50%, -50%);
          left: 50%;
          top: 50%;
          width: 500px;
          height: 548px;
        ">
        <div class="mask" :class="getclass(alarmArr[currentAlarmIndex].alarmLevelName)">
          <div class="alarmDetail-modal-header">
            <div class="header-title">
              <span>{{ alarmArr[currentAlarmIndex].alarmTypeName }}</span>
              <a-tag :color="getclass(alarmArr[currentAlarmIndex].alarmLevelName)" style="margin-left: 10px">
                {{ alarmArr[currentAlarmIndex].alarmLevelName }}
              </a-tag>
            </div>
            <div class="header-close" @click="handleOk">
              <CloseOutlined />
            </div>
          </div>
          <div class="alarm_name" :style="`background-image: url(${getImg(
              alarmArr[currentAlarmIndex].alarmLevelName
            )}`">
            <div style="font-size: 18px">
              {{ alarmArr[currentAlarmIndex].alarmEventName }}
            </div>
            <div style="font-size: 12px">
              {{ alarmArr[currentAlarmIndex].alarmTime }}
            </div>
          </div>
          <a-tooltip placement="topLeft" :title="getSJ(alarmArr[currentAlarmIndex])" arrow-point-at-center>
            <div style="
                height: 57px;
                background: rgba(0, 0, 0, 0.3);
                line-height: 57px;
                padding: 0 15px;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
                color: #fff;
              " :style="
                path == '/commandDispatch'
                  ? ' background: rgba(0, 0, 0, 0.3);'
                  : 'background: rgba(0,0,0,0.05);'
              ">
              【{{ alarmArr[currentAlarmIndex].alarmTargetName }}】 在【{{
              alarmArr[currentAlarmIndex].areaName
              }}】发生 【{{
              alarmArr[currentAlarmIndex].alarmEventName
              }}】报警事件
            </div>
          </a-tooltip>

          <a-tabs v-model:activeKey="activeKey" v-if="alarmArr[currentAlarmIndex].videoArr.length > 0">
            <a-tab-pane :key="v.deviceId" :tab="v.deviceName" v-for="v in alarmArr[currentAlarmIndex].videoArr">
              <div class="alarm-video-container">
                <gVideo :token="v.token" @error="videoError" />
                <div style="
                    position: absolute;
                    top: 57px;
                    z-index: -1;
                    width: 100%;
                    height: 269px;
                    text-align: center;
                    line-height: 269px;
                  ">
                  <img src="/resource/v1/command-dispatch-putian-migrate/images/1.png" alt="" v-if="path == '/commandDispatch'" />
                  <img src="/resource/v1/command-dispatch-putian-migrate/images/2.png" alt="" v-else />
                </div>
              </div>
            </a-tab-pane>
          </a-tabs>
          <div
            v-else-if="['ELECTRICMANAGE','FIRECONTROL','ROTATINGMANAGE'].includes(alarmArr[currentAlarmIndex].alarmTypeCode)">
            <div class="alarm-chart-container">
              <AlarmChartComponent :alarmInfo="alarmArr[currentAlarmIndex]"
                :id="alarmArr[currentAlarmIndex].businessKey"></AlarmChartComponent>
            </div>
          </div>
          <div v-else style="
              position: absolute;
              top: 183px;
              right: 0;
              z-index: -1;
              width: 100%;
              height: 269px;
              text-align: center;
              line-height: 269px;
            ">
            <img src="/resource/v1/command-dispatch-putian-migrate/images/1.png" alt="" v-if="path == '/commandDispatch'" />
            <img src="/resource/v1/command-dispatch-putian-migrate/images/2.png" alt="" v-else />
          </div>
          <div style="position: fixed; bottom: 17px; width: 480px">
            <div class="modal-footer" style="margin-top: 20px">
              <div class="modal-footer-right">
                <span class="modal-num" style="color: #fff">
                  {{ currentAlarmIndex + 1 }}/{{ alarmArr.length }}
                </span>
                <a-button key="pre" siz="small" :disabled="currentAlarmIndex === 0" @click="handlePre">
                  上一条
                </a-button>
                <a-button siz="small" key="next" :disabled="currentAlarmIndex === alarmArr.length - 1"
                  @click="handleNext">
                  下一条
                </a-button>
                <a-button siz="small" key="submit" type="primary" @click="handleOk">
                  关闭
                </a-button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- </Transition> -->
    <!-- <a-modal
      v-model:visible="visible"
      :maskClosable="false"
      :title="modalTitle"
      @ok="handleOk"
      width="900px"
    >
      <template #footer>
        <div class="modal-footer">
          <a-button key="submit" type="primary" @click="handleMore">
            更多
          </a-button>
          <div class="modal-footer-right">
            <span class="modal-num">
              {{ currentAlarmIndex + 1 }}/{{ alarmArr.length }}
            </span>
            <a-button
              key="pre"
              :disabled="currentAlarmIndex === 0"
              @click="handlePre"
            >
              上一条
            </a-button>
            <a-button
              key="next"
              :disabled="currentAlarmIndex === alarmArr.length - 1"
              @click="handleNext"
            >
              下一条
            </a-button>
            <a-button key="submit" type="primary" @click="handleOk">
              关闭
            </a-button>
          </div>
        </div>
      </template>
<template v-for="item in alarmArr">
        <div
          class="alarm-modal"
          v-if="visible && currentAlarm === item.id"
          :key="item.id"
        >
          <div class="alarm-tips">
            <div class="alarm-tips-icon">
              <img
                class="imgTwinkling"
                src="/resource/v1/command-dispatch-putian-migrate/images/系统检测报警.svg"
                alt=""
                srcset=""
              />
              <div>{{ item.alarmTypeName }}</div>
            </div>
            <div class="alarm-tips-device">
              <div>【{{ item.alarmTargetName }}】</div>
              <div>{{ item.alarmEventName }}</div>
            </div>
          </div>
          <div class="alarm-video">
            <a-tabs v-model:activeKey="activeKey">
              <a-tab-pane
                :key="v.deviceId"
                :tab="v.deviceName"
                v-for="v in item.videoArr"
              >
                <div class="alarm-video-container">
                  <gVideo :token="v.token" />
                </div>
              </a-tab-pane>
            </a-tabs>
          </div>
        </div>
      </template>
</a-modal> -->
    <a-modal v-model:visible="passwordVisible" title="警告信息" :keyboard="false" :maskClosable="false" :closable="false"
      @ok="handleOk">
      <template #footer>
        <a-button key="back" @click="handleCancel" type="danger" v-if="!password_forced">
          暂不修改
        </a-button>
        <a-button key="submit" type="primary" @click="handleEdit">
          去修改
        </a-button>
      </template>
      <a-alert :message="description" type="warning" show-icon />
    </a-modal>
  </a-config-provider>
</template>
<script>
import { getToken, storeToken } from "@/services/AccountService";
import { Button, notification } from "ant-design-vue";
import zh_CN from "ant-design-vue/es/locale/zh_CN";
import { CloseOutlined } from "@ant-design/icons-vue";
import moment from "moment";
import * as echarts from "echarts";
import qs from "qs"
import AlarmChartComponent from "./components/alarm-chart-components/index.vue";
import {
  defineComponent,
  getCurrentInstance,
  h,
  onMounted,
  provide,
  reactive,
  ref,
  toRefs,
  watch,
} from "vue";
import { useRoute, useRouter } from "vue-router";
import { useStore } from "vuex";
import { GHMessage } from './utils/message.js'
export default defineComponent({
  components: { CloseOutlined, AlarmChartComponent },
  setup() {
    const { proxy } = getCurrentInstance();
    const store = useStore();
    const router = useRouter();
    const route = useRoute();
    let ws;
    const locale = ref(zh_CN);
    if (localStorage.getItem("skinColor")) {
      const color = JSON.parse(localStorage.getItem("skinColor"));
      if (window.less && window.less.modifyVars) {
        window.less
          .modifyVars({
            "primary-color": color.primaryColor,
            "btn-primary-bg": color.btnPrimaryBg,
          })
          .then((res) => {
          })
          .catch((res) => {
          });
      }
    }

    const state = reactive({
      limitConnect: 3, //允许重连次数
      timeConnect: 0, //重连次数
      lockReconnect: false,
      tenant: "",
      timer: null,
      visible: false,
      activeKey: null,
      alarmArr: [],
      currentAlarm: null,
      currentAlarmIndex: 0,
      modalTitle: null,
      VideoSessionTimer: null,
      passwordVisible: false,
      password_forced: false,
      description: "密码过期,请及时修改！",
      menus: {
        name: "个人管理",
        id: "pensonalManage",
        menu: [
          {
            name: "个人资料",
            applicationName: "个人管理",
            id: "pensonalInfo",
            parentId: "pensonalManage",
            path: "/pensonalInfo",
            applicationId: "1462716697766096898",
            applicationCode: "grgl",
            children: [],
          },
          {
            name: "修改密码",
            applicationName: "个人管理",
            id: "modifyPassword",
            parentId: "pensonalManage",
            path: "/modifyPassword",
            applicationId: "1462716697766096898",
            applicationCode: "grgl",
            children: [],
          },
          {
            name: "我的企业",
            applicationName: "个人管理",
            id: "myTenant",
            parentId: "pensonalManage",
            path: "/myTenant",
            applicationId: "1462716697766096898",
            applicationCode: "grgl",
            children: [],
          },
        ],
      },
    });

    provide("echarts", echarts);
    //获取流媒体地址
    const getVideoUrl = () => {
      const serveIp = window.location.protocol;
      proxy.$api.getStreamMediaConfig().then((res) => {
        // http地址  流媒体对应使用http地址   https地址流媒体对应使用https
        if (serveIp === "http") {
          window.videoUrl = res.intranetAddress
            ? res.intranetAddress.split("//")[1]
            : null;
          window.protocol = res.intranetAddress
            ? res.intranetAddress.split("//")[0]
            : "http:";
        } else {
          window.videoUrl = res.ipAddress ? res.ipAddress.split("//")[1] : null;
          window.protocol = res.ipAddress
            ? res.ipAddress.split("//")[0]
            : "https:";
        }
      });
    };
    //消息通知方法
    const openNotification = (data) => {
      const key = `open${Date.now()}`;
      notification.open({
        message: data.applicationName,
        description: `${data.msgContent}`,
        btn: h(
          Button,
          {
            type: "primary",
            size: "small",
            onClick: () => {
              closeNotification(data);
              notification.close(key);
            },
          },
          "已读"
        ),
        key,
        duration: 4.5,
        placement: "bottomRight",
      });
    };
    // 
    const closeNotification = (data) => {
      proxy.$api.checkedRead([data.id], "put");
    };
    const initWebSoket = async () => {
      if (ws) {
        ws.close(4999);
      }
      const token = await getToken();
      const code = store.getters.nowEnterprise?.code;
      const url = `${window.config.websoketUrl}?terminal=${window.config.terminal}&token=${token.access_token}&tenant=${code}`;
      ws = new WebSocket(url);
      ws.onopen = open;
      ws.onerror = error;
      ws.onclose = close;
      ws.onmessage = message;
    };

    let healthInterval;
    const open = (e) => {
      clearInterval(healthInterval);
      // 定时器判断连接状态
      healthInterval = setInterval(() => {
        // 未连接
        if (ws.readyState === 3) {
          return;
        }
        const health = {
          msgType: "health",
          eventDataDTO: "ping",
        };
        ws.send(JSON.stringify(health));
      }, 1000 * 10);
      //连接成功--启动心跳
      // heartCheck.start(e.type);
    };
    let path = ref("/");
    const color = ref("");

    const message =async (e) => {
      // 消息接收
      const message = JSON.parse(e.data);
      if (["welcome", "health"].includes(message.msgType)) {
        getMsgNum();
      }
      if (message.msgType === "NOTICE_MESSAGE") {
        if (message.eventDataDTO.data.msgType == "ALARM_NOTICE") {
          if (message.eventDataDTO.data.businessPrincipal) {
            path.value = route.path;

            color.value = route.path == "/commandDispatch" ? "#fff" : "#000";
            let bjMessage = JSON.parse(
              message.eventDataDTO.data.businessPrincipal
            );
            const result = await proxy.$api.getAlarmDetail(bjMessage.businessKey)
            bjMessage.alarmSnapshot = result.alarmSnapshot ? result.alarmSnapshot : ""
            if (bjMessage.alarmLevelCode == "one_level") {
              proxy.$emitter.emit("playAudio");
            }
            getEventVideo(bjMessage);
          }
        } else {
          openNotification(message.eventDataDTO.data);
        }
      } else if (message.msgType === "DEVICE_ATTRIBUTE_CHANGE") {
        store.commit(
          "dataSubscription/SET_REALTIME_DATA",
          message.eventDataDTO.data
        );
      }
      // if (JSON.parse(e.data)?.data) {
      //   openNotificationWithIcon(JSON.parse(e.data));
      //   getMsgNum();
      // }
    };

    const close = (e) => {
      clearInterval(healthInterval);
      // https://developer.mozilla.org/en-US/docs/Web/API/CloseEvent/code
      const CLOSE_NORMAL = 1000;
      if (e.code !== CLOSE_NORMAL) {

        reconnect();
      }
    };
    const error = (e) => {
      clearInterval(healthInterval);
      reconnect();
    };

    // 断线重连
    const reconnect = () => {
      if (state.lockReconnect) return;
      state.lockReconnect = true;
      setTimeout(function () {
        //没连接上会一直重连，设置延迟避免请求过多
        if (sessionStorage.getItem("GH-Token")) {
          initWebSoket();
        }
        state.lockReconnect = false;
      }, 5000);
    };

    const openNotificationWithIcon = (e) => {
      notification.warning({
        message: `待处理消息--${e.data?.satMsgDefineName}`,
        description: e.data?.msgContent,
        duration: 4.5,
        onClick: async () => {
          const data = await proxy.$api.getApplicationInMenus(
            {
              applicationCode: "MESSAGE_CENTER", //用code
            },
            "get"
          );
          let applicationsArr = [];
          store.getters.applications.forEach((item) => {
            applicationsArr = applicationsArr.concat(item.applicationPageVOS);
          });
          const application = applicationsArr.find(
            (item) => item.id === "1457895655887384578"
          );
          if (application) {
            store.commit("menu/SET_APPLICATION", application);
          }
          if (data && data.length) {
            if (route.path === "/index") {
              store.commit("menu/SET_TABS_PANE", []);
            }
            store.commit("menu/SET_MENU", data);
            router.replace("/myMessage");
          }
        },
      });
    };
    const getMsgNum = async () => {
      const data = await proxy.$api.unReadNum("CHANNEL_SITE", "get");
      store.commit("unReadMsgNum/SET_UNREAD_NUM", data === true ? "" : data);
      const data2 = await proxy.$api.getAlarmMsgUnConfirmedCount();
      store.commit(
        "unReadMsgNum/SET_UNREAD_ALARMNUM",
        data2 === true ? "" : data2
      );
    };
    // 获取报警视频监控
    const getEventVideo = (data) => {
      proxy.$api.getEventVideo({ id: data.businessKey }).then((res) => {
        data.alarmTime = moment(data.alarmTime).format("YYYY-MM-DD HH:mm:ss");
        state.alarmArr.push({
          ...data,
          videoArr: res,
        });
        if (res[0]) {
          state.activeKey = res[0].deviceId;
        }
        state.currentAlarm = data.id;
        state.visible = true;
        state.modalTitle = data.alarmLevelName + "报警";
      });
    };
    //点击上一条
    const handlePre = () => {
      if (state.currentAlarmIndex > 0) {
        state.currentAlarmIndex = state.currentAlarmIndex - 1;
        state.currentAlarm = state.alarmArr[state.currentAlarmIndex].id;
        state.modalTitle =
          state.alarmArr[state.currentAlarmIndex].alarmLevelName + "报警";
      }
    };
    //点击下一条
    const handleNext = () => {
      if (state.currentAlarmIndex < state.alarmArr.length - 1) {
        state.currentAlarmIndex = state.currentAlarmIndex + 1;
        state.currentAlarm = state.alarmArr[state.currentAlarmIndex].id;
        state.modalTitle =
          state.alarmArr[state.currentAlarmIndex].alarmLevelName + "报警";
      }
    };
    //获取视频ession
    const getVideoPtzSession = () => {
      state.VideoSessionTimer = null;
      proxy.$api.getVideoPtzSession().then((res) => {
        if (res && res.session) {
          window.videoSession = res.session;
          sessionStorage.setItem("videoSession", res.session);
          // let expireTimes = 2*60*1000;
          // if(res.expireTimes){
          //   expireTimes = Number(res.expireTimes);
          // }
          // state.VideoSessionTimer = setTimeout(() => {
          //   if (sessionStorage.getItem("GH-Token")) {
          //     getVideoPtzSession();
          //   }
          // }, expireTimes * 1000);
        }
      })
        .catch((error) => {
          setTimeout(() => {
            getVideoPtzSession();
          }, 10 * 1000);
        });
    };
    onMounted(() => {
      // fix-me(dank): 此处逻辑为临时处理直接从 url 访问时，因初始化顺序错误，
      // 无法获取到 GH-TOKEN 导致 App.vue 错误初始化问题。与 /src/routes/index.js beforeEach 初始化逻辑一致
      // 后续指挥调度需要整体重构处理
      const params = window.location.search?.split("?")[1];
      if (params && params.includes("access_token")) {
        const token = qs.parse(params);
        token.nowEnterprise = token.nowEnterprise.replaceAll('%22', '"')
        store.commit(
          "enterprise/SET_NOW_ENTERPRISE",
        JSON.parse(token.nowEnterprise)  
        );
        sessionStorage.setItem('GH-NowEnterprise', token.nowEnterprise)
        for (const key in token) {
          if (token[key] === 'false') {
            token[key] = false
          } else if (token[key] === 'true') {
            token[key] = true
          }
        }
        storeToken(token);
      }
      // fix-me-end
      if (sessionStorage.getItem("videoSession")) {
        window.videoSession = sessionStorage.getItem("videoSession");
      }
      if (sessionStorage.getItem("GH-Token")) {
        getVideoUrl();
        getVideoPtzSession();
        initWebSoket();
        initWebSoketMsg();
        openPasswprd();
      }
    });
    //打开密码提示
    const openPasswprd = () => {
      const token = JSON.parse(sessionStorage.getItem("GH-Token"));
      if (token && route.path !== "/modifyPassword") {
        state.password_forced = token.password_forced;
        if (token.password_expired && token.password_forced) {
          //密码过期且强制修改
          state.description = "密码过期,请及时修改！";
          state.passwordVisible = true;
        } else if (token.password_expired && !token.password_forced) {
          //密码过期且不强制修改
          if (
            sessionStorage.getItem("password_forced") &&
            sessionStorage.getItem("password_forced") === "not"
          ) {
            state.passwordVisible = false;
          } else {
            state.passwordVisible = true;
          }
        }
      } else {
        state.passwordVisible = false;
      }
    };
    //点击关闭
    const handleOk = () => {
      state.visible = false;
    };
    //点击更多
    const handleMore = async () => {
      state.visible = false;
      if (route.path == "/commandDispatch") {
        proxy.$emitter.emit(
          "openDevice",
          state.alarmArr[state.currentAlarmIndex]
        );
      } else {
        let {
          applicationCode,
          applicationName,
          alarmTargetKey,
          businessKey,
          id,
        } = state.alarmArr[state.currentAlarmIndex];
        gotask(
          applicationCode,
          applicationName,
          alarmTargetKey,
          businessKey,
          id
        );
        return;
      }
    };

    const gotask = async (appcode, appname, deviceId, businessKey, id) => {
      const token = await getToken();
      const path = appcode == "SECURITY_MONITORING"
        ? "/portal/securityMonitoring/alarmDetail"
        : "/portal/genericEquipmentMonitor/alarmDetail";
      const nowEnterprise = store.getters.nowEnterprise;
      window.open(`${window.origin}${path}?otherPlatForm=1&applicationCode=${appcode}&nowEnterprise=${JSON.stringify(nowEnterprise)}&access_token=${token.access_token}&businessKey=${businessKey}&type=detail&deviceId=${deviceId}&id=${id}`)
    };
    //关闭密码提示
    const handleCancel = () => {
      state.passwordVisible = false;
      sessionStorage.setItem("password_forced", "not");
    };
    //去修改密码
    const handleEdit = () => {
      state.passwordVisible = false;
      store.commit("menu/SET_APPLICATION", state.menus);
      store.commit("menu/SET_MENU", state.menus.menu);
      router.replace({ path: "/modifyPassword" });
    };
    watch(
      () => store.getters.nowEnterprise,
      (n) => {
        if (n) {
          if (ws) {
            ws.close();
          }
          initWebSoket();
          initWebSoketMsg()
          getVideoUrl();
          getVideoPtzSession();
          proxy.$emitter.emit("switchTenant");
        }
      }
    );
    watch(
      () => state.visible,
      (n) => {
        if (!n) {
          state.activeKey = null;
          state.alarmArr = [];
          state.currentAlarm = null;
          state.currentAlarmIndex = 0;
        }
      }
    );
    watch(
      () => route.path,
      (n) => {
        if (n == "/login") {
          state.visible = false;
        }
      }
    );
    watch(
      () => route.path,
      (n) => {
        if (n === "/login") {
          if (ws) {
            ws.close();
          }
        } else {
          openPasswprd();
        }
      }
    );
    const getImg = (status) => {
      if (status == "一级") {
        return "/resource/v1/command-dispatch-putian-migrate/images/hong.png";
      } else if (status == "二级") {
        return "/resource/v1/command-dispatch-putian-migrate/images/cheng.png";
      } else if (status == "三级") {
        return "/resource/v1/command-dispatch-putian-migrate/images/huang.png";
      } else {
        return "/resource/v1/command-dispatch-putian-migrate/images/lan.png";
      }
    };
    const getclass = (status) => {
      if (status == "一级") {
        return "red";
      } else if (status == "二级") {
        return "yellow";
      } else if (status == "三级") {
        return "orange";
      } else {
        return "blue";
      }
    };
    const getSJ = (data) => {
      return ` 【${data.alarmTargetName} 在【
             ${data.areaName}
            】发生 【
              ${data.alarmEventName}
            】报警事件`;
    };
    const showvideo = ref(true);

    const videoError = (data) => {
      showvideo.value = data;
    };
    let alarmMessageData = null
    const messageMsg = (message) => {
      // 消息接收
      if (["welcome", "health"].includes(message.msgType)) {
        getMsgNum();
      }
      // 不分消息公共处理方法
      const timeoutHanderFun = (message) => {
        const timeoutMsg = {
          msgContent: message.eventDataDTO.data.msgContent,
          msgType: message.eventDataDTO.data.msgType,
          businessPrincipal: JSON.parse(
            message.eventDataDTO.data.businessPrincipal
          )
        }
        proxy.$emitter.emit("timeoutEvent", timeoutMsg);
      }

      // 通知消息执行方法
      const NOTICE_MESSAGE_MSGTYPEForHanlder = {
        // 报警
        ALARM_NOTICE: (message) => {
          if (message.eventDataDTO.data.businessPrincipal) {
            path.value = route.path;
            color.value = route.path == "/commandDispatch" ? "#fff" : "#000";
            let bjMessage = JSON.parse(
              message.eventDataDTO.data.businessPrincipal
            );
            alarmMessageData = bjMessage
            proxy.$emitter.emit("alarmMessagePush", bjMessage);
            if (bjMessage.alarmLevelCode == "one_level") {
              proxy.$emitter.emit("playAudio");
            }
            getEventVideo(bjMessage);
          }
        },
        // 报警长时间无人接收提示
        ALARM_TIMEOUT_UN_CONFIRMED_NOTICE: (message) => {
          timeoutHanderFun(message)
        },
        // 即将超时
        ALARM_IMMEDIATELY_TIMEOUT_NOTICE: (message) => {
          timeoutHanderFun(message)
        },
        // 已超时未处理
        ALARM_TIMEOUT_UN_HANDLER_NOTICE: (message) => {
          timeoutHanderFun(message)
        },
        // 巡更异常任务
        PATROL_TASK_ABNORMAL_MESSAGE: (message) => {
          timeoutHanderFun(message)
        }
      }
      if (message.msgType === "NOTICE_MESSAGE") {
        if (NOTICE_MESSAGE_MSGTYPEForHanlder[message.eventDataDTO.data.msgType]) {
          NOTICE_MESSAGE_MSGTYPEForHanlder[message.eventDataDTO.data.msgType](message)
        } else {
          openNotification(message.eventDataDTO.data);
        }
      } else if (message.msgType === "DEVICE_ATTRIBUTE_CHANGE") {
        store.commit(
          "dataSubscription/SET_REALTIME_DATA",
          message.eventDataDTO.data
        );
      }
    };
    const handleClickAlarm = () => {
      proxy.$emitter.emit("clickAlarm", alarmMessageData);
    }
    let wsMsg = null
    // 消息2.0 对接
    const initWebSoketMsg = async () => {
      const token = await getToken();
      const tenant = store.getters.nowEnterprise?.code;
      wsMsg && wsMsg.dispose()
      wsMsg = new GHMessage({
        accessToken: token.access_token,
        tenant: tenant,
        terminal: window.config.terminal,
        subscribeType: 'broadcast'
      })
      wsMsg.onmessage(messageMsg)
    };

    return {
      gotask,
      showvideo,
      videoError,
      handleClickAlarm,
      color,
      path,
      getSJ,
      getclass,
      ...toRefs(state),
      getImg,
      locale,
      handleOk,
      handleNext,
      handlePre,
      handleMore,
      handleCancel,
      handleEdit,
      openPasswprd,
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

  >div {
    height: 100%;
    width: 100%;
  }

  // background-color: @background_2;
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

  >div {
    width: 50%;
    height: 100%;

    &.alarm-tips {
      display: flex;
      align-items: center;
      justify-content: center;

      .alarm-tips-icon {
        margin-right: 30px;

        >div {
          text-align: center;
        }
      }

      .alarm-tips-device {
        >div {
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
  position: absolute;
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
  background: linear-gradient(180deg,
      rgba(255, 59, 52, 0.3) 0%,
      rgba(8, 13, 23, 0) 100%);

  border-image: linear-gradient(180deg,
      rgba(255, 59.00000028312206, 52.000000700354576, 1),
      rgba(255, 59.00000028312206, 52.000000700354576, 0)) 1 1;
}

.yellow {
  background: linear-gradient(180deg,
      rgba(255, 110, 52, 0.3) 9%,
      rgba(8, 13, 23, 0) 100%);
  border-image: linear-gradient(180deg,
      rgba(255, 110.00000104308128, 52.000000700354576, 1),
      rgba(255, 110.00000104308128, 52.000000700354576, 0)) 1 1;
}

.orange {
  border-image: linear-gradient(180deg,
      rgba(255, 194.00000363588333, 52.000000700354576, 1),
      rgba(255, 194.00000363588333, 52.000000700354576, 0)) 1 1;
  background: linear-gradient(180deg,
      rgba(255, 194, 52, 0.3) 0%,
      rgba(8, 13, 23, 0) 100%);
}

.blue {
  background: linear-gradient(180deg,
      rgba(24, 144, 255, 0.3) 0%,
      rgba(8, 13, 23, 0) 100%);
  border-image: linear-gradient(180deg,
      rgba(24.000000469386578, 144.00000661611557, 255, 1),
      rgba(255, 59.00000028312206, 52.000000700354576, 0)) 1 1;
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

.alarmDetail-wrap {
  position: fixed;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  z-index: 1000;
  background: rgba(0, 0, 0, 0.3);
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
