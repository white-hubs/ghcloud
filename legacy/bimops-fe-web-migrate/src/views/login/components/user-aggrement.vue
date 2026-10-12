<template>
  <div
    class="aggrement"
    :class="{ 'aggrement-error': hasAgreementError, 'aggrement-shake': isAgreementShaking }"
    @animationend="isAgreementShaking = false"
  >
    <a-checkbox
      @change="
        (e) => {
          onCheckAllChange(e);
        }
      "
      v-model:checked="checked"
    >
      我已阅读并同意<a @click="(e) => agreement(e)">用户协议</a>及<a @click="(e) => privacy(e)">隐私政策</a>
    </a-checkbox>
  </div>
  <Teleport to="body">
    <a-modal v-model:visible="visible" :title="title" width="800px" :z-index="1100" @ok="handleOk">
      <div class="agreement-document">
        <a-spin :spinning="protocolLoading">
          <a-empty v-if="protocolError" :description="protocolError">
            <a-button type="primary" @click="reloadProtocol">重新加载</a-button>
          </a-empty>
          <div v-else class="agreement-content" v-html="renderedProtocol"></div>
        </a-spin>
      </div>
    </a-modal>
    <a-modal
      v-model:visible="agreementConfirmVisible"
      title="用户协议与隐私政策"
      ok-text="同意并登录"
      cancel-text="不同意"
      centered
      :z-index="1000"
      @ok="handleAgreementConfirm"
      @cancel="handleAgreementCancel"
    >
      <div class="agreement-confirm">
        登录前请先阅读并同意
        <a @click="(e) => agreement(e)">用户协议</a>
        及
        <a @click="(e) => privacy(e)">隐私政策</a>
        。
      </div>
    </a-modal>
  </Teleport>
</template>

<script>
export const AGREEMENT_STORAGE_KEY = "agreement";

export const isLoginAgreementAccepted = () => {
  return localStorage.getItem(AGREEMENT_STORAGE_KEY) === "true";
};

export const setLoginAgreementAccepted = (accepted) => {
  localStorage.setItem(AGREEMENT_STORAGE_KEY, accepted ? "true" : "false");
};
</script>

<script setup>
import MarkdownIt from "markdown-it";
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from "vue";

import { CubeDictionaryService } from "@ghcloud/cube-dictionary-service";

const AGREEMENT_DOCUMENTS = {
  agreement: {
    title: "用户协议",
    itemCode: "LOGIN_LEGAL_DOCUMENT",
    code: "USER_AGREEMENT",
  },
  privacy: {
    title: "隐私政策",
    itemCode: "LOGIN_LEGAL_DOCUMENT",
    code: "PRIVACY_POLICY",
  },
};

