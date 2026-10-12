<script setup lang="ts">
import moment from "moment";

import type { EventDetailRecord, EventPlanSnapshot } from "./event-detail-types";

defineProps<{ event: EventDetailRecord; plans: EventPlanSnapshot[]; durationText: string }>();
const emit = defineEmits<{ viewPlan: [plan: EventPlanSnapshot] }>();

const sourceMap: Record<string, { text: string; color: string }> = {
  ALARM: { text: "真实事件", color: "red" },
  FILE: { text: "预案演练", color: "blue" },
};
const levelMap: Record<string, { text: string; color: string }> = {
  IMPORTANT: { text: "重要", color: "red" },
  ORDINARY: { text: "普通", color: "orange" },
};
const statusMap: Record<string, { text: string; color: string }> = {
  WAITING_RESPONSE: { text: "待响应", color: "red" },
  RUNNING: { text: "进行中", color: "orange" },
  COMPLETED: { text: "已完成", color: "green" },
  TERMINATED: { text: "已终止", color: "default" },
};
const dateText = (value?: string): string => {
  if (!value) return "—";
  const time = /^\d+$/.test(value) ? moment(Number(value)) : moment(value);
  return time.isValid() ? time.format("YYYY-MM-DD HH:mm") : value;
};
</script>

<template>
  <section class="workflow-card overview-card">
    <div class="overview-heading">
      <h2 class="card-label">基本信息</h2>
      <slot />
    </div>
    <div class="overview-grid">
      <div class="overview-item">
        <span>事件名称</span><strong>{{ event.name || "—" }}</strong>
      </div>
      <div class="overview-item">
        <span>事件代号</span><strong>{{ event.eventCode || "—" }}</strong>
      </div>
      <div class="overview-item">
        <span>事件类型</span
        ><a-tag :color="sourceMap[event.sourceType || '']?.color">{{ sourceMap[event.sourceType || ""]?.text || "—" }}</a-tag>
      </div>
      <div class="overview-item">
        <span>事件等级</span
        ><a-tag :color="levelMap[event.levelCode || '']?.color">{{
          levelMap[event.levelCode || ""]?.text || event.levelCode || "—"
        }}</a-tag>
      </div>
      <div class="overview-item">
        <span>总指挥</span><strong>{{ event.commanderName || "—" }}</strong>
      </div>
      <div class="overview-item">
        <span>启动时间</span><strong>{{ dateText(event.occurredAt) }}</strong>
      </div>
      <div class="overview-item">
        <span>持续时长</span><strong>{{ durationText }}</strong>
      </div>
      <div class="overview-item">
        <span>状态</span><a-tag :color="statusMap[event.status || '']?.color">{{ statusMap[event.status || ""]?.text || "—" }}</a-tag>
      </div>
    </div>
  </section>
  <section class="workflow-card plan-card">
    <h2 class="card-label">关联预案</h2>
    <div class="plan-list">
      <template v-if="plans.length"
        ><template v-for="(plan, index) in plans" :key="plan.id"
          ><span v-if="index">、</span><a @click="emit('viewPlan', plan)">{{ plan.name }}</a></template
        ></template
      ><span v-else class="empty-text">未关联预案</span>
    </div>
  </section>
</template>

<style scoped>
.overview-card,
.plan-card {
  margin-bottom: 8px;
  padding: 12px;
  border-color: #e7eef8;
  box-shadow: 0 2px 10px rgba(32, 89, 157, 0.04);
}
.overview-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}
.overview-heading .card-label {
  margin: 0;
}
.card-label {
  margin: 0 0 10px;
  padding-left: 9px;
  border-left: 3px solid #1677ff;
  color: #334155;
  font-size: 15px;
  font-weight: 600;
}
.overview-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 8px;
}
.overview-item {
  display: flex;
  min-width: 0;
  min-height: 54px;
  padding: 8px 10px;
  flex-direction: column;
  justify-content: center;
  gap: 4px;
  background: #f8fbff;
  border-radius: 6px;
  font-size: 14px;
}
.overview-item > span {
  color: #8ba0ba;
  font-size: 13px;
}
.overview-item strong {
  overflow: hidden;
  color: #1f2937;
  font-weight: 500;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.overview-item :deep(.ant-tag) {
  align-self: flex-start;
  margin: 0;
  padding: 1px 7px;
  line-height: 20px;
}
.plan-card {
  display: flex;
  align-items: center;
  gap: 14px;
  min-height: 56px;
}
.plan-card .card-label {
  min-width: 96px;
  margin: 0;
}
.plan-list {
  color: #1f2937;
  font-size: 14px;
  line-height: 22px;
}
.empty-text {
  color: #94a3b8;
}
@media (max-width: 1100px) {
  .overview-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .plan-card {
    display: block;
  }
  .plan-card .card-label {
    margin-bottom: 8px;
  }
}
</style>
