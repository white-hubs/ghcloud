<template>
  <a-modal v-model:visible="visible" :title="title" ok-text="确认" cancel-text="取消" @ok="handleConfirm" width="800px">
    <a-form
      :labelCol="{
        style: {
          width: '90px',
        },
      }"
      ref="formRef"
      :model="formState"
      :rules="rules"
    >
      <a-form-item has-feedback label="父级字典" name="superiorsId" v-if="dictType !== 'list'">
        <a-tree-select
          v-model:value="formState.superiorsId"
          show-search
          style="width: 100%"
          :dropdown-style="{ maxHeight: '400px', overflow: 'auto' }"
          @select="handleTreeChange"
          :fieldNames="{
            children: 'nextList',
            key: 'id',
            value: 'id',
            label: 'name',
          }"
          :tree-data="dictTreeData"
          allow-clear
          placeholder="Please select"
          tree-default-expand-all
        >
        </a-tree-select>
      </a-form-item>
      <a-form-item has-feedback label="字典名称" name="name">
        <a-input v-model:value="formState.name" placeholder="请输入字典名称" type="text" />
      </a-form-item>
      <a-form-item has-feedback label="字典编码" name="code">
        <a-input v-model:value="formState.code" placeholder="请输入字典项编码" type="text" />
      </a-form-item>
      <a-form-item has-feedback label="变量格式">
        <a-radio-group v-model:value="variableFormat" @change="handleVariableFormatChange">
          <a-radio value="text">文本</a-radio>
          <a-radio value="json">JSON</a-radio>
          <!-- <a-radio value="markdown">Markdown</a-radio> -->
          <a-radio value="richtext">富文本</a-radio>
        </a-radio-group>
      </a-form-item>
      <a-form-item has-feedback label="字典变量" name="variable">
        <a-textarea
          v-if="variableFormat === 'text'"
          v-model:value="variableContent"
          placeholder="请输入描述"
          :auto-size="{ minRows: 2, maxRows: 5 }"
        />
        <JsonEditor v-else-if="variableFormat === 'json'" v-model="variableContent" lang="json" width="100%"></JsonEditor>
        <a-textarea
          v-else-if="variableFormat === 'markdown'"
          v-model:value="variableContent"
          placeholder="请输入 Markdown 内容"
          :rows="18"
        />
        <div v-else class="rich-text-editor">
          <div :key="richTextEditorKey" ref="richTextEditorContainer"></div>
        </div>
      </a-form-item>
      <a-form-item has-feedback label="字典描述" name="remarks">
        <a-textarea v-model:value="formState.remarks" placeholder="请输入描述" :auto-size="{ minRows: 2, maxRows: 5 }" />
      </a-form-item>
    </a-form>
  </a-modal>
</template>
<script lang="jsx">
import { message } from "ant-design-vue";
import JsonEditor from "bin-editor-next";
import { defineComponent, reactive, toRefs, toRaw, computed, watch, shallowRef, nextTick, onBeforeUnmount } from "vue";
import WangEditor from "wangeditor";
import "brace/ext/emmet";
import "brace/ext/language_tools";
import "brace/mode/json";
import "brace/snippets/json";
import "brace/theme/chrome";

const parseJsonObject = (value) => {
  try {
    const parsed = JSON.parse(value);
    return parsed && parsed.constructor === Object ? parsed : null;
  } catch (error) {
    return null;
  }
};

const isMarkdownConfig = (value) => {
  const parsed = parseJsonObject(value);
  return parsed?.format === "markdown" && typeof parsed.content === "string";
};

const isRichTextConfig = (value) => {
  const parsed = parseJsonObject(value);
  return parsed?.format === "richtext" && typeof parsed.content === "string";
};

