<script setup lang="ts">
import { ArrowLeftOutlined, ClockCircleOutlined, UserOutlined } from "@ant-design/icons-vue";
import { message, Modal } from "ant-design-vue";
import moment from "moment";
import { computed, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";

import {
  buildVersion,
  collectLineStates,
  diffVersions,
  groupSummary,
  type DiffGroup,
  type PlanLine,
  type PlanSection,
  type SideLineStates,
} from "./planDiff";
import { approvalDetail, approvePlan, rejectPlan, tenantUserList } from "@/api";

import "../workflow.css";

const route = useRoute();
const router = useRouter();
const loading = ref(false);
const detail = ref<any>({});
const userMap = ref<Record<string, string>>({});
const rejectVisible = ref(false);
const rejectSubmitting = ref(false);
const rejectError = ref("");
const rejectForm = ref<{ rejectType: string | undefined; sections: string[]; suggestion: string }>({
  rejectType: undefined,
  sections: [],
  suggestion: "",
});
const rejectTypes = ["内容错误", "信息缺失", "不符合规范", "其他"];

const statusMap: Record<string, { text: string; color: string }> = {
  PENDING: { text: "待审", color: "orange" },
  APPROVED: { text: "已通过", color: "green" },
  REJECTED: { text: "已驳回", color: "red" },
};
const levelMap: Record<string, string> = {
  IMPORTANT: "重要",
  ORDINARY: "普通",
  LEVEL_ONE: "一级",
  LEVEL_TWO: "二级",
  LEVEL_THREE: "三级",
};

const snapshot = computed(() => {
  try {
    return JSON.parse(detail.value.changeSnapshotJson || "{}");
  } catch {
    return {};
  }
});
const hasBefore = computed(() => Boolean(snapshot.value.before?.file || snapshot.value.before?.tasks));
const resolveName = (id: unknown) => (id != null ? userMap.value[String(id)] : null) || null;
const beforeSections = computed<PlanSection[]>(() => buildVersion(snapshot.value.before, resolveName));
const afterSections = computed<PlanSection[]>(() => buildVersion(snapshot.value.after, resolveName));
const groups = computed<DiffGroup[]>(() => diffVersions(beforeSections.value, afterSections.value));
const states = computed<SideLineStates>(() => collectLineStates(groups.value));

const submitterName = computed(() => {
  const raw = detail.value;
  return raw.submitterName || resolveName(raw.creatorId) || raw.createBy || "—";
});
const submitTime = computed(() => (detail.value.createTime ? moment(detail.value.createTime).format("YYYY-MM-DD HH:mm") : "—"));
const baseVersion = computed(() => detail.value.baseVersion || 0);
const isCreate = computed(() => detail.value.operationType === "CREATE");
const pending = computed(() => detail.value.status === "PENDING");

const lineClass = (side: "before" | "after", section: PlanSection, text: string) => states.value[side].get(`${section.key}::${text}`) || "";
const sectionTone = (side: "before" | "after", section: PlanSection) => {
  const tones = section.lines.map((line) => states.value[side].get(`${section.key}::${line.text}`));
  if (tones.includes("del") || tones.includes("add")) {
    return side === "before" ? "has-del" : "has-add";
  }
  return tones.includes("mod") ? "has-mod" : "";
};
const taskLineKey = (line: PlanLine) => line.text;

const load = async () => {
  loading.value = true;
  try {
    const [detailData, userData] = await Promise.all([
      approvalDetail(route.query.id),
      tenantUserList({ pageNumber: 1, pageSize: 200 }).catch(() => null),
    ]);
    detail.value = detailData || {};
    ((userData as any)?.records || []).forEach((user: { id?: string | number; name?: string }) => {
      if (user.id != null) {
        userMap.value[String(user.id)] = user.name || String(user.id);
      }
    });
  } finally {
    loading.value = false;
  }
};

const changedSectionOptions = computed(() =>
  groups.value
    .map((group, index) => ({ group, no: index + 1 }))
    .filter(({ group }) => group.type !== "same")
    .map(({ group, no }) => {
      const label = `§${no} ${group.title || "正文"}`;
      return { label, value: label };
    }),
);

const confirmApprove = () =>
  Modal.confirm({
    title: "确认通过审批？",
    content: "当前节点完成后，末节点通过才发布稳定版本。",
    onOk: async () => {
      await approvePlan(route.query.id, {});
      message.success("审批已通过");
      router.push("/planApproval/list");
    },
  });

const openReject = () => {
  rejectError.value = "";
  rejectForm.value = { rejectType: undefined, sections: [], suggestion: "" };
  rejectVisible.value = true;
};

const confirmReject = async () => {
  if (!rejectForm.value.rejectType) {
    rejectError.value = "请选择驳回类型";
    return;
  }
  const suggestion = rejectForm.value.suggestion.trim();
  if (suggestion.length < 10) {
    rejectError.value = "请填写修改建议，至少10个字";
    return;
  }
  const parts = [`驳回类型：${rejectForm.value.rejectType}`];
  if (rejectForm.value.sections.length) {
    parts.push(`问题章节：${rejectForm.value.sections.join("、")}`);
  }
  parts.push(`修改建议：${suggestion}`);
  rejectSubmitting.value = true;
  try {
    await rejectPlan(route.query.id, { reviewComment: parts.join("；") });
    message.success("审批已驳回，预案已进入修订待办");
    rejectVisible.value = false;
    router.push("/planRevision/todo");
  } finally {
    rejectSubmitting.value = false;
  }
};

onMounted(load);
</script>

<template>
  <div class="workflow-page approval-detail-page">
    <div class="workflow-content approval-detail-content">
      <a-spin :spinning="loading">
        <section class="workflow-card detail-topbar">
          <a class="back-link" @click="router.push('/planApproval/list')">
            <ArrowLeftOutlined />
            审核详情
          </a>
          <div v-if="pending" class="topbar-actions">
            <a-button danger @click="openReject">驳回</a-button>
            <a-button type="primary" @click="confirmApprove">通过</a-button>
          </div>
        </section>

        <section class="workflow-card plan-header">
          <div class="plan-header-main">
            <h2 class="plan-title">
              {{ detail.emergencyFileName || "预案审批" }}
              <a-tag :color="statusMap[detail.status]?.color">
                {{ statusMap[detail.status]?.text || detail.status || "--" }}
              </a-tag>
            </h2>
            <div class="plan-meta">
              <span>提交人：{{ submitterName }}</span>
              <span>{{ submitTime }}</span>
              <a-tag>{{ isCreate ? "首次发布" : "修订" }}</a-tag>
              <a-tag v-if="detail.levelCode">等级：{{ levelMap[detail.levelCode] || detail.levelCode }}</a-tag>
              <a-tag v-if="detail.approvalRuleName">审批规则：{{ detail.approvalRuleName }}</a-tag>
            </div>
          </div>
          <div class="diff-legend">
            <span class="legend-item"><i class="legend-dot add"></i>新增</span>
            <span class="legend-item"><i class="legend-dot mod"></i>修改</span>
            <span class="legend-item"><i class="legend-dot del"></i>删除</span>
            <span class="legend-item"><i class="legend-dot same"></i>未变更</span>
          </div>
        </section>

        <section class="diff-board">
          <div class="diff-col">
            <div class="diff-col-header">
              <span>v{{ baseVersion }}（上一生效版本）</span>
            </div>
            <div class="diff-col-body">
              <div v-if="!hasBefore" class="diff-empty">首次发布，无历史版本</div>
              <template v-else>
                <section
                  v-for="(section, index) in beforeSections"
                  :key="`b-${section.key}-${index}`"
                  class="plan-section"
                  :class="sectionTone('before', section)"
                >
                  <h5 class="plan-section-title">§{{ index + 1 }} {{ section.title || "正文" }}</h5>
                  <p
                    v-for="line in section.lines"
                    :key="taskLineKey(line)"
                    class="plan-line"
                    :class="lineClass('before', section, line.text)"
                  >
                    <template v-if="line.task">
                      <span class="task-name">{{ line.task.name }}</span>
                      <span v-if="line.task.durationMinutes != null" class="task-seg">
                        <ClockCircleOutlined />
                        {{ line.task.durationMinutes }}分钟
                      </span>
                      <span v-if="line.task.executorNames.length" class="task-seg">
                        <UserOutlined />
                        {{ line.task.executorNames.join("、") }}
                      </span>
                    </template>
                    <template v-else>{{ line.text }}</template>
                  </p>
                </section>
                <div v-if="!beforeSections.length" class="diff-empty">该版本无结构化正文内容</div>
              </template>
            </div>
          </div>

          <div class="diff-col diff-col-middle">
            <div class="diff-col-header">
              <span>差异比对</span>
              <span class="version-flow">v{{ baseVersion }} → v{{ baseVersion + 1 }}</span>
            </div>
            <div class="diff-col-body">
              <div v-for="(group, index) in groups" :key="`g-${group.key}-${index}`" class="diff-group" :class="group.type">
                <div class="diff-group-header">
                  <span class="diff-badges">
                    <i v-if="group.type === 'same'" class="diff-badge same">同</i>
                    <template v-else>
                      <i v-if="group.type === 'del' || group.delCount" class="diff-badge del">删</i>
                      <i v-if="group.type === 'add' || group.addCount" class="diff-badge add">增</i>
                      <i v-if="group.modCount" class="diff-badge mod">改</i>
                    </template>
                  </span>
                  <span class="diff-group-title">§{{ index + 1 }} {{ group.title || "正文" }}</span>
                  <span class="diff-group-summary">· {{ groupSummary(group) }}</span>
                </div>
                <div v-if="group.type !== 'same'" class="diff-group-body">
                  <template v-for="(item, itemIndex) in group.items" :key="itemIndex">
                    <p v-if="item.kind === 'del'" class="diff-line del">- {{ item.before?.text }}</p>
                    <p v-else-if="item.kind === 'add'" class="diff-line add">+ {{ item.after?.text }}</p>
                    <div v-else class="diff-mod">
                      <p class="diff-line del">- {{ item.before?.text }}</p>
                      <p class="diff-line add">+ {{ item.after?.text }}</p>
                    </div>
                  </template>
                </div>
              </div>
              <div v-if="!groups.length" class="diff-empty">暂无可比对内容</div>
            </div>
          </div>

          <div class="diff-col">
            <div class="diff-col-header">
              <span>v{{ baseVersion + 1 }}（提审版本）</span>
              <span class="version-flow">{{ submitTime }}</span>
            </div>
            <div class="diff-col-body">
              <section
                v-for="(section, index) in afterSections"
                :key="`a-${section.key}-${index}`"
                class="plan-section"
                :class="sectionTone('after', section)"
              >
                <h5 class="plan-section-title">§{{ index + 1 }} {{ section.title || "正文" }}</h5>
                <p v-for="line in section.lines" :key="taskLineKey(line)" class="plan-line" :class="lineClass('after', section, line.text)">
                  <template v-if="line.task">
                    <span class="task-name">{{ line.task.name }}</span>
                    <span v-if="line.task.durationMinutes != null" class="task-seg">
                      <ClockCircleOutlined />
                      {{ line.task.durationMinutes }}分钟
                    </span>
                    <span v-if="line.task.executorNames.length" class="task-seg">
                      <UserOutlined />
                      {{ line.task.executorNames.join("、") }}
                    </span>
                  </template>
                  <template v-else>{{ line.text }}</template>
                </p>
              </section>
              <div v-if="!afterSections.length" class="diff-empty">该版本无结构化正文内容</div>
            </div>
          </div>
        </section>

        <section v-if="detail.reviewComment" class="workflow-card comment-card">
          <h3 class="workflow-section-title">审批意见</h3>
          <p class="review-comment">{{ detail.reviewComment }}</p>
        </section>
      </a-spin>
    </div>

    <a-modal
      v-model:visible="rejectVisible"
      class="reject-modal"
      :width="560"
      :confirm-loading="rejectSubmitting"
      ok-text="确认驳回"
      cancel-text="取消"
      :ok-button-props="{ danger: true }"
      @ok="confirmReject"
    >
      <template #title><span class="reject-modal-title">驳回预案</span></template>
      <a-form layout="vertical" class="reject-form">
        <a-form-item label="驳回类型" required>
          <a-select
            v-model:value="rejectForm.rejectType"
            placeholder="请选择驳回类型"
            :options="rejectTypes.map((item) => ({ label: item, value: item }))"
          />
        </a-form-item>
        <a-form-item label="问题章节（可多选）">
          <a-checkbox-group v-model:value="rejectForm.sections" :options="changedSectionOptions" class="reject-sections" />
          <div class="reject-hint">仅列出有变更的章节</div>
        </a-form-item>
        <a-form-item label="修改建议" required>
          <a-textarea
            v-model:value="rejectForm.suggestion"
            :rows="4"
            maxlength="500"
            show-count
            placeholder="请说明驳回原因和修改方向，至少10字..."
          />
        </a-form-item>
        <div v-if="rejectError" class="reject-error">{{ rejectError }}</div>
      </a-form>
    </a-modal>
  </div>
</template>

<style lang="less" scoped>
.approval-detail-page {
  display: flex;
  height: 100%;
  min-height: 0;
  overflow: hidden;
}

.approval-detail-content {
  width: 100%;
  height: 100%;
  min-height: 0;
  max-width: none;
  padding: 16px;
  box-sizing: border-box;
  overflow-y: auto;
}

.detail-topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
}

