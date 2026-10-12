import { Empty, Tag, showNotify } from "vant";
import { defineComponent, onMounted, ref, type VNode } from "vue";

import type {
  DutyAppScoreDashboardVO,
  DutyAppScorePublicityVO,
  DutyAppScorePublicityParam,
  DutyScorePublicityPersonVO,
  DutyScoreRankingItemVO,
} from "@ghcloud/cube-service-interface/safety-personnel";
import { getDutyAppScoreDashboard, getDutyAppScorePublicity } from "@ghcloud/cube-services-client/safety-personnel.client";

import { Bar } from "@/components/bar/bar";
import { useAuthRequest } from "@/hooks/use-auth-request";
import { formatPercent, formatText } from "@/utils";

import styles from "./score-publicity.module.less";

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

const levelTag = (level?: string): VNode => {
  const typeMap: Record<string, "primary" | "success" | "warning" | "danger"> = { A: "success", B: "primary", C: "warning", D: "danger" };
  const type = level ? typeMap[level] : undefined;
  return type ? <Tag type={type}>{level}</Tag> : <Tag>--</Tag>;
};

export const ScorePublicityPage = defineComponent({
  name: "ScorePublicityPage",
  setup: () => {
    const dashboard = ref<DutyAppScoreDashboardVO>({});
    const publicity = ref<DutyAppScorePublicityVO>({});
    const periodType = ref("MONTH");
    const periodValue = ref(currentPeriodValue("MONTH"));

    const query = (): DutyAppScorePublicityParam => {
      const params: DutyAppScorePublicityParam = { periodType: periodType.value };
      if (periodValue.value.trim()) {
        params.periodValue = periodValue.value.trim();
      }
      return params;
    };

    const loadData = async (): Promise<void> => {
      try {
        const params = query();
        const [dashboardData, publicityData] = await useAuthRequest(() =>
          Promise.all([getDutyAppScoreDashboard(params), getDutyAppScorePublicity(params)]),
        );
        dashboard.value = dashboardData;
        publicity.value = publicityData;
      } catch (e) {
        const error = e as { message?: string; errorMessage?: string };
        showNotify({ type: "danger", message: error.errorMessage || error.message || "查询排名公示失败" });
        dashboard.value = {};
        publicity.value = {};
      }
    };

    onMounted(() => {
      void loadData();
    });

    const switchPeriod = (nextType: string): void => {
      periodType.value = nextType;
      periodValue.value = currentPeriodValue(nextType);
      void loadData();
    };

    const renderRanking = (list?: DutyScoreRankingItemVO[]): VNode => (
      <>
        {(list ?? []).length === 0 ? (
          <Empty description="暂无排名" />
        ) : (
          (list ?? []).map((item) => (
            <div class={styles.listItem} key={item.userId}>
              <div class={styles.top}>
                <span>
                  {item.rankNo ?? "--"}. {formatText(item.userName)}
                </span>
                {levelTag(item.level)}
              </div>
              <div class={styles.meta}>
                {formatText(item.deptName)} · {formatText(item.roleName)}
              </div>
              <div class={styles.meta}>
                完成率 {formatPercent(item.completionRate)} · 强制项缺 {item.mandatoryMissingCount ?? 0} 项
              </div>
            </div>
          ))
        )}
      </>
    );

    const renderPublicity = (list?: DutyScorePublicityPersonVO[], type: "red" | "black" = "red"): VNode => (
      <>
        {(list ?? []).length === 0 ? (
          <Empty description="暂无公示人员" />
        ) : (
          (list ?? []).map((item) => (
            <div class={[styles.listItem, type === "black" ? styles.blackItem : ""]} key={item.userId}>
              <div class={styles.top}>
                <span>
                  {item.rankNo ?? "--"}. {formatText(item.userName)}
                </span>
                {levelTag(item.level)}
              </div>
              <div class={styles.meta}>{formatText(item.deptName)}</div>
              {type === "black" ? (
                <div class={styles.blackMissing}>法定职责缺 {item.mandatoryMissingCount ?? 0} 项</div>
              ) : (
                <div class={styles.meta}>
                  完成率 {formatPercent(item.completionRate)} · 完成 {item.completedItemCount ?? 0}/{item.totalItemCount ?? 0}
                </div>
              )}
            </div>
          ))
        )}
      </>
    );

    return (): VNode => (
      <div class={styles.page}>
        <Bar name="排名公示" isShowRight={false} />
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
          <div class={styles.sectionTitle}>履职红榜 · A级排名前3名</div>
          {renderPublicity(publicity.value.redList, "red")}
          <div class={styles.sectionTitle}>履职黑榜 · D级人员</div>
          {renderPublicity(publicity.value.blackList, "black")}
          <div class={styles.sectionTitle}>完整排名 · 共{publicity.value.participantCount ?? dashboard.value.rankings?.length ?? 0}人</div>
          {renderRanking(dashboard.value.rankings)}
        </div>
      </div>
    );
  },
});
