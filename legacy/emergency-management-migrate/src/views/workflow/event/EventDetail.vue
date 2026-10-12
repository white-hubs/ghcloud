<script setup lang="ts">
import { message } from "ant-design-vue";
import moment from "moment";
import { computed, onMounted, reactive, shallowRef } from "vue";
import { useRoute } from "vue-router";

import type { EventDetailRecord, EventPlanSnapshot, EventTaskFeedbackRecord, EventTaskRecord } from "./event-detail-types";
import EventExecutionPanel from "./EventExecutionPanel.vue";
import EventOverview from "./EventOverview.vue";
import { emergencyEventDetail, emergencyEventTasks, eventTaskFeedbacks, terminateEmergencyEvent } from "@/api/emergency";
import { sanitizeRichText } from "@/views/planDocuments/richText";

import "../workflow.css";

const route = useRoute();
const loading = shallowRef(false);
const terminating = shallowRef(false);
const terminateVisible = shallowRef(false);
const selectedTask = shallowRef<EventTaskRecord>();
const selectedPlan = shallowRef<EventPlanSnapshot>();
const taskVisible = shallowRef(false);
const planVisible = shallowRef(false);
const taskLoading = shallowRef(false);
const taskFeedbacks = shallowRef<EventTaskFeedbackRecord[]>([]);
const event = shallowRef<EventDetailRecord>();
const tasks = shallowRef<EventTaskRecord[]>([]);
const terminateForm = reactive({ type: "RESOLVED", reason: "" });
const eventId = computed(() => (typeof route.query.id === "string" && /^[1-9]\d*$/.test(route.query.id) ? route.query.id : undefined));
const plans = computed<EventPlanSnapshot[]>(() => {
  const result = new Map<string, EventPlanSnapshot>();
  tasks.value.forEach((task) => {
    const { planId, planName, planContentHtml } = task;
    if (!planId || !planName || result.has(planId)) return;
    result.set(planId, { id: planId, name: planName, ...(planContentHtml ? { contentHtml: planContentHtml } : {}) });
  });
  return [...result.values()];
});
const safePlanContent = computed(() => sanitizeRichText(selectedPlan.value?.contentHtml || ""));
const durationText = computed(() => {
  if (!event.value?.occurredAt) return "—";
  const toMoment = (value?: string) => (/^\d+$/.test(value || "") ? moment(Number(value)) : moment(value));
  const minutes = Math.max(0, toMoment(event.value.terminatedAt).diff(toMoment(event.value.occurredAt), "minutes"));
  return `${Math.floor(minutes / 60)}小时${minutes % 60}分钟`;
});
const taskStatusMap: Record<string, { text: string; color: string }> = {
  WAITING: { text: "待接收", color: "default" },
  EXECUTING: { text: "执行中", color: "orange" },
  COMPLETED: { text: "已完成", color: "green" },
  STOPPED: { text: "已停止", color: "default" },
};
const formatTime = (value?: string): string => {
  if (!value) return "—";
  const time = /^\d+$/.test(value) ? moment(Number(value)) : moment(value);
  return time.isValid() ? time.format("YYYY-MM-DD HH:mm") : value;
};
const parseItems = (value?: string): string[] => {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) return parsed.map((item) => String(item)).filter(Boolean);
  } catch {
    // 兼容历史换行或逗号文本。
  }
  return value
    .split(/[\n,，]/)
    .map((item) => item.trim())
    .filter(Boolean);
};
const taskLagText = computed(() => {
  const task = selectedTask.value;
  if (!task?.deadline || !task.completedAt) return "—";
  const minutes = Math.round(moment(task.completedAt).diff(task.deadline, "minutes", true));
  return `${minutes > 0 ? "+" : ""}${minutes}分钟`;
});
const taskSteps = computed(() => parseItems(selectedTask.value?.executionContent));
const taskEquipment = computed(() => parseItems(selectedTask.value?.equipment));

