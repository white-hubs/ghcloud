
import { computed, type Ref } from 'vue';

const taskStatusMap: Record<string, {
  taskName: string;
  statusList: {
    label: string;
    value: string;
  }[];
}> = {
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
const useTaskStatus = (selectedBusinessSources: Ref<string[] | undefined>) => {
  const taskStatusOptions = computed(() => {
    if (!selectedBusinessSources.value || selectedBusinessSources.value.length === 0) {
      const allStatuses = Object.values(taskStatusMap).flatMap(item => item.statusList);
      const uniqueStatuses = [...new Set(allStatuses.map(item => item.value))];
      return uniqueStatuses.map(status => ({
        label: status,
        value: status,
      }));
    }

    const selectedStatuses = selectedBusinessSources.value.flatMap(source => taskStatusMap[source]?.statusList || []);
    const uniqueStatuses = [...new Set(selectedStatuses.map(item => item.value))];
    
    return uniqueStatuses.map(status => ({
      label: status,
      value: status,
    }));
  });

  return taskStatusOptions;
};

export default useTaskStatus;
