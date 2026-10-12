<template>
  <div class="model-camera-option" style="position: relative;">
    <div class="cube-wave-view" ref="waveView"></div>
    <div class="btn flex-center" @click="handelRecord">
      <span>语音拾取: {{ statusText }}</span>
    </div>
  </div>
</template>
<script setup>
import { computed, ref } from 'vue'
import { CubeChatAI } from '@ghcloud/cube-speech-assistant'

const emits = defineEmits(['command'])
const waveView = ref()
const chatAI = CubeChatAI.getInstance()

/** 服务连接状态 */
const connectStatus = ref(false)
/** 录音状态 */
const recordStatus = ref(false)
/** 唤醒状态 */
const awakenStatus = ref(false)
/** 回显文字 */
const text = ref('')
/** AI Loading */
const replyLoading = ref(false)
const closeLoading = ref(false)

const statusText = computed(()=>{
  if(replyLoading.value){
    return '思考中...'
  }
  if(closeLoading.value){
    return '关闭中...'
  }
  return recordStatus.value ? '开' : '关'
})

chatAI.commandCallBack = async (command) => {
  emits('command', command)
}
chatAI.statesCallBack = (states) => {
  awakenStatus.value = states.awakenStatus
  connectStatus.value = states.connectStatus
  recordStatus.value = states.recordStatus
  replyLoading.value = states.replyLoading
  text.value = states.speechText
}

async function handelRecord (){
  if(closeLoading.value){
    return
  }
  if(recordStatus.value){
    closeLoading.value=true
    waveView.value.innerHTML = ''
    await chatAI.stopRecord()
    closeLoading.value=false
  }else{
    chatAI.startRecord()
    chatAI.createWaveView('.cube-wave-view')
  }
}
</script>
<style scoped>
.btn{
  background: rgba(0, 0, 0, 0.3);
  padding: 0.02083rem 0.04167rem;
  border-radius: 0.03125rem 0.03125rem 0.03125rem 0.03125rem;
  cursor: pointer;
  user-select: none;
  position: relative;
}
.cube-wave-view{
  width: 100%;
  height: 100%;
  position: absolute;
  top: 100%;
  left: 0;
}
</style>