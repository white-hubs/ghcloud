<template>
  <div class="chat-assistant-root">
    <div class="speech-safety-analysis" @click.stop="handelClickAnalysis" v-if="loadStatus">安全分析</div>
    <div class="speech-safety-analysis-modal-body" v-show="visible">
      <div class="speech-safety-analysis-modal-main">
        <div class="speech-safety-analysis-modal-close" @click.capture="handelClickAnalysis">
          <CloseOutlined style="color: black" />
        </div>
        <SecurityAnalysisReport :otherHeight="52" />
      </div>
    </div>
    <DragBox
      :initPosition="iconPosition"
      @drag="
        () => {
          iconDrag = true;
        }
      "
      @dragEnd="dragEnd"
      v-if="loadStatus"
    >
      <div class="ai-icon" @click="handelClickChat"></div>
    </DragBox>
    <div
      class="ai-widget-holder ai-elements--right"
      :class="{ 'ai--hide': !openStatus, 'ai-fullscreen': fullScreen }"
      v-show="!awakenStatus"
    >
      <div class="window-action">
        <div class="item item-green" @click="fullScreen ? onMinimize() : onMaximize()">
          <ShrinkOutlined v-if="fullScreen" />
          <ArrowsAltOutlined v-else />
        </div>
        <div class="item item-yellow" @click="onMinimize">
          <MinusOutlined />
        </div>
        <div class="item item-red" @click="onClose">
          <CloseOutlined />
        </div>
      </div>
      <div class="ai-chat-panel">
        <AssistantChatDrawer
          v-if="openStatus && authInfo?.token"
          ref="assistantRef"
          :auth="authInfo"
          :visible="openStatus"
          :initialDraft="initialDraft"
          :context="{ source: 'ue5', ...chatContext }"
          :fullscreen="fullScreen"
          @close="closeDrawer"
          @ready="handleReady"
          @response="handleResponse"
          @thinking="handleThinking"
          @session-change="handleSessionChange"
          @state-change="handleStateChange"
        />
      </div>
    </div>
    <div class="speech-drawer" :style="{ transform: `translateY(${awakenStatus || speechText || markdownText ? '0' : '200%'})` }">
      <div class="robot"></div>
      <div class="text" v-show="speechText">{{ speechText }}<LoadingOutlined style="margin-left: 20px" v-show="replyLoading" /></div>
      <div v-html="markdownText" class="markdown-text"></div>
      <div class="cube-speech-wave-view" v-show="!markdownText"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ArrowsAltOutlined, CloseOutlined, LoadingOutlined, MinusOutlined, ShrinkOutlined } from "@ant-design/icons-vue";
import * as lottie from "lottie-web";
import { defineAsyncComponent, nextTick, onBeforeUnmount, onMounted, ref } from "vue";

import {
  type AssistantChatHostExpose,
  formatModelCommandAck,
  parseAssistantCommandFromContent,
  readAssistantMessageContent,
  readAssistantMessageId,
  useAssistantChatHost,
} from "@ghcloud/cube-ai-application-app";
import { CubeMfRootGlobalState } from "@ghcloud/cube-mf-root";
import type { CubeAuth } from "@ghcloud/cube-protocol";
import { SecurityAnalysisReport } from "@ghcloud/cube-safety-supervision-app/src/views/security-analysis/security-analysis-report/security-analysis-report.tsx";
import { CubeSpeechAI } from "@ghcloud/cube-speech-assistant";
import { DragBox } from "@ghcloud/desktop-client-ui/src/components/calling-interface-for-web/drag-box";

import { executeCommandDetailed } from "./ai-command";
import robotLottie from "./assets/robot-lottie.json";

const iAmHere = "/resource/v1/audio/i-am-here.mp3";
const okAudio = "/resource/v1/audio/ok.mp3";
const iCannotUnderstand = "/resource/v1/audio/i-cannot-understand.mp3";
const audioMap = {
  "i-am-here": new Audio(iAmHere),
  ok: new Audio(okAudio),
  iCannotUnderstand: new Audio(iCannotUnderstand),
};

