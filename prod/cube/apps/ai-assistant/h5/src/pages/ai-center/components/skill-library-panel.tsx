import { defineComponent, type PropType, type VNode } from "vue";

import type { AiCenterSkill, AiCenterSkillCategory } from "../types";
import { ActionPill } from "./action-pill";

import styles from "../ai-center.module.less";

export const SkillLibraryPanel = defineComponent({
  name: "SkillLibraryPanel",
  props: {
    activeCategoryId: {
      type: String,
      required: true,
    },
    categories: {
      type: Array as PropType<AiCenterSkillCategory[]>,
      required: true,
    },
    skills: {
      type: Array as PropType<AiCenterSkill[]>,
      required: true,
    },
    mySkillIds: {
      type: Object as PropType<ReadonlySet<string>>,
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
    onChangeCategory: {
      type: Function as PropType<(id: string) => void>,
      required: true,
    },
    onAddSkill: {
      type: Function as PropType<(id: string) => void | Promise<void>>,
      required: true,
    },
  },
  setup: (props): (() => VNode) => {
    const scrollCategoryIntoView = (target: HTMLElement): void => {
      const row = target.parentElement;
      if (!row) {
        return;
      }
      const rowRect = row.getBoundingClientRect();
      const targetRect = target.getBoundingClientRect();
      const edgeGap = 14;
      let nextScrollLeft = row.scrollLeft;

      if (targetRect.left < rowRect.left + edgeGap) {
        nextScrollLeft -= rowRect.left + edgeGap - targetRect.left;
      } else if (targetRect.right > rowRect.right - edgeGap) {
        nextScrollLeft += targetRect.right - (rowRect.right - edgeGap);
      } else {
        return;
      }

      const maxScrollLeft = Math.max(0, row.scrollWidth - row.clientWidth);
      row.scrollTo({
        left: Math.min(maxScrollLeft, Math.max(0, nextScrollLeft)),
        behavior: "smooth",
      });
    };

    const handleCategoryClick = (id: string, event: MouseEvent): void => {
      props.onChangeCategory(id);
      scrollCategoryIntoView(event.currentTarget as HTMLElement);
    };

    return (): VNode => (
      <section class={styles.panel}>
        <div class={styles.panelFixed}>
          <div class={styles.skillFilterRow}>
            {props.categories.map((category) => (
              <button
                key={category.id}
                type="button"
                class={[styles.filterChip, props.activeCategoryId === category.id ? styles.filterChipActive : undefined]}
                onClick={(event) => {
                  handleCategoryClick(category.id, event);
                }}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>
        <div class={[styles.panelScroll, styles.skillGrid]}>
          {props.loading ? <div class={styles.emptyState}>技能库加载中...</div> : null}
          {!props.loading && props.error ? <div class={styles.emptyState}>{props.error}</div> : null}
          {!props.loading && !props.error
            ? props.skills.map((skill) => {
                const added = props.mySkillIds.has(skill.id) || props.mySkillIds.has(skill.libraryRef ?? "");
                return (
                  <article key={skill.id} class={[styles.skillCard, added ? styles.skillCardAdded : undefined]}>
                    <div class={styles.skillLeft}>
                      <span class={styles.skillIcon}>{skill.icon}</span>
                      <span class={styles.skillName}>{skill.name}</span>
                    </div>
                    <ActionPill
                      added={added}
                      compact
                      text={added ? "已添加" : "+"}
                      onPress={() => {
                        props.onAddSkill(skill.id);
                      }}
                    />
                  </article>
                );
              })
            : null}
          {!props.loading && !props.error && props.skills.length === 0 ? <div class={styles.emptyState}>暂无匹配技能</div> : null}
        </div>
      </section>
    );
  },
});
