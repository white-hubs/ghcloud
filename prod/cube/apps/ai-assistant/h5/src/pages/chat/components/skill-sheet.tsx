import { Popup, Icon } from "vant";
import { computed, defineComponent, shallowRef, watch, type PropType, type VNode } from "vue";

import type { SkillItem } from "../types";

import styles from "../chat.module.less";

interface SkillSheetProps {
  show: boolean;
  skillList: SkillItem[];
  loading: boolean;
  error: string;
  selectedIds: string[];
}

export const SkillSheet = defineComponent({
  name: "SkillSheet",
  props: {
    show: {
      type: Boolean,
      required: true,
    },
    skillList: {
      type: Array as PropType<SkillSheetProps["skillList"]>,
      required: true,
    },
    loading: {
      type: Boolean,
      default: false,
    },
    error: {
      type: String,
      default: "",
    },
    selectedIds: {
      type: Array as PropType<SkillSheetProps["selectedIds"]>,
      required: true,
    },
    onClose: {
      type: Function as PropType<() => void>,
      required: true,
    },
    onToggleSkill: {
      type: Function as PropType<(id: string) => void>,
      required: true,
    },
  },
  setup: (props): (() => VNode) => {
    const keyword = shallowRef("");
    const visibleSkillList = computed(() => {
      const value = keyword.value.trim().toLowerCase();
      if (value.length === 0) {
        return props.skillList;
      }
      return props.skillList.filter((item) => item.name.toLowerCase().includes(value));
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
            <h3>技能</h3>
            <button type="button" class={styles.closeBtn} onClick={props.onClose}>
              <Icon name="cross" size="18" />
            </button>
          </div>
          <form class={styles.knowledgeSearch} action="" onSubmit={handleSearchSubmit}>
            <Icon name="search" size="16" />
            <input
              type="search"
              value={keyword.value}
              placeholder="搜索技能"
              enterkeyhint="search"
              onInput={(event) => {
                keyword.value = (event.target as HTMLInputElement).value;
              }}
            />
          </form>
          <div class={styles.recentTitle}>最近使用过的技能</div>
          <ul class={styles.knowledgeList}>
            {props.loading ? <li class={styles.knowledgeEmpty}>技能加载中...</li> : null}
            {!props.loading && props.error ? <li class={styles.knowledgeEmpty}>{props.error}</li> : null}
            {!props.loading && !props.error
              ? visibleSkillList.value.map((item) => (
                  <li
                    key={item.id}
                    class={[styles.knowledgeItem, props.selectedIds.includes(item.id) ? styles.knowledgeItemActive : ""]}
                    onClick={() => {
                      props.onToggleSkill(item.id);
                    }}
                  >
                    <Icon name="apps-o" size="16" />
                    <span>{item.name}</span>
                    <span class={styles.knowledgeCheck}>{props.selectedIds.includes(item.id) ? "✓" : ""}</span>
                  </li>
                ))
              : null}
            {!props.loading && !props.error && visibleSkillList.value.length === 0 ? (
              <li class={styles.knowledgeEmpty}>暂无匹配技能</li>
            ) : null}
          </ul>
        </section>
      </Popup>
    );
  },
});
