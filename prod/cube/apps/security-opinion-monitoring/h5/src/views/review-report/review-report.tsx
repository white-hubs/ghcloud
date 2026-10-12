import dayjs from "dayjs";
import { Button, DropdownItem, DropdownMenu, Field, List, PullRefresh, Search, Tag, showConfirmDialog, showToast } from "vant";
import { defineComponent, nextTick, onMounted, reactive, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";

import type { PublicOpinionReviewReportVO, ReviewReportStatus } from "@ghcloud/cube-service-interface/security-opinion";
import { downloadPDF } from "@ghcloud/cube-utils";

import { Bar } from "@/components/bar/bar";
import { PAGE_SIZE, REPORT_STATUS_LABEL, WARNING_LEVEL_LABEL, WARNING_LEVEL_TAG } from "@/constants";
import { securityOpinionApi } from "@/services/security-opinion-api";
import { formatDateTime } from "@/utils/format-datetime";

import styles from "./review-report.module.less";

const REPORT_STATUS_OPTIONS: Array<{ label: string; value: ReviewReportStatus | "" }> = [
  { label: "全部", value: "" },
  { label: "未生成", value: "NOT_GENERATED" },
  { label: "草稿", value: "DRAFT" },
  { label: "已定稿", value: "FINALIZED" },
];

function reportTitle(report: PublicOpinionReviewReportVO): string {
  return report.reportName || report.eventName || report.title || "舆情事件复盘报告";
}

function eventTitle(report: PublicOpinionReviewReportVO): string {
  return report.eventName || report.title || report.reportName || report.eventCode || report.eventId || "-";
}

function timelineText(node: { node?: string; content?: string; description?: string }): string {
  return node.node || node.content || node.description || "-";
}

function isArchivedEvent(report?: PublicOpinionReviewReportVO | null): boolean {
  return String(report?.status ?? report?.eventStatus ?? report?.archiveStatus ?? "").toUpperCase() === "ARCHIVED";
}

function isEmptySpreadPathText(text: string): boolean {
  const normalized = text.trim();
  return (
    !normalized || ["系统未记录完整传播路径。", "系统未记录完整传播路径", "暂无传播路径", "暂无传播路径。", "-", "--"].includes(normalized)
  );
}

function timelinePathForPdf(report: PublicOpinionReviewReportVO): string {
  const timeline = report.timeline ?? [];
  return timeline
    .map((node) => `${formatDateTime(node.actionTime || node.time)} ${timelineText(node)}`)
    .filter((line) => line.trim())
    .join("\n");
}

function spreadPathForPdf(report: PublicOpinionReviewReportVO): string {
  const spreadPath = report.spreadPath?.trim() || "";
  const timelinePath = timelinePathForPdf(report);
  if (timelinePath) {
    if (isEmptySpreadPathText(spreadPath)) return timelinePath;
    return `${spreadPath}\n\n传播节点：\n${timelinePath}`;
  }
  return isEmptySpreadPathText(spreadPath) ? "-" : spreadPath;
}

export const ReviewReportPage = defineComponent({
  name: "ReviewReportPage",
  setup() {
    const route = useRoute();
    const router = useRouter();
    const rows = ref<PublicOpinionReviewReportVO[]>([]);
    const active = ref<PublicOpinionReviewReportVO | null>(null);
    const refreshing = ref(false);
    const loading = ref(false);
    const finished = ref(false);
    const pageNumber = ref(1);
    const total = ref(0);
    const requestSeq = ref(0);
    const exporting = ref(false);
    const pdfReport = ref<PublicOpinionReviewReportVO | null>(null);
    const pdfRef = ref<HTMLElement | null>(null);

    const filters = reactive({
      keyword: "",
      reportStatus: "" as ReviewReportStatus | "",
    });

    const draft = reactive({
      reportName: "",
      overview: "",
      spreadPath: "",
      responseProcess: "",
      improvementSuggestions: "",
    });

    const syncDraft = (report: PublicOpinionReviewReportVO): void => {
      draft.reportName = report.reportName || reportTitle(report);
      draft.overview = report.overview || "";
      draft.spreadPath = report.spreadPath || "";
      draft.responseProcess = report.responseProcess || "";
      draft.improvementSuggestions = report.improvementSuggestions || "";
    };

    const loadList = async (resetPage = false): Promise<void> => {
      if (loading.value && !resetPage) return;
      const seq = requestSeq.value + 1;
      requestSeq.value = seq;
      if (resetPage) {
        pageNumber.value = 1;
        total.value = 0;
        rows.value = [];
        finished.value = false;
      }
      loading.value = true;
      const currentPage = pageNumber.value;
      try {
        const result = await securityOpinionApi.pageReviewReports({
          pageNumber: currentPage,
          pageSize: PAGE_SIZE,
          keyword: filters.keyword.trim() || undefined,
          reportStatus: filters.reportStatus || undefined,
        });
        if (seq !== requestSeq.value) return;
        total.value = result.total ?? 0;
        rows.value = resetPage ? result.records : [...rows.value, ...result.records];
        pageNumber.value = currentPage + 1;
        finished.value = (total.value > 0 && rows.value.length >= total.value) || result.records.length < PAGE_SIZE;
      } finally {
        if (seq === requestSeq.value) {
          loading.value = false;
          refreshing.value = false;
        }
      }
    };

    const openDetail = async (item: PublicOpinionReviewReportVO): Promise<void> => {
      active.value = await securityOpinionApi.getReviewReportEvent(item.eventId);
      syncDraft(active.value);
    };

    const enterDetail = (item: PublicOpinionReviewReportVO): void => {
      void router.push({ path: "/review-reports", query: { eventId: item.eventId } });
    };

    const generate = async (): Promise<void> => {
      if (!active.value?.eventId) return;
      if (!isArchivedEvent(active.value)) {
        showToast("请先归档事件后再生成复盘报告");
        return;
      }
      active.value = await securityOpinionApi.generateReviewReport(active.value.eventId);
      syncDraft(active.value);
      showToast(active.value.degraded ? "已生成降级草稿" : "报告已生成");
    };

    const saveDraft = async (): Promise<void> => {
      if (!active.value?.reportId) {
        showToast("请先生成报告");
        return;
      }
      await securityOpinionApi.saveReviewReportDraft(active.value.reportId, { ...draft });
      active.value = await securityOpinionApi.getReviewReportEvent(active.value.eventId);
      syncDraft(active.value);
      showToast("草稿已保存");
    };

    const finalize = async (): Promise<void> => {
      if (!active.value?.reportId) {
        showToast("请先生成报告");
        return;
      }
      await showConfirmDialog({ title: "定稿确认", message: "定稿后报告将锁定，确认定稿？" });
      await securityOpinionApi.finalizeReviewReport(active.value.reportId);
      active.value = await securityOpinionApi.getReviewReportEvent(active.value.eventId);
      syncDraft(active.value);
      showToast("报告已定稿");
    };

    const exportPdf = async (): Promise<void> => {
      if (!active.value) return;
      exporting.value = true;
      try {
        pdfReport.value = active.value.eventId ? await securityOpinionApi.getReviewReportEvent(active.value.eventId) : active.value;
        await nextTick();
        if (pdfRef.value) {
          await downloadPDF(pdfRef.value, `${reportTitle(pdfReport.value)}_${dayjs().format("YYYYMMDD")}`);
        }
      } finally {
        exporting.value = false;
      }
    };

    const reset = (): void => {
      filters.keyword = "";
      filters.reportStatus = "";
      void loadList(true);
    };

    const onRefresh = async (): Promise<void> => {
      refreshing.value = true;
      await loadList(true);
    };

    onMounted(() => {
      document.title = "复盘报告";
      void loadList(true);
    });

    watch(
      () => route.query.eventId,
      (value) => {
        const eventId = typeof value === "string" ? value : undefined;
        if (eventId) {
          void openDetail({ eventId } as PublicOpinionReviewReportVO);
          return;
        }
        active.value = null;
      },
      { immediate: true },
    );

    const statusTag = (status?: string): JSX.Element => (
      <Tag plain>{REPORT_STATUS_LABEL[String(status ?? "NOT_GENERATED").toUpperCase()] || status || "未生成"}</Tag>
    );

    const levelTag = (item: PublicOpinionReviewReportVO): JSX.Element => (
      <Tag type={WARNING_LEVEL_TAG[String(item.warningLevel ?? "").toUpperCase()] ?? "primary"} plain>
        {item.warningLevelText || WARNING_LEVEL_LABEL[String(item.warningLevel ?? "").toUpperCase()] || "-"}
      </Tag>
    );

    const card = (item: PublicOpinionReviewReportVO): JSX.Element => (
      <div key={item.eventId} class={styles.card} onClick={() => enterDetail(item)}>
        <div class={styles.cardHeader}>
          <div class={styles.title}>{item.eventName || item.title || item.eventId}</div>
          {levelTag(item)}
        </div>
        <div class={styles.metaGrid}>
          <span>编号：{item.eventCode || item.eventId}</span>
          <span>状态：{REPORT_STATUS_LABEL[String(item.reportStatus ?? "NOT_GENERATED").toUpperCase()] || "-"}</span>
          <span>热度：{item.heatIndex ?? "-"}</span>
          <span>归档：{formatDateTime(item.archiveTime)}</span>
        </div>
        <div class={styles.cardFooter}>
          {statusTag(item.reportStatus)}
          <Button
            size="mini"
            type="primary"
            plain
            onClick={(event) => {
              event.stopPropagation();
              enterDetail(item);
            }}
          >
            AI自动复盘
          </Button>
        </div>
      </div>
    );

    const detail = (report: PublicOpinionReviewReportVO): JSX.Element => {
      const finalized = String(report.reportStatus ?? "").toUpperCase() === "FINALIZED";
      return (
        <div class={styles.detailPage}>
          <Bar name="复盘报告" isShowRight={false} />
          <div class={styles.detailHeader}>{report.degraded ? <Tag type="warning">降级草稿</Tag> : null}</div>
          <div class={styles.panel}>
            <div class={styles.detailTitle}>{reportTitle(report)}</div>
            <div class={styles.metaGrid}>
              <span>编号：{report.eventCode || report.eventId}</span>
              <span>事件：{eventTitle(report)}</span>
              <span>等级：{report.warningLevelText || WARNING_LEVEL_LABEL[String(report.warningLevel ?? "").toUpperCase()] || "-"}</span>
              <span>热度：{report.heatIndex ?? "-"}</span>
              <span>来源：{report.source || "-"}</span>
              <span>预警：{formatDateTime(report.alertTime)}</span>
              <span>归档：{formatDateTime(report.archiveTime)}</span>
            </div>
          </div>
          <div class={styles.panel}>
            <div class={styles.sectionTitle}>传播路径分析</div>
            <div class={styles.spreadTrack}>
              <div style={{ width: `${Math.max(0, Math.min(100, report.heatIndex ?? 0))}%` }}></div>
            </div>
            {(report.timeline ?? []).map((node, idx) => (
              <div key={`${node.time}-${idx}`} class={styles.timelineLine}>
                <span>{formatDateTime(node.actionTime || node.time)}</span>
                <div>{timelineText(node)}</div>
              </div>
            ))}
          </div>
          <div class={styles.panel}>
            <div class={styles.sectionTitle}>AI 复盘报告</div>
            <Field v-model={draft.reportName} label="报告名称" disabled={finalized} />
            <Field v-model={draft.overview} label="事件概述" type="textarea" rows={3} disabled={finalized} />
            <Field v-model={draft.spreadPath} label="传播路径" type="textarea" rows={3} disabled={finalized} />
            <Field v-model={draft.responseProcess} label="应对过程" type="textarea" rows={3} disabled={finalized} />
            <Field v-model={draft.improvementSuggestions} label="改进建议" type="textarea" rows={3} disabled={finalized} />
          </div>
          <div class={styles.actionGrid}>
            {finalized ? (
              <Button size="small" type="primary" loading={exporting.value} onClick={() => void exportPdf()} disabled={!report.reportId}>
                导出PDF
              </Button>
            ) : (
              <>
                <Button size="small" plain onClick={() => void generate()}>
                  {report.reportId ? "重生成" : "AI生成"}
                </Button>
                <Button size="small" type="primary" plain onClick={() => void saveDraft()} disabled={!report.reportId}>
                  保存
                </Button>
                <Button size="small" plain onClick={() => void finalize()} disabled={!report.reportId}>
                  定稿
                </Button>
                <Button size="small" plain loading={exporting.value} onClick={() => void exportPdf()} disabled={!report.reportId}>
                  导出PDF
                </Button>
              </>
            )}
          </div>
          {pdfReport.value ? (
            <div
              class={styles.pdfContent}
              ref={(el) => {
                pdfRef.value = el as HTMLElement | null;
              }}
            >
              <h1>{reportTitle(pdfReport.value)}</h1>
              <p>事件编号：{pdfReport.value.eventCode || pdfReport.value.eventId}</p>
              <p>事件标题：{eventTitle(pdfReport.value)}</p>
              <h2>一、事件概述</h2>
              <p>{pdfReport.value.overview || "-"}</p>
              <h2>二、传播路径</h2>
              <p>{spreadPathForPdf(pdfReport.value)}</p>
              <h2>三、应对过程</h2>
              <p>{pdfReport.value.responseProcess || "-"}</p>
              <h2>四、改进建议</h2>
              <p>{pdfReport.value.improvementSuggestions || "-"}</p>
            </div>
          ) : null}
        </div>
      );
    };

    return (): JSX.Element =>
      active.value ? (
        detail(active.value)
      ) : (
        <div class={styles.page}>
          <Bar name="复盘报告" isShowRight={false} onReset={reset} onSubmit={() => void loadList(true)} />
          <div class={styles.searchBar}>
            <Search
              v-model={filters.keyword}
              placeholder="搜索事件名称/编号"
              shape="round"
              class={styles.search}
              onSearch={() => void loadList(true)}
              onClear={() => void loadList(true)}
            />
          </div>
          <div class={styles.filterBar}>
            <DropdownMenu overlay={false} class={styles.dropdownMenu}>
              <DropdownItem
                v-model={filters.reportStatus}
                title={`状态：${REPORT_STATUS_OPTIONS.find((item) => item.value === filters.reportStatus)?.label ?? "全部"}`}
                options={REPORT_STATUS_OPTIONS}
                onChange={() => void loadList(true)}
              />
            </DropdownMenu>
          </div>
          <PullRefresh v-model={refreshing.value} onRefresh={onRefresh}>
            <List
              class={styles.list}
              v-model:loading={loading.value}
              finished={finished.value}
              finishedText={rows.value.length ? "— 没有更多了 —" : "暂无归档事件"}
              onLoad={() => void loadList()}
            >
              {rows.value.map(card)}
            </List>
          </PullRefresh>
        </div>
      );
  },
});
