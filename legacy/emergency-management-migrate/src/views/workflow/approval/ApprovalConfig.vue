<script setup lang="ts">
import { CloseOutlined, DeleteOutlined, HolderOutlined, PlusOutlined } from "@ant-design/icons-vue";
import { message, Modal } from "ant-design-vue";
import { computed, onBeforeUnmount, onMounted, reactive, ref } from "vue";

import { approvalRules, deleteApprovalRule, reorderApprovalRules, saveApprovalRule, tenantUserList } from "@/api";
import { geteventtypes } from "@/api/emergency";

import "../workflow.css";

type SelectOption = { label: string; value: string };
type ApprovalCondition = { dimension?: string; matchValue?: string };
type ApprovalNode = { approverUserId?: string };
type ApprovalRule = {
  id?: string | number | null;
  clientKey: string;
  name: string;
  defaultRule: boolean;
  sortNo?: number;
  conditions: ApprovalCondition[];
  nodes: ApprovalNode[];
  updateTime?: string;
  updateBy?: string;
  updaterName?: string;
};

const dimensions: SelectOption[] = [
  { label: "预案等级", value: "LEVEL_CODE" },
  { label: "事件类型", value: "EVENT_TYPE_CODE" },
  { label: "提审性质", value: "OPERATION_TYPE" },
];
const conditionValues = reactive<Record<string, SelectOption[]>>({
  LEVEL_CODE: [
    { label: "重要", value: "IMPORTANT" },
    { label: "普通", value: "ORDINARY" },
  ],
  OPERATION_TYPE: [
    { label: "首次发布", value: "CREATE" },
    { label: "修订", value: "UPDATE" },
  ],
  EVENT_TYPE_CODE: [],
});

const rules = ref<ApprovalRule[]>([]);
const selectedKey = ref("");
const loading = ref(false);
const saving = ref(false);
const userOptions = ref<SelectOption[]>([]);
const dirtyKeys = ref(new Set<string>());
const draggedNodeIndex = ref<number | null>(null);
const dropTargetIndex = ref<number | null>(null);
const dropBefore = ref(false);
const duplicateNodeIndex = ref<number | null>(null);
const draggedRuleIndex = ref<number | null>(null);
const ruleDropTargetIndex = ref<number | null>(null);
const ruleDropBefore = ref(false);
const loadedRules = new Map<string, ApprovalRule>();

const form = reactive<ApprovalRule>(createRule());
const isDirty = computed(() => dirtyKeys.value.size > 0);
const defaultRuleCount = computed(() => rules.value.filter((item) => displayRule(item).defaultRule).length);
const selectedRule = computed(() => rules.value.find((item) => item.clientKey === selectedKey.value));
const addConditionDisabled = computed(
  () => form.defaultRule || dimensions.every((dimension) => form.conditions.some((item) => item.dimension === dimension.value)),
);
const lastModifiedText = computed(() => {
  const operator = form.updaterName || form.updateBy;
  if (!form.updateTime && !operator) return "暂无修改记录";
  return `上次修改：${form.updateTime || "--"}${operator ? ` · 操作人：${operator}` : ""}`;
});

