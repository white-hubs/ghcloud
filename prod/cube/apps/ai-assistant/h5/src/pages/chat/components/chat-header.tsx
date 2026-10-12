import { Icon } from "vant";
import { defineComponent, type PropType, type VNode } from "vue";

import styles from "../chat.module.less";

export const ChatHeader = defineComponent({
  name: "ChatHeader",
  props: {
    title: {
      type: String,
      required: true,
    },
    onOpenDrawer: {
      type: Function as PropType<() => void>,
      required: true,
    },
    onBack: {
      type: Function as PropType<() => void>,
      required: true,
    },
    onChangeAgent: {
      type: Function as PropType<() => void>,
      required: true,
    },
  },
  setup:
    (props): (() => VNode) =>
    (): VNode => (
      <header class={styles.header}>
        <button class={styles.headerIconBtn} type="button" onClick={props.onBack}>
          <Icon name="arrow-left" size="20" />
        </button>
        <button class={styles.headerTitleWrap} type="button" onClick={props.onChangeAgent}>
          <span class={styles.headerTitle}>{props.title}</span>
          <Icon name="arrow-down" size="12" />
        </button>
        <button class={styles.headerIconBtn} type="button" onClick={props.onOpenDrawer}>
          <Icon name="bars" size="20" />
        </button>
      </header>
    ),
});
