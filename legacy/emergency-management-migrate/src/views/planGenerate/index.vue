<script setup lang="ts">
import {
  ArrowLeftOutlined,
  CheckCircleOutlined,
  DeleteOutlined,
  DownOutlined,
  EditOutlined,
  ExclamationCircleOutlined,
  FileDoneOutlined,
  FileTextOutlined,
  HolderOutlined,
  LoadingOutlined,
  ApartmentOutlined,
  SaveOutlined,
  ThunderboltOutlined,
} from "@ant-design/icons-vue";
import { message, Modal } from "ant-design-vue";
import moment from "moment";
import { computed, nextTick, onActivated, onBeforeUnmount, onDeactivated, reactive, shallowRef, watch } from "vue";
import { onBeforeRouteLeave, onBeforeRouteUpdate, useRoute, useRouter } from "vue-router";

import { decomposeEmergencyPlanTasks, type EmergencyPlanTaskDraft } from "@ghcloud/cube-services-client/emergency-plan-ai.client";

import { parsePlanDraftState, type PlanDraftState } from "./planDraft";
import { createPlanDraftRecovery } from "./planDraftRecovery";
import { usePlanDraft } from "./usePlanDraft";
import {
  addPlanDocument,
  fileTypeList,
  geteventtypes,
  getPlanGenerateFlowDictionary,
  planDocumentDetail,
  runPlanWorkflow,
  savePlanDocumentDraft,
  startEmergencyFileRevision,
} from "@/api/emergency";
import GeneratedAttachmentUpload from "@/views/planDocuments/GeneratedAttachmentUpload.vue";
import { clonePlanTasks, normalizeStoredPlanTasks, toApprovalTasks, validatePlanTasks } from "@/views/planDocuments/planTask";
import PlanTaskEditor from "@/views/planDocuments/PlanTaskEditor.vue";
import { sanitizeRichText } from "@/views/planDocuments/richText";
import type { RevisionStartResult, RevisionTodoItem } from "@/views/workflow/revision/revision-todo-types";

type PlanForm = {
  name: string;
  fileType: string;
  level: string;
  expirationDate: string;
  eventCategory: string;
  remark: string;
};

type GeneratedPlan = {
  title: string;
  metadata: string;
  contentHtml: string;
  wordCount: number;
  missingInfo: string[];
};

type ComplianceIssue = {
  type: "severe" | "warning" | "pass";
  title: string;
  desc: string;
  section?: string;
};

type ComplianceRule = {
  ruleName?: string;
  severity?: string;
  passed?: boolean;
  finding?: string;
  suggestion?: string;
};

type ComplianceDimension = {
  code: string;
  name: string;
  score: number;
};

type ComplianceResult = {
  totalScore: number;
  status: string;
  summary: string;
  dimensions: ComplianceDimension[];
  issues: ComplianceIssue[];
};

type RichTextCommand = "bold" | "italic" | "underline" | "insertUnorderedList" | "insertOrderedList";

type MenuItem = {
  id?: string | number;
  code?: string | number;
  value?: string | number;
  name?: string;
  label?: string;
};

type SelectOption = {
  label: string;
  value: string;
};

type ExistingContentFile = {
  id: string | number;
  name: string;
  path?: string;
  url?: string;
};

type PlanDetailForEditor = {
  status?: string;
  name?: string | null;
  emergencyFileTypeId?: string | number | null;
  emergencyFileTypeName?: string;
  levelCode?: string | null;
  expirationDate?: string | null;
  emergencyEventTypeCode?: string | null;
  emergencyEventTypeName?: string;
  remark?: string | null;
  contentHtml?: string | null;
  contentFileIds?: string | null;
  contentFileVOS?: ExistingContentFile[];
  documentFileId?: string | null;
  processFileId?: string | null;
  tasks?: unknown;
  complianceCheckResultJson?: string | null;
  draftStateJson?: string | null;
};

type RetainedFileFields = {
  documentFileId?: string | null;
  processFileId?: string | null;
};

const levelOptions = [
  { label: "普通", value: "ORDINARY" },
  { label: "重要", value: "IMPORTANT" },
];

const generationSteps = ["信息录入", "生成预案", "编辑修改", "合规检查", "任务拆解", "保存提交"];
const generateStages = ["模板匹配", "内容生成", "知识增强", "格式整理"];
const aiFlowDictionaryItemCode = "BUSINESS_AI_FLOW";
const planGenerateFlowDictionaryCode = "PLAN_GEN_AI_FLOW";
const route = useRoute();
const router = useRouter();
const editingPlanId = computed(() => {
  const id = Array.isArray(route.query.id) ? route.query.id[0] : route.query.id;
  return route.query.type === "edit" && id ? String(id) : "";
});
const editingRevisionId = computed(() => {
  const revisionId = Array.isArray(route.query.revisionId) ? route.query.revisionId[0] : route.query.revisionId;
  return route.query.type === "edit" && revisionId ? String(revisionId) : "";
});
const editingBaseVersionText = computed(() => {
  const versionText = Array.isArray(route.query.baseVersionText) ? route.query.baseVersionText[0] : route.query.baseVersionText;
  return editingRevisionId.value && versionText ? String(versionText) : "";
});
const editingRevisionLockToken = computed(() => {
  const lockToken = Array.isArray(route.query.lockToken) ? route.query.lockToken[0] : route.query.lockToken;
  return editingRevisionId.value && lockToken ? String(lockToken) : "";
});
const revisionBaseVersionText = computed(() => `修订基于版本：${editingBaseVersionText.value || "--"}`);
const isEditing = computed(() => Boolean(editingPlanId.value));
const revisionItems = shallowRef<RevisionTodoItem[]>([]);
const handledRevisionIds = shallowRef<string[]>([]);
const revisionLockActive = shallowRef(false);
const revisionTypeLabels: Record<RevisionTodoItem["revisionType"], string> = {
  FORCED: "强制",
  REJECTED: "驳回",
  SUGGESTED: "建议",
  PERIODIC: "定期",
};
const handledRevisionCount = computed(() => {
  const handledIds = new Set(handledRevisionIds.value);
  return revisionItems.value.filter((item) => handledIds.has(item.id)).length;
});
const revisionHeartbeatInterval = 5_000;
let revisionHeartbeatTimer: number | undefined;

const form = reactive<PlanForm>({
  name: "",
  fileType: "",
  level: "",
  expirationDate: "",
  eventCategory: "",
  remark: "",
});

const touched = reactive({
  name: false,
  fileType: false,
  level: false,
  eventCategory: false,
});

const currentStep = shallowRef(1);
const isTaskPage = computed(() => currentStep.value >= 5);
const generating = shallowRef(false);
const stageIndex = shallowRef(0);
const editMode = shallowRef(false);
const planGenerated = shallowRef(false);
const complianceChecked = shallowRef(false);
const complianceScore = shallowRef(0);
const complianceStatus = shallowRef("");
const complianceSummary = shallowRef("");
const checking = shallowRef(false);
const complianceDimensions = shallowRef<ComplianceDimension[]>([]);
const complianceIssues = shallowRef<ComplianceIssue[]>([]);
const generatedPlan = shallowRef<GeneratedPlan | null>(null);
const planContentElement = shallowRef<HTMLElement | null>(null);
const editorWordCount = shallowRef(0);
const editorContentDirty = shallowRef(false);
const contentFileIds = shallowRef("");
const existingContentFiles = shallowRef<ExistingContentFile[]>([]);
const retainedFileFields = shallowRef<RetainedFileFields>({});
const hydratingExistingPlan = shallowRef(false);
const attachmentUploadKey = shallowRef(0);
const loadedPlanStatus = shallowRef("");
const pageReady = shallowRef(false);
const pageActive = shallowRef(true);
const draftRestoreError = shallowRef("");
const attachmentUploading = shallowRef(false);
const submitted = shallowRef(false);
const submissionPreparing = shallowRef(false);
const promotingDraft = shallowRef(false);
const editorLocked = computed(
  () =>
    !pageReady.value ||
    Boolean(draftRestoreError.value) ||
    saveLoading.value ||
    submissionPreparing.value ||
    promotingDraft.value ||
    submitted.value,
);
const editorContentRevision = shallowRef(0);
const draftSupported = computed(() => !editingRevisionId.value && (!editingPlanId.value || loadedPlanStatus.value === "DRAFT"));
const isRevision = computed(() => isEditing.value && loadedPlanStatus.value !== "DRAFT");
let pageSession = 0;
let internalDraftId = "";
const saveModalVisible = shallowRef(false);
const saveLoading = shallowRef(false);
const severeIssuesExpanded = shallowRef(false);
const warningIssuesExpanded = shallowRef(false);
const fileTypeOptions = shallowRef<SelectOption[]>([]);
const eventCategoryOptions = shallowRef<SelectOption[]>([]);
const planTasks = shallowRef<EmergencyPlanTaskDraft[]>([]);
const taskCandidates = shallowRef<EmergencyPlanTaskDraft[]>([]);
const decomposingTasks = shallowRef(false);
const taskDrawerVisible = shallowRef(false);
const taskDrawerMode = shallowRef<"candidates" | "accepted">("candidates");
const editingCandidateKey = shallowRef<string | null>(null);
const draggingPlanTaskIndex = shallowRef<number | null>(null);
const taskWarnings = shallowRef<string[]>([]);
const taskAdoptModalVisible = shallowRef(false);
const taskCandidateForAdoption = shallowRef<EmergencyPlanTaskDraft | null>(null);
const taskAdoptStepsText = shallowRef("");
const taskAdoptEquipmentText = shallowRef("");

const typeLabel = computed(() => fileTypeOptions.value.find((item) => item.value === form.fileType)?.label || "");
const eventCategoryLabel = computed(() => eventCategoryOptions.value.find((item) => item.value === form.eventCategory)?.label || "");
const levelLabel = computed(() => levelOptions.find((item) => item.value === form.level)?.label || "");
const requiredInvalid = computed(() => ({
  name: touched.name && !form.name.trim(),
  fileType: touched.fileType && !form.fileType,
  level: touched.level && !form.level,
  eventCategory: touched.eventCategory && !form.eventCategory,
}));
const contentWordCount = computed(() => (editorContentDirty.value ? editorWordCount.value : generatedPlan.value?.wordCount || 0));
const complianceLevel = computed<ComplianceIssue["type"]>(() => {
  if (complianceScore.value >= 85) {
    return "pass";
  }
  return complianceScore.value >= 70 ? "warning" : "severe";
});
const complianceStrokeColor = computed(
  () =>
    (
      ({
        pass: "#22c55e",
        warning: "#f59e0b",
        severe: "#ef4444",
      }) as Record<ComplianceIssue["type"], string>
    )[complianceLevel.value],
);
const complianceStatusText = computed(
  () =>
    complianceStatus.value ||
    (
      {
        pass: "已通过",
        warning: "有警告",
        severe: "未通过",
      } as Record<ComplianceIssue["type"], string>
    )[complianceLevel.value],
);
const complianceCounts = computed(() => ({
  severe: complianceIssues.value.filter((issue) => issue.type === "severe").length,
  warning: complianceIssues.value.filter((issue) => issue.type === "warning").length,
}));
const severeComplianceIssues = computed(() => complianceIssues.value.filter((issue) => issue.type === "severe"));
const warningComplianceIssues = computed(() => complianceIssues.value.filter((issue) => issue.type === "warning"));
const taskSourceText = (task: EmergencyPlanTaskDraft) =>
  task.sourceType === "TEMPLATE" ? `知识库 · ${task.templateName || "模板匹配"}` : task.sourceType === "MANUAL" ? "手动创建" : "AI生成";
const taskDurationText = (task: EmergencyPlanTaskDraft) =>
  task.durationMinutes === null ? "未设置时限" : task.durationMinutes === 0 ? "立即执行" : `${task.durationMinutes} 分钟`;
const taskExecutorText = (task: EmergencyPlanTaskDraft) => {
  const executorTypes = [
    ...new Set(task.executors.filter((executor) => /^\d+$/.test(executor.executorId.trim())).map((executor) => executor.executorType)),
  ];
  const labels = executorTypes.map(
    (type) =>
      (
        ({
          DEPARTMENT: "部门",
          ROLE: "角色",
          POST: "岗位",
          PERSON: "人员",
        }) as const
      )[type],
  );
  return labels.length ? `已配置${labels.join("、")}` : "未匹配到人员";
};
const taskDrawerTitle = computed(() => (taskDrawerMode.value === "candidates" ? "编辑待采纳任务" : "编辑任务流程"));
const editingCandidate = computed<EmergencyPlanTaskDraft[]>({
  get: () => taskCandidates.value.filter((task) => task.clientKey === editingCandidateKey.value),
  set: ([updated]) => {
    if (!updated || updated.clientKey !== editingCandidateKey.value) {
      return;
    }
    taskCandidates.value = taskCandidates.value.map((task) => (task.clientKey === editingCandidateKey.value ? updated : task));
  },
});
const normalizeMenuOptions = (value: unknown, valueKeys: Array<keyof MenuItem>): SelectOption[] => {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.flatMap((entry) => {
    const item = entry as MenuItem;
    const itemValue = valueKeys.map((key) => item[key]).find((field) => field !== undefined && field !== null);
    const label = item.name || item.label;
    return label && itemValue !== undefined ? [{ label, value: String(itemValue) }] : [];
  });
};

