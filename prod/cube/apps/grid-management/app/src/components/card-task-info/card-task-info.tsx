import { DataCard } from "../data-card/data-card";
import { SeamlessScroll } from "../seamless-scroll/seamless-scroll";
import { showTaskInfoModal } from "../task-info-modal/task-info-modal";
import styles from "./card-task-info.module.less";
import { cubeGridManagementService } from "@/api/server";
import { Button, Empty } from "@ghcloud/cube-ui";
import dayjs from "dayjs";
import { defineComponent, ref, watch } from "vue";

enum TaskStatus {
  PENDING = "待开始",
  RUNNING = "进行中",
  COMPLETED = "已完成",
}
const TaskStatusMap = {
  [TaskStatus.PENDING]: "pending",
  [TaskStatus.RUNNING]: "running",
  [TaskStatus.COMPLETED]: "success",
};

type TodayTimeParams = {
  period: string;
};

export const CardTaskInfo = defineComponent({
  name: "CardTaskInfo",
  props: {
    areaId: {
      type: String,
      required: true,
    },
  },
  setup(props) {
    const loading = ref(true);
    const getTodayTimeParams = (): TodayTimeParams => {
      const period = `${dayjs().startOf("day").format("YYYY-MM-DD HH:mm:ss")},${dayjs().endOf("day").format("YYYY-MM-DD HH:mm:ss")}`;
      return {
        period,
      };
    };
    const getTaskStat = async (areaId: string) => {
      if (!areaId) {
        return;
      }
      const timeParams = getTodayTimeParams();
      const result = await cubeGridManagementService.getMyGridTaskStat({
        gridAreaId: areaId,
        dailyType: "GRID_MANAGE",
        ...timeParams,
      } as {
        gridAreaId: string;
        dailyType: string;
      } & TodayTimeParams);
      taskCount.value.total.value = result.totalNum;
      taskCount.value.running.value = result.totalNum - result.doneTotalNum;
      taskCount.value.completed.value = result.doneTotalNum;
    };
    const getMyTaskList = async (areaId: string) => {
      const timeParams = getTodayTimeParams();
      const result = await cubeGridManagementService.getMyGridTaskList({
        pageNumber: 1,
        pageSize: 10,
        gridAreaId: areaId,
        dailyType: "GRID_MANAGE",
        ...timeParams,
      } as {
        pageNumber: number;
        pageSize: number;
        gridAreaId: string;
        dailyType: string;
      } & TodayTimeParams);
      taskList.value = result.records.map((item) => ({
        name: item.taskName,
        type: item.businessTypeName,
        time: dayjs(item.taskTime).format("YYYY-MM-DD HH:mm:ss"),
        status: item.status === "TODO" ? TaskStatus.RUNNING : TaskStatus.COMPLETED,
      }));
    };
    const queryData = async () => {
      try {
        loading.value = true;
        await Promise.all([getMyTaskList(props.areaId), getTaskStat(props.areaId)]);
      } finally {
        loading.value = false;
      }
    };
    watch(
      () => props.areaId,
      () => {
        props.areaId && queryData();
      },
      {
        immediate: true,
      },
    );

    const taskCount = ref({
      total: {
        label: "任务数",
        value: 0,
      },
      running: {
        label: "进行中",
        value: 0,
      },
      completed: {
        label: "已完成",
        value: 0,
      },
    });
    const taskList = ref([
      {
        name: "报警任务",
        type: "张三",
        status: TaskStatus.RUNNING,
        time: "2天23小时",
      },
      {
        name: "报警任务",
        principal: "张三",
        status: TaskStatus.COMPLETED,
        time: "2天23小时",
      },
    ]);
    return (): JSX.Element => (
      <DataCard
        title="任务信息"
        loading={loading.value}
        v-slots={{
          titleExtra: () => (
            <Button type="link" size="small" style={{ padding: 0 }} onClick={() => showTaskInfoModal(props.areaId)}>
              查看更多
            </Button>
          ),
        }}
      >
        <div class={styles.top}>
          {Object.values(taskCount.value).map((item) => (
            <div class={styles.item} key={item.label}>
              <div class={styles.label}>{item.label}</div>
              <div class={styles.value}>{item.value}</div>
            </div>
          ))}
        </div>
        <div class={styles["scroll-area"]}>
          {taskList.value.length !== 0 && (
            <SeamlessScroll list={taskList.value} step={taskList.value.length < 3 ? 0 : 0.2} singleHeight={72}>
              {{
                default: ({ data }: { data: (typeof taskList.value)[number]; index: number }) => (
                  <div class={styles["task-item"]}>
                    <div class={styles["task-name"]}>{data.name}</div>
                    <div class={styles["task-time"]}>
                      <div class={styles.item}>任务类型：{data.type}</div>
                      <div class={styles.item} style={{ textAlign: "right" }}>
                        {data.time}
                      </div>
                    </div>
                    <div class={`${styles["task-status"]} ${styles[TaskStatusMap[data.status]]}`}>{data.status}</div>
                  </div>
                ),
              }}
            </SeamlessScroll>
          )}
          {taskList.value.length === 0 && <Empty description="暂无数据" />}
        </div>
      </DataCard>
    );
  },
});
