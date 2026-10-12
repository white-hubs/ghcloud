<template>
  <iframe id="configuration" v-if="iframeUrl" v-show="alarmInit" :src="iframeUrl" allowfullscreen
    allow="autoplay"></iframe>
</template>

<script setup>
import { getCurrentInstance, onBeforeUnmount, onMounted, h, ref } from 'vue';
import qs from "qs";
import { getMarketConfig } from "@/api/alarm";
import { Button, notification, Modal } from "ant-design-vue";
import * as api from '@/api'
import { CubeAlarmModal } from '@ghcloud/cube-alarm-modal/src/register'
import { CubeMfRootGlobalState, MFRootEventNameEnum, publisher } from '@ghcloud/cube-mf-root'

const { proxy } = getCurrentInstance();
const iframeUrl = ref('')
const alarmInit = ref(false);
const marketAlarmDetails = ref()

CubeMfRootGlobalState.getInstance().onHeadquartersAlarm(async(msgData) => { 
  const alarmMessage = JSON.parse(msgData.businessPrincipal);
  marketAlarmDetails.value = alarmMessage;
  if (alarmMessage.marketTenant) {
    const res = await getMarketConfig(alarmMessage.marketTenant)
    marketAlarmDetails.value.applicationName = res.marketName
    if (res) {
      iframeUrl.value = `${res.url}/apps/@ghcloud/cube-alarm-modal?client_id=${res.account}&client_secret=${res.password}&businessKey=${alarmMessage.businessKey}`
    }
  }
})


// 总部报警弹窗
const iframeMessage = (event) => {
  if (event.data.type === 'cube-alarm-modal-ready') {
    document.getElementById("configuration")?.contentWindow.postMessage({ type: 'cube-alarm-message', data: JSON.stringify(marketAlarmDetails.value) }, '*')
  } else if (event.data.type === "cube-alarm-modal-completed") {
    alarmInit.value = true
  }
  else if (event.data.type === "cube-alarm-modal-close") {
    iframeUrl.value = "";
    alarmInit.value = false;
  }
}

onMounted(() => {
  window.addEventListener("message", iframeMessage)
})

onBeforeUnmount(() => {
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