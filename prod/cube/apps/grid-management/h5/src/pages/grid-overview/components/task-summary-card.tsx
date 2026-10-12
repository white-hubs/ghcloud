import { defineComponent, type PropType } from "vue";

import styles from "../index.module.less";

export interface TaskSummaryItem {
  label: string;
  value: number;
  tone: "blue" | "green" | "red";
}

export const TaskSummaryCard = defineComponent({
  props: {
    items: {
      type: Array as PropType<TaskSummaryItem[]>,
      required: true,
    },
  },
  setup: (props) => {
    return (): JSX.Element => (
      <div class={styles["task-summary-card"]}>
        <div class={styles["task-summary-list"]}>
          {props.items.map((item) => (
            <div class={styles["task-summary-item"]} key={item.label}>
              <div class={[styles["task-summary-value"], styles[item.tone]]}>{item.value}</div>
              <div class={styles["task-summary-label"]}>{item.label}</div>
            </div>
          ))}
        </div>
      </div>
    );
  },
});
