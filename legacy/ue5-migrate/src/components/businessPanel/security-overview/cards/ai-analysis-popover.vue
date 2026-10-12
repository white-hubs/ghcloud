<script setup lang="ts">
import { Popover } from "ant-design-vue";
import { onBeforeUnmount, shallowRef } from "vue";

interface Props {
  content: string;
}

const props = defineProps<Props>();

const displayedContent = shallowRef("");
const isTyping = shallowRef(false);
let typingTimer: ReturnType<typeof window.setInterval> | undefined;

const stopTyping = () => {
  if (typingTimer !== undefined) {
    window.clearInterval(typingTimer);
    typingTimer = undefined;
  }
};

const startTyping = () => {
  stopTyping();
  displayedContent.value = "";
  isTyping.value = true;

  let currentIndex = 0;
  typingTimer = window.setInterval(() => {
    currentIndex += 1;
    displayedContent.value = props.content.slice(0, currentIndex);

    if (currentIndex >= props.content.length) {
      stopTyping();
      isTyping.value = false;
    }
  }, 18);
};

const handleOpenChange = (open: boolean) => {
  if (open) {
    startTyping();
    return;
  }

  stopTyping();
  isTyping.value = false;
};

onBeforeUnmount(stopTyping);
</script>

<template>
  <Popover
    placement="rightTop"
    trigger="hover"
    overlay-class-name="ai-analysis-popover"
    :mouse-enter-delay="0.15"
    :mouse-leave-delay="0.2"
    @open-change="handleOpenChange"
  >
    <template #content>
      <div class="ai-analysis-content">
        <div class="ai-analysis-title">
          <span class="ai-analysis-status"></span>
          <span>AI分析解读</span>
        </div>
        <div class="ai-analysis-text">{{ displayedContent }}<span v-if="isTyping" class="ai-analysis-cursor"></span></div>
      </div>
    </template>

    <div class="ai-analysis-trigger">
      <slot />
    </div>
  </Popover>
</template>

<style lang="less" scoped>
.ai-analysis-trigger {
  width: 100%;
}

.ai-analysis-content {
  width: 420px;
  padding: 4px 2px 6px;
  font-family:
    Source Han Sans CN-Regular,
    Source Han Sans CN,
    sans-serif;
}

.ai-analysis-title {
  display: flex;
  align-items: center;
  height: 32px;
  padding-bottom: 10px;
  border-bottom: 1px solid rgba(78, 174, 255, 0.24);
  color: #7ddcff;
  font-size: 16px;
  font-weight: 600;
}

.ai-analysis-status {
  width: 7px;
  height: 7px;
  margin-right: 9px;
  border-radius: 50%;
  background: #55d9ff;
  box-shadow: 0 0 8px rgba(85, 217, 255, 0.9);
  animation: ai-analysis-pulse 1.6s ease-in-out infinite;
}

.ai-analysis-text {
  min-height: 160px;
  padding-top: 12px;
  color: #eff6ff;
  font-size: 14px;
  font-weight: 500;
  line-height: 24px;
  text-align: justify;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.55);
  white-space: normal;
  word-break: break-all;
}

.ai-analysis-cursor {
  display: inline-block;
  width: 2px;
  height: 15px;
  margin-left: 3px;
  vertical-align: -2px;
  background: #62dcff;
  box-shadow: 0 0 6px rgba(98, 220, 255, 0.8);
  animation: ai-analysis-cursor-blink 0.8s steps(1) infinite;
}

@keyframes ai-analysis-pulse {
  0%,
  100% {
    opacity: 0.55;
    transform: scale(0.85);
  }

  50% {
    opacity: 1;
    transform: scale(1.15);
  }
}

@keyframes ai-analysis-cursor-blink {
  0%,
  48% {
    opacity: 1;
  }

  49%,
  100% {
    opacity: 0;
  }
}
</style>

<style lang="less">
.ai-analysis-popover {
  z-index: 1100;

  .ant-popover-arrow::before {
    background: rgba(4, 17, 32, 0.8);
    border: 1px solid rgba(63, 169, 255, 0.58);
  }

  .ant-popover-inner {
    padding: 14px 16px;
    overflow: hidden;
    border: 1px solid rgba(63, 169, 255, 0.58);
    border-radius: 8px;
    background: rgba(4, 17, 32, 0.8);
    box-shadow:
      0 8px 24px rgba(0, 10, 24, 0.28),
      0 0 18px rgba(26, 130, 220, 0.18),
      inset 0 0 18px rgba(45, 145, 230, 0.06);
  }

  .ant-popover-inner-content {
    color: inherit;
  }
}
</style>
