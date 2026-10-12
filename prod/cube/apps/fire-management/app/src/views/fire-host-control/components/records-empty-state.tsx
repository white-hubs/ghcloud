import { defineComponent } from "vue";

import { Empty } from "@ghcloud/cube-ui";

import styles from "../fire-host-control.module.less";

export const RecordsEmptyState = defineComponent({
  name: "RecordsEmptyState",
  props: {
    description: { type: String, default: "暂无数据" },
    detail: { type: String, default: "当前主机在所选范围内没有相关记录" },
    compact: { type: Boolean, default: false },
  },
  setup(props) {
    return () => (
      <div class={[styles.recordsEmptyState, props.compact && styles.recordsEmptyStateCompact]}>
        <Empty description={props.description} />
        {props.detail ? <span>{props.detail}</span> : null}
      </div>
    );
  },
});