const AssistantChatDrawer = defineAsyncComponent(async () => {
  const module = await import("@ghcloud/cube-ai-application-app");
  return module.AssistantChatDrawer;
});

const speechAI = CubeSpeechAI.getInstance();
const openStatus = ref(false);
const assistantRef = ref<AssistantChatHostExpose | null>(null);
const loadStatus = ref(false);
const fullScreen = ref(false);
const iconDrag = ref(false);
const iconPosition = {
  x: document.body.clientWidth - 170,
  y: document.body.clientHeight - 170,
};
const replyLoading = ref(false);
const awakenStatus = ref(false);
const speechText = ref("");
const markdownText = ref("");
const visible = ref(false);
const voiceSessionActive = ref(false);
let cleanTextTimer: ReturnType<typeof setTimeout> | null = null;
/** 同一条 assistant 消息只执行/回执一次，避免 deep watch 重复触发 */
const handledCommandMessageIds = new Set<string>();

const {
  authInfo,
  initialDraft,
  chatContext,
  openDrawer: openDrawerRaw,
  closeDrawer,
  submitMessage,
  handleReady,
  handleResponse: publishResponse,
  handleThinking: publishThinking,
  handleSessionChange: publishSessionChange,
  handleStateChange,
} = useAssistantChatHost({
  resolveAuth: () => CubeMfRootGlobalState.getInstance().mfRootState.authInfo as CubeAuth | null,
  assistantRef,
  isOpen: openStatus,
  onResponse(payload) {
    replyLoading.value = false;
    const fromVoice = voiceSessionActive.value;
    voiceSessionActive.value = false;
    awakenStatus.value = false;

    const content = readAssistantMessageContent(payload);
    const command = parseAssistantCommandFromContent(content);
    if (command) {
      const messageId = readAssistantMessageId(payload);
      if (!messageId) {
        return;
      }
      if (handledCommandMessageIds.has(messageId)) {
        return;
      }
      handledCommandMessageIds.add(messageId);
      void executeCommandDetailed(command).then((result) => {
        const ack = formatModelCommandAck(result.ok, command.action);
        // 失败时附带原因，便于区分「未注册 handler」与「天气参数解析失败」
        const text = result.ok || !result.reason ? ack : `${ack}：${result.reason}`;
        assistantRef.value?.setCommandAckForMessage(messageId, text);
        if (fromVoice) {
          void (result.ok ? audioMap.ok : audioMap.iCannotUnderstand).play();
          speechText.value = "";
          openStatus.value = false;
        }
      });
      return;
    }

    if (fromVoice && content.trim()) {
      speechText.value = "";
      markdownText.value = content;
      openStatus.value = true;
    }
  },
  onThinking() {
    if (voiceSessionActive.value) {
      speechText.value = "";
      markdownText.value = "";
      openStatus.value = true;
      awakenStatus.value = false;
    }
  },
});

async function openDrawer(payload: { draft?: string; message?: string; context?: Record<string, unknown> } = {}): Promise<void> {
  await openDrawerRaw({
    ...payload,
    context: {
      source: "ue5",
      ...payload.context,
    },
  });
}

function handleSessionChange(payload: Parameters<typeof publishSessionChange>[0]): void {
  handledCommandMessageIds.clear();
  publishSessionChange(payload);
}

function handelClickChat(): void {
  if (iconDrag.value) {
    return;
  }
  if (!openStatus.value) {
    void openDrawer();
    return;
  }
  closeDrawer();
}

function onMaximize(): void {
  fullScreen.value = true;
}

function onMinimize(): void {
  if (fullScreen.value) {
    fullScreen.value = false;
    return;
  }
  openStatus.value = false;
}

function onClose(): void {
  closeDrawer();
}

function dragEnd(): void {
  setTimeout(() => {
    iconDrag.value = false;
  }, 0);
}

function handleResponse(payload: Parameters<typeof publishResponse>[0]): void {
  publishResponse(payload);
}

