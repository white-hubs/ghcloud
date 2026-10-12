import { Icon, Image, Popup, showImagePreview, showToast } from "vant";
import { computed, defineComponent, shallowRef, watch, type PropType, type VNodeChild } from "vue";
import { useRouter } from "vue-router";

import type {
  HazardApprovalTaskStatus,
  HazardApprovalTaskSummaryVO,
  FileVO,
  HazardDetailBasicInfoVO,
  HazardGovernanceStatusStepVO,
  HazardDetailVO,
  HazardLedgerRecordVO,
  HazardProcessLogVO,
  HazardRectificationPlanVO,
  HazardRectificationProgressVO,
} from "@ghcloud/cube-service-interface/hazard-governance";
import { useAuthRequest } from "@ghcloud/cube-services-client/auth-request";
import { getHazardDetail } from "@ghcloud/cube-services-client/hazard-governance.client";

import { readHazardActions, renderHazardActions } from "./hazard-actions";
import { PageLoadingOverlay } from "@/components/page-loading-overlay";
import { hasRichTextContent, sanitizeRichText } from "@/utils/rich-text";
import { formatServiceDate, formatServiceLevel, formatServiceSource, formatServiceStatus } from "@/views/hazard-service-utils";

import styles from "./index.module.less";

type DetailRecord = (HazardLedgerRecordVO | HazardDetailBasicInfoVO) & {
  categoryId?: string | number;
  categoryName?: string;
  categoryNamePath?: string[];
  hazardCategoryId?: string | number;
  hazardCategoryName?: string;
  acceptanceUserId?: string;
  acceptanceUserName?: string;
  confirmUserId?: string;
  confirmUserName?: string;
  createdByName?: string;
  deadline?: string;
  reportedBy?: string;
  reportedByName?: string;
  reporterId?: string;
  reporterName?: string;
  foundBy?: string;
  foundByName?: string;
  rectificationDeadline?: string;
  rectificationDeadlineHours?: number;
  responsibleUserId?: string;
  responsibleUserName?: string;
  sceneImages?: FileVO[] | string;
  images?: FileVO[];
  title?: string;
  name?: string;
  typeName?: string;
} & Record<string, unknown>;

type HazardDetailResponse = HazardDetailVO | HazardDetailBasicInfoVO | { data?: unknown; result?: unknown; details?: unknown };

interface DetailRow {
  label: string;
  value: VNodeChild;
}

interface DetailStep {
  index: number;
  status: string;
  shortTitle: string;
}

interface TimelineNode {
  id: string;
  title: string;
  operator: string;
  operatedTime: string;
  content: string;
  tone: "done" | "active";
}

type ProcessInfoRecord = NonNullable<HazardDetailVO["processInfo"]> & Record<string, unknown>;
type DetailWithLogs = HazardDetailVO &
  Record<string, unknown> & {
    operationLogs?: HazardProcessLogVO[];
    processLogs?: HazardProcessLogVO[];
  };
type ProcessLogRecord = HazardProcessLogVO & Record<string, unknown>;
type ApprovalStatusKey = HazardApprovalTaskStatus | "UNKNOWN";
type ApprovalStatusTone = "pending" | "waiting" | "approved" | "rejected" | "unknown";

const readText = (...values: unknown[]): string => {
  const value = values.find((item) => item !== undefined && item !== null && item !== "");
  return value === undefined || value === null ? "-" : String(value);
};

const readFieldText = (record: DetailRecord, keys: string[]): string => {
  const value = keys.map((key) => record[key]).find((item) => item !== undefined && item !== null && item !== "");
  return value === undefined || value === null ? "" : String(value);
};

const readRecordText = (record: Record<string, unknown> | undefined, keys: string[]): string => {
  if (!record) {
    return "";
  }
  const value = keys.map((key) => record[key]).find((item) => item !== undefined && item !== null && item !== "");
  if (Array.isArray(value)) {
    return value.map(String).filter(Boolean).join("，");
  }
  return value === undefined || value === null ? "" : String(value);
};

const renderValue = (value?: string | number | boolean | null): string => {
  if (value === undefined || value === null || value === "") {
    return "-";
  }
  return String(value);
};

const splitTextLines = (value?: string): string[] =>
  (value || "")
    .split(/\r?\n|[；;]/)
    .map((item) => item.trim())
    .filter(Boolean);

const toNumber = (value: unknown, fallback = 0): number => {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : fallback;
};

const formatRectificationDeadlineHours = (hours: number | undefined): string => {
  if (!Number.isFinite(hours)) {
    return "";
  }
  return `${hours}h（${Math.max(1, Math.floor(hours / 24))}天）`;
};

