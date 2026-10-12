<script setup lang="ts">
import { message } from "ant-design-vue";
import moment from "moment";
import { computed, onMounted, reactive, ref } from "vue";
import { useRouter } from "vue-router";

import { emergencyEventPage, terminateEmergencyEvent } from "@/api/emergency";

import "../workflow.css";

const router = useRouter();
const loading = ref(false);
const rows = ref<any[]>([]);
const total = ref(0);
const query = reactive({
  pageNumber: 1,
  pageSize: 10,
  status: undefined,
  sourceType: undefined,
  levelCode: undefined,
  keyword: "",
});
const columns = [
  { title: "事件名称", dataIndex: "name", key: "name", width: 210 },
  { title: "事件代号", dataIndex: "eventCode", key: "eventCode", width: 150 },
  { title: "关联预案", dataIndex: "planNames", key: "planNames", width: 220 },
  { title: "类型", dataIndex: "sourceType", key: "sourceType", width: 100, align: "center" },
  { title: "等级", dataIndex: "levelCode", key: "levelCode", width: 90, align: "center" },
  { title: "总指挥", dataIndex: "commanderName", key: "commanderName", width: 120 },
  { title: "启动时间", dataIndex: "occurredAt", key: "occurredAt", width: 130 },
  { title: "工单进度", key: "progress", width: 160 },
  { title: "状态", dataIndex: "status", key: "status", width: 100, align: "center" },
  { title: "操作", key: "action", width: 150, align: "center", fixed: "right" },
];
const statusMap: Record<string, { text: string; color: string }> = {
  WAITING_RESPONSE: { text: "待响应", color: "red" },
  RUNNING: { text: "进行中", color: "orange" },
  COMPLETED: { text: "已完成", color: "green" },
  TERMINATED: { text: "已终止", color: "default" },
};
const sourceTypeMap: Record<string, { text: string; color: string }> = {
  ALARM: { text: "真实事件", color: "red" },
  FILE: { text: "预案演练", color: "blue" },
};
const levelMap: Record<string, { text: string; color: string }> = {
  IMPORTANT: { text: "重要", color: "red" },
  ORDINARY: { text: "普通", color: "orange" },
};
const terminateTypeOptions = [
  { label: "事件已解决", value: "RESOLVED" },
  { label: "转为日常管理", value: "DAILY_MANAGEMENT" },
  { label: "误报/解除", value: "FALSE_ALARM" },
];
const terminateVisible = ref(false);
const terminating = ref(false);
const terminateTarget = ref<any>();
const terminateType = ref("RESOLVED");
const terminateReason = ref("");
const pageSummary = computed(() => {
  const counts = rows.value.reduce(
    (result, item) => {
      result[item.status] = (result[item.status] || 0) + 1;
      return result;
    },
    {} as Record<string, number>,
  );
  return `共 ${total.value} 条记录（本页待响应${counts.WAITING_RESPONSE || 0} · 进行中${counts.RUNNING || 0} · 已完成${counts.COMPLETED || 0} · 已终止${counts.TERMINATED || 0}）`;
});

const load = async () => {
  loading.value = true;
  try {
    const data = await emergencyEventPage(query);
    rows.value = data?.records || [];
    total.value = data?.total || 0;
  } finally {
    loading.value = false;
  }
};
const search = () => {
  query.pageNumber = 1;
  load();
};
const changePageSize = (_current: number, size: number) => {
  query.pageNumber = 1;
  query.pageSize = size;
  load();
};
const progressPercent = (record: any) =>
  record.totalTaskCount ? Math.round((Number(record.completedTaskCount || 0) / Number(record.totalTaskCount)) * 100) : 0;
const rowClassName = (record: any) =>
  record.status === "WAITING_RESPONSE" ? "event-row-waiting" : record.status === "RUNNING" ? "event-row-running" : "";
