<script setup lang="ts">
import moment from "moment";
import { computed, shallowRef } from "vue";

import type { EventTaskFeedbackRecord, EventTaskRecord } from "./event-detail-types";
import { eventTaskFeedbacks } from "@/api/emergency";

const props = defineProps<{ tasks: EventTaskRecord[] }>();
const emit = defineEmits<{ viewTask: [task: EventTaskRecord] }>();
const statusFilter = shallowRef<string | undefined>();
const expandedTaskId = shallowRef<string>();
const feedbackLoadingTaskId = shallowRef<string>();
const taskFeedbacks = shallowRef<Record<string, EventTaskFeedbackRecord[]>>({});
const columns = [
  { title: "任务名称", dataIndex: "name", key: "name", width: 210 },
  { title: "执行人", dataIndex: "executorName", key: "executorName", width: 140 },
  { title: "计划完成", dataIndex: "deadline", key: "deadline", width: 140 },
  { title: "实际完成", dataIndex: "completedAt", key: "completedAt", width: 140 },
  { title: "滞后", key: "lag", width: 110 },
  { title: "状态", dataIndex: "status", key: "status", width: 100 },
  { title: "操作", key: "action", width: 80, align: "center" },
];
const statusMap: Record<string, { text: string; color: string }> = {
  WAITING: { text: "待接收", color: "default" },
  EXECUTING: { text: "执行中", color: "orange" },
  COMPLETED: { text: "已完成", color: "green" },
  STOPPED: { text: "已停止", color: "default" },
};
const isOverdue = (task: EventTaskRecord): boolean => {
  if (!task.deadline || task.status === "STOPPED") return false;
  return task.completedAt ? moment(task.completedAt).isAfter(task.deadline) : moment().isAfter(task.deadline);
};
const progress = computed(() => {
  const total = props.tasks.length;
  const completed = props.tasks.filter((item) => item.status === "COMPLETED").length;
  const executing = props.tasks.filter((item) => item.status === "EXECUTING").length;
  const waiting = props.tasks.filter((item) => item.status === "WAITING").length;
  const stopped = props.tasks.filter((item) => item.status === "STOPPED").length;
  const overdue = props.tasks.filter((item) => isOverdue(item)).length;
  return { total, completed, executing, waiting, stopped, overdue, percent: total ? Math.round((completed / total) * 100) : 0 };
});
const filteredTasks = computed(() => (statusFilter.value ? props.tasks.filter((item) => item.status === statusFilter.value) : props.tasks));
const feedbackTasks = computed(() =>
  [...props.tasks].sort((left, right) => {
    const leftTime = left.firstOperatedAt ? moment(left.firstOperatedAt).valueOf() : Number.MAX_SAFE_INTEGER;
    const rightTime = right.firstOperatedAt ? moment(right.firstOperatedAt).valueOf() : Number.MAX_SAFE_INTEGER;
    return leftTime - rightTime || Number(left.sortNo || 0) - Number(right.sortNo || 0);
  }),
);
const lagText = (task: EventTaskRecord): string => {
  if (!task.deadline) return "—";
  if (!task.completedAt) return isOverdue(task) ? "已超时" : "—";
  const minutes = Math.round(moment(task.completedAt).diff(task.deadline, "minutes", true));
  return `${minutes > 0 ? "+" : ""}${minutes}分钟`;
};
const lagClass = (task: EventTaskRecord): string => (isOverdue(task) ? "lag-overdue" : task.completedAt ? "lag-early" : "");
const toggleTaskFeedbacks = async (task: EventTaskRecord): Promise<void> => {
  if (expandedTaskId.value === task.id) {
    expandedTaskId.value = undefined;
    return;
  }
  expandedTaskId.value = task.id;
  if (taskFeedbacks.value[task.id]) return;
  feedbackLoadingTaskId.value = task.id;
  try {
    taskFeedbacks.value = { ...taskFeedbacks.value, [task.id]: (await eventTaskFeedbacks(task.id)) || [] };
  } finally {
    feedbackLoadingTaskId.value = undefined;
  }
};
</script>