.back-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 15px;
  font-weight: 600;
  color: #1f2937;
  cursor: pointer;
}

.plan-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-top: 12px;
}

.plan-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: #111827;
}

.plan-meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px 16px;
  margin-top: 8px;
  font-size: 13px;
  color: #64748b;
}

.diff-legend {
  display: flex;
  gap: 12px;
  padding-top: 4px;
  font-size: 12px;
  color: #64748b;
  white-space: nowrap;
}

.legend-dot {
  display: inline-block;
  width: 10px;
  height: 10px;
  margin-right: 4px;
  border-radius: 2px;
  vertical-align: -1px;

  &.add {
    background: #4ade80;
  }

  &.mod {
    background: #fbbf24;
  }

  &.del {
    background: #f87171;
  }

  &.same {
    background: #cbd5e1;
  }
}

.diff-board {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  align-items: stretch;
  margin-top: 12px;
}

.diff-col {
  display: flex;
  flex-direction: column;
  background: #fff;
  border: 1px solid #edf0f3;
  border-radius: 8px;
}

.diff-col-header {
  position: sticky;
  top: 0;
  z-index: 2;
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  padding: 10px 14px;
  font-size: 14px;
  font-weight: 600;
  color: #1f2937;
  background: #f8fafc;
  border-bottom: 1px solid #eef0f3;
  border-radius: 8px 8px 0 0;
}

