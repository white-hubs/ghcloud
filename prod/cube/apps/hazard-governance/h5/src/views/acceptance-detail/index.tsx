import {
  Button,
  Cell,
  CellGroup,
  Field,
  Image,
  Picker,
  Popup,
  Radio,
  RadioGroup,
  showConfirmDialog,
  showImagePreview,
  showToast,
  Tag,
} from "vant";
import { computed, defineComponent, onBeforeUnmount, onMounted, reactive, shallowRef, watch, type VNode } from "vue";
import { useRoute } from "vue-router";

import { CubeNavBar } from "@ghcloud/cube-app-generic-component";
import { HazardAcceptanceRootCauseCode, HazardActionCode } from "@ghcloud/cube-service-interface/hazard-governance";
import type {
  FileVO,
  HazardAcceptanceCommand,
  HazardAcceptanceDetailVO,
  HazardRectificationProgressVO,
} from "@ghcloud/cube-service-interface/hazard-governance";
import { useAuthRequest } from "@ghcloud/cube-services-client/auth-request";
import { acceptHazardAcceptance, getHazardAcceptanceDetail } from "@ghcloud/cube-services-client/hazard-governance.client";

import { PageLoadingOverlay } from "@/components/page-loading-overlay";
import { HAZARD_H5_FIELD_LIMITS } from "@/utils/field-limits";
import { hasRichTextContent, sanitizeRichText } from "@/utils/rich-text";
import { normalizeHazardAction } from "@/views/hazard-ledger/hazard-actions";
import { formatServiceDate, renderServiceLevelTag } from "@/views/hazard-service-utils";

import styles from "./index.module.less";

const readQuery = (value: unknown): string => (typeof value === "string" && value ? value : "-");
const readValue = (value: unknown): string => (value == null || value === "" ? "-" : String(value));
const readFileName = (file: FileVO): string => readValue(file.name ?? file.id);
const splitLines = (value: string): string[] =>
  value === "-"
    ? []
    : value
        .split(/\r?\n/)
        .map((item) => item.trim())
        .filter(Boolean);
const sortProgressRecords = (records: HazardRectificationProgressVO[]): HazardRectificationProgressVO[] =>
  [...records].sort((a, b) => String(b.recordTime ?? "").localeCompare(String(a.recordTime ?? "")));
const RICH_TEXT_TOKEN_PATTERN = /<[^>]+>|[^<]+/g;
const AI_TYPING_DURATION = 3000;

const rootCauseOptions = [
  { text: "管理缺陷", value: HazardAcceptanceRootCauseCode.MANAGEMENT_DEFECT },
  { text: "制度缺失", value: HazardAcceptanceRootCauseCode.SYSTEM_DEFICIENCY },
  { text: "设备老化", value: HazardAcceptanceRootCauseCode.EQUIPMENT_AGING },
  { text: "培训不足", value: HazardAcceptanceRootCauseCode.TRAINING_INSUFFICIENT },
  { text: "设计缺陷", value: HazardAcceptanceRootCauseCode.DESIGN_DEFECT },
  { text: "不可抗力", value: HazardAcceptanceRootCauseCode.FORCE_MAJEURE },
  { text: "人为违规", value: HazardAcceptanceRootCauseCode.HUMAN_VIOLATION },
];

type AcceptanceDetailWithAi = HazardAcceptanceDetailVO & {
  basicInfo?: HazardAcceptanceDetailVO["basicInfo"] & {
    aiAcceptanceSuggestion?: string;
  };
};

type AcceptanceForm = Omit<HazardAcceptanceCommand, "rootCauseCode"> & {
  rootCauseCode?: HazardAcceptanceRootCauseCode | "";
};

const unwrapAcceptanceDetail = (response: unknown): HazardAcceptanceDetailVO | undefined => {
  if (response && typeof response === "object") {
    const record = response as Record<string, unknown>;
    const candidate = record.data ?? record.result ?? record.details ?? response;
    return candidate && typeof candidate === "object" ? (candidate as HazardAcceptanceDetailVO) : undefined;
  }
  return undefined;
};

