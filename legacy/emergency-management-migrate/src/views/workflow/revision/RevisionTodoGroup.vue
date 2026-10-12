<script setup lang="ts">
import moment from "moment";

import type { RevisionTodoGroupData, RevisionTodoItem, RevisionTodoType } from "./revision-todo-types";

const { group, startingId = "" } = defineProps<{ group: RevisionTodoGroupData; startingId?: string }>();
const emit = defineEmits<{ start: [item: RevisionTodoItem] }>();
const groupConfig: Record<RevisionTodoType, { title: string; subtitle?: string }> = {
  FORCED: { title: "强制修订", subtitle: "效能评分 < 60分" },
  REJECTED: { title: "驳回待修订" },
  SUGGESTED: { title: "建议修订" },
  PERIODIC: { title: "定期修订", subtitle: "到期提醒" },
};
const timingText = (item: RevisionTodoItem): string => {
  if (item.overdue) {
    return "已逾期！";
  }
  if (item.revisionDeadline) {
    return `截止：${moment(item.revisionDeadline).format("YYYY-MM-DD HH:mm")}`;
  }
  if (item.revisionType === "REJECTED" && item.createTime) {
    return `驳回时间：${moment(item.createTime).format("MM-DD HH:mm")}`;
  }
  return "--";
};
</script>

<template>
  <section class="revision-group" :class="`revision-group--${group.revisionType.toLowerCase()}`">
    <h2>
      <i />{{ groupConfig[group.revisionType].title
      }}<span v-if="groupConfig[group.revisionType].subtitle">（{{ groupConfig[group.revisionType].subtitle }}）</span>
    </h2>
    <article v-for="item in group.items" :key="item.id" class="revision-item">
      <div class="revision-main">
        <div class="revision-title">
          <strong>{{ item.emergencyFileName || "--" }}</strong>
          <span>来源版本 {{ item.sourceVersionText }}</span>
        </div>
        <p>{{ item.reason }}</p>
      </div>
      <div class="revision-action">
        <span :class="{ overdue: item.overdue }">{{ timingText(item) }}</span>
        <a-button
          type="primary"
          size="small"
          :disabled="item.status === 'APPROVING'"
          :loading="startingId === item.id"
          @click="emit('start', item)"
        >
          {{ item.status === "APPROVING" ? "审批中" : "开始修订" }}
        </a-button>
      </div>
    </article>
  </section>
</template>

<style scoped>
.revision-group {
  padding: 12px;
  border: 1px solid;
  border-radius: 8px;
}
.revision-group h2 {
  display: flex;
  align-items: center;
  margin: 0 0 10px;
  color: var(--tone);
  font-size: 15px;
  font-weight: 600;
}
.revision-group h2 i {
  width: 15px;
  height: 15px;
  margin-right: 6px;
  border-radius: 50%;
  background: var(--tone);
}
.revision-group h2 span {
  font-weight: 600;
}
.revision-item {
  display: flex;
  min-height: 64px;
  padding: 10px 12px;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  background: #fff;
  border-radius: 4px;
}
.revision-item + .revision-item {
  margin-top: 8px;
}
.revision-main {
  min-width: 0;
}
.revision-title {
  display: flex;
  align-items: center;
  gap: 8px;
}
.revision-title strong {
  color: #334155;
  font-size: 14px;
  font-weight: 500;
}
.revision-title span {
  padding: 1px 6px;
  color: #1677d2;
  font-size: 12px;
  background: #e6f4ff;
  border-radius: 3px;
}
.revision-main p {
  margin: 3px 0 0;
  color: var(--tone);
  font-size: 12px;
}
.revision-action {
  display: flex;
  flex: none;
  align-items: center;
  gap: 14px;
}
.revision-action > span {
  color: #94a3b8;
  font-size: 12px;
}
.revision-action > span.overdue {
  color: #ff4d4f;
}
.revision-group--forced {
  --tone: #ff4d4f;
  background: #fff1f0;
  border-color: #ffb3b3;
}
.revision-group--rejected {
  --tone: #a640d4;
  background: #fbf3ff;
  border-color: #e5c2ff;
}
.revision-group--suggested {
  --tone: #fa8c16;
  background: #fff7e8;
  border-color: #ffd08a;
}
.revision-group--periodic {
  --tone: #1677d2;
  background: #eef6ff;
  border-color: #acd2ff;
}
@media (max-width: 760px) {
  .revision-item {
    align-items: flex-start;
    flex-direction: column;
  }
  .revision-action {
    width: 100%;
    justify-content: space-between;
  }
}
</style>
