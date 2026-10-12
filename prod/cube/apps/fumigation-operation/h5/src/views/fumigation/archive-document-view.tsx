import { Button, Cell, CellGroup, Empty, Loading, showToast } from "vant";
import { computed, defineComponent, ref, shallowRef, watch } from "vue";

import type {
  FumigationArchiveDocument,
  FumigationArchiveDocumentPh3TrendPoint,
} from "@ghcloud/cube-service-interface/fumigation-operation";
import {
  generateFumigationArchive,
  getFumigationArchiveDocument,
  listFumigationArchives,
} from "@ghcloud/cube-services-client/fumigation-operation.client";

import { formatDateTimeValue } from "./state";

const COMPLIANCE_STATEMENTS = [
  "《粮油储存安全责任暂行规定》——熏蒸作业须全流程记录留痕，磷化氢泄漏须可追溯可举证",
  "《安全生产法》（2021修正）第30条——特种作业人员须持证上岗",
  "《安全生产法》（2021修正）第43条——危险作业须审批并安排专人现场监护",
  "《工贸企业有限空间作业安全管理规定》（应急管理部令第13号）第6/10/12条——三步锁定、禁止单人、连续监测",
];

const formatNumber = (value?: number | string): string => {
  if (value == null || value === "") {
    return "--";
  }
  const numeric = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(numeric)) {
    return `${value}`;
  }
  return `${numeric}`;
};

const formatQuantity = (value?: number | string, unit?: string): string => {
  if (value == null || value === "") {
    return "--";
  }
  const numeric = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(numeric)) {
    return `${value}${unit ? ` ${unit}` : ""}`;
  }
  const formatted = numeric.toLocaleString("zh-CN");
  return unit ? `${formatted} ${unit}` : formatted;
};

const ph3BarHeight = (value: number, max: number): number => Math.max(8, Math.round((value / max) * 72));

const ph3BarColor = (value?: number): string => {
  if (value == null) {
    return "#94a3b8";
  }
  if (value >= 200) {
    return "#ef4444";
  }
  if (value >= 25) {
    return "#f59e0b";
  }
  return "#16a34a";
};

const normalizeArchiveDocument = (raw: FumigationArchiveDocument | null | undefined): FumigationArchiveDocument | null => {
  if (raw == null || typeof raw !== "object") {
    return null;
  }
  return {
    ...raw,
    archiveId: raw.archiveId ?? (raw as { id?: string }).id ?? "",
    approvals: raw.approvals ?? [],
    alarms: raw.alarms ?? [],
    prechecks: raw.prechecks
      ? {
          ...raw.prechecks,
          rows: raw.prechecks.rows ?? [],
        }
      : undefined,
    ph3Monitoring: raw.ph3Monitoring
      ? {
          ...raw.ph3Monitoring,
          trend: raw.ph3Monitoring.trend ?? [],
        }
      : undefined,
    completion: raw.completion
      ? {
          ...raw.completion,
          rows: raw.completion.rows ?? [],
        }
      : undefined,
  };
};