const unwrapHazardDetail = (response: HazardDetailResponse): HazardDetailVO | undefined => {
  const candidate =
    response && typeof response === "object"
      ? ((response as { data?: unknown }).data ??
        (response as { result?: unknown }).result ??
        (response as { details?: unknown }).details ??
        response)
      : undefined;
  if (!candidate || typeof candidate !== "object") {
    return undefined;
  }
  const detail = candidate as HazardDetailVO;
  const record = candidate as Record<string, unknown>;
  const detailWithLogs = detail as DetailWithLogs;
  const fallbackBasicInfo = [record.basicInfo, record.hazardInfo, record.hazard, record.detail].find(
    (item) => item && typeof item === "object" && !Array.isArray(item),
  ) as HazardDetailBasicInfoVO | undefined;
  const fallbackProcessInfo = [record.processInfo, record.process, record.processes].find(
    (item) => item && typeof item === "object" && !Array.isArray(item),
  ) as ProcessInfoRecord | undefined;
  const operationLogs = detailWithLogs.operationLogs ?? detailWithLogs.processLogs;
  if (detail.basicInfo || detail.processInfo || fallbackBasicInfo || fallbackProcessInfo || operationLogs) {
    const mergedDetail: HazardDetailVO = { ...detail };
    const processInfo = {
      ...(fallbackProcessInfo ?? {}),
      ...(detail.processInfo ?? {}),
      ...(operationLogs ? { operationLogs } : {}),
    };
    mergedDetail.basicInfo = detail.basicInfo ?? fallbackBasicInfo;
    if (Object.keys(processInfo).length > 0) {
      mergedDetail.processInfo = processInfo;
    }
    return mergedDetail;
  }
  return { basicInfo: candidate as HazardDetailBasicInfoVO };
};

const readCategoryName = (record: DetailRecord): string => {
  if (Array.isArray(record.categoryNamePath) && record.categoryNamePath.length > 0) {
    return record.categoryNamePath.map(String).join(" / ");
  }
  return readText(record.categoryName, record.hazardCategoryName, record.typeName);
};

const detailSteps: DetailStep[] = [
  { index: 1, status: "PENDING_CONFIRM", shortTitle: "确认" },
  { index: 2, status: "PENDING_PLAN", shortTitle: "填写" },
  { index: 3, status: "PENDING_APPROVAL", shortTitle: "审批" },
  { index: 4, status: "RECTIFYING", shortTitle: "整改" },
  { index: 5, status: "PENDING_ACCEPTANCE", shortTitle: "验收" },
  { index: 6, status: "ACCEPTANCE_COMPLETED", shortTitle: "闭环" },
];

const getActiveStep = (currentDetail: HazardDetailVO): number => {
  const currentStepIndex = currentDetail.statusSteps?.findIndex((step) => step.current);
  if (currentStepIndex !== undefined && currentStepIndex >= 0) {
    return currentStepIndex + 1;
  }
  const status = String(currentDetail.currentStatus || currentDetail.basicInfo?.governanceStatus || "").toUpperCase();
  if (status === "PENDING_CONFIRM") return 1;
  if (status === "PENDING_PLAN" || status === "PLAN_REJECTED") return 2;
  if (status === "PENDING_APPROVAL") return 3;
  if (status === "RECTIFYING" || status === "ACCEPTANCE_REJECTED") return 4;
  if (status === "PENDING_ACCEPTANCE") return 5;
  if (status === "ACCEPTANCE_COMPLETED" || status === "CLOSED") return 6;
  if (currentDetail.processInfo?.acceptanceInfo || currentDetail.basicInfo?.closedTime) return 6;
  if (currentDetail.processInfo?.progressRecords?.length || currentDetail.basicInfo?.latestProgressPercent != null) return 4;
  if (currentDetail.processInfo?.currentPlan) return 3;
  if (currentDetail.basicInfo?.confirmedTime) return 2;
  return 1;
};

const buildDisplaySteps = (statusSteps?: HazardGovernanceStatusStepVO[]): HazardGovernanceStatusStepVO[] =>
  detailSteps.map((defaultStep) => {
    const remoteStep = statusSteps?.find((step) => step.status === defaultStep.status);
    return {
      status: defaultStep.status,
      name: remoteStep?.name || defaultStep.shortTitle,
      current: remoteStep?.current,
      reached: remoteStep?.reached,
    };
  });

const readAiRecognitionCategoryName = (record: DetailRecord): string => readRecordText(record, ["aiRecommendedCategoryName"]);

const recognitionModeChannelText: Record<string, string> = {
  IMAGE: "OCR",
  DESCRIPTION: "NLP",
  IMAGE_DESCRIPTION: "OCR+NLP",
};

const readAnalysisChannel = (record: DetailRecord): string => {
  const mode = readRecordText(record, ["aiRecognitionMode"]);
  return recognitionModeChannelText[mode] || readRecordText(record, ["analysisChannel", "aiAnalysisChannel", "recognitionChannel"]);
};