function createClientKey() {
  return globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function createRule(index = 1): ApprovalRule {
  return {
    id: null,
    clientKey: createClientKey(),
    name: `新规则${index}`,
    defaultRule: false,
    conditions: [],
    nodes: [{ approverUserId: undefined }],
  };
}

function deepClone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

function normalizeRule(value: Partial<ApprovalRule>): ApprovalRule {
  const nodes = Array.isArray(value.nodes) && value.nodes.length ? value.nodes : [{ approverUserId: undefined }];
  const defaultRule = Boolean(value.defaultRule);
  return {
    ...value,
    id: value.id ?? null,
    clientKey: value.id == null ? value.clientKey || createClientKey() : String(value.id),
    name: value.name || "未命名规则",
    defaultRule,
    conditions: defaultRule ? [] : Array.isArray(value.conditions) ? value.conditions : [],
    nodes: nodes.map((node) => ({
      ...node,
      approverUserId: node.approverUserId == null ? undefined : String(node.approverUserId),
    })),
  };
}

function syncFormToSelectedRule() {
  if (selectedRule.value) Object.assign(selectedRule.value, deepClone(form));
}

function selectRule(rule: ApprovalRule, preserveCurrent = true) {
  if (rule.clientKey === selectedKey.value) return;
  if (preserveCurrent) syncFormToSelectedRule();
  selectedKey.value = rule.clientKey;
  Object.assign(form, deepClone(rule));
  clearDragState();
}

function markDirty() {
  dirtyKeys.value = new Set(dirtyKeys.value).add(form.clientKey);
}

function clearRuleDirty(key: string) {
  const next = new Set(dirtyKeys.value);
  next.delete(key);
  dirtyKeys.value = next;
}

function displayRule(rule: ApprovalRule) {
  return rule.clientKey === selectedKey.value ? form : rule;
}

function dimensionLabel(value?: string) {
  return dimensions.find((item) => item.value === value)?.label || value || "条件";
}

function conditionValueLabel(condition: ApprovalCondition) {
  return (
    conditionValues[condition.dimension || ""]?.find((item) => item.value === condition.matchValue)?.label || condition.matchValue || "--"
  );
}

function conditionSummary(rule: ApprovalRule) {
  if (!rule.conditions.length) return "无条件兜底";
  return rule.conditions.map((condition) => `${dimensionLabel(condition.dimension)}=${conditionValueLabel(condition)}`).join(" · ");
}

function availableDimensions(index: number) {
  const current = form.conditions[index]?.dimension;
  const used = new Set(form.conditions.map((item) => item.dimension).filter(Boolean));
  return dimensions.filter((item) => item.value === current || !used.has(item.value));
}

function addCondition() {
  const used = new Set(form.conditions.map((item) => item.dimension).filter(Boolean));
  const dimension = dimensions.find((item) => !used.has(item.value));
  if (!dimension || form.defaultRule) return;
  form.conditions.push({ dimension: dimension.value, matchValue: conditionValues[dimension.value]?.[0]?.value });
  markDirty();
}

function changeConditionDimension(index: number, dimension: string) {
  const condition = form.conditions[index];
  if (!condition) return;
  condition.dimension = dimension;
  condition.matchValue = conditionValues[dimension]?.[0]?.value;
  markDirty();
}

function removeCondition(index: number) {
  form.conditions.splice(index, 1);
  markDirty();
}

function createNewRule() {
  syncFormToSelectedRule();
  const rule = createRule(rules.value.filter((item) => !item.defaultRule).length + 1);
  const defaultIndex = rules.value.findIndex((item) => item.defaultRule);
  rules.value.splice(defaultIndex < 0 ? rules.value.length : defaultIndex, 0, rule);
  selectRule(rule, false);
  markDirty();
}

function removeRule(rule: ApprovalRule) {
  if (rule.defaultRule) return;
  Modal.confirm({
    title: `确认删除规则“${rule.name}”？`,
    content: "删除后不可恢复。",
    async onOk() {
      if (rule.id != null) await deleteApprovalRule(rule.id);
      const index = rules.value.findIndex((item) => item.clientKey === rule.clientKey);
      if (index >= 0) rules.value.splice(index, 1);
      clearRuleDirty(rule.clientKey);
      if (selectedKey.value === rule.clientKey && rules.value.length) {
        selectRule(rules.value[Math.min(index, rules.value.length - 1)]!, false);
      }
      message.success("规则已删除");
    },
  });
}

function clearRuleDragState() {
  draggedRuleIndex.value = null;
  ruleDropTargetIndex.value = null;
  ruleDropBefore.value = false;
}

function ruleDragStart(event: DragEvent, index: number) {
  const rule = rules.value[index];
  if (!rule || rule.defaultRule || rule.id == null) return;
  draggedRuleIndex.value = index;
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", String(index));
  }
}

