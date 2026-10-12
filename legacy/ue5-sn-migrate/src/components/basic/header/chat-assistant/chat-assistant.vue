<template>
  <div class="speech-safety-analysis" @click.stop="handelClickAnalysis" v-if="loadStatus">
    安全分析
  </div>
  <div class="speech-safety-analysis-modal-body" v-show="visible" >
    <div class="speech-safety-analysis-modal-main">
      <div class="speech-safety-analysis-modal-close" @click.capture="handelClickAnalysis">
        <CloseOutlined style="color:black" />
      </div>
      <SecurityAnalysisReport otherHeight="32" />
    </div> 
  </div>
  <DragBox :initPosition="iconPosition" @drag="()=>{iconDrag = true}" @dragEnd="dragEnd" v-if="loadStatus">
    <div class="ai-icon" @click="handelClickChat"></div>
  </DragBox>
  
  <div class="ai-widget-holder ai-elements--right" :class="{'ai--hide':!openStatus,'ai-fullscreen':fullScreen}" id="cw-widget-holder" ref="iframeContainer"  v-show="awakenStatus===false">
    <div class="window-action">
      <div class="item" style="background: #52C41A;">
        <ShrinkOutlined style="font-size: '10px';font-weight: 600;" v-if="fullScreen" @click="onMinimize"/>
        <ArrowsAltOutlined style="font-size: '10px';font-weight: 600;" v-else @click="onMaximize"/>
      </div>
      <div class="item" style="background: #FADB14;" @click="onMinimize">
        <MinusOutlined style="font-size: '10px';font-weight: 600;"/>
      </div>
      <div class="item" style="background: #F5222D;" @click="onClose">
        <CloseOutlined style="font-size: '10px';font-weight: 600;"/>
      </div>
    </div>
  </div>
  <div class="speech-drawer" :style="{transform:`translateY(${awakenStatus||speechText||markdownText?'0':'200%'})`}">
    <div class="robot"></div>
    <div class="text" v-show="speechText">{{ speechText }}<LoadingOutlined style="margin-left: 20px;" v-show="replyLoading"/></div>
    <div v-html="markdownText" class="markdown-text"></div>
    <div class="cube-speech-wave-view" v-show="!markdownText"></div>
  </div>
</template>
<script setup>
import { nextTick, onMounted, ref,watch } from 'vue';
import { executeCommand, getCubeAIAssistant } from './ai-command';
import * as lottie from 'lottie-web'
import robotLottie from './assets/robot-lottie.json'
import { CubeSpeechAI } from '@ghcloud/cube-speech-assistant'
import { LoadingOutlined,MinusOutlined,CloseOutlined,ShrinkOutlined,ArrowsAltOutlined} from '@ant-design/icons-vue'
const iAmHere = '/resource/v1/audio/i-am-here.mp3'
const ok = '/resource/v1/audio/ok.mp3'
const iCannotUnderstand = '/resource/v1/audio/i-cannot-understand.mp3'
import { DragBox } from '@ghcloud/desktop-client-ui/src/components/calling-interface-for-web/drag-box';
import { getAgentList } from '@ghcloud/cube-ai-assistant-app/src/api/server'
import { SecurityAnalysisReport } from '@ghcloud/cube-safety-supervision-app/src/views/security-analysis/security-analysis-report/security-analysis-report.tsx'

const audioMap = {
  'i-am-here': new Audio(iAmHere),
  'ok': new Audio(ok),
  'iCannotUnderstand': new Audio(iCannotUnderstand)
}
const speechAI = CubeSpeechAI.getInstance()
/** 语音服务连接状态 */
const connectStatus = ref(false)
/** 录音状态 */
const recordStatus = ref(false)
/** chat 弹窗容器 */
const iframeContainer = ref()
/** chat 弹窗显示状态 */
const openStatus = ref(false)
/** AI 助手是否加载完成 */
const loadStatus = ref(false)
/** 聊天窗口全屏状态 */
const fullScreen = ref(false)
/** 语音按钮动画控制 */
const speechIconPlay = ref(false)
const powerLevel = ref(0)
const iconDrag = ref(false)
const iconPosition =  {
  x: document.body.clientWidth - 170,
  y: document.body.clientHeight - 170
}
/** 聊天AI实例 */
let cubeAIAssistant = null 
const replyLoading = ref(false)
const awakenStatus = ref(false)
const speechText = ref('') 
const markdownText = ref('')
const visible = ref(false)