.version-flow {
  font-size: 12px;
  font-weight: 400;
  color: #94a3b8;
}

.diff-col-body {
  padding: 12px;
}

.diff-empty {
  padding: 40px 12px;
  font-size: 13px;
  color: #94a3b8;
  text-align: center;
}

.plan-section {
  padding: 10px 12px;
  margin-bottom: 10px;
  background: #fff;
  border: 1px solid #eef0f3;
  border-radius: 6px;

  &.has-del {
    background: #fef6f6;
    border-color: #fecaca;
  }

  &.has-add {
    background: #f6fef9;
    border-color: #bbf7d0;
  }

  &.has-mod {
    background: #fffdf5;
    border-color: #fde68a;
  }
}

.plan-section-title {
  margin: 0 0 8px;
  font-size: 13px;
  font-weight: 600;
  color: #334155;
}

.plan-line {
  margin: 4px 0;
  padding: 3px 8px;
  font-size: 13px;
  line-height: 1.7;
  color: #334155;
  word-break: break-all;
  border-radius: 4px;

  &.del {
    color: #b91c1c;
    background: #fee2e2;
  }

  &.add {
    color: #15803d;
    background: #dcfce7;
  }

  &.mod {
    color: #b45309;
    background: #fef3c7;
  }
}

.task-seg {
  margin-left: 8px;
  color: #64748b;

  & + .task-seg::before {
    margin-right: 8px;
    color: #cbd5e1;
    content: "|";
  }
}