const loadMenuOptions = async () => {
  try {
    const [fileTypes, eventCategories] = await Promise.all([fileTypeList(), geteventtypes()]);
    fileTypeOptions.value = normalizeMenuOptions(fileTypes, ["id", "value", "code"]);
    eventCategoryOptions.value = normalizeMenuOptions(eventCategories, ["code", "value", "id"]);
  } catch {
    message.error("菜单配置加载失败");
  }
};

const resetForm = () => {
  Object.assign(form, {
    name: "",
    fileType: "",
    level: "",
    expirationDate: "",
    eventCategory: "",
    remark: "",
  });
  Object.assign(touched, {
    name: false,
    fileType: false,
    level: false,
    eventCategory: false,
  });
  generatedPlan.value = null;
  editorWordCount.value = 0;
  editorContentDirty.value = false;
  planGenerated.value = false;
  complianceChecked.value = false;
  complianceScore.value = 0;
  complianceStatus.value = "";
  complianceSummary.value = "";
  complianceDimensions.value = [];
  complianceIssues.value = [];
  editMode.value = false;
  saveModalVisible.value = false;
  saveLoading.value = false;
  submissionPreparing.value = false;
  currentStep.value = 1;
  contentFileIds.value = "";
  existingContentFiles.value = [];
  retainedFileFields.value = {};
  attachmentUploadKey.value += 1;
  planTasks.value = [];
  taskCandidates.value = [];
  taskWarnings.value = [];
  taskDrawerVisible.value = false;
  taskDrawerMode.value = "candidates";
  editingCandidateKey.value = null;
  taskAdoptModalVisible.value = false;
  taskCandidateForAdoption.value = null;
  taskAdoptStepsText.value = "";
  taskAdoptEquipmentText.value = "";
  generating.value = false;
  checking.value = false;
  decomposingTasks.value = false;
  attachmentUploading.value = false;
};

const handleBack = () => {
  router.push("/planDocument/list");
};

const validateForm = () => {
  touched.name = true;
  touched.fileType = true;
  touched.level = true;
  touched.eventCategory = true;
  return Boolean(form.name.trim() && form.fileType && form.level && form.eventCategory);
};

const generatePlan = async () => {
  if (generating.value) {
    return;
  }
  if (!validateForm()) {
    message.error("请填写所有必填项后再生成预案");
    return;
  }
  const session = pageSession;
  generating.value = true;
  stageIndex.value = 0;
  currentStep.value = 2;
  const stageTimer = window.setInterval(() => {
    if (session !== pageSession) {
      window.clearInterval(stageTimer);
      return;
    }
    stageIndex.value = Math.min(stageIndex.value + 1, generateStages.length - 1);
  }, 700);
  try {
    const planFlowId = await getPlanWorkflowId("gen", "预案生成");
    if (session !== pageSession) {
      return;
    }
    const response = await runPlanWorkflow(planFlowId, {
      input: buildWorkflowInput(),
      inputType: "chat",
      outputType: "chat",
    });
    if (session !== pageSession) {
      return;
    }
    const result = extractGeneratedPlan(response);
    if (!result) {
      message.error("工作流返回格式不正确");
      return;
    }
    generatedPlan.value = {
      ...result,
      contentHtml: sanitizeRichText(result.contentHtml),
    };
    editorWordCount.value = result.wordCount;
    editorContentDirty.value = false;
    planGenerated.value = true;
    complianceChecked.value = false;
    complianceScore.value = 0;
    complianceStatus.value = "";
    complianceSummary.value = "";
    complianceDimensions.value = [];
    complianceIssues.value = [];
    planTasks.value = [];
    taskCandidates.value = [];
    taskWarnings.value = [];
    editMode.value = false;
    currentStep.value = 3;
    message.success("预案生成完成");
  } catch (error) {
    if (session !== pageSession) {
      return;
    }
    const configMessage = readWorkflowConfigError(error, "预案生成");
    const timeoutMessage = isRequestTimeout(error) ? "预案生成超时，请稍后重试" : "";
    message.error(configMessage || timeoutMessage || "预案生成失败，请稍后重试");
  } finally {
    window.clearInterval(stageTimer);
    if (session === pageSession) generating.value = false;
  }
};

const runCompliance = async () => {
  if (!planGenerated.value || !generatedPlan.value) {
    message.warning("请先生成预案");
    return;
  }
  if (checking.value) {
    return;
  }
  syncContentFromEditor();
  const session = pageSession;
  checking.value = true;
  currentStep.value = 4;
  try {
    const checkFlowId = await getPlanWorkflowId("check", "合规检查");
    if (session !== pageSession) {
      return;
    }
    const response = await runPlanWorkflow(checkFlowId, {
      input: buildComplianceInput(),
      inputType: "chat",
      outputType: "chat",
    });
    if (session !== pageSession) {
      return;
    }
    const result = extractComplianceResult(response);
    if (!result) {
      message.error("合规检查工作流返回格式不正确");
      return;
    }
    complianceScore.value = result.totalScore;
    complianceStatus.value = result.status;
    complianceSummary.value = result.summary;
    complianceDimensions.value = result.dimensions;
    complianceIssues.value = result.issues;
    complianceChecked.value = true;
    message.success(`合规检查完成，综合评分 ${result.totalScore} 分`);
  } catch (error) {
    if (session !== pageSession) {
      return;
    }
    const configMessage = readWorkflowConfigError(error, "合规检查");
    const timeoutMessage = isRequestTimeout(error) ? "合规检查超时，请稍后重试" : "";
    message.error(configMessage || timeoutMessage || "合规检查失败，请稍后重试");
  } finally {
    if (session === pageSession) checking.value = false;
  }
};

const toggleEditMode = () => {
  if (editMode.value) {
    syncContentFromEditor();
  }
  editMode.value = !editMode.value;
  currentStep.value = editMode.value ? 3 : currentStep.value;
};

const syncContentFromEditor = () => {
  if (!editorContentDirty.value || !generatedPlan.value || !planContentElement.value) {
    return;
  }
  generatedPlan.value = {
    ...generatedPlan.value,
    contentHtml: sanitizeRichText(planContentElement.value.innerHTML),
    wordCount: editorWordCount.value,
  };
  editorContentDirty.value = false;
};

const markContentEdited = (element: HTMLElement) => {
  planContentElement.value = element;
  editorWordCount.value = (element.textContent || "").replace(/\s/g, "").length;
  editorContentDirty.value = true;
  complianceChecked.value = false;
  complianceScore.value = 0;
  complianceStatus.value = "";
  complianceSummary.value = "";
  complianceDimensions.value = [];
  complianceIssues.value = [];
  planTasks.value = [];
  taskCandidates.value = [];
  taskWarnings.value = [];
  editorContentRevision.value += 1;
};

const handleContentEdit = (event: Event) => {
  if (!generatedPlan.value) {
    return;
  }
  markContentEdited(event.target as HTMLElement);
};

const applyEditorCommand = (command: RichTextCommand) => {
  if (!editMode.value || !planContentElement.value) {
    return;
  }
  planContentElement.value.focus();
  document.execCommand(command, false);
  markContentEdited(planContentElement.value);
};

const insertEditorTable = () => {
  if (!editMode.value || !planContentElement.value) {
    return;
  }
  planContentElement.value.focus();
  document.execCommand(
    "insertHTML",
    false,
    "<table><thead><tr><th>项目</th><th>内容</th></tr></thead><tbody><tr><td>示例</td><td>示例内容</td></tr></tbody></table><p><br></p>",
  );
  markContentEdited(planContentElement.value);
};

const editComplianceIssue = () => {
  if (!editMode.value) {
    toggleEditMode();
  }
  planContentElement.value?.focus();
  message.info("请修改对应内容后重新进行合规检查");
};

const confirmTaskReplacement = () =>
  new Promise<boolean>((resolve) => {
    if (!planTasks.value.length && !taskCandidates.value.length) {
      resolve(true);
      return;
    }
    Modal.confirm({
      title: "重新拆解任务",
      content: "重新拆解会替换当前任务草稿，是否继续？",
      okText: "继续拆解",
      cancelText: "取消",
      onOk: () => resolve(true),
      onCancel: () => resolve(false),
    });
  });

const runTaskDecomposition = async () => {
  if (!generatedPlan.value || decomposingTasks.value) {
    return;
  }
  if (!complianceChecked.value) {
    message.warning("请先完成合规检查");
    return;
  }
  syncContentFromEditor();
  const session = pageSession;
  if (!(await confirmTaskReplacement()) || session !== pageSession) {
    return;
  }
  try {
    decomposingTasks.value = true;
    const result = await decomposeEmergencyPlanTasks({
      sourceType: "RICH_TEXT",
      contentHtml: generatedPlan.value.contentHtml,
      fileName: `${form.name.trim() || "应急预案"}.docx`,
      planContext: {
        name: form.name.trim(),
        levelCode: form.level,
        fileTypeName: typeLabel.value,
        emergencyEventTypeCode: form.eventCategory,
        emergencyEventTypeName: eventCategoryLabel.value,
      },
    });
    if (session !== pageSession) {
      return;
    }
    planTasks.value = [];
    taskCandidates.value = result.tasks;
    taskWarnings.value = result.warnings;
    taskDrawerMode.value = "candidates";
    taskDrawerVisible.value = false;
    currentStep.value = 5;
    message.success(`已拆解生成${result.tasks.length}个待采纳任务`);
  } catch (error) {
    if (session !== pageSession) {
      return;
    }
    message.error(error instanceof Error ? error.message : "任务拆解失败，请稍后重试");
  } finally {
    if (session === pageSession) decomposingTasks.value = false;
  }
};

const openTaskEditor = (mode: "candidates" | "accepted", candidate?: EmergencyPlanTaskDraft) => {
  if (mode === "candidates") {
    if (!candidate) {
      return;
    }
    editingCandidateKey.value = candidate.clientKey;
  } else {
    editingCandidateKey.value = null;
  }
  taskDrawerMode.value = mode;
  taskDrawerVisible.value = true;
};

const normalizePlanTaskSortNo = () => {
  planTasks.value = planTasks.value.map((task, index) => ({ ...task, sortNo: index + 1 }));
};

const startPlanTaskDrag = (event: DragEvent, index: number) => {
  draggingPlanTaskIndex.value = index;
  event.dataTransfer?.setData("text/plain", String(index));
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = "move";
  }
};

const dragPlanTaskOver = (event: DragEvent, targetIndex: number) => {
  event.preventDefault();
  const sourceIndex = draggingPlanTaskIndex.value;
  if (sourceIndex === null || sourceIndex === targetIndex) {
    return;
  }
  const tasks = [...planTasks.value];
  const [task] = tasks.splice(sourceIndex, 1);
  if (!task) {
    return;
  }
  tasks.splice(targetIndex, 0, task);
  planTasks.value = tasks;
  draggingPlanTaskIndex.value = targetIndex;
};

const endPlanTaskDrag = () => {
  draggingPlanTaskIndex.value = null;
  normalizePlanTaskSortNo();
};

const removePlanTask = (index: number) => {
  planTasks.value = planTasks.value.filter((_, taskIndex) => taskIndex !== index);
  normalizePlanTaskSortNo();
};

const returnToPlanPage = () => {
  currentStep.value = 4;
};

const formatTaskItems = (items: string[]) => items.map((item, index) => `${index + 1}. ${item}`).join("\n");

const readTaskItems = (value: string) =>
  value
    .split(/\n|[；;]/)
    .map((item) => item.replace(/^\s*\d+[.、)]\s*/, "").trim())
    .filter(Boolean);

const openTaskAdoptModal = (task: EmergencyPlanTaskDraft) => {
  const [candidate] = clonePlanTasks([task]);
  taskCandidateForAdoption.value = candidate || null;
  taskAdoptStepsText.value = formatTaskItems(candidate?.executionContents || []);
  taskAdoptEquipmentText.value = (candidate?.equipment || []).join("、");
  taskAdoptModalVisible.value = true;
};

const closeTaskAdoptModal = () => {
  taskAdoptModalVisible.value = false;
  taskCandidateForAdoption.value = null;
  taskAdoptStepsText.value = "";
  taskAdoptEquipmentText.value = "";
};

const adoptTask = (task: EmergencyPlanTaskDraft) => {
  planTasks.value = [...planTasks.value, ...clonePlanTasks([task])].map((item, index) => ({
    ...item,
    sortNo: index + 1,
  }));
  taskCandidates.value = taskCandidates.value.filter((candidate) => candidate.clientKey !== task.clientKey);
  currentStep.value = 5;
  message.success(`已采纳任务“${task.name || "未命名任务"}”`);
};

