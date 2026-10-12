<script setup lang="ts">
import moment from "moment";

import type { ReviewTask } from "./review-types";

defineProps<{ tasks: ReviewTask[]; userNames: Record<string, string> }>();

const statusLabels: Record<NonNullable<ReviewTask["status"]>, string> = {
  WAITING: "待执行",
  EXECUTING: "执行中",
  COMPLETED: "已完成",
  STOPPED: "已停止",
};
const statusText = (status?: ReviewTask["status"]): string => (status ? statusLabels[status] : "--");
const lagText = (minutes?: number): string => (minutes == null ? "--" : minutes > 0 ? `+${minutes}分钟` : `${minutes}分钟`);
</script>

<template>
  <section class="workflow-card task-section">
    <h3 class="workflow-section-title">任务执行明细</h3>
    <a-table :data-source="tasks" :pagination="false" row-key="id" size="small">
      <a-table-column title="任务名称" data-index="name" key="name" />
      <a-table-column title="计划完成" data-index="deadline" key="deadline">
        <template #default="{ text }">{{ text ? moment(text).format("MM-DD HH:mm") : "--" }}</template>
      </a-table-column>
      <a-table-column title="实际完成" data-index="completedAt" key="completedAt">
        <template #default="{ text }">{{ text ? moment(text).format("MM-DD HH:mm") : "--" }}</template>
      </a-table-column>
      <a-table-column title="滞后" data-index="lagMinutes" key="lagMinutes">
        <template #default="{ text }"
          ><span :class="{ overdue: Number(text) > 0, early: Number(text) <= 0 }">{{ lagText(text) }}</span></template
        >
      </a-table-column>
      <a-table-column title="执行人" data-index="executorId" key="executorId">
        <template #default="{ text }">{{ text ? userNames[String(text)] || `ID ${text}` : "--" }}</template>
      </a-table-column>
      <a-table-column title="状态" data-index="status" key="status">
        <template #default="{ text }"
          ><a-tag :color="text === 'COMPLETED' ? 'green' : text === 'STOPPED' ? 'default' : text === 'EXECUTING' ? 'orange' : 'blue'">{{
            statusText(text)
          }}</a-tag></template
        >
      </a-table-column>
    </a-table>
  </section>
</template>

<style scoped>
.task-section {
  padding: 0;
  overflow: hidden;
}
.task-section .workflow-section-title {
  padding: 16px 16px 0;
}
.overdue {
  color: #ff4d4f;
  font-weight: 600;
}
.early {
  color: #52c41a;
}
</style>