function ruleDragOver(event: DragEvent, index: number) {
  const targetRule = rules.value[index];
  if (!targetRule || targetRule.defaultRule || targetRule.id == null || draggedRuleIndex.value === index) return;
  event.preventDefault();
  const target = event.currentTarget as HTMLElement;
  ruleDropTargetIndex.value = index;
  ruleDropBefore.value = event.clientY - target.getBoundingClientRect().top < target.offsetHeight / 2;
}

async function dropRule(event: DragEvent, index: number) {
  event.preventDefault();
  const from = draggedRuleIndex.value;
  if (from == null || from === index || rules.value[index]?.defaultRule) {
    clearRuleDragState();
    return;
  }
  const snapshot = [...rules.value];
  const [rule] = rules.value.splice(from, 1);
  if (!rule) return;
  const target = from < index ? index - 1 : index;
  rules.value.splice(ruleDropBefore.value ? target : target + 1, 0, rule);
  clearRuleDragState();
  try {
    const orderedRules = rules.value.filter((item) => !item.defaultRule && item.id != null);
    await reorderApprovalRules({ ruleIds: orderedRules.map((item) => item.id) });
    orderedRules.forEach((item, orderIndex) => (item.sortNo = orderIndex + 1));
    message.success("规则顺序已更新");
  } catch {
    rules.value = snapshot;
  }
}

function addNode(index = form.nodes.length - 1) {
  form.nodes.splice(index + 1, 0, { approverUserId: undefined });
  markDirty();
}

function removeNode(index: number) {
  if (form.nodes.length <= 1) {
    message.warning("至少保留1个审批节点");
    return;
  }
  const name = userOptions.value.find((item) => item.value === String(form.nodes[index]?.approverUserId))?.label || "未选择审批人";
  Modal.confirm({
    title: `确认删除节点${index + 1}（${name}）？`,
    onOk() {
      form.nodes.splice(index, 1);
      markDirty();
    },
  });
}

function duplicateApproverIndexes() {
  const seen = new Map<string, number>();
  for (let index = 0; index < form.nodes.length; index += 1) {
    const id = form.nodes[index]?.approverUserId;
    if (!id) continue;
    const key = String(id);
    if (seen.has(key)) return [seen.get(key)!, index] as const;
    seen.set(key, index);
  }
  return null;
}

function changeNodeApprover() {
  markDirty();
  if (duplicateApproverIndexes()) message.warning("当前流程存在重复审批人，保存前请调整");
}

function clearDragState() {
  draggedNodeIndex.value = null;
  dropTargetIndex.value = null;
  dropBefore.value = false;
}

function dragStart(event: DragEvent, index: number) {
  draggedNodeIndex.value = index;
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", String(index));
  }
}

function dragOver(event: DragEvent, index: number) {
  event.preventDefault();
  if (draggedNodeIndex.value === index) {
    dropTargetIndex.value = null;
    return;
  }
  const target = event.currentTarget as HTMLElement;
  dropTargetIndex.value = index;
  dropBefore.value = event.clientY - target.getBoundingClientRect().top < target.offsetHeight / 2;
}

function dropNode(event: DragEvent, index: number) {
  event.preventDefault();
  const from = draggedNodeIndex.value;
  if (from == null || from === index) {
    clearDragState();
    return;
  }
  const [node] = form.nodes.splice(from, 1);
  if (!node) return;
  const target = from < index ? index - 1 : index;
  form.nodes.splice(dropBefore.value ? target : target + 1, 0, node);
  clearDragState();
  markDirty();
}

function resetCurrentRule() {
  const stored = rules.value.find((item) => item.clientKey === selectedKey.value);
  if (!stored) return;
  Modal.confirm({
    title: `仅重置当前规则“${form.name}”？`,
    content: "当前未保存的修改将被撤销。",
    onOk() {
      if (form.id == null) {
        form.conditions = [];
        form.nodes = [{ approverUserId: undefined }];
      } else {
        const original = loadedRules.get(form.clientKey);
        if (original) Object.assign(form, deepClone(original));
      }
      Object.assign(stored, deepClone(form));
      clearRuleDirty(form.clientKey);
      message.warning("已恢复上次保存的配置");
    },
  });
}