const sortProgressRecords = (records: HazardRectificationProgressVO[]): HazardRectificationProgressVO[] =>
  [...records].sort((prev, next) => String(next.recordTime ?? "").localeCompare(String(prev.recordTime ?? "")));

const rootCauseText: Record<string, string> = {
  MANAGEMENT_DEFECT: "管理缺陷",
  SYSTEM_DEFICIENCY: "制度缺失",
  EQUIPMENT_AGING: "设备老化",
  TRAINING_INSUFFICIENT: "培训不足",
  DESIGN_DEFECT: "设计缺陷",
  FORCE_MAJEURE: "不可抗力",
  HUMAN_VIOLATION: "人为违规",
};

const approvalStatusConfig: Record<ApprovalStatusKey, { text: string; tone: ApprovalStatusTone }> = {
  PENDING: { text: "待处理", tone: "pending" },
  WAITING: { text: "等待前序节点", tone: "waiting" },
  APPROVED: { text: "已通过", tone: "approved" },
  REJECTED: { text: "已退回", tone: "rejected" },
  UNKNOWN: { text: "未知状态", tone: "unknown" },
};

const normalizeApprovalStatus = (status?: string): ApprovalStatusKey => {
  const normalized = status?.toUpperCase();
  if (normalized === "PENDING" || normalized === "WAITING" || normalized === "APPROVED" || normalized === "REJECTED") {
    return normalized;
  }
  if (normalized && ["PASSED", "PASS", "COMPLETED", "DONE", "SUCCESS"].includes(normalized)) return "APPROVED";
  if (normalized && ["RETURNED", "BACK", "FAILED", "FAIL"].includes(normalized)) return "REJECTED";
  if (normalized && ["PROCESSING", "ACTIVE", "CURRENT", "TODO"].includes(normalized)) return "PENDING";
  return status ? "UNKNOWN" : "PENDING";
};

const getApprovalStatusConfig = (status?: string): { text: string; tone: ApprovalStatusTone } => {
  const normalized = normalizeApprovalStatus(status);
  if (normalized === "UNKNOWN" && status) {
    return { text: renderValue(status), tone: "unknown" };
  }
  return approvalStatusConfig[normalized];
};

const isApprovalPassed = (status?: string): boolean => normalizeApprovalStatus(status) === "APPROVED";

const getApprovalTaskDisplayName = (task: HazardApprovalTaskSummaryVO): string => {
  const record = task as HazardApprovalTaskSummaryVO & Record<string, unknown>;
  const roleName = readRecordText(record, ["roleName", "approverRoleName", "approvalRoleName", "nodeRoleName", "nodeName", "role"]);
  const personName = readRecordText(record, ["personName", "approverName", "operatorName", "approverId"]);
  if (roleName && personName && roleName !== personName) {
    return `${roleName} · ${personName}`;
  }
  return renderValue(roleName || personName);
};

const doneStatuses = new Set(["APPROVED", "PASSED", "COMPLETED", "DONE", "FINISHED", "ACCEPTED", "CLOSED", "SUCCESS"]);
const activeStatuses = new Set(["PROCESSING", "ACTIVE", "CURRENT", "RUNNING", "TODO", "PENDING", "RECTIFYING"]);

const getTimelineTone = (status?: string): TimelineNode["tone"] => {
  const normalized = status?.toUpperCase();
  if (normalized && activeStatuses.has(normalized)) return "active";
  if (normalized && doneStatuses.has(normalized)) return "done";
  return "done";
};

const getLogTitle = (record: ProcessLogRecord): string => {
  const explicitTitle = readRecordText(record, ["title", "actionName", "nodeName", "operationName", "stageName", "eventName"]);
  if (explicitTitle) return explicitTitle;
  const action = readRecordText(record, ["action", "operationType", "type", "nodeKey"]).toUpperCase();
  if (["APPROVE", "PASS", "AGREE"].includes(action)) return "审批通过";
  if (["REJECT", "RETURN", "BACK"].includes(action)) return "审批退回";
  if (["CONFIRM"].includes(action)) return "确认属实 · 指派整改人";
  if (["SUBMIT_APPROVAL"].includes(action)) return "提交审批";
  if (["SUBMIT_ACCEPTANCE"].includes(action)) return "提交验收";
  if (["ACCEPT", "ACCEPTANCE"].includes(action)) return "验收通过 · 闭环归档";
  return renderValue(action || readRecordText(record, ["statusName", "status"]));
};