watch(visible,(val)=>{
  if(val === false){
    const elements = document.querySelectorAll('[class*="label3d"]');
    elements.forEach(el => {
      el.style.display = 'block';
    });
  }
})

const handelClickChat = () => {
  if(iconDrag.value){
    return
  }
  openStatus.value = !openStatus.value
}
const handelClickRecord=()=>{
  if(recordStatus.value){
    stopRecord()
    return
  }
  startRecord()
}
const handelClickAnalysis = () =>{
  visible.value = !visible.value
  if(visible.value){
    const elements = document.querySelectorAll('[class*="label3d"]');
    elements.forEach(el => {
      el.style.display = 'none';
    });
  }
}
let cleanTextTimer = null
const createClearTextTimer = ()=>{
  cleanTextTimer = setTimeout(() => {
    speechText.value = ''
    awakenStatus.value = false
  }, 8000);
} 
const startRecord = async () => {
  speechAI.startRecord()
  speechIconPlay.value = true
  recordStatus.value = true
  replyLoading.value = false
  speechText.value = ''
  markdownText.value = ''
  nextTick(()=>{
    speechAI.createWaveView('.cube-speech-wave-view')
  })
}
const stopRecord= () => {
  speechAI.stopRecord()
  recordStatus.value = false
  awakenStatus.value = false
  speechText.value = ''
  markdownText.value = ''
  document.querySelector('.cube-speech-wave-view').innerHTML = ''
}

speechAI.statesCallBack = (states) => {
  connectStatus.value = states.connectStatus
  powerLevel.value = states.powerLevel
}
speechAI.onSpeakingCallBack=(textValue)=>{
  if(awakenStatus.value){
    speechText.value = textValue
    cleanTextTimer && clearTimeout(cleanTextTimer)
    createClearTextTimer()
  }
}
speechAI.onSpeakEndCallBack=(textValue)=>{
  cleanTextTimer && clearTimeout(cleanTextTimer)

  if(textValue.includes('小安') && !awakenStatus.value){
    awakenStatus.value = true
    speechText.value = ''
    markdownText.value = ''
    audioMap['i-am-here'].play()
    createClearTextTimer()
    return
  }

  if(awakenStatus.value&&!replyLoading.value&&textValue.length > 2){
    replyLoading.value = true
    speechText.value = textValue
    setTimeout(() => {
      if(cubeAIAssistant){
        cubeAIAssistant.submitMessage(textValue)
        speechText.value = '查询中...'
      }
    }, 800);
  }
}

const onMaximize = () => {
  fullScreen.value = true
}
const onMinimize =()=>{ 
  if(fullScreen.value){
    fullScreen.value = false
    return
  }
  openStatus.value = false
}
const onClose = () => {
  openStatus.value = false
}
const dragEnd = () => {
  setTimeout(() => {
    iconDrag.value = false
  }, 0);
}


