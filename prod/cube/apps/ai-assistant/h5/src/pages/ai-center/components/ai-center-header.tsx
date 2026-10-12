import { Icon } from "vant";
import { defineComponent, type PropType, type VNode } from "vue";

import styles from "../ai-center.module.less";

export const AiCenterHeader = defineComponent({
  name: "AiCenterHeader",
  props: {
    onBack: {
      type: Function as PropType<() => void>,
      required: true,
    },
  },
  setup:
    (props): (() => VNode) =>
    (): VNode => (
      <header class={styles.topBar}>
        <button type="button" class={styles.topBackButton} aria-label="返回" onClick={props.onBack}>
          <Icon name="arrow-left" size="20" />
        </button>
        <h1 class={styles.topTitle}>AI中心</h1>
        <span class={styles.topRightSpace} />
      </header>
    ),
});
