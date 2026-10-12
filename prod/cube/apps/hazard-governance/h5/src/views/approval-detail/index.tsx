import { Button, Cell, CellGroup, Field, showImagePreview, showToast } from "vant";
import { computed, defineComponent, onMounted, shallowRef, type VNode } from "vue";
import { useRoute, useRouter } from "vue-router";

import { CubeNavBar } from "@ghcloud/cube-app-generic-component";
import { cubeAppService } from "@ghcloud/cube-app-js-sdk";
import { getEnvironment } from "@ghcloud/cube-app-js-sdk/src/js/cube-h5-config";
import { HazardActionCode } from "@ghcloud/cube-service-interface/hazard-governance";
import type { HazardApprovalDetailVO } from "@ghcloud/cube-service-interface/hazard-governance";
import { useAuthRequest } from "@ghcloud/cube-services-client/auth-request";
import {
  approveHazardApprovalTask,
  getHazardApprovalTaskDetail,
  rejectHazardApprovalTask,
} from "@ghcloud/cube-services-client/hazard-governance.client";

import { PageLoadingOverlay } from "@/components/page-loading-overlay";
import { HAZARD_H5_FIELD_LIMITS } from "@/utils/field-limits";
import { hasRichTextContent, sanitizeRichText } from "@/utils/rich-text";
import { normalizeHazardAction } from "@/views/hazard-ledger/hazard-actions";
import { formatServiceDate, renderServiceLevelTag } from "@/views/hazard-service-utils";
import { getPlanAttachments, normalizePlanAttachmentFiles, type UploadedPlanAttachment } from "@/views/rectification-form/plan-attachments";

import styles from "./index.module.less";

const readQuery = (value: unknown): string => (typeof value === "string" && value ? value : "-");
const readValue = (value: unknown): string => (value == null || value === "" ? "-" : String(value));
const imageSuffixes = new Set(["jpg", "jpeg", "png", "gif", "bmp", "webp", "svg"]);

const readFileName = (file: UploadedPlanAttachment): string => readValue(file.name ?? file.fileName ?? file.id ?? file.fileId);
const readFileUrl = (file: UploadedPlanAttachment): string => file.path || file.endpointPath || file.url || "";
const readFileSuffix = (file: UploadedPlanAttachment): string => {
  const name = readFileName(file);
  const suffix = file.suffix ?? file.type ?? name.slice(name.lastIndexOf(".") + 1);
  return String(suffix || "")
    .replace(/^\./, "")
    .toLowerCase();
};
const isImageAttachment = (file: UploadedPlanAttachment): boolean => imageSuffixes.has(readFileSuffix(file));
const toAbsoluteUrl = (url: string): string => {
  if (/^https?:\/\//i.test(url)) {
    return url;
  }
  return `${window.location.origin}${url.startsWith("/") ? "" : "/"}${url}`;
};
const toBase64 = (value: string): string => {
  const binary = encodeURIComponent(value).replace(/%([0-9A-F]{2})/g, (_, hex: string) => String.fromCharCode(Number.parseInt(hex, 16)));
  return window.btoa(binary);
};

type ApprovalDetailWithAi = HazardApprovalDetailVO & {
  aiDisposalSuggestion?: string;
  basicInfo?: {
    aiDisposalSuggestion?: string;
  };
};