onMounted(async ()=>{
  try {
    const res = await getAgentList()
    if (res.length > 0) {
      cubeAIAssistant = getCubeAIAssistant(iframeContainer.value)
      cubeAIAssistant.onLoad(()=>{
        loadStatus.value = true
        speechAI.connectService()
        nextTick(()=>{
          lottie.loadAnimation({
            container: document.querySelector('.ai-icon'), // 需要渲染动画的dom元素
            animationData: robotLottie, // 动画数据
            renderer: 'svg', // 渲染方式
            loop: true, // 是否循环播放
            autoplay: true, // 是否自动播放
          })
        })
      })
      cubeAIAssistant.onAIResponse((message)=>{
        try {
          const res = JSON.parse(message)
          if(res.type === 'command'){
            const command = JSON.parse(res.value)
            const findCommand =  executeCommand(command)
            if(awakenStatus.value){
              findCommand?audioMap['ok'].play():audioMap['iCannotUnderstand'].play()
              speechText.value = ''
              openStatus.value = false
            }
          }
          if(res.type === 'text' || res.type === 'markdown'){
            speechText.value = ''
            markdownText.value = ''
            openStatus.value = true
            awakenStatus.value = false
          }
        } catch (error) {
        }
        setTimeout(() => {
          replyLoading.value = false
          awakenStatus.value = false
        }, 0);
      })
      cubeAIAssistant.onAIThinking(()=>{
        if(awakenStatus.value){
          speechText.value = ''
          markdownText.value = ''
          openStatus.value = true
          awakenStatus.value = false
        }
      })
      cubeAIAssistant.onVoiceEnable(()=>{
        handelClickRecord()
      })
    }
  } catch {
    
  }
})
</script>

<style scoped lang="less">
.speech-assistant-avatar{
  cursor: pointer;
  width: 30px;
  text-align: center;
  span{
    font-size: 23px;
  }
}
.speech-safety-analysis-modal-body{
  position: fixed;
  top: 0;
  left: 0;
  height: 100%;
  width: 100vw;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: rgba(0,0,0,0.5);
  :deep(.ant-table-cell){
    background-color: #fff !important;
    color: #000 !important;
  }

  :deep([class^="_security-analysis-body"]) {
    background: #fff !important;
    .ant-table-body{
      &::-webkit-scrollbar {
        width: 0px;
      }
    }
  }
  :deep(.ant-select-selector){
    color: #000 !important;
    background-color: #fff !important;
    border: thin solid rgba(96, 112, 128, 0.6) !important;
  }
  :deep(svg){
    color: rgba(0, 0, 0, 0.85) !important;
  }
  :deep(.ant-picker-range){
    background-color: #fff !important;
  }
  :deep(.ant-select-dropdown){
    background-color: #fff !important;
  }
  :deep(.ant-select-item){
    color: rgba(0, 0, 0, 0.85) !important;
  }
  :deep(.ant-select-item-option-active){
    color: #fff !important;
  }
  :deep(.ant-picker-panel){
    background-color: #fff !important;
  }
  :deep(.ant-picker-header button){
    color: rgba(0, 0, 0, 0.85) !important;
  }
  :deep(.ant-picker-content thead tr th){
    color: rgba(0, 0, 0, 0.85) !important;
  }
  :deep(.ant-picker-content tbody tr td){
    color: rgba(0, 0, 0, 0.85) !important;
  }
  :deep(.ant-picker-cell-in-view.ant-picker-cell-in-range::before){
    background-color: #e6f7ff !important;
  }
  
  .speech-safety-analysis-modal-main{
    width: 80%;
    height: 80%;
    background-color: #f3f4f5;
    box-sizing: border-box;
    padding: 10px;
    overflow-y: auto;
    &::-webkit-scrollbar{ 
      width: 0px;
    }
    .speech-safety-analysis-modal-close{
      position: absolute;
      right: calc(10% + 20px) ;
      top:  calc(10% + 10px);
      cursor: pointer;
      width: 25px;
      height: 25px;
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1;
      &:hover{
        background-color: rgba(100,100,100,0.5);
      }
    }
  }
}
.speech-safety-analysis{
  padding: 0 0.05208rem;
    cursor: pointer;
    color: white;
    font-size: 0.07292rem;
}
.ai-speech-recorder{
  background: transparent !important;
}
.speech-drawer{
  position: fixed;
  width: 100vw;
  left: 0;
  bottom: 0;
  z-index: 2147483000;
  height: 15vh;
  background: linear-gradient(to bottom, transparent, #0a2d62 100%);
  transition: all 0.3s ease;
  .robot{
    position: absolute;
    width: 200px;
    height: 200px;
    top: -100px;
    left: 100px;
  }
  .text{
    position: absolute;
    left:50%;
    top: 50%;
    transform: translate(-50%,-50%);
    z-index: 1;
    font-size: 30px;
    white-space: nowrap;
  }
  .cube-speech-wave-view{
    width: 100%;
    height: 50%;
    position: absolute;
    pointer-events: none;
    bottom: 0;
    left: 0;
  }
  .markdown-text{
    width: 50%;
    height: 100%;
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    overflow-y: auto;
  }
}

.chat-button {
  background: rgb(2, 83, 250);
  border: none;
}
:root {
  --b-100: #F2F3F7;
  --s-700: #37546D;
}

.ai-widget-holder {
  box-shadow: 0 5px 40px rgba(0, 0, 0, .16);
  opacity: 1;
  will-change: transform, opacity;
  transform: translateY(0);
  overflow: hidden !important;
  position: fixed !important;
  transition: opacity 0.2s linear, transform 0.25s linear, width 0.3s linear,height 0.5s linear;
  z-index: 2147483000 !important;
}

.ai-widget-holder.ai-widget-holder--flat {
  box-shadow: none;
  border-radius: 0;
  border: 1px solid var(--b-100);
}

.ai-widget-holder iframe {
  border: 0;
  color-scheme: normal;
  height: 100% !important;
  width: 100% !important;
  max-height: 100vh !important;
}

.ai-widget-holder.has-unread-view {
  border-radius: 0 !important;
  min-height: 80px !important;
  height: auto;
  bottom: 94px;
  box-shadow: none !important;
  border: 0;
}
.ai-widget-bubble-change{
  border-radius: 100px;
  border-width: 0px;
  bottom: 20px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, .16) !important;
  cursor: pointer;
  height: 64px;
  padding: 0px;
  position: fixed;
  user-select: none;
  width: 64px;
  z-index: 2147483000 !important;
}
.ai-icon{
  height:150px;
  width:150px;
  cursor: pointer;
}
.ai-widget-bubble {
  background: #1f93ff;
  border-radius: 100px;
  border-width: 0px;
  bottom: 20px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, .16) !important;
  cursor: pointer;
  height: 64px;
  padding: 0px;
  position: fixed;
  user-select: none;
  width: 64px;
  z-index: 2147483000 !important;
}

