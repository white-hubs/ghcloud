import { Button, Cell, CellGroup, Field, Icon, Slider, showImagePreview, showToast, Tag } from "vant";
import { computed, defineComponent, onBeforeUnmount, onMounted, reactive, shallowRef, watch, type VNode } from "vue";
import { useRoute, useRouter } from "vue-router";

import { CubeNavBar } from "@ghcloud/cube-app-generic-component";
import type {
  FileVO,
  HazardDetailBasicInfoVO,
  HazardDetailVO,
  HazardRectificationProgressVO,
} from "@ghcloud/cube-service-interface/hazard-governance";
import { HazardLevel } from "@ghcloud/cube-service-interface/hazard-governance";
import { useAuthRequest } from "@ghcloud/cube-services-client/auth-request";
import {
  createHazardRectificationProgress,
  getHazardDetail,
  getLatestHazardRectificationProgress,
  submitHazardAcceptance,
  submitHazardRectificationPlan,
} from "@ghcloud/cube-services-client/hazard-governance.client";

import { getPlanAttachments, normalizePlanAttachmentFiles, type UploadedPlanAttachment } from "./plan-attachments";
import { HazardImageUploader } from "@/components/hazard-image-uploader";
import { PageLoadingOverlay } from "@/components/page-loading-overlay";
import { useHazardFileUpload } from "@/hooks/use-hazard-file-upload";
import { useHazardImageUpload } from "@/hooks/use-hazard-image-upload";
import { HAZARD_H5_FIELD_LIMITS } from "@/utils/field-limits";
import { hasRichTextContent, sanitizeRichText } from "@/utils/rich-text";
import { formatServiceDate, renderServiceLevelTag, renderServiceStatusTag } from "@/views/hazard-service-utils";

import styles from "./index.module.less";

const RICH_TEXT_TOKEN_PATTERN = /<[^>]+>|[^<]+/g;
const AI_TYPING_DURATION = 3000;
const MAJOR_HAZARD_LEVELS = new Set<string>([HazardLevel.MAJOR, HazardLevel.CRITICAL, "重大", "特重大"]);

type ProgressRecord = HazardRectificationProgressVO & {
  content?: string;
  progressImages?: FileVO[];
  remark?: string;
  reportContent?: string;
};

const readRouteId = (value: unknown): string => {
  if (typeof value === "string" && value) {
    return value;
  }
  if (typeof value === "number") {
    return String(value);
  }
  return "";
};
const readValue = (value: unknown): string => (value == null || value === "" ? "-" : String(value));
const readFileName = (file: FileVO): string => readValue(file.name ?? file.id);
const readFileUrl = (file: FileVO & { url?: string }): string => file.path || file.endpointPath || file.url || "";
const readFileIds = (files: UploadedPlanAttachment[]): string | undefined => {
  const ids = files.map((file) => String(file.id ?? file.fileId ?? "")).filter(Boolean);
  return ids.length > 0 ? ids.join(",") : undefined;
};
const readProgressContent = (record: ProgressRecord): string =>
  record.progressContent ?? record.reportContent ?? record.content ?? record.remark ?? "";
const readProgressImages = (record: ProgressRecord): FileVO[] =>
  record.afterImages?.length ? record.afterImages : (record.progressImages ?? []);