const RICH_TEXT_ALLOWED_TAGS = new Set([
  "H1",
  "H2",
  "H3",
  "H4",
  "H5",
  "P",
  "STRONG",
  "B",
  "EM",
  "I",
  "U",
  "S",
  "DEL",
  "OL",
  "UL",
  "LI",
  "BR",
  "SPAN",
  "A",
  "BLOCKQUOTE",
  "PRE",
  "CODE",
  "HR",
]);
const RICH_TEXT_DANGEROUS_TAGS = new Set([
  "SCRIPT",
  "STYLE",
  "IFRAME",
  "OBJECT",
  "EMBED",
  "FORM",
  "INPUT",
  "BUTTON",
  "VIDEO",
  "AUDIO",
  "IMG",
]);
const RICH_TEXT_STYLE_RULES = {
  "text-align": /^(left|center|right|justify)$/,
  "text-indent": /^-?(?:0|[1-9]\d*)(?:\.\d+)?(?:px|em|rem)$/,
  "line-height": /^(?:0|[1-9]\d*)(?:\.\d+)?(?:px|em|rem|%)?$/,
  "font-size": /^(?:[89]|[1-4]\d)px$/,
  color: /^(?:#[0-9a-f]{3}|#[0-9a-f]{6}|rgb\((?:\d{1,3},\s*){2}\d{1,3}\))$/i,
  "background-color": /^(?:#[0-9a-f]{3}|#[0-9a-f]{6}|rgb\((?:\d{1,3},\s*){2}\d{1,3}\))$/i,
  "font-family": /^(黑体|仿宋|楷体|标楷体|华文仿宋|华文楷体|宋体|微软雅黑|Arial|Tahoma|Verdana|Times New Roman|Courier New)$/,
};

const sanitizeRichText = (html) => {
  const document = new DOMParser().parseFromString(html || "", "text/html");
  const sanitizeElement = (element) => {
    Array.from(element.children).forEach((child) => {
      if (RICH_TEXT_DANGEROUS_TAGS.has(child.tagName)) {
        child.remove();
        return;
      }
      if (!RICH_TEXT_ALLOWED_TAGS.has(child.tagName)) {
        sanitizeElement(child);
        const fragment = document.createDocumentFragment();
        while (child.firstChild) {
          fragment.appendChild(child.firstChild);
        }
        child.replaceWith(fragment);
        return;
      }

      const href = child.getAttribute("href");
      const style = child.getAttribute("style");
      Array.from(child.attributes).forEach((attribute) => child.removeAttribute(attribute.name));
      if (child.tagName === "A" && href && /^(https?:)?\/\//i.test(href)) {
        child.setAttribute("href", href);
        child.setAttribute("target", "_blank");
        child.setAttribute("rel", "noopener noreferrer");
      }
      if (style) {
        const safeStyle = style
          .split(";")
          .map((item) => {
            const separatorIndex = item.indexOf(":");
            return separatorIndex < 0 ? [] : [item.slice(0, separatorIndex), item.slice(separatorIndex + 1)];
          })
          .filter(([name, styleValue]) => RICH_TEXT_STYLE_RULES[name?.trim().toLowerCase()]?.test(styleValue?.trim()))
          .map(([name, styleValue]) => `${name.trim().toLowerCase()}: ${styleValue.trim()}`)
          .join("; ");
        if (safeStyle) {
          child.setAttribute("style", safeStyle);
        }
      }
      sanitizeElement(child);
    });
  };

  sanitizeElement(document.body);
  return document.body.innerHTML;
};

export default defineComponent({
  components: {
    JsonEditor,
  },
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    type: {
      type: String,
      default: "add",
    },
    dictTreeData: {
      type: Array,
      default: () => {
        return [];
      },
    },
    editState: {
      type: Object,
      default: () => {
        return {};
      },
    },
    dictType: {
      type: String,
      default: "list",
    },
  },
  emits: ["update:visible", "confirm"],
  setup(props, { emit }) {
    const visible = computed({
      get: () => {
        return props.visible;
      },
      set: (val) => {
        emit("update:visible", val);
      },
    });
    const findDictNodeForLevel = (list, id) => {
      for (const item of list || []) {
        if (item.id === id) {
          return item;
        }
        const found = findDictNodeForLevel(item.nextList, id);
        if (found) {
          return found;
        }
      }
      return undefined;
    };
    const handleTreeChange = (value, _labelList, extra) => {
      const sn = extra?.selectedNodes?.[0];
      let row = sn?.props?.dataRef ?? sn?.dataRef ?? sn;
      if (row?.level == null && value != null) {
        row = findDictNodeForLevel(props.dictTreeData, value);
      }
      if (row?.level != null) {
        state.formState.level = row.level + 1;
      }
    };
    const title = computed(() => {
      return props.type === "add" ? "新增字典" : "编辑字典";
    });
    const state = reactive({
      formState: {
        name: "",
        code: "",
        variable: "",
        superiorsId: "",
        level: 1,
        remarks: "",
      },
      variableFormat: "text",
      lastVariableFormat: "text",
      variableContent: "",
      richTextEditorKey: 0,
      rules: {
        name: [
          {
            required: true,
            message: "请输入字典名称",
          },
        ],
        code: [
          {
            required: true,
            message: "请输入字典项编码",
          },
        ],
      },
    });
    const richTextEditorContainer = shallowRef(null);
    const richTextEditorRef = shallowRef(null);
    const destroyRichTextEditor = () => {
      richTextEditorRef.value?.destroy();
      richTextEditorRef.value = null;
    };
    const initRichTextEditor = () => {
      nextTick(() => {
        if (state.variableFormat !== "richtext" || !richTextEditorContainer.value) {
          return;
        }
        destroyRichTextEditor();
        const editor = new WangEditor(richTextEditorContainer.value);
        editor.config.height = 378;
        editor.config.zIndex = 2;
        editor.config.placeholder = "请输入协议内容";
        editor.config.menus = [
          "head",
          "bold",
          "fontSize",
          "fontName",
          "italic",
          "underline",
          "strikeThrough",
          "foreColor",
          "backColor",
          "link",
          "list",
          "justify",
          "quote",
          "code",
          "undo",
          "redo",
          "indent",
          "lineHeight",
          "splitLine",
        ];
        editor.config.onchange = (html) => {
          state.variableContent = html;
        };
        editor.create();
        editor.txt.html(state.variableContent || "");
        richTextEditorRef.value = editor;
      });
    };
    const syncVariableEditor = (value) => {
      const variable = value ?? "";
      const parsed = parseJsonObject(variable);
      const format = isRichTextConfig(variable) ? "richtext" : isMarkdownConfig(variable) ? "markdown" : parsed ? "json" : "text";

      state.variableFormat = format;
      state.lastVariableFormat = format;
      state.variableContent =
        format === "richtext"
          ? sanitizeRichText(parsed.content)
          : format === "markdown"
            ? parsed.content
            : format === "json"
              ? JSON.stringify(parsed, null, 2)
              : variable;
      if (format === "richtext") {
        state.richTextEditorKey += 1;
        initRichTextEditor();
      } else {
        destroyRichTextEditor();
      }
    };
    const syncEditorWithProps = () => {
      state.formState = {
        ...props.editState,
        superiorsId: props.editState.superiorsId ?? "",
      };
      syncVariableEditor(props.editState.variable);
    };
    watch(
      [() => props.visible, () => props.editState],
      ([isVisible]) => {
        if (isVisible) {
          syncEditorWithProps();
        }
      },
      { flush: "post", deep: true, immediate: true },
    );
    const handleVariableFormatChange = (event) => {
      const nextFormat = event.target.value;
      if (nextFormat === "json" && !parseJsonObject(state.variableContent)) {
        state.variableFormat = state.lastVariableFormat;
        message.warning("JSON 格式仅支持对象，请先输入有效 JSON");
        return;
      }
      state.variableFormat = nextFormat;
      state.lastVariableFormat = nextFormat;
      if (nextFormat === "richtext") {
        state.richTextEditorKey += 1;
        initRichTextEditor();
      } else {
        destroyRichTextEditor();
      }
    };
    const handleConfirm = () => {
      let variable = state.variableContent;
      if (state.variableFormat === "json") {
        const parsed = parseJsonObject(variable);
        if (!parsed) {
          message.warning("请输入有效的 JSON 对象");
          return;
        }
        variable = JSON.stringify(parsed);
      }
      if (state.variableFormat === "markdown") {
        variable = JSON.stringify({ format: "markdown", content: state.variableContent });
      }
      if (state.variableFormat === "richtext") {
        variable = JSON.stringify({ format: "richtext", content: sanitizeRichText(state.variableContent) });
      }
      emit("confirm", toRaw({ ...state.formState, variable }));
    };
    onBeforeUnmount(() => {
      richTextEditorRef.value?.destroy();
    });

    return {
      title,
      visible,
      handleConfirm,
      handleTreeChange,
      handleVariableFormatChange,
      richTextEditorContainer,
      richTextEditorRef,
      ...toRefs(state),
    };
  },
});
</script>
<style scoped lang="less">
:deep(.content-left) {
  padding-top: 0px !important;
}

@import url("@/styles/searchTable/index.less");

.table-search {
  padding: 0 12px;
  display: flex;
  align-items: center;
  gap: 12px;

  :deep(.ant-input) {
    width: 200px;
  }
}

.table-content {
  padding: 12px;
}

.rich-text-editor {
  min-height: 420px;
  border: 1px solid #d9d9d9;
}
</style>
