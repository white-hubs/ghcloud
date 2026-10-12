<script setup lang="ts">
import { message } from "ant-design-vue";
import moment from "moment";
import { computed, onMounted, reactive, shallowRef } from "vue";
import { useRoute, useRouter } from "vue-router";

import type { AiSuggestion, RectificationItem, ReviewDetail } from "./review-types";
import ReviewScoreCards from "./ReviewScoreCards.vue";
import ReviewTaskTable from "./ReviewTaskTable.vue";
import ReviewTimeline from "./ReviewTimeline.vue";
import { tenantUserList } from "@/api";
import { createEventRectification, eventReviewDetail, generateEventReviewAiSuggestions, saveEventReview } from "@/api/emergency";

import "../workflow.css";

const route = useRoute();
const router = useRouter();
const loading = shallowRef(false);
const saving = shallowRef(false);
const rectificationCreating = shallowRef(false);
const generatingAi = shallowRef(false);
const newItemContent = shallowRef("");
const rectificationVisible = shallowRef(false);
const rectificationTarget = shallowRef<RectificationItem>();
const detail = shallowRef<ReviewDetail>();
const userNames = shallowRef<Record<string, string>>({});
const rectificationUserOptions = shallowRef<{ label: string; value: string }[]>([]);
const levelMap: Record<string, { text: string; color: string }> = {
  IMPORTANT: { text: "重要", color: "red" },
  ORDINARY: { text: "普通", color: "orange" },
};
const form = reactive<{ reviewSummary: string; rectificationItems: RectificationItem[] }>({
  reviewSummary: "",
  rectificationItems: [],
});
const rectificationForm = reactive({
  responsibleUserId: "",
  deadline: "",
  description: "请根据复盘报告中的问题描述，对预案进行针对性修订。",
});

const readonly = computed(() => route.query.mode === "view" || detail.value?.reviewStatus === "COMPLETED");
const tasks = computed(() => detail.value?.tasks || []);
const completedTasks = computed(() => tasks.value.filter((task) => task.status === "COMPLETED").length);
const aiSuggestions = computed(() => form.rectificationItems.filter((item) => item.sourceType === "AI" && !item.accepted));
const acceptedItems = computed(() => form.rectificationItems.filter((item) => item.sourceType !== "AI" || item.accepted));
const versionText = (version?: number) => {
  if (version == null) {
    return "";
  }
  if (version <= 0) {
    return "v0.0.0";
  }
  const offset = version - 1;
  return `v${Math.floor(offset / 100) + 1}.${Math.floor(offset / 10) % 10}.${offset % 10}`;
};
const durationText = computed(() => {
  const minutes = detail.value?.durationMinutes;
  if (minutes == null) return "--";
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return `${hours ? `${hours}小时` : ""}${rest || !hours ? `${rest}分钟` : ""}`;
});
const eventId = computed(() => {
  const id = route.query.id;
  return typeof id === "string" && /^[1-9]\d*$/.test(id) ? id : undefined;
});

const load = async (): Promise<void> => {
  const id = eventId.value;
  if (!id) {
    message.error("复盘事件参数无效");
    return;
  }
  loading.value = true;
  try {
    const [detailResult, usersResult] = await Promise.allSettled([
      eventReviewDetail(id) as Promise<ReviewDetail>,
      tenantUserList({ enabled: true, pageNumber: 1, pageSize: 200 }),
    ]);
    if (detailResult.status === "rejected") throw detailResult.reason;
    const data = detailResult.value;
    const users = usersResult.status === "fulfilled" ? usersResult.value : [];
    const userRecords = users?.records || users || [];
    detail.value = data;
    userNames.value = Object.fromEntries(
      userRecords.map((user: { id: number; name?: string }) => [String(user.id), user.name || `ID ${user.id}`]),
    );
    rectificationUserOptions.value = userRecords.map((user: { id: number; name?: string }) => ({
      label: user.name || `ID ${user.id}`,
      value: String(user.id),
    }));
    form.reviewSummary = data.reviewSummary || "";
    form.rectificationItems = (data.rectificationItems || []).map((item) =>
      item.sourceType === "AI" ? { ...item, accepted: true } : { ...item },
    );
  } finally {
    loading.value = false;
  }
};