const normalizePercent = (value?: string | number | null): number | undefined => {
  const percent = Number(value);
  return Number.isFinite(percent) ? percent : undefined;
};
const formatHistoryDate = (value?: string): string => {
  if (!value) {
    return "-";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return formatServiceDate(value);
  }
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${month}-${day}`;
};
const unwrapHazardDetail = (response: unknown): HazardDetailVO | undefined => {
  if (response && typeof response === "object") {
    const record = response as Record<string, unknown>;
    const candidate = record.data ?? record.result ?? record.details ?? response;
    return candidate && typeof candidate === "object" ? (candidate as HazardDetailVO) : undefined;
  }
  return undefined;
};
const unwrapProgressDetail = (response: unknown): HazardRectificationProgressVO | undefined => {
  if (response && typeof response === "object") {
    const record = response as Record<string, unknown>;
    const candidate = record.data ?? record.result ?? record.details ?? response;
    return candidate && typeof candidate === "object" ? (candidate as HazardRectificationProgressVO) : undefined;
  }
  return undefined;
};

export const RectificationFormPage = defineComponent({
  name: "RectificationFormPage",
  setup: () => {
    const route = useRoute();
    const router = useRouter();
    const progress = shallowRef(0);
    const loading = shallowRef(false);
    const submitting = shallowRef(false);
    const reportCooldown = shallowRef(false);
    const acceptanceSubmitting = shallowRef(false);
    const aiExpanded = shallowRef(true);
    const aiDisplayHtml = shallowRef("");
    const aiTyping = shallowRef(false);
    const detail = shallowRef<HazardDetailVO | null>(null);
    const progressDetail = shallowRef<HazardRectificationProgressVO | null>(null);
    let aiTypingTimer: ReturnType<typeof window.setTimeout> | undefined;
    let reportCooldownTimer: ReturnType<typeof window.setTimeout> | undefined;
    const beforeImageUpload = useHazardImageUpload({ maxCount: 6 });
    const afterImageUpload = useHazardImageUpload({ maxCount: 6 });
    const attachmentUpload = useHazardFileUpload({
      maxCount: 6,
      accept: ".pdf,.doc,.docx,.xls,.xlsx,image/*",
      overLimitMessage: "最多上传 6 个方案附件",
      errorMessage: "方案附件上传失败，请重试",
    });
    const mode = computed(() => (route.query.mode === "execute" ? "execute" : "plan"));
    const pageTitle = computed(() => (mode.value === "execute" ? "更新进度" : "填写方案"));
    const hazardId = computed(() => readRouteId(route.query.id ?? route.query.hazardId));
    const basicInfo = computed<HazardDetailBasicInfoVO | undefined>(() => detail.value?.basicInfo);
    const progressBasicInfo = computed(() => progressDetail.value?.basicInfo);
    const currentBasicInfo = computed(() => basicInfo.value ?? progressBasicInfo.value);
    const record = computed(() => ({
      id: readValue(progressDetail.value?.code ?? currentBasicInfo.value?.code ?? route.query.code ?? route.query.id),
      description: readValue(progressDetail.value?.description ?? currentBasicInfo.value?.description ?? route.query.description),
      level: readValue(progressDetail.value?.level ?? currentBasicInfo.value?.level ?? route.query.level),
      location: readValue(progressDetail.value?.locationName ?? currentBasicInfo.value?.locationName ?? route.query.locationName),
      deadline: formatServiceDate(progressDetail.value?.deadline ?? currentBasicInfo.value?.deadline ?? route.query.deadline),
      governanceStatus: readValue(
        progressDetail.value?.governanceStatus ?? currentBasicInfo.value?.governanceStatus ?? route.query.governanceStatus,
      ),
    }));
    const form = reactive({
      content: "",
      measures: "",
      control: "",
      remark: "",
    });
    const approvedPlan = computed(() => progressDetail.value?.approvedPlan);
    const aiDisposalSuggestion = computed(() => basicInfo.value?.aiDisposalSuggestion ?? "");
    const sanitizedAiDisposalSuggestion = computed(() => sanitizeRichText(aiDisposalSuggestion.value));
    const showAiDisposalSuggestion = computed(() => hasRichTextContent(sanitizedAiDisposalSuggestion.value));
    const isMajorHazard = computed(() => MAJOR_HAZARD_LEVELS.has(String(currentBasicInfo.value?.level ?? route.query.level ?? "")));
    const progressRecords = computed<ProgressRecord[]>(() => {
      const records = progressDetail.value?.progressRecords ?? [];
      if (records.length > 0) {
        return [...records].sort((a, b) => String(b.recordTime ?? "").localeCompare(String(a.recordTime ?? "")));
      }
      return progressDetail.value?.progressPercent !== undefined ? [progressDetail.value as ProgressRecord] : [];
    });
    const latestProgressRecord = computed(() => progressRecords.value[0]);
    const latestServerProgressPercent = computed(() => {
      if (progressRecords.value.length > 0) {
        return normalizePercent(latestProgressRecord.value?.progressPercent) ?? 0;
      }
      return (
        normalizePercent(progressDetail.value?.basicInfo?.latestProgressPercent) ??
        normalizePercent(
          (progressDetail.value as (HazardRectificationProgressVO & { latestProgressPercent?: number }) | null)?.latestProgressPercent,
        ) ??
        normalizePercent(progressDetail.value?.progressPercent) ??
        0
      );
    });
    const submittedProgressPercent = computed(() => Math.min(100, Math.max(0, latestServerProgressPercent.value)));
    const progressLocked = computed(() => submittedProgressPercent.value >= 100);
    const canSubmitAcceptance = computed(() => latestServerProgressPercent.value >= 100);

    watch(progress, (percent) => {
      if (percent < submittedProgressPercent.value) {
        progress.value = submittedProgressPercent.value;
      }
    });

    const clampProgress = (value: unknown): number => {
      const percent = Number(value);
      if (!Number.isFinite(percent)) {
        return submittedProgressPercent.value;
      }
      return Math.min(100, Math.max(submittedProgressPercent.value, percent));
    };

    const updateProgress = (value: unknown): void => {
      progress.value = clampProgress(value);
    };

    const clearProgressForm = (): void => {
      form.remark = "";
      afterImageUpload.setFiles([]);
    };

    const startReportCooldown = (): void => {
      if (reportCooldownTimer) {
        window.clearTimeout(reportCooldownTimer);
      }
      reportCooldown.value = true;
      reportCooldownTimer = window.setTimeout(() => {
        reportCooldown.value = false;
        reportCooldownTimer = undefined;
      }, 2000);
    };

    const stopAiTyping = (): void => {
      if (aiTypingTimer) {
        window.clearTimeout(aiTypingTimer);
        aiTypingTimer = undefined;
      }
      aiTyping.value = false;
    };

    const playAiTyping = (html: string): void => {
      stopAiTyping();
      aiDisplayHtml.value = "";
      if (!hasRichTextContent(html)) {
        return;
      }
      const tokens = html.match(RICH_TEXT_TOKEN_PATTERN) ?? [];
      const visibleLength = tokens.filter((token) => !token.startsWith("<")).reduce((total, token) => total + token.length, 0);
      if (visibleLength <= 0) {
        aiDisplayHtml.value = html;
        return;
      }
      const delay = Math.max(16, Math.floor(AI_TYPING_DURATION / visibleLength));
      let tokenIndex = 0;
      let charIndex = 0;
      aiTyping.value = true;

      const appendNext = (): void => {
        while (tokenIndex < tokens.length && tokens[tokenIndex]?.startsWith("<")) {
          aiDisplayHtml.value += tokens[tokenIndex];
          tokenIndex += 1;
        }
        const token = tokens[tokenIndex];
        if (!token) {
          aiDisplayHtml.value = html;
          stopAiTyping();
          return;
        }
        aiDisplayHtml.value += token[charIndex] ?? "";
        charIndex += 1;
        if (charIndex >= token.length) {
          tokenIndex += 1;
          charIndex = 0;
        }
        aiTypingTimer = window.setTimeout(appendNext, delay);
      };

      appendNext();
    };

    const loadPlanDetail = async (): Promise<void> => {
      if (!hazardId.value) {
        showToast("缺少隐患ID");
        return;
      }
      loading.value = true;
      try {
        const currentDetail = unwrapHazardDetail(await useAuthRequest(() => getHazardDetail(hazardId.value)));
        detail.value = currentDetail ?? null;
        const plan = currentDetail?.processInfo?.currentPlan;
        form.content = plan?.rectificationContent ?? currentDetail?.basicInfo?.description ?? "";
        form.measures = plan?.rectificationMeasures ?? "";
        form.control = plan?.temporaryControlMeasures ?? "";
        beforeImageUpload.setFiles(currentDetail?.basicInfo?.sceneImages ?? []);
        attachmentUpload.setFiles(normalizePlanAttachmentFiles(getPlanAttachments(currentDetail)));
      } catch (error) {
        showToast(error instanceof Error ? error.message : "整改详情加载失败");
      } finally {
        loading.value = false;
      }
    };

    const loadProgressDetail = async (): Promise<void> => {
      if (!hazardId.value) {
        showToast("缺少隐患ID");
        return;
      }
      loading.value = true;
      try {
        const currentProgress = unwrapProgressDetail(await useAuthRequest(() => getLatestHazardRectificationProgress(hazardId.value)));
        progressDetail.value = currentProgress ?? null;
        progress.value = latestServerProgressPercent.value;
        clearProgressForm();
      } catch (error) {
        showToast(error instanceof Error ? error.message : "整改进度加载失败");
      } finally {
        loading.value = false;
      }
    };

    const submitPlan = async (): Promise<void> => {
      if (!hazardId.value || submitting.value) {
        return;
      }
      const rectificationContent = form.content.trim();
      const rectificationMeasures = form.measures.trim();
      const temporaryControlMeasures = form.control.trim();
      if (!rectificationContent) {
        showToast("请填写整改内容");
        return;
      }
      if (!rectificationMeasures) {
        showToast("请填写整改措施");
        return;
      }
      if (isMajorHazard.value && !temporaryControlMeasures) {
        showToast("重大隐患请填写临时管控措施");
        return;
      }
      const sceneImages = readFileIds(beforeImageUpload.files.value);
      const planAttachments = readFileIds(attachmentUpload.files.value);
      if (isMajorHazard.value && !planAttachments) {
        showToast("重大隐患请上传方案附件");
        return;
      }
      submitting.value = true;
      try {
        await useAuthRequest(() =>
          submitHazardRectificationPlan(hazardId.value, {
            rectificationContent,
            rectificationMeasures,
            ...(temporaryControlMeasures ? { temporaryControlMeasures } : {}),
            ...(sceneImages ? { sceneImages } : {}),
            ...(planAttachments ? { planAttachments } : {}),
          }),
        );
        showToast("整改方案已提交审批");
        void router.replace({ name: "tasks" });
      } catch (error) {
        showToast(error instanceof Error ? error.message : "整改方案提交失败，请稍后重试");
      } finally {
        submitting.value = false;
      }
    };

    const submitProgress = async (): Promise<void> => {
      if (!hazardId.value || submitting.value || reportCooldown.value) {
        return;
      }
      if (!Number.isFinite(progress.value) || progress.value < 0 || progress.value > 100) {
        showToast("请选择整改进度");
        return;
      }
      if (progress.value < submittedProgressPercent.value) {
        showToast(`整改进度不能低于已汇报进度${submittedProgressPercent.value}%`);
        progress.value = submittedProgressPercent.value;
        return;
      }
      if (progressLocked.value) {
        showToast("整改进度已达到100%，无需继续汇报");
        return;
      }
      const progressContent = form.remark.trim();
      if (!progressContent) {
        showToast("请填写汇报说明");
        return;
      }
      const progressImages = readFileIds(afterImageUpload.files.value);
      if (!progressImages) {
        showToast("请上传整改后照片");
        return;
      }
      submitting.value = true;
      try {
        await useAuthRequest(() =>
          createHazardRectificationProgress(hazardId.value, {
            progressPercent: progress.value,
            progressContent,
            progressImages,
          }),
        );
        showToast("整改进度已汇报");
        clearProgressForm();
        startReportCooldown();
        await loadProgressDetail();
      } catch (error) {
        showToast(error instanceof Error ? error.message : "整改进度汇报失败，请稍后重试");
      } finally {
        submitting.value = false;
      }
    };

    const submitAcceptance = async (): Promise<void> => {
      if (!hazardId.value || acceptanceSubmitting.value) {
        return;
      }
      if (!canSubmitAcceptance.value) {
        showToast("请先汇报100%整改进度，待系统确认后再提交验收");
        return;
      }
      acceptanceSubmitting.value = true;
      try {
        await useAuthRequest(() => submitHazardAcceptance(hazardId.value));
        showToast("整改结果已提交验收");
        void router.replace({ name: "acceptance-detail", query: { id: hazardId.value } });
      } catch (error) {
        showToast(error instanceof Error ? error.message : "整改结果提交失败，请稍后重试");
      } finally {
        acceptanceSubmitting.value = false;
      }
    };

    const previewHistoryImage = (files: FileVO[], index: number): void => {
      const images = files.map(readFileUrl).filter(Boolean);
      const current = readFileUrl(files[index]);
      if (!current || images.length === 0) {
        showToast(`暂无可查看地址：${readFileName(files[index])}`);
        return;
      }
      showImagePreview({
        images,
        startPosition: Math.max(0, images.indexOf(current)),
        closeable: true,
      });
    };

    const renderHistoryImage = (files: FileVO[], file: FileVO, index: number): JSX.Element => {
      const fileUrl = readFileUrl(file);
      return (
        <button class={styles.historyImage} type="button" key={String(file.id ?? index)} onClick={() => previewHistoryImage(files, index)}>
          {fileUrl ? <img src={fileUrl} alt={readFileName(file)} /> : <span>{readFileName(file)}</span>}
        </button>
      );
    };

    const renderProgressRecord = (item: ProgressRecord): JSX.Element => {
      const images = readProgressImages(item);
      return (
        <div class={styles.historyItem} key={String(item.id ?? item.recordTime ?? item.progressPercent)}>
          <div class={styles.historyHead}>
            <strong>
              {formatHistoryDate(item.recordTime)} · {readValue(item.recordUserName ?? item.recordUserId)}
            </strong>
            <Tag type={item.progressPercent === 100 ? "success" : "primary"}>进度 {readValue(item.progressPercent)}%</Tag>
          </div>
          <p>{readValue(readProgressContent(item))}</p>
          {images.length > 0 ? (
            <div class={styles.historyImages}>{images.map((file, index) => renderHistoryImage(images, file, index))}</div>
          ) : null}
        </div>
      );
    };

    watch(
      pageTitle,
      (title) => {
        document.title = title;
      },
      { immediate: true },
    );

    watch(
      sanitizedAiDisposalSuggestion,
      (html) => {
        playAiTyping(html);
      },
      { immediate: true },
    );

    onMounted(() => {
      if (mode.value === "execute") {
        void loadProgressDetail();
        return;
      }
      void loadPlanDetail();
    });

    onBeforeUnmount(() => {
      stopAiTyping();
      if (reportCooldownTimer) {
        window.clearTimeout(reportCooldownTimer);
      }
    });

    return (): VNode => (
      <>
        <CubeNavBar showBack title={pageTitle.value} />
        <PageLoadingOverlay show={loading.value} text="详情加载中..." />
        <div class={[styles.container, mode.value === "execute" ? styles.executeContainer : ""]}>
          <CellGroup inset class={styles.block}>
            <div class={styles.sectionTitle}>
              <span class={styles.sectionBar} />
              关联隐患信息
            </div>
            <Cell title="编号" value={record.value.id} />
            <Cell title="等级">
              {{
                value: () => renderServiceLevelTag(record.value.level),
              }}
            </Cell>
            <Cell title="位置" value={record.value.location} />
            <Cell title="描述" label={record.value.description} />
            <Cell title="截止" value={record.value.deadline} />
            <Cell title="状态">
              {{
                value: () => renderServiceStatusTag(record.value.governanceStatus),
              }}
            </Cell>
            <Cell
              title="责任人"
              value={readValue(
                currentBasicInfo.value?.responsibleUserName ??
                  currentBasicInfo.value?.responsibleUserId ??
                  progressDetail.value?.responsibleUserName ??
                  progressDetail.value?.responsibleUserId,
              )}
            />
            <Cell
              title="验收人"
              value={readValue(
                currentBasicInfo.value?.acceptanceUserName ??
                  currentBasicInfo.value?.acceptanceUserId ??
                  progressDetail.value?.acceptanceUserName ??
                  progressDetail.value?.acceptanceUserId,
              )}
            />
            <div class={styles.deadlineRule}>截止日=确认属实+7天，审批不重置</div>
          </CellGroup>
          {mode.value === "plan" ? (
            <>
              {showAiDisposalSuggestion.value ? (
                <div class={styles.aiPanel}>
                  <button
                    class={styles.aiHeader}
                    type="button"
                    aria-expanded={aiExpanded.value}
                    onClick={() => {
                      aiExpanded.value = !aiExpanded.value;
                    }}
                  >
                    <span>
                      <strong>AI 处置建议</strong>
                      <small>AI生成 · 仅供参考</small>
                    </span>
                    <span class={[styles.aiToggleIcon, aiExpanded.value ? styles.aiToggleIconExpanded : ""]} aria-hidden="true" />
                  </button>
                  <div class={[styles.aiBodyWrap, aiExpanded.value ? styles.aiBodyExpanded : styles.aiBodyCollapsed]}>
                    <div class={[styles.aiRichText, aiTyping.value ? styles.aiRichTextTyping : ""]} innerHTML={aiDisplayHtml.value} />
                  </div>
                </div>
              ) : null}
              <CellGroup inset class={styles.block}>
                <Field
                  v-model={form.content}
                  label="整改内容"
                  label-align="top"
                  type="textarea"
                  autosize
                  rows={2}
                  required
                  maxlength={HAZARD_H5_FIELD_LIMITS.longText}
                  showWordLimit
                />
                <Field
                  v-model={form.measures}
                  label="整改措施"
                  label-align="top"
                  type="textarea"
                  autosize
                  rows={4}
                  required
                  maxlength={HAZARD_H5_FIELD_LIMITS.longText}
                  showWordLimit
                />
                <Field
                  v-model={form.control}
                  label={isMajorHazard.value ? "临时管控措施（重大隐患必填）" : "临时管控措施"}
                  label-align="top"
                  type="textarea"
                  autosize
                  rows={2}
                  required={isMajorHazard.value}
                  maxlength={HAZARD_H5_FIELD_LIMITS.longText}
                  showWordLimit
                />
                <Field label="整改前照片（继承自隐患上报，可补充）" label-align="top">
                  {{
                    input: () => (
                      <HazardImageUploader
                        files={beforeImageUpload.files.value}
                        loading={beforeImageUpload.uploading.value}
                        maxCount={beforeImageUpload.maxCount}
                        onUpload={() => {
                          void beforeImageUpload.upload();
                        }}
                        onRemove={beforeImageUpload.removeAt}
                      />
                    ),
                  }}
                </Field>
                <Field
                  label={isMajorHazard.value ? "方案附件（重大隐患必传）" : "方案附件"}
                  label-align="top"
                  required={isMajorHazard.value}
                >
                  {{
                    input: () => (
                      <div class={styles.attachmentPanel}>
                        {attachmentUpload.files.value.length > 0 ? (
                          <div class={styles.attachmentList}>
                            {attachmentUpload.files.value.map((file, index) => (
                              <div class={styles.attachmentItem} key={String(file.id)}>
                                <div class={styles.attachmentMeta}>
                                  <strong>{readFileName(file)}</strong>
                                  <span>{readValue(file.suffix ?? file.type)}</span>
                                </div>
                                <button
                                  class={styles.attachmentDeleteButton}
                                  type="button"
                                  aria-label={`删除${readFileName(file)}`}
                                  onClick={() => attachmentUpload.removeAt(index)}
                                >
                                  <Icon name="cross" />
                                </button>
                              </div>
                            ))}
                          </div>
                        ) : null}
                        <button
                          class={styles.attachmentBox}
                          type="button"
                          disabled={attachmentUpload.uploading.value}
                          onClick={() => {
                            void attachmentUpload.upload();
                          }}
                        >
                          <span>{attachmentUpload.uploading.value ? "上传中..." : "点击上传整改方案附件"}</span>
                          <small>支持 PDF、Word、Excel、图片</small>
                        </button>
                      </div>
                    ),
                  }}
                </Field>
              </CellGroup>
              <div class={styles.actions}>
                <Button
                  block
                  type="primary"
                  loading={submitting.value}
                  onClick={() => {
                    void submitPlan();
                  }}
                >
                  提交审批
                </Button>
              </div>
            </>
          ) : (
            <>
              <CellGroup inset class={styles.block}>
                <div class={styles.sectionTitle}>
                  <span class={styles.sectionBar} />
                  已审批方案
                </div>
                <Cell title="编号" value={record.value.id} />
                <Cell title="总时限" value={record.value.deadline} />
                <Cell title="整改内容" label={readValue(approvedPlan.value?.rectificationContent)} />
                <Cell title="整改措施" label={readValue(approvedPlan.value?.rectificationMeasures)} />
                <Cell title="临时管控" label={readValue(approvedPlan.value?.temporaryControlMeasures)} />
                <Cell title="审批通过时间" value={formatServiceDate(approvedPlan.value?.approvedTime)} />
              </CellGroup>
              <CellGroup inset class={styles.block}>
                <div class={styles.progress}>
                  <div class={styles.progressTop}>
                    <span>整改进度</span>
                    <span>{progress.value}%</span>
                  </div>
                  <Slider
                    modelValue={progress.value}
                    min={0}
                    max={100}
                    step={5}
                    disabled={progressLocked.value}
                    {...{ "onUpdate:modelValue": updateProgress }}
                  />
                  <div class={styles.progressScale}>
                    <span>0%</span>
                    <span>50%</span>
                    <span>100%</span>
                  </div>
                </div>
                <Field label="整改后照片" label-align="top" required>
                  {{
                    input: () => (
                      <HazardImageUploader
                        files={afterImageUpload.files.value}
                        loading={afterImageUpload.uploading.value}
                        maxCount={afterImageUpload.maxCount}
                        onUpload={() => {
                          void afterImageUpload.upload();
                        }}
                        onRemove={afterImageUpload.removeAt}
                      />
                    ),
                  }}
                </Field>
                <Field
                  v-model={form.remark}
                  label="汇报说明"
                  label-align="top"
                  type="textarea"
                  autosize
                  rows={2}
                  required
                  placeholder="描述本次做了什么，进展到哪一步..."
                  maxlength={HAZARD_H5_FIELD_LIMITS.longText}
                  showWordLimit
                />
              </CellGroup>
              <div class={[styles.actions, styles.executeActions]}>
                <div class={styles.executeButtonRow}>
                  {progressLocked.value ? null : (
                    <Button
                      block
                      type="primary"
                      loading={submitting.value}
                      disabled={reportCooldown.value}
                      onClick={() => {
                        void submitProgress();
                      }}
                    >
                      汇报进度
                    </Button>
                  )}
                  {canSubmitAcceptance.value ? (
                    <Button
                      block
                      type="primary"
                      loading={acceptanceSubmitting.value}
                      onClick={() => {
                        void submitAcceptance();
                      }}
                    >
                      提交验收
                    </Button>
                  ) : null}
                </div>
                <div class={styles.acceptanceHint}>
                  验收人：
                  {readValue(
                    currentBasicInfo.value?.acceptanceUserName ??
                      currentBasicInfo.value?.acceptanceUserId ??
                      progressDetail.value?.acceptanceUserName ??
                      progressDetail.value?.acceptanceUserId,
                  )}
                </div>
              </div>
              <CellGroup inset class={styles.block}>
                <div class={styles.sectionTitle}>
                  <span class={styles.sectionBar} />
                  历史汇报记录（共{progressRecords.value.length}条）
                </div>
                <div class={styles.historyList}>
                  {progressRecords.value.length > 0 ? (
                    progressRecords.value.map(renderProgressRecord)
                  ) : (
                    <div class={styles.emptyText}>暂无汇报记录</div>
                  )}
                </div>
              </CellGroup>
            </>
          )}
        </div>
      </>
    );
  },
});
