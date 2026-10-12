import { Empty, Icon } from "vant";
import { defineComponent, type PropType } from "vue";

import type { FireEventRecord } from "./event-records.model";
import { formatMobileDateTime } from "@/utils";

import styles from "./event-records.module.less";

export const EventRecordsCardList = defineComponent({
  name: "EventRecordsCardList",
  props: {
    records: {
      type: Array as PropType<FireEventRecord[]>,
      required: true,
    },
  },
  setup: (props) => (): JSX.Element =>
    props.records.length > 0 ? (
      <div class={styles.cardList}>
        {props.records.map((record) => {
          return (
            <article class={styles.card} key={record.id}>
              <header class={styles.cardHeader}>
                <div class={styles.cardIdentity}>
                  <span class={[styles.typeTag, styles[`tag-${record.eventType}`]]}>{record.eventName}</span>
                  <strong>{record.deviceInfo}</strong>
                </div>
                <time>{formatMobileDateTime(record.eventTime)}</time>
              </header>

              <div class={styles.pointName}>{record.pointName}</div>
              <div class={styles.detailLine}>
                <Icon class={styles.detailIcon} name="location-o" />
                <span>{record.location}</span>
              </div>
              <div class={styles.detailLine}>
                <Icon class={styles.detailIcon} name="cluster-o" />
                <span>{record.hostName}</span>
              </div>
            </article>
          );
        })}
      </div>
    ) : (
      <Empty class={styles.empty} description="暂无符合条件的事件" />
    ),
});