const load = async (): Promise<void> => {
  const id = eventId.value;
  if (!id) {
    message.error("事件参数无效");
    return;
  }
  loading.value = true;
  try {
    const [eventResult, taskResult] = await Promise.all([emergencyEventDetail(id), emergencyEventTasks(id)]);
    event.value = eventResult;
    tasks.value = taskResult || [];
  } finally {
    loading.value = false;
  }
};
const openTerminate = (): void => {
  terminateForm.type = "RESOLVED";
  terminateForm.reason = "";
  terminateVisible.value = true;
};
const openPlan = (plan: EventPlanSnapshot): void => {
  selectedPlan.value = plan;
  planVisible.value = true;
};
const openTask = async (task: EventTaskRecord): Promise<void> => {
  selectedTask.value = task;
  taskVisible.value = true;
  taskFeedbacks.value = [];
  taskLoading.value = true;
  try {
    taskFeedbacks.value = await eventTaskFeedbacks(task.id);
  } finally {
    taskLoading.value = false;
  }
};
const terminate = async (): Promise<void> => {
  const id = eventId.value;
  if (!id) return;
  if (terminateForm.reason.trim().length < 20) {
    message.warning("终止说明至少20个字符");
    return;
  }
  terminating.value = true;
  try {
    await terminateEmergencyEvent(id, { terminateType: terminateForm.type, terminateReason: terminateForm.reason.trim() });
    message.success("事件已终止");
    terminateVisible.value = false;
    await load();
  } finally {
    terminating.value = false;
  }
};

onMounted(load);
</script>

<template>
  <div class="workflow-page event-detail-page">
    <main class="workflow-content event-detail-content">
      <a-spin class="event-detail-spin" :spinning="loading">
        <div v-if="event" class="event-detail-body">
          <EventOverview :event="event" :plans="plans" :duration-text="durationText" @view-plan="openPlan">
            <a-button v-if="event.status === 'RUNNING'" danger @click="openTerminate">终止事件</a-button>
          </EventOverview>
          <EventExecutionPanel :tasks="tasks" @view-task="(task) => void openTask(task)" />
        </div>
      </a-spin>
    </main>

    <a-modal
      v-model:visible="terminateVisible"
      title="终止事件"
      :confirm-loading="terminating"
      ok-text="确认终止"
      ok-type="danger"
      @ok="terminate"
    >
      <label class="terminate-field"
        ><span>终止类型</span
        ><a-select
          v-model:value="terminateForm.type"
          :options="[
            { label: '事件已解决', value: 'RESOLVED' },
            { label: '转为日常管理', value: 'DAILY_MANAGEMENT' },
            { label: '误报/解除', value: 'FALSE_ALARM' },
          ]"
      /></label>
      <label class="terminate-field"
        ><span>终止说明（至少20字）</span
        ><a-textarea v-model:value="terminateForm.reason" :rows="4" :maxlength="500" show-count placeholder="描述事件终止原因和当前状态"
      /></label>
    </a-modal>
    <a-modal v-model:visible="planVisible" :footer="null" :width="900" :title="selectedPlan?.name || '预案内容'">
      <article v-if="safePlanContent" class="plan-preview" v-html="safePlanContent"></article>
      <a-empty v-else description="暂无可预览的预案正文" />
    </a-modal>
    <a-modal v-model:visible="taskVisible" :footer="null" :width="760" :title="`任务详情 · ${selectedTask?.name || ''}`">
      <a-spin :spinning="taskLoading">
        <template v-if="selectedTask">
          <div class="task-detail-grid">
            <div>
              <span>执行人</span><strong>{{ selectedTask.executorName || selectedTask.executorId || "未分配" }}</strong>
            </div>
            <div>
              <span>状态</span
              ><a-tag :color="taskStatusMap[selectedTask.status || '']?.color">{{
                taskStatusMap[selectedTask.status || ""]?.text || "—"
              }}</a-tag>
            </div>
            <div>
              <span>首次反馈时间</span><strong>{{ formatTime(selectedTask.firstOperatedAt) }}</strong>
            </div>
            <div>
              <span>计划完成</span><strong>{{ formatTime(selectedTask.deadline) }}</strong>
            </div>
            <div>
              <span>实际完成</span><strong>{{ formatTime(selectedTask.completedAt) }}</strong>
            </div>
            <div>
              <span>滞后时长</span><strong :class="{ 'delay-text': taskLagText.startsWith('+') }">{{ taskLagText }}</strong>
            </div>
          </div>
          <section class="task-detail-section">
            <h3>📍 执行地点</h3>
            <p>{{ selectedTask.locationDesc || "未设置" }}</p>
          </section>
          <section class="task-detail-section">
            <h3>📋 操作步骤</h3>
            <ol v-if="taskSteps.length">
              <li v-for="item in taskSteps" :key="item">{{ item }}</li>
            </ol>
            <p v-else>未设置</p>
          </section>
          <section class="task-detail-section">
            <h3>📦 装备清单</h3>
            <div v-if="taskEquipment.length || selectedTask.devices?.length" class="equipment-list">
              <a-tag v-for="item in taskEquipment" :key="item">{{ item }}</a-tag
              ><a-tag v-for="(device, index) in selectedTask.devices || []" :key="device.deviceCode || device.deviceName || index">{{
                device.deviceName || device.deviceCode
              }}</a-tag>
            </div>
            <p v-else>未配置装备</p>
          </section>
          <section class="task-detail-section feedback-section">
            <h3>📎 执行反馈</h3>
            <div v-if="taskFeedbacks.length" class="feedback-list">
              <article v-for="feedback in taskFeedbacks" :key="feedback.id" class="feedback-item">
                <time>{{ feedback.createTime ? formatTime(feedback.createTime) : "—" }}</time>
                <p v-if="feedback.content">{{ feedback.content }}</p>
                <a-image
                  v-if="feedback.feedbackType === 'IMAGE' && feedback.filePath"
                  :src="feedback.filePath"
                  :alt="feedback.fileName || '反馈图片'"
                  :width="96"
                  :height="72"
                  class="feedback-image"
                />
              </article>
            </div>
            <p v-else class="empty-feedback">暂无执行反馈</p>
          </section>
        </template>
      </a-spin>
    </a-modal>
  </div>