export const AcceptanceDetailPage = defineComponent({
  name: "AcceptanceDetailPage",
  setup: () => {
    document.title = "验收详情";
    const route = useRoute();
    const form = reactive<HazardAcceptanceCommand>({ accepted: true, rootCauseCode: "", opinion: "" });
    const detail = shallowRef<HazardAcceptanceDetailVO | null>(null);
    const loading = shallowRef(false);
    const submitting = shallowRef(false);
    const aiExpanded = shallowRef(true);
    const aiDisplayHtml = shallowRef("");
    const aiTyping = shallowRef(false);
    const showRootCausePicker = shallowRef(false);
    let aiTypingTimer: ReturnType<typeof window.setTimeout> | undefined;
    const hazardId = computed(() => readQuery(route.query.id ?? route.query.hazardId));
    const record = computed(() => ({
      code: readValue(detail.value?.code ?? route.query.code ?? route.query.id),
      description: readValue(detail.value?.description ?? route.query.description),
      level: readValue(detail.value?.level ?? route.query.level),
      locationName: readValue(detail.value?.locationName),
      responsibleUser: readValue(detail.value?.responsibleUserName ?? route.query.responsibleUserName ?? route.query.responsibleUserId),
      acceptanceUser: readValue(detail.value?.acceptanceUserName ?? route.query.acceptanceUserName ?? route.query.acceptanceUserId),
      submittedTime: formatServiceDate(detail.value?.rectificationSubmittedTime ?? route.query.submittedTime),
      deadline: formatServiceDate(detail.value?.deadline ?? route.query.deadline),
      rectificationDeadlineHours: readValue(detail.value?.rectificationDeadlineHours),
      planContent: readValue(detail.value?.currentPlan?.rectificationContent),
      planMeasures: readValue(detail.value?.currentPlan?.rectificationMeasures),
      temporaryControlMeasures: readValue(detail.value?.currentPlan?.temporaryControlMeasures),
      planSubmittedUser: readValue(
        detail.value?.currentPlan?.submittedByName ?? detail.value?.currentPlan?.submittedName ?? detail.value?.currentPlan?.submittedBy,
      ),
      planApprovedTime: formatServiceDate(detail.value?.currentPlan?.approvedTime),
      latestProgressPercent: readValue(detail.value?.progressRecords?.[0]?.progressPercent),
      latestProgressTime: formatServiceDate(detail.value?.progressRecords?.[0]?.recordTime),
      rejectCount: readValue(detail.value?.acceptanceRejectCount),
    }));
    const progressRecords = computed(() => sortProgressRecords(detail.value?.progressRecords ?? []));
    const afterImages = computed(() => progressRecords.value.flatMap((item) => item.afterImages ?? []));
    const aiInitialReview = computed(() => {
      const currentDetail = detail.value as AcceptanceDetailWithAi | null;
      return sanitizeRichText(currentDetail?.basicInfo?.aiAcceptanceSuggestion ?? "");
    });
    const showAiInitialReview = computed(() => hasRichTextContent(aiInitialReview.value));
    const aiReviewTitle = "AI验收建议";
    const aiReviewSubtitle = "AI 辅助验收";
    const aiReviewHint = "AI 验收建议结果仅供参考，验收结论由验收人独立做出";
    const rootCauseLabel = computed(
      () => rootCauseOptions.find((option) => option.value === form.rootCauseCode)?.text ?? (form.rootCauseCode || ""),
    );
    const canAccept = computed(
      () =>
        detail.value?.canAccept !== false &&
        (detail.value?.actions?.length
          ? detail.value.actions.some((action) => normalizeHazardAction(action) === HazardActionCode.ACCEPTANCE)
          : hazardId.value !== "-"),
    );

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

    const loadDetail = async (): Promise<void> => {
      if (hazardId.value === "-") {
        showToast("缺少隐患ID");
        return;
      }
      loading.value = true;
      try {
        const response = await useAuthRequest(() => getHazardAcceptanceDetail(hazardId.value));
        const currentDetail = unwrapAcceptanceDetail(response) ?? null;
        detail.value = currentDetail;
        form.rootCauseCode = currentDetail?.rootCauseCode ?? "";
      } catch (error) {
        showToast(error instanceof Error ? error.message : "验收详情加载失败，已展示列表信息");
      } finally {
        loading.value = false;
      }
    };

    const submitAcceptance = async (accepted: boolean): Promise<void> => {
      if (hazardId.value === "-" || submitting.value) {
        return;
      }
      if (!accepted && !form.opinion?.trim()) {
        showToast("请填写不通过原因");
        return;
      }
      if (accepted) {
        try {
          await showConfirmDialog({
            title: "确认验收通过",
            message: "验收后将关闭此隐患，确认通过？",
            confirmButtonText: "确认通过",
          });
        } catch {
          return;
        }
      }
      submitting.value = true;
      const payload: HazardAcceptanceCommand = {
        accepted,
        ...(form.rootCauseCode ? { rootCauseCode: form.rootCauseCode } : {}),
        ...(form.opinion?.trim() ? { opinion: form.opinion.trim() } : {}),
      };
      try {
        await useAuthRequest(() => acceptHazardAcceptance(hazardId.value, payload));
        showToast(accepted ? "验收已通过" : "已退回整改");
        form.opinion = "";
        await loadDetail();
      } catch (error) {
        showToast(error instanceof Error ? error.message : "验收提交失败，请稍后重试");
      } finally {
        submitting.value = false;
      }
    };

    const openRootCausePicker = (): void => {
      if (!canAccept.value || submitting.value) return;
      showRootCausePicker.value = true;
    };

    const confirmRootCause = (event: { selectedOptions?: Array<{ value?: unknown }> }): void => {
      const value = String(event.selectedOptions?.[0]?.value ?? "");
      form.rootCauseCode = rootCauseOptions.some((option) => option.value === value) ? (value as HazardAcceptanceRootCauseCode) : "";
      showRootCausePicker.value = false;
    };

    onMounted(() => {
      void loadDetail();
    });

    watch(
      aiInitialReview,
      (html) => {
        playAiTyping(html);
      },
      { immediate: true },
    );

    onBeforeUnmount(() => {
      stopAiTyping();
    });

    const previewFile = (files: FileVO[], index: number): void => {
      const images = files.map((file) => file.path).filter((path): path is string => Boolean(path));
      const current = files[index]?.path;
      if (!current || images.length === 0) {
        showToast(`暂无可查看地址：${readFileName(files[index])}`);
        return;
      }
      showImagePreview({ images, startPosition: Math.max(0, images.indexOf(current)) });
    };

    const renderFileList = (files: FileVO[] | undefined, emptyText: string): JSX.Element => {
      if (!files?.length) {
        return <div class={styles.emptyText}>{emptyText}</div>;
      }
      return (
        <div class={styles.fileGrid}>
          {files.map((file, index) => (
            <button class={styles.fileItem} type="button" key={String(file.id)} onClick={() => previewFile(files, index)}>
              {file.path ? (
                <Image src={file.path} width="72" height="72" fit="cover" radius={8} />
              ) : (
                <div class={styles.filePlaceholder}>图片</div>
              )}
            </button>
          ))}
        </div>
      );
    };

    const renderProgress = (progress: HazardRectificationProgressVO): JSX.Element => (
      <div class={styles.progressItem} key={String(progress.id)}>
        <div class={styles.progressHead}>
          <strong>{formatServiceDate(progress.recordTime)}</strong>
          <Tag type="primary">{readValue(progress.progressPercent)}%</Tag>
        </div>
        <div class={styles.progressMeta}>
          <span>记录人：{readValue(progress.recordUserName ?? progress.recordUserId)}</span>
          <span>剩余小时：{readValue(progress.remainingHours)}</span>
        </div>
        <p class={styles.progressContent}>{readValue(progress.progressContent)}</p>
        {renderFileList(progress.afterImages, "暂无整改后照片")}
      </div>
    );

    return (): VNode => (
      <>
        <CubeNavBar showBack title="验收详情" />
        <PageLoadingOverlay show={loading.value} text="详情加载中..." />
        <div class={styles.container}>
          <div class={styles.content}>
            <CellGroup inset class={styles.block}>
              <div class={styles.sectionTitle}>
                <span class={styles.sectionBar} />
                隐患信息
              </div>
              <Cell title="编号" value={record.value.code} />
              <Cell title="描述" label={record.value.description} />
              <Cell title="等级">
                {{
                  value: () => renderServiceLevelTag(record.value.level),
                }}
              </Cell>
              <Cell title="位置" value={record.value.locationName} />
              <Cell title="整改责任人" value={record.value.responsibleUser} />
              <Cell title="验收人" value={record.value.acceptanceUser} />
              <Cell title="提交验收" value={record.value.submittedTime} />
              <Cell title="整改截止" value={record.value.deadline} />
              <Cell title="退回次数" value={record.value.rejectCount} />
            </CellGroup>
            <CellGroup inset class={styles.block}>
              <div class={styles.sectionTitle}>
                <span class={styles.sectionBar} />
                整改措施
              </div>
              <Cell title="整改内容" label={record.value.planContent} />
              <Cell title="整改措施" label={splitLines(record.value.planMeasures).length ? undefined : record.value.planMeasures}>
                {{
                  label: () =>
                    splitLines(record.value.planMeasures).length ? (
                      <ol class={styles.measureList}>
                        {splitLines(record.value.planMeasures).map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ol>
                    ) : null,
                }}
              </Cell>
              <Cell title="临时管控" label={record.value.temporaryControlMeasures} />
              <Cell title="方案提交人" value={record.value.planSubmittedUser} />
              <Cell title="审批通过" value={record.value.planApprovedTime} />
            </CellGroup>
            <CellGroup inset class={styles.block}>
              <div class={styles.sectionTitle}>
                <span class={styles.sectionBar} />
                整改前后对比
              </div>
              <div class={styles.mediaSection}>
                <div class={styles.mediaTitle}>整改前（{detail.value?.sceneImages?.length ?? 0}张）</div>
                {renderFileList(detail.value?.sceneImages, "暂无整改前照片")}
              </div>
              <div class={styles.mediaSection}>
                <div class={styles.mediaTitle}>整改后（{afterImages.value.length}张）</div>
                {renderFileList(afterImages.value, "暂无整改后照片")}
              </div>
            </CellGroup>
            <CellGroup inset class={styles.block}>
              <div class={styles.sectionTitle}>
                <span class={styles.sectionBar} />
                整改进度记录
              </div>
              <div class={styles.progressList}>
                {progressRecords.value.length ? (
                  progressRecords.value.map(renderProgress)
                ) : (
                  <div class={styles.emptyText}>暂无整改进度记录</div>
                )}
              </div>
            </CellGroup>
            {showAiInitialReview.value ? (
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
                    <strong>{aiReviewTitle}</strong>
                    <small>{aiReviewSubtitle} · 仅供参考</small>
                  </span>
                  <span class={[styles.aiToggleIcon, aiExpanded.value ? styles.aiToggleIconExpanded : ""]} aria-hidden="true" />
                </button>
                <div class={[styles.aiBodyWrap, aiExpanded.value ? styles.aiBodyExpanded : styles.aiBodyCollapsed]}>
                  <div class={[styles.aiRichText, aiTyping.value ? styles.aiRichTextTyping : ""]} innerHTML={aiDisplayHtml.value} />
                  <div class={styles.aiHint}>{aiReviewHint}</div>
                </div>
              </div>
            ) : null}
            <CellGroup inset class={styles.block}>
              <div class={styles.sectionTitle}>
                <span class={styles.sectionBar} />
                验收判定
              </div>
              <Field
                modelValue={rootCauseLabel.value}
                label="根因标签"
                placeholder="请选择根因标签"
                readonly
                clickable
                isLink
                disabled={!canAccept.value || submitting.value}
                onClick={openRootCausePicker}
                onClickInput={openRootCausePicker}
                onClickRightIcon={openRootCausePicker}
              />
              <Field
                v-model={form.opinion}
                label="验收说明"
                label-align="top"
                type="textarea"
                autosize
                rows={3}
                maxlength={HAZARD_H5_FIELD_LIMITS.longText}
                showWordLimit
                disabled={!canAccept.value || submitting.value}
                placeholder={canAccept.value ? "请输入验收说明，不通过时必填" : "当前任务不可验收"}
              />
            </CellGroup>
          </div>
          <div class={styles.actions}>
            <Button
              block
              type="danger"
              plain
              disabled={!canAccept.value}
              loading={submitting.value}
              onClick={() => {
                void submitAcceptance(false);
              }}
            >
              验收不通过
            </Button>
            <Button
              block
              type="primary"
              disabled={!canAccept.value}
              loading={submitting.value}
              onClick={() => {
                void submitAcceptance(true);
              }}
            >
              验收通过
            </Button>
          </div>
        </div>
        <Popup
          show={showRootCausePicker.value}
          position="bottom"
          round
          onUpdate:show={(show: boolean) => {
            showRootCausePicker.value = show;
          }}
        >
          <Picker
            title="选择根因标签"
            columns={rootCauseOptions}
            onCancel={() => {
              showRootCausePicker.value = false;
            }}
            onConfirm={confirmRootCause}
          />
        </Popup>
      </>
    );
  },
});