async function load(preferredId?: string | number | null) {
  loading.value = true;
  try {
    rules.value = ((await approvalRules()) || []).map((item: Partial<ApprovalRule>) => normalizeRule(item));
    loadedRules.clear();
    rules.value.forEach((item) => loadedRules.set(item.clientKey, deepClone(item)));
    const preferred = preferredId == null ? null : rules.value.find((item) => String(item.id) === String(preferredId));
    const current = preferred || rules.value.find((item) => item.clientKey === selectedKey.value) || rules.value[0];
    if (current) selectRule(current, false);
    dirtyKeys.value = new Set();
  } finally {
    loading.value = false;
  }
}

async function loadOptions() {
  const [users, eventTypes] = await Promise.all([tenantUserList({ enabled: true, pageNumber: 1, pageSize: 200 }), geteventtypes()]);
  userOptions.value = (users?.records || users || []).flatMap((item: any) =>
    item?.id != null && item?.name ? [{ label: item.name, value: String(item.id) }] : [],
  );
  conditionValues.EVENT_TYPE_CODE = (eventTypes || []).flatMap((item: any) => {
    const value = item?.code ?? item?.value ?? item?.id;
    const label = item?.name ?? item?.label;
    return value != null && label ? [{ label, value: String(value) }] : [];
  });
}

async function save() {
  syncFormToSelectedRule();
  if (defaultRuleCount.value !== 1) {
    message.error("保存失败：审核配置必须且只能有一个默认规则");
    return;
  }
  const name = form.name.trim();
  if (!name) {
    message.error("保存失败：规则名称不能为空");
    return;
  }
  if (rules.value.some((item) => item.clientKey !== form.clientKey && item.name.trim() === name)) {
    message.error(`保存失败：规则名称“${name}”已存在`);
    return;
  }
  const emptyNodeIndex = form.nodes.findIndex((node) => !node.approverUserId);
  if (emptyNodeIndex >= 0) {
    message.error(`保存失败：请选择节点${emptyNodeIndex + 1}的审批人员`);
    return;
  }
  const duplicate = duplicateApproverIndexes();
  if (duplicate) {
    duplicateNodeIndex.value = duplicate[1];
    message.error(`保存失败：节点${duplicate[0] + 1}与节点${duplicate[1] + 1}审批人相同`);
    window.setTimeout(() => (duplicateNodeIndex.value = null), 2200);
    return;
  }
  saving.value = true;
  try {
    const id = await saveApprovalRule({
      id: form.id,
      name,
      defaultRule: form.defaultRule,
      conditions: form.defaultRule ? [] : form.conditions.filter((item) => item.dimension && item.matchValue),
      nodes: form.nodes.map((item) => ({ approverUserId: item.approverUserId })),
    });
    message.success("配置已保存，后续提审的预案将按新规则流转");
    await load(id ?? form.id);
  } finally {
    saving.value = false;
  }
}

function beforeUnload(event: BeforeUnloadEvent) {
  if (!isDirty.value) return;
  event.preventDefault();
  event.returnValue = "";
}

onMounted(() => {
  load();
  loadOptions();
  window.addEventListener("beforeunload", beforeUnload);
});
onBeforeUnmount(() => window.removeEventListener("beforeunload", beforeUnload));
</script>

