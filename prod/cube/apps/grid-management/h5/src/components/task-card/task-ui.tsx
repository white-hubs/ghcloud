import dayjs from "dayjs";
import { Empty, Loading } from "vant";
import { defineComponent, type PropType } from "vue";
import { useRouter } from "vue-router";

import type { GridTaskDTO, GridTaskStatDTO } from "@ghcloud/cube-grid-management-service";

import styles from "./index.module.less";
export const TaskUI = defineComponent({
  props: {
    gridAreaId: {
      type: String,
      default: () => "",
    },
    fromOverview: {
      type: Boolean,
      default: false,
    },
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
    taskInfo: {
      type: Object as PropType<{
        taskList: GridTaskDTO[];
        taskStat: GridTaskStatDTO;
      }>,
      default: () => {},
    },
  },
  emits: ["loadMore"],
  setup: (props, { emit }) => {
    const router = useRouter();
    const handleGoTaskList = (status: string) => {
      router.push({
        path: "/grid-list/task-list",
        query: {
          status,
          areaId: props.gridAreaId,
          userIds: props.userIds.join(","),
          ...(props.fromOverview ? { source: "overview" } : {}),
        },
      });
    };

    const toDetail = (id: string, businessType: string): void => {
      // router.push({
      //   path: "/task-detail",
      //   query: {
      //     id,
      //   },
      // });
      // apps/daily-inspection/h5#/inspection-detail?id=2014336578920964097&userId=1783765980598579201
      switch (businessType) {
        case "INSPECTION":
          if (props.userIds.length > 0)
            window.location.href = `/apps/daily-inspection/h5#/inspection-detail?id=${id}&userId=${props.userIds[0]}`;
          break;
        case "ELECTRON_TASK":
          window.location.href = `/apps/electronic-patrol/h5#/patrol-task-detail?taskId=${id}`;
          break;
        default:
          window.location.href = `/apps/daily-task/h5#/task-detail?id=${id}`;
          break;
      }
    };
    const handleScroll = (event: Event): void => {
      const target = event.currentTarget as HTMLElement;
      const reachedBottom = target.scrollTop + target.clientHeight >= target.scrollHeight - 20;
      if (reachedBottom && !props.loading && !props.finished) {
        emit("loadMore");
      }
    };
    return (): JSX.Element => (
      <div class={styles["task-card"]}>
        <div class={styles["task-stat"]}>
          <div class={[styles["task-stat-item"], styles["task-count"]]} onClick={() => handleGoTaskList("")}>
            <div class={styles["item-label"]}>任务数</div>
            <div class={styles["item-value"]}>{props.taskInfo.taskStat.totalNum}</div>
          </div>
          <div class={[styles["task-stat-item"], styles["task-doing"]]} onClick={() => handleGoTaskList("TODO")}>
            <div class={styles["item-label"]}>进行中</div>
            <div class={styles["item-value"]}>{props.taskInfo.taskStat.totalNum - props.taskInfo.taskStat.doneTotalNum}</div>
          </div>
          <div class={[styles["task-stat-item"], styles["task-done"]]} onClick={() => handleGoTaskList("DONE")}>
            <div class={styles["item-label"]}>已完成</div>
            <div class={styles["item-value"]}>{props.taskInfo.taskStat.doneTotalNum}</div>
          </div>
        </div>
        <div class={styles["task-list"]} onScroll={handleScroll}>
          {props.taskInfo.taskList.length !== 0 &&
            props.taskInfo.taskList.map((item) => (
              <div class={styles["task-item"]} key={item.id} onClick={() => toDetail(item.businessKey, item.businessType)}>
                <div class={styles["task-item-header"]}>
                  <div class={styles["task-item-title"]}>{item.taskName}</div>
                  <div class={[styles["task-item-status"], styles[item.status]]}>{item.status === "TODO" ? "待处理" : "已完成"}</div>
                </div>
                <div class={styles["task-item-content"]}>
                  <div class={styles["task-item-content-item"]}>
                    <div class={styles["content-item-label"]}>任务类型:</div>
                    <div class={styles["content-item-value"]}>{item.businessTypeName}</div>
                  </div>
                  <div class={styles["task-item-content-item"]}>
                    <div class={styles["content-item-label"]}>任务时间:</div>
                    <div class={styles["content-item-value"]}>{dayjs(item.taskTime).format("YYYY-MM-DD HH:mm:ss")}</div>
                  </div>
                </div>
              </div>
            ))}
          {!props.loading && !props.taskInfo.taskList.length && <Empty description="暂无数据" />}
          {props.loading && (
            <div class={styles["load-status"]}>
              <Loading size="18px">加载中...</Loading>
            </div>
          )}
          {!props.loading && props.finished && props.taskInfo.taskList.length > 0 && <div class={styles["load-status"]}>没有更多了</div>}
        </div>
      </div>
    );
  },
});