export const ApprovalDetailPage = defineComponent({
  name: "ApprovalDetailPage",
  setup: () => {
    document.title = "审批详情";
    const route = useRoute();
    const router = useRouter();
    const opinion = shallowRef("");
    const detail = shallowRef<HazardApprovalDetailVO | null>(null);
    const loading = shallowRef(false);
    const submitting = shallowRef(false);
    const taskId = computed(() => readQuery(route.query.approvalTaskId ?? route.query.taskId));
    const record = computed(() => ({
      code: readValue(detail.value?.code ?? route.query.code ?? route.query.hazardId ?? route.query.id),
      description: readValue(detail.value?.description ?? route.query.description),
      level: readValue(detail.value?.level ?? route.query.level),
      submittedName: readValue(
        detail.value?.submittedByName ?? detail.value?.submittedName ?? detail.value?.submittedBy ?? route.query.submittedName,
      ),
      submittedTime: formatServiceDate(detail.value?.submittedTime ?? route.query.submittedTime),
      deadline: formatServiceDate(detail.value?.deadline ?? route.query.deadline),
      locationName: readValue(detail.value?.locationName),
      approvalTaskId: readValue(detail.value?.approvalTaskId ?? route.query.approvalTaskId),
      planContent: readValue(detail.value?.plan?.rectificationContent),
      planMeasures: readValue(detail.value?.plan?.rectificationMeasures),
      temporaryControlMeasures: readValue(detail.value?.plan?.temporaryControlMeasures),
      estimatedFinishTime: formatServiceDate(detail.value?.plan?.estimatedFinishTime),
      planSubmittedUser: readValue(
        detail.value?.plan?.submittedByName ?? detail.value?.plan?.submittedName ?? detail.value?.plan?.submittedBy,
      ),
      planSubmittedTime: formatServiceDate(detail.value?.plan?.submittedTime),
    }));
    const approvalSteps = computed(() => detail.value?.approvalChain ?? []);
    const approvalHistory = computed(() => detail.value?.approvalHistory ?? []);
    const planAttachments = computed(() => normalizePlanAttachmentFiles(getPlanAttachments(detail.value)));
    const aiDisposalSuggestion = computed(() => {
      const currentDetail = detail.value as ApprovalDetailWithAi | null;
      return sanitizeRichText(currentDetail?.basicInfo?.aiDisposalSuggestion ?? currentDetail?.aiDisposalSuggestion ?? "");
    });
    const showAiDisposalSuggestion = computed(() => hasRichTextContent(aiDisposalSuggestion.value));
    const canApprove = computed(
      () =>
        detail.value?.canApprove !== false &&
        (detail.value?.actions?.length
          ? detail.value.actions.some((action) => normalizeHazardAction(action) === HazardActionCode.APPROVAL)
          : taskId.value !== "-"),
    );

    const loadDetail = async (): Promise<void> => {
      if (taskId.value === "-") {
        showToast("缺少审批任务ID");
        return;
      }
      loading.value = true;
      try {
        detail.value = await useAuthRequest(() => getHazardApprovalTaskDetail(taskId.value));
      } catch (error) {
        showToast(error instanceof Error ? error.message : "审批详情加载失败，已展示列表信息");
      } finally {
        loading.value = false;
      }
    };

    const submitApproval = async (approved: boolean): Promise<void> => {
      if (taskId.value === "-" || submitting.value) {
        return;
      }
      const approvalOpinion = opinion.value.trim();
      if (!approvalOpinion) {
        showToast("请填写审批意见");
        return;
      }
      submitting.value = true;
      try {
        const payload = {
          opinion: approvalOpinion,
        };
        await useAuthRequest(() =>
          approved ? approveHazardApprovalTask(taskId.value, payload) : rejectHazardApprovalTask(taskId.value, payload),
        );
        showToast(approved ? "审批已通过" : "审批已退回");
        opinion.value = "";
        await router.replace({ name: "approvals" });
      } catch (error) {
        showToast(error instanceof Error ? error.message : "审批提交失败，请稍后重试");
      } finally {
        submitting.value = false;
      }
    };

    const previewAttachment = (file: UploadedPlanAttachment): void => {
      const url = readFileUrl(file);
      if (!url) {
        showToast(`暂无可阅览地址：${readFileName(file)}`);
        return;
      }
      if (isImageAttachment(file)) {
        const images = planAttachments.value.filter(isImageAttachment).map(readFileUrl).filter(Boolean);
        showImagePreview({
          images,
          startPosition: Math.max(0, images.indexOf(url)),
          closeable: true,
        });
        return;
      }
      const absoluteUrl = toAbsoluteUrl(url);
      const previewUrl = `${window.location.origin}/tools/kkfileview/onlinePreview?url=${encodeURIComponent(
        toBase64(absoluteUrl),
      )}&fileName=${encodeURIComponent(readFileName(file))}`;
      window.open(previewUrl);
    };

    const downloadAttachment = async (file: UploadedPlanAttachment): Promise<void> => {
      const url = readFileUrl(file);
      if (!url) {
        showToast(`暂无可下载地址：${readFileName(file)}`);
        return;
      }
      const fileName = readFileName(file);
      try {
        if (getEnvironment() === "cubeApp") {
          await cubeAppService.downloadFile({ filePath: url, fileName });
          return;
        }
        const anchor = document.createElement("a");
        anchor.href = url;
        anchor.download = fileName;
        anchor.target = "_blank";
        anchor.rel = "noopener noreferrer";
        document.body.appendChild(anchor);
        anchor.click();
        document.body.removeChild(anchor);
      } catch {
        showToast("附件下载失败，请稍后重试");
      }
    };

    const renderPlanAttachments = (): JSX.Element | null => {
      if (planAttachments.value.length === 0) {
        return null;
      }
      return (
        <div class={styles.attachmentList}>
          {planAttachments.value.map((file) => (
            <div class={styles.attachmentItem} key={String(file.id ?? file.fileId)}>
              <div class={styles.attachmentMeta}>
                <strong>{readFileName(file)}</strong>
                <span>{readValue(readFileSuffix(file))}</span>
              </div>
              <div class={styles.attachmentActions}>
                <Button
                  size="mini"
                  type="primary"
                  plain
                  onClick={() => {
                    previewAttachment(file);
                  }}
                >
                  阅览
                </Button>
                <Button
                  size="mini"
                  type="primary"
                  plain
                  onClick={() => {
                    void downloadAttachment(file);
                  }}
                >
                  下载
                </Button>
              </div>
            </div>
          ))}
        </div>
      );
    };

    onMounted(() => {
      void loadDetail();
    });

    const renderApprovalFlow = (): JSX.Element => {
      if (approvalSteps.value.length === 0 && approvalHistory.value.length === 0) {
        return (
          <div class={styles.stepList}>
            <div class={styles.step}>
              <span class={`${styles.stepDot} ${styles.stepCurrent}`}>●</span>
              <div class={styles.stepText}>
                <strong>{readValue(detail.value?.approverName ?? detail.value?.approverId)}</strong>
                <div class={styles.muted}>当前审批节点</div>
              </div>
            </div>
          </div>
        );
      }
      const historyByTaskId = new Map(approvalHistory.value.map((item) => [String(item.approvalTaskId ?? ""), item]));
      return (
        <div class={styles.stepList}>
          {approvalSteps.value.map((step, index) => {
            const history = historyByTaskId.get(String(step.id ?? step.approvalTaskId ?? ""));
            const done = Boolean(step.completedTime || history?.operatedTime);
            const current = !done && (step.status === detail.value?.taskStatus || String(step.id) === String(detail.value?.approvalTaskId));
            return (
              <div class={styles.step} key={String(step.id ?? index)}>
                <span class={`${styles.stepDot} ${done ? styles.stepDone : current ? styles.stepCurrent : ""}`}>
                  {done ? "✓" : current ? "●" : "○"}
                </span>
                <div class={styles.stepText}>
                  <strong>{readValue(step.nodeName ?? step.approverName ?? step.approverId)}</strong>
                  <div class={styles.muted}>
                    {done
                      ? formatServiceDate(step.completedTime ?? history?.operatedTime)
                      : current
                        ? "当前审批节点"
                        : "等待上一节点审批通过后流转"}
                  </div>
                  {history?.opinion ? <div class={styles.passText}>已通过 — {history.opinion}</div> : null}
                </div>
              </div>
            );
          })}
        </div>
      );
    };

    return (): VNode => (
      <>
        <CubeNavBar showBack title="审批详情" />
        <PageLoadingOverlay show={loading.value} text="详情加载中..." />
        <div class={styles.container}>
          <div class={styles.content}>
            <CellGroup inset class={styles.block}>
              <div class={styles.sectionTitle}>
                <span class={styles.sectionBar} />
                隐患信息
              </div>
              <Cell title="编号" value={record.value.code} />
              <Cell title="等级">
                {{
                  value: () => renderServiceLevelTag(record.value.level),
                }}
              </Cell>
              <Cell title="描述" label={record.value.description} />
              <Cell title="位置" value={record.value.locationName} />
              <Cell title="提交人" value={record.value.submittedName} />
              <Cell title="提交时间" value={record.value.submittedTime} />
              <Cell title="审批截止" value={record.value.deadline} />
            </CellGroup>
            <CellGroup inset class={styles.block}>
              <div class={styles.sectionTitle}>
                <span class={styles.sectionBar} />
                整改方案
              </div>
              <Cell title="方案提交人" value={record.value.planSubmittedUser} />
              <Cell title="方案提交时间" value={record.value.planSubmittedTime} />
              <Cell title="整改内容" label={record.value.planContent} />
              <Cell title="整改措施" label={record.value.planMeasures} />
              <Cell title="临时管控" label={record.value.temporaryControlMeasures} />
              <Cell title="预计完成" value={record.value.estimatedFinishTime} />
              {planAttachments.value.length > 0 ? (
                <Field label="方案附件" label-align="top" readonly>
                  {{
                    input: renderPlanAttachments,
                  }}
                </Field>
              ) : null}
            </CellGroup>
            {showAiDisposalSuggestion.value ? (
              <div class={styles.aiPanel}>
                <div class={styles.aiHead}>
                  <strong>AI 处置建议</strong>
                  <span>AI生成 · 仅供参考</span>
                </div>
                <div class={styles.aiRichText} innerHTML={aiDisposalSuggestion.value} />
              </div>
            ) : null}
            <CellGroup inset class={styles.block}>
              <div class={styles.sectionTitle}>
                <span class={styles.sectionBar} />
                审批流程
              </div>
              {renderApprovalFlow()}
            </CellGroup>
            <CellGroup inset class={styles.block}>
              <Field
                v-model={opinion.value}
                label="审批意见"
                label-align="top"
                type="textarea"
                autosize
                rows={3}
                required
                placeholder="请输入审批意见"
                maxlength={HAZARD_H5_FIELD_LIMITS.longText}
                showWordLimit
              />
            </CellGroup>
          </div>
          <div class={styles.actions}>
            <Button
              block
              type="danger"
              plain
              disabled={!canApprove.value}
              loading={submitting.value}
              onClick={() => {
                void submitApproval(false);
              }}
            >
              审批不通过
            </Button>
            <Button
              block
              type="primary"
              disabled={!canApprove.value}
              loading={submitting.value}
              onClick={() => {
                void submitApproval(true);
              }}
            >
              审批通过
            </Button>
          </div>
        </div>
      </>
    );
  },
});