const openTerminate = (row: any) => {
  terminateTarget.value = row;
  terminateType.value = "RESOLVED";
  terminateReason.value = "";
  terminateVisible.value = true;
};
const terminate = async () => {
  if (terminateReason.value.trim().length < 20) {
    message.warning("终止说明至少20个字符");
    return;
  }
  terminating.value = true;
  try {
    await terminateEmergencyEvent(terminateTarget.value.id, {
      terminateType: terminateType.value,
      terminateReason: terminateReason.value.trim(),
    });
    message.success("事件已终止");
    terminateVisible.value = false;
    load();
  } finally {
    terminating.value = false;
  }
};
onMounted(load);
</script>

<template>
  <div class="workflow-page event-list-page">
    <div class="workflow-content event-list-content">
      <section class="workflow-card event-filter-card">
        <label>
          <span>状态</span>
          <a-select
            v-model:value="query.status"
            allow-clear
            placeholder="全部"
            :options="Object.entries(statusMap).map(([value, item]) => ({ value, label: item.text }))"
          />
        </label>
        <label>
          <span>类型</span>
          <a-select
            v-model:value="query.sourceType"
            allow-clear
            placeholder="全部"
            :options="Object.entries(sourceTypeMap).map(([value, item]) => ({ value, label: item.text }))"
          />
        </label>
        <label>
          <span>等级</span>
          <a-select
            v-model:value="query.levelCode"
            allow-clear
            placeholder="全部"
            :options="Object.entries(levelMap).map(([value, item]) => ({ value, label: item.text }))"
          />
        </label>
        <a-input
          v-model:value="query.keyword"
          class="event-search-input"
          allow-clear
          placeholder="搜索事件名称或代号"
          @press-enter="search"
        />
        <a-button type="primary" @click="search">搜索</a-button>
      </section>

      <section class="workflow-card event-table-card">
        <a-table
          :loading="loading"
          :columns="columns"
          :data-source="rows"
          :pagination="false"
          :row-class-name="rowClassName"
          :scroll="{ x: 1430 }"
          row-key="id"
          size="small"
        >
          <template #bodyCell="{ column, record, text }">
            <template v-if="column.key === 'name'">
              <span class="event-name">{{ text || "—" }}</span>
            </template>
            <template v-else-if="column.key === 'eventCode'">
              <a @click="router.push({ path: '/planEvent/detail', query: { id: record.id } })">{{ text || "—" }}</a>
            </template>
            <template v-else-if="column.key === 'planNames'">{{ text || "—" }}</template>
            <template v-else-if="column.key === 'sourceType'">
              <a-tag :color="sourceTypeMap[text]?.color">{{ sourceTypeMap[text]?.text || text || "—" }}</a-tag>
            </template>
            <template v-else-if="column.key === 'levelCode'">
              <a-tag v-if="text" :color="levelMap[text]?.color">{{ levelMap[text]?.text || text }}</a-tag>
              <span v-else>—</span>
            </template>
            <template v-else-if="column.key === 'commanderName'">{{ text || "—" }}</template>
            <template v-else-if="column.key === 'occurredAt'">
              {{ text ? moment(text).format("MM-DD HH:mm") : "—" }}
            </template>
            <template v-else-if="column.key === 'progress'">
              <template v-if="record.totalTaskCount">
                <span>已完成 {{ record.completedTaskCount || 0 }}/{{ record.totalTaskCount }}</span>
                <span class="progress-percent" :class="{ complete: progressPercent(record) === 100 }">
                  （{{ progressPercent(record) }}%）
                </span>
              </template>
              <span v-else>—</span>
            </template>
            <template v-else-if="column.key === 'status'">
              <a-tag :color="statusMap[text]?.color">{{ statusMap[text]?.text || text }}</a-tag>
            </template>
            <template v-else-if="column.key === 'action'">
              <a-button v-if="record.status === 'WAITING_RESPONSE'" type="primary" size="small" @click="router.push('/planEvent/launch')"
                >启动预案</a-button
              >
              <a-space v-else-if="record.status === 'RUNNING'">
                <a @click="router.push({ path: '/planEvent/detail', query: { id: record.id } })">查看详情</a>
                <a class="danger-link" @click="openTerminate(record)">终止</a>
              </a-space>
              <a v-else @click="router.push({ path: '/planEvent/detail', query: { id: record.id } })">查看详情</a>
            </template>
          </template>
        </a-table>

        <footer class="event-table-footer">
          <span>{{ pageSummary }}</span>
          <a-pagination
            v-model:current="query.pageNumber"
            :page-size="query.pageSize"
            :total="total"
            show-size-changer
            size="small"
            @change="load"
            @show-size-change="changePageSize"
          />
        </footer>
      </section>
    </div>

    <a-modal
      v-model:visible="terminateVisible"
      title="终止事件"
      :confirm-loading="terminating"
      ok-text="确认终止，不可撤销"
      ok-type="danger"
      @ok="terminate"
    >
      <div class="terminate-info">
        <strong>{{ terminateTarget?.name }}</strong
        >（{{ terminateTarget?.eventCode }}）
      </div>
      <label class="terminate-field">
        <span>终止类型</span>
        <a-select v-model:value="terminateType" :options="terminateTypeOptions" />
      </label>
      <label class="terminate-field">
        <span>终止说明（至少20字）</span>
        <a-textarea v-model:value="terminateReason" :rows="3" :maxlength="500" show-count placeholder="描述事件终止原因和当前状态" />
      </label>
    </a-modal>
  </div>
