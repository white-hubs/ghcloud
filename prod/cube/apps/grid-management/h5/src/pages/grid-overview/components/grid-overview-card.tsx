import { Icon } from "vant";
import { defineComponent, type PropType } from "vue";

import type { GridStatisticsChildrenDTO } from "@ghcloud/cube-grid-management-service";

import styles from "../index.module.less";

export const GridOverviewCard = defineComponent({
  props: {
    grid: {
      type: Object as PropType<GridStatisticsChildrenDTO>,
      required: true,
    },
  },
  emits: ["click"],
  setup: (props, { emit }) => {
    return (): JSX.Element => (
      <div class={styles["grid-card"]} onClick={() => emit("click")}>
        <div class={styles["grid-card-header"]}>
          <div class={styles["grid-card-title"]}>{props.grid.gridAreaName || "--"}</div>
        </div>
        <div class={styles["grid-card-people"]}>
          <span>网格长：{props.grid.gridLeaderName || "--"}</span>
          <span>网格员：{props.grid.gridMemberCount || 0}人</span>
        </div>
        <div class={styles["grid-card-metrics"]}>
          <div class={styles["grid-card-metric"]}>
            <div class={styles["metric-value"]}>{props.grid.deviceCount || 0}</div>
            <div class={styles["metric-label"]}>设备</div>
          </div>
          <div class={styles["grid-card-metric"]}>
            <div class={styles["metric-value"]}>{props.grid.assetCount || 0}</div>
            <div class={styles["metric-label"]}>资产</div>
          </div>
          <div class={styles["grid-card-metric"]}>
            <div class={styles["metric-value"]}>{props.grid.processingTaskCount || 0}</div>
            <div class={styles["metric-label"]}>进行中</div>
          </div>
          <div class={styles["grid-card-metric"]}>
            <div class={[styles["metric-value"], styles["green"]]}>{props.grid.finishedTaskCount || 0}</div>
            <div class={styles["metric-label"]}>已完成</div>
          </div>
        </div>
        <div class={styles["status-row"]}>
          <span>报警</span>
          <span class={(props.grid.alarmCount || 0) > 0 ? styles["danger"] : styles["success"]}>
            {(props.grid.alarmCount || 0) > 0 ? <Icon name="warning-o" /> : <Icon name="success" />}
            {props.grid.alarmCount || 0}
          </span>
        </div>
        <div class={styles["status-row"]}>
          <span>工单</span>
          <span class={(props.grid.unfinishedOrderCount || 0) > 0 ? styles["danger"] : styles["success"]}>
            {(props.grid.unfinishedOrderCount || 0) > 0 ? <Icon name="warning-o" /> : <Icon name="success" />}
            {props.grid.unfinishedOrderCount || 0}
          </span>
        </div>
        <div class={styles["status-row"]}>
          <span>异常</span>
          <span class={(props.grid.abnormalTaskCount || 0) > 0 ? styles["danger"] : styles["success"]}>
            {(props.grid.abnormalTaskCount || 0) > 0 ? <Icon name="warning-o" /> : <Icon name="success" />}
            {props.grid.abnormalTaskCount || 0}
          </span>
        </div>
      </div>
    );
  },
});