<template>
  <div class="workflow-page approval-config-page">
    <div class="workflow-content config-layout">
      <aside class="workflow-card rule-sidebar">
        <div class="rule-sidebar-title">
          <span>审批规则</span>
          <a-button type="link" size="small" @click="createNewRule"><PlusOutlined />新建规则</a-button>
        </div>
        <a-spin :spinning="loading">
          <div class="rule-list">
            <button
              v-for="(item, ruleIndex) in rules"
              :key="item.clientKey"
              type="button"
              class="rule-item"
              :class="{
                active: selectedKey === item.clientKey,
                'rule-drop-before': ruleDropTargetIndex === ruleIndex && ruleDropBefore,
                'rule-drop-after': ruleDropTargetIndex === ruleIndex && !ruleDropBefore,
              }"
              @dragover="ruleDragOver($event, ruleIndex)"
              @drop.stop="dropRule($event, ruleIndex)"
              @click="selectRule(item)"
            >
              <span class="rule-name-row">
                <span class="rule-name">
                  {{ displayRule(item).name }}
                  <a-tag v-if="displayRule(item).defaultRule" color="blue">默认</a-tag>
                </span>
                <span v-if="!displayRule(item).defaultRule" class="rule-actions">
                  <span
                    v-if="item.id != null"
                    class="rule-drag-handle"
                    title="按住拖拽调整匹配优先级"
                    draggable="true"
                    @click.stop
                    @dragstart.stop="ruleDragStart($event, ruleIndex)"
                    @dragend="clearRuleDragState"
                    ><HolderOutlined
                  /></span>
                  <CloseOutlined class="rule-delete" title="删除规则" @click.stop="removeRule(item)" />
                </span>
              </span>
              <span class="rule-meta-row">
                <span class="rule-summary">{{ conditionSummary(displayRule(item)) }}</span>
                <span class="node-count">{{ displayRule(item).nodes.length }}节点</span>
              </span>
            </button>
          </div>
        </a-spin>
        <div class="rule-sidebar-note">预案提审时按条件命中规则，条件多者优先；条件数量相同时按列表顺序；未命中走默认规则</div>
      </aside>

      <main class="workflow-card rule-editor">
        <a-alert
          v-if="!loading && defaultRuleCount !== 1"
          class="default-rule-alert"
          type="error"
          show-icon
          message="审核配置必须且只能有一个默认规则，当前配置无法保存，也不能提交预案审批。"
        />
        <div class="editor-title-row">
          <h2>{{ form.name || "未命名规则" }}审批流</h2>
          <a-tag v-if="form.defaultRule" color="blue">默认规则</a-tag>
          <span v-if="isDirty" class="dirty-badge">未保存</span>
          <div class="editor-title-actions">
            <a-button @click="resetCurrentRule">重置</a-button><a-button type="primary" :loading="saving" @click="save">保存配置</a-button>
          </div>
        </div>

        <section class="config-section rule-name-section">
          <label for="approval-rule-name">规则名称</label>
          <a-input id="approval-rule-name" v-model:value="form.name" :maxlength="20" placeholder="请输入规则名称" @input="markDirty" />
        </section>

        <section class="config-section">
          <div class="section-heading">
            <div><span>匹配条件</span><small>（多条条件为且关系，条件多者优先，未命中走默认规则）</small></div>
            <a-button size="small" :disabled="addConditionDisabled" @click="addCondition"><PlusOutlined />添加条件</a-button>
          </div>
          <div v-if="!form.conditions.length" class="empty-condition">
            {{ form.defaultRule ? "默认规则不配置匹配条件，其他规则均未命中时自动使用" : "请至少配置一个匹配条件" }}
          </div>
          <div v-for="(condition, index) in form.conditions" :key="index" class="condition-row">
            <a-select
              :value="condition.dimension"
              :disabled="form.defaultRule"
              :options="availableDimensions(index)"
              placeholder="匹配维度"
              @change="changeConditionDimension(index, $event)"
            />
            <span>等于</span>
            <a-select
              v-model:value="condition.matchValue"
              :disabled="form.defaultRule"
              :options="conditionValues[condition.dimension || ''] || []"
              placeholder="匹配值"
              @change="markDirty"
            />
            <small v-if="condition.dimension === 'OPERATION_TYPE'">由系统自动判定</small>
            <CloseOutlined v-if="!form.defaultRule" class="condition-delete" title="删除条件" @click="removeCondition(index)" />
          </div>
        </section>

        <section class="node-section">
          <div class="section-heading node-heading">
            <div><span>审批节点</span><small>（提审后按以下节点顺序流转，末节点通过后预案生效）</small></div>
          </div>
          <div class="node-list">
            <template v-for="(node, index) in form.nodes" :key="index">
              <div
                class="node-card"
                :class="{
                  'node-error': duplicateNodeIndex === index,
                  'drop-before': dropTargetIndex === index && dropBefore,
                  'drop-after': dropTargetIndex === index && !dropBefore,
                }"
                @dragover="dragOver($event, index)"
                @drop="dropNode($event, index)"
                @dragleave="dropTargetIndex = null"
              >
                <span class="node-number">{{ index + 1 }}</span>
                <div class="node-content">
                  <span>审批人</span>
                  <a-select
                    v-model:value="node.approverUserId"
                    show-search
                    option-filter-prop="label"
                    :options="userOptions"
                    placeholder="选择审批人员"
                    @change="changeNodeApprover"
                  />
                </div>
                <a-button type="text" title="在此节点后插入" @click="addNode(index)"><PlusOutlined /></a-button>
                <span
                  class="drag-handle"
                  title="按住拖拽排序"
                  draggable="true"
                  @dragstart="dragStart($event, index)"
                  @dragend="clearDragState"
                  ><HolderOutlined
                /></span>
                <a-button type="text" danger title="删除节点" @click="removeNode(index)"><DeleteOutlined /></a-button>
              </div>
              <div v-if="index < form.nodes.length - 1" class="node-arrow">↓</div>
            </template>
          </div>
          <a-button size="small" class="add-node-button" @click="addNode()"><PlusOutlined />添加节点</a-button>
        </section>

        <footer class="editor-footer">
          <span>按住拖拽手柄可调整审批顺序 · 最少保留1个节点</span>
          <span>{{ lastModifiedText }}</span>
        </footer>
      </main>
    </div>
  </div>
