import { Popup, Icon } from "vant";
import { computed, defineComponent, shallowRef, watch, type PropType, type VNode } from "vue";

import type { KnowledgeItem } from "../types";

import styles from "../chat.module.less";

interface KnowledgeSheetProps {
  show: boolean;
  knowledgeList: KnowledgeItem[];
  selectedIds: string[];
}

export const KnowledgeSheet = defineComponent({
  name: "KnowledgeSheet",
  props: {
    show: {
      type: Boolean,
      required: true,
    },
    knowledgeList: {
      type: Array as PropType<KnowledgeSheetProps["knowledgeList"]>,
      required: true,
    },
    selectedIds: {
      type: Array as PropType<KnowledgeSheetProps["selectedIds"]>,
      required: true,
    },
    onClose: {
      type: Function as PropType<() => void>,
      required: true,
    },
    onToggleKnowledge: {
      type: Function as PropType<(id: string) => void>,
      required: true,
    },
  },
  setup: (props): (() => VNode) => {
    const keyword = shallowRef("");
    const visibleKnowledgeList = computed(() => {
      const value = keyword.value.trim().toLowerCase();
      if (value.length === 0) {
        return props.knowledgeList;
      }
      return props.knowledgeList.filter((item) => item.name.toLowerCase().includes(value));
    });

    watch(
      () => props.show,
      (show) => {
        if (!show) {
          keyword.value = "";
        }
      },
    );

    const handleSearchSubmit = (event: SubmitEvent): void => {
      event.preventDefault();
      const input = event.currentTarget instanceof HTMLFormElement ? event.currentTarget.querySelector("input") : null;
      input?.blur();
    };

    return (): VNode => (
      <Popup
        show={props.show}
        round
        position="bottom"
        class={styles.knowledgePopup}
        overlayClass={styles.knowledgeOverlay}
        onClickOverlay={props.onClose}
      >
        <section class={styles.knowledgePanel}>
          <div class={styles.knowledgeTitleRow}>
            <h3>知识库</h3>
            <button type="button" class={styles.closeBtn} onClick={props.onClose}>
              <Icon name="cross" size="18" />
            </button>
          </div>
          <form class={styles.knowledgeSearch} action="" onSubmit={handleSearchSubmit}>
            <Icon name="search" size="16" />
            <input
              type="search"
              value={keyword.value}
              placeholder="搜索知识库"
              enterkeyhint="search"
              onInput={(event) => {
                keyword.value = (event.target as HTMLInputElement).value;
              }}
            />
          </form>
          <div class={styles.recentTitle}>最近使用过的知识库</div>
          <ul class={styles.knowledgeList}>
            {visibleKnowledgeList.value.map((item) => (
              <li
                key={item.id}
                class={[styles.knowledgeItem, props.selectedIds.includes(item.id) ? styles.knowledgeItemActive : ""]}
                onClick={() => {
                  props.onToggleKnowledge(item.id);
                }}
              >
                <Icon name="description" size="16" />
                <span>{item.name}</span>
                <span class={styles.knowledgeCheck}>{props.selectedIds.includes(item.id) ? "✓" : ""}</span>
              </li>
            ))}
            {visibleKnowledgeList.value.length === 0 ? <li class={styles.knowledgeEmpty}>暂无匹配知识库</li> : null}
          </ul>
        </section>
      </Popup>
    );
  },
});
