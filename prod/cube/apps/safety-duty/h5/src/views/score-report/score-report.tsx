import { Empty, showNotify } from "vant";
import { defineComponent, onMounted, ref, type VNode } from "vue";

import type { DutyAppPersonalScoreReportVO, DutyAppScoreReportParam } from "@ghcloud/cube-service-interface/safety-personnel";
import { getDutyAppPersonalScoreReport } from "@ghcloud/cube-services-client/safety-personnel.client";

import { Bar } from "@/components/bar/bar";
import { useAuthRequest } from "@/hooks/use-auth-request";
import { formatPercent, formatText, statusTag } from "@/utils";

import styles from "./score-report.module.less";

const periodOptions = [
  { label: "月度", value: "MONTH" },
  { label: "季度", value: "QUARTER" },
  { label: "年度", value: "YEAR" },
];

const currentPeriodValue = (periodType: string): string => {
  const now = new Date();
  if (periodType === "YEAR") {
    return `${now.getFullYear()}`;
  }
  if (periodType === "QUARTER") {
    return `${now.getFullYear()}-Q${Math.floor(now.getMonth() / 3) + 1}`;
  }
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
};

const rankText = (rankNo?: number): string => (rankNo ? `#${rankNo}` : "--");

export const ScoreReportPage = defineComponent({
  name: "ScoreReportPage",
  setup: () => {
    const report = ref<DutyAppPersonalScoreReportVO>();
    const periodType = ref("MONTH");
    const periodValue = ref(currentPeriodValue("MONTH"));

    const query = (): DutyAppScoreReportParam => {
      const params: DutyAppScoreReportParam = { periodType: periodType.value };
      if (periodValue.value.trim()) {
        params.periodValue = periodValue.value.trim();
      }
      return params;
    };

    const loadReport = async (): Promise<void> => {
      try {
        report.value = await useAuthRequest(() => getDutyAppPersonalScoreReport(query()));
      } catch (e) {
        const error = e as { message?: string; errorMessage?: string };
        showNotify({ type: "danger", message: error.errorMessage || error.message || "查询评分报告失败" });
        report.value = undefined;
      }
    };

    onMounted(() => {
      void loadReport();
    });

    const switchPeriod = (nextType: string): void => {
      periodType.value = nextType;
      periodValue.value = currentPeriodValue(nextType);
      void loadReport();
    };

    const trendClass = (value?: number): string => (typeof value === "number" && value < 0 ? styles.valueDanger : styles.valueSuccess);

    const trendText = (value?: number): string => {
      if (typeof value !== "number") {
        return "--";
      }
      return `${value >= 0 ? "↑" : "↓"}${formatPercent(Math.abs(value))}`;
    };

    return (): VNode => (
      <div class={styles.page}>
        <Bar name="个人履职报告" isShowRight={false} />
        <div class={styles.content}>
          <div class={styles.periodTabs}>
            {periodOptions.map((item) => (
              <button
                type="button"
                class={[styles.periodTab, periodType.value === item.value ? styles.periodTabActive : ""]}
                onClick={() => switchPeriod(item.value)}
                key={item.value}
              >
                {item.label}
              </button>
            ))}
          </div>
          {report.value ? (
            <>
              <div class={styles.person}>
                <div class={styles.personName}>{formatText(report.value.person?.userName)}</div>
                <div class={styles.meta}>
                  {formatText(report.value.person?.deptName)} · {formatText(report.value.person?.roleName)} ·{" "}
                  {formatText(report.value.person?.periodLabel)}
                </div>
              </div>
              <div class={styles.summary}>
                <div class={styles.card}>
                  <div class={styles.label}>完成率</div>
                  <div class={styles.value}>{formatPercent(report.value.summary?.completionRate)}</div>
                </div>
                <div class={styles.card}>
                  <div class={styles.label}>强制项未完成</div>
                  <div class={[styles.value, (report.value.summary?.mandatoryMissingCount ?? 0) > 0 ? styles.valueDanger : ""]}>
                    {report.value.summary?.mandatoryMissingCount ?? 0}
                  </div>
                </div>
                <div class={styles.card}>
                  <div class={styles.label}>公司排名</div>
                  <div class={styles.value}>{rankText(report.value.summary?.companyRankNo)}</div>
                </div>
                <div class={styles.card}>
                  <div class={styles.label}>部门排名</div>
                  <div class={styles.value}>{rankText(report.value.summary?.deptRankNo)}</div>
                </div>
                <div class={styles.card}>
                  <div class={styles.label}>完成项</div>
                  <div class={styles.value}>
                    {report.value.summary?.completedItemCount ?? 0}/{report.value.summary?.totalItemCount ?? 0}
                  </div>
                </div>
                <div class={styles.card}>
                  <div class={styles.label}>环比上期</div>
                  <div class={[styles.value, trendClass(report.value.summary?.momChangeRate)]}>
                    {trendText(report.value.summary?.momChangeRate)}
                  </div>
                </div>
              </div>
              <div class={styles.sectionTitle}>责任清单明细</div>
              {(report.value.assignmentItems ?? []).length === 0 ? (
                <Empty description="暂无责任清单明细" />
              ) : (
                (report.value.assignmentItems ?? []).map((item) => (
                  <div class={styles.item} key={item.itemId}>
                    <div class={styles.itemTop}>
                      <span>{formatText(item.taskDescription)}</span>
                      {statusTag(item.status)}
                    </div>
                    <div class={styles.meta}>
                      {formatText(item.lawNameLabel)} · {formatText(item.lawClauseNo)}
                    </div>
                    <div class={styles.meta}>
                      {item.itemType ? `${formatText(item.itemType)} · ` : ""}
                      截止：{formatText(item.deadlineTime)} · 完成：{formatText(item.completedTime)}
                    </div>
                  </div>
                ))
              )}
              <div class={styles.sectionTitle}>近期排名变化</div>
              {(report.value.rankTrends ?? []).length === 0 ? (
                <Empty description="暂无排名变化" />
              ) : (
                <div class={styles.trendList}>
                  <div class={styles.trendHeader}>
                    <span>周期</span>
                    <span>完成率</span>
                    <span>排名</span>
                  </div>
                  {(report.value.rankTrends ?? []).map((item) => (
                    <div class={styles.trendRow} key={`${item.periodLabel}-${item.companyRankNo}-${item.deptRankNo}`}>
                      <span>{formatText(item.periodLabel)}</span>
                      <strong>{formatPercent(item.completionRate)}</strong>
                      <span>{rankText(item.companyRankNo)}</span>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <Empty description="暂无评分报告" />
          )}
        </div>
      </div>
    );
  },
});
