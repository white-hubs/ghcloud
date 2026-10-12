<template>
  <custom-modal
    className="file-preview-modal"
    ref="customModalRef"
    v-model:visible="visible"
    :isMinimized="isMinimized"
    @changeIsMinimized="changeIsMinimized"
    :title="'文件预览'"
    @close="close"
    :showOpenBtn="isShowOpenBtn"
    @open="open"
  >
    <div class="preview-container">
      <!-- 图片预览 -->
      <img v-if="isImage" :src="previewUrl" alt="预览图片" class="preview-content" />

      <!-- PDF预览 -->
      <iframe
        v-else-if="isPdf"
        :src="`/pdfjs/web/viewer.html?file=${encodeURIComponent(previewUrl)}`"
        class="preview-content"
        frameborder="0"
      ></iframe>

      <!-- 视频预览 -->
      <video v-else-if="isVideo" controls class="preview-content">
        <source :src="previewUrl" :type="videoType" />
        您的浏览器不支持视频播放
      </video>

      <!-- Office文件使用KKFileView -->
      <iframe v-else-if="showKKFileView" :src="previewUrl" class="preview-content" frameborder="0"></iframe>

      <!-- 不支持的类型 -->
      <div v-else class="unsupported-type">不支持预览此文件类型: {{ fileType }}</div>
    </div>
  </custom-modal>
</template>

<script>
import { defineComponent, watch, ref, computed } from "vue";

import customModal from "../custom-modal/index.vue";
import { kkFilePreviewPath } from "@/utils/common";

export default defineComponent({
  props: {
    fileInfo: {
      type: Object,
      default: () => ({}),
    },
    visible: {
      type: Boolean,
      default: false,
    },
    isMinimized: {
      type: Boolean,
      default: false,
    },
  },
  components: {
    customModal,
  },
  emits: ["update:visible", "update:isMinimized", "closeFilePreview"],
  setup(props, { emit }) {
    const previewUrl = ref("");
    const customModalRef = ref(null);

    const fileType = computed(() => {
      const name = props.fileInfo?.name || "";
      const index = name.lastIndexOf(".");
      return index > -1 ? name.substring(index + 1).toLowerCase() : "";
    });

    const isImage = computed(() => ["jpg", "jpeg", "png", "gif", "bmp", "webp"].includes(fileType.value));

    const isPdf = computed(() => fileType.value === "pdf");
    const isVideo = computed(() => ["mp4", "avi", "mov", "wmv", "flv"].includes(fileType.value));

    const videoType = computed(() => `video/${fileType.value === "avi" ? "x-msvideo" : fileType.value}`);

    const showKKFileView = computed(() => {
      return ["doc", "docx", "xls", "xlsx", "ppt", "pptx"].includes(fileType.value);
    });

    watch(
      () => props.fileInfo,
      (val) => {
        if (!val) {
          previewUrl.value = "";
          return;
        }
        try {
          if (val.path) {
            previewUrl.value = val.path.includes("http") ? val.path : window.location.origin + val.path;

            if (showKKFileView.value) {
              previewUrl.value = kkFilePreviewPath(val) || "";
            }
          }
        } catch (error) {
          console.error("文件路径处理错误:", error);
          previewUrl.value = "";
        }
      },
      { immediate: true },
    );

    const close = () => {
      customModalRef.value?.closeCustomModal();
      emit("closeFilePreview");
    };
    const isShowOpenBtn = computed(() => {
      const isInIframe = window.top !== window.self;
      if (isInIframe) {
        const topUrl = window.top.location.href;
        return !topUrl.includes("higreen-data-viz");
      } else {
        return false;
      }
    });
    const open = () => {
      console.log("open");
      if (previewUrl.value) {
        const path = isPdf ? `/pdfjs/web/viewer.html?file=${encodeURIComponent(previewUrl.value)}` : previewUrl.value;
        window.open(path, "_blank");
      }
    };
    const changeIsMinimized = (bol) => {
      emit("update:isMinimized", bol);
    };

    return {
      previewUrl,
      isImage,
      isPdf,
      isVideo,
      videoType,
      showKKFileView,
      customModalRef,
      close,
      changeIsMinimized,
      open,
      isShowOpenBtn,
    };
  },
});
</script>

<style lang="less">
.file-preview-modal {
  position: fixed;
  width: 1000px;
  height: 700px;
  top: calc(50% - 325px);
  left: calc(50% - 450px);
  background: var(--dispatch-modal-bg, rgba(255, 255, 255, 0.98));
  border: 1px solid var(--dispatch-border, #dbe4ef);
  box-shadow: var(--dispatch-shadow-strong, 0 12px 32px rgba(26, 54, 93, 0.18));
  color: var(--dispatch-text, #1f2d3d);
  z-index: 999;

  &.visible {
    opacity: 1;
    transform: translateY(0);
  }

  .preview-container {
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    background: #f5f5f5;
  }

  .preview-content {
    width: 100%;
    height: 100%;
    max-height: calc(100% - 40px);
    object-fit: contain;
    background: white;
  }

  .unsupported-type {
    padding: 20px;
    background: white;
    border-radius: 4px;
    color: #f5222d;
  }

  &.full {
    width: 100%;
    height: 100%;
    max-width: none;
    max-height: none;

    .preview-content {
      max-height: 100%;
    }
  }
}
</style>
