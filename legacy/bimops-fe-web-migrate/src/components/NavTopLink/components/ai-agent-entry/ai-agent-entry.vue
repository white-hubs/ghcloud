<template>
  <a-badge :count="cubeMfRootGlobalState.mfRootState.unReadMessageNum" dot>
    <img :src="EntryPng" class="entry-img" @click=" handleClickEntry" />
  </a-badge>
  <a-modal v-model:visible="showModal" :width="fullScreen?'100%':'1120px'" centered class="cube-client-box"
    :class="{'cube-client-box-full-screen':fullScreen}" :footer="null">
    <MainWindow 
      @window-set="windowSet" 
      @to-business-page="toBusinessPage"
      @click-communication-button="clickCommunicationButton"
      :window-title="systemTitle" 
      :window-logo="systemLogo" 
      :authInfo="cubeMfRootGlobalState.mfRootState.authInfo"
      :msg-num="cubeMfRootGlobalState.mfRootState.unReadMessageNum" 
    />
  </a-modal>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
const EntryPng = '/resource/v1/bimops-fe-web-migrate/components/NavTopLink/components/ai-agent-entry/entry-png.png'
import { MainWindow } from '@ghcloud/desktop-client-ui'
import { WindowAction } from '@ghcloud/desktop-client-ui/src/hook/use-client';
import { useSystemName } from '@/hooks/use-system-name';
import { useRoute } from 'vue-router'
import { CallMediaType } from '@ghcloud/cube-rtc/src/data/call-define';
import type { UserInfo } from '@ghcloud/cube-ouaa-service'
import { apiProxy as CommunicateService } from '@ghcloud/cube-rtc/src/api/server';
import { message } from 'ant-design-vue';
import { CallManager } from '@ghcloud/cube-rtc';
import { CubeMfRootGlobalState, MFRootEventNameEnum, publisher } from '@ghcloud/cube-mf-root'
import { useCommunication } from '@/hooks/use-communication';
import { useSystemTitleStore } from '@/hooks/use-system-title';
import { storeToRefs } from 'pinia';

const cubeMfRootGlobalState = CubeMfRootGlobalState.getInstance()
const handleClickEntry = () => {
  showModal.value = true
}

const systemTitleStore = useSystemTitleStore();
const { systemTitle, systemLogo } = storeToRefs(systemTitleStore);


const { createCallInterface } = useCommunication()
const route = useRoute()
const systemNameStore = useSystemName()
const showModal = ref(false)
const fullScreen = ref(false)
const windowSet = (action: WindowAction)=>{
  if(action===WindowAction.CLOSE){
    showModal.value = false
    fullScreen.value = false
  }else{
    fullScreen.value = !fullScreen.value
  }
}
const toBusinessPage = (data:{ code:string; path:string})=>{
  publisher.publish(MFRootEventNameEnum.MF_ROOT_TO_APPLICATION, { code: data.code, path: data.path })
  showModal.value = false
  fullScreen.value = false
}
const clickCommunicationButton = async ({ type, userInfo }:{type:CallMediaType,userInfo:UserInfo})=>{
  message.loading('正在呼叫')
  const onlineList  = await CommunicateService.cubeCommunicateService.queryOnlineList()
  if(!onlineList.find((item)=>item.id===userInfo.id)){
    message.destroy()
    message.warning('用户不在线')
    return
  }
  const callManager = CallManager.getInstance()
  if(type=== CallMediaType.audio){
    await callManager.singleCallAudio(userInfo.id)
  }else{
    await callManager.singleCallVideo(userInfo.id)
  }
  message.destroy()
  createCallInterface(userInfo)
}

watch(()=>route.path,()=>{
  showModal.value = false
  fullScreen.value = false
})
</script>
<style lang="less" scoped>
.entry-img {
  width: 30px;
  height: 30px;
  display: inline-block;
  cursor: pointer;
}
.ant-badge{
  margin-right: 20px;
}
</style>
<style lang="less">
.cube-client-box {

  .ant-modal-close,
  .ant-modal-header {
    display: none;
  }

  .ant-modal-body {
    padding: 0;
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    transform-origin: center;
    background-color: #fff;
    width: 1120px;
    height: 720px;
    max-width: 100vw;
    max-height: 100vh;
    overflow: hidden;
    transition: all 0.3s;
  }
}

.cube-client-box-full-screen {
  .ant-modal-body {
    width: 100vw;
    height: 100vh;
    overflow: hidden;
  }
}
</style>