import { computed, defineComponent, nextTick, onBeforeUnmount, onMounted, ref, watch, type PropType, type VNode } from "vue";

import { buildAgenticEngineRequestHeaders, fetchAuthenticatedPreviewBlobUrl, resolveAttachmentPreviewSrc } from "../assistant-attachments";
import { readInsightReasoningSteps, readInsightToolEvents, readTokenUsageItems } from "../assistant-insights";
import { renderAssistantMarkdownToHtml } from "../assistant-markdown";
import type { ChatAttachment, ChatMessage } from "../types";
import { MessageInsightPanel } from "./message-insight-panel";
import { authStore } from "@/api/auth-store";

import styles from "../chat.module.less";

interface MessageListProps {
  messages: ChatMessage[];
  bottomOffset: number;
  hasMoreHistory: boolean;
  loadingHistory: boolean;
  showHistoryHeader: boolean;
  mediaBaseUrl: string;
  onLoadHistory?: () => Promise<void> | void;
}

const ESTIMATED_MESSAGE_HEIGHT = 112;
const DEFAULT_BOTTOM_OFFSET = 138;
const OVERSCAN_COUNT = 6;
const MIN_VIRTUAL_MESSAGE_COUNT = 30;
const LOAD_HISTORY_THRESHOLD = 96;
const PULL_HISTORY_THRESHOLD = 36;

