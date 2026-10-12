<script setup lang="ts">
import moment from "moment";
import { computed, shallowRef } from "vue";

import type { EventTaskFeedbackRecord } from "../event/event-detail-types";
import type { ReviewTask } from "./review-types";
import { eventTaskFeedbacks } from "@/api/emergency";

const props = defineProps<{ tasks: ReviewTask[] }>();
const expandedTaskId = shallowRef<number>();
const feedbackLoadingTaskId = shallowRef<number>();
const taskFeedbacks = shallowRef<Record<number, EventTaskFeedbackRecord[]>>({});
const feedbackTasks = computed(() =>
  [...props.tasks].sort((left, right) => {
    const leftTime = left.firstOperatedAt ? moment(left.firstOperatedAt).valueOf() : Number.MAX_SAFE_INTEGER;
    const rightTime = right.firstOperatedAt ? moment(right.firstOperatedAt).valueOf() : Number.MAX_SAFE_INTEGER;
    return leftTime - rightTime;
  }),
);
const toggleTaskFeedbacks = async (task: ReviewTask): Promise<void> => {
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
  <section class="workflow-card">
    <h3 class="workflow-section-title">任务反馈</h3>
    <div v-if="feedbackTasks.length" class="timeline">
      <div v-for="task in feedbackTasks" :key="task.id" class="timeline-row">
        <span class="timeline-dot" :class="{ active: task.firstOperatedAt }" />
        <div class="timeline-main">
          <button type="button" class="timeline-task" :aria-expanded="expandedTaskId === task.id" @click="void toggleTaskFeedbacks(task)">
            <time>{{ task.firstOperatedAt ? moment(task.firstOperatedAt).format("HH:mm") : "--" }}</time
            ><span class="timeline-task-name">{{ task.name || "未命名任务" }}</span
            ><span class="task-feedback-arrow" :class="{ expanded: expandedTaskId === task.id }">›</span>
          </button>
          <div v-if="expandedTaskId === task.id" class="timeline-feedback-list">
            <a-spin :spinning="feedbackLoadingTaskId === task.id"
              ><template v-if="taskFeedbacks[task.id]?.length"
                ><div v-for="feedback in taskFeedbacks[task.id]" :key="feedback.id" class="timeline-feedback-item">
                  <time>{{ feedback.createTime ? moment(feedback.createTime).format("YYYY-MM-DD HH:mm") : "--" }}</time>
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
          </div>
        </div>
      </div>
    </div>
    <div v-else class="workflow-empty">暂无事件任务</div>
  </section>
</template>

<style scoped>
.timeline {
  position: relative;
  padding: 4px 0;
}
.timeline::before {
  position: absolute;
  top: 8px;
  bottom: 8px;
  left: 4px;
  width: 2px;
  background: #e5e7eb;
  content: "";
}
.timeline-row {
  position: relative;
  display: grid;
  grid-template-columns: 10px minmax(0, 1fr);
  gap: 8px;
  align-items: start;
  min-height: 36px;
}
.timeline-dot {
  z-index: 1;
  width: 9px;
  height: 9px;
  margin-top: 4px;
  border-radius: 50%;
  background: #cbd5e1;
}
.timeline-dot.active {
  background: #1677ff;
}
.timeline-main {
  min-width: 0;
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
.timeline-task > time {
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
  margin: 7px 0 10px;
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
.timeline-feedback-item > time {
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
</style>
