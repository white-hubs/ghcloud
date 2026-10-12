import { computed, defineComponent, onUnmounted, ref, Teleport, watch } from "vue";

import {
  COPY_HTML_REPORT_CARD_HINT,
  COPY_HTML_REPORT_CARD_TITLE,
  COPY_HTML_REPORT_CLOSE,
  COPY_HTML_REPORT_OPEN,
  COPY_HTML_REPORT_PRINT,
} from "./assistant-chat-strings";
import { buildHtmlReportSrcdoc, HTML_REPORT_IFRAME_SANDBOX, HTML_REPORT_MESSAGE } from "./assistant-html-report";
import { renderAssistantMarkdownToHtml } from "./assistant-markdown";
import { logAssistantReportError } from "./assistant-report-log";

import styles from "./assistant-chat.module.less";

/**
 * html-output 报告：气泡内只呈现一张「报告卡片」（类外链），点击后弹窗查看。
 * - 弹窗内用 sandbox iframe 渲染，srcdoc 由纯函数 buildHtmlReportSrcdoc 组装（严格 CSP + 桥接脚本）；
 * - sandbox 严禁 allow-same-origin；父窗口只通过 postMessage 触发子页打印；
 * - 弹窗 Teleport 到 body，避免受气泡容器 overflow / 层叠上下文影响；
 * - 组装异常时兜底为普通代码块展示源码（html:false 转义，不执行）。
 */
export const AssistantHtmlReportBlock = defineComponent({
  name: "AssistantHtmlReportBlock",
  props: {
    source: { type: String, required: true },
  },
  setup(props) {
    const iframeRef = ref<HTMLIFrameElement | null>(null);
    const open = ref(false);

    const rendered = computed<{ ok: boolean; srcdoc: string }>(() => {
      try {
        return { ok: true, srcdoc: buildHtmlReportSrcdoc(props.source) };
      } catch (error) {
        logAssistantReportError("AssistantHtmlReportBlock", "buildHtmlReportSrcdoc failed", { sourceLen: props.source.length }, error);
        return { ok: false, srcdoc: "" };
      }
    });

    const openModal = (): void => {
      open.value = true;
    };
    const closeModal = (): void => {
      open.value = false;
    };

    const onKeydown = (event: KeyboardEvent): void => {
      if (event.key === "Escape") {
        closeModal();
      }
    };

    // 弹窗开启时锁滚动 + 监听 Esc；关闭 / 卸载时恢复，避免残留副作用
    watch(open, (isOpen) => {
      if (isOpen) {
        document.body.style.overflow = "hidden";
        window.addEventListener("keydown", onKeydown);
      } else {
        document.body.style.overflow = "";
        window.removeEventListener("keydown", onKeydown);
      }
    });

    onUnmounted(() => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeydown);
    });

    const openInNewTab = (): void => {
      try {
        const blob = new Blob([rendered.value.srcdoc], { type: "text/html" });
        const url = URL.createObjectURL(blob);
        window.open(url, "_blank", "noopener,noreferrer");
        window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
      } catch (error) {
        logAssistantReportError("AssistantHtmlReportBlock", "openInNewTab failed", {}, error);
      }
    };

    const printReport = (): void => {
      const win = iframeRef.value?.contentWindow;
      if (win == null) {
        return;
      }
      win.postMessage({ type: HTML_REPORT_MESSAGE.print }, "*");
    };

    const renderCard = () => (
      <button type="button" class={styles.htmlReportCard} onClick={openModal}>
        <span class={styles.htmlReportCardIcon} aria-hidden="true">
          <svg
            viewBox="0 0 24 24"
            width="20"
            height="20"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <path d="M14 2v6h6" />
            <path d="M8 13h2v5H8zM14 10h2v8h-2z" />
          </svg>
        </span>
        <span class={styles.htmlReportCardBody}>
          <span class={styles.htmlReportCardTitle}>{COPY_HTML_REPORT_CARD_TITLE}</span>
          <span class={styles.htmlReportCardHint}>{COPY_HTML_REPORT_CARD_HINT}</span>
        </span>
        <span class={styles.htmlReportCardChevron} aria-hidden="true">
          ›
        </span>
      </button>
    );

    const renderModal = () => (
      <Teleport to="body">
        <div class={styles.reportModalOverlay} onClick={closeModal}>
          <div class={styles.reportModalPanel} role="dialog" aria-modal="true" onClick={(event: MouseEvent) => event.stopPropagation()}>
            <div class={styles.reportModalHeader}>
              <span class={styles.reportModalTitle}>{COPY_HTML_REPORT_CARD_TITLE}</span>
              <div class={styles.reportModalActions}>
                <button type="button" class={styles.reportModalActionBtn} onClick={openInNewTab}>
                  {COPY_HTML_REPORT_OPEN}
                </button>
                <button type="button" class={styles.reportModalActionBtn} onClick={printReport}>
                  {COPY_HTML_REPORT_PRINT}
                </button>
                <button type="button" class={styles.reportModalClose} aria-label={COPY_HTML_REPORT_CLOSE} onClick={closeModal}>
                  ×
                </button>
              </div>
            </div>
            <iframe
              ref={iframeRef}
              class={styles.reportModalFrame}
              sandbox={HTML_REPORT_IFRAME_SANDBOX}
              srcdoc={rendered.value.srcdoc}
              referrerpolicy="no-referrer"
              loading="lazy"
              title={COPY_HTML_REPORT_CARD_TITLE}
            />
          </div>
        </div>
      </Teleport>
    );

    return () => {
      if (!rendered.value.ok) {
        const fenceMarkdown = ["```html", props.source, "```"].join("\n");
        return <div class={styles.htmlReportBlock} v-html={renderAssistantMarkdownToHtml(fenceMarkdown)} />;
      }
      return (
        <>
          {renderCard()}
          {open.value ? renderModal() : null}
        </>
      );
    };
  },
});
