import { defineComponent, type PropType } from "vue";

import styles from "../index.module.less";

export interface GridTabItem {
  label: string;
  value: string;
}

export const GridTabs = defineComponent({
  props: {
    items: {
      type: Array as PropType<GridTabItem[]>,
      required: true,
    },
    active: {
      type: String,
      required: true,
    },
  },
  emits: ["change"],
  setup: (props, { emit }) => {
    return (): JSX.Element => (
      <div class={styles["grid-tabs"]}>
        {props.items.map((item) => (
          <button
            class={[styles["grid-tab"], props.active === item.value && styles["active"]]}
            key={item.value}
            type="button"
            onClick={() => emit("change", item.value)}
          >
            {item.label}
          </button>
        ))}
      </div>
    );
  },
});
