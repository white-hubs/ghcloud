<template>
</template>

<script setup>
import { socketEmitter } from './socket-mitt';
import { initWebSocket, closeWebSocket } from './message'
import { getCurrentInstance, onBeforeUnmount, onMounted, h, ref } from 'vue';
import qs from "qs";
import { Button, notification } from "ant-design-vue";
import * as api from '@/api'
import { useStore } from "vuex";
import { storeToken } from '@/services/AccountService';

const { proxy } = getCurrentInstance();
const store = useStore();
socketEmitter.on('socket-message', async (message) => {
  const msgType = message.msgType;
  // ["welcome", "health"].includes(msgType) && getMsgNum();

  if (!message.eventDataDTO) {
    return
  }
  const msgData = message.eventDataDTO.data
  if (msgType === "NOTICE_MESSAGE") {
    if (["ACCOUNT_DISABLE_MESSAGE", "ACCOUNT_PASSWORD_UPDATE"].includes(msgData)) {
      proxy.$message.warn(msgData === "ACCOUNT_DISABLE_MESSAGE" ? "账号已禁用，即将退出" : '账号密码已修改，即将退出');
      setTimeout(() => {
        sessionStorage.clear()
        window.location.href = "/login";
      }, 1500);
    } else {
      openNotification(msgData);
    }
  } else if (msgType === "DEVICE_ATTRIBUTE_CHANGE") {
    store.commit("dataSubscription/SET_REALTIME_DATA", msgData);
  }
})
const iframeMessage = (event) => {
}
//消息通知方法
const openNotification = (data) => {
  const key = `open${Date.now()}`;
  notification.open({
    message: data.applicationName,
    description: `${data.msgContent}`,
    // btn: h(
    //   Button,
    //   {
    //     type: "primary",
    //     size: "small",
    //     onClick: () => {
    //       closeNotification(data);
    //       notification.close(key);
    //     },
    //   },
    //   "详情"
    // ),
    key,
    duration: 4.5,
    placement: "bottomRight",
  });
};
const closeNotification = (d) => {
//  history.pushState({ current: location.pathname + location.search }, '', `/portal/operating-room-admin-manage/over-limit-record?id=${data.id}&businessId=${data.businessId}&type=detail`)
};
const getMsgNum = async () => {
  api.unReadNum("CHANNEL_SITE", "get").then((data) => {
    store.commit("unReadMsgNum/SET_UNREAD_NUM", data === true ? "" : data);
  })
  api.getAlarmMsgUnConfirmedCount().then((data) => {
    store.commit("unReadMsgNum/SET_UNREAD_ALARMNUM", data === true ? "" : data);
  })
};
onMounted(() => {
  initWebSocket()
  window.addEventListener("message", iframeMessage)
  setTimeout(() => {
    closeNotification()
  }, 3000);
})

onBeforeUnmount(() => {
  closeWebSocket()
  window.removeEventListener("message", iframeMessage)
})
</script>

<style lang="less" scoped>
#configuration {
  position: absolute;
  width: 498px;
  height: 548px;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: -moz-radial-gradient(circle, #7b9dbe, #112440);
  background: -webkit-gradient(radial,
      center center,
      0,
      center center,
      460,
      from(#7b9dbe),
      to(#112440));
  background: -webkit-radial-gradient(circle, #7b9dbe, #112440);
  background-size: cover;
  background-position: center center;
}
</style>