const mapLogRecordToTimeline = (record: ProcessLogRecord, index: number): TimelineNode => {
  const operatedTime = readRecordText(record, ["operatedTime", "operationTime", "handleTime", "recordTime", "completedTime", "createTime"]);
  const operator = readRecordText(record, [
    "operatorName",
    "handlerName",
    "userName",
    "creatorName",
    "approverName",
    "recordUserName",
    "submittedByName",
    "operatorId",
  ]);
  return {
    id: readRecordText(record, ["id", "logId", "recordId"]) || `${operatedTime || "process"}-${index}`,
    title: getLogTitle(record),
    operator: operator || "系统",
    operatedTime,
    content: readRecordText(record, ["content", "remark", "opinion", "description", "message", "detail", "summary"]),
    tone: getTimelineTone(readRecordText(record, ["status", "state", "operationStatus", "nodeStatus"])),
  };
};

const readProcessLogRecords = (currentDetail: HazardDetailVO): HazardProcessLogVO[] => {
  const detailRecord = currentDetail as DetailWithLogs;
  const processInfo = currentDetail.processInfo as ProcessInfoRecord | undefined;
  const candidates = [
    processInfo?.operationLogs,
    processInfo?.processLogs,
    processInfo?.logs,
    processInfo?.records,
    processInfo?.historyRecords,
    detailRecord.operationLogs,
    detailRecord.processLogs,
    detailRecord.logs,
  ];
  return (candidates.find(Array.isArray) ?? []) as HazardProcessLogVO[];
};

const createFallbackTimeline = (currentDetail: HazardDetailVO): TimelineNode[] => {
  const basicInfo = currentDetail.basicInfo;
  const processInfo = currentDetail.processInfo;
  const nodes: TimelineNode[] = [];
  if (!basicInfo) return nodes;
  const record = basicInfo as DetailRecord;
  const categoryName = readCategoryName(record);
  if (basicInfo.reportedTime || categoryName || basicInfo.level) {
    nodes.push({
      id: "auto-level",
      title: "隐患上报",
      operator: "系统",
      operatedTime: basicInfo.reportedTime || "",
      content: `类型：${renderValue(categoryName)}，等级：${formatServiceLevel(basicInfo.level)}`,
      tone: "active",
    });
  }
  if (basicInfo.confirmedTime || basicInfo.confirmUserName || basicInfo.responsibleUserName) {
    nodes.push({
      id: "confirm",
      title: "确认与分级",
      operator: renderValue(basicInfo.confirmUserName ?? basicInfo.confirmUserId),
      operatedTime: basicInfo.confirmedTime || "",
      content: `整改人：${renderValue(basicInfo.responsibleUserName ?? basicInfo.responsibleUserId)}，验收人：${renderValue(
        basicInfo.acceptanceUserName ?? basicInfo.acceptanceUserId,
      )}`,
      tone: "done",
    });
  }
  const plan = processInfo?.currentPlan;
  if (plan?.submittedTime || plan?.rectificationContent || plan?.rectificationMeasures) {
    nodes.push({
      id: "submit-plan",
      title: "提交整改方案",
      operator: renderValue(plan.submittedByName ?? plan.submittedName ?? plan.submittedBy),
      operatedTime: plan.submittedTime || "",
      content: renderValue(plan.rectificationMeasures || plan.rectificationContent),
      tone: "done",
    });
  }
  (processInfo?.approvalTasks ?? []).forEach((task, index) => {
    nodes.push({
      id: `approval-${String(task.id ?? task.sequenceNo ?? index)}`,
      title: getTimelineTone(task.status) === "done" ? "审批通过" : renderValue(task.nodeName || "审批节点"),
      operator: renderValue(task.approverName ?? task.approverId),
      operatedTime: task.completedTime || task.activatedTime || "",
      content: `审批状态：${getApprovalStatusConfig(task.status).text}`,
      tone: getTimelineTone(task.status),
    });
  });
  (processInfo?.progressRecords ?? []).forEach((progress, index) => {
    nodes.push({
      id: `progress-${String(progress.id ?? index)}`,
      title: "执行整改",
      operator: renderValue(progress.recordUserName ?? progress.recordUserId),
      operatedTime: progress.recordTime || "",
      content: `进度更新：${renderValue(progress.progressPercent)}%${progress.progressContent ? `。${progress.progressContent}` : ""}`,
      tone: progress.progressPercent === 100 ? "done" : "active",
    });
  });
  return nodes;
};

const getTimelineNodes = (currentDetail: HazardDetailVO): TimelineNode[] => {
  const logs = readProcessLogRecords(currentDetail).map((item, index) => mapLogRecordToTimeline(item as ProcessLogRecord, index));
  const nodes = logs.length > 0 ? logs : createFallbackTimeline(currentDetail);
  return [...nodes].sort((prev, next) => String(next.operatedTime).localeCompare(String(prev.operatedTime)));
};

const readImages = (record: DetailRecord): FileVO[] => {
  if (Array.isArray(record.sceneImages)) {
    return record.sceneImages;
  }
  if (Array.isArray(record.images)) {
    return record.images;
  }
  return [];
};