</template>

<style scoped>
.event-detail-page {
  display: flex;
  height: 100%;
  min-height: 0;
  overflow: hidden;
  background: #f4f7fb;
}
.event-detail-content {
  width: 100%;
  height: 100%;
  min-height: 0;
  margin: 0;
  padding: 10px 16px 12px;
  box-sizing: border-box;
  overflow-y: auto;
}
.event-detail-spin,
.event-detail-spin :deep(.ant-spin-nested-loading),
.event-detail-spin :deep(.ant-spin-container),
.event-detail-body {
  height: 100%;
  min-height: 0;
}
.event-detail-body {
  display: flex;
  flex-direction: column;
}
.terminate-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
  color: #475569;
}
.terminate-field :deep(.ant-select) {
  width: 100%;
}
.plan-preview {
  max-height: 65vh;
  padding: 8px 16px;
  overflow: auto;
  color: #334155;
  line-height: 1.8;
  word-break: break-word;
}
.plan-preview :deep(table) {
  width: 100%;
  border-collapse: collapse;
}
.plan-preview :deep(th),
.plan-preview :deep(td) {
  padding: 8px;
  border: 1px solid #d9d9d9;
}
.task-detail-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px 36px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e8edf3;
}
.task-detail-grid > div {
  display: flex;
  flex-direction: column;
  gap: 5px;
}
.task-detail-grid span {
  color: #8ba0ba;
  font-size: 13px;
}
.task-detail-grid strong {
  color: #1f2937;
  font-weight: 500;
}
.task-detail-grid :deep(.ant-tag) {
  align-self: flex-start;
  margin: 0;
}
.delay-text {
  color: #ff4d4f !important;
}
.task-detail-section {
  padding: 14px 0;
  border-bottom: 1px solid #e8edf3;
}
.task-detail-section h3 {
  margin: 0 0 8px;
  color: #64748b;
  font-size: 14px;
  font-weight: 600;
}
.task-detail-section p {
  margin: 0;
  color: #334155;
  line-height: 24px;
}
.task-detail-section ol {
  margin: 0;
  padding-left: 20px;
  color: #334155;
  line-height: 24px;
}
.equipment-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.equipment-list :deep(.ant-tag) {
  margin: 0;
  color: #2563eb;
  background: #f0f7ff;
  border-color: #b7dbff;
}
.feedback-section {
  border-bottom: 0;
}
.feedback-list {
  display: grid;
  gap: 10px;
}
.feedback-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 10px;
  background: #f8fbff;
  border-radius: 6px;
}
.feedback-item time {
  min-width: 78px;
  color: #8ba0ba;
  font-size: 12px;
  line-height: 24px;
}
.feedback-item p {
  flex: 1;
}
.feedback-image {
  object-fit: cover;
  border-radius: 4px;
}
.empty-feedback {
  color: #94a3b8 !important;
}
@media (max-width: 760px) {
  .event-detail-content {
    padding: 8px;
  }
}
</style>