const markdownRenderer = new MarkdownIt({
  html: false,
  linkify: true,
  breaks: true,
});

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
      if (child.tagName === "A") {
        if (href && /^(https?:)?\/\//i.test(href)) {
          child.setAttribute("href", href);
          child.setAttribute("target", "_blank");
          child.setAttribute("rel", "noopener noreferrer");
        }
      }
      if (style) {
        const safeStyle = style
          .split(";")
          .map((item) => {
            const separatorIndex = item.indexOf(":");
            return separatorIndex < 0 ? [] : [item.slice(0, separatorIndex), item.slice(separatorIndex + 1)];
          })
          .filter(([name, value]) => RICH_TEXT_STYLE_RULES[name?.trim().toLowerCase()]?.test(value?.trim()))
          .map(([name, value]) => `${name.trim().toLowerCase()}: ${value.trim()}`)
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

const getProtocolContent = (variable) => {
  const config = JSON.parse(variable);
  if (!["markdown", "richtext"].includes(config?.format) || typeof config.content !== "string" || !config.content.trim()) {
    throw new Error("Invalid legal document dictionary configuration");
  }
  return config;
};

const emit = defineEmits(["acceptedChange", "confirmAccepted", "confirmRejected"]);

const checked = ref(isLoginAgreementAccepted());
const visible = ref(false);
const title = ref("");
const activeDocument = ref("");
const protocolLoading = ref(false);
const protocolError = ref("");
const protocolContent = ref("");
const protocolFormat = ref("");
const hasAgreementError = ref(false);
const isAgreementShaking = ref(false);
const agreementConfirmVisible = ref(false);

const documentCache = new Map();
const renderedProtocol = computed(() =>
  protocolFormat.value === "richtext" ? sanitizeRichText(protocolContent.value) : markdownRenderer.render(protocolContent.value),
);

let remindTimer = null;
let protocolRequestId = 0;
const handleOk = () => {
  visible.value = false;
};
/**
 * 处理协议选中状态变化
 */
const onCheckAllChange = (e) => {
  checked.value = e.target.checked;
  setLoginAgreementAccepted(checked.value);
  emit("acceptedChange", checked.value);
  if (checked.value) {
    hasAgreementError.value = false;
    isAgreementShaking.value = false;
  }
};

/**
 * 加载字典中的 Markdown 协议
 */
const loadProtocol = async (documentKey, forceReload = false) => {
  const document = AGREEMENT_DOCUMENTS[documentKey];
  if (!document) {
    return;
  }

  activeDocument.value = documentKey;
  title.value = document.title;
  visible.value = true;
  protocolError.value = "";
  protocolContent.value = "";
  protocolFormat.value = "";
  const requestId = ++protocolRequestId;

  const cacheKey = `${document.itemCode}:${document.code}`;
  if (!forceReload && documentCache.has(cacheKey)) {
    protocolLoading.value = false;
    const cachedDocument = documentCache.get(cacheKey);
    protocolContent.value = cachedDocument.content;
    protocolFormat.value = cachedDocument.format;
    return;
  }

  protocolLoading.value = true;
  try {
    const result = await new CubeDictionaryService().getSysDictionaryByCodeAndItemCode({
      itemCode: document.itemCode,
      code: document.code,
    });
    const content = getProtocolContent(result?.variable);
    documentCache.set(cacheKey, content);
    if (requestId === protocolRequestId) {
      protocolContent.value = content.content;
      protocolFormat.value = content.format;
    }
  } catch (error) {
    if (requestId === protocolRequestId) {
      protocolError.value = "协议内容加载失败，请稍后重试";
    }
  } finally {
    if (requestId === protocolRequestId) {
      protocolLoading.value = false;
    }
  }
};

const agreement = (e) => {
  e.stopPropagation();
  loadProtocol("agreement");
};

/**
 * 打开隐私政策页面
 */
const privacy = (e) => {
  e.stopPropagation();
  loadProtocol("privacy");
};

const reloadProtocol = () => {
  loadProtocol(activeDocument.value, true);
};

const remind = async () => {
  hasAgreementError.value = true;
  isAgreementShaking.value = false;
  if (remindTimer) {
    clearTimeout(remindTimer);
  }
  await nextTick();
  isAgreementShaking.value = true;
  remindTimer = setTimeout(() => {
    isAgreementShaking.value = false;
    remindTimer = null;
  }, 520);
};

const openAgreementConfirm = () => {
  agreementConfirmVisible.value = true;
};

const handleAgreementConfirm = () => {
  checked.value = true;
  hasAgreementError.value = false;
  isAgreementShaking.value = false;
  setLoginAgreementAccepted(true);
  emit("acceptedChange", true);
  emit("confirmAccepted");
  agreementConfirmVisible.value = false;
};

const handleAgreementCancel = () => {
  emit("confirmRejected");
  agreementConfirmVisible.value = false;
};

onMounted(() => {
  if (isLoginAgreementAccepted()) {
    checked.value = true;
  }
});

onBeforeUnmount(() => {
  if (remindTimer) {
    clearTimeout(remindTimer);
  }
});

defineExpose({
  remind,
  openAgreementConfirm,
});
</script>

<style lang="less" scoped>
.aggrement {
  flex: 0 1 auto;
  min-width: max-content;
  display: flex;
  align-items: center;
  border-radius: calc((4 / var(--design-width)) * 100vw);
  padding: 0;

  label {
    font-size: calc((12 / var(--design-width)) * 100vw) !important ;
    color: #a4afca;
  }

  :deep(.ant-checkbox-wrapper) {
    display: inline-flex;
    align-items: center;
    white-space: nowrap;
    line-height: calc((18 / var(--design-width)) * 100vw);
  }

  :deep(.ant-checkbox) {
    flex: 0 0 auto;
    top: 0;
  }

  :deep(.ant-checkbox + span) {
    line-height: calc((18 / var(--design-width)) * 100vw);
    white-space: nowrap;
  }
}

.aggrement-error {
  :deep(.ant-checkbox-inner) {
    border-color: #ff4d4f !important;
    box-shadow: 0 0 0 calc((2 / var(--design-width)) * 100vw) rgba(255, 77, 79, 0.12);
  }
}

.aggrement-shake {
  animation: agreement-shake 0.48s ease-in-out;
}

.agreement-confirm {
  color: #404449;
  font-size: 14px;
  line-height: 24px;
}

.agreement-document {
  min-height: 240px;
}

.agreement-content {
  height: 500px;
  overflow: auto;
  padding: 0 8px;
  color: #404449;
  font-size: 14px;
  line-height: 1.75;

  :deep(h1),
  :deep(h2),
  :deep(h3) {
    margin: 20px 0 12px;
    color: #1f2329;
  }

  :deep(p),
  :deep(ul),
  :deep(ol) {
    margin: 0 0 12px;
  }

  :deep(a) {
    color: #1890ff;
  }
}

@keyframes agreement-shake {
  0%,
  100% {
    transform: translate3d(0, 0, 0);
  }
  20%,
  60% {
    transform: translate3d(-4px, 0, 0);
  }
  40%,
  80% {
    transform: translate3d(4px, 0, 0);
  }
}

@media (prefers-reduced-motion: reduce) {
  .aggrement-shake {
    animation: none;
  }
}
</style>
