import { computed } from 'vue'

interface TaskStatusMap {
  [taskCode: string]: {
    taskName: string; // 业务名称
    statusList: { label: string; value: string }[]; // 对应状态（label-显示名，value-标识值）
  };
}
// 用于SearchBar中依据业务类型（多选）动态展示出状态选项，请实现hook
const taskStatusMap: TaskStatusMap = {
  ALARM_TASK: {
    taskName: "报警任务",
    statusList: [
      { label: "待接收", value: "待接收" },
      { label: "处理中", value: "处理中" },
      { label: "已挂起", value: "已挂起" },
      { label: "已处理", value: "已处理" },
    ],
  },
  APPROVE_TASK: {
    taskName: "审批任务",
    statusList: [
      { label: "待处理", value: "待处理" },
      { label: "已完成", value: "已完成" },
    ],
  },
  MAINTENACE_TASK: {
    taskName: "维保作业",
    statusList: [
      { label: "待维保", value: "待维保" },
      { label: "已完成", value: "已完成" },
    ],
  },
  CULTIVATE_TASK: {
    taskName: "培训任务",
    statusList: [
      { label: "待培训", value: "待培训" },
      { label: "已结束", value: "已结束" },
      { label: "待考试", value: "待考试" },
      { label: "已考试", value: "已考试" },
      { label: "已结束", value: "已结束" },
    ],
  },
  EXAM_TASK: {
    taskName: "考试任务",
    statusList: [
      { label: "待考试", value: "待考试" },
      { label: "已考试", value: "已考试" },
      { label: "已结束", value: "已结束" },
    ],
  },
  ELECTRONIC_PATROL: {
    taskName: "电子巡更",
    statusList: [
      { label: "待接收", value: "待接收" },
      { label: "执行中", value: "执行中" },
      { label: "已结束", value: "已结束" },
    ],
  },
  PROPERTY_MANAGEMENT: {
    taskName: "资产管理",
    statusList: [
      { label: "未完成", value: "未完成" },
      { label: "已完成", value: "已完成" },
    ],
  },
  INSPECT_TASK: {
    taskName: "巡检任务",
    statusList: [
      { label: "待拆解", value: "待拆解" },
      { label: "待接收", value: "待接收" },
      { label: "进行中", value: "进行中" },
      { label: "已完成", value: "已完成" },
      { label: "已过期", value: "已过期" },
      { label: "已终止", value: "已终止" },
    ],
  },
  DAILY_TASK: {
    taskName: "日常任务",
    statusList: [
      { label: "待处理", value: "待处理" },
      { label: "处理中", value: "处理中" },
      { label: "已完成", value: "已完成" },
      { label: "已终止", value: "已终止" },
    ],
  },
};

// use-status.ts
export const useStatus = (getTodoTagCodes: () => string[]) => {
  const statusOptions = computed(() => {
    const todoTagCodes = getTodoTagCodes();
    let allStatusLists: { label: string; value: string }[];

    if (todoTagCodes.length === 0) {
      allStatusLists = Object.values(taskStatusMap).flatMap(
        (task) => task.statusList || []
      );
    } else {
      allStatusLists = todoTagCodes.flatMap(
        (code) => taskStatusMap[code]?.statusList || []
      );
    }

    const uniqueStatuses = new Map<string, { label: string; value: string }>();
    allStatusLists.forEach((status) => {
      if (!uniqueStatuses.has(status.value)) {
        uniqueStatuses.set(status.value, status);
      }
    });

    return Array.from(uniqueStatuses.values());
  });

  return {
    statusOptions,
  };
};