</template>

<style scoped>
.approval-config-page {
  min-height: 100vh;
}
.config-layout {
  display: grid;
  align-items: start;
  grid-template-columns: 260px minmax(0, 1fr);
  gap: 12px;
  max-width: 1648px;
  margin: 0 auto;
}
.rule-sidebar {
  padding: 12px;
}
.rule-sidebar-title,
.rule-name-row,
.rule-meta-row,
.editor-title-row,
.section-heading,
.condition-row,
.node-card,
.node-content,
.editor-footer {
  display: flex;
  align-items: center;
}
.rule-sidebar-title {
  justify-content: space-between;
  padding: 0 4px 8px;
  color: #64748b;
  font-size: 12px;
  font-weight: 500;
}
.rule-sidebar-title :deep(.ant-btn) {
  height: 22px;
  padding: 0 4px;
  font-size: 12px;
}
.rule-list {
  display: grid;
  gap: 2px;
}
.rule-item {
  display: grid;
  gap: 4px;
  width: 100%;
  padding: 8px 10px;
  color: #595959;
  text-align: left;
  background: transparent;
  border: 0;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.15s;
}
.rule-item:hover,
.rule-item.active {
  color: #1677ff;
  background: #e6f4ff;
}
.rule-item.rule-drop-before {
  border-top: 2px solid #1677ff;
}
.rule-item.rule-drop-after {
  border-bottom: 2px solid #1677ff;
}
.rule-name-row,
.rule-meta-row {
  justify-content: space-between;
  min-width: 0;
  gap: 6px;
}
.rule-name,
.rule-summary {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.rule-name {
  font-size: 13px;
}
.rule-item.active .rule-name {
  font-weight: 500;
}
.rule-name :deep(.ant-tag) {
  margin-left: 4px;
  padding: 0 4px;
  font-size: 10px;
  line-height: 16px;
}
.rule-delete,
.condition-delete {
  flex: none;
  color: #bfbfbf;
  cursor: pointer;
}
.rule-delete:hover,
.condition-delete:hover {
  color: #ff4d4f;
}
.rule-actions {
  display: inline-flex;
  align-items: center;
  gap: 5px;
}
.rule-drag-handle {
  display: inline-flex;
  padding: 2px;
  color: #bfbfbf;
  cursor: grab;
  border-radius: 3px;
}
.rule-drag-handle:hover {
  color: #1677ff;
  background: #dbeafe;
}
.rule-drag-handle:active {
  cursor: grabbing;
}
.rule-summary {
  color: #bfbfbf;
  font-size: 11px;
}
.rule-item.active .rule-summary {
  color: #91caff;
}
.node-count {
  flex: none;
  padding: 0 6px;
  color: #8c8c8c;
  font-size: 10px;
  line-height: 16px;
  background: #f0f0f0;
  border-radius: 8px;
}
.rule-sidebar-note {
  margin-top: 8px;
  padding: 8px 4px 0;
  color: #94a3b8;
  font-size: 12px;
  line-height: 1.6;
  border-top: 1px solid #f1f5f9;
}
.rule-editor {
  padding: 16px;
}
.default-rule-alert {
  margin-bottom: 12px;
}
.editor-title-row {
  min-height: 24px;
  margin-bottom: 12px;
  gap: 8px;
}
.editor-title-row h2 {
  margin: 0;
  color: #1f2937;
  font-size: 16px;
  font-weight: 600;
}
.editor-title-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: auto;
}
.dirty-badge {
  padding: 1px 7px;
  color: #ad6800;
  font-size: 11px;
  background: #fffbe6;
  border: 1px solid #ffe58f;
  border-radius: 4px;
}
.config-section {
  margin-bottom: 12px;
  padding: 12px;
  background: #f8fafc;
  border: 1px solid #f1f5f9;
  border-radius: 8px;
}
.rule-name-section {
  display: flex;
  align-items: center;
  gap: 12px;
}
.rule-name-section label,
.section-heading,
.condition-row {
  color: #64748b;
  font-size: 12px;
}
.rule-name-section :deep(.ant-input) {
  width: 240px;
}
.section-heading {
  justify-content: space-between;
  margin-bottom: 8px;
}
.section-heading small,
.condition-row small {
  margin-left: 4px;
  color: #cbd5e1;
  font-size: 12px;
}
.condition-row {
  gap: 8px;
  margin-top: 8px;
}
.condition-row :deep(.ant-select) {
  width: 150px;
}
.empty-condition {
  padding: 4px 0;
  color: #94a3b8;
  font-size: 12px;
}
.node-section {
  padding-top: 2px;
}
.node-heading {
  justify-content: flex-start;
}
.node-list {
  display: grid;
}
.node-card {
  min-height: 50px;
  padding: 10px 12px;
  gap: 12px;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  transition:
    background 0.15s,
    border-color 0.15s;
}
.node-card.node-error {
  background: #fff1f0;
  border-color: #ff4d4f;
}
.node-card.drop-before {
  border-top: 2px solid #1677ff;
}
.node-card.drop-after {
  border-bottom: 2px solid #1677ff;
}
.node-number {
  display: inline-grid;
  flex: none;
  width: 22px;
  height: 22px;
  color: #fff;
  font-size: 11px;
  background: #1677ff;
  border-radius: 50%;
  place-items: center;
}
.node-content {
  flex: 1;
  gap: 8px;
  min-width: 0;
  color: #64748b;
  font-size: 12px;
}
.node-content :deep(.ant-select) {
  width: 180px;
}
.drag-handle {
  display: inline-flex;
  padding: 4px;
  color: #94a3b8;
  cursor: grab;
  border-radius: 4px;
}
.drag-handle:hover {
  color: #1677ff;
  background: #e6f4ff;
}
.drag-handle:active {
  cursor: grabbing;
}
.node-arrow {
  height: 18px;
  color: #cbd5e1;
  line-height: 18px;
  text-align: center;
}
.add-node-button {
  margin-top: 12px;
}
.editor-footer {
  justify-content: space-between;
  gap: 16px;
  margin-top: 16px;
  padding-top: 12px;
  color: #94a3b8;
  font-size: 12px;
  border-top: 1px solid #f1f5f9;
}
@media (max-width: 900px) {
  .config-layout {
    grid-template-columns: 1fr;
  }
  .condition-row,
  .node-card,
  .editor-footer {
    align-items: flex-start;
    flex-wrap: wrap;
  }
  .rule-name-section :deep(.ant-input),
  .condition-row :deep(.ant-select),
  .node-content :deep(.ant-select) {
    width: 100%;
  }
}
</style>
