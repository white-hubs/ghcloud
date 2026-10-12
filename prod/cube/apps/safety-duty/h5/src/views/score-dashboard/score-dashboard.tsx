import { Empty, showNotify } from "vant";
import { defineComponent, onMounted, ref, type VNode } from "vue";

import type {
  DutyAppScoreDashboardVO,
  DutyAppScoreDashboardParam,
  DutyScoreDepartmentSummaryVO,
  DutyScoreRankingItemVO,
} from "@ghcloud/cube-service-interface/safety-personnel";
import { getDutyAppScoreDashboard } from "@ghcloud/cube-services-client/safety-personnel.client";

import { Bar } from "@/components/bar/bar";
import { useAuthRequest } from "@/hooks/use-auth-request";
import { formatPercent, formatText } from "@/utils";

import styles from "./score-dashboard.module.less";

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

const periodText = (periodType: string, periodValue: string): string => {
  if (periodType === "YEAR") {
    return `${periodValue}年`;
  }
  if (periodType === "QUARTER") {
    return periodValue.replace("-Q", "年Q");
  }
  return periodValue.replace("-", "年") + "月";
};

export const ScoreDashboardPage = defineComponent({
  name: "ScoreDashboardPage",
  setup: () => {
    const dashboard = ref<DutyAppScoreDashboardVO>({});
    const periodType = ref("MONTH");
    const periodValue = ref(currentPeriodValue("MONTH"));

    const query = (): DutyAppScoreDashboardParam => ({
      periodType: periodType.value,
      periodValue: periodValue.value,
    });

    const loadData = async (): Promise<void> => {
      try {
        dashboard.value = await useAuthRequest(() => getDutyAppScoreDashboard(query()));
      } catch (e) {
        const error = e as { message?: string; errorMessage?: string };
        showNotify({ type: "danger", message: error.errorMessage || error.message || "查询评分看板失败" });
        dashboard.value = {};
      }
    };

    const switchPeriod = (nextType: string): void => {
      periodType.value = nextType;
      periodValue.value = currentPeriodValue(nextType);
      void loadData();
    };

    const renderDepartment = (item: DutyScoreDepartmentSummaryVO): VNode => (
      <div class={styles.deptItem} key={item.deptId}>
        <span>{formatText(item.deptName)}</span>
        <div>
          <strong class={(item.avgCompletionRate ?? 0) >= 0.8 ? styles.successText : styles.warningText}>
            {formatPercent(item.avgCompletionRate)}
          </strong>
          <em>
            {item.participantCount ?? 0}人 · {formatPercent(item.momChangeRate)}
          </em>
        </div>
      </div>
    );

    const renderRanking = (item: DutyScoreRankingItemVO): VNode => (
      <div
        class={[
          styles.rankItem,
          item.level === "D" ? styles.rankDanger : item.level === "C" ? styles.rankWarning : item.level === "A" ? styles.rankSuccess : "",
        ]}
        key={item.userId}
      >
        <span class={styles.rankNo}>{item.rankNo ?? "--"}</span>
        <div class={styles.rankMain}>
          <strong>{formatText(item.userName)}</strong>
          <span>{formatText(item.deptName)}</span>
        </div>
        <div class={styles.rankScore}>
          <strong>{formatPercent(item.completionRate)}</strong>
          <span>{item.mandatoryCompleted ? "法定职责已完成" : `缺${item.mandatoryMissingCount ?? 0}项法定职责`}</span>
        </div>
      </div>
    );

    onMounted(() => {
      void loadData();
    });

    return (): VNode => (
      <div class={styles.page}>
        <Bar name="评分看板" isShowRight={false} />
        <div class={styles.content}>
          <div class={styles.periodLabel}>{periodText(periodType.value, periodValue.value)}</div>
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

          <div class={styles.summary}>
            <div class={styles.card}>
              <strong>{formatPercent(dashboard.value.avgCompletionRate)}</strong>
              <span>全公司平均完成率</span>
            </div>
            <div class={styles.card}>
              <strong class={styles.successText}>{formatPercent(dashboard.value.maxCompletionRate)}</strong>
              <span>最高完成率</span>
            </div>
            <div class={styles.card}>
              <strong class={styles.dangerText}>{formatPercent(dashboard.value.minCompletionRate)}</strong>
              <span>最低完成率</span>
            </div>
          </div>

          <div class={styles.sectionTitle}>部门评分汇总</div>
          <div class={styles.list}>
            {(dashboard.value.departments ?? []).length === 0 ? (
              <Empty description="暂无部门汇总" />
            ) : (
              (dashboard.value.departments ?? []).map(renderDepartment)
            )}
          </div>

          <div class={styles.sectionTitle}>个人排名</div>
          <div class={styles.list}>
            {(dashboard.value.rankings ?? []).length === 0 ? (
              <Empty description="暂无个人排名" />
            ) : (
              (dashboard.value.rankings ?? []).map(renderRanking)
            )}
          </div>
        </div>
      </div>
    );
  },
});