.ai-widget-bubble.ai-widget-bubble--flat {
  border-radius: 0;
}

.ai-widget-holder.ai-widget-holder--flat {
  bottom: 90px;
}

.ai-widget-bubble.ai-widget-bubble--flat {
  height: 56px;
  width: 56px;
}

.ai-widget-bubble.ai-widget-bubble--flat svg {
  margin: 16px;
}

.ai-widget-bubble.ai-widget-bubble--flat.ai--close::before,
.ai-widget-bubble.ai-widget-bubble--flat.ai--close::after {
  left: 28px;
  top: 16px;
}

.ai-widget-bubble.unread-notification::after {
  content: '';
  position: absolute;
  width: 12px;
  height: 12px;
  background: #ff4040;
  border-radius: 100%;
  top: 0px;
  right: 0px;
  border: 2px solid #ffffff;
  transition: background 0.2s ease;
}

.ai-widget-bubble.ai-widget--expanded {
  bottom: 24px;
  display: flex;
  height: 48px !important;
  width: auto !important;
  align-items: center;
}

.ai-widget-bubble.ai-widget--expanded div {
  align-items: center;
  color: #fff;
  display: flex;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen-Sans, Ubuntu, Cantarell, Helvetica Neue, Arial, sans-serif;
  font-size: 16px;
  font-weight: 500;
  justify-content: center;
  padding-right: 20px;
  width: auto !important;
}