<template>
  <section class="execution-layout">
    <aside class="workflow-card progress-card">
      <h2 class="card-title">任务进度总览</h2>
      <div class="progress-number">{{ progress.percent }}%</div>
      <div class="progress-caption">已完成 {{ progress.completed }}/{{ progress.total }}</div>
      <a-progress :percent="progress.percent" :show-info="false" stroke-color="#faad14" />
      <ul class="progress-legend">
        <li>
          <i class="dot completed" />已完成 <strong>{{ progress.completed }}</strong>
        </li>
        <li>
          <i class="dot overdue" />超时 <strong>{{ progress.overdue }}</strong>
        </li>
        <li>
          <i class="dot executing" />执行中 <strong>{{ progress.executing }}</strong>
        </li>
        <li>
          <i class="dot waiting" />待接收 <strong>{{ progress.waiting }}</strong>
        </li>
        <li v-if="progress.stopped">
          <i class="dot stopped" />已停止 <strong>{{ progress.stopped }}</strong>
        </li>
      </ul>
    </aside>
    <section class="workflow-card task-card">
      <h2 class="card-title">任务列表</h2>
      <div class="task-filter">
        <span>状态</span
        ><a-select
          v-model:value="statusFilter"
          allow-clear
          placeholder="全部"
          :options="Object.entries(statusMap).map(([value, item]) => ({ value, label: item.text }))"
        />
      </div>
      <a-table :columns="columns" :data-source="filteredTasks" :pagination="false" row-key="id" size="small" :scroll="{ x: 900 }">
        <template #bodyCell="{ column, record, text }">
          <template v-if="column.key === 'executorName'">{{ text || record.executorId || "未分配" }}</template
          ><template v-else-if="column.key === 'deadline'">{{ text ? moment(text).format("HH:mm") : "—" }}</template>
          <template v-else-if="column.key === 'completedAt'">{{ text ? moment(text).format("HH:mm") : "—" }}</template
          ><template v-else-if="column.key === 'lag'"
            ><span :class="lagClass(record)">{{ lagText(record) }}</span></template
          >
          <template v-else-if="column.key === 'status'"
            ><a-tag :color="statusMap[text]?.color">{{ statusMap[text]?.text || "—" }}</a-tag></template
          ><template v-else-if="column.key === 'action'"><a @click="emit('viewTask', record)">查看</a></template>
        </template>
      </a-table>
      <footer class="task-summary">
        共 {{ progress.total }} 条任务（已完成{{ progress.completed }} · 超时{{ progress.overdue }} · 执行中{{ progress.executing }} ·
        待接收{{ progress.waiting }}）
      </footer>
    </section>
    <aside class="workflow-card timeline-card">
      <h2 class="card-title">任务反馈</h2>
      <div class="timeline-content">
        <a-timeline v-if="feedbackTasks.length"
          ><a-timeline-item v-for="task in feedbackTasks" :key="task.id" :color="task.firstOperatedAt ? 'blue' : 'gray'"
            ><button
              type="button"
              class="timeline-task"
              :aria-expanded="expandedTaskId === task.id"
              @click="void toggleTaskFeedbacks(task)"
            >
              <span class="timeline-time">{{ task.firstOperatedAt ? moment(task.firstOperatedAt).format("HH:mm") : "—" }}</span
              ><span class="timeline-task-name">{{ task.name || "未命名任务" }}</span
              ><span class="task-feedback-arrow" :class="{ expanded: expandedTaskId === task.id }">›</span>
            </button>
            <div v-if="expandedTaskId === task.id" class="timeline-feedback-list">
              <a-spin :spinning="feedbackLoadingTaskId === task.id"
                ><template v-if="taskFeedbacks[task.id]?.length"
                  ><div v-for="feedback in taskFeedbacks[task.id]" :key="feedback.id" class="timeline-feedback-item">
                    <time>{{ feedback.createTime ? moment(feedback.createTime).format("YYYY-MM-DD HH:mm") : "—" }}</time>
                    <div class="timeline-feedback-content">
                      <span v-if="feedback.content">{{ feedback.content }}</span
                      ><a-image
                        v-if="feedback.feedbackType === 'IMAGE' && feedback.filePath"
                        :src="feedback.filePath"
                        :alt="feedback.fileName || '反馈图片'"
                        :width="56"
                        :height="42"
                        class="timeline-feedback-image"
                      /><span v-else-if="!feedback.content">{{ feedback.fileName || "反馈记录" }}</span>
                    </div>
                  </div></template
                >
                <div v-else-if="feedbackLoadingTaskId !== task.id" class="timeline-feedback-empty">暂无反馈</div></a-spin
              >
            </div></a-timeline-item
          ></a-timeline
        >
        <div v-else class="timeline-empty">暂无事件任务</div>
      </div>
    </aside>
  </section>
</template>

