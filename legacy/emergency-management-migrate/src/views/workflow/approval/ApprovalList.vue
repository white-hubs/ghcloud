<script setup lang="ts">
import moment from "moment";
import { onActivated, onMounted, reactive, ref } from "vue";
import { useRouter } from "vue-router";

import { approvalPage } from "@/api/emergency";

import "../workflow.css";

const router = useRouter();
const loading = ref(false);
const rows = ref<any[]>([]);
const total = ref(0);
const query = reactive({
  pageNumber: 1,
  pageSize: 10,
  status: undefined,
  levelCode: undefined,
  emergencyFileName: "",
});
const columns = [
  { title: "预案名称", dataIndex: "emergencyFileName", key: "emergencyFileName" },
  { title: "等级", dataIndex: "levelCode", key: "levelCode", width: 100, align: "center" },
  { title: "提交时间", dataIndex: "createTime", key: "createTime", width: 170 },
  { title: "提交人", dataIndex: "submitterName", key: "submitterName", width: 140 },
  { title: "状态", dataIndex: "status", key: "status", width: 110, align: "center" },
  { title: "审核时间", dataIndex: "completedAt", key: "completedAt", width: 170 },
  { title: "操作", key: "action", width: 90, align: "center" },
];
const statusMap: Record<string, { text: string; color: string }> = {
  PENDING: { text: "待审", color: "orange" },
  APPROVED: { text: "已通过", color: "green" },
  REJECTED: { text: "已驳回", color: "red" },
};
const levelMap: Record<string, string> = { IMPORTANT: "重要", ORDINARY: "普通", LEVEL_ONE: "一级", LEVEL_TWO: "二级", LEVEL_THREE: "三级" };
const load = async () => {
  loading.value = true;
  try {
    const data = await approvalPage(query);
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
let approvalListActivated = false;
onMounted(load);
onActivated(() => {
  // keepAlive 缓存下从审批详情跳回时刷新列表状态
  if (approvalListActivated) {
    load();
  }
  approvalListActivated = true;
});
</script>

<template>
  <div class="workflow-page">
    <div class="workflow-content approval-list-content">
      <section class="workflow-card approval-list-card">
        <div class="approval-filter">
          <a-select
            v-model:value="query.status"
            allow-clear
            placeholder="状态"
            :options="Object.entries(statusMap).map(([value, item]) => ({ value, label: item.text }))"
          />
          <a-select
            v-model:value="query.levelCode"
            allow-clear
            placeholder="等级"
            :options="Object.entries(levelMap).map(([value, label]) => ({ value, label }))"
          />
          <a-input v-model:value="query.emergencyFileName" allow-clear placeholder="搜索预案名称" @press-enter="search" />
          <a-button type="primary" @click="search">搜索</a-button>
          <a-button class="approval-config-button" @click="router.push('/planApproval/config')">审核配置</a-button>
        </div>

        <a-table :loading="loading" :columns="columns" :data-source="rows" :pagination="false" :scroll="{ x: 1080 }" row-key="id">
          <template #bodyCell="{ column, record, text }">
            <template v-if="column.key === 'emergencyFileName'">
              <a @click="router.push({ path: '/planApproval/detail', query: { id: record.id } })">{{ text }}</a>
            </template>
            <template v-else-if="column.key === 'levelCode'">
              <a-tag>{{ levelMap[text] || text || "--" }}</a-tag>
            </template>
            <template v-else-if="column.key === 'status'">
              <a-tag :color="statusMap[text]?.color">{{ statusMap[text]?.text || text }}</a-tag>
            </template>
            <template v-else-if="column.key === 'createTime' || column.key === 'completedAt'">
              {{ text ? moment(text).format("YYYY-MM-DD HH:mm") : "—" }}
            </template>
            <template v-else-if="column.key === 'submitterName'">{{ text || "—" }}</template>
            <template v-else-if="column.key === 'action'">
              <a @click="router.push({ path: '/planApproval/detail', query: { id: record.id } })">
                {{ record.status === "PENDING" ? "审核" : "详情" }}
              </a>
            </template>
          </template>
        </a-table>

        <div class="approval-pagination">
          <span>共 {{ total }} 条</span>
          <a-pagination
            v-model:current="query.pageNumber"
            :page-size="query.pageSize"
            :total="total"
            show-size-changer
            @change="load"
            @show-size-change="changePageSize"
          />
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.approval-list-content {
  height: 100%;
  max-width: none;
  margin: 0;
  padding: 0 16px;
  box-sizing: border-box;
  background: #fff;
  border-radius: 4px;
}

.approval-list-card {
  height: 100%;
  padding: 16px 0 0;
  border: 0;
  border-radius: 0;
  box-shadow: none;
}

.approval-filter {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 16px;
}

.approval-filter :deep(.ant-select) {
  width: 180px;
}

.approval-filter :deep(.ant-input-affix-wrapper) {
  width: 260px;
}

.approval-config-button {
  margin-left: auto;
}

.approval-pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 16px;
  padding-top: 14px;
  color: #94a3b8;
  font-size: 12px;
  border-top: 1px solid #eef0f3;
}

@media (max-width: 760px) {
  .approval-filter {
    align-items: stretch;
    flex-direction: column;
  }

  .approval-filter :deep(.ant-select),
  .approval-filter :deep(.ant-input-affix-wrapper) {
    width: 100%;
  }

  .approval-config-button {
    margin-left: 0;
  }

  .approval-pagination {
    align-items: flex-end;
    flex-direction: column;
    gap: 10px;
  }
}
</style>