const confirmTaskAdoption = () => {
  const task = taskCandidateForAdoption.value;
  if (!task) {
    return;
  }
  task.executionContents = readTaskItems(taskAdoptStepsText.value);
  task.equipment = taskAdoptEquipmentText.value
    .split(/[、,，\n]/)
    .map((item) => item.trim())
    .filter(Boolean);
  adoptTask(task);
  closeTaskAdoptModal();
};

const adoptAllTasks = () => {
  if (!taskCandidates.value.length) {
    return;
  }
  planTasks.value = [...planTasks.value, ...clonePlanTasks(taskCandidates.value)].map((task, index) => ({
    ...task,
    sortNo: index + 1,
  }));
  const adoptedCount = taskCandidates.value.length;
  taskCandidates.value = [];
  taskDrawerVisible.value = false;
  currentStep.value = 5;
  message.success(`已采纳${adoptedCount}个任务，已生成任务流程`);
};

const openSaveModal = () => {
  if (!planGenerated.value) {
    message.warning("请先生成预案");
    return;
  }
  if (!complianceChecked.value) {
    message.warning("请先完成合规检查");
    return;
  }
  const taskError = validatePlanTasks(planTasks.value);
  if (taskError) {
    message.warning(taskError);
    taskDrawerMode.value = "accepted";
    taskDrawerVisible.value = true;
    return;
  }
  syncContentFromEditor();
  severeIssuesExpanded.value = false;
  warningIssuesExpanded.value = false;
  saveModalVisible.value = true;
};

const closeSaveModal = () => {
  if (saveLoading.value || submissionPreparing.value) {
    return;
  }
  saveModalVisible.value = false;
};

const buildComplianceCheckResultJson = () => {
  if (!complianceChecked.value) {
    return null;
  }
  return JSON.stringify({
    totalScore: complianceScore.value,
    status: complianceStatus.value,
    summary: complianceSummary.value,
    dimensions: complianceDimensions.value,
    issues: complianceIssues.value,
  });
};

const toDateString = (value: unknown): string => {
  const raw = String(value || "");
  if (!raw) {
    return "";
  }
  if (/^\d{10}$/.test(raw)) {
    return moment.unix(Number(raw)).format("YYYY-MM-DD");
  }
  if (/^\d{13}$/.test(raw)) {
    return moment(Number(raw)).format("YYYY-MM-DD");
  }
  const date = moment(raw);
  return date.isValid() ? date.format("YYYY-MM-DD") : "";
};

// 序列化只读取编辑器 DOM，不更新 v-html，避免保存时打断光标和选区。
const readEditorHtml = () =>
  sanitizeRichText(
    editorContentDirty.value && planContentElement.value ? planContentElement.value.innerHTML : generatedPlan.value?.contentHtml || "",
  );

const captureDraftState = (): PlanDraftState => ({
  schemaVersion: 1,
  currentStep: generating.value ? (planGenerated.value ? 3 : 1) : currentStep.value,
  editMode: editMode.value,
  planGenerated: planGenerated.value,
  generatedPlanMetadata: generatedPlan.value
    ? { title: generatedPlan.value.title, metadata: generatedPlan.value.metadata, missingInfo: generatedPlan.value.missingInfo }
    : null,
  planTasks: planTasks.value,
  taskCandidates: taskCandidates.value,
  taskWarnings: taskWarnings.value,
  taskDrawer: { visible: taskDrawerVisible.value, mode: taskDrawerMode.value, editingCandidateKey: editingCandidateKey.value },
  taskAdoption: {
    visible: taskAdoptModalVisible.value,
    candidate: taskCandidateForAdoption.value,
    stepsText: taskAdoptStepsText.value,
    equipmentText: taskAdoptEquipmentText.value,
  },
});

const buildFilePayload = (forDraft: boolean) => {
  const expirationDate = toDateString(form.expirationDate);
  return {
    ...retainedFileFields.value,
    name: forDraft ? form.name : form.name.trim(),
    emergencyFileTypeId: form.fileType || null,
    levelCode: form.level || null,
    expirationDate: expirationDate ? `${expirationDate}T23:59:59` : null,
    emergencyEventTypeCode: form.eventCategory || null,
    remark: forDraft ? form.remark : form.remark.trim(),
    contentHtml: readEditorHtml(),
    contentFileIds: contentFileIds.value || null,
    generated: planGenerated.value,
    complianceCheckResultJson: buildComplianceCheckResultJson(),
  };
};

const captureDraft = () => ({ file: buildFilePayload(true), draftStateJson: JSON.stringify(captureDraftState()) });

const buildSavePayload = () => ({
  ...(draft.id.value || editingPlanId.value ? { id: draft.id.value || editingPlanId.value } : {}),
  ...(editingRevisionId.value
    ? { emergencyFileRevisionIds: handledRevisionIds.value, revisionLockToken: editingRevisionLockToken.value }
    : {}),
  file: buildFilePayload(false),
  tasks: toApprovalTasks(planTasks.value),
  ...(draftSupported.value ? { draftStateJson: JSON.stringify(captureDraftState()) } : {}),
});

const confirmSavePlan = async () => {
  if (!generatedPlan.value || saveLoading.value || submissionPreparing.value || !pageReady.value || draftRestoreError.value) {
    return;
  }
  if (!recovery.isCurrentScope()) {
    message.error("租户或账号已切换，请重新进入预案页面");
    return;
  }
  if (attachmentUploading.value || generating.value || checking.value || decomposingTasks.value) {
    message.warning("请等待附件上传和预案处理完成后再提交");
    return;
  }
  if (!validateForm()) {
    message.warning("请补全必填信息后再提交审批");
    return;
  }
  if (editingRevisionId.value && !revisionLockActive.value) {
    message.error("预案修订锁已失效，请返回修订待办后重新进入");
    return;
  }
  if (editingRevisionId.value && handledRevisionIds.value.length === 0) {
    message.warning("请勾选本次已处理的修订内容");
    return;
  }
  if (!complianceChecked.value) {
    message.warning("请先完成合规检查");
    return;
  }
  if (!/^\d+$/.test(form.fileType)) {
    message.warning("文件类型数据无效，请重新选择后保存");
    return;
  }
  const taskError = validatePlanTasks(planTasks.value);
  if (taskError) {
    message.warning(taskError);
    taskDrawerMode.value = "accepted";
    taskDrawerVisible.value = true;
    return;
  }
  syncContentFromEditor();
  const session = pageSession;
  submissionPreparing.value = true;
  try {
    if (!(await draft.wait())) {
      message.error(draft.error.value || "草稿保存请求失败，请重试后提交");
      return;
    }
    if (session !== pageSession) {
      return;
    }
    saveLoading.value = true;
    const result = await addPlanDocument(buildSavePayload());
    if (session !== pageSession) {
      return;
    }
    if (result === undefined || result === null) throw new Error("未收到提交结果");
    submitted.value = true;
    recovery.clear(recoveryKey);
    draft.invalidate();
    stopRevisionHeartbeat();
    saveModalVisible.value = false;
    currentStep.value = 6;
    message.success(isRevision.value ? `预案'${form.name.trim()}'修订已提交审批` : `预案'${form.name.trim()}'已提交审批`, 1.5, () => {
      router.push("/planApproval/list");
    });
  } catch {
    if (session !== pageSession) {
      return;
    }
    if (editingRevisionId.value && (await refreshRevisionContext())) {
      scheduleRevisionHeartbeat();
    }
    message.error("保存预案失败，请稍后重试");
  } finally {
    if (session === pageSession) {
      saveLoading.value = false;
      submissionPreparing.value = false;
      if (!submitted.value) draft.changed();
    }
  }
};

const buildWorkflowInput = () => {
  return [
    `文件名称：${form.name.trim()}`,
    `文件类型：${typeLabel.value.replace(/类$/, "")}`,
    `文件级别：${levelLabel.value}`,
    `事件分类：${eventCategoryLabel.value}`,
    `到期日期：${formatPromptDate(form.expirationDate)}`,
    `文件描述：${form.remark.trim() || "无"}`,
    `编制日期：${currentPromptDate()}`,
  ].join(" ");
};

const formatPromptDate = (value: string) => (value ? value.replaceAll("-", "/") : "未设置");
const currentPromptDate = () => {
  const currentDate = new Date();
  const localDate = new Date(currentDate.getTime() - currentDate.getTimezoneOffset() * 60 * 1000);
  return formatPromptDate(localDate.toISOString().slice(0, 10));
};

const buildComplianceInput = () => {
  const plan = generatedPlan.value;
  return [
    "请对以下应急预案进行合规性检查，并依据知识库中的《应急预案合规检查标准》输出检查结果。",
    "【文件名称】",
    form.name.trim(),
    "【预案标题】",
    plan?.title || form.name.trim(),
    "【预案类型】",
    "专项应急预案",
    "【事件类别】",
    `${typeLabel.value.replace(/类$/, "")}-${eventCategoryLabel.value}`,
    "【预案正文】",
    plan?.contentHtml || "",
  ].join("\n");
};

const getPlanWorkflowId = async (key: "gen" | "check", actionName: string) => {
  const dictionary = (await getPlanGenerateFlowDictionary({
    itemCode: aiFlowDictionaryItemCode,
    code: planGenerateFlowDictionaryCode,
  })) as { variable?: string } | null;
  if (!dictionary?.variable) {
    throw new Error(`未配置${actionName}工作流`);
  }
  try {
    const exactFlowIdConfig = dictionary.variable.replace(/("(?:gen|check)"\s*:\s*)(\d+)(?=\s*[,}])/g, '$1"$2"');
    const flowConfig = JSON.parse(exactFlowIdConfig) as { gen?: unknown; check?: unknown };
    const flowId = typeof flowConfig[key] === "string" ? flowConfig[key].trim() : "";
    if (!/^\d+$/.test(flowId)) {
      throw new Error(`未配置${actionName}工作流`);
    }
    return flowId;
  } catch (error) {
    if (error instanceof Error && error.message === `未配置${actionName}工作流`) {
      throw error;
    }
    throw new Error(`${actionName}工作流配置格式错误`);
  }
};

const extractGeneratedPlan = (value: unknown): GeneratedPlan | null => {
  if (typeof value === "string") {
    try {
      return extractGeneratedPlan(JSON.parse(value.replace(/^```json\s*|\s*```$/g, "")));
    } catch {
      return null;
    }
  }
  if (!value || typeof value !== "object") {
    return null;
  }
  const item = value as Record<string, unknown>;
  if (typeof item.contentHtml === "string") {
    return {
      title: typeof item.title === "string" ? item.title : form.name.trim(),
      metadata: typeof item.metadata === "string" ? item.metadata : "",
      contentHtml: item.contentHtml,
      wordCount: typeof item.wordCount === "number" ? item.wordCount : item.contentHtml.replace(/<[^>]*>/g, "").length,
      missingInfo: Array.isArray(item.missingInfo) ? item.missingInfo.filter((entry): entry is string => typeof entry === "string") : [],
    };
  }
  for (const candidate of Object.values(item)) {
    const result = extractGeneratedPlan(candidate);
    if (result) {
      return result;
    }
  }
  return null;
};

