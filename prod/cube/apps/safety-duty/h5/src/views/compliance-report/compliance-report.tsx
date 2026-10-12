import { Button, Empty, Picker, Popup, Tag, showNotify } from "vant";
import { defineComponent, nextTick, onMounted, ref, type VNode } from "vue";

import type {
  DutyReportDetailVO,
  DutyReportGapDetailVO,
  DutyReportMappingDetailVO,
  DutyReportMappingVO,
  DutyReportQueryParam,
  DutyReportVO,
} from "@ghcloud/cube-service-interface/safety-personnel";
import {
  getCurrentDutyReport,
  getCurrentDutyReportGapDetail,
  getCurrentDutyReportMapping,
  pageCurrentDutyReports,
} from "@ghcloud/cube-services-client/safety-personnel.client";
import { downloadPDF } from "@ghcloud/cube-utils";

import { Bar } from "@/components/bar/bar";
import { useAuthRequest } from "@/hooks/use-auth-request";
import { formatText, periodLabel } from "@/utils";

import styles from "./compliance-report.module.less";

const periodColumns = [
  { text: "全部周期", value: "" },
  { text: "月度", value: "MONTH" },
  { text: "季度", value: "QUARTER" },
  { text: "年度", value: "YEAR" },
];

const methodColumns = [
  { text: "全部方式", value: "" },
  { text: "系统自动", value: "AUTO" },
  { text: "手动生成", value: "MANUAL" },
];

const methodText = (method?: string): string => {
  const map: Record<string, string> = { AUTO: "系统自动", MANUAL: "手动生成" };
  return method ? (map[method] ?? method) : "--";
};

const methodTag = (method?: string): VNode => (
  <Tag type={method === "AUTO" ? "primary" : "success"} class={styles.methodTag}>
    {methodText(method)}
  </Tag>
);

const mappingStatusTag = (status?: string): VNode => {
  const completed = status === "COMPLETED";
  return <Tag type={completed ? "success" : "warning"}>{completed ? "已完成" : "待完善"}</Tag>;
};

const sourceText = (sourceType?: string): string => {
  const map: Record<string, string> = { SYSTEM_COLLECT: "系统采集", MANUAL: "手动填报" };
  return sourceType ? (map[sourceType] ?? sourceType) : "--";
};

