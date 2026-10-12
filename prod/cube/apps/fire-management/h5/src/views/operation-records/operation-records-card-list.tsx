import { Empty, Icon } from "vant";
import { defineComponent, type PropType, type VNode } from "vue";

import { OPERATION_RESULT_LABEL, OPERATION_TYPE_LABEL, type FireOperationRecord } from "./operation-records.model";
import { formatMobileDateTime } from "@/utils";

import styles from "./operation-records.module.less";

export const OperationRecordsCardList = defineComponent({
  name: "OperationRecordsCardList",
  props: {
    records: {
      type: Array as PropType<FireOperationRecord[]>,
      required: true,
    },
  },
  setup: (props) => (): VNode =>
    props.records.length > 0 ? (
      <div class={styles.cardList}>
        {props.records.map((record) => {
          const resultClass =
            record.result === "success" ? styles.resultSuccess : record.result === "failed" ? styles.resultFailed : styles.resultProcessing;
          return (
            <article class={styles.card} key={record.id}>
              <header class={styles.cardHeader}>
                <strong>{record.content}</strong>
                <time>{formatMobileDateTime(record.operationTime)}</time>
              </header>

              <div class={styles.operationMeta}>
                <span>{record.operator}</span>
                <span class={styles.dot}>·</span>
                <span>{OPERATION_TYPE_LABEL[record.operationType]}</span>
                <span class={[styles.resultTag, resultClass]}>{OPERATION_RESULT_LABEL[record.result]}</span>
              </div>
              <div class={styles.hostLine}>
                <Icon class={styles.detailIcon} name="cluster-o" />
                <span>{record.hostName}</span>
              </div>
              {record.failureReason ? <div class={styles.failureReason}>失败原因：{record.failureReason}</div> : null}
            </article>
          );
        })}
      </div>
    ) : (
      <Empty class={styles.empty} description="暂无符合条件的操作记录" />
    ),
});