const extractComplianceResult = (value: unknown): ComplianceResult | null => {
  if (typeof value === "string") {
    try {
      return extractComplianceResult(JSON.parse(value.replace(/^```json\s*|\s*```$/g, "")));
    } catch {
      return null;
    }
  }
  if (Array.isArray(value)) {
    return value.map(extractComplianceResult).find(Boolean) || null;
  }
  if (!value || typeof value !== "object") {
    return null;
  }
  const item = value as Record<string, unknown>;
  if (typeof item.totalScore === "number" && Array.isArray(item.dimensions) && Array.isArray(item.issues)) {
    return {
      totalScore: Math.max(0, Math.min(100, item.totalScore)),
      status: typeof item.status === "string" ? item.status : "",
      summary: typeof item.summary === "string" ? item.summary : "",
      dimensions: item.dimensions.flatMap((dimension) => {
        const entry = dimension as Record<string, unknown>;
        return typeof entry.name === "string" && typeof entry.score === "number"
          ? [{ code: typeof entry.code === "string" ? entry.code : "", name: entry.name, score: entry.score }]
          : [];
      }),
      issues: item.issues.flatMap((issue) => {
        const entry = issue as Record<string, unknown>;
        return typeof entry.type === "string" && typeof entry.title === "string" && typeof entry.desc === "string"
          ? [
              {
                type: entry.type === "severe" || entry.type === "pass" ? entry.type : "warning",
                title: entry.title,
                desc: entry.desc,
                section: typeof entry.section === "string" ? entry.section : "",
              },
            ]
          : [];
      }),
    };
  }
  const checkResult = item.checkResult as Record<string, unknown> | undefined;
  const dimensions = item.dimensions;
  if (checkResult && typeof checkResult.totalScore === "number" && Array.isArray(dimensions)) {
    const complianceDimensions = dimensions.map((dimension) => {
      const entry = dimension as Record<string, unknown>;
      return {
        code: typeof entry.dimensionCode === "string" ? entry.dimensionCode : "",
        name: typeof entry.dimensionName === "string" ? entry.dimensionName : "未命名维度",
        score: typeof entry.score === "number" ? Math.max(0, Math.min(100, Number(entry.score.toFixed(2)))) : 0,
      };
    });
    const failedRules = dimensions.flatMap((dimension) => {
      const entry = dimension as { dimensionName?: string; rules?: unknown[] };
      const rules = Array.isArray(entry.rules) ? entry.rules : [];
      return rules
        .filter((rule) => (rule as ComplianceRule).passed === false)
        .map((rule) => ({ rule: rule as ComplianceRule, section: entry.dimensionName || "" }));
    });
    const summary = typeof checkResult.summary === "string" ? checkResult.summary : "";
    return {
      totalScore: Math.max(0, Math.min(100, Number(checkResult.totalScore.toFixed(2)))),
      status: typeof checkResult.status === "string" ? checkResult.status : "",
      summary,
      dimensions: complianceDimensions,
      issues: failedRules.length
        ? failedRules.map(({ rule, section }) => ({
            type: rule.severity === "严重" ? "severe" : "warning",
            title: rule.ruleName || "未通过检查项",
            desc: rule.suggestion ? `${rule.finding || ""} 建议：${rule.suggestion}`.trim() : rule.finding || "",
            section,
          }))
        : [{ type: "pass", title: "所有检查项均已通过", desc: summary }],
    };
  }
  for (const candidate of Object.values(item)) {
    const result = extractComplianceResult(candidate);
    if (result) {
      return result;
    }
  }
  return null;
};

const isRequestTimeout = (error: unknown) => {
  if (!error || typeof error !== "object") {
    return false;
  }
  const requestError = error as { code?: string; message?: string };
  return requestError.code === "ECONNABORTED" || Boolean(requestError.message?.toLowerCase().includes("timeout"));
};

const readWorkflowConfigError = (error: unknown, actionName: string) => {
  if (!(error instanceof Error)) {
    return "";
  }
  const configMessages = [`未配置${actionName}工作流`, `${actionName}工作流配置格式错误`];
  return configMessages.includes(error.message) ? error.message : "";
};

const restoreComplianceResult = (value: unknown) => {
  const result = extractComplianceResult(value);
  complianceChecked.value = Boolean(result);
  complianceScore.value = result?.totalScore || 0;
  complianceStatus.value = result?.status || "";
  complianceSummary.value = result?.summary || "";
  complianceDimensions.value = result?.dimensions || [];
  complianceIssues.value = result?.issues || [];
};

const applyExistingPlan = (detail: PlanDetailForEditor) => {
  try {
    loadedPlanStatus.value = detail.status || "";
    Object.assign(form, {
      name: detail.name || "",
      fileType: detail.emergencyFileTypeId == null ? "" : String(detail.emergencyFileTypeId),
      level: detail.levelCode || "",
      expirationDate: toDateString(detail.expirationDate),
      eventCategory: detail.emergencyEventTypeCode || "",
      remark: detail.remark || "",
    });
    const contentHtml = sanitizeRichText(detail.contentHtml || "");
    const wordCount = contentHtml.replace(/<[^>]*>/g, "").replace(/\s/g, "").length;
    generatedPlan.value = contentHtml
      ? {
          title: detail.name || "",
          metadata: [detail.emergencyFileTypeName, detail.levelCode, detail.emergencyEventTypeName].filter(Boolean).join(" | "),
          contentHtml,
          wordCount,
          missingInfo: [],
        }
      : null;
    editorWordCount.value = wordCount;
    editorContentDirty.value = false;
    planGenerated.value = Boolean(contentHtml);
    editMode.value = Boolean(contentHtml);
    contentFileIds.value = detail.contentFileIds || "";
    existingContentFiles.value = detail.contentFileVOS || [];
    retainedFileFields.value = {
      documentFileId: detail.documentFileId || null,
      processFileId: detail.processFileId || null,
    };
    attachmentUploadKey.value += 1;
    planTasks.value = normalizeStoredPlanTasks(detail.tasks || []);
    taskCandidates.value = [];
    taskWarnings.value = [];
    taskDrawerMode.value = "accepted";
    restoreComplianceResult(detail.complianceCheckResultJson);
    currentStep.value = contentHtml ? 3 : 1;
    if (detail.status === "DRAFT" && detail.draftStateJson) {
      const state = parsePlanDraftState(detail.draftStateJson);
      if (!state) {
        draftRestoreError.value = "草稿编辑进度格式无法识别，暂时无法编辑，请联系管理员处理。";
        return true;
      }
      planGenerated.value = state.planGenerated;
      generatedPlan.value = state.generatedPlanMetadata ? { ...state.generatedPlanMetadata, contentHtml, wordCount } : generatedPlan.value;
      editMode.value = state.editMode;
      currentStep.value = state.currentStep;
      planTasks.value = state.planTasks;
      taskCandidates.value = state.taskCandidates;
      taskWarnings.value = state.taskWarnings;
      taskDrawerMode.value = state.taskDrawer.mode;
      editingCandidateKey.value = state.taskDrawer.editingCandidateKey;
      taskDrawerVisible.value = state.taskDrawer.visible;
      taskCandidateForAdoption.value = state.taskAdoption.candidate;
      taskAdoptStepsText.value = state.taskAdoption.stepsText;
      taskAdoptEquipmentText.value = state.taskAdoption.equipmentText;
      taskAdoptModalVisible.value = state.taskAdoption.visible;
    }
    return true;
  } catch {
    message.error("预案详情恢复失败，请重试");
    return false;
  }
};

const loadExistingPlan = async (id: string, session: number) => {
  hydratingExistingPlan.value = true;
  let detail;
  try {
    detail = await planDocumentDetail(id);
    if (session !== pageSession) {
      return false;
    }
    if (!detail) throw new Error("未收到预案详情");
  } catch {
    if (session !== pageSession) {
      return false;
    }
    message.error("预案详情加载失败，请重试");
    return false;
  }
  return applyExistingPlan(detail);
};

const stopRevisionHeartbeat = (): void => {
  if (revisionHeartbeatTimer !== undefined) {
    window.clearInterval(revisionHeartbeatTimer);
    revisionHeartbeatTimer = undefined;
  }
};

const scheduleRevisionHeartbeat = (): void => {
  stopRevisionHeartbeat();
  revisionHeartbeatTimer = window.setInterval(() => {
    void refreshRevisionContext();
  }, revisionHeartbeatInterval);
};

const refreshRevisionContext = async (): Promise<boolean> => {
  if (!editingRevisionId.value || !editingRevisionLockToken.value) {
    return false;
  }
  const session = pageSession;
  try {
    const context = (await startEmergencyFileRevision(editingRevisionId.value, editingRevisionLockToken.value)) as RevisionStartResult;
    if (session !== pageSession) {
      return false;
    }
    revisionItems.value = context.revisions;
    const availableIds = new Set(context.revisions.map((item) => item.id));
    handledRevisionIds.value = handledRevisionIds.value.filter((id) => availableIds.has(id));
    revisionLockActive.value = true;
    return true;
  } catch {
    if (session !== pageSession) {
      return false;
    }
    revisionLockActive.value = false;
    stopRevisionHeartbeat();
    return false;
  }
};

const recovery = createPlanDraftRecovery<ReturnType<typeof captureDraft>>();
let recoveryKey = editingPlanId.value || "new";

const updateDraftRoute = async (id: string) => {
  loadedPlanStatus.value = "DRAFT";
  internalDraftId = id;
  promotingDraft.value = true;
  try {
    await router.replace({ path: route.path, query: { ...route.query, type: "edit", id } });
  } finally {
    internalDraftId = "";
    promotingDraft.value = false;
  }
};

const draft = usePlanDraft({
  enabled: () =>
    pageActive.value &&
    pageReady.value &&
    draftSupported.value &&
    !saveLoading.value &&
    !submitted.value &&
    !draftRestoreError.value &&
    recovery.isCurrentScope(),
  capture: captureDraft,
  persist: async (payload) => {
    if (!recovery.isCurrentScope()) throw new Error("租户或账号已切换，请重新进入预案页面");
    if (payload.draftStateJson.length > 2_000_000) throw new Error("草稿编辑内容过大，请减少任务内容后重试");
    return recovery.persist(recoveryKey, payload, savePlanDocumentDraft(payload));
  },
  onCreated: updateDraftRoute,
});
const draftSaving = draft.saving;
const draftSaveText = computed(() => {
  if (!pageReady.value) {
    return hydratingExistingPlan.value ? "正在加载预案" : "预案加载失败";
  }
  if (draftRestoreError.value) {
    return "草稿恢复失败";
  }
  if (!draftSupported.value) {
    return "修订内容待提交审批";
  }
  if (attachmentUploading.value) {
    return "附件上传中，完成后请保存草稿";
  }
  return { idle: "尚未保存草稿", unsaved: "有未保存的修改", saving: "正在保存草稿…", saved: "草稿已保存", error: "草稿保存失败，请重试" }[
    draft.status.value
  ];
});

const saveDraftManually = async () => {
  if (!recovery.isCurrentScope()) {
    message.error("租户或账号已切换，请重新进入预案页面");
    return;
  }
  const session = pageSession;
  const saved = await draft.save();
  if (session !== pageSession || !pageActive.value) {
    return;
  }
  if (saved) {
    if (attachmentUploading.value) {
      message.success("当前进度已保存，附件上传完成后请再次保存草稿");
    } else {
      message.success(draft.dirty.value ? "已保存本次进度，后续修改尚未保存" : "草稿已保存");
    }
  } else {
    message.error(draft.error.value || "草稿保存失败，请重试");
  }
};

const initializePage = async () => {
  const session = ++pageSession;
  const requestedId = editingPlanId.value;
  recoveryKey = requestedId || "new";
  pageReady.value = false;
  hydratingExistingPlan.value = true;
  draft.invalidate();
  stopRevisionHeartbeat();
  loadedPlanStatus.value = "";
  submitted.value = false;
  draftRestoreError.value = "";
  revisionItems.value = [];
  handledRevisionIds.value = [];
  revisionLockActive.value = false;
  resetForm();
  try {
    if (editingRevisionId.value) {
      if (!(await refreshRevisionContext()) || session !== pageSession) {
        return;
      }
      scheduleRevisionHeartbeat();
    }
    await Promise.all([loadMenuOptions(), recovery.wait(recoveryKey)]);
    if (session !== pageSession) {
      return;
    }
    const recovered = editingRevisionId.value ? null : recovery.read(recoveryKey);
    const validRecovery = !recovered || (recovered.payload.file && parsePlanDraftState(recovered.payload.draftStateJson));
    const effectiveId = requestedId || recovered?.id || "";
    const loaded = !effectiveId || (await loadExistingPlan(effectiveId, session));
    if (session !== pageSession || (!loaded && !recovered)) {
      return;
    }
    await nextTick();
    if (session !== pageSession) {
      return;
    }
    draft.reset(effectiveId);
    if (!validRecovery) {
      draftRestoreError.value = "本地恢复内容格式无法识别，暂时无法编辑，请联系管理员处理。";
    } else if (recovered && loadedPlanStatus.value && loadedPlanStatus.value !== "DRAFT") {
      draftRestoreError.value = "预案状态已变化，暂未应用本地未保存的编辑，请返回列表核对。";
    }
    if (recovered && validRecovery && (!loadedPlanStatus.value || loadedPlanStatus.value === "DRAFT")) {
      const savedFiles = new Map(existingContentFiles.value.map((file) => [String(file.id), file]));
      recovered.files.forEach((file) => savedFiles.set(String(file.id), { ...savedFiles.get(String(file.id)), ...file }));
      const recoveredIds = new Set((recovered.payload.file.contentFileIds || "").split(",").filter(Boolean));
      applyExistingPlan({
        ...recovered.payload.file,
        status: "DRAFT",
        draftStateJson: recovered.payload.draftStateJson,
        contentFileVOS: [...savedFiles.values()].filter((file) => recoveredIds.has(String(file.id))),
      });
      message.info("已恢复上次离开时未保存的编辑进度，请点击保存草稿");
    }
    await nextTick();
    if (session !== pageSession) return;
    hydratingExistingPlan.value = false;
    pageReady.value = true;
    if (recovered && draftSupported.value && !draftRestoreError.value) {
      draft.changed();
      if (draft.id.value && editingPlanId.value !== draft.id.value) {
        await updateDraftRoute(draft.id.value);
      }
    }
  } finally {
    if (session === pageSession) hydratingExistingPlan.value = false;
  }
};

const leavePage = () => {
  pageActive.value = false;
  pageReady.value = false;
  hydratingExistingPlan.value = false;
  pageSession += 1;
  draft.invalidate();
  stopRevisionHeartbeat();
};

