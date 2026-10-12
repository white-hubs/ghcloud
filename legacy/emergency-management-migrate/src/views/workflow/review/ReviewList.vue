<script setup lang="ts">
import { SearchOutlined } from "@ant-design/icons-vue";
import moment from "moment";
import { computed, onMounted, reactive, shallowRef } from "vue";
import { useRouter } from "vue-router";

import { eventReviewPage } from "@/api/emergency";

import "../workflow.css";

type ReviewStatus = "PENDING" | "COMPLETED";

interface ReviewListItem {
  id: string;
  name?: string;
  eventCode?: string;
  planNames?: string;
  sourceType?: string;
  terminatedAt?: string;
  reviewScore?: number | null;
  reviewStatus?: ReviewStatus;
}

const router = useRouter();
const loading = shallowRef(false);
const rows = shallowRef<ReviewListItem[]>([]);
const total = shallowRef(0);
const query = reactive({
  pageNumber: 1,
  pageSize: 10,
  reviewStatus: undefined as string | undefined,
  sourceType: undefined as string | undefined,
  keyword: "",
});
const columns = [
  { title: "事件名称", dataIndex: "name", key: "name", width: 240 },
  { title: "事件代号", dataIndex: "eventCode", key: "eventCode", width: 160 },
  { title: "关联预案", dataIndex: "planNames", key: "planNames", width: 240 },
  { title: "类型", dataIndex: "sourceType", key: "sourceType", width: 110, align: "center" },
  { title: "终止时间", dataIndex: "terminatedAt", key: "terminatedAt", width: 140 },
  { title: "综合评分", dataIndex: "reviewScore", key: "reviewScore", width: 110, align: "center" },
  { title: "状态", dataIndex: "reviewStatus", key: "reviewStatus", width: 100, align: "center" },
  { title: "操作", key: "action", width: 110, align: "center", fixed: "right" },
];
const reviewStatusMap: Record<ReviewStatus, { text: string; color: string }> = {
  PENDING: { text: "待复盘", color: "orange" },
  COMPLETED: { text: "已复盘", color: "green" },
};
const sourceTypeMap: Record<string, { text: string; color: string }> = {
  ALARM: { text: "真实事件", color: "red" },
  FILE: { text: "预案演练", color: "blue" },
};
const pageSummary = computed(() => {
  const counts = rows.value.reduce(
    (result, item) => {
      const status = item.reviewStatus || "PENDING";
      result[status] = (result[status] || 0) + 1;
      return result;
    },
    {} as Record<string, number>,
  );
  return `共 ${total.value} 条记录（本页待复盘${counts.PENDING || 0} · 已复盘${counts.COMPLETED || 0}）`;
});

const load = async (): Promise<void> => {
  loading.value = true;
  try {
    const data = await eventReviewPage(query);
    rows.value = data?.records || [];
    total.value = data?.total || 0;
  } finally {
    loading.value = false;
  }
};

const search = (): void => {
  query.pageNumber = 1;
  load();
};

const changePageSize = (_current: number, size: number): void => {
  query.pageNumber = 1;
  query.pageSize = size;
  load();
};

const scoreTone = (score?: number | null): string => {
  if (score == null) return "empty";
  if (score < 60) return "danger";
  if (score < 80) return "warning";
  return "success";
};

const statusOf = (record: ReviewListItem): ReviewStatus => record.reviewStatus || "PENDING";

const rowClassName = (record: ReviewListItem): string => {
  if (statusOf(record) !== "PENDING") return "";
  return record.reviewScore != null && record.reviewScore < 60 ? "review-row-danger" : "review-row-pending";
};

const openReport = (record: ReviewListItem): void => {
  router.push({
    path: "/planReview/report",
    query: { id: record.id, mode: statusOf(record) === "COMPLETED" ? "view" : "edit" },
  });
};

onMounted(load);
</script>