const addItem = (): void => {
  const content = newItemContent.value.trim();
  if (!content) return;
  form.rectificationItems.push({ content, sourceType: "MANUAL" });
  newItemContent.value = "";
};

const generateAiSuggestions = async (): Promise<void> => {
  const id = eventId.value;
  if (!id || generatingAi.value) return;
  generatingAi.value = true;
  try {
    const suggestions = (await generateEventReviewAiSuggestions(id)) as AiSuggestion[];
    const candidates: RectificationItem[] = suggestions.map((item) => ({
      content: `${item.problemDescription}：${item.improvementSuggestion}`,
      sourceType: "AI",
      reasoningSource: item.reasoningSource,
    }));
    form.rectificationItems = [...form.rectificationItems.filter((item) => item.sourceType !== "AI" || item.accepted), ...candidates];
    message.success(`已生成${candidates.length}条AI建议`);
  } catch (error) {
    message.error(error instanceof Error ? error.message : "AI建议生成失败，请稍后重试");
  } finally {
    generatingAi.value = false;
  }
};

const acceptSuggestion = (item: RectificationItem): void => {
  item.accepted = true;
};

const openRectification = (item: RectificationItem): void => {
  rectificationTarget.value = item;
  const commanderId = detail.value?.commanderId ? String(detail.value.commanderId) : "";
  rectificationForm.responsibleUserId = rectificationUserOptions.value.some((option) => option.value === commanderId)
    ? commanderId
    : rectificationUserOptions.value[0]?.value || "";
  rectificationForm.deadline = moment().add(7, "days").format("YYYY-MM-DD HH:mm:ss");
  rectificationForm.description = "请根据复盘报告中的问题描述，对预案进行针对性修订。";
  rectificationVisible.value = true;
};

const createRectification = async (): Promise<void> => {
  if (!rectificationForm.responsibleUserId || !rectificationForm.deadline || !rectificationForm.description.trim()) {
    message.warning("请完整填写整改待办信息");
    return;
  }
  const id = eventId.value;
  const target = rectificationTarget.value;
  if (!id || !target) return;
  rectificationCreating.value = true;
  try {
    const result = await createEventRectification(id, {
      improvementId: target.id,
      content: target.content,
      sourceType: target.sourceType,
      responsibleUserId: rectificationForm.responsibleUserId,
      rectificationDeadline: rectificationForm.deadline,
      description: rectificationForm.description.trim(),
    });
    const index = form.rectificationItems.indexOf(target);
    if (index >= 0) form.rectificationItems[index] = { ...result, ...(target.accepted ? { accepted: true } : {}) };
    rectificationVisible.value = false;
    message.success("整改记录创建成功");
  } finally {
    rectificationCreating.value = false;
  }
};

const save = async (): Promise<void> => {
  if (!form.reviewSummary.trim()) {
    message.warning("请填写复盘总结");
    return;
  }
  saving.value = true;
  try {
    const id = eventId.value;
    if (!id) {
      message.error("复盘事件参数无效");
      return;
    }
    await saveEventReview(id, {
      reviewSummary: form.reviewSummary,
      rectificationItems: form.rectificationItems
        .filter((item) => item.content.trim() && (item.sourceType !== "AI" || item.accepted))
        .map((item) => ({ id: item.id, content: item.content.trim(), sourceType: item.sourceType || "MANUAL" })),
    });
    message.success("复盘报告已保存");
    await load();
  } finally {
    saving.value = false;
  }
};

const exportPdf = (): void => {
  window.print();
};

onMounted(load);
</script>