const confirmPageLeave = async () => {
  if (saveLoading.value || submissionPreparing.value) {
    message.warning("正在提交审批，请稍候");
    return false;
  }
  if (draft.saving.value) {
    await draft.wait();
  }
  if (
    submitted.value ||
    (!draft.dirty.value && !attachmentUploading.value && !generating.value && !checking.value && !decomposingTasks.value)
  )
    return true;
  return new Promise<boolean>((resolve) => {
    Modal.confirm({
      title: "离开预案编辑？",
      content: attachmentUploading.value
        ? "附件仍在上传，离开后未完成的附件无法恢复。建议等待上传和草稿保存完成。"
        : generating.value || checking.value || decomposingTasks.value
          ? "预案处理尚未完成，离开后本次处理结果无法恢复。已保存的草稿可以继续编辑。"
          : "仍有修改未保存，离开后只能恢复上次成功保存的进度。",
      okText: "仍然离开",
      cancelText: "继续编辑",
      onOk: () => resolve(true),
      onCancel: () => resolve(false),
    });
  });
};

onBeforeRouteLeave(confirmPageLeave);
onBeforeRouteUpdate(async (to, from) => {
  if (internalDraftId && String(to.query.id) === internalDraftId) {
    return true;
  }
  if (JSON.stringify(to.query) === JSON.stringify(from.query)) {
    return true;
  }
  return confirmPageLeave();
});

// 主应用直接卸载微应用时不会触发子路由守卫，先留下当前账号、租户范围的恢复点。
const checkpointBeforeExit = () => {
  if (!pageActive.value || !pageReady.value || !draftSupported.value || submitted.value || draftRestoreError.value) return;
  draft.changed();
  if (draft.hasChanges() || (draft.saving.value && !promotingDraft.value)) {
    recovery.save(
      recoveryKey,
      captureDraft(),
      draft.id.value,
      existingContentFiles.value.map(({ id, name }) => ({ id, name })),
    );
  }
};

const beforeUnload = (event: BeforeUnloadEvent) => {
  checkpointBeforeExit();
  if (
    !pageActive.value ||
    submitted.value ||
    (!draft.dirty.value &&
      !draft.saving.value &&
      !attachmentUploading.value &&
      !generating.value &&
      !checking.value &&
      !decomposingTasks.value)
  )
    return;
  event.preventDefault();
  event.returnValue = "";
};
window.addEventListener("beforeunload", beforeUnload);
onDeactivated(() => {
  checkpointBeforeExit();
  leavePage();
});
onActivated(() => {
  if (!pageActive.value && route.path === "/planGenerate") {
    pageActive.value = true;
    void initializePage();
  }
});
onBeforeUnmount(() => {
  checkpointBeforeExit();
  leavePage();
  window.removeEventListener("beforeunload", beforeUnload);
});

watch(draft.status, (status) => {
  if (status === "saved" && pageActive.value && pageReady.value && !hydratingExistingPlan.value) recovery.clear(recoveryKey);
});

watch(
  form,
  () => {
    if (!planGenerated.value || hydratingExistingPlan.value) {
      return;
    }
    complianceChecked.value = false;
    complianceScore.value = 0;
    complianceStatus.value = "";
    complianceSummary.value = "";
    complianceDimensions.value = [];
    complianceIssues.value = [];
    currentStep.value = 3;
  },
  { deep: true, flush: "sync" },
);

watch(
  () => [
    { ...form },
    generatedPlan.value,
    contentFileIds.value,
    complianceChecked.value,
    complianceScore.value,
    complianceStatus.value,
    complianceSummary.value,
    complianceDimensions.value,
    complianceIssues.value,
    currentStep.value,
    generating.value,
    editMode.value,
    planGenerated.value,
    planTasks.value,
    taskCandidates.value,
    taskWarnings.value,
    taskDrawerVisible.value,
    taskDrawerMode.value,
    editingCandidateKey.value,
    taskAdoptModalVisible.value,
    taskCandidateForAdoption.value,
    taskAdoptStepsText.value,
    taskAdoptEquipmentText.value,
    editorContentRevision.value,
  ],
  () => draft.changed(),
  { deep: true },
);

watch(
  () => route.fullPath,
  () => {
    if (route.path !== "/planGenerate") {
      if (pageActive.value) {
        recovery.clear(recoveryKey);
        leavePage();
      }
      return;
    }
    if (!pageActive.value) return;
    if (internalDraftId && editingPlanId.value === internalDraftId) {
      return;
    }
    if (pageReady.value) recovery.clear(recoveryKey);
    void initializePage();
  },
  { immediate: true },
);
</script>