.ai-widget-bubble.ai-widget--expanded.ai-widget-bubble-color--lighter div{
  color: var(--s-700);
}

.ai-widget-bubble.ai-widget--expanded svg {
  height: 20px;
  margin: 14px 8px 14px 16px;
  width: 20px;
}

.ai-widget-bubble.ai-widget-bubble-color--lighter path{
  fill: var(--s-700);
}

@media only screen and (min-width: 667px) {
  .ai-widget-holder.ai-elements--left {
    left: 20px;
 }
  .ai-widget-holder.ai-elements--right {
    right: 20px;
 }
}

.ai--close:hover {
  opacity: 1;
}

.ai--close::before, .ai--close::after {
  background-color: #fff;
  content: ' ';
  display: inline;
  height: 24px;
  left: 32px;
  position: absolute;
  top: 20px;
  width: 2px;
}

.ai-widget-bubble-color--lighter.ai--close::before, .ai-widget-bubble-color--lighter.ai--close::after {
  background-color: var(--s-700);
}

.ai--close::before {
  transform: rotate(45deg);
}

.ai--close::after {
  transform: rotate(-45deg);
}

.ai--hide {
  bottom: -100vh !important;
  top: unset !important;
  opacity: 0;
  visibility: hidden !important;
  z-index: -1 !important;
}

.ai-widget--without-bubble {
  bottom: 20px !important;
}
.ai-widget-holder.ai--hide{
  transform: translateY(40px);
}
.ai-widget-bubble.ai--close {
  transform: translateX(0px) scale(1) rotate(0deg);
  transition: transform 300ms ease, opacity 100ms ease, visibility 0ms linear 0ms, bottom 0ms linear 0ms;
}
.ai-widget-bubble.ai--close.ai--hide {
  transform: translateX(8px) scale(.75) rotate(45deg);
  transition: transform 300ms ease, opacity 200ms ease, visibility 0ms linear 500ms, bottom 0ms ease 200ms;
}

.ai-widget-bubble {
  transform-origin: center;
  will-change: transform, opacity;
  transform: translateX(0) scale(1) rotate(0deg);
  transition: scale 300ms ease, transform 300ms ease, opacity 100ms ease, visibility 0ms linear 0ms, bottom 0ms linear 0ms;
}
.ai-widget-bubble.ai--hide {
  transform: translateX(8px) scale(.75) rotate(-30deg);
  transition: transform 300ms ease, opacity 200ms ease, visibility 0ms linear 500ms, bottom 0ms ease 200ms;
}

.ai-widget-bubble.ai-widget--expanded {
  transform: translateX(0px);
  transition: transform 300ms ease, opacity 100ms ease, visibility 0ms linear 0ms, bottom 0ms linear 0ms;
}
.ai-widget-bubble.ai-widget--expanded.ai--hide {
  transform: translateX(8px);
  transition: transform 300ms ease, opacity 200ms ease, visibility 0ms linear 500ms, bottom 0ms ease 200ms;
}
.ai-widget-bubble.ai-widget-bubble--flat.ai--close {
  transform: translateX(0px);
  transition: transform 300ms ease, opacity 10ms ease, visibility 0ms linear 0ms, bottom 0ms linear 0ms;
}
.ai-widget-bubble.ai-widget-bubble--flat.ai--close.ai--hide {
  transform: translateX(8px);
  transition: transform 300ms ease, opacity 200ms ease, visibility 0ms linear 500ms, bottom 0ms ease 200ms;
}
.ai-widget-bubble.ai-widget--expanded.ai-widget-bubble--flat {
  transform: translateX(0px);
  transition: transform 300ms ease, opacity 200ms ease, visibility 0ms linear 0ms, bottom 0ms linear 0ms;
}
.ai-widget-bubble.ai-widget--expanded.ai-widget-bubble--flat.ai--hide {
  transform: translateX(8px);
  transition: transform 300ms ease, opacity 200ms ease, visibility 0ms linear 500ms, bottom 0ms ease 200ms;
}