function handleThinking(payload: Parameters<typeof publishThinking>[0]): void {
  publishThinking(payload);
}

function handelClickAnalysis(): void {
  visible.value = !visible.value;
}

function createClearTextTimer(): void {
  cleanTextTimer = setTimeout(() => {
    speechText.value = "";
    awakenStatus.value = false;
  }, 8000);
}

speechAI.statesCallBack = () => {};

speechAI.onSpeakingCallBack = (textValue: string) => {
  if (!awakenStatus.value || replyLoading.value) {
    return;
  }
  speechText.value = textValue;
  if (cleanTextTimer) {
    clearTimeout(cleanTextTimer);
  }
  createClearTextTimer();
};

speechAI.onSpeakEndCallBack = (textValue: string) => {
  if (cleanTextTimer) {
    clearTimeout(cleanTextTimer);
  }
  if (textValue.includes("小安") && !awakenStatus.value) {
    awakenStatus.value = true;
    speechText.value = "";
    markdownText.value = "";
    void audioMap["i-am-here"].play();
    createClearTextTimer();
    return;
  }
  if (awakenStatus.value && !replyLoading.value && textValue.length > 2) {
    replyLoading.value = true;
    speechText.value = textValue;
    voiceSessionActive.value = true;
    void submitMessage({
      message: textValue,
      context: { source: "ue5-voice" },
    });
  }
};

onMounted(() => {
  speechAI.connectService();
  loadStatus.value = true;
  nextTick(() => {
    lottie.loadAnimation({
      container: document.querySelector(".ai-icon") as Element,
      animationData: robotLottie,
      renderer: "svg",
      loop: true,
      autoplay: true,
    });
  });
});

onBeforeUnmount(() => {
  if (cleanTextTimer) {
    clearTimeout(cleanTextTimer);
  }
});
</script>

<style scoped lang="less">
.chat-assistant-root {
  display: inline-flex;
  align-items: center;
}
.speech-safety-analysis-modal-body {
  position: fixed;
  top: 0;
  left: 0;
  height: 100%;
  width: 100vw;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 2147483000;
  :deep(.ant-table-cell) {
    background-color: #fff;
    color: #000;
  }

  :deep([class^="_security-analysis-body"]) {
    background: #fff !important;
    .ant-table-body {
      &::-webkit-scrollbar {
        width: 0px;
      }
    }
  }
  :deep(.ant-select-selector) {
    color: rgba(0, 0, 0, 0.85) !important;
    background-color: #fff !important;
    border: 1px solid #d9d9d9 !important;
  }
  :deep(.ant-select-selection-item) {
    color: rgba(0, 0, 0, 0.85) !important;
  }
  :deep(.ant-select-arrow) {
    color: rgba(0, 0, 0, 0.25) !important;
  }
  :deep(svg) {
    color: rgba(0, 0, 0, 0.85) !important;
  }
  :deep(.ant-picker-range) {
    background-color: #fff !important;
    border: 1px solid #d9d9d9 !important;
  }
  :deep(.ant-picker-input > input) {
    color: rgba(0, 0, 0, 0.85) !important;
  }
  :deep(.ant-picker-separator),
  :deep(.ant-picker-suffix) {
    color: rgba(0, 0, 0, 0.25) !important;
  }

  .speech-safety-analysis-modal-main {
    position: relative;
    width: 80%;
    height: 80%;
    max-width: 1200px;
    background-color: #f3f4f5;
    box-sizing: border-box;
    overflow: hidden;
    padding: 10px;
    overflow-y: auto;
    &::-webkit-scrollbar {
      width: 0px;
    }
    .speech-safety-analysis-modal-close {
      position: absolute;
      right: 12px;
      top: 12px;
      cursor: pointer;
      width: 25px;
      height: 25px;
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1;
      &:hover {
        background-color: rgba(100, 100, 100, 0.5);
      }
    }
  }
}
.speech-safety-analysis {
  cursor: pointer;
  margin-right: 10px;
}
.ai-widget-holder {
  box-shadow: 0 5px 40px rgba(0, 0, 0, 0.16);
  opacity: 1;
  will-change: transform, opacity;
  transform: translateY(0);
  overflow: hidden !important;
  position: fixed !important;
  transition:
    opacity 0.2s linear,
    transform 0.25s linear,
    width 0.3s linear,
    height 0.5s linear;
  z-index: 2147483000 !important;
}

