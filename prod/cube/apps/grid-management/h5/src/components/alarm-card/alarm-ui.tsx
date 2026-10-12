import dayjs from "dayjs";
import { Empty, Loading } from "vant";
import { defineComponent, type PropType } from "vue";

import type { AlarmRecord } from "@ghcloud/cube-alarm-center-service/src/types/alarm-center";
import type { GridTaskStatDTO } from "@ghcloud/cube-grid-management-service";

import { useGridState } from "@/pages/grid-list/grid-info-store";
import { useSubPagesRouter } from "@/pages/sub-pages/sub-pages-router";

import styles from "./index.module.less";
export const AlarmUI = defineComponent({
  props: {
    userIds: {
      type: Array as PropType<string[]>,
      default: () => [],
    },
    loading: {
      type: Boolean,
      default: false,
    },
    finished: {
      type: Boolean,
      default: true,
    },
    alarmInfo: {
      type: Object as PropType<{
        alarmList: AlarmRecord[];
        alarmStat: GridTaskStatDTO;
      }>,
      default: () => {},
    },
  },
  emits: ["loadMore"],
  setup: (props, { emit }) => {
    const columns = [
      {
        title: "报警时间",
        key: "alarmTime",
        render: (row: AlarmRecord): JSX.Element => (
          <div class={styles["grid-name"]}>{dayjs(row.alarmTime).format("YYYY-MM-DD HH:mm:ss")}</div>
        ),
      },
      {
        title: "报警类型",
        key: "alarmTypeName",
        render: (row: AlarmRecord): JSX.Element => <div class={styles["grid-name"]}>{row.alarmTypeName}</div>,
      },
      {
        title: "设备事件",
        key: "alarmEventName",
      },
      {
        title: "状态",
        key: "alarmStatusName",
      },
    ];
    const subPagesRouter = useSubPagesRouter();
    const gridState = useGridState();
    const toDetail = (id: string): void => {
      subPagesRouter.toAlarmDetail(id);
    };
    const handleScroll = (event: Event): void => {
      const target = event.currentTarget as HTMLElement;
      const reachedBottom = target.scrollTop + target.clientHeight >= target.scrollHeight - 20;
      if (reachedBottom && !props.loading && !props.finished) {
        emit("loadMore");
      }
    };
    return (): JSX.Element => (
      <div class={styles["alarm-card"]}>
        <div class={styles["alarm-stat"]} onClick={() => subPagesRouter.toAlarmRecords(gridState.getGridInfo().gridAreaId)}>
          <div class={[styles["alarm-stat-item"], styles["alarm-count"]]}>
            <div class={styles["item-label"]}>告警数</div>
            <div class={styles["item-value"]}>{props.alarmInfo.alarmStat.alarmNum}</div>
          </div>
          <div class={[styles["alarm-stat-item"], styles["alarm-doing"]]}>
            <div class={styles["item-label"]}>进行中</div>
            <div class={styles["item-value"]}>{props.alarmInfo.alarmStat.alarmNum - props.alarmInfo.alarmStat.doneAlarmNum}</div>
          </div>
          <div class={[styles["alarm-stat-item"], styles["alarm-done"]]}>
            <div class={styles["item-label"]}>已完成</div>
            <div class={styles["item-value"]}>{props.alarmInfo.alarmStat.doneAlarmNum}</div>
          </div>
        </div>
        <div class={styles["alarm-table"]}>
          <div class={styles["alarm-table-header"]}>
            {columns.map((item) => (
              <div class={styles["alarm-table-header-item"]} key={item.key}>
                {item.title}
              </div>
            ))}
          </div>
          <div class={styles["alarm-table-body"]} onScroll={handleScroll}>
            {props.alarmInfo.alarmList.length !== 0 &&
              props.alarmInfo.alarmList.map((item) => (
                <div class={styles["alarm-table-row"]} key={item.id} onClick={() => toDetail(item.id)}>
                  {columns.map((col) => (
                    <div class={styles["alarm-table-row-item"]} key={col.key}>
                      {col.render ? col.render(item) : item[col.key as keyof AlarmRecord]}
                    </div>
                  ))}
                </div>
              ))}
            {!props.loading && !props.alarmInfo.alarmList.length && <Empty description="暂无数据" />}
            {props.loading && (
              <div class={styles["load-status"]}>
                <Loading size="18px">加载中...</Loading>
              </div>
            )}
            {!props.loading && props.finished && props.alarmInfo.alarmList.length > 0 && (
              <div class={styles["load-status"]}>没有更多了</div>
            )}
          </div>
        </div>
      </div>
    );
  },
});
