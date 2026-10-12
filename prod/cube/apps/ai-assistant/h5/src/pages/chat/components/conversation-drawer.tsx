import { Icon, Popup } from "vant";
import { computed, defineComponent, type PropType, type VNode } from "vue";
import { useRouter } from "vue-router";

import type { ConversationItem } from "../types";

import styles from "../chat.module.less";

interface ConversationDrawerProps {
  show: boolean;
  conversations: ConversationItem[];
  activeConversationId: string;
  loading?: boolean;
  loadingMore?: boolean;
  hasMore?: boolean;
}

export const ConversationDrawer = defineComponent({
  name: "ConversationDrawer",
  props: {
    show: {
      type: Boolean,
      required: true,
    },
    conversations: {
      type: Array as PropType<ConversationDrawerProps["conversations"]>,
      required: true,
    },
    activeConversationId: {
      type: String,
      required: true,
    },
    loading: {
      type: Boolean as PropType<ConversationDrawerProps["loading"]>,
      default: false,
    },
    loadingMore: {
      type: Boolean as PropType<ConversationDrawerProps["loadingMore"]>,
      default: false,
    },
    hasMore: {
      type: Boolean as PropType<ConversationDrawerProps["hasMore"]>,
      default: false,
    },
    onClose: {
      type: Function as PropType<() => void>,
      required: true,
    },
    onNewConversation: {
      type: Function as PropType<() => void>,
      required: true,
    },
    onSelectConversation: {
      type: Function as PropType<(id: string) => void>,
      required: true,
    },
    onMoreConversation: {
      type: Function as PropType<(conversation: ConversationItem) => void>,
      required: true,
    },
    onLoadMore: {
      type: Function as PropType<() => void>,
      required: true,
    },
  },
  setup: (props): (() => VNode) => {
    const router = useRouter();
    const groupedConversations = computed(() => {
      const groups: { label: string; conversations: ConversationItem[] }[] = [];
      for (const item of props.conversations) {
        const label = item.dayLabel || "更早";
        const group = groups.find((candidate) => candidate.label === label);
        if (group) {
          group.conversations.push(item);
          continue;
        }
        groups.push({ label, conversations: [item] });
      }
      return groups;
    });

    const openAgentSelect = (): void => {
      props.onClose();
      void router.push({ path: "/agent-select" });
    };

    const handleHistoryScroll = (event: Event): void => {
      const target = event.currentTarget as HTMLElement;
      const distanceToBottom = target.scrollHeight - target.scrollTop - target.clientHeight;
      if (distanceToBottom <= 48 && props.hasMore && !props.loading && !props.loadingMore) {
        props.onLoadMore();
      }
    };

    return (): VNode => (
      <Popup
        show={props.show}
        position="right"
        class={styles.drawerPopup}
        overlayClass={styles.drawerOverlay}
        onClickOverlay={props.onClose}
      >
        <aside class={styles.drawerPanel}>
          <div class={styles.drawerTopTitle}>开河AI</div>
          <button class={styles.newChatBtn} type="button" onClick={props.onNewConversation}>
            <span>新建对话</span>
          </button>
          <div
            class={styles.agentRow}
            role="button"
            tabindex={0}
            onClick={openAgentSelect}
            onKeydown={(e: KeyboardEvent) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                openAgentSelect();
              }
            }}
          >
            <span>智能体</span>
            <span>&gt;</span>
          </div>
          <ul class={styles.historyList} onScroll={handleHistoryScroll}>
            {props.conversations.length === 0 && !props.loading ? <li class={styles.historyEmpty}>暂无对话</li> : null}
            {props.loading ? <li class={styles.historyEmpty}>加载中</li> : null}
            {groupedConversations.value.map((group) => (
              <li key={group.label} class={styles.historyGroup}>
                <div class={styles.dayTag}>{group.label}</div>
                <ul class={styles.historyGroupList}>
                  {group.conversations.map((item) => (
                    <li key={item.id} class={[styles.historyItem, props.activeConversationId === item.id ? styles.historyItemActive : ""]}>
                      <button
                        type="button"
                        class={styles.historyTitleBtn}
                        onClick={() => {
                          props.onSelectConversation(item.id);
                        }}
                      >
                        <span>{item.title}</span>
                      </button>
                      <button
                        type="button"
                        class={styles.historyMoreBtn}
                        aria-label="更多操作"
                        onClick={(event) => {
                          event.stopPropagation();
                          props.onMoreConversation(item);
                        }}
                      >
                        <Icon name="ellipsis" size="18" />
                      </button>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
            {props.loadingMore ? <li class={styles.historyEmpty}>加载更多...</li> : null}
            {!props.loading && !props.loadingMore && !props.hasMore && props.conversations.length > 0 ? (
              <li class={styles.historyEmpty}>没有更多了</li>
            ) : null}
          </ul>
        </aside>
      </Popup>
    );
  },
});
