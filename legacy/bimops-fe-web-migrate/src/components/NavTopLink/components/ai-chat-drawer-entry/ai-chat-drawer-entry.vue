<template>
  <div class="ai-chat-drawer-entry">
    <img :src="EntryPng" class="entry-img" title="AI 聊天" @click="openDrawer()" />
    <a-drawer
      :rootClassName="drawerRootClass"
      placement="right"
      :visible="visible"
      :width="drawerWidth"
      :closable="false"
      :mask="false"
      :wrap-style="drawerWrapStyle"
      :bodyStyle="{ padding: 0, height: '100%' }"
      @close="closeDrawer"
    >
      <AssistantChatDrawer
        v-if="visible && authInfo?.token"
        ref="assistantRef"
        :auth="authInfo"
        :visible="visible"
        :initialDraft="initialDraft"
        :context="chatContext"
        :fullscreen="fullscreen"
        :showFullscreenToggle="true"
        @close="closeDrawer"
        @ready="handleReady"
        @response="handleResponse"
        @thinking="handleThinking"
        @session-change="handleSessionChange"
        @state-change="handleStateChange"
        @toggle-fullscreen="toggleFullscreen"
      />
    </a-drawer>
  </div>
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent, ref, watch } from "vue";

import { type AssistantChatHostExpose, useAssistantChatHost } from "@ghcloud/cube-ai-application-app";
import { CubeMfRootGlobalState } from "@ghcloud/cube-mf-root";
import type { CubeAuth } from "@ghcloud/cube-protocol";

const AssistantChatDrawer = defineAsyncComponent(async () => {
  const module = await import("@ghcloud/cube-ai-application-app");
  return module.AssistantChatDrawer;
});

const EntryPng = "/resource/v1/bimops-fe-web-migrate/components/NavTopLink/components/ai-agent-entry/entry-png.png";

const DRAWER_WIDTH_NORMAL = 484;
const visible = ref(false);
const fullscreen = ref(false);
const assistantRef = ref<AssistantChatHostExpose | null>(null);

const drawerWidth = computed(() => (fullscreen.value ? "100%" : DRAWER_WIDTH_NORMAL));
const drawerRootClass = computed(() => (fullscreen.value ? "cube-ai-chat-drawer cube-ai-chat-drawer--fullscreen" : "cube-ai-chat-drawer"));
const drawerWrapStyle = computed(() =>
  fullscreen.value
    ? {
        top: "0",
        height: "100vh",
        pointerEvents: "none",
      }
    : {
        top: "50px",
        height: "calc(100vh - 50px)",
        pointerEvents: "none",
      },
);

const {
  authInfo,
  initialDraft,
  chatContext,
  openDrawer,
  closeDrawer: closeDrawerRaw,
  handleReady,
  handleResponse,
  handleThinking,
  handleSessionChange,
  handleStateChange,
} = useAssistantChatHost({
  resolveAuth: () => CubeMfRootGlobalState.getInstance().mfRootState.authInfo as CubeAuth | null,
  assistantRef,
  isOpen: visible,
});

const closeDrawer = (): void => {
  fullscreen.value = false;
  closeDrawerRaw();
};

const toggleFullscreen = (): void => {
  fullscreen.value = !fullscreen.value;
};

watch(visible, (open) => {
  if (!open) {
    fullscreen.value = false;
  }
});
</script>

<style lang="less" scoped>
.ai-chat-drawer-entry {
  height: 50px;
  display: inline-flex;
  align-items: center;
  margin-right: 20px;
}

.entry-img {
  width: 30px;
  height: 30px;
  display: inline-block;
  cursor: pointer;
}
</style>

<style lang="less">
.ant-drawer.cube-ai-chat-drawer,
.cube-ai-chat-drawer {
  top: 50px !important;
  height: calc(100vh - 50px) !important;
  pointer-events: none;
}

.ant-drawer.cube-ai-chat-drawer.cube-ai-chat-drawer--fullscreen,
.cube-ai-chat-drawer.cube-ai-chat-drawer--fullscreen {
  top: 0 !important;
  height: 100vh !important;
}

.ant-drawer.cube-ai-chat-drawer .ant-drawer-content-wrapper,
.cube-ai-chat-drawer .ant-drawer-content-wrapper {
  height: calc(100vh - 50px) !important;
  top: 0 !important;
  pointer-events: auto;
  transition: width 0.25s ease;
}

.ant-drawer.cube-ai-chat-drawer.cube-ai-chat-drawer--fullscreen .ant-drawer-content-wrapper,
.cube-ai-chat-drawer.cube-ai-chat-drawer--fullscreen .ant-drawer-content-wrapper {
  width: 100% !important;
  height: 100vh !important;
}

.ant-drawer.cube-ai-chat-drawer .ant-drawer-content,
.cube-ai-chat-drawer .ant-drawer-content {
  height: 100%;
  overflow: hidden;
  border-radius: 16px 0 0 16px;
  box-shadow: -8px 0 24px rgb(18 28 50 / 0.08);
}

.ant-drawer.cube-ai-chat-drawer.cube-ai-chat-drawer--fullscreen .ant-drawer-content,
.cube-ai-chat-drawer.cube-ai-chat-drawer--fullscreen .ant-drawer-content {
  border-radius: 0;
  box-shadow: none;
}

.ant-drawer.cube-ai-chat-drawer .ant-drawer-body,
.cube-ai-chat-drawer .ant-drawer-body {
  height: 100%;
  overflow: hidden;
  padding: 0;
  background: #fff;
}
</style>