<template>
  <div class="workflow-page review-page">
    <div class="workflow-content">
      <a-spin :spinning="loading">
        <template v-if="detail">
          <section class="workflow-card event-card">
            <div>
              <span class="workflow-muted">复盘优化 / 复盘报告</span>
              <h2>{{ detail.eventCode || detail.name || "复盘报告" }}</h2>
              <p>{{ detail.name || "--" }}</p>
            </div>
            <div class="report-actions">
              <a-tag :color="readonly ? 'green' : 'orange'">{{ readonly ? "查看模式" : "编辑模式" }}</a-tag
              ><a-button @click="exportPdf">导出 PDF</a-button>
            </div>
          </section>

          <section class="workflow-card summary-grid">
            <div class="summary-plan">
              <span>预案</span>
              <div v-if="detail.plans?.length" class="plan-version-list">
                <div v-for="plan in detail.plans" :key="plan.id" class="plan-version-item">
                  <strong>{{ plan.name || `预案 ${plan.id}` }}</strong>
                  <a-tag v-if="versionText(plan.version)" color="blue">{{ versionText(plan.version) }}</a-tag>
                </div>
              </div>
              <strong v-else>--</strong>
            </div>
            <div>
              <span>等级</span
              ><a-tag :color="levelMap[detail.levelCode || '']?.color">{{ levelMap[detail.levelCode || ""]?.text || "--" }}</a-tag>
            </div>
            <div>
              <span>总指挥</span
              ><strong>{{ detail.commanderId ? userNames[String(detail.commanderId)] || `ID ${detail.commanderId}` : "--" }}</strong>
            </div>
            <div>
              <span>持续时长</span><strong>{{ durationText }}</strong>
            </div>
          </section>

          <ReviewTimeline :tasks="tasks" />
          <ReviewScoreCards
            :response-score="detail.responseSpeedScore"
            :completion-score="detail.taskCompletionRateScore"
            :review-score="detail.reviewScore"
            :average-response-seconds="detail.averageResponseSeconds"
            :completed-tasks="completedTasks"
            :total-tasks="tasks.length"
          />
          <ReviewTaskTable :tasks="tasks" :user-names="userNames" />

          <section class="workflow-card">
            <h3 class="workflow-section-title">
              改进项清单
              <a-button v-if="!readonly" size="small" type="primary" ghost :loading="generatingAi" @click="generateAiSuggestions"
                >🤖 生成AI建议</a-button
              >
            </h3>
            <p v-if="aiSuggestions.length" class="ai-suggestion-hint">🧠 AI 基于差异对比结果自动生成以下建议：</p>
            <div v-for="(item, index) in aiSuggestions" :key="item.id || `ai-${index}`" class="rectification-row ai-suggestion-row">
              <span class="rectification-content"
                >{{ item.content }} <small>🧠 AI建议{{ item.reasoningSource ? ` · ${item.reasoningSource}` : "" }}</small></span
              >
              <a-button v-if="!readonly" size="small" type="primary" @click="acceptSuggestion(item)">采纳</a-button>
            </div>
            <div v-for="(item, index) in acceptedItems" :key="item.id || `accepted-${index}`" class="rectification-row">
              <span class="rectification-content">{{ item.content }}</span>
              <span v-if="item.rectificationTaskId" class="rectification-record-info"
                >{{ item.rectificationResponsibleUserName || "--" }} ·
                {{ item.rectificationDeadline ? moment(item.rectificationDeadline).format("YYYY-MM-DD HH:mm") : "--" }}</span
              >
              <a-tag
                v-if="item.rectificationStatus"
                :color="item.rectificationStatus === 'OVERDUE' ? 'red' : item.rectificationStatus === 'COMPLETED' ? 'green' : 'orange'"
                >{{
                  item.rectificationStatus === "OVERDUE" ? "已超时" : item.rectificationStatus === "COMPLETED" ? "已完成" : "待整改"
                }}</a-tag
              >
              <a-button v-if="!readonly && !item.rectificationTaskId" size="small" type="primary" @click="openRectification(item)"
                >发起整改</a-button
              >
            </div>
            <div v-if="!readonly" class="rectification-add-row">
              <a-input v-model:value="newItemContent" placeholder="新增改进项描述..." @press-enter="addItem" />
              <a-button @click="addItem">添加</a-button>
            </div>
            <div v-else-if="!form.rectificationItems.length" class="workflow-empty">暂无改进项</div>
          </section>

          <section class="workflow-card">
            <h3 class="workflow-section-title">复盘总结</h3>
            <p v-if="readonly" class="review-summary">{{ form.reviewSummary || "暂无总结" }}</p>
            <a-textarea v-else v-model:value="form.reviewSummary" :rows="5" maxlength="5000" show-count />
            <div v-if="!readonly" class="workflow-footer">
              <a-button @click="router.back()">取消</a-button>
              <a-button type="primary" :loading="saving" @click="save">保存复盘报告</a-button>
            </div>
          </section>
        </template>
      </a-spin>
    </div>

    <a-modal
      v-model:visible="rectificationVisible"
      title="发起整改"
      :width="500"
      :confirm-loading="rectificationCreating"
      ok-text="确认创建整改记录"
      cancel-text="取消"
      @ok="createRectification"
    >
      <div class="rectification-problem">问题：{{ rectificationTarget?.content || "--" }}</div>
      <div class="rectification-form-grid">
        <label class="rectification-field">
          <span>整改责任人 *</span>
          <a-select
            v-model:value="rectificationForm.responsibleUserId"
            show-search
            option-filter-prop="label"
            placeholder="请输入姓名搜索"
            :options="rectificationUserOptions"
          />
          <small>默认选择事件总指挥</small>
        </label>
        <label class="rectification-field">
          <span>整改截止时间 *</span>
          <a-date-picker
            v-model:value="rectificationForm.deadline"
            show-time
            format="YYYY-MM-DD HH:mm"
            value-format="YYYY-MM-DD HH:mm:ss"
          />
          <small>默认为当前日期+7天</small>
        </label>
      </div>
      <label class="rectification-field rectification-description">
        <span>整改说明</span>
        <a-textarea v-model:value="rectificationForm.description" :rows="3" />
      </label>
    </a-modal>
  </div>
