import { defineComponent } from "vue";

import CountTo from "@/shared-ui/panel/count-to/count-to";

import styles from "./progress-bar.module.less";

interface Props {
  label: string;
  value: number;
  total: number;
}

export const ProgressBar = defineComponent({
  props: {
    label: {
      type: String,
      required: true,
    },
    value: {
      type: Number,
      required: true,
    },
    total: {
      type: Number,
      required: true,
    },
  },
  emits: ["click"],
  setup(props: Props, { emit }) {
    return (): JSX.Element => (
      <div
        class={styles["progress-bar"]}
        onClick={() => {
          emit("click", props);
        }}
      >
        <div class={styles["progress-bar-text"]}>
          <div class={styles["progress-bar-label"]} title={props.label}>
            {props.label}
          </div>
          <div class={styles["progress-bar-value"]}>
            <CountTo startVal={0} endVal={props.value} duration={2000} separator=""></CountTo>
          </div>
        </div>
        <div class={styles["progress-bar-inner-wrapper"]}>
          <div class={styles["progress-bar-inner"]} style={{ width: `${(props.value / props.total) * 100}%` }}></div>
        </div>
      </div>
    );
  },
});