export const ComplianceReportPage = defineComponent({
  name: "ComplianceReportPage",
  setup: () => {
    const records = ref<DutyReportVO[]>([]);
    const detail = ref<DutyReportDetailVO>();
    const pdfDetail = ref<DutyReportDetailVO>();
    const pdfOutputRef = ref<HTMLElement>();
    const mappingDetail = ref<DutyReportMappingDetailVO>();
    const gapDetail = ref<DutyReportGapDetailVO>();
    const total = ref(0);
    const pageNumber = ref(1);
    const periodType = ref("");
    const generateMethod = ref("");
    const periodPickerOpen = ref(false);
    const methodPickerOpen = ref(false);
    const detailOpen = ref(false);
    const previewOpen = ref(false);
    const mappingOpen = ref(false);
    const exportingReportId = ref<number>();

    const loadReports = async (reset = true): Promise<void> => {
      if (reset) {
        pageNumber.value = 1;
      }
      try {
        const page = await useAuthRequest(() =>
          pageCurrentDutyReports({
            pageNumber: pageNumber.value,
            pageSize: 10,
            periodType: periodType.value || undefined,
            generateMethod: generateMethod.value || undefined,
          } as DutyReportQueryParam),
        );
        total.value = page.total ?? 0;
        const next = page.records ?? [];
        records.value = reset ? next : [...records.value, ...next];
      } catch (e) {
        const error = e as { message?: string; errorMessage?: string };
        showNotify({ type: "danger", message: error.errorMessage || error.message || "查询合规报告失败" });
        if (reset) {
          records.value = [];
          total.value = 0;
        } else {
          pageNumber.value = Math.max(1, pageNumber.value - 1);
        }
      }
    };

    onMounted(() => {
      void loadReports();
    });

    const openDetail = async (id?: number): Promise<void> => {
      if (!id) {
        return;
      }
      try {
        detail.value = await useAuthRequest(() => getCurrentDutyReport(id));
        detailOpen.value = true;
      } catch (e) {
        const error = e as { message?: string; errorMessage?: string };
        showNotify({ type: "danger", message: error.errorMessage || error.message || "查询报告详情失败" });
      }
    };

    const safeFileName = (value?: string): string => (value || "合规报告").replace(/[\\/:*?"<>|]/g, "_");

    const loadReportDetail = async (id?: number): Promise<DutyReportDetailVO | undefined> => {
      if (!id) {
        return undefined;
      }
      return await useAuthRequest(() => getCurrentDutyReport(id));
    };

    const downloadReportPdf = async (record?: DutyReportVO): Promise<void> => {
      const reportId = record?.id ?? detail.value?.report?.id;
      if (!reportId) {
        showNotify({ type: "warning", message: "请选择需要下载的报告" });
        return;
      }
      exportingReportId.value = reportId;
      try {
        const reportDetail = detail.value?.report?.id === reportId ? detail.value : await loadReportDetail(reportId);
        if (!reportDetail?.report) {
          showNotify({ type: "warning", message: "暂无可导出的报告内容" });
          return;
        }
        pdfDetail.value = reportDetail;
        await nextTick();
        if (!pdfOutputRef.value) {
          showNotify({ type: "danger", message: "PDF 渲染容器未找到" });
          return;
        }
        await downloadPDF(pdfOutputRef.value, safeFileName(reportDetail.report.reportName));
      } catch (e) {
        const error = e as { message?: string; errorMessage?: string };
        showNotify({ type: "danger", message: error.errorMessage || error.message || "下载 PDF 失败" });
      } finally {
        exportingReportId.value = undefined;
      }
    };

    const previewReportPdf = async (record?: DutyReportVO): Promise<void> => {
      const reportId = record?.id ?? detail.value?.report?.id;
      if (!reportId) {
        showNotify({ type: "warning", message: "请选择需要预览的报告" });
        return;
      }
      try {
        const reportDetail = detail.value?.report?.id === reportId ? detail.value : await loadReportDetail(reportId);
        if (!reportDetail?.report) {
          showNotify({ type: "warning", message: "暂无可预览的报告内容" });
          return;
        }
        pdfDetail.value = reportDetail;
        previewOpen.value = true;
      } catch (e) {
        const error = e as { message?: string; errorMessage?: string };
        showNotify({ type: "danger", message: error.errorMessage || error.message || "预览 PDF 失败" });
      }
    };

    const openMapping = async (mapping: DutyReportMappingVO): Promise<void> => {
      if (!mapping.reportId || !mapping.id) {
        return;
      }
      try {
        const [mappingData, gapData] = await useAuthRequest(() =>
          Promise.all([
            getCurrentDutyReportMapping(Number(mapping.reportId), Number(mapping.id)),
            mapping.mappingStatus === "INCOMPLETE"
              ? getCurrentDutyReportGapDetail(Number(mapping.reportId), Number(mapping.id))
              : Promise.resolve({} as DutyReportGapDetailVO),
          ]),
        );
        mappingDetail.value = mappingData;
        gapDetail.value = gapData;
        mappingOpen.value = true;
      } catch (e) {
        const error = e as { message?: string; errorMessage?: string };
        showNotify({ type: "danger", message: error.errorMessage || error.message || "查询对标详情失败" });
      }
    };

    const renderReport = (record: DutyReportVO): VNode => (
      <div class={styles.reportItem} key={record.id} onClick={() => void openDetail(record.id)}>
        <div class={styles.top}>
          <span>{formatText(record.reportName)}</span>
          {methodTag(record.generateMethod)}
        </div>
        <div class={styles.meta}>
          {formatText(record.lawNameLabel)} · {periodLabel(record.periodType)} · {formatText(record.periodLabel)}
        </div>
        <div class={styles.meta}>
          完成 {record.completedCount ?? 0} 条，待完善 {record.incompleteCount ?? 0} 条
        </div>
        <div class={styles.cardActions}>
          <Button
            size="small"
            onClick={(event: MouseEvent) => {
              event.stopPropagation();
              void openDetail(record.id);
            }}
          >
            查看
          </Button>
          <Button
            size="small"
            onClick={(event: MouseEvent) => {
              event.stopPropagation();
              void previewReportPdf(record);
            }}
          >
            预览 PDF
          </Button>
          <Button
            size="small"
            type="primary"
            loading={exportingReportId.value === record.id}
            onClick={(event: MouseEvent) => {
              event.stopPropagation();
              void downloadReportPdf(record);
            }}
          >
            下载 PDF
          </Button>
        </div>
      </div>
    );

    const renderMapping = (mapping: DutyReportMappingVO): VNode => (
      <div class={styles.mappingItem} key={mapping.id} onClick={() => void openMapping(mapping)}>
        <div class={styles.top}>
          <span>
            {formatText(mapping.clauseNo)} {formatText(mapping.lawNameLabel)}
          </span>
          {mappingStatusTag(mapping.mappingStatus)}
        </div>
        <div class={styles.meta}>{formatText(mapping.taskDescription)}</div>
        <div class={styles.meta}>证据 {mapping.evidenceCount ?? 0} 条</div>
      </div>
    );

    const renderPdfReportBody = (): VNode | null => {
      const report = pdfDetail.value?.report;
      if (!report) {
        return null;
      }
      return (
        <>
          <h1 class={styles.pdfTitle}>{formatText(report.reportName)}</h1>
          <div class={styles.pdfMeta}>
            <span>报告周期：{formatText(report.periodLabel)}</span>
            <span>法规名称：{formatText(report.lawNameLabel)}</span>
            <span>责任人：{formatText(report.responsibleUserName)}</span>
            <span>部门：{formatText(report.deptName)}</span>
            <span>生成方式：{methodText(report.generateMethod)}</span>
            <span>生成时间：{formatText(report.generatedTime)}</span>
            <span>
              完成/待完善：{report.completedCount ?? 0} / {report.incompleteCount ?? 0}
            </span>
          </div>
          <section class={styles.pdfSection}>
            <div class={styles.pdfSectionTitle}>法规条款对标明细</div>
            <table class={styles.pdfTable}>
              <thead>
                <tr>
                  <th>条款编号</th>
                  <th>法规名称</th>
                  <th>对标内容</th>
                  <th>状态</th>
                  <th>证据/缺口</th>
                </tr>
              </thead>
              <tbody>
                {(pdfDetail.value?.mappings ?? []).map((mapping) => (
                  <tr key={mapping.id ?? `${mapping.clauseNo}-${mapping.taskDescription}`}>
                    <td>{formatText(mapping.clauseNo)}</td>
                    <td>{formatText(mapping.lawNameLabel)}</td>
                    <td>{formatText(mapping.taskDescription)}</td>
                    <td>{mapping.mappingStatus === "COMPLETED" ? "已完成" : "待完善"}</td>
                    <td>
                      {mapping.mappingStatus === "COMPLETED" ? `证据 ${mapping.evidenceCount ?? 0} 条` : formatText(mapping.gapDescription)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
          <div class={styles.pdfFooter}>
            <span>本报告由安全履职系统基于责任清单履职记录自动生成。</span>
            <span>导出时间：{formatText(Date.now())}</span>
          </div>
        </>
      );
    };

    const renderPdfPreview = (): VNode | null => {
      const body = renderPdfReportBody();
      if (!body) {
        return null;
      }
      return <div class={styles.pdfPreview}>{body}</div>;
    };

    const renderPdfExport = (): VNode | null => {
      const body = renderPdfReportBody();
      if (!body) {
        return null;
      }
      return (
        <div class={styles.pdfOutput} ref={pdfOutputRef}>
          {body}
        </div>
      );
    };

    return (): VNode => (
      <div class={styles.page}>
        <Bar name="合规报告" isShowRight={false} />
        <div class={styles.content}>
          <div class={styles.filters}>
            <Button onClick={() => (periodPickerOpen.value = true)}>
              {periodColumns.find((item) => item.value === periodType.value)?.text}
            </Button>
            <Button onClick={() => (methodPickerOpen.value = true)}>
              {methodColumns.find((item) => item.value === generateMethod.value)?.text}
            </Button>
            <span class={styles.totalText}>共{total.value}条</span>
          </div>
          {records.value.length === 0 ? <Empty description="暂无合规报告" /> : records.value.map(renderReport)}
          {records.value.length < total.value ? (
            <Button
              block
              class={styles.more}
              onClick={() => {
                pageNumber.value += 1;
                void loadReports(false);
              }}
            >
              加载更多
            </Button>
          ) : null}
        </div>

        <Popup v-model:show={periodPickerOpen.value} round position="bottom">
          <Picker
            columns={periodColumns}
            onCancel={() => (periodPickerOpen.value = false)}
            onConfirm={({ selectedOptions }: { selectedOptions: Array<{ value?: string }> }) => {
              periodType.value = selectedOptions[0]?.value || "";
              periodPickerOpen.value = false;
              void loadReports();
            }}
          />
        </Popup>
        <Popup v-model:show={methodPickerOpen.value} round position="bottom">
          <Picker
            columns={methodColumns}
            onCancel={() => (methodPickerOpen.value = false)}
            onConfirm={({ selectedOptions }: { selectedOptions: Array<{ value?: string }> }) => {
              generateMethod.value = selectedOptions[0]?.value || "";
              methodPickerOpen.value = false;
              void loadReports();
            }}
          />
        </Popup>
        <Popup v-model:show={detailOpen.value} position="bottom" round style={{ maxHeight: "86%" }}>
          <div class={styles.popupBody}>
            {detail.value?.report ? (
              <>
                <div class={styles.detailHeader}>
                  <div class={styles.detailName}>{formatText(detail.value.report.reportName)}</div>
                  <div class={styles.meta}>
                    {formatText(detail.value.report.responsibleUserName)} · {formatText(detail.value.report.periodLabel)}
                  </div>
                  <div class={styles.summary}>
                    <div>
                      <span>完成</span>
                      <strong>{detail.value.report.completedCount ?? 0}</strong>
                    </div>
                    <div>
                      <span>待完善</span>
                      <strong>{detail.value.report.incompleteCount ?? 0}</strong>
                    </div>
                    <div>
                      <span>生成方式</span>
                      <strong>{methodText(detail.value.report.generateMethod)}</strong>
                    </div>
                  </div>
                  <div class={styles.detailActions}>
                    <Button size="small" onClick={() => void previewReportPdf()}>
                      预览 PDF
                    </Button>
                    <Button
                      type="primary"
                      size="small"
                      loading={exportingReportId.value === detail.value?.report?.id}
                      onClick={() => void downloadReportPdf()}
                    >
                      下载 PDF
                    </Button>
                  </div>
                </div>
                <div class={styles.sectionTitle}>法规对标</div>
                {(detail.value.mappings ?? []).length === 0 ? (
                  <Empty description="暂无对标结果" />
                ) : (
                  (detail.value.mappings ?? []).map(renderMapping)
                )}
              </>
            ) : (
              <Empty description="暂无报告详情" />
            )}
          </div>
        </Popup>
        <Popup v-model:show={mappingOpen.value} position="bottom" round style={{ maxHeight: "82%" }}>
          <div class={styles.popupBody}>
            {mappingDetail.value?.mapping ? (
              <>
                <div class={styles.top}>
                  <span>
                    {formatText(mappingDetail.value.mapping.clauseNo)} {formatText(mappingDetail.value.mapping.lawNameLabel)}
                  </span>
                  {mappingStatusTag(mappingDetail.value.mapping.mappingStatus)}
                </div>
                <div class={styles.meta}>{formatText(mappingDetail.value.mapping.taskDescription)}</div>
                {gapDetail.value?.gapDescription ? <div class={styles.gap}>{gapDetail.value.gapDescription}</div> : null}
                <div class={styles.sectionTitle}>证据追溯</div>
                {(mappingDetail.value.evidences ?? []).length === 0 ? (
                  <Empty description="暂无证据" />
                ) : (
                  (mappingDetail.value.evidences ?? []).map((evidence) => (
                    <div class={styles.evidenceItem} key={evidence.id}>
                      <div class={styles.top}>
                        <span>{formatText(evidence.title)}</span>
                        <Tag>{sourceText(evidence.sourceType)}</Tag>
                      </div>
                      <div class={styles.meta}>{formatText(evidence.summary)}</div>
                      <div class={styles.meta}>
                        {formatText(evidence.rawData?.sourceApplicationName)} · {formatText(evidence.occurredTime)}
                      </div>
                      <div class={styles.meta}>
                        来源业务：{formatText(evidence.rawData?.sourceBusinessTypeName)} · {formatText(evidence.rawData?.sourceBusinessId)}
                      </div>
                    </div>
                  ))
                )}
              </>
            ) : (
              <Empty description="暂无对标详情" />
            )}
          </div>
        </Popup>
        <Popup v-model:show={previewOpen.value} position="bottom" round style={{ height: "88%" }}>
          <div class={styles.previewBody}>{renderPdfPreview()}</div>
        </Popup>
        {pdfDetail.value ? renderPdfExport() : null}
      </div>
    );
  },
});