<template>
  <div class="plan-generate-page">
    <div class="step-card">
      <a-button class="back-button" type="link" @click="handleBack"><ArrowLeftOutlined />返回</a-button>
      <a-tag v-if="isEditing && pageReady" color="blue">{{ isRevision ? "修订预案" : "编辑草稿" }}</a-tag>
      <div class="step-content">
        <a-steps :current="currentStep - 1" size="small">
          <a-step v-for="step in generationSteps" :key="step" :title="step" />
        </a-steps>
      </div>
      <div class="draft-actions">
        <span
          class="draft-status"
          :class="{ 'draft-status-error': draft.status.value === 'error' }"
          role="status"
          :title="draft.error.value"
          >{{ draftSaveText }}</span
        >
        <a-button v-if="draftSupported" :loading="draftSaving" :disabled="editorLocked" @click="saveDraftManually">
          <SaveOutlined />保存草稿
        </a-button>
      </div>
    </div>
    <a-alert v-if="draftRestoreError" type="error" show-icon :message="draftRestoreError" />
    <a-alert v-else-if="!pageReady && !hydratingExistingPlan" type="error" message="预案加载失败，请重新进入页面。" />

    <div class="content-grid" :class="{ 'content-grid-ready': planGenerated, 'content-grid-tasks': isTaskPage }" :inert="editorLocked">
      <section class="panel form-panel">
        <div v-if="generating" class="generate-mask">
          <LoadingOutlined class="generate-spin" />
          <div class="generate-title">{{ generateStages[stageIndex] }}中...</div>
          <div class="generate-desc">正在根据文件信息组织预案内容</div>
          <div class="generate-stage-list">
            <div
              v-for="(stage, index) in generateStages"
              :key="stage"
              class="generate-stage"
              :class="{ active: index === stageIndex, completed: index < stageIndex }"
            >
              <span>{{ index + 1 }}</span
              >{{ stage }}
            </div>
          </div>
        </div>

        <div v-if="!isTaskPage" class="panel-header">
          <span class="panel-title"><EditOutlined />文件信息</span>
        </div>
        <div v-if="!isTaskPage" class="panel-body">
          <a-form layout="vertical">
            <a-form-item
              label="文件名称"
              required
              :validate-status="requiredInvalid.name ? 'error' : ''"
              :help="requiredInvalid.name ? '请输入文件名称' : ''"
            >
              <a-input v-model:value="form.name" :maxlength="20" show-count placeholder="请输入文件名称" @blur="touched.name = true" />
            </a-form-item>
            <a-form-item
              label="文件类型"
              required
              :validate-status="requiredInvalid.fileType ? 'error' : ''"
              :help="requiredInvalid.fileType ? '请选择文件类型' : ''"
            >
              <a-select
                v-model:value="form.fileType"
                placeholder="请选择文件类型"
                :options="fileTypeOptions"
                @blur="touched.fileType = true"
              />
            </a-form-item>
            <a-form-item
              label="文件级别"
              required
              :validate-status="requiredInvalid.level ? 'error' : ''"
              :help="requiredInvalid.level ? '请选择文件级别' : ''"
            >
              <a-select v-model:value="form.level" placeholder="请选择文件级别" :options="levelOptions" @blur="touched.level = true" />
            </a-form-item>
            <a-form-item label="到期日期">
              <a-date-picker
                v-model:value="form.expirationDate"
                value-format="YYYY-MM-DD"
                class="full-control"
                placeholder="不设置则默认3年有效期"
              />
            </a-form-item>
            <a-form-item
              label="事件分类"
              required
              :validate-status="requiredInvalid.eventCategory ? 'error' : ''"
              :help="requiredInvalid.eventCategory ? '请选择事件分类' : ''"
            >
              <a-select
                v-model:value="form.eventCategory"
                placeholder="请选择事件分类"
                :options="eventCategoryOptions"
                @blur="touched.eventCategory = true"
              />
            </a-form-item>
            <a-form-item label="文件描述">
              <a-textarea v-model:value="form.remark" :maxlength="200" show-count placeholder="请填写备注信息，最多输入200个字符" />
            </a-form-item>
          </a-form>
        </div>
        <div v-if="!planGenerated && !isTaskPage" class="panel-footer">
          <a-button class="footer-action" size="large" @click="resetForm">重置</a-button>
          <a-button class="footer-action" type="primary" size="large" :loading="generating" @click="generatePlan">
            <ThunderboltOutlined />生成预案
          </a-button>
        </div>

        <template v-if="planGenerated && isTaskPage">
          <div class="panel-header decomposition-header">
            <span class="panel-title"><ApartmentOutlined />AI结构化拆解</span>
            <div class="task-page-actions">
              <a-button size="small" @click="returnToPlanPage">返回合规检查</a-button>
              <a-button v-if="taskCandidates.length" type="primary" size="small" @click="adoptAllTasks">全部采纳</a-button>
            </div>
          </div>
          <div class="decomposition-panel">
            <a-alert v-if="taskWarnings.length" class="task-warning" type="warning" show-icon :message="taskWarnings.join('；')" />
            <div v-if="!taskCandidates.length" class="decomposition-empty">
              <ApartmentOutlined />
              <p>
                {{ planTasks.length ? "候选任务已全部采纳，可重新拆解生成新任务。" : "完成合规检查后，点击顶部“AI拆解任务”扫描预案全文。" }}
              </p>
              <a-button v-if="planTasks.length" size="small" @click="openTaskEditor('accepted')">编辑已采纳任务</a-button>
            </div>
            <template v-else>
              <div class="decomposition-summary">
                识别到 <strong>{{ taskCandidates.length }} 条</strong> 可结构化任务，请逐条确认后采纳
              </div>
              <div class="decomposition-card-list">
                <article v-for="task in taskCandidates" :key="task.clientKey" class="decomposition-card">
                  <div class="decomposition-card-heading">
                    <div>
                      <a-tag :class="`task-source-${task.sourceType.toLowerCase()}`">任务标签</a-tag>
                      <strong>{{ task.name || "未命名任务" }}</strong>
                    </div>
                    <span class="decomposition-confidence">
                      {{ task.sourceType === "TEMPLATE" ? "知识库匹配" : "AI生成" }}
                    </span>
                  </div>
                  <p class="decomposition-source">时限：{{ taskDurationText(task) }} · 执行人员：{{ taskExecutorText(task) }}</p>
                  <p v-if="task.executionContents.filter(Boolean).length" class="decomposition-source">
                    步骤：{{ task.executionContents.filter(Boolean).join("；") }}
                  </p>
                  <div class="decomposition-card-actions">
                    <a-button size="small" @click="openTaskEditor('candidates', task)">编辑</a-button>
                    <a-button type="primary" size="small" @click="openTaskAdoptModal(task)">采纳</a-button>
                  </div>
                </article>
              </div>
            </template>
          </div>
        </template>
      </section>

      <section v-show="!isTaskPage" class="panel preview-panel">
        <div class="panel-header">
          <span class="panel-title"><FileTextOutlined />预案内容</span>
          <div class="toolbar">
            <a-button v-if="planGenerated" size="small" :loading="checking" @click="runCompliance"
              ><CheckCircleOutlined />合规检查</a-button
            >
            <a-button
              v-if="planGenerated"
              size="small"
              :disabled="!complianceChecked"
              :loading="decomposingTasks"
              @click="runTaskDecomposition"
            >
              <ApartmentOutlined />{{ planTasks.length || taskCandidates.length ? "重新拆解" : "AI拆解任务" }}
            </a-button>
            <a-button v-if="planGenerated" size="small" :type="editMode ? 'primary' : 'default'" @click="toggleEditMode">
              <EditOutlined />{{ editMode ? "完成编辑" : "编辑" }}
            </a-button>
          </div>
        </div>

        <div v-if="planGenerated && editMode" class="editor-toolbar">
          <button class="editor-tool-button" type="button" title="加粗" @mousedown.prevent="applyEditorCommand('bold')">
            <strong>B</strong>
          </button>
          <button class="editor-tool-button" type="button" title="斜体" @mousedown.prevent="applyEditorCommand('italic')">
            <em>I</em>
          </button>
          <button class="editor-tool-button" type="button" title="下划线" @mousedown.prevent="applyEditorCommand('underline')">
            <u>U</u>
          </button>
          <i class="editor-tool-divider"></i>
          <button class="editor-tool-button" type="button" title="无序列表" @mousedown.prevent="applyEditorCommand('insertUnorderedList')">
            •≡
          </button>
          <button class="editor-tool-button" type="button" title="有序列表" @mousedown.prevent="applyEditorCommand('insertOrderedList')">
            1.
          </button>
          <i class="editor-tool-divider"></i>
          <button class="editor-tool-button" type="button" title="插入表格" @mousedown.prevent="insertEditorTable">⊞</button>
        </div>

        <div v-if="!planGenerated" class="empty-state">
          <FileDoneOutlined />
          <div class="empty-title">暂无预案内容</div>
          <div class="empty-desc">请在左侧填写文件信息后点击“生成预案”</div>
        </div>

        <div v-else class="plan-document">
          <div class="plan-doc-header">
            <div>{{ generatedPlan?.metadata }}</div>
          </div>
          <div
            ref="planContentElement"
            class="plan-sections"
            :contenteditable="editMode"
            v-html="generatedPlan?.contentHtml"
            @input="handleContentEdit"
          ></div>
          <div class="plan-attachment">
            <GeneratedAttachmentUpload
              :key="attachmentUploadKey"
              v-model="contentFileIds"
              v-model:files="existingContentFiles"
              @upload-pending="attachmentUploading = $event"
            />
          </div>
          <div class="status-bar">
            <span><i></i>{{ draftSaveText }}</span>
            <span>共 {{ contentWordCount }} 字</span>
          </div>
        </div>
      </section>

      <aside v-if="planGenerated || editingRevisionId" class="side-column">
        <div class="side-card-container">
          <section v-if="editingRevisionId" class="revision-context">
            <div class="revision-context-header">
              <span class="revision-context-title"><FileDoneOutlined />修订待办</span>
              <a-tag :color="revisionLockActive ? 'green' : 'red'">{{ revisionLockActive ? "已锁定" : "锁已失效" }}</a-tag>
            </div>
            <div class="revision-context-meta">
              <span class="revision-base-version">{{ revisionBaseVersionText }}</span>
              <span class="revision-progress">已处理 {{ handledRevisionCount }}/{{ revisionItems.length }}</span>
            </div>
            <p class="revision-context-tip">请勾选本次已经处理的修订内容，审批通过后对应记录将从修订待办中移除。</p>
            <div class="revision-check-list">
              <a-checkbox-group v-model:value="handledRevisionIds">
                <a-checkbox v-for="item in revisionItems" :key="item.id" :value="item.id">
                  <span class="revision-item-content">
                    <span class="revision-item-header">
                      <span class="revision-source-version">{{ item.sourceVersionText }}</span>
                      <span class="revision-type" :class="`revision-type--${item.revisionType.toLowerCase()}`">{{
                        revisionTypeLabels[item.revisionType]
                      }}</span>
                      <span v-if="handledRevisionIds.includes(item.id)" class="revision-handled-tag">已处理</span>
                    </span>
                    <span class="revision-item-reason">{{ item.reason }}</span>
                  </span>
                </a-checkbox>
              </a-checkbox-group>
            </div>
          </section>

          <section v-if="!isTaskPage && complianceChecked" class="panel compliance-side-panel">
            <div class="panel-header">
              <span class="panel-title"><CheckCircleOutlined />合规性检查</span>
              <a-button size="small" :loading="checking" @click="runCompliance">重新检查</a-button>
            </div>
            <div class="score-box">
              <a-progress
                type="circle"
                :percent="complianceScore"
                :width="92"
                :stroke-color="complianceStrokeColor"
                :format="() => `${complianceScore}`"
              />
              <div class="score-label">合规评分</div>
            </div>
            <div v-if="complianceDimensions.length" class="compliance-dimensions">
              <div v-for="dimension in complianceDimensions" :key="dimension.code || dimension.name" class="dimension-row">
                <span class="dimension-label">{{ dimension.name }}</span>
                <span class="dimension-bar">
                  <i
                    :class="{
                      pass: dimension.score >= 85,
                      warning: dimension.score >= 70 && dimension.score < 85,
                      severe: dimension.score < 70,
                    }"
                    :style="{ width: `${dimension.score}%` }"
                  ></i>
                </span>
                <strong
                  :class="{
                    pass: dimension.score >= 85,
                    warning: dimension.score >= 70 && dimension.score < 85,
                    severe: dimension.score < 70,
                  }"
                  >{{ dimension.score }}</strong
                >
              </div>
            </div>
            <div class="issue-list">
              <div v-if="complianceIssues.some((issue) => issue.type !== 'pass')" class="issue-header">
                <strong>问题清单</strong>
                <span v-if="complianceCounts.severe" class="issue-badge severe">严重 {{ complianceCounts.severe }}</span>
                <span v-if="complianceCounts.warning" class="issue-badge warning">警告 {{ complianceCounts.warning }}</span>
              </div>
              <div v-for="issue in complianceIssues" :key="`${issue.section}-${issue.title}`" class="issue-item" :class="issue.type">
                <i class="issue-icon">{{ issue.type === "severe" ? "!" : issue.type === "warning" ? "?" : "✓" }}</i>
                <div class="issue-text">
                  <strong>{{ issue.title }}</strong>
                  <span>{{ issue.desc }}</span>
                  <small v-if="issue.section">{{ issue.section }}</small>
                </div>
                <a-button v-if="issue.type === 'severe'" size="small" danger @click="editComplianceIssue">去修复</a-button>
              </div>
            </div>
          </section>

          <section v-if="isTaskPage" class="panel task-flow-panel">
            <div class="panel-header">
              <span class="panel-title"><ApartmentOutlined />任务流程步骤</span>
              <div class="task-flow-header-actions">
                <span>{{ planTasks.length }} 步</span>
                <a-button type="link" size="small" @click="openTaskEditor('accepted')">
                  {{ planTasks.length ? "编辑" : "手动添加" }}
                </a-button>
              </div>
            </div>
            <div v-if="!planTasks.length" class="task-flow-empty">
              <ApartmentOutlined />
              <p>
                {{
                  taskCandidates.length
                    ? "请在中间栏逐条采纳任务，采纳后才会进入流程列表。"
                    : "可点击“手动添加”录入流程步骤，或使用“AI拆解任务”自动生成。"
                }}
              </p>
              <a-button size="small" @click="openTaskEditor('accepted')"><PlusOutlined />手动添加任务</a-button>
            </div>
            <div v-else class="task-flow-list">
              <article
                v-for="(task, taskIndex) in planTasks"
                :key="task.clientKey"
                class="task-flow-step"
                :class="{ 'task-flow-step-dragging': draggingPlanTaskIndex === taskIndex }"
                @dragover="dragPlanTaskOver($event, taskIndex)"
                @drop.prevent="endPlanTaskDrag"
              >
                <span class="task-flow-index">{{ taskIndex + 1 }}</span>
                <div class="task-flow-content">
                  <div class="task-flow-name-row">
                    <strong>{{ task.name || "未命名任务" }}</strong>
                    <a-tag :class="`task-source-${task.sourceType.toLowerCase()}`">{{ taskSourceText(task) }}</a-tag>
                  </div>
                  <p>时限：{{ taskDurationText(task) }} · 执行人员：{{ taskExecutorText(task) }}</p>
                  <p v-if="task.executionContents.filter(Boolean).length">步骤：{{ task.executionContents.filter(Boolean).join("；") }}</p>
                  <p v-if="task.equipment.filter(Boolean).length">装备：{{ task.equipment.filter(Boolean).join("、") }}</p>
                  <p v-if="task.locationDesc || task.remark" class="task-flow-supplement">
                    {{ task.locationDesc ? `地点：${task.locationDesc}` : "地点待启动时补充" }}
                    <template v-if="task.remark"> · 备注：{{ task.remark }}</template>
                  </p>
                </div>
                <div class="task-flow-actions">
                  <span
                    class="task-flow-drag-handle"
                    title="按住拖动排序"
                    draggable="true"
                    @dragstart="startPlanTaskDrag($event, taskIndex)"
                    @dragend="endPlanTaskDrag"
                    ><HolderOutlined
                  /></span>
                  <a-button type="text" danger size="small" title="移除任务" @click="removePlanTask(taskIndex)">
                    <DeleteOutlined />
                  </a-button>
                </div>
              </article>
            </div>
          </section>

          <section v-if="isTaskPage && generatedPlan?.missingInfo.length" class="panel">
            <div class="panel-header">
              <span class="panel-title"><FileTextOutlined />待补充信息</span>
            </div>
            <ul class="missing-info-list">
              <li v-for="info in generatedPlan.missingInfo" :key="info">{{ info }}</li>
            </ul>
          </section>

          <section v-if="isTaskPage" class="panel">
            <div class="panel-header">
              <span class="panel-title"><SaveOutlined />保存操作</span>
            </div>
            <div class="save-summary">
              <label>预案名称</label>
              <span>{{ form.name }}</span>
              <label>合规状态</label>
              <span v-if="complianceChecked">
                <b class="compliance-status" :class="complianceLevel">{{ complianceStatusText }}</b> · 综合评分 {{ complianceScore }} 分
              </span>
              <span v-else class="compliance-status unchecked">未检查</span>
              <label>结构化任务</label>
              <span>
                {{
                  planTasks.length
                    ? `已配置 ${planTasks.length} 个任务`
                    : taskCandidates.length
                      ? `待采纳 ${taskCandidates.length} 个任务`
                      : "未拆解"
                }}
                <a-button v-if="planTasks.length" type="link" size="small" @click="openTaskEditor('accepted')">查看编辑</a-button>
              </span>
            </div>
            <div class="save-actions">
              <a-button block type="primary" @click="openSaveModal">
                <SaveOutlined />{{ isRevision ? "提交修订审批" : "提交审批" }}
              </a-button>
            </div>
          </section>
        </div>
      </aside>
    </div>

    <a-drawer
      v-model:visible="taskDrawerVisible"
      :title="taskDrawerTitle"
      :width="760"
      :destroy-on-close="false"
      :closable="!editorLocked"
      :mask-closable="!editorLocked"
      :keyboard="!editorLocked"
    >
      <div :inert="editorLocked">
        <a-alert v-if="taskWarnings.length" class="task-warning" type="warning" show-icon :message="taskWarnings.join('；')" />
        <PlanTaskEditor v-if="taskDrawerMode === 'candidates'" v-model="editingCandidate" single-task />
        <PlanTaskEditor v-else v-model="planTasks" />
      </div>
    </a-drawer>

    <a-modal
      v-model:visible="taskAdoptModalVisible"
      title="知识库匹配"
      :width="580"
      :footer="null"
      :closable="!editorLocked"
      :mask-closable="!editorLocked"
      :keyboard="!editorLocked"
      centered
      @cancel="closeTaskAdoptModal"
    >
      <div v-if="taskCandidateForAdoption" class="task-adopt-modal" :inert="editorLocked">
        <div class="task-adopt-title">
          <h3>{{ taskCandidateForAdoption.name || "未命名任务" }}</h3>
          <span>{{
            taskCandidateForAdoption.sourceType === "TEMPLATE"
              ? `知识库模板 · ${taskCandidateForAdoption.templateName || "已匹配"}`
              : "AI生成任务"
          }}</span>
        </div>
        <div class="task-adopt-meta-grid">
          <div>
            <span>任务名（预案提供）</span><strong>{{ taskCandidateForAdoption.name || "--" }}</strong>
          </div>
          <div><span>执行人员</span><strong>任务流程步骤中配置</strong></div>
          <div>
            <span>时限（预案提供）</span><strong>{{ taskDurationText(taskCandidateForAdoption) }}</strong>
          </div>
        </div>
        <label class="task-adopt-field">
          <span>操作步骤（{{ taskCandidateForAdoption.sourceType === "TEMPLATE" ? "知识库匹配" : "AI生成" }}）</span>
          <a-textarea v-model:value="taskAdoptStepsText" :rows="5" :maxlength="2500" />
          <small>{{ taskCandidateForAdoption.templateReason || "可编辑后确认采纳" }}</small>
        </label>
        <label class="task-adopt-field">
          <span>标准装备（可编辑）</span>
          <a-textarea v-model:value="taskAdoptEquipmentText" :rows="2" :maxlength="1000" />
        </label>
        <a-alert class="task-adopt-note" type="warning" show-icon message="执行地点和备注可在任务编辑或预案启动时补充。" />
        <div class="task-adopt-actions">
          <a-button @click="closeTaskAdoptModal">取消</a-button>
          <a-button type="primary" @click="confirmTaskAdoption">确认采纳 → 生成流程步骤</a-button>
        </div>
      </div>
    </a-modal>

    <a-modal
      v-model:visible="saveModalVisible"
      :title="isRevision ? '提交修订审批' : '提交预案审批'"
      :width="520"
      :footer="null"
      :closable="!editorLocked"
      :mask-closable="!editorLocked"
      :keyboard="!editorLocked"
      centered
      @cancel="closeSaveModal"
    >
      <div class="save-modal-content">
        <div class="save-score-row">
          <span>综合评分</span>
          <strong>{{ complianceChecked ? complianceScore : "--" }}</strong>
        </div>

        <section v-if="severeComplianceIssues.length" class="save-issue-card severe">
          <button type="button" class="save-issue-header" @click="severeIssuesExpanded = !severeIssuesExpanded">
            <span
              ><ExclamationCircleOutlined />严重问题 <b>{{ severeComplianceIssues.length }}</b></span
            >
            <DownOutlined class="expand-arrow" :class="{ expanded: severeIssuesExpanded }" />
          </button>
          <div v-if="severeIssuesExpanded" class="save-issue-details">
            <div v-for="issue in severeComplianceIssues" :key="`${issue.section}-${issue.title}`" class="save-issue-item severe">
              <ExclamationCircleOutlined />
              <div>
                <strong>{{ issue.title }}</strong>
                <p>{{ issue.desc }}</p>
                <small>{{ issue.section || "综合检查" }}</small>
              </div>
            </div>
          </div>
        </section>

        <section v-if="warningComplianceIssues.length" class="save-issue-card warning">
          <button type="button" class="save-issue-header" @click="warningIssuesExpanded = !warningIssuesExpanded">
            <span
              ><ExclamationCircleOutlined />警告提示 <b>{{ warningComplianceIssues.length }}</b></span
            >
            <DownOutlined class="expand-arrow" :class="{ expanded: warningIssuesExpanded }" />
          </button>
          <div v-if="warningIssuesExpanded" class="save-issue-details">
            <div v-for="issue in warningComplianceIssues" :key="`${issue.section}-${issue.title}`" class="save-issue-item warning">
              <ExclamationCircleOutlined />
              <div>
                <strong>{{ issue.title }}</strong>
                <p>{{ issue.desc }}</p>
                <small>{{ issue.section || "综合检查" }}</small>
              </div>
            </div>
          </div>
        </section>

        <div v-if="severeComplianceIssues.length" class="save-severe-notice">仍有严重问题未修复，请返回修改后再提交。</div>
      </div>
      <div class="save-modal-footer">
        <a-button :disabled="saveLoading || submissionPreparing" @click="closeSaveModal">取消</a-button>
        <a-button type="primary" :loading="saveLoading || submissionPreparing" @click="confirmSavePlan">确认提交审批</a-button>
      </div>
    </a-modal>
  </div>