const previewImage = (images: FileVO[], currentImage: FileVO): void => {
  const previewImages = images.filter((image): image is FileVO & { path: string } => Boolean(image.path));
  const startPosition = previewImages.findIndex((image) => image === currentImage);
  if (startPosition < 0) {
    return;
  }
  showImagePreview({
    images: previewImages.map((image) => image.path),
    startPosition,
    closeable: true,
  });
};

const renderInfoRows = (rows: DetailRow[]): JSX.Element => (
  <div class={styles.detailInfoRows}>
    {rows.map((row) => (
      <div class={styles.detailInfoRow} key={row.label}>
        <span>{row.label}</span>
        <strong>{row.value || "-"}</strong>
      </div>
    ))}
  </div>
);

const renderSourceBadge = (sourceType?: string): JSX.Element => <em class={styles.sourceBadge}>{formatServiceSource(sourceType)}</em>;

const renderTextBlock = (label: string, value?: string, ordered = false): JSX.Element | null => {
  const lines = splitTextLines(value);
  if (lines.length === 0 && !value) {
    return null;
  }
  return (
    <div class={styles.detailTextBlock}>
      <span>{label}</span>
      {ordered ? (
        <ol>
          {lines.map((line, index) => (
            <li key={`${line}-${index}`}>{line}</li>
          ))}
        </ol>
      ) : (
        <p>{renderValue(value)}</p>
      )}
    </div>
  );
};

const renderFileBlock = (label: string, files?: FileVO[], emptyText = "暂无照片"): JSX.Element => (
  <div class={styles.detailFileBlock}>
    <span>{label}</span>
    <div class={styles.detailPhotoRow}>
      {files?.length ? (
        files.map((image, index) =>
          image.path ? (
            <Image
              key={String(image.id ?? index)}
              src={image.path}
              fit="cover"
              width="64px"
              height="64px"
              radius="8px"
              onClick={() => previewImage(files, image)}
            />
          ) : (
            <div class={styles.detailPhotoPlaceholder} key={String(image.id ?? index)}>
              <Icon name="photograph" size="24" />
            </div>
          ),
        )
      ) : (
        <div class={styles.detailEmptyInline}>{emptyText}</div>
      )}
    </div>
  </div>
);

const renderAiPanel = (title: string, rows: DetailRow[], content?: string): JSX.Element | null => {
  const hasRows = rows.some((row) => row.value !== undefined && row.value !== null && row.value !== "");
  const sanitizedContent = sanitizeRichText(content ?? "");
  const hasContent = hasRichTextContent(sanitizedContent);
  if (!hasRows && !hasContent) {
    return null;
  }
  return (
    <div class={styles.detailAiPanel}>
      <div class={styles.detailAiTitle}>
        <Icon name="cluster-o" size="14" />
        <strong>{title}</strong>
      </div>
      {hasRows ? renderInfoRows(rows) : null}
      {hasContent ? <div class={styles.detailAiContent} innerHTML={sanitizedContent} /> : null}
    </div>
  );
};

const renderProgressBar = (percent: number): JSX.Element => (
  <div class={styles.detailProgressBar}>
    <i style={{ width: `${Math.min(100, Math.max(0, percent))}%` }} />
  </div>
);

const renderStatusSteps = (activeStep: number, statusSteps?: HazardGovernanceStatusStepVO[]): JSX.Element => (
  <div class={styles.detailStatusSteps}>
    {buildDisplaySteps(statusSteps).map((step, index) => {
      const stepIndex = index + 1;
      const current = Boolean(step.current) || stepIndex === activeStep;
      const done = statusSteps?.length ? Boolean(step.reached) && !current : activeStep === detailSteps.length || stepIndex < activeStep;
      return (
        <div class={styles.detailStatusStepWrap} key={String(step.status ?? stepIndex)}>
          <div
            class={[styles.detailStatusStep, done ? styles.detailStatusStepDone : "", current ? styles.detailStatusStepCurrent : ""].filter(
              Boolean,
            )}
          >
            <span>{done ? "✓" : stepIndex}</span>
            <strong>{step.name || detailSteps[index]?.shortTitle}</strong>
          </div>
          {index < detailSteps.length - 1 ? (
            <i class={[styles.detailStatusConnector, done ? styles.detailStatusConnectorDone : ""]} />
          ) : null}
        </div>
      );
    })}
  </div>
);

