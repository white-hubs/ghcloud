import dayjs from "dayjs";
import { showNotify } from "vant";
import { defineComponent, onMounted, shallowRef } from "vue";
import { useRouter } from "vue-router";

import { CubeAppService } from "@ghcloud/cube-app-js-sdk";
import { getEnvironment } from "@ghcloud/cube-app-js-sdk/src/js/cube-h5-config";
import type { EmergencyEventTaskPageVO } from "@ghcloud/cube-emergency-service/src/type";

import { cubeEmergencyService } from "@/api/server";

import styles from "./emergency-event-task-list.module.less";

const statusLabels: Record<NonNullable<EmergencyEventTaskPageVO["status"]>, string> = {
  WAITING: "待执行",
  EXECUTING: "执行中",
  COMPLETED: "已完成",
  STOPPED: "已停止",
};

export const EmergencyEventTaskList = defineComponent({
  setup: () => {
    const router = useRouter();
    const refreshing = shallowRef(false);
    const loading = shallowRef(false);
    const tasks = shallowRef<EmergencyEventTaskPageVO[]>([]);

    const loadTasks = async (): Promise<void> => {
      try {
        loading.value = true;
        const response = await cubeEmergencyService.getMyEmergencyEventTasksPage({
          pageNumber: 1,
          pageSize: 20,
        });
        tasks.value = response.records;
      } catch {
        tasks.value = [];
        showNotify({ type: "danger", message: "获取事件任务列表失败" });
      } finally {
        loading.value = false;
      }
    };

    const onRefresh = async (): Promise<void> => {
      refreshing.value = true;
      await loadTasks();
      refreshing.value = false;
    };

    const openTask = (task: EmergencyEventTaskPageVO): void => {
      router.push({ path: "/emergency-event-task-detail", query: { taskId: task.id } });
    };
    const handleBack = (): void => {
      if (getEnvironment() === "cubeApp") {
        void CubeAppService.getInstance().backPage();
        return;
      }
      router.back();
    };

    const isOverdue = (task: EmergencyEventTaskPageVO): boolean =>
      task.status !== "COMPLETED" && !!task.deadline && dayjs().isAfter(dayjs(task.deadline));
    const deadlineText = (task: EmergencyEventTaskPageVO): string =>
      task.deadline ? dayjs(task.deadline).format("MM-DD HH:mm") : "未设置";

    onMounted(() => {
      void loadTasks();
    });

    document.title = "预案事件处理";
    return () => (
      <div class={styles.page}>
        <header class={styles.header}>
          <button aria-label="返回" class={styles.back} onClick={handleBack}>
            ‹
          </button>
          <h1>预案事件处理</h1>
          <span />
        </header>
        <main class={styles.content}>
          {tasks.value.map((task) => (
            <button
              key={task.id}
              class={[styles.taskCard, task.status && styles[task.status.toLowerCase()], isOverdue(task) && styles.blink]}
              onClick={() => openTask(task)}
            >
              <span class={[styles.priority, task.status && styles[`priority-${task.status.toLowerCase()}`]]}>
                {task.status ? statusLabels[task.status] : "未知状态"}
              </span>
              <strong class={styles.taskTitle}>{task.name || "未命名任务"}</strong>
              <span class={styles.planName}>预案：{task.planName || "未关联预案"}</span>
              <span class={styles.eventName}>事件：{task.eventName || "未命名事件"}</span>
              <span class={styles.location}>{task.locationDesc ? `执行地点 · ${task.locationDesc}` : "事件预案任务"}</span>
              <span class={[styles.deadline, isOverdue(task) && styles.overdue]}>
                ⏱ 截止 {deadlineText(task)}
                {isOverdue(task) ? " · 已超时！" : ""}
              </span>
              {task.status === "WAITING" && <span class={styles.execute}>执行</span>}
            </button>
          ))}
          {!loading.value && tasks.value.length === 0 && <p class={styles.empty}>暂无事件任务</p>}
          <button class={styles.refresh} disabled={refreshing.value || loading.value} onClick={onRefresh}>
            {refreshing.value ? "刷新中…" : "↓ 下拉刷新"}
          </button>
        </main>
      </div>
    );
  },
});