.ai-chat-panel {
  height: calc(100% - 28px);
  overflow: hidden;
  background: #ffffff;
  color-scheme: light;
  border-radius: 0 0 16px 16px;

  :deep([class*="drawerCloseButton"]) {
    display: none !important;
  }

  :deep([class*="iconBtn"]) {
    border: none !important;
    background: transparent !important;
    padding: 6px !important;
    font-size: 18px !important;
    font-weight: 400 !important;
    color: #6b7280 !important;

    &:hover {
      background: #f3f4f6 !important;
      color: #4b5563 !important;
    }

    &:focus,
    &:focus-visible,
    &:active {
      outline: none !important;
      box-shadow: none !important;
      border-color: transparent !important;
      background: #f3f4f6 !important;
      color: #4b5563 !important;
    }
  }

  :deep([class*="toolPill"]:not([class*="Disabled"])) {
    border: none !important;
    background: transparent !important;
    padding: 6px 10px !important;
    font-size: 14px !important;
    font-weight: 400 !important;
    color: #6b7280 !important;

    &:hover {
      background: #f3f4f6 !important;
      color: #4b5563 !important;
    }

    &:focus,
    &:focus-visible,
    &:active {
      outline: none !important;
      box-shadow: none !important;
      border-color: transparent !important;
    }
  }

  :deep([class*="toolPillKbActive"]) {
    background: #eff6ff !important;
    color: #2563eb !important;

    &:focus,
    &:focus-visible,
    &:active {
      background: #eff6ff !important;
      color: #2563eb !important;
    }
  }

  :deep([class*="toolPillSkillActive"]) {
    background: #f0fdf4 !important;
    color: #15803d !important;

    &:focus,
    &:focus-visible,
    &:active {
      background: #f0fdf4 !important;
      color: #15803d !important;
    }
  }

  :deep([class*="kbSearchInput"]),
  :deep([class*="modelSearchInput"]) {
    background: #fff !important;
    color: #1f2937 !important;
    border: 1px solid #e5e7eb !important;

    &::placeholder {
      color: #9ca3af !important;
    }

    &:focus {
      outline: none !important;
      box-shadow: 0 0 0 2px #dbeafe !important;
    }
  }
}

.ai-icon {
  height: 150px;
  width: 150px;
  cursor: pointer;
}

@media only screen and (min-width: 667px) {
  .ai-widget-holder.ai-elements--right {
    right: 20px;
  }
}

.ai--hide {
  bottom: -100vh !important;
  top: unset !important;
  opacity: 0;
  visibility: hidden !important;
  z-index: -1 !important;
}

.ai-widget-holder.ai--hide {
  transform: translateY(40px);
}