<template>
  <div class="workflow-page review-list-page">
    <div class="workflow-content review-list-content">
      <section class="workflow-card review-filter-card">
        <label>
          <span>状态</span>
          <a-select
            v-model:value="query.reviewStatus"
            allow-clear
            placeholder="全部"
            :options="Object.entries(reviewStatusMap).map(([value, item]) => ({ value, label: item.text }))"
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
        <a-input
          v-model:value="query.keyword"
          class="review-search-input"
          allow-clear
          placeholder="搜索事件名称或代号"
          @press-enter="search"
        >
          <template #prefix><SearchOutlined /></template>
        </a-input>
        <a-button type="primary" @click="search">搜索</a-button>
      </section>

      <section class="workflow-card review-table-card">
        <a-table
          :loading="loading"
          :columns="columns"
          :data-source="rows"
          :pagination="false"
          :row-class-name="rowClassName"
          :scroll="{ x: 1210 }"
          row-key="id"
          size="small"
        >
          <template #bodyCell="{ column, record, text }">
            <template v-if="column.key === 'name'">
              <span class="review-event-name">{{ text || "—" }}</span>
            </template>
            <template v-else-if="column.key === 'eventCode'">
              <span>{{ text || "—" }}</span>
            </template>
            <template v-else-if="column.key === 'planNames'">{{ text || "—" }}</template>
            <template v-else-if="column.key === 'sourceType'">
              <a-tag :color="sourceTypeMap[text]?.color">{{ sourceTypeMap[text]?.text || text || "—" }}</a-tag>
            </template>
            <template v-else-if="column.key === 'terminatedAt'">
              {{ text ? moment(text).format("MM-DD HH:mm") : "—" }}
            </template>
            <template v-else-if="column.key === 'reviewScore'">
              <span class="review-score" :class="scoreTone(text)">{{ text == null ? "—" : `${text}分` }}</span>
            </template>
            <template v-else-if="column.key === 'reviewStatus'">
              <a-tag
                :color="
                  statusOf(record) === 'PENDING' && record.reviewScore != null && record.reviewScore < 60
                    ? 'red'
                    : reviewStatusMap[statusOf(record)].color
                "
              >
                {{ reviewStatusMap[statusOf(record)].text }}
              </a-tag>
            </template>
            <template v-else-if="column.key === 'action'">
              <a-button v-if="statusOf(record) !== 'COMPLETED'" type="primary" size="small" @click="openReport(record)">
                开始复盘
              </a-button>
              <a v-else @click="openReport(record)">查看报告</a>
            </template>
          </template>
        </a-table>

        <footer class="review-table-footer">
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
  </div>
</template>

<style scoped>
.review-list-content {
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
.review-list-content > .workflow-card {
  margin-top: 0;
  border: 0;
  border-radius: 0;
  box-shadow: none;
}
.review-filter-card {
  display: flex;
  align-items: center;
  flex-wrap: nowrap;
  gap: 12px;
  padding: 16px 0;
}
.review-filter-card > * {
  flex: none;
}
.review-filter-card label {
  display: flex;
  align-items: center;
  flex: none;
  gap: 6px;
  color: #64748b;
  font-size: 12px;
  white-space: nowrap;
}
.review-filter-card label :deep(.ant-select) {
  width: 110px;
}
.review-filter-card :deep(.review-search-input) {
  width: 240px;
}
.review-table-card {
  padding: 0;
  overflow: hidden;
}
.review-event-name {
  color: #1f2937;
  font-weight: 500;
}
.review-score {
  font-weight: 600;
}
.review-score.success {
  color: #52c41a;
}
.review-score.warning {
  color: #faad14;
}
.review-score.danger {
  color: #ff4d4f;
}
.review-score.empty {
  color: #94a3b8;
}
.review-table-card :deep(.review-row-danger > td) {
  background: #fff1f0;
}
.review-table-card :deep(.review-row-pending > td) {
  background: #fff7e6;
}
.review-table-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  color: #64748b;
  font-size: 12px;
  border-top: 1px solid #eef0f3;
}
.review-table-footer :deep(.ant-pagination) {
  margin-left: auto;
}
@media (max-width: 760px) {
  .review-filter-card {
    align-items: stretch;
    flex-direction: column;
  }
  .review-filter-card label {
    justify-content: space-between;
  }
  .review-filter-card label :deep(.ant-select),
  .review-filter-card :deep(.review-search-input) {
    width: 100%;
  }
  .review-table-footer {
    align-items: flex-end;
    flex-direction: column;
    gap: 10px;
  }
  .review-table-footer :deep(.ant-pagination) {
    margin-left: 0;
  }
}
</style>
