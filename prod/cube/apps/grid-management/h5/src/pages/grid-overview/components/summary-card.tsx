import { defineComponent, type PropType } from "vue";

import styles from "../index.module.less";

export interface OverviewSummaryItem {
  label: string;
  value: number;
}

export const SummaryCard = defineComponent({
  props: {
    items: {
      type: Array as PropType<OverviewSummaryItem[]>,
      required: true,
    },
  },
  setup: (props) => {
    return (): JSX.Element => (
      <div class={styles["summary-card"]}>
        <div class={styles["summary-grid"]}>
          {props.items.map((item) => (
            <div class={styles["summary-item"]} key={item.label}>
              <div class={styles["summary-value"]}>{item.value}</div>
              <div class={styles["summary-label"]}>{item.label}</div>
            </div>
          ))}
        </div>
      </div>
    );
  },
});