</template>

<style lang="less" scoped>
.plan-generate-page {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  overflow: hidden;
  background: #f5f5f4;
}

.step-card,
.panel {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.step-card {
  display: flex;
  align-items: center;
  gap: 14px;
  flex: none;
  padding: 18px 24px;
  border-radius: 0;
}

.draft-actions {
  display: flex;
  flex: none;
  align-items: center;
  gap: 10px;
}

.draft-status {
  color: #6b7280;
  font-size: 12px;
}

.draft-status-error {
  color: #ef4444;
}

.revision-context {
  flex: none;
  padding-bottom: 10px;
  overflow: hidden;
  background: #fff;
  border: 1px solid #91caff;
  border-radius: 8px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.revision-context-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 14px;
  background: #f0f7ff;
  border-bottom: 1px solid #d6e8ff;
}

.revision-context-title {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: #1c1b19;
  font-size: 14px;
  font-weight: 600;
}

.revision-context-title :deep(.anticon) {
  color: #1677ff;
}

.revision-context-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 14px 0;
}

.revision-base-version {
  color: #334155;
  font-size: 12px;
  font-weight: 600;
}

.revision-progress {
  flex: none;
  color: #1677ff;
  font-size: 12px;
}

.revision-context-tip {
  margin: 4px 0 8px;
  padding: 0 14px;
  color: #64748b;
  font-size: 12px;
  line-height: 18px;
}

.revision-check-list {
  padding: 0 10px;

  :deep(.ant-checkbox-group) {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  :deep(.ant-checkbox-wrapper) {
    display: flex;
    align-items: flex-start;
    margin-left: 0;
    padding: 8px 10px;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    line-height: 18px;
    white-space: normal;
    word-break: break-word;
    transition:
      border-color 0.2s,
      background-color 0.2s;
  }

  :deep(.ant-checkbox-wrapper + .ant-checkbox-wrapper) {
    margin-left: 0;
  }

  :deep(.ant-checkbox-wrapper:hover) {
    background: #f0f7ff;
    border-color: #91caff;
  }

  :deep(.ant-checkbox-wrapper-checked),
  :deep(.ant-checkbox-wrapper-checked:hover) {
    background: #f6ffed;
    border-color: #b7eb8f;
  }

  :deep(.ant-checkbox) {
    flex: none;
    align-self: flex-start;
    margin-top: 1px;
  }

  :deep(.ant-checkbox + span) {
    flex: 1;
    min-width: 0;
    padding-right: 0;
    white-space: normal;
    word-break: break-word;
  }
}

.revision-item-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.revision-item-header {
  display: flex;
  align-items: center;
  gap: 6px;
}

.revision-source-version {
  padding: 0 6px;
  color: #1677d2;
  font-size: 12px;
  line-height: 18px;
  background: #e6f4ff;
  border-radius: 3px;
}

.revision-type {
  padding: 0 6px;
  font-size: 12px;
  line-height: 18px;
  border-radius: 3px;
}

.revision-type--forced {
  color: #ff4d4f;
  background: #fff1f0;
}

.revision-type--rejected {
  color: #a640d4;
  background: #fbf3ff;
}

.revision-type--suggested {
  color: #fa8c16;
  background: #fff7e8;
}

.revision-type--periodic {
  color: #1677d2;
  background: #eef6ff;
}

.revision-handled-tag {
  margin-left: auto;
  color: #52c41a;
  font-size: 12px;
}

.revision-item-reason {
  color: #475569;
  font-size: 12px;
  line-height: 18px;
}

.back-button {
  flex: none;
  padding: 0;
}

.step-content {
  flex: 1;
  min-width: 0;
}

.content-grid {
  flex: 1;
  height: 0;
  min-height: 0;
  display: grid;
  grid-template-columns: 340px minmax(480px, 1fr) 320px;
  gap: 20px;
  align-items: stretch;
}

.content-grid-ready {
  align-items: stretch;
  grid-template-columns: minmax(240px, 3fr) minmax(0, 5fr) minmax(280px, 3fr);
}

.content-grid-ready .preview-panel {
  order: 2;
}

.content-grid-ready .form-panel {
  order: 1;
  overflow-y: auto;
}

.content-grid-ready .side-column {
  order: 3;
}

.content-grid-tasks {
  grid-template-columns: minmax(0, 7fr) minmax(320px, 5fr);
}

.content-grid-tasks .form-panel {
  order: 1;
}

.content-grid-tasks .side-column {
  order: 2;
}

.embedded-compliance-panel {
  flex: none;
  border-bottom: 1px solid #e5e7eb;
}

.panel {
  overflow: hidden;
}

.form-panel {
  position: relative;
  display: flex;
  min-height: 0;
  max-height: 100%;
  flex-direction: column;
}

.form-panel .panel-body {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
}

.content-grid-ready .form-panel .panel-body {
  flex: none;
  overflow: visible;
}

.preview-panel {
  display: flex;
  min-width: 0;
  min-height: 0;
  max-height: 100%;
  flex-direction: column;
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 50px;
  padding: 12px 18px;
  border-bottom: 1px solid #e5e7eb;
}

.panel-title {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: #1c1b19;
  font-size: 14px;
  font-weight: 600;
}

.panel-title :deep(.anticon) {
  color: #1e92b8;
}

.panel-body {
  padding: 18px;
}

.panel-footer {
  display: flex;
  gap: 10px;
  padding: 12px 18px;
  border-top: 1px solid #e5e7eb;
  background: #f9fafb;
}

.decomposition-header {
  position: sticky;
  top: 0;
  z-index: 1;
  flex: none;
  background: #fff;
}

.task-page-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.decomposition-panel {
  display: flex;
  flex: none;
  height: calc(100vh - 178px);
  height: calc(100dvh - 178px);
  min-height: calc(100vh - 178px);
  min-height: calc(100dvh - 178px);
  flex-direction: column;
  padding: 12px;
  overflow: hidden;
}

.decomposition-summary {
  flex: none;
  margin-bottom: 10px;
  color: #6b7280;
  font-size: 12px;
  line-height: 1.6;
}

.decomposition-summary strong {
  color: #1e92b8;
}

.decomposition-card-list {
  display: grid;
  flex: 1;
  min-height: 0;
  align-content: start;
  gap: 8px;
  overflow-y: auto;
}

.decomposition-card {
  padding: 10px;
  border: 1px solid #e5e7eb;
  border-left: 3px solid #f59e0b;
  border-radius: 6px;
  background: #fff;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease;
}

.decomposition-card:hover {
  border-color: #1e92b8;
  box-shadow: 0 0 0 1px rgba(30, 146, 184, 0.15);
}

.decomposition-card-heading,
.decomposition-card-heading > div,
.decomposition-card-actions {
  display: flex;
  align-items: center;
}

.decomposition-card-heading {
  justify-content: space-between;
  gap: 8px;
}

.decomposition-card-heading > div {
  min-width: 0;
  gap: 6px;
}

.decomposition-card-heading strong {
  overflow: hidden;
  color: #374151;
  font-size: 12px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.decomposition-card-heading :deep(.ant-tag) {
  flex: none;
  margin: 0;
  color: #d97706;
  font-size: 10px;
  line-height: 18px;
  background: #fffbeb;
  border-color: #fde68a;
}

.decomposition-confidence {
  flex: none;
  color: #9ca3af;
  font-size: 10px;
}

.decomposition-source {
  margin: 6px 0 0;
  color: #8c8c8c;
  font-size: 11px;
  line-height: 1.6;
  word-break: break-word;
}

.decomposition-card-actions {
  justify-content: flex-end;
  gap: 6px;
  margin-top: 8px;
}

.decomposition-empty {
  display: grid;
  min-height: 220px;
  place-items: center;
  align-content: center;
  gap: 10px;
  color: #9ca3af;
  text-align: center;
}

.decomposition-empty :deep(.anticon) {
  font-size: 32px;
}

.decomposition-empty p {
  max-width: 220px;
  margin: 0;
  font-size: 12px;
  line-height: 1.7;
}

.footer-action {
  flex: 1;
}

.full-control {
  width: 100%;
}

.generate-mask {
  position: absolute;
  inset: 0;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: rgba(255, 255, 255, 0.94);
}

.generate-spin {
  margin-bottom: 12px;
  color: #1e92b8;
  font-size: 36px;
}

.generate-title {
  color: #1c1b19;
  font-size: 15px;
  font-weight: 600;
}

.generate-desc {
  margin: 4px 0 14px;
  color: #6b7280;
  font-size: 12px;
}

.generate-stage-list {
  display: grid;
  gap: 6px;
}

.generate-stage {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #9ca3af;
  font-size: 12px;
}

.generate-stage span {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border: 1px solid #e5e7eb;
  border-radius: 50%;
}

.generate-stage.active,
.generate-stage.completed {
  color: #1e92b8;
  font-weight: 500;
}

.generate-stage.completed span {
  color: #fff;
  background: #22c55e;
  border-color: #22c55e;
}

.toolbar {
  display: flex;
  gap: 8px;
}

.task-warning {
  margin-bottom: 12px;
}

.editor-toolbar {
  display: flex;
  align-items: center;
  gap: 3px;
  padding: 6px 14px;
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
}

.editor-tool-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  padding: 0;
  color: #6b7280;
  font-size: 13px;
  font-weight: 600;
  background: transparent;
  border: 0;
  border-radius: 4px;
  cursor: pointer;
}

.editor-tool-button:hover {
  color: #1c1b19;
  background: #e5e7eb;
}

.editor-tool-divider {
  width: 1px;
  height: 20px;
  margin: 0 3px;
  background: #e5e7eb;
}

.empty-state {
  display: grid;
  flex: 1;
  place-items: center;
  min-height: 420px;
  color: #9ca3af;
  text-align: center;
}

.plan-document {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
}

.empty-state :deep(.anticon) {
  margin-bottom: 12px;
  font-size: 54px;
}

.empty-title {
  color: #6b7280;
  font-size: 15px;
  font-weight: 500;
}

.empty-desc {
  margin-top: 4px;
  font-size: 12px;
}

.plan-doc-header {
  margin: 0 32px;
  padding: 18px 0 12px;
  text-align: center;
  border-bottom: 2px solid #1c1b19;
}

.plan-doc-header div {
  color: #6b7280;
  font-size: 12px;
}

.plan-sections {
  padding: 20px 32px;
  outline: none;
}

.plan-sections :deep(h1) {
  margin: 0 0 20px;
  color: #1c1b19;
  font-size: 22px;
  font-weight: 700;
  text-align: center;
}

.plan-sections :deep(h2) {
  margin: 18px 0 10px;
  color: #1c1b19;
  font-size: 17px;
  font-weight: 700;
}

.plan-sections :deep(h3) {
  margin: 14px 0 8px;
  color: #1c1b19;
  font-size: 14px;
  font-weight: 600;
}

.plan-sections :deep(p),
.plan-sections :deep(li),
.plan-sections :deep(td),
.plan-sections :deep(th) {
  margin: 0 0 8px;
  color: #4b5563;
  font-size: 13px;
  line-height: 1.8;
}

.plan-sections :deep(ul),
.plan-sections :deep(ol) {
  padding-left: 22px;
}

.plan-sections :deep(table) {
  width: 100%;
  margin: 10px 0;
  border-collapse: collapse;
}

.plan-sections :deep(td),
.plan-sections :deep(th) {
  padding: 8px 10px;
  border: 1px solid #e5e7eb;
}

.plan-sections :deep(th) {
  color: #1c1b19;
  background: #f9fafb;
}

.plan-attachment {
  padding: 18px 32px;
  border-top: 1px dashed #e5e7eb;
}

.status-bar {
  display: flex;
  justify-content: space-between;
  padding: 7px 14px;
  color: #9ca3af;
  font-size: 11px;
  background: #f9fafb;
  border-top: 1px solid #e5e7eb;
}

.status-bar i {
  display: inline-block;
  width: 7px;
  height: 7px;
  margin-right: 6px;
  background: #22c55e;
  border-radius: 50%;
}

.side-column {
  position: sticky;
  top: 0;
  height: 100%;
  min-height: 0;
  min-width: 0;
  max-height: 100%;
  overflow-x: auto;
  overflow-y: scroll;
  scrollbar-gutter: stable;
}

.side-card-container {
  display: flex;
  height: auto;
  min-height: 100%;
  flex-direction: column;
  gap: 10px;
  width: 100%;
  min-width: 0;
}

.task-flow-panel {
  display: flex;
  flex: none;
  height: calc(100vh - 128px);
  height: calc(100dvh - 128px);
  min-height: calc(100vh - 128px);
  min-height: calc(100dvh - 128px);
  flex-direction: column;
}

.task-flow-header-actions {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: #9ca3af;
  font-size: 12px;
}

.task-flow-header-actions :deep(.ant-btn) {
  padding: 0 2px;
}

.task-flow-empty {
  display: grid;
  flex: 1;
  min-height: 0;
  place-items: center;
  align-content: center;
  gap: 8px;
  padding: 20px;
  color: #9ca3af;
  text-align: center;
}

.task-flow-empty :deep(.anticon) {
  font-size: 28px;
}

.task-flow-empty p {
  max-width: 220px;
  margin: 0;
  font-size: 12px;
  line-height: 1.6;
}

.task-flow-list {
  display: grid;
  flex: 1;
  min-height: 0;
  align-content: start;
  grid-auto-rows: max-content;
  gap: 10px;
  max-height: none;
  padding: 12px;
  overflow-y: auto;
}

.task-flow-step {
  display: flex;
  align-items: flex-start;
  gap: 9px;
  padding: 11px 10px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  background: #fff;
}

.task-flow-step-dragging {
  border-color: #91caff;
  background: #f0f7ff;
}

.task-flow-index {
  display: inline-flex;
  flex: none;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  color: #fff;
  font-size: 12px;
  font-weight: 600;
  background: #1e92b8;
  border-radius: 50%;
}

.task-flow-content {
  flex: 1;
  display: grid;
  min-width: 0;
  gap: 4px;
}

.task-flow-actions {
  display: inline-flex;
  flex: none;
  align-items: center;
  gap: 2px;
}

.task-flow-drag-handle {
  display: inline-flex;
  align-items: center;
  padding: 3px;
  color: #94a3b8;
  cursor: grab;
}

.task-flow-drag-handle:active {
  cursor: grabbing;
}

.task-flow-actions :deep(.ant-btn) {
  padding: 0 2px;
}

.task-flow-name-row {
  display: flex;
  align-items: flex-start;
  gap: 5px;
}

.task-flow-name-row strong {
  flex: 1;
  min-width: 0;
  color: #1c1b19;
  font-size: 13px;
  line-height: 1.5;
}

.task-flow-name-row :deep(.ant-tag) {
  flex: none;
  margin: 0;
  font-size: 10px;
  line-height: 18px;
}

.task-flow-name-row :deep(.task-source-template) {
  color: #2563eb;
  background: #eff6ff;
  border-color: #bfdbfe;
}

.task-flow-name-row :deep(.task-source-ai) {
  color: #d97706;
  background: #fffbeb;
  border-color: #fde68a;
}

.task-flow-name-row :deep(.task-source-manual) {
  color: #6b7280;
  background: #f9fafb;
  border-color: #e5e7eb;
}

.task-flow-content p {
  margin: 0;
  color: #6b7280;
  font-size: 11px;
  line-height: 1.55;
  word-break: break-word;
}

.task-flow-content .task-flow-supplement {
  color: #9ca3af;
}

.missing-info-list {
  margin: 0;
  padding: 14px 18px 14px 34px;
  color: #6b7280;
  font-size: 12px;
  line-height: 1.7;
}

.score-box {
  padding: 18px;
  text-align: center;
  border-bottom: 1px solid #e5e7eb;
}

.score-label {
  margin-top: -29px;
  padding-bottom: 14px;
  color: #9ca3af;
  font-size: 10px;
  pointer-events: none;
}

.compliance-dimensions {
  padding: 12px 16px;
  border-bottom: 1px solid #e5e7eb;
}

.dimension-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 5px 0;
  font-size: 12px;
}

