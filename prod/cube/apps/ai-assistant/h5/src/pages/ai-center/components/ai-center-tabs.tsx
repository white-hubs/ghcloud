import { defineComponent, type PropType, type VNode } from "vue";

import type { AiCenterTabKey } from "../types";

import styles from "../ai-center.module.less";

const tabs: { key: AiCenterTabKey; label: string; icon: string }[] = [
  { key: "agents", label: "智能体广场", icon: "🏛️" },
  { key: "skills", label: "技能库", icon: "🛠️" },
  { key: "mine", label: "我的", icon: "🤖" },
];

export const AiCenterTabs = defineComponent({
  name: "AiCenterTabs",
  props: {
    active: {
      type: String as PropType<AiCenterTabKey>,
      required: true,
    },
  },
  emits: ["change"],
  setup:
    (props, { emit }): (() => VNode) =>
    (): VNode => (
      <nav class={styles.tabs}>
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            class={[styles.tabButton, props.active === tab.key ? styles.tabButtonActive : undefined]}
            onClick={() => {
              emit("change", tab.key);
            }}
          >
            <span class={styles.tabIcon}>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </nav>
    ),
});