</template>

<style scoped>
.review-page {
  height: 100%;
  min-height: 0;
  overflow: hidden;
}
.review-page > .workflow-content {
  height: 100%;
  min-height: 0;
  box-sizing: border-box;
  overflow-y: auto;
}
.event-card {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}
.report-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}
.event-card h2 {
  margin: 4px 0 0;
  color: #1f2937;
  font-size: 20px;
}
.event-card p {
  margin: 4px 0 0;
  color: #64748b;
}
.summary-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 24px;
}
.summary-grid > div {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
}
.summary-grid span {
  color: #94a3b8;
}
.summary-grid strong {
  color: #334155;
  font-weight: 500;
}
.plan-version-list {
  display: grid;
  gap: 6px;
  min-width: 0;
}
.plan-version-item {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}
.plan-version-item strong {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.plan-version-item :deep(.ant-tag) {
  flex: none;
  margin: 0;
  border-radius: 10px;
  font-size: 11px;
  line-height: 18px;
}
.rectification-row {
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 50px;
  margin-bottom: 8px;
  padding: 8px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
}
.rectification-content {
  min-width: 0;
  flex: 1;
  color: #334155;
}
.rectification-content small {
  margin-left: 8px;
  color: #ff7a45;
  font-size: 11px;
}
.rectification-record-info {
  flex: none;
  color: #64748b;
  font-size: 12px;
}
.ai-suggestion-hint {
  margin: -2px 0 10px;
  color: #ff6b35;
  font-size: 12px;
}
.ai-suggestion-row {
  background: #fff8ef;
  border-color: #ffd591;
}
.rectification-add-row {
  display: flex;
  gap: 8px;
}
.rectification-add-row :deep(.ant-input) {
  flex: 1;
}
.rectification-problem {
  margin-bottom: 12px;
  padding: 10px 8px;
  color: #334155;
  background: #f8fafc;
  border-radius: 4px;
}
.rectification-form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}
.rectification-field {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 5px;
  color: #64748b;
  font-size: 12px;
}
.rectification-field :deep(.ant-select),
.rectification-field :deep(.ant-picker) {
  width: 100%;
}
.rectification-field small {
  color: #94a3b8;
}
.rectification-description {
  margin-top: 14px;
}
.review-summary {
  white-space: pre-wrap;
  line-height: 1.8;
}
.workflow-card {
  margin-bottom: 12px;
}
@media (max-width: 900px) {
  .summary-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
@media print {
  .report-actions,
  .workflow-footer {
    display: none !important;
  }
  .workflow-content {
    padding: 0;
  }
  .workflow-card {
    break-inside: avoid;
    box-shadow: none;
  }
}
</style>