</template>

<style scoped>
.event-list-content {
  display: grid;
  height: 100%;
  gap: 0;
  max-width: none;
  margin: 0;
  padding: 0 16px;
  box-sizing: border-box;
  background: #fff;
  border-radius: 4px;
}
.event-list-content > .workflow-card {
  margin-top: 0;
  border: 0;
  border-radius: 0;
  box-shadow: none;
}
.event-filter-card {
  display: flex;
  align-items: center;
  flex-wrap: nowrap;
  gap: 12px;
  padding: 16px 0;
}
.event-filter-card > * {
  flex: none;
}
.event-filter-card label {
  display: flex;
  align-items: center;
  flex: none;
  gap: 6px;
  color: #64748b;
  font-size: 12px;
  white-space: nowrap;
}
.event-filter-card label :deep(.ant-select) {
  width: 110px;
}
.event-filter-card :deep(.event-search-input),
.event-filter-card :deep(.event-search-input.ant-input-affix-wrapper) {
  flex: none !important;
  width: 240px !important;
}
.event-table-card {
  padding: 0;
  overflow: hidden;
}
.event-name {
  color: #1f2937;
  font-weight: 500;
}
.progress-percent {
  color: #faad14;
  font-size: 11px;
}
.progress-percent.complete {
  color: #52c41a;
}
.danger-link {
  color: #ff4d4f;
}
.event-table-card :deep(.event-row-waiting > td) {
  background: #fff1f0;
}
.event-table-card :deep(.event-row-running > td) {
  background: #fff7e6;
}
.event-table-footer {
  display: flex !important;
  align-items: center !important;
  justify-content: space-between !important;
  flex-wrap: nowrap !important;
  padding: 12px 16px;
  color: #64748b;
  font-size: 12px;
  border-top: 1px solid #eef0f3;
}
.event-table-footer > span {
  flex: none;
}
.event-table-footer :deep(.ant-pagination) {
  flex: none !important;
  width: auto !important;
  margin-left: auto !important;
}
.terminate-info {
  margin-bottom: 14px;
  padding: 10px 12px;
  background: #f8fafc;
  border-radius: 6px;
}
.terminate-field {
  display: grid;
  gap: 6px;
  margin-top: 12px;
  color: #64748b;
  font-size: 12px;
}
.terminate-field :deep(.ant-select) {
  width: 100%;
}
@media (max-width: 760px) {
  .event-filter-card {
    align-items: stretch;
    flex-direction: column;
  }
  .event-filter-card label {
    justify-content: space-between;
  }
  .event-filter-card label :deep(.ant-select),
  .event-filter-card :deep(.event-search-input),
  .event-filter-card :deep(.event-search-input.ant-input-affix-wrapper) {
    width: 100% !important;
  }
  .event-table-footer {
    align-items: flex-end !important;
    flex-direction: column;
    gap: 10px;
  }
  .event-table-footer :deep(.ant-pagination) {
    margin-left: 0 !important;
  }
}
</style>