export const ArchiveDocumentView = defineComponent({
  name: "ArchiveDocumentView",
  props: {
    archiveId: { type: String, required: true },
    showToolbar: { type: Boolean, default: false },
  },
  setup: (props, { expose }) => {
    const loading = shallowRef(false);
    const exporting = shallowRef(false);
    const documentRef = ref<HTMLDivElement | null>(null);
    const archiveDocument = ref<FumigationArchiveDocument | null>(null);

    const ph3TrendMax = computed(() => {
      const trend = archiveDocument.value?.ph3Monitoring?.trend ?? [];
      return trend.reduce((max, point) => Math.max(max, point.valuePpm ?? 0), 1);
    });

    const loadDocument = async (archiveId: string): Promise<void> => {
      if (archiveId === "") {
        archiveDocument.value = null;
        return;
      }
      loading.value = true;
      try {
        const raw = await getFumigationArchiveDocument(archiveId);
        archiveDocument.value = normalizeArchiveDocument(raw as FumigationArchiveDocument);
      } catch (error) {
        archiveDocument.value = null;
        showToast({ type: "fail", message: (error as Error).message || "获取合规档案失败" });
      } finally {
        loading.value = false;
      }
    };

    watch(
      () => props.archiveId,
      (archiveId) => {
        void loadDocument(archiveId);
      },
      { immediate: true },
    );

    const handleExportPdf = async (): Promise<void> => {
      if (documentRef.value == null || archiveDocument.value == null) {
        return;
      }
      exporting.value = true;
      try {
        const { downloadPDF } = await import("@ghcloud/cube-utils");
        const warehouse = archiveDocument.value.cover?.warehouseName ?? archiveDocument.value.summary?.warehouseName ?? "仓房";
        const dateLabel = formatDateTimeValue(archiveDocument.value.generatedTime, "", "YYYY-MM-DD");
        await downloadPDF(documentRef.value, `熏蒸作业合规档案_${warehouse}_${dateLabel}`);
        showToast({ type: "success", message: "PDF 导出完成" });
      } catch (error) {
        showToast({ type: "fail", message: (error as Error).message || "PDF 导出失败" });
      } finally {
        exporting.value = false;
      }
    };

    expose({
      exportPdf: handleExportPdf,
    });

    const renderPh3Trend = (points: FumigationArchiveDocumentPh3TrendPoint[]): JSX.Element => {
      if (points.length === 0) {
        return <Empty image-size={48} description="暂无监测趋势数据" />;
      }
      const max = ph3TrendMax.value;
      return (
        <section class="fz-h5-trend fz-h5-archive-trend">
          {points.map((point, index) => {
            const value = point.valuePpm ?? 0;
            return (
              <div key={`${point.timeLabel ?? index}-${index}`}>
                <i style={{ height: `${ph3BarHeight(value, max)}px`, background: ph3BarColor(value) }} />
                <span>{point.timeLabel ?? ""}</span>
              </div>
            );
          })}
        </section>
      );
    };

    const renderSectionTitle = (title: string): JSX.Element => <div class="fz-h5-archive-section-title">{title}</div>;

    const renderDocument = (doc: FumigationArchiveDocument): JSX.Element => {
      const cover = doc.cover;
      const summary = doc.summary;
      const prechecks = doc.prechecks;
      const ph3 = doc.ph3Monitoring;
      const completion = doc.completion;
      const approvals = doc.approvals ?? [];
      const alarms = doc.alarms ?? [];

      return (
        <div class="fz-h5-archive-document" ref={documentRef}>
          <section class="fz-h5-archive-cover">
            <div class="fz-h5-archive-cover-label">熏蒸作业合规档案</div>
            <div class="fz-h5-archive-cover-grid">
              {cover?.warehouseName ? (
                <>
                  <span>仓房编号</span>
                  <strong>{cover.warehouseCode ?? cover.warehouseName}</strong>
                </>
              ) : null}
              {cover?.grainVarietyName ? (
                <>
                  <span>粮食品种</span>
                  <strong>{cover.grainVarietyName}</strong>
                </>
              ) : null}
              {cover?.grainQuantity != null ? (
                <>
                  <span>粮食数量</span>
                  <strong>{formatQuantity(cover.grainQuantity, cover.grainQuantityUnit)}</strong>
                </>
              ) : null}
              {cover?.pesticideTypeName ? (
                <>
                  <span>药剂种类</span>
                  <strong>{cover.pesticideTypeName}</strong>
                </>
              ) : null}
              {cover?.pesticideDosage ? (
                <>
                  <span>药剂用量</span>
                  <strong>{cover.pesticideDosage}</strong>
                </>
              ) : null}
              {cover?.applicationMethodName ? (
                <>
                  <span>施药方式</span>
                  <strong>{cover.applicationMethodName}</strong>
                </>
              ) : null}
              {cover?.sealedDays != null ? (
                <>
                  <span>密闭时间</span>
                  <strong>{cover.sealedDays} 天</strong>
                </>
              ) : null}
              {cover?.workDateLabel ? (
                <>
                  <span>作业日期</span>
                  <strong>{cover.workDateLabel}</strong>
                </>
              ) : null}
            </div>
            <div class="fz-h5-archive-cover-footer">
              档案编号：{doc.archiveNo ?? doc.archiveId}
              <br />
              生成时间：{formatDateTimeValue(doc.generatedTime, "--", "YYYY-MM-DD HH:mm:ss")}
            </div>
          </section>

          <section class="fz-h5-card">
            {renderSectionTitle("一、作业概要")}
            <div class="fz-h5-metrics">
              <div>
                <span>实际时长</span>
                <strong>{summary?.actualDurationLabel ?? "--"}</strong>
              </div>
              <div>
                <span>作业人员数量</span>
                <strong>{summary?.workerCount ?? "--"}人</strong>
              </div>
            </div>
            <CellGroup inset>
              <Cell title="工单编号" value={summary?.operationNo ?? doc.workCode ?? "--"} />
              <Cell title="申请人" value={summary?.applicantName ?? "--"} />
              <Cell title="申请时间" value={formatDateTimeValue(summary?.applyTime, "--", "YYYY-MM-DD HH:mm")} />
              <Cell title="仓房编号" value={summary?.warehouseCode ?? summary?.warehouseName ?? "--"} />
              <Cell title="粮食品种" value={summary?.grainVarietyName ?? "--"} />
              <Cell title="数量" value={formatQuantity(summary?.grainQuantity, summary?.grainQuantityUnit)} />
              <Cell title="药剂种类" value={summary?.pesticideTypeName ?? "--"} />
              <Cell title="用量" value={summary?.pesticideDosage ?? "--"} />
              <Cell title="施药方式" value={summary?.applicationMethodName ?? "--"} />
              <Cell title="密闭天数" value={summary?.sealedDays != null ? `${summary.sealedDays} 天` : "--"} />
              <Cell title="最终状态" value={summary?.finalStatusName ?? "已归档"} />
              <Cell title="归档时间" value={formatDateTimeValue(summary?.archiveTime, "--", "YYYY-MM-DD HH:mm")} />
            </CellGroup>
          </section>

          <section class="fz-h5-card">
            {renderSectionTitle("二、审批链")}
            {approvals.length === 0 ? (
              <Empty image-size={48} description="暂无审批记录" />
            ) : (
              approvals.map((row, index) => (
                <div class="fz-h5-timeline" key={`${row.index ?? index}-${index}`}>
                  <i />
                  <div>
                    <strong>
                      {row.approverName ?? "--"} · {row.actionName ?? "--"}
                    </strong>
                    <span>
                      {formatDateTimeValue(row.approvalTime, "--", "YYYY-MM-DD HH:mm")} · {row.roleName ?? "--"}
                    </span>
                    <p>{row.opinion ?? "--"}</p>
                  </div>
                </div>
              ))
            )}
          </section>

          <section class="fz-h5-card">
            {renderSectionTitle("三、前置条件三步校验")}
            {prechecks?.checkedTime != null && prechecks.checkedTime !== "" ? (
              <div class="fz-h5-field-note">
                校验时间：{formatDateTimeValue(prechecks.checkedTime, "--", "YYYY-MM-DD HH:mm")}
                {" · "}
                校验结果：{prechecks.resultLabel ?? "--"}
              </div>
            ) : null}
            {(prechecks?.rows ?? []).length === 0 ? (
              <Empty image-size={48} description="暂无校验记录" />
            ) : (
              <CellGroup inset>
                {(prechecks?.rows ?? []).map((row, index) => (
                  <Cell
                    key={`${row.itemName ?? index}-${index}`}
                    title={row.stepLabel ? `${row.stepLabel} ${row.itemName ?? ""}` : row.itemName}
                    label={`检测值 ${row.detectedValue ?? "--"} · 阈值 ${row.thresholdRule ?? "--"}`}
                    value={row.resultLabel}
                  />
                ))}
              </CellGroup>
            )}
          </section>

          <section class="fz-h5-card">
            {renderSectionTitle("五、磷化氢监测数据")}
            {ph3?.sampleCount != null ? (
              <div class="fz-h5-field-note">
                总采样数：{ph3.sampleCount} 条{ph3.sensorCodes ? ` · 传感器：${ph3.sensorCodes}` : ""}
              </div>
            ) : null}
            <div class="fz-h5-metrics">
              <div>
                <span>仓内最高 (ppm)</span>
                <strong>{formatNumber(ph3?.indoorMaxPpm)}</strong>
              </div>
              <div>
                <span>仓内最低 (ppm)</span>
                <strong>{formatNumber(ph3?.indoorMinPpm)}</strong>
              </div>
              <div>
                <span>仓内平均 (ppm)</span>
                <strong>{formatNumber(ph3?.indoorAvgPpm)}</strong>
              </div>
              <div>
                <span>仓外最高 (ppm)</span>
                <strong>{formatNumber(ph3?.outdoorMaxPpm)}</strong>
              </div>
            </div>
            <div class="fz-h5-field-title">仓内磷化氢浓度趋势（全程）</div>
            {renderPh3Trend(ph3?.trend ?? [])}
          </section>

          <section class="fz-h5-card">
            {renderSectionTitle("六、告警记录")}
            {alarms.length === 0 ? (
              <Empty image-size={48} description="作业时段内无报警记录" />
            ) : (
              alarms.map((row, index) => (
                <div class="fz-h5-timeline" key={`${row.alarmId ?? index}`}>
                  <i />
                  <div>
                    <strong>{row.alarmEventName ?? "--"}</strong>
                    <span>
                      {formatDateTimeValue(row.alarmTime, "--", "YYYY-MM-DD HH:mm:ss")}
                      {" · "}
                      {row.alarmLevelName ?? "--"}
                      {" · "}
                      {row.alarmStatusName ?? "--"}
                    </span>
                    <p>{row.content ?? "--"}</p>
                  </div>
                </div>
              ))
            )}
          </section>

          <section class="fz-h5-card">
            {renderSectionTitle("九、完工确认")}
            {(completion?.rows ?? []).length === 0 ? (
              <Empty image-size={48} description="暂无完工确认数据" />
            ) : (
              <CellGroup inset>
                {(completion?.rows ?? []).map((row, index) => (
                  <Cell key={`${row.itemName ?? index}-${index}`} title={row.itemName} label={row.detail} value={row.resultLabel} />
                ))}
              </CellGroup>
            )}
            {completion?.completionDesc ? <div class="fz-h5-archive-note">✅ {completion.completionDesc}</div> : null}
          </section>

          <section class="fz-h5-card">
            {renderSectionTitle("十、合规声明与签章")}
            <div class="fz-h5-archive-statements">
              <p>本档案依据以下法规要求生成，确保熏蒸作业全流程记录留痕、可追溯、不可删除：</p>
              <ul>
                {COMPLIANCE_STATEMENTS.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <div class="fz-h5-archive-footer">本档案由开河平台AI安全应急管理系统自动生成。 档案编号：{doc.archiveNo ?? doc.archiveId}</div>
          </section>
        </div>
      );
    };

    return (): JSX.Element => (
      <div class="fz-h5-archive-view">
        {props.showToolbar ? (
          <Button block type="primary" loading={exporting.value} class="fz-h5-main-action" onClick={() => void handleExportPdf()}>
            导出 PDF
          </Button>
        ) : null}
        {loading.value ? (
          <div class="fz-h5-archive-loading">
            <Loading size="24px">加载中...</Loading>
          </div>
        ) : archiveDocument.value == null ? (
          <Empty description="暂无档案数据" />
        ) : (
          renderDocument(archiveDocument.value)
        )}
      </div>
    );
  },
});