@media only screen and (max-width: 667px) {
  .ai-widget-holder {
    height: 100%;
    right: 0;
    top: 0;
    width: 100%;
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

.ai-fullscreen {
  max-width: unset !important;
  max-height: unset !important;
  border-radius: 0 !important;
  right: 0 !important;
  bottom: 0 !important;
  width: 100% !important;
  height: 100% !important;
}

.window-action {
  background-color: white;
  display: flex;
  padding: 8px 12px;
  justify-content: flex-end;
  align-items: center;
  gap: 8px;
  height: 28px;
  box-sizing: border-box;

  .item {
    border-radius: 50%;
    width: 12px;
    height: 12px;
    flex: 0 0 12px;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;

    .anticon {
      font-size: 8px;
      font-weight: 600;
      line-height: 1;
      transition: opacity 0.2s ease;
      opacity: 0;
      color: rgba(0, 0, 0, 0.75);
    }

    &:hover .anticon {
      opacity: 1;
    }
  }

  .item-green {
    background: #52c41a;
  }

  .item-yellow {
    background: #fadb14;
  }

  .item-red {
    background: #f5222d;
  }
}
.speech-drawer {
  position: fixed;
  width: 100vw;
  left: 0;
  bottom: 0;
  z-index: 2147483000;
  height: 15vh;
  background: linear-gradient(to bottom, transparent, #0a2d62 100%);
  transition: all 0.3s ease;
  .robot {
    position: absolute;
    width: 200px;
    height: 200px;
    top: -100px;
    left: 100px;
  }
  .text {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    z-index: 1;
    font-size: 30px;
    white-space: nowrap;
  }
  .cube-speech-wave-view {
    width: 100%;
    height: 50%;
    position: absolute;
    bottom: 0;
    left: 0;
    pointer-events: none;
  }
  .markdown-text {
    width: 50%;
    height: 100%;
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    overflow-y: auto;
  }
}
</style>

<style lang="less">
.security-analysis-modal {
  .ant-modal-content {
    background-color: #fff !important;
  }
  .ant-modal-content .ant-modal-header .ant-modal-title {
    color: #000 !important;
  }
  .ant-modal-content .ant-modal-close {
    background-color: unset !important;
    color: #000 !important;
  }

  .ant-select-selector {
    color: rgba(0, 0, 0, 0.85) !important;
    background-color: #fff !important;
    border: 1px solid #d9d9d9 !important;
  }
  .ant-select-selection-item,
  .ant-select-selection-search-input {
    color: rgba(0, 0, 0, 0.85) !important;
  }
  .ant-select-arrow {
    color: rgba(0, 0, 0, 0.25) !important;
  }

  .ant-picker-range {
    background-color: #fff !important;
    border: 1px solid #d9d9d9 !important;
  }
  .ant-picker-input > input {
    color: rgba(0, 0, 0, 0.85) !important;
  }
  .ant-picker-separator,
  .ant-picker-suffix {
    color: rgba(0, 0, 0, 0.25) !important;
  }
}

.security-analysis-date-light.ant-select-dropdown {
  background-color: #fff !important;

  .ant-select-item {
    color: rgba(0, 0, 0, 0.85) !important;
  }

  .ant-select-item-option-active:not(.ant-select-item-option-disabled) {
    background-color: #e6f7ff !important;
    color: rgba(0, 0, 0, 0.85) !important;
  }

  .ant-select-item-option-selected:not(.ant-select-item-option-disabled) {
    background-color: #1890ff !important;
    color: #fff !important;
  }
}

.security-analysis-date-light.ant-picker-dropdown {
  .ant-picker-panel-container,
  .ant-picker-panels,
  .ant-picker-panel {
    background: #fff !important;
  }

  .ant-picker-header {
    color: rgba(0, 0, 0, 0.85) !important;
    border-bottom: 1px solid #f0f0f0 !important;
  }

  .ant-picker-header button {
    color: rgba(0, 0, 0, 0.45) !important;
  }

  .ant-picker-content thead tr th {
    color: rgba(0, 0, 0, 0.85) !important;
  }

  .ant-picker-cell {
    color: rgba(0, 0, 0, 0.25) !important;
  }

  .ant-picker-cell-in-view {
    color: rgba(0, 0, 0, 0.85) !important;
  }

  .ant-picker-cell-in-view .ant-picker-cell-inner {
    color: rgba(0, 0, 0, 0.85) !important;
  }

  .ant-picker-cell-selected .ant-picker-cell-inner,
  .ant-picker-cell-range-start .ant-picker-cell-inner,
  .ant-picker-cell-range-end .ant-picker-cell-inner {
    background: #1890ff !important;
    color: #fff !important;
  }

  .ant-picker-cell-in-view.ant-picker-cell-in-range::before {
    background: #e6f7ff !important;
  }

  .ant-picker-cell:hover:not(.ant-picker-cell-selected):not(.ant-picker-cell-range-start):not(.ant-picker-cell-range-end)
    .ant-picker-cell-inner {
    background: #f5f5f5 !important;
  }
}
</style>
