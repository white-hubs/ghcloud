<template>
  <custom-modal
    className="file-preview-modal"
    ref="customModalRef"
    v-model:visible="visible"
    :isMinimized="isMinimized"
    @changeIsMinimized="changeIsMinimized"
    :title="isGeneratedPlan ? planInfo.name || '预案预览' : '文件预览'"
    @close="close"
    :showOpenBtn="!isGeneratedPlan && isShowOpenBtn"
    @open="open"
  >
    <div v-if="isGeneratedPlan" class="generated-plan-preview">
      <div class="generated-plan-content">
        <div v-if="safeContentHtml" class="rich-text-content" v-html="safeContentHtml"></div>
        <div v-else class="empty-content">暂无预案正文</div>
      </div>
      <aside class="generated-plan-files">
        <div class="generated-files-title">上传文件</div>
        <button
          v-for="file in contentFiles"
          :key="file.id || file.name"
          type="button"
          class="generated-file-item"
          @click="openAttachment(file)"
        >
          <PaperClipOutlined />
          <span class="generated-file-name" :title="file.name">{{ file.name }}</span>
          <EyeOutlined />
        </button>
        <div v-if="!contentFiles.length" class="empty-files">暂无上传文件</div>
      </aside>
    </div>
    <div v-else class="preview-container">
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
import { EyeOutlined, PaperClipOutlined } from "@ant-design/icons-vue";
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
    planInfo: {
      type: Object,
      default: null,
    },
  },
  components: {
    customModal,
    EyeOutlined,
    PaperClipOutlined,
  },
  emits: ["update:visible", "update:isMinimized", "closeFilePreview"],
  setup(props, { emit }) {
    const previewUrl = ref("");
    const customModalRef = ref(null);
    const sanitizeRichText = (html = "") => {
      const document = new DOMParser().parseFromString(html, "text/html");
      const allowedTags = new Set([
        "H1",
        "H2",
        "H3",
        "P",
        "BR",
        "UL",
        "OL",
        "LI",
        "TABLE",
        "THEAD",
        "TBODY",
        "TR",
        "TH",
        "TD",
        "STRONG",
        "B",
        "EM",
        "I",
        "U",
        "BLOCKQUOTE",
      ]);
      document.body.querySelectorAll("*").forEach((element) => {
        if (!allowedTags.has(element.tagName)) {
          element.replaceWith(...element.childNodes);
          return;
        }
        Array.from(element.attributes).forEach((attribute) => {
          element.removeAttribute(attribute.name);
        });
      });
      return document.body.innerHTML;
    };
    const isGeneratedPlan = computed(() => Boolean(props.planInfo?.generated));
    const contentFiles = computed(() => props.planInfo?.contentFileVOS || []);
    const safeContentHtml = computed(() => sanitizeRichText(props.planInfo?.contentHtml));

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
      if (previewUrl.value) {
        const path = isPdf ? `/pdfjs/web/viewer.html?file=${encodeURIComponent(previewUrl.value)}` : previewUrl.value;
        window.open(path, "_blank");
      }
    };
    const openAttachment = (file) => {
      const fileInfo = { ...file };
      const previewPath = kkFilePreviewPath(fileInfo);
      const directPath = fileInfo.path
        ? fileInfo.path.includes("http")
          ? fileInfo.path
          : `${window.location.origin}${fileInfo.path}`
        : "";
      const path = previewPath || directPath;
      if (path) {
        window.open(path, "_blank");
      }
    };
    const changeIsMinimized = (bol) => {
      emit("update:isMinimized", bol);
    };

    return {
      isGeneratedPlan,
      contentFiles,
      safeContentHtml,
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
      openAttachment,
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
  background: rgba(4, 14, 38, 0.96);
  border: 1px solid rgba(41, 137, 255, 1);
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

  .generated-plan-preview {
    display: flex;
    height: calc(100% - 62px);
    min-height: 0;
    background: #f5f7fa;
  }

  .generated-plan-content {
    flex: 1;
    min-width: 0;
    overflow: auto;
    padding: 24px 32px;
    background: #fff;
  }

  .rich-text-content {
    max-width: 720px;
    margin: 0 auto;
    color: #1f2937;
    line-height: 1.8;

    h1 {
      margin: 0 0 20px;
      color: #111827;
      font-size: 24px;
      text-align: center;
    }

    h2 {
      margin: 20px 0 10px;
      color: #111827;
      font-size: 18px;
    }

    h3 {
      margin: 16px 0 8px;
      color: #111827;
      font-size: 15px;
    }

    p,
    li,
    td,
    th {
      margin: 0 0 8px;
      font-size: 14px;
    }

    ul,
    ol {
      padding-left: 24px;
    }

    table {
      width: 100%;
      border-collapse: collapse;
    }

    td,
    th {
      padding: 8px 10px;
      border: 1px solid #d9e2ec;
    }
  }

  .generated-plan-files {
    width: 250px;
    overflow: auto;
    padding: 20px 16px;
    border-left: 1px solid #d9e2ec;
    background: #f7fafc;
  }

  .generated-files-title {
    margin-bottom: 14px;
    color: #1f2937;
    font-size: 15px;
    font-weight: 500;
  }

  .generated-file-item {
    display: flex;
    align-items: center;
    gap: 8px;
    width: 100%;
    margin-bottom: 10px;
    padding: 10px 8px;
    color: #334e68;
    background: #fff;
    border: 1px solid #d9e2ec;
    border-radius: 4px;
    cursor: pointer;
  }

  .generated-file-item:hover {
    color: #2989ff;
    border-color: #2989ff;
  }

  .generated-file-name {
    flex: 1;
    overflow: hidden;
    text-align: left;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .empty-content,
  .empty-files {
    padding: 32px 0;
    color: #8696a7;
    font-size: 14px;
    text-align: center;
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
