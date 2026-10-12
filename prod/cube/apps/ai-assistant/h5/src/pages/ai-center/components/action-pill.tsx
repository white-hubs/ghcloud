import { defineComponent, type PropType, type VNode } from "vue";

import styles from "../ai-center.module.less";

export const ActionPill = defineComponent({
  name: "ActionPill",
  props: {
    added: {
      type: Boolean,
      required: true,
    },
    remove: {
      type: Boolean,
      default: false,
    },
    compact: {
      type: Boolean,
      default: false,
    },
    text: {
      type: String,
      default: "",
    },
    onPress: {
      type: Function as PropType<() => void>,
      required: true,
    },
  },
  setup:
    (props): (() => VNode) =>
    (): VNode => {
      const label = props.text || (props.remove ? "移除" : props.added ? "已添加" : "+ 添加");
      return (
        <button
          type="button"
          class={[
            styles.actionPill,
            props.compact ? styles.actionPillCompact : undefined,
            props.added ? styles.actionPillAdded : undefined,
            props.remove ? styles.actionPillDanger : undefined,
          ]}
          disabled={props.added && !props.remove}
          onClick={(event) => {
            event.stopPropagation();
            props.onPress();
          }}
        >
          {label}
        </button>
      );
    },
});
