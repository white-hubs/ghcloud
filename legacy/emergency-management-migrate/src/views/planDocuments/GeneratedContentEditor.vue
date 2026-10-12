<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue";
import E from "wangeditor";

import { sanitizeRichText } from "./richText";

const props = defineProps({
  modelValue: {
    type: String,
    default: "",
  },
  readonly: {
    type: Boolean,
    default: false,
  },
  metadata: {
    type: String,
    default: "",
  },
});

const emit = defineEmits(["update:modelValue"]);
const editorElement = ref();
let editor = null;
let editorMetadataElement = null;

const safeContent = computed(() => sanitizeRichText(props.modelValue));

const setEditorHtml = (value) => {
  if (!editor) {
    return;
  }
  const html = sanitizeRichText(value);
  if (editor.txt.html() !== html) {
    editor.txt.html(html);
  }
};

const setEditorMetadata = (value) => {
  if (editorMetadataElement) {
    editorMetadataElement.textContent = value;
  }
};

onMounted(() => {
  if (props.readonly) {
    return;
  }
  nextTick(() => {
    editor = new E(editorElement.value);
    editor.config.height = 420;
    editor.config.zIndex = 2;
    editor.config.showFullScreen = true;
    editor.config.zIndexFullScreen = 11000;
    editor.config.placeholder = "请输入预案正文";
    editor.config.menus = [
      "head",
      "bold",
      "italic",
      "underline",
      "strikeThrough",
      "foreColor",
      "backColor",
      "list",
      "justify",
      "quote",
      "table",
      "undo",
      "redo",
    ];
    editor.config.onchange = (html) => {
      emit("update:modelValue", html);
    };
    editor.create();
    editorMetadataElement = document.createElement("div");
    editorMetadataElement.className = "document-metadata";
    editorElement.value.querySelector(".w-e-text-container")?.before(editorMetadataElement);
    setEditorMetadata(props.metadata);
    setEditorHtml(props.modelValue);
  });
});

watch(
  () => props.modelValue,
  (value) => {
    setEditorHtml(value);
  },
);

watch(
  () => props.metadata,
  (value) => {
    setEditorMetadata(value);
  },
);

onBeforeUnmount(() => {
  editor?.destroy();
  editor = null;
  editorMetadataElement = null;
});
</script>

<template>
  <div class="generated-content-editor" :class="{ editing: !readonly }">
    <template v-if="readonly">
      <div v-if="metadata" class="document-metadata">{{ metadata }}</div>
      <div class="generated-content-view" v-html="safeContent"></div>
    </template>
    <div v-else ref="editorElement"></div>
  </div>
</template>

<style lang="less" scoped>
.generated-content-editor {
  width: 100%;
  overflow: hidden;
  color: #1f2937;
  line-height: 1.7;
}

.generated-content-editor.editing {
  border: 1px solid #d5e0e8;
  border-radius: 4px;
  background: #fff;
}

.generated-content-editor :deep(.w-e-toolbar) {
  align-items: center;
  padding: 5px 10px;
  background: #f7fafc !important;
  border: 0 !important;
  border-bottom: 1px solid #e5e7eb !important;
}

.generated-content-editor :deep(.w-e-toolbar .w-e-menu) {
  width: 34px;
  height: 34px;
  border-radius: 3px;
}

.generated-content-editor :deep(.w-e-toolbar .w-e-menu:last-child) {
  margin-left: auto;
}

.generated-content-editor :deep(.document-metadata),
.document-metadata {
  margin: 0 28px;
  padding: 15px 0 12px;
  color: #6b7280;
  font-size: 12px;
  text-align: center;
  border-bottom: 1px solid #1f2937;
}

.generated-content-editor :deep(.w-e-text-container) {
  border: 0 !important;
  background: #fff;
}

.generated-content-editor :deep(.w-e-text) {
  padding: 18px 28px 28px;
}

.generated-content-editor :deep(.w-e-text h1),
.generated-content-view :deep(h1) {
  margin: 0 0 20px !important;
  color: #1c1b19;
  font-size: 22px !important;
  font-weight: 700;
  text-align: center;
}

.generated-content-editor :deep(.w-e-text h2),
.generated-content-view :deep(h2) {
  margin: 18px 0 10px !important;
  color: #1c1b19;
  font-size: 17px !important;
  font-weight: 700;
}

.generated-content-editor :deep(.w-e-text h3),
.generated-content-view :deep(h3) {
  margin: 14px 0 8px !important;
  color: #1c1b19;
  font-size: 14px !important;
  font-weight: 600;
}

.generated-content-editor :deep(.w-e-text p),
.generated-content-editor :deep(.w-e-text li),
.generated-content-editor :deep(.w-e-text td),
.generated-content-editor :deep(.w-e-text th),
.generated-content-view :deep(p),
.generated-content-view :deep(li),
.generated-content-view :deep(td),
.generated-content-view :deep(th) {
  margin: 0 0 8px !important;
  color: #4b5563;
  font-size: 13px !important;
  line-height: 1.8;
}

.generated-content-editor :deep(.w-e-text ul),
.generated-content-editor :deep(.w-e-text ol),
.generated-content-view :deep(ul),
.generated-content-view :deep(ol) {
  margin: 0 0 10px !important;
  padding-left: 22px;
}

.generated-content-editor :deep(.w-e-text table),
.generated-content-view :deep(table) {
  width: 100%;
  margin: 10px 0 !important;
  border-collapse: collapse;
}

.generated-content-editor :deep(.w-e-text td),
.generated-content-editor :deep(.w-e-text th),
.generated-content-view :deep(td),
.generated-content-view :deep(th) {
  padding: 8px 10px;
  border: 1px solid #e5e7eb;
}

.generated-content-editor :deep(.w-e-text th),
.generated-content-view :deep(th) {
  color: #1c1b19;
  background: #f9fafb;
}

.generated-content-editor :deep(.w-e-full-screen-editor) {
  border: 0;
  border-radius: 0;
  background: #fff;
}

.generated-content-editor :deep(.w-e-full-screen-editor .w-e-text) {
  max-width: 1120px;
  margin: 0 auto;
  padding: 22px 36px 40px;
}

.generated-content-view {
  min-height: 160px;
  padding: 18px 28px 28px;
  background: #fff;
}
</style>