.dimension-label {
  flex: 1;
  color: #6b7280;
}

.dimension-bar {
  width: 80px;
  height: 6px;
  overflow: hidden;
  background: #e5e7eb;
  border-radius: 3px;
}

.dimension-bar i {
  display: block;
  height: 100%;
  border-radius: inherit;
}

.dimension-bar i.pass {
  background: #22c55e;
}

.dimension-bar i.warning {
  background: #f59e0b;
}

.dimension-bar i.severe {
  background: #ef4444;
}

.dimension-row strong {
  width: 30px;
  font-size: 12px;
  text-align: right;
}

.dimension-row strong.pass,
.compliance-status.pass {
  color: #16a34a;
}

.dimension-row strong.warning,
.compliance-status.warning {
  color: #d97706;
}

.dimension-row strong.severe,
.compliance-status.severe {
  color: #ef4444;
}

.issue-list {
  padding: 12px 16px;
}

.issue-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.issue-header strong {
  flex: 1;
  color: #1c1b19;
  font-size: 13px;
}

.issue-badge {
  padding: 1px 6px;
  font-size: 11px;
  font-weight: 500;
  border-radius: 10px;
}

.issue-badge.severe {
  color: #ef4444;
  background: #fef2f2;
}

.issue-badge.warning {
  color: #d97706;
  background: #fffbeb;
}

.issue-item {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 8px 0;
  border-bottom: 1px solid #f9fafb;
}

.issue-icon {
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  margin-top: 1px;
  font-size: 10px;
  font-style: normal;
  font-weight: 700;
  border-radius: 50%;
}

.issue-item.severe .issue-icon {
  color: #ef4444;
  background: #fef2f2;
}

.issue-item.warning .issue-icon {
  color: #d97706;
  background: #fffbeb;
}

.issue-item.pass .issue-icon {
  color: #16a34a;
  background: #f0fdf4;
}

.issue-text {
  display: grid;
  flex: 1;
  min-width: 0;
  gap: 2px;
}

.issue-text strong {
  color: #1c1b19;
  font-size: 12px;
}

.issue-text span {
  color: #6b7280;
  font-size: 11px;
  line-height: 1.45;
}

.issue-text small {
  color: #9ca3af;
  font-size: 10px;
}

.issue-item.warning .issue-text strong {
  color: #d97706;
}

.issue-item.pass .issue-text strong {
  color: #16a34a;
}

.save-summary {
  display: grid;
  gap: 5px;
  padding: 18px;
}

.save-summary label {
  color: #6b7280;
  font-size: 12px;
  font-weight: 600;
}

.save-summary span {
  margin-bottom: 8px;
  color: #1c1b19;
  font-size: 13px;
}

.compliance-status {
  font-weight: 500;
}

.compliance-status.unchecked {
  color: #9ca3af;
}

.save-actions {
  display: grid;
  gap: 8px;
  padding: 0 18px 18px;
}

.save-modal-content {
  display: grid;
  gap: 10px;
  padding-top: 4px;
}

.task-adopt-modal {
  display: grid;
  gap: 16px;
}

.task-adopt-title h3 {
  margin: 0;
  color: #1f2937;
  font-size: 18px;
}

.task-adopt-title span,
.task-adopt-field small {
  display: block;
  margin-top: 4px;
  color: #94a3b8;
  font-size: 12px;
}

.task-adopt-meta-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.task-adopt-meta-grid div {
  display: grid;
  gap: 4px;
  padding: 10px;
  text-align: center;
  background: #f8fafc;
  border-radius: 4px;
}

.task-adopt-meta-grid span {
  color: #94a3b8;
  font-size: 12px;
}

.task-adopt-meta-grid strong {
  overflow: hidden;
  color: #334155;
  font-size: 14px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.task-adopt-field {
  display: grid;
  gap: 6px;
  color: #475569;
  font-size: 13px;
  font-weight: 600;
}

.task-adopt-field :deep(textarea) {
  font-weight: 400;
}

.task-adopt-note {
  margin: 0;
}

.task-adopt-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.save-score-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px;
  color: #166534;
  font-size: 13px;
  background: #f0fdf4;
  border-radius: 6px;
}

.save-score-row strong {
  color: #16a34a;
  font-size: 18px;
}

.save-issue-card {
  overflow: hidden;
  border: 1px solid;
  border-radius: 6px;
}

.save-issue-card.severe {
  color: #ef4444;
  background: #fef2f2;
  border-color: #ef4444;
}

.save-issue-card.warning {
  color: #d97706;
  background: #fffbeb;
  border-color: #f59e0b;
}

.save-issue-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 10px 12px;
  color: inherit;
  font: inherit;
  background: transparent;
  border: 0;
  cursor: pointer;
}

.save-issue-header span {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 500;
}

.save-issue-header b {
  font-size: 16px;
}

.expand-arrow {
  transition: transform 0.2s ease;
}

.expand-arrow.expanded {
  transform: rotate(180deg);
}

.save-issue-details {
  padding: 0 12px 4px;
  background: #fff;
  border-top: 1px solid rgba(0, 0, 0, 0.08);
}

.save-issue-item {
  display: flex;
  gap: 8px;
  padding: 9px 0;
  border-bottom: 1px solid #f3f4f6;
}

.save-issue-item:last-child {
  border-bottom: 0;
}

.save-issue-item > :deep(.anticon) {
  margin-top: 3px;
}

.save-issue-item div {
  display: grid;
  flex: 1;
  gap: 2px;
}

.save-issue-item strong {
  color: #1c1b19;
  font-size: 12px;
  font-weight: 500;
}

.save-issue-item p {
  margin: 0;
  color: #6b7280;
  font-size: 11px;
  line-height: 1.5;
}

.save-issue-item small {
  color: #9ca3af;
  font-size: 10px;
}

.save-issue-item.severe > :deep(.anticon) {
  color: #ef4444;
}

.save-issue-item.warning > :deep(.anticon) {
  color: #d97706;
}

.save-severe-notice {
  padding: 10px 12px;
  color: #6b7280;
  font-size: 13px;
  line-height: 1.55;
  background: #fffbeb;
  border-left: 3px solid #f59e0b;
  border-radius: 4px;
}

.save-modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 18px;
  padding-top: 14px;
  border-top: 1px solid #e5e7eb;
}

@media (max-width: 1280px) {
  .plan-generate-page {
    height: auto;
    min-height: 100%;
    overflow-y: auto;
  }

  .content-grid {
    flex: none;
    height: auto;
    min-height: auto;
    grid-template-columns: 320px minmax(420px, 1fr);
  }

  .side-column {
    grid-column: 1 / -1;
    height: auto;
    max-height: none;
  }

  .side-card-container {
    height: auto;
    min-height: 0;
    display: grid;
    grid-template-columns: repeat(2, minmax(320px, 1fr));
  }
}

@media (max-width: 860px) {
  .plan-generate-page {
    overflow-y: auto;
  }

  .step-card {
    align-items: flex-start;
    flex-direction: column;
    gap: 10px;
    padding: 14px;
    overflow-x: auto;
  }

  .step-content {
    width: 100%;
  }

  .content-grid,
  .side-card-container {
    grid-template-columns: 1fr;
  }

  .side-card-container {
    display: flex;
    min-width: 0;
  }

  .form-panel,
  .preview-panel,
  .plan-document {
    min-height: auto;
  }

  .plan-doc-header,
  .plan-sections {
    margin-right: 16px;
    margin-left: 16px;
    padding-right: 0;
    padding-left: 0;
  }
}
</style>
