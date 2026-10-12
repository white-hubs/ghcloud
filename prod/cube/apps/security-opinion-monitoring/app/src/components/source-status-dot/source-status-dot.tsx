import { defineComponent } from "vue";

import type { SourceStatus } from "@ghcloud/cube-service-interface/security-opinion";

import { SOURCE_STATUS_LABEL } from "@/constants";

import styles from "./source-status-dot.module.less";

const DOT_CLASS: Record<SourceStatus, string> = {
  running: styles.running,
  paused: styles.paused,
  abnormal: styles.abnormal,
};

export const SourceStatusDot = defineComponent({
  props: {
    status: { type: String as () => SourceStatus, required: true },
  },
  setup(props) {
    return (): JSX.Element => (
      <span class={styles.wrap}>
        <span class={[styles.dot, DOT_CLASS[props.status]]} />
        {SOURCE_STATUS_LABEL[props.status]}
      </span>
    );
  },
});