<style scoped>
.execution-layout {
  display: grid;
  min-height: 0;
  flex: 1;
  grid-template-columns: 240px minmax(0, 1fr);
  grid-template-rows: auto minmax(0, 1fr);
  gap: 10px;
  align-items: stretch;
}
.execution-layout > .workflow-card {
  margin-top: 0;
}
.progress-card {
  grid-column: 1;
  padding: 12px;
  border-color: #e7eef8;
  box-shadow: 0 2px 10px rgba(32, 89, 157, 0.04);
}
.task-card {
  display: flex;
  min-height: 0;
  grid-column: 2;
  grid-row: span 2;
  flex-direction: column;
  overflow: hidden;
  border-color: #e7eef8;
  box-shadow: 0 2px 10px rgba(32, 89, 157, 0.04);
}
.timeline-card {
  grid-column: 1;
  padding: 12px;
  border-color: #e7eef8;
  box-shadow: 0 2px 10px rgba(32, 89, 157, 0.04);
}
.card-title {
  margin: 0 0 10px;
  padding-left: 9px;
  border-left: 3px solid #1677ff;
  color: #334155;
  font-size: 15px;
  font-weight: 600;
}
.progress-number {
  color: #1677ff;
  font-size: 28px;
  font-weight: 700;
  line-height: 34px;
  text-align: center;
}
.progress-caption {
  margin: 0 0 8px;
  color: #8ba0ba;
  font-size: 13px;
  text-align: center;
}
.progress-legend {
  display: grid;
  gap: 8px;
  margin: 12px 0 0;
  padding: 10px 0 0;
  list-style: none;
  border-top: 1px solid #edf2f8;
  font-size: 13px;
}
.progress-legend li {
  display: flex;
  align-items: center;
  gap: 6px;
}
.progress-legend strong {
  margin-left: auto;
  font-weight: 500;
}
.dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}
.completed {
  background: #52c41a;
}
.overdue {
  background: #ff4d4f;
}
.executing {
  background: #faad14;
}
.waiting,
.stopped {
  background: #d9d9d9;
}
.task-card {
  min-width: 0;
  box-sizing: border-box;
  padding: 12px 0 0;
}
.task-card > .card-title,
.task-filter {
  margin-left: 14px;
  margin-right: 14px;
}
.task-filter {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  color: #64748b;
  font-size: 13px;
}
.task-filter :deep(.ant-select) {
  width: 150px;
}
.task-card :deep(.ant-table-thead > tr > th) {
  color: #475569;
  font-weight: 600;
  background: #f8fbff;
}
.task-card :deep(.ant-table-tbody > tr:hover > td) {
  background: #f3f8ff;
}
.lag-overdue {
  color: #ff4d4f;
}
.lag-early {
  color: #52c41a;
}
.task-summary {
  margin-top: auto;
  padding: 8px 14px;
  color: #6b84a3;
  font-size: 12px;
  border-top: 1px solid #edf2f8;
}
.timeline-card {
  display: flex;
  min-height: 0;
  flex-direction: column;
  overflow: hidden;
}
.timeline-card .card-title {
  flex: none;
}
.timeline-content {
  min-height: 0;
  padding-top: 4px;
  flex: 1;
  overflow-y: auto;
}
.timeline-card :deep(.ant-timeline) {
  padding-top: 2px;
}
.timeline-card :deep(.ant-timeline-item-content) {
  color: #334155;
}
.timeline-task {
  display: flex;
  width: 100%;
  min-width: 0;
  padding: 0;
  align-items: center;
  color: #334155;
  font-size: 12px;
  text-align: left;
  background: none;
  border: 0;
  cursor: pointer;
}
.timeline-task:hover .timeline-task-name {
  color: #1677ff;
}
.timeline-time {
  flex: none;
  margin-right: 6px;
  color: #6b84a3;
  font-size: 11px;
}
.timeline-task-name {
  min-width: 0;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.task-feedback-arrow {
  flex: none;
  margin-left: 4px;
  color: #94a3b8;
  font-size: 16px;
  line-height: 1;
  transition: transform 0.2s;
}
.task-feedback-arrow.expanded {
  transform: rotate(90deg);
}
.timeline-feedback-list {
  margin: 7px 0 0;
  padding: 7px;
  background: #f8fbff;
  border-radius: 4px;
}
.timeline-feedback-item {
  display: grid;
  grid-template-columns: 100px minmax(0, 1fr);
  gap: 6px;
  padding: 3px 0;
  color: #475569;
  font-size: 11px;
  line-height: 18px;
}
.timeline-feedback-item time {
  color: #8ba0ba;
}
.timeline-feedback-content {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 4px;
}
.timeline-feedback-image {
  object-fit: cover;
  border-radius: 3px;
}
.timeline-feedback-empty {
  color: #94a3b8;
  font-size: 11px;
  text-align: center;
}
.timeline-empty {
  padding: 30px 0;
  color: #94a3b8;
  text-align: center;
}
@media (max-width: 1100px) {
  .execution-layout {
    min-height: auto;
    flex: none;
    grid-template-columns: 1fr;
    grid-template-rows: auto;
  }
  .progress-card,
  .task-card,
  .timeline-card {
    grid-column: auto;
    grid-row: auto;
  }
  .task-card {
    height: auto;
    min-height: 0;
    overflow: visible;
  }
  .timeline-card {
    min-height: 180px;
  }
  .timeline-content {
    overflow: visible;
  }
}
</style>
