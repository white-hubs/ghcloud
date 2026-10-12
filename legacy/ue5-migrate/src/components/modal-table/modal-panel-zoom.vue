<template>
  <Teleport to="body">
    <div v-if="visible" class="modal-panel-zoom-overlay" @click="handleOverlayClick">
      <div class="modal-panel-zoom-container" :style="containerStyle" @click.stop>
        <div class="modal-panel-zoom-header">
          <span class="modal-title">{{ title }}</span>
          <button class="modal-close" @click="close">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div class="modal-panel-zoom-content">
          <slot />
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, watch } from "vue";

interface Props {
  visible: boolean;
  title?: string;
  width?: string | number;
}

const props = withDefaults(defineProps<Props>(), {
  visible: false,
  title: "",
  width: 600,
});

const emit = defineEmits<{
  "update:visible": [value: boolean];
  close: [];
}>();

const containerStyle = computed(() => {
  const widthValue = typeof props.width === "number" ? `${props.width}px` : props.width;
  return {
    width: widthValue,
    maxWidth: "90vw",
  };
});

const close = () => {
  emit("update:visible", false);
  emit("close");
};

const handleOverlayClick = () => {
  close();
};

const handleKeydown = (event: KeyboardEvent) => {
  if (event.key !== "Escape") return;

  event.preventDefault();
  event.stopImmediatePropagation();
  close();
};

watch(
  () => props.visible,
  (visible) => {
    if (visible) {
      window.addEventListener("keydown", handleKeydown, true);
      return;
    }
    window.removeEventListener("keydown", handleKeydown, true);
  },
  { immediate: true },
);

onBeforeUnmount(() => {
  window.removeEventListener("keydown", handleKeydown, true);
});
</script>

<style scoped lang="less">
.modal-panel-zoom-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(2px);
}

.modal-panel-zoom-container {
  background: rgba(4, 17, 32, 0.95);
  border: 1px solid #2989ff;
  border-radius: 4px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  animation: modal-in 0.2s ease-out;
}

@keyframes modal-in {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.modal-panel-zoom-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid #2989ff;
  flex-shrink: 0;
  background: rgba(4, 17, 32, 1);

  .modal-title {
    color: #fff;
    font-size: 18px;
    font-weight: 500;
  }

  .modal-close {
    background: transparent;
    border: none;
    color: #fff;
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: color 0.2s;
    flex-shrink: 0;
    padding: 0;

    &:hover {
      color: #2989ff;
    }

    svg {
      width: 18px;
      height: 18px;
    }
  }
}

.modal-panel-zoom-content {
  flex: 1;
  overflow: auto;
  padding: 20px;
}
</style>