const renderTimeline = (nodes: TimelineNode[]): JSX.Element => (
  <div class={styles.detailTimeline}>
    {nodes.length ? (
      nodes.map((node) => (
        <div class={[styles.detailTimelineItem, node.tone === "active" ? styles.detailTimelineItemActive : ""]} key={node.id}>
          <span class={styles.detailTimelineMarker}>{node.tone === "done" ? "✓" : "…"}</span>
          <div class={styles.detailTimelineContent}>
            <strong>{node.title}</strong>
            <span>
              {renderValue(node.operator)} · {formatServiceDate(node.operatedTime)}
            </span>
            {node.content ? <p>{node.content}</p> : null}
          </div>
        </div>
      ))
    ) : (
      <div class={styles.detailEmpty}>暂无处理过程</div>
    )}
  </div>
);

export const HazardDetailPopup = defineComponent({
  name: "HazardDetailPopup",
  props: {
    show: {
      type: Boolean,
      required: true,
    },
    record: {
      type: Object as PropType<HazardLedgerRecordVO | null>,
      default: null,
    },
  },
  emits: ["update:show", "confirm", "misreport"],
  setup: (props, { emit }) => {
    const router = useRouter();
    const detail = shallowRef<HazardDetailVO | null>(null);
    const loading = shallowRef(false);
    const expandedKeys = shallowRef<Set<string>>(new Set(["report", "confirm", "plan", "approval", "execution", "acceptance", "logs"]));
    let requestVersion = 0;

    const close = (): void => {
      emit("update:show", false);
    };

    const loadDetail = async (id: string | number): Promise<void> => {
      requestVersion += 1;
      const version = requestVersion;
      loading.value = true;
      try {
        const response = await useAuthRequest(() => getHazardDetail(id));
        detail.value = unwrapHazardDetail(response);
      } catch (error) {
        if (version === requestVersion) {
          detail.value = null;
          showToast(error instanceof Error ? error.message : "详情加载失败，已展示列表信息");
        }
      } finally {
        if (version === requestVersion) {
          loading.value = false;
        }
      }
    };

    const isExpanded = (key: string): boolean => expandedKeys.value.has(key);

    const toggleSection = (key: string, locked?: boolean): void => {
      if (locked) {
        return;
      }
      const nextKeys = new Set(expandedKeys.value);
      if (nextKeys.has(key)) {
        nextKeys.delete(key);
      } else {
        nextKeys.add(key);
      }
      expandedKeys.value = nextKeys;
    };

    watch(
      () => [props.show, props.record?.id] as const,
      ([show, id]) => {
        requestVersion += 1;
        detail.value = null;
        loading.value = false;
        expandedKeys.value = new Set(["report", "confirm", "plan", "approval", "execution", "acceptance", "logs"]);
        if (show && id != null) {
          void loadDetail(id);
        }
      },
      { immediate: true },
    );

    const displayRecord = computed<DetailRecord | null>(() => {
      const loadedDetail = detail.value?.basicInfo as DetailRecord | null | undefined;
      if (!loadedDetail) {
        return props.record as DetailRecord | null;
      }
      if (!props.record) {
        return loadedDetail;
      }
      const listActions = readHazardActions(props.record);
      return listActions.length > 0 ? { ...props.record, ...loadedDetail, actions: listActions } : { ...props.record, ...loadedDetail };
    });

    return () => {
      const record = displayRecord.value as DetailRecord | null;
      if (!record) {
        return (
          <Popup
            show={props.show}
            position="bottom"
            round
            onUpdate:show={(show: boolean) => {
              if (!show) close();
            }}
          />
        );
      }

      const currentDetail: HazardDetailVO = detail.value
        ? { ...detail.value, basicInfo: record as HazardDetailBasicInfoVO }
        : { basicInfo: record as HazardDetailBasicInfoVO };
      const activeStep = getActiveStep(currentDetail);
      const processInfo = currentDetail.processInfo;
      const plan = processInfo?.currentPlan as (HazardRectificationPlanVO & Record<string, unknown>) | undefined;
      const approvalTasks = processInfo?.approvalTasks ?? [];
      const progressRecords = sortProgressRecords(processInfo?.progressRecords ?? []);
      const acceptanceInfo = processInfo?.acceptanceInfo;
      const timelineNodes = getTimelineNodes(currentDetail);
      const reporterName = readFieldText(record, ["reporterName", "reporterId", "reportedByName", "foundByName", "createdByName"]);
      const confirmUserName = readFieldText(record, ["confirmUserName", "confirmUserId"]);
      const categoryName = readCategoryName(record);
      const aiRecognitionCategoryName = readAiRecognitionCategoryName(record);
      const analysisChannel = readAnalysisChannel(record);
      const aiRecognitionType = aiRecognitionCategoryName || readRecordText(record, ["aiRecommendedCategoryId"]);
      const showAiRecognitionResult = Boolean(aiRecognitionType || analysisChannel);
      const deadlineText = readFieldText(record, ["deadline", "rectificationDeadline"]);
      const rectificationDeadline = record.rectificationDeadlineHours
        ? formatRectificationDeadlineHours(record.rectificationDeadlineHours)
        : formatServiceDate(deadlineText);
      const overdueText = record.overdue ? `已超${Math.max(1, Math.ceil((record.overdueHours ?? 0) / 24))}天` : "";
      const latestProgress = toNumber(record.latestProgressPercent ?? progressRecords[0]?.progressPercent, 0);
      const approvedTaskCount = approvalTasks.filter((task) => isApprovalPassed(task.status)).length;
      const approvalMeta =
        approvalTasks.length > 0
          ? `${approvedTaskCount}/${approvalTasks.length} ${approvedTaskCount === approvalTasks.length ? "通过" : "审批中"}`
          : "暂无审批记录";
      const acceptanceLog = timelineNodes.find((node) => node.title.includes("验收"));
      const acceptanceTime = acceptanceInfo?.closedTime || record.closedTime || acceptanceLog?.operatedTime;
      const submittedTime = acceptanceInfo?.submittedTime || record.rectificationSubmittedTime;
      const acceptanceUserName =
        acceptanceInfo?.acceptanceUserName || acceptanceInfo?.acceptanceUserId || record.acceptanceUserName || record.acceptanceUserId;
      const aiAcceptanceSuggestion = acceptanceInfo?.aiAcceptanceSuggestion || record.aiAcceptanceSuggestion;
      const rootCauseCode = acceptanceInfo?.rootCauseCode || record.rootCauseCode;
      const planSceneImages = plan?.sceneImages?.length ? plan.sceneImages : readImages(record);
      const reportImages = readImages(record);
      const actionButtons = renderHazardActions(record, {
        router,
        openConfirm: (target) => {
          close();
          emit("confirm", target);
        },
        openMisreport: (target) => {
          close();
          emit("misreport", target);
        },
      });

      const renderSection = (options: {
        key: string;
        index?: number;
        title: string;
        meta?: string;
        locked?: boolean;
        log?: boolean;
        children: VNodeChild;
      }): JSX.Element => {
        const expanded = isExpanded(options.key) && !options.locked;
        return (
          <section class={[styles.detailSection, options.locked ? styles.detailSectionLocked : ""].filter(Boolean)}>
            <button
              class={styles.detailSectionHeader}
              type="button"
              disabled={options.locked}
              onClick={() => toggleSection(options.key, options.locked)}
            >
              <div class={styles.detailSectionTitle}>
                {options.log ? <Icon name="records-o" size="18" /> : <span class={styles.detailSectionIndex}>{options.index}</span>}
                <strong>{options.title}</strong>
                {options.meta ? <em>{options.meta}</em> : null}
              </div>
              <Icon name={expanded ? "arrow-up" : "arrow-down"} size="16" />
            </button>
            {expanded ? <div class={styles.detailSectionBody}>{options.children}</div> : null}
          </section>
        );
      };

      return (
        <Popup
          show={props.show}
          position="bottom"
          round
          onUpdate:show={(show: boolean) => {
            if (!show) close();
          }}
        >
          <PageLoadingOverlay show={loading.value} text="详情加载中..." />
          <div class={styles.detailSheet}>
            <div class={styles.prototypeDetailHeader}>
              <strong>隐患详情 - {record.code || record.id}</strong>
              <button class={styles.prototypeDetailClose} type="button" onClick={close}>
                <Icon name="cross" size="18" />
              </button>
            </div>
            <div class={styles.prototypeDetailBody}>
              {renderStatusSteps(activeStep, currentDetail.statusSteps)}
              {renderSection({
                key: "report",
                index: 1,
                title: "隐患上报",
                meta: formatServiceDate(record.reportedTime),
                children: (
                  <>
                    {renderFileBlock("现场照片", reportImages)}
                    {showAiRecognitionResult
                      ? renderAiPanel("AI 识别结果", [
                          { label: "隐患类型", value: aiRecognitionType },
                          { label: "分析通道", value: analysisChannel || "--" },
                        ])
                      : null}
                    {renderInfoRows([
                      { label: "隐患类型", value: readText(categoryName, record.categoryId) },
                      { label: "来源", value: renderSourceBadge(record.sourceType) },
                      { label: "位置", value: readText(record.locationName) },
                      { label: "发现人", value: readText(reporterName) },
                      { label: "发现时间", value: formatServiceDate(record.reportedTime) },
                    ])}
                    {renderTextBlock("隐患描述", record.description)}
                  </>
                ),
              })}
              {renderSection({
                key: "confirm",
                index: 2,
                title: "确认与分级",
                meta: formatServiceDate(record.confirmedTime),
                locked: activeStep < 2,
                children: renderInfoRows([
                  { label: "确认人", value: readText(confirmUserName) },
                  { label: "确认时间", value: formatServiceDate(record.confirmedTime) },
                  { label: "隐患等级", value: formatServiceLevel(record.level) },
                  { label: "整改截止日", value: `${readText(rectificationDeadline)}${overdueText ? ` · ${overdueText}` : ""}` },
                  { label: "风险单元", value: readText(record.riskUnitName, record.riskUnitId) },
                  { label: "风险对象", value: readText(record.riskObjectName, record.riskObjectId) },
                  { label: "整改责任人", value: readText(record.responsibleUserName, record.responsibleUserId) },
                  { label: "验收人", value: readText(record.acceptanceUserName, record.acceptanceUserId) },
                ]),
              })}
              {renderSection({
                key: "plan",
                index: 3,
                title: "整改方案",
                meta: plan?.submittedTime
                  ? `${formatServiceDate(plan.submittedTime)}提交${plan.approvedTime ? ` · ${formatServiceDate(plan.approvedTime)}通过` : ""}`
                  : "",
                locked: activeStep < 3,
                children: (
                  <>
                    {renderTextBlock("整改内容", plan?.rectificationContent)}
                    {renderTextBlock("整改措施", plan?.rectificationMeasures, true)}
                    {renderTextBlock("临时管控措施", plan?.temporaryControlMeasures)}
                    {renderFileBlock("整改前照片", planSceneImages)}
                    {renderAiPanel("AI 处置建议", [], plan?.aiDisposalSuggestion || record.aiDisposalSuggestion)}
                  </>
                ),
              })}
              {renderSection({
                key: "approval",
                index: 4,
                title: "审批记录",
                meta: approvalMeta,
                locked: activeStep < 3,
                children: approvalTasks.length ? (
                  <div class={styles.detailApprovalList}>
                    {approvalTasks.map((task, index) => {
                      const statusConfig = getApprovalStatusConfig(task.status);
                      return (
                        <article
                          class={[styles.detailApprovalItem, styles[`approvalTone${statusConfig.tone}`]].filter(Boolean)}
                          key={String(task.id ?? task.sequenceNo ?? index)}
                        >
                          <div>
                            <strong>{getApprovalTaskDisplayName(task)}</strong>
                            <span>{formatServiceDate(task.completedTime || task.activatedTime)}</span>
                          </div>
                          <em>{statusConfig.text}</em>
                        </article>
                      );
                    })}
                  </div>
                ) : (
                  <div class={styles.detailEmpty}>暂无审批记录</div>
                ),
              })}
              {renderSection({
                key: "execution",
                index: 5,
                title: "整改执行过程",
                meta: `进度 ${latestProgress}%`,
                locked: activeStep < 4,
                children: (
                  <>
                    {renderProgressBar(latestProgress)}
                    {progressRecords.length ? (
                      <div class={styles.detailProgressRecords}>
                        {progressRecords.map((progress, index) => (
                          <article key={String(progress.id ?? index)}>
                            <header>
                              <span>
                                {formatServiceDate(progress.recordTime)} · {renderValue(progress.recordUserName ?? progress.recordUserId)} ·
                                进度 {renderValue(progress.progressPercent)}%
                              </span>
                            </header>
                            <p>{renderValue(progress.progressContent)}</p>
                            {renderFileBlock("整改后照片", progress.afterImages, "暂无整改后照片")}
                          </article>
                        ))}
                      </div>
                    ) : (
                      <div class={styles.detailEmpty}>暂无整改汇报记录</div>
                    )}
                  </>
                ),
              })}
              {renderSection({
                key: "acceptance",
                index: 6,
                title: "验收结果",
                meta: activeStep < 6 ? "等待提交验收" : formatServiceDate(acceptanceTime),
                locked: activeStep < 6,
                children: (
                  <>
                    {renderInfoRows([
                      { label: "治理状态", value: formatServiceStatus(record.governanceStatus) },
                      { label: "验收人", value: readText(acceptanceUserName) },
                      { label: "提交验收时间", value: formatServiceDate(submittedTime) },
                      { label: "验收时间", value: formatServiceDate(acceptanceTime) },
                      {
                        label: "最终根因",
                        value: renderValue(rootCauseCode ? rootCauseText[String(rootCauseCode)] || String(rootCauseCode) : ""),
                      },
                      { label: "退回次数", value: renderValue(acceptanceInfo?.rejectCount ?? record.acceptanceRejectCount) },
                    ])}
                    {renderAiPanel("AI 验收建议", [], aiAcceptanceSuggestion)}
                  </>
                ),
              })}
              {renderSection({
                key: "logs",
                title: `操作日志（共${timelineNodes.length}条）`,
                log: true,
                children: renderTimeline(timelineNodes),
              })}
            </div>
            {actionButtons ? <div class={styles.detailFooter}>{actionButtons}</div> : null}
          </div>
        </Popup>
      );
    };
  },
});