@media only screen and (max-width: 667px) {
  .ai-widget-holder {
    height: 100%;
    right: 0;
    top: 0;
    width: 100%;
 }

 .ai-widget-holder iframe {
    min-height: 100% !important;
  }


 .ai-widget-holder.has-unread-view {
    height: auto;
    right: 0;
    width: auto;
    bottom: 0;
    top: auto;
    max-height: 100vh;
    padding: 0 8px;
  }

  .ai-widget-holder.has-unread-view iframe {
    min-height: unset !important;
  }

 .ai-widget-holder.has-unread-view.ai-elements--left {
    left: 0;
  }

  .ai-widget-bubble.ai--close {
    bottom: 60px;
    opacity: 0;
    visibility: hidden !important;
    z-index: -1 !important;
  }
}

@media only screen and (min-width: 667px) {
  .ai-widget-holder {
    border-radius: 16px;
    bottom: 150px;
    height: calc(90% - 120px);
    min-height: 250px !important;
    width: 26vw !important;
 }
}

.ai-hidden {
  display: none !important;
}
.ai-fullscreen{
  max-width: unset !important;
  max-height: unset !important;
  border-radius: 0 !important;
  right: 0 !important;
  bottom: 0 !important;
  width: 100% !important;
  height: 100% !important;
}
.window-action{
  background-color: white;
  display: flex;
  padding: 10px;
  justify-content: flex-end;
  align-items: center;
  height: 35px;
  .item{
    border-radius: 50px;
    width: 0.8vw;
    height: 0.8vw;
    background-color: red;  
    display: flex;
    justify-content: center;
    align-items: center;
    margin-left: 15px;
    cursor: pointer;
    min-width: 15px;
    min-height: 15px;

    .anticon{
      transition: all 0.3s ease;
      opacity: 0;
      color: black;
    }
    &:hover{
    .anticon{
      opacity: 1;
    }
  }
  }
}
</style>
<style>
.ai-widget-holder iframe{
  height: calc(100% - 35px)!important;
}
.window-action{
  svg{
    width: 100%;
  }
}
.security-analysis-modal{
  .ant-modal-content{
    background-color: #fff !important;
  }
  .ant-modal-content .ant-modal-header .ant-modal-title{
    color: #000 !important;
  }
  .ant-modal-content .ant-modal-close{
    background-color: unset !important;
    color:#000 !important;
  }

  .ant-select-selector{
    color: #000 !important;
    background-color: #fff !important;
    border: thin solid rgba(96, 112, 128, 0.6) !important;
  }
  svg{
    color: rgba(0, 0, 0, 0.85) !important;
  }
  .ant-picker-range{
    background-color: #fff !important;
  }
  .ant-select-dropdown{
    background-color: #fff !important;
  }
  .ant-select-item{
    color: rgba(0, 0, 0, 0.85) !important;
  }
  .ant-select-item-option-active{
    color: #fff !important;
  }
  .ant-picker-panel{
    background-color: #fff !important;
  }
  .ant-picker-header button{
    color: rgba(0, 0, 0, 0.85) !important;
  }
  .ant-picker-content thead tr th{
    color: rgba(0, 0, 0, 0.85) !important;
  }
  .ant-picker-content tbody tr td{
    color: rgba(0, 0, 0, 0.85) !important;
  }
  .ant-picker-cell-in-view.ant-picker-cell-in-range::before{
    background-color: #e6f7ff !important;
  }
  .ant-modal-content .ant-select-item{
    color: #000 !important;
    &.ant-select-item-option-selected{
      color:#fff !important
    }
  }
  .ant-select-item-option-selected{
    color:#fff !important
  }
  .ant-picker-input > input{
    color: #000 !important;
  }
}
</style>