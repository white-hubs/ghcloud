import { Empty, Icon } from "vant";
import { defineComponent, type PropType } from "vue";

import type { PointStatisticsRecord } from "./point-statistics.model";

import styles from "./point-statistics.module.less";

const displayTime = (value: string): string => (value === "--" ? value : value.slice(5, 16));

export const PointStatisticsCardList = defineComponent({
  name: "PointStatisticsCardList",
  props: {
    records: {
      type: Array as PropType<PointStatisticsRecord[]>,
      required: true,
    },
  },
  setup: (props) => (): JSX.Element =>
    props.records.length > 0 ? (
      <div class={styles.cardList}>
        {props.records.map((record) => (
          <article class={styles.card} key={record.id}>
            <header class={styles.cardHeader}>
              <strong>{record.pointName}</strong>
              <time>{displayTime(record.lastTriggered)}</time>
            </header>

            <div class={styles.detailLine}>
              <Icon class={styles.detailIcon} name="location-o" />
              <span>{record.location}</span>
            </div>
            <footer class={styles.counts}>
              <span class={[styles.countItem, styles.alarmCount]}>
                <Icon name="fire-o" />
                报警 {record.alarmCount}次
              </span>
              <span class={[styles.countItem, styles.faultCount]}>
                <Icon name="warning-o" />
                故障 {record.faultCount}次
              </span>
              <span class={styles.totalCount}>合计 {record.totalCount}次</span>
            </footer>
          </article>
        ))}
      </div>
    ) : (
      <Empty class={styles.empty} description="暂无符合条件的点位" />
    ),
});
