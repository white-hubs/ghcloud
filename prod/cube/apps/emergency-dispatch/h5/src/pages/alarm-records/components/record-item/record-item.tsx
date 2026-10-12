import dayjs from "dayjs";
import { defineComponent, type PropType } from "vue";

import type { AlarmRecordItem } from "@/utils/alarm-record-mapper";

import styles from "./record-item.module.less";

export const RecordItem = defineComponent({
  name: "RecordItem",
  props: {
    record: {
      type: Object as PropType<AlarmRecordItem>,
      required: true,
    },
  },
  emits: ["click"],
  setup: (props, { emit }) => {
    const typeName = props.record.alarmTypeName || props.record.alarmEventName || props.record.alarmEventTypeName || "报警事件";

    return (): JSX.Element => (
      <div
        class={styles.recordItem}
        onClick={() => {
          emit("click", props.record);
        }}
      >
        <div class={styles.titleRow}>
          <div class={styles.title}>{typeName}</div>
          <div class={styles.badges}>
            <span class={[styles.status, styles[props.record.alarmStatus ?? ""]]}>{props.record.alarmStatusName || "--"}</span>
            <span class={styles.level}>{props.record.alarmLevelName || "--"}</span>
          </div>
        </div>
        <div class={styles.content}>
          <div class={styles.row}>
            <span class={styles.label}>报警时间</span>
            <span class={styles.value}>{props.record.alarmTime ? dayjs(props.record.alarmTime).format("YYYY-MM-DD HH:mm:ss") : "--"}</span>
          </div>
          <div class={styles.row}>
            <span class={styles.label}>报警区域</span>
            <span class={styles.value}>{props.record.areaName || "--"}</span>
          </div>
          <div class={styles.row}>
            <span class={styles.label}>详细位置</span>
            <span class={styles.value}>{props.record.alarmTargetAddress || props.record.alarmTargetName || "--"}</span>
          </div>
        </div>
      </div>
    );
  },
});