export const MessageList = defineComponent({
  name: "MessageList",
  props: {
    messages: {
      type: Array as PropType<MessageListProps["messages"]>,
      required: true,
    },
    bottomOffset: {
      type: Number as PropType<MessageListProps["bottomOffset"]>,
      default: DEFAULT_BOTTOM_OFFSET,
    },
    onPreviewAttachment: {
      type: Function as PropType<(attachment: ChatAttachment) => void>,
      required: true,
    },
    hasMoreHistory: {
      type: Boolean as PropType<MessageListProps["hasMoreHistory"]>,
      default: false,
    },
    loadingHistory: {
      type: Boolean as PropType<MessageListProps["loadingHistory"]>,
      default: false,
    },
    showHistoryHeader: {
      type: Boolean as PropType<MessageListProps["showHistoryHeader"]>,
      default: true,
    },
    mediaBaseUrl: {
      type: String as PropType<MessageListProps["mediaBaseUrl"]>,
      required: true,
    },
    onLoadHistory: {
      type: Function as PropType<MessageListProps["onLoadHistory"]>,
      default: undefined,
    },
  },
  setup: (props): (() => VNode) => {
    const listRef = ref<HTMLDivElement | null>(null);
    const scrollTop = ref(0);
    const viewportHeight = ref(0);
    const messageHeights = ref<Record<string, number>>({});
    const isLoadingMore = ref(false);
    const touchStartY = ref<number | null>(null);
    const pullDistance = ref(0);
    const previewSrcById = ref<Record<string, string>>({});
    /** 避免出现「mounted 瞬间 scrollTop=0、误触顶部加载」，仅在滚到底就绪后再允许顶边加载/hit */
    const allowHistoryEdgeLoad = ref(false);
    let rafId = 0;

    const sectionStyle = computed<Record<string, string>>(() => ({
      "--message-bottom-offset": `${Math.max(0, Math.ceil(props.bottomOffset))}px`,
    }));
    const lastMessageActivityKey = computed(() => {
      const message = props.messages.at(-1);
      if (message == null) {
        return "";
      }
      const insight = message.insight;
      const reasoningSteps = readInsightReasoningSteps(insight);
      const reasoningKey =
        reasoningSteps.map((step) => `${step.stepId}:${step.text.length}:${step.ok ?? "running"}:${step.endTime ?? ""}`).join("|") ?? "";
      const toolKey = readInsightToolEvents(insight)
        .map((event) => `${event.id}:${event.phase}:${event.completedAt ?? ""}`)
        .join("|");
      const usage = insight?.tokenUsage;
      const usageCumulative = usage?.cumulative;
      const usageItems = readTokenUsageItems(usage);
      const tokenKey =
        usage == null || usageCumulative == null
          ? ""
          : `${usageCumulative.input}:${usageCumulative.output}:${usageItems.at(-1)?.updatedAt ?? ""}:${usage.terminalKind ?? ""}`;
      return `${message.id}:${message.content.length}:${message.sending === true ? "sending" : "idle"}:${reasoningKey}:${toolKey}:${tokenKey}`;
    });

    /** 是否在列表顶部一侧（含移动端顶部橡皮筋下拉、scrollTop 仍为 0 的情况） */
    const atScrollTopEdge = (): boolean => {
      if (!listRef.value) {
        return false;
      }
      const el = listRef.value;
      const maxScrollTop = Math.max(0, el.scrollHeight - el.clientHeight);
      return el.scrollTop <= LOAD_HISTORY_THRESHOLD || maxScrollTop <= 8;
    };

    const getMessageHeight = (id: string): number => messageHeights.value[id] ?? ESTIMATED_MESSAGE_HEIGHT;

    const virtualState = computed(() => {
      if (props.messages.length <= MIN_VIRTUAL_MESSAGE_COUNT) {
        return {
          topPadding: 0,
          bottomPadding: 0,
          items: props.messages,
        };
      }

      let totalHeight = 0;
      const heights = props.messages.map((item) => {
        const height = getMessageHeight(item.id);
        totalHeight += height;
        return height;
      });

      const startOffset = Math.max(0, scrollTop.value - ESTIMATED_MESSAGE_HEIGHT * OVERSCAN_COUNT);
      let start = 0;
      let topPadding = 0;

      while (start < heights.length && topPadding + heights[start] < startOffset) {
        topPadding += heights[start];
        start += 1;
      }

      let end = start;
      let renderedHeight = 0;
      const renderHeight = viewportHeight.value + ESTIMATED_MESSAGE_HEIGHT * OVERSCAN_COUNT * 2;

      while (end < heights.length && renderedHeight < renderHeight) {
        renderedHeight += heights[end];
        end += 1;
      }

      return {
        topPadding,
        bottomPadding: Math.max(0, totalHeight - topPadding - renderedHeight),
        items: props.messages.slice(start, end),
      };
    });

    const updateScrollMetrics = (): void => {
      if (!listRef.value) {
        return;
      }
      scrollTop.value = listRef.value.scrollTop;
      viewportHeight.value = listRef.value.clientHeight;
    };

    const isNearBottom = (): boolean => {
      if (!listRef.value) {
        return true;
      }
      const distance = listRef.value.scrollHeight - listRef.value.clientHeight - listRef.value.scrollTop;
      return distance <= LOAD_HISTORY_THRESHOLD;
    };

    const scrollToBottom = (): void => {
      if (rafId !== 0) {
        cancelAnimationFrame(rafId);
      }
      rafId = requestAnimationFrame(() => {
        if (!listRef.value) {
          return;
        }
        listRef.value.scrollTop = Math.max(0, listRef.value.scrollHeight - listRef.value.clientHeight);
        updateScrollMetrics();
        allowHistoryEdgeLoad.value = true;
      });
    };

    const loadMoreHistory = async (): Promise<void> => {
      if (!props.onLoadHistory || props.loadingHistory || !props.hasMoreHistory || isLoadingMore.value || !listRef.value) {
        return;
      }

      const previousScrollHeight = listRef.value.scrollHeight;
      const previousScrollTop = listRef.value.scrollTop;
      isLoadingMore.value = true;

      try {
        await props.onLoadHistory();
        await nextTick();
        if (!listRef.value) {
          return;
        }
        listRef.value.scrollTop = listRef.value.scrollHeight - previousScrollHeight + previousScrollTop;
        updateScrollMetrics();
      } catch {
      } finally {
        isLoadingMore.value = false;
      }
    };

    const handleScroll = (): void => {
      updateScrollMetrics();
      if (!allowHistoryEdgeLoad.value) {
        return;
      }
      if (scrollTop.value <= LOAD_HISTORY_THRESHOLD) {
        loadMoreHistory().catch(() => {
          isLoadingMore.value = false;
        });
      }
    };

    const handleTouchStart = (event: TouchEvent): void => {
      updateScrollMetrics();
      touchStartY.value = atScrollTopEdge() ? (event.touches[0]?.clientY ?? null) : null;
      pullDistance.value = 0;
    };

    const handleTouchMove = (event: TouchEvent): void => {
      if (touchStartY.value === null) {
        return;
      }
      pullDistance.value = Math.max(0, (event.touches[0]?.clientY ?? touchStartY.value) - touchStartY.value);
    };

    const handleTouchEnd = (): void => {
      if (pullDistance.value >= PULL_HISTORY_THRESHOLD && allowHistoryEdgeLoad.value && atScrollTopEdge()) {
        loadMoreHistory().catch(() => {
          isLoadingMore.value = false;
        });
      }
      touchStartY.value = null;
      pullDistance.value = 0;
    };

    const setMessageRef = (id: string, element: Element | null): void => {
      if (!(element instanceof HTMLElement)) {
        return;
      }
      const height = Math.ceil(element.offsetHeight);
      if (height > 0 && messageHeights.value[id] !== height) {
        messageHeights.value = { ...messageHeights.value, [id]: height };
      }
    };

    const revokeBlobUrls = (map: Record<string, string>): void => {
      for (const src of Object.values(map)) {
        if (src.startsWith("blob:")) {
          URL.revokeObjectURL(src);
        }
      }
    };

    const loadAttachmentPreviews = async (): Promise<void> => {
      revokeBlobUrls(previewSrcById.value);
      previewSrcById.value = {};
      const imageAttachments = props.messages
        .flatMap((message) => message.attachments ?? [])
        .filter((attachment) => attachment.kind === "image");
      if (imageAttachments.length === 0) {
        return;
      }
      const headers = buildAgenticEngineRequestHeaders({
        tenant: authStore.tenant,
        terminal: authStore.terminal,
        token: authStore.token,
      });
      const next: Record<string, string> = {};
      await Promise.all(
        imageAttachments.map(async (attachment) => {
          const previewUrl = attachment.url.trim();
          if (previewUrl === "") {
            return;
          }
          const blobUrl = await fetchAuthenticatedPreviewBlobUrl(previewUrl, props.mediaBaseUrl, headers);
          if (blobUrl != null) {
            next[attachment.id] = blobUrl;
          }
        }),
      );
      previewSrcById.value = next;
    };

    watch(
      () => props.messages.at(-1)?.id,
      async () => {
        allowHistoryEdgeLoad.value = false;
        await nextTick();
        scrollToBottom();
      },
      { immediate: true },
    );

    watch(lastMessageActivityKey, async () => {
      const shouldStickToBottom = isNearBottom();
      await nextTick();
      updateScrollMetrics();
      if (shouldStickToBottom) {
        scrollToBottom();
      }
    });

    watch(
      () => props.bottomOffset,
      async () => {
        const shouldStickToBottom = isNearBottom();
        await nextTick();
        updateScrollMetrics();
        if (shouldStickToBottom) {
          scrollToBottom();
        }
      },
    );

    watch(
      () => [props.messages, props.mediaBaseUrl] as const,
      () => {
        loadAttachmentPreviews().catch(() => {
          previewSrcById.value = {};
        });
      },
      { immediate: true, deep: true },
    );

    onMounted(() => {
      updateScrollMetrics();
      window.addEventListener("resize", updateScrollMetrics);
    });

    onBeforeUnmount(() => {
      if (rafId !== 0) {
        cancelAnimationFrame(rafId);
      }
      revokeBlobUrls(previewSrcById.value);
      window.removeEventListener("resize", updateScrollMetrics);
    });

    const resolveAttachmentUrl = (url: string): string => {
      return resolveAttachmentPreviewSrc(url, props.mediaBaseUrl);
    };

    const renderAttachment = (attachment: ChatAttachment): VNode => {
      const url = previewSrcById.value[attachment.id] ?? resolveAttachmentUrl(attachment.url);
      if (attachment.kind === "image") {
        return (
          <button
            key={attachment.id}
            class={styles.imageAttachment}
            type="button"
            onClick={() => {
              props.onPreviewAttachment({ ...attachment, url });
            }}
          >
            {previewSrcById.value[attachment.id] != null || url.startsWith("blob:") || url.startsWith("data:") ? (
              <img src={url} alt={attachment.name} />
            ) : (
              <span class={styles.imageAttachmentPlaceholder}>图片加载中</span>
            )}
          </button>
        );
      }
      return (
        <button
          key={attachment.id}
          class={styles.fileAttachment}
          type="button"
          onClick={() => {
            props.onPreviewAttachment(attachment);
          }}
        >
          <span class={styles.fileIcon}>{attachment.suffix?.slice(0, 3).toUpperCase() || "FILE"}</span>
          <span class={styles.fileInfo}>
            <span class={styles.fileName}>{attachment.name}</span>
            {attachment.size === undefined ? null : <span class={styles.fileSize}>{Math.ceil(attachment.size / 1024)} KB</span>}
          </span>
        </button>
      );
    };

    const renderHistoryStatus = (): VNode | null => {
      if (!props.showHistoryHeader || !props.onLoadHistory) {
        return null;
      }
      const text =
        props.loadingHistory || isLoadingMore.value
          ? "正在加载历史记录..."
          : props.hasMoreHistory
            ? "下拉查看历史记录"
            : "没有更多历史记录";
      return <div class={styles.messageHistoryStatus}>{text}</div>;
    };

    const renderMessageContent = (item: ChatMessage): VNode | null => {
      if (item.content.length > 0) {
        if (item.role === "assistant") {
          return (
            <div
              class={[styles.assistantBubble, styles.assistantMarkdownBody]}
              v-html={renderAssistantMarkdownToHtml(item.content, {
                mediaBaseUrl: props.mediaBaseUrl,
              })}
            />
          );
        }
        return <div class={styles.userBubble}>{item.content}</div>;
      }
      if (item.failureText) {
        return <div class={[styles.assistantBubble, styles.assistantFailure]}>{item.failureText}</div>;
      }
      if (item.sending === true) {
        return <div class={[styles.assistantBubble, styles.assistantThinking]}>正在生成...</div>;
      }
      if (item.role === "assistant") {
        return <div class={[styles.assistantBubble, styles.assistantThinking]}>暂无回复内容</div>;
      }
      return null;
    };

    return (): VNode => (
      <section
        class={styles.messageSection}
        style={sectionStyle.value}
        ref={listRef}
        onScroll={handleScroll}
        onTouchstart={handleTouchStart}
        onTouchmove={handleTouchMove}
        onTouchend={handleTouchEnd}
        onTouchcancel={handleTouchEnd}
      >
        {props.showHistoryHeader ? <div class={styles.messageHistoryTitle}>历史记录</div> : null}
        {renderHistoryStatus()}
        <div class={styles.messageTopSpacer} style={{ height: `${virtualState.value.topPadding}px` }} />
        {virtualState.value.items.map((item) => (
          <div
            key={item.id}
            ref={(element) => {
              setMessageRef(item.id, element as Element | null);
            }}
          >
            <div class={item.role === "user" ? styles.messageUserRow : styles.messageAssistantRow}>
              <div class={styles.messageTime}>{item.time}</div>
              {item.role === "assistant" && item.insight != null ? (
                <MessageInsightPanel insight={item.insight} mediaBaseUrl={props.mediaBaseUrl} sending={item.sending === true} />
              ) : null}
              {renderMessageContent(item)}
              {item.attachments && item.attachments.length > 0 ? (
                <div class={item.role === "user" ? styles.userAttachmentList : styles.assistantAttachmentList}>
                  {item.attachments.map((attachment) => renderAttachment(attachment))}
                </div>
              ) : null}
            </div>
          </div>
        ))}
        <div class={styles.messageBottomSpacer} style={{ height: `${virtualState.value.bottomPadding}px` }} />
      </section>
    );
  },
});