.diff-group {
  margin-bottom: 10px;
  overflow: hidden;
  border: 1px solid #eef0f3;
  border-radius: 6px;

  &.same {
    background: #f8fafc;
  }

  &.add {
    background: #f6fef9;
    border-color: #bbf7d0;
  }

  &.del {
    background: #fef6f6;
    border-color: #fecaca;
  }

  &.change {
    background: #fffdf5;
    border-color: #fde68a;
  }
}

.diff-group-header {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
  padding: 8px 10px;
  font-size: 13px;
}

.diff-badges {
  display: inline-flex;
  gap: 4px;
}

.diff-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  font-size: 12px;
  font-style: normal;
  font-weight: 600;
  color: #fff;
  border-radius: 4px;

  &.del {
    background: #f87171;
  }

  &.add {
    background: #4ade80;
  }

  &.mod {
    background: #fbbf24;
  }

  &.same {
    background: #94a3b8;
  }
}

.diff-group-title {
  font-weight: 600;
  color: #334155;
}

.diff-group-summary {
  font-size: 12px;
  color: #94a3b8;
}

.diff-group-body {
  padding: 4px 10px 8px;
}

.diff-line {
  margin: 3px 0;
  padding: 3px 8px;
  font-size: 12.5px;
  line-height: 1.6;
  word-break: break-all;
  border-radius: 4px;

  &.del {
    color: #dc2626;
    background: #fee2e2;
  }

  &.add {
    color: #16a34a;
    background: #dcfce7;
  }
}

.diff-mod {
  margin: 4px 0;
  padding-left: 6px;
  border-left: 3px solid #fbbf24;
}

.comment-card {
  margin-top: 12px;
}

.review-comment {
  margin: 0;
  font-size: 13px;
  line-height: 1.8;
  color: #475569;
  white-space: pre-wrap;
}

.reject-modal-title {
  font-size: 18px;
  font-weight: 700;
  color: #dc2626;
}

.reject-sections {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px 16px;
}

.reject-hint {
  margin-top: 4px;
  font-size: 12px;
  color: #94a3b8;
}

.reject-error {
  font-size: 13px;
  color: #dc2626;
}

@media (max-width: 1100px) {
  .plan-header {
    flex-direction: column;
  }

  .diff-board {
    grid-template-columns: 1fr;
  }

  .diff-col-header {
    position: static;
  }
}
</style